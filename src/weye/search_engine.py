import os
import logging
import itertools

from whoosh.index import create_in, open_dir
from whoosh.fields import *
from whoosh.query import *
from whoosh import highlight
from whoosh.qparser import MultifieldParser, OrGroup
from whoosh.query import FuzzyTerm
from whoosh.writing import BufferedWriter

from weye.configuration import config
from weye.utils import guess_type

log = logging.getLogger('search engine')
MAX_SIZE = 50*(1024**2)

INDEX_DIR = os.path.join(config.shared_db, 'whoosh')
qparser = indexer = None

_initialized = False


def init():
    global qparser, indexer, _initialized
    _initialized = True

    if os.path.exists(INDEX_DIR):
        indexer = open_dir(INDEX_DIR)
    else:
        os.mkdir(INDEX_DIR)
        indexer = create_in(
            INDEX_DIR,
            Schema(
                path        = ID(stored=True, unique=True),
                mime        = TEXT(stored=True),
                description = TEXT(stored=True),
                txtcontent  = TEXT(stored=False),
                tags        = KEYWORD(scorable=True,stored=True),
                )
        )

    qparser = MultifieldParser(["description", "txtcontent", "tags", "mime"],
            schema=indexer.schema,
            group=OrGroup,
#            termclass=FuzzyTerm, # TODO: MAKES THINGS SLOW (but very nice, should be configurable)
            )

def reset():
    import shutil
    if os.path.exists(INDEX_DIR):
        shutil.rmtree(INDEX_DIR)
    init()

def get_writer():
    return BufferedWriter(indexer, period=120, limit=100)

class ObjAdder(object):

    def __init__(self):
        if not _initialized:
            init()
        self.writer = get_writer()
        self.add = self.writer.add_document

    def scan(self):
        pat = itertools.cycle(r'|/-\\')
        # FIXME in whoosh: using the same indexer for the whole session makes things wrong
        reset()
        max_size = MAX_SIZE
        pfx_len = len(config.shared_root)
        c = itertools.count()
        writer = get_writer()
        w = writer.add_document
        for root, dirs, files in os.walk(config.shared_root):
            for fname in files:
                try:
                    path = os.path.join(root, fname)
                    if os.stat(path).st_size > max_size:
                        d = ''
                    else:
                        d = open( path, 'rb' ).read()
                except Exception:
                    log.warning("Can't open %r in %r !", fname, root)
                else:
                    m = guess_type(path)
                    is_text = m.startswith('text')
                    if is_text:
                        try:
                            d = d.decode('utf-8')
                        except UnicodeDecodeError:
                            d = d.decode('latin1')
                    w(path=path[pfx_len:], mime=guess_type(path), description='', txtcontent=d if is_text else '')
                    i = next(c)
                    print(' Collected {:d} items {:s} {:35s}'.format(i, next(pat), m), end='\r')
        try:
            writer.commit()
        except Exception: # It might be closed/commited yet
            pass

        indexer.optimize()
        print("\ndone.")

    def __enter__(self, *a):
        return self.add

    def __exit__(self, *a):
        self.writer.commit()


def search(pattern=None, query_type=None, page_nr=1, results=10):
    if not _initialized:
        init()
    # Fire up searcher
    searcher = indexer.searcher()
#    try:
#        searcher = indexer.searcher()
#    except IOError:
#        reset()
#        rebuild()
#        searcher = indexer.searcher()


    qpat = qparser.parse(pattern.strip())
    res = searcher.search_page(qpat, page_nr, pagelen=results)

    result = []
    res.fragmenter = highlight.SentenceFragmenter()
#    res.fragmenter = highlight.WholeFragmenter()
    for item in res:
        match = {'f': item['path'], 'm': item['mime'], 't': item.get('tags', '')}
        hi = item.highlights('path')
        if hi:
            match['hf'] = hi
        hi = item.highlights('mime')
        if hi:
            match['hm'] = hi
        hi = item.highlights('description')
        if hi:
            match['hd'] = hi
        # NOT STORED:
#        hi = item.highlights('txtcontent')
#        if hi:
#            match['hc'] = hi
#        hi = item.highlights('tags')
#        if hi:
#            match['ht'] = hi
        result.append(match)
    return (res.pagecount, result)

if __name__ == '__main__':
#    reset()
    yn = input('Scan shared folder (y/N) ? ')
    if yn.lower().strip()[:1] == 'y':
        o = ObjAdder()
        o.scan()

    count = itertools.count()
    c = 10
    while True:
        try:
            text = input('text> ')
        except EOFError:
            break
        if text.strip().lower() != 'p' and text.strip() != '':
            count = itertools.count()
            pattern = text
        elif cnt+1 >= c:
            print("Last page!")
            continue
        cnt = next(count)
        print("Searching %s..."%pattern)

        c, m = search(pattern, page_nr=cnt+1)

        print("page %d / %d:"%(cnt+1, c))
        for i, item in enumerate(m):
            print("%2d. %s"%(10*cnt + i+1, ' '.join('%s=%s'%d for d in item.items() if d[1])))

