
mimes={"audio":{display:function(item){$('<audio src="/d'+item.path+'" controls><span>Audio preview not supported on your browser</span></audio>').appendTo($('#contents').html(get_view('file',item)));ui.set_context('item');},name:"audio"},"default":{display:function(item){Nano.set_content(item);},name:"default"},"folder":{display:function(item){$.get('/c'+item.get_ref()).success(function(c){base_data=uncompress_resources(c.children);console.log(base_data);var is_an_app=false;var app_indice='infos.js';base_data.forEach(function(o){if(o.link===app_indice)
is_an_app=true;})
if(is_an_app)
$.pnotify({type:'error',title:item.link,text:'Applications are not supported anymore'});item.children=base_data;Nano.set_content(item);});},name:"folder"},"image":{display:function(item){Nano.set_content(item);$('<img class="img-responsive" src="'+item.get_raw_ref()+'" />').appendTo($('#contents'));},name:"image"},"text-x":{display:function(item){console.log('DISP text-x');console.log(item);console.log(item.get_ref());var _map={'text-css':'css','text-html':'html','application-xhtml+xml':'html','application-javascript':'javascript','text-x-sh':'shell'}
$.ajax('/d'+item.get_ref(),{dataType:'text'}).done(function(d){console.log('done');var lang=_map[item.mime];if(!!!lang)
lang=item.mime.split('-')[2];var pre=$('<pre><code data-language="'+lang+'"></code></pre>');pre.find('code').text(d);pre.appendTo($('#contents'));if(item.size>15000){$.pnotify({type:'warning',title:'File is too big',text:'Syntax coloring disabled.'});}else{Rainbow.color();}}).fail(function(e){$.pnotify({type:'error',title:'Loading item',text:e});});console.log('set_content',item);Nano.set_content(item);},name:"text-x",stylesheet:true,dependencies:["myobj.js","rainbow.js"]},"text":{display:function(item){console.log('display text',item);Nano.set_content(item);$('<div class="row-fluid"><small>Fullscreen: <i>Alt+F</i>, Toggle preview: <i>Alt+P</i></small></div><div class="row-fluid" id="epiceditor"></div> <div class="pull-right btn-group"></div>').appendTo($('#contents'));$('<button class="btn btn-success btn-large" onclick="editor_save()">Save changes</button>').appendTo($('#download_link').parent());var ajax_call=new $.ajax({url:'/d'+item.get_ref(),dataType:'text'}).fail(function(e){$.pnotify({type:'error',text:''+e});})
setTimeout(function(){Nano._editor=new EpicEditor(epic_opts);Nano._editor.load(function(){ajax_call.done(function(d){Nano._editor.importFile(item.get_ref(),d);})})},100);},name:"text",dependencies:['epicobj.js']},"video":{display:function(item){$('<video controls src="/d'+item.path+'">Alt descr</video>').appendTo($('#contents').html(get_view('file',item)));ui.set_context('item');},name:"video"}}
mimes["application-javascript"]=mimes["text-x"]
mimes["text-css"]=mimes["text-x"]