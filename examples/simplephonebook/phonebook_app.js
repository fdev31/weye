$.ajax({url: '/d'+ui.doc_ref+'/phone_data.js', dataType: 'json'})
.done(function(d) {
    var c=$('#contents');
    c.html( ich.view_list({
        permalink: ui.permalink,
        backlink: true,
        mime: 'text-x-vcard', // TBD, like "application-x-adressbook" ? // allow mountpoints for images
        cont: '',
        have_child: true,
        child: d.map( function(e) {
            var searchinfos = e.name+' '+e.nickname+' '+e.phones.fixe;
            return {
                D: [
                    {k: 'fixe', v: e.phones.fixe}
                ],
                e: 'name fixe',
                s: searchinfos,
                d: e.phones.fixe,
                t: e.name,
                m: 'text-x-credits'
            }
        } )

    }));
    finalize_item_list(c);
    $('#addsearch_form button[name=search]').addClass('hidden');
    $('#addsearch_form').show();
})
.fail(function(e) {
    $.pnotify({text:"Can't load phone data !", type: "error"});
    setTimeout( $('#backlink').click, 900);
});



