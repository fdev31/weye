var epic_opts = {
  container: 'epiceditor',
  textarea: null,
  basePath: '/static',
  clientSideStorage: true,
  localStorageName: 'epiceditor',
  useNativeFullscreen: true,
  parser: marked,
  file: {
    name: 'epiceditor',
    defaultContent: '',
    autoSave: 100
  },
  theme: {
    base: '/themes/epic/base/epiceditor.css',
    preview: '/themes/epic/preview/preview-dark.css',
    editor: '/themes/epic/editor/epic-dark.css'
  },
  button: {
    preview: true,
    fullscreen: true
  },
  focusOnLoad: false,
  shortcut: {
    modifier: 18,
    fullscreen: 70,
    preview: 80
  },
  string: {
    togglePreview: 'Toggle Preview Mode',
    toggleEdit: 'Toggle Edit Mode',
    toggleFullscreen: 'Enter Fullscreen'
  }
};

/*
 *
 * .. data:: editor
 *
 *     Object storing the EpicEditor__ object
 *
 * .. __: http://epiceditor.com/
 *
 */


/*
 * .. function:: editor_save
 *      
 *      Saves the EpicEditor_ content
 */

function editor_save() {
    var text = Nano._editor.exportFile(ui.doc_ref);
    $.post('/d'+ui.doc_ref, {text: text, path: ui.doc_ref})
        .done(function(d) {
            if(d.error) {
                $.pnotify({type:'error', text: ''+d.error, title: "Unable to save"});
            } else {
                $.pnotify({type:'success', text: 'File saved'});
            }
        })
        .fail(function(e) {
            $.pnotify({type:'error', text: ''+e, title: "Unable to save"});
        });
};
