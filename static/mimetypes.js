
mimes={"audio":{display:function(item){$('<audio src="/d'+item.path+'" controls><span>Audio preview not supported on your browser</span></audio>').appendTo($('#contents').html(get_view('file',item)));ui.set_context('item');},name:"audio"},"default":{display:function(item){$('#contents').html(get_view('file',item));ui.set_context('item');},name:"default"},"folder":{display:function(item){$.get('/c'+item.path).success(function(c){base_data=uncompress_itemlist(c.children);var is_an_app=false;var app_indice='infos.js';base_data.forEach(function(o){if(o.link===app_indice)
is_an_app=true;})
ui.plugin=null;if(is_an_app){$.ajax({url:'/d'+item.path+'/infos.js',dataType:'json'}).done(function(d){ui.plugin=d;if(!!d.templates){for(var key in d.templates){if(!!!ich[key])
ich.addTemplate(key,d.templates[key]);};}
load_plugin();ui.set_context('folder');}).fail(function(e){$.pnotify({type:'error',title:"Invalid data",text:"Impossible to load application informations"});console.log("ERR",e);});}else{item.have_child=base_data.length>0;item.backlink=ui.doc_ref!='/';item.permalink=ui.permalink;base_data.forEach(ItemTool.fixit);item.child=base_data;item.item_template='view_list_item_small';finalize_item_list($('#contents').html(get_view('list',item)));ui.set_context('folder');if(0===item.child.length){$.pnotify({type:'info',title:'Attention',text:'No item in this folder.',delay:1000});}}});},name:"folder"},"image":{display:function(item){$('<img class="img-responsive" src="/d'+item.path+'" />').appendTo($('#contents').html(get_view('file',item)));ui.set_context('item');},name:"image"},"text-x":{display:function(item){var _map={'text-css':'css','text-html':'html','application-xhtml+xml':'html','application-javascript':'javascript','text-x-sh':'shell'}
$.ajax('/d'+item.path,{dataType:'text'}).done(function(d){var lang=_map[item.mime];if(!!!lang)
lang=item.mime.split('-')[2];var pre=$('<pre><code data-language="'+lang+'"></code></pre>');pre.find('code').text(d);pre.appendTo(cont);if(item.size>15000){$.pnotify({type:'warning',title:'File is too big',text:'Syntax coloring disabled.'});}else{Rainbow.color();}
ui.set_context('item');}).fail(function(e){$.pnotify({type:'error',title:'Loading item',text:e});});var cont=$('#contents').html(get_view('file',item))},name:"text-x",stylesheet:true,dependencies:["rainbow.min.js","lang/generic.js","lang/javascript.js","lang/css.js","lang/c.js","lang/diff.js","lang/html.js","lang/lua.js","lang/shell.js"]},"text":{display:function(item){$('<div class="row-fluid"><small>Fullscreen: <i>Alt+F</i>, Toggle preview: <i>Alt+P</i></small></div><div class="row-fluid" id="epiceditor"></div> <div class="pull-right btn-group"></div>').appendTo($('#contents').html(get_view('file',item)));$('<button class="btn btn-success btn-large" onclick="editor_save()">Save changes</button>').appendTo($('#download_link').parent());var ajax_call=new $.ajax({url:'/d'+item.path,dataType:'text'});editor=new EpicEditor(epic_opts).load(function(){ajax_call.done(function(d){editor.importFile(item.path,d);ui.set_context('item');}).fail(function(e){$.pnotify({type:'error',text:''+e});})});},name:"text"},"video":{display:function(item){$('<video controls src="/d'+item.path+'">Alt descr</video>').appendTo($('#contents').html(get_view('file',item)));ui.set_context('item');},name:"video"}}
mimes["application-javascript"]=mimes["text-x"]
mimes["text-css"]=mimes["text-x"]