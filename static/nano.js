"use strict";function inherits(new_cls,base_cls){new_cls.prototype=Object.create(base_cls.prototype);new_cls.prototype.constructor=new_cls;};String.prototype.endswith=function(suffix){return this.indexOf(suffix,this.length-suffix.length)!==-1;};String.prototype.startswith=function(prefix){return!!this.match(RegExp('^'+prefix));};function copy(obj,opts){opts=opts||{};var o={}
if(opts.blacklist){for(var key in obj){var blisted=false;for(var bl in opts.blacklist){if(opts.blacklist[bl]===key)
blisted=true;}
if(!blisted)
o[key]=obj[key];}}else{if(opts.whitelist){for(var key in opts.whitelist){o[key]=obj[key];}}else{for(var key in obj){o[key]=obj[key];}}}
return o;};function instanceOf(object,constructor){while(object!=null){if(object==constructor.prototype)
return true;object=Object.getPrototypeOf(object);}
return false;}"use strict";$(function(){$('#addsearch_form').submit(function(){return false});$('#file').bootstrapFileInput();var up=new uploader($('#file').get(0),{url:'/upload',extra_data_func:function(data){return{'prefix':Nano.doc_ref}},progress:function(ev){$('#file_caption').text('Uploaded '+Math.ceil((ev.loaded/ev.total)*100)+'%');},error:function(ev){$.pnotify({title:"Can't upload",text:''+ev,type:'error'})},success:function(data){$('#file_caption').text('Add file...');var data=JSON.parse(data);if(data.error){$.pnotify({title:'Unable to upload some files',text:data.error,type:'error'});var child=[];}else{var child=uncompress_resources(data.children);for(var i=0;i<child.length;i++){var c=child[i];if(!!!c.title)c.title=c.link;if(!!!c.cont)c.cont=Nano.doc_ref;Nano.content.insert(ResourceFactory(c));}}
setTimeout(function(){if(child.length===0){$.pnotify({type:'warning',title:"Upload",text:"No file were uploaded"});}else{for(var i=0;i<child.length;i++){$.pnotify({type:"success",title:"Uploaded",text:child[i].link,delay:1500});}}
$('div.maincontainer .file-input-name').html('');},5);}});Nano._uploader=up;$('#file').attr('title','Upload some file');setTimeout(function(){window.addEventListener("popstate",function(e){if(!!e.state)Nano.load_link(e.state.view,{disable_history:true})
return false;});},1000);Mousetrap.bind('tab',function(e){if(ui.selected_item===-1){return ui.select_idx(null,0);}});Mousetrap.bind('down',function(e){e.cancelBubble=true;return ui.select_next();});Mousetrap.bind('up',function(e){e.cancelBubble=true;return ui.select_prev();});Mousetrap.bind('enter',function(e){var items=ui.get_items();$(items[ui.selected_item]).find('.item_touch:first').trigger('tap');return false;});Mousetrap.bind('backspace',function(e){$('#backlink').click();return false;});Mousetrap.bind('ins',function(e){$('#file').trigger('click');return false;});Mousetrap.bind('del',function(e){$.pnotify({text:'Could show a delete popup... ?'});return false;});Mousetrap.bind('ctrl+space',function(e){var inp=$('#addsearch_form input[name=text]');if(inp.is(':focus')){filter_result('');}else{inp.focus();}
return false;});Mousetrap.bind('esc',function(e){return ui.select_idx(ui.selected_item,null);});Mousetrap.bind('home',function(e){return ui.select_idx(ui.selected_item,0);});Mousetrap.bind('end',function(e){return ui.select_idx(ui.selected_item,-1);});Nano.load_link(document.location.href.split(/\?view=/)[1]||'/',{disable_history:true});});"use strict";var Templates={};function TemplateFactory(item){var t=MimeManager.get_template(item.mime);var i=new t(item);return i;}
function PageTemplate(data,name){if(!!!name)
name='file';this.data=data;this.name='view_'+name;}
PageTemplate.prototype.from=function(resource){return ich[this.name](resource||this.data);};PageTemplate.prototype.draw=function(resource){$('#contents').html(this.from(resource));};PageTemplate.prototype.clear=function(){$('#contents').html('');};function ItemList(data,item_template){PageTemplate.call(this,data);this.selected=-1;this.item_template='view_'+(item_template||UI.item_template);this.data.item_template=this._item_templater;this._c=data.children||[];var _r={}
this._index=_r;for(var i=0;i<this._c.length;i++){this._c[i]._parent=this;_r[this._c[i].link]=i;}}
inherits(ItemList,PageTemplate);Templates['folder']=ItemList;ItemList.prototype.find_by_link=function(link){return this._c[this._index[link]];};ItemList.prototype.refresh_by_link=function(link,metadata){var item=this._c[this._index[link]];$.extend(item,metadata);var rdr=ich[this.item_template](item).children();var e=this.get_dom(item.link).html(rdr.html());e.attr('title',rdr.attr('title'));this.setup_links(e);};ItemList.prototype.select=function(index){self.selected+=index;};ItemList.prototype.insert=function(resource){var d=ich[this.item_template](resource).children();this._index[resource.link]=d;this._c.push(d);$('.items').isotope('insert',d);};ItemList.prototype.remove=function(resource){var e=this.get_dom(resource.link);e.fadeOut(function(){e.remove();$('.items').isotope('reLayout');});};ItemList.prototype.sort_by=function(dom_elt,criteria){UI.fix_nav(dom_elt);$('.items').isotope({sortBy:criteria});};ItemList.prototype._item_templater=function(data){return ich[this._parent.item_template](this).html();};ItemList.prototype.draw=function(){PageTemplate.prototype.draw.call(this);$('.items').isotope({itemSelector:'.item',layoutMode:'fitRows',sortBy:'type',animationEngine:'css',transformsEnabled:'false',getSortData:{title:function(e){return e.data('title');},type:function(e){var m=e.data('mime');if(m==='folder'){return'!!!!!!!'+e.data('title').toLocaleLowerCase();}
return e.data('mime')+'!'+e.data('title').toLocaleLowerCase();}}});if(this._c.length===0)
$.pnotify({type:'info',title:'Attention',text:'No item in this folder.',delay:1000});this.setup_links($('.items'));};ItemList.prototype.setup_links=function(jqelt){jqelt.find('.item_touch').hammer().bind({tap:UI.execute_item_handler});};ItemList.prototype.get_dom=function(link){return $('.items .item[data-link="'+link+'"]');};"use strict";function ResourceFactory(item){var found=false;var choices=MimeManager.find_choices(item.mime);for(var n=0;(!!!found)&&n<choices.length;n++){try{found=Nano.mimes[choices[n]];}catch(err){found=false;}
if(found)break;}
if(!!!found){$.pnotify({'type':'error','title':'Type association','text':'failed loading one of: '+choices});}
return new found(item);}
function Resource(dict){$.extend(this,dict);if(!!!dict.link){}else{if(!!!this.cont){if(!!this.link.match(RegExp('/'))){var c=this.link.split(RegExp('(.*)/(.*)'));this.cont=c[1];this.link=c[2];}else{this.cont=Nano.doc_ref;}}}
if(this.cont!=undefined&&this.cont.substr(-1)!=='/')
this.cont+='/';if(this.mime!=='folder')
this.is_data=true;if(!!!this.editables)
this.editables='title mime descr';};Resource.prototype.type='resource';Resource.prototype.searchable='title';Resource.prototype.dependencies=[];Resource.prototype.stylesheet=false;Resource.prototype.hr_size=function(){return UI.hr_size(this.size);};Resource.prototype.getItem=function(callback,opts){var opts=opts||{};$.get(this.get_obj_ref()).success(function(d){if(d.error){$.pnotify({title:'Error displaying "'+d.link+'" content',text:d.message});}else{callback(ResourceFactory(d),opts);}}).error(function(){$.pnotify({title:'Error loading "'+path+'"',text:"Server not responding."});go_ready();});};Resource.prototype.post_view_callback=function(){if(!!!this.is_data){$('.folder-item').fadeIn(function(){$('.folder-item').removeClass('hidden');});$('.pure-item').fadeOut(function(){$('.pure-item').addClass('hidden');});}else{$('.folder-item').fadeOut(function(){$('.folder-item').addClass('hidden');});$('.pure-item').fadeIn(function(){$('.pure-item').removeClass('hidden');});$('#main_header .big_icon').addClass('faded_in');}};Resource.prototype.edit=function(){if(this.link.startswith('js:')){UI.edit_item(this);}else{this.getItem(function(item){UI.edit_item(item);});}};Resource.prototype.del=function(){var src_link=this.link;$.ajax(this.get_obj_ref(),{type:'DELETE'}).done(function(d){if(d.error){$.pnotify({type:'error',title:"Can't remove "+src_link,text:d.error});}else{Nano.content.remove({link:src_link});}});};Resource.prototype.view=function(){$('#contents').addClass('slided_left');Nano.load_resource(this);};Resource.prototype.save=function(){};Resource.prototype.get_ref=function(){if(!!!this.cont||!!!this.link)
return'/';return this.cont+this.link;};Resource.prototype.get_raw_ref=function(){return'/d'+this.get_ref();};Resource.prototype.get_obj_ref=function(){return'/o'+this.get_ref();};Resource.prototype.get_child_ref=function(){return'/c'+this.get_ref();};function Item(dict){Resource.call(this,dict);if(!!!this.title)
this.title=this.link;if(!!!this.descr)
this.descr='No description';};inherits(Item,Resource);Item.prototype.type='item';"use strict";var UI={item_template:'list_item_big',filter_items:function(filter){var filter=filter;var forced_searchables=null;if(typeof(filter)!=='string'){filter=$('#addsearch_form input[name=text]').val();}
var meta_re=filter.match(RegExp('^([a-z][a-z09]*): *(.*?) *$'));if(!!meta_re){var meta=meta_re[1];if(meta==='type')
meta='mime';forced_searchables=[meta];filter=meta_re[2];}
var re=new RegExp(filter.toLocaleLowerCase());var match_func=function(elt){var searchables=forced_searchables||elt.data('searchable').split(/ +/);for(var i=0;i<searchables.length;i++){if(elt.data(searchables[i]).toLocaleLowerCase().match(re))
return true;}
return false;};$('.item').each(function(i,e){var e=$(e);if(match_func(e)){e.addClass('filtered');}else{e.removeClass('filtered');}});$('.items').isotope({filter:'.filtered'});},fix_nav:function(link){$('div.navbar ul.nav li').removeClass('active');$(link).parent().addClass('active');},hr_size:function(size){if(size===undefined)return'N/A';var units=['','k','M','G'];var i=0;while(size>=1024){size/=1024.0;++i;}
return size.toFixed(1)+' '+units[i]+'B';},render_dom:function(resource,opts){var resource=copy(resource);var opts=opts||{};var hdr=$('#main_header');resource.permalink=window.location.href;hdr.replaceWith(ich.header(resource));if(Nano.current.get_ref()==='/'){$('#backlink').addClass('disabled');}else{$('#backlink').removeClass('disabled');}
setTimeout(function(){$('#contents').hide().removeClass('slided_right slided_left');MimeManager.load_dependencies(resource,{callback:function(found){var buttons=$('#addsearch_form');buttons.find('button').removeClass('hidden');resource.post_view_callback.call(resource);if(!!!opts.disable_history)
history.pushState({'view':''+Nano.doc_ref},"Staring at "+Nano.doc_ref,'/#?view='+Nano.doc_ref);var c=$('#contents');c.fadeIn();}})},100);},help_popups:function(){$.pnotify({type:'info',title:"Keyboard shortcuts",text:"<ul><li><b>UP</b>/<b>DOWN</b></li><li><b>ENTER</b>/<b>BACKspace</b> </li><li> <b>HOME</b>/<b>END</b> to navigate...</li><li>Close popups using <b>ESCAPE</b></li><li><b>Ctrl+Space</b> & <b>Tab</b> will change focus from text filter to the list</li></ul>",});setTimeout(function(){$.pnotify({type:'info',title:"Filter Syntax (Ctrl+Space)",text:"<ul><li>You can use any RegExp</li><li>You can use <code>type:</code> prefix to match type instead of name. Ex:<pre>type:image|application</pre><pre>type:zip</pre><pre>f.*png$</pre></li></ul>",});},500);},get_question:function(opts){var item=opts.item||false;var mime=opts.mime||(item&&item.mime)||'text-x-readme';var title=opts.title||(item&&item.title)||(item&&item.link)||'';var editables=opts.editables||(item&&item.editables&&item.editables.split(/ +/))||'*';var buttons=opts.buttons||[];var footnote=opts.foonote||'';var body=opts.body||'';var qp=$('#question_popup');if(qp.length!=0){if(qp.css('display')==='none'){qp.remove();}else{return;}}
var edited=[];if(item){if(editables==='*'||editables===''){for(var k in item)
edited.push({name:k,type:'text'});}else{for(var k in editables){edited.push({name:editables[k],type:'text'})};}}
qp=ich.question({'item':copy(item,{'whitelist':['cont','link','mime']}),'title':title,'mime':mime,'body':body,'footnote':footnote,'edit':edited,'buttons':buttons});qp.modal();if(item)setTimeout(function(){qp.find('.editable-property').each(function(i,o){var o=$(o);var d=copy(o.data());d.content=item[d.name];o.append(ich['input_'+d.type](d));});},200);return qp;},search_popup:function(){UI.get_question({item:false,body:ich.search_popup().html(),buttons:[{'name':'Filter',onclick:'UI.filter_items(); return false',title:'Filters current list'},{'name':'Search',onclick:'UI.search_for(); return false',title:'Search for some item'}]});},edit_item:function(data){UI._edited=data;UI.get_question({item:data,footnote:'Changes may be effective after a refresh',buttons:[{'name':'Save','onclick':'UI.save_item($("#question_popup .editable").data("link"));false;','class':'btn-success'},{'name':'Delete','onclick':'UI.remove_item($("#question_popup .editable").data("link"));false;','class':'btn-warning'}]});},remove_item:function(){UI._edited.del();UI.close_modal();},save_item:function(){var o=$('#question_popup .editable');var item=UI._edited;var metadata={};var metadata_list=[];var full_item={};o.find('.editable-property').each(function(x,property){var property=$(property);var inp=property.find('input');var orig=inp.data('orig-value');var val=inp.val();var name=property.data('name');if(val!==orig){metadata[name]=inp.val();metadata_list.push(name);}});if(metadata_list.length==0){$.pnotify({text:'No change'});}else{$.ajax(item.get_obj_ref(),{dataType:'json',data:{meta:JSON.stringify(metadata)},type:'PUT'}).done(function(e){Nano.content.refresh_by_link(UI._edited.link,metadata);$.pnotify({type:"success",text:"Saved"});UI.close_modal();}).fail(function(e){$.pnotify({type:"error",text:''+e});});}},close_modal:function(){$('#question_popup').modal('hide',function(){console.log('hidden !!');});},find_item_from_child:function(dom){var st=$(dom);while(!!!st.hasClass('item')){if(st.hasClass('items')){st=null;break;}else{st=st.parent();}}
return Nano.content.find_by_link(st.data('link'));},execute_item_handler:function(){UI.find_item_from_child(this).view();}};"use strict";function uncompress_resources(keys_values_array){var keys=keys_values_array.c;var list_of_values=keys_values_array.r;var ret=[];for(var i=0;i<list_of_values.length;i++){var values=list_of_values[i];var item={};for(var pid=0;pid<keys.length;pid++){item[keys[pid]]=values[pid];}
ret.push(ResourceFactory(item));}
return ret;};var Nano={doc_ref:'/'};Nano.current=null;Nano._unload_plugins=function(){$('audio').each(function(){this.pause();this.src="";});};Nano.mimes={};Nano.set_content=function(item,opts){this.content=TemplateFactory(item);this.content.draw();};Nano.reload=function(){return this.load_resource(this.current);};Nano.load_link=function(link,opts){var r=new Resource({link:link});Nano.doc_ref=r.cont;this.load_resource(r,opts);};Nano.load_resource=function(resource,opts){if(resource.size===undefined){resource.getItem(Nano._load_resource_cb,opts);}else{Nano._load_resource_cb(resource,opts);}};Nano._load_resource_cb=function(resource,opts){var opts=opts||{};Nano.doc_ref=resource.get_ref();Nano.current=resource;UI.render_dom(resource,opts);};Nano.level_up=function(opts){var opts=opts||{};var bref=Nano.doc_ref.match(RegExp('(.*)/[^/]+$'));if(!!bref){bref=bref[1]||'/';$('#contents').addClass('slided_right');Nano.load_link(bref,{'history':!!!opts.disable_history});}};Nano.register_mime=function(mimetype,classtype){Nano.mimes[mimetype]=classtype;};var MimeManager={loaded:{}};MimeManager.mimes={};MimeManager.find_choices=function(mime){var choices=[mime];var subchoices=mime.split('-');for(var n=subchoices.length-1;n>=1;n--){choices.push(subchoices.slice(0,n).join('-'));}
choices.push('default');return choices;};MimeManager.get_template=function(mime){var choices=MimeManager.find_choices(mime);for(var i=0;i<choices.length;i++){var choice=choices[i];for(var k in Templates){if(k===choice)
return Templates[k];}}
return PageTemplate;};MimeManager.load_dependencies=function(item,opts){var opts=opts||{};var skip_loading=false;if(MimeManager.loaded[item.mime])
skip_loading=true;MimeManager.loaded[item.mime]=true;if(!!!skip_loading){var dependencies=[];var prefix='/static/mime/js/'+item.type+'/';if(!!item.stylesheet)
dependencies.push(prefix+'style.css');if(item.dependencies){item.dependencies.forEach(function(x){if(x.match(/^[/]/)){dependencies.push(x)}else{dependencies.push(prefix+x);}})}
if(dependencies.length!==0){var counter=0;for(var dep in dependencies){toast(dependencies[dep],function(){if(++counter===dependencies.length){if(!!opts.callback){setTimeout(function(){opts.callback(item);},100);}}});}}else{if(!!opts.callback)opts.callback(item);}}else{if(!!opts.callback)opts.callback(item);}}
function Audio(dict){Item.call(this,dict)};inherits(Audio,Item);Audio.prototype.type="audio";Audio.prototype.post_view_callback=function(){Item.prototype.post_view_callback.call(this);Nano.set_content(this);$('<audio src="'+this.get_raw_ref()+'" controls><span>Audio preview not supported on your browser</span></audio>').appendTo($('#contents'));};Nano.register_mime("audio",Audio);function Default(dict){Item.call(this,dict)};inherits(Default,Item);Default.prototype.type="default";Default.prototype.post_view_callback=function(){Item.prototype.post_view_callback.call(this);Nano.set_content(this);};Nano.register_mime("default",Default);function Folder(dict){Item.call(this,dict)};inherits(Folder,Item);Folder.prototype.type="folder";Folder.prototype.post_view_callback=function(){Item.prototype.post_view_callback.call(this);$.ajax({url:this.get_child_ref(),context:this}).success(function(c){this.children=uncompress_resources(c.children);Nano.set_content(this);});};Folder.prototype.is_data=false;Nano.register_mime("folder",Folder);function Image(dict){Item.call(this,dict)};inherits(Image,Item);Image.prototype.type="image";Image.prototype.post_view_callback=function(){Item.prototype.post_view_callback.call(this);Nano.set_content(this);$('<img class="img-responsive" src="'+this.get_raw_ref()+'" />').appendTo($('#contents'));};Nano.register_mime("image",Image);function Text_X(dict){Item.call(this,dict)};inherits(Text_X,Item);Text_X.prototype.type="text-x";Text_X.prototype.post_view_callback=function(){Item.prototype.post_view_callback.call(this);var TEXT_X_MAX_FILE_SIZE=50000;var me=this;$.ajax(me.get_raw_ref(),{dataType:'text'}).done(function(d){var lang=me._map[me.mime];if(!!!lang)
lang=me.mime.split('-')[2];var pre=$('<pre><code data-language="'+lang+'"></code></pre>');pre.find('code').text(d);pre.appendTo($('#contents'));if(me.size>TEXT_X_MAX_FILE_SIZE){$.pnotify({type:'warning',title:'File is too big',text:'Syntax coloring disabled.'});}else{Rainbow.color();}}).fail(function(e){$.pnotify({type:'error',title:'Loading item',text:e});});Nano.set_content(this);};Text_X.prototype._map={'text-css':'css','text-html':'html','application-xhtml+xml':'html','application-javascript':'javascript','text-x-sh':'shell'};Text_X.prototype.stylesheet=true;Text_X.prototype.dependencies=["rainbow.js"]
Nano.register_mime("text-x",Text_X);function Text(dict){Item.call(this,dict)};inherits(Text,Item);Text.prototype.type="text";Text.prototype.post_view_callback=function(){Item.prototype.post_view_callback.call(this);Nano.set_content(this);$('<div class="row-fluid"><small>Fullscreen: <i>Alt+F</i>, Toggle preview: <i>Alt+P</i></small></div><div class="row-fluid" id="epiceditor"></div> <div class="pull-right btn-group"></div>').appendTo($('#contents'));$('<button class="btn btn-success btn-large" onclick="editor_save()">Save changes</button>').appendTo($('#download_link').parent()).hide().fadeIn();var ref=this.get_ref();var ajax_call=new $.ajax({url:this.get_raw_ref(),dataType:'text'}).fail(function(e){$.pnotify({type:'error',text:''+e});})
setTimeout(function(){Nano._editor=new EpicEditor(epic_opts);Nano._editor.load(function(){ajax_call.done(function(d){Nano._editor.importFile(ref,d);})})},100);};Text.prototype.dependencies=['epicobj.js']
Nano.register_mime("text",Text);function Video(dict){Item.call(this,dict)};inherits(Video,Item);Video.prototype.type="video";Video.prototype.post_view_callback=function(){Item.prototype.post_view_callback.call(this);Nano.set_content(this);$('<video controls src="/d'+this.path+'">Alt descr</video>').appendTo($('#contents'));};Nano.register_mime("video",Video);Nano.register_mime("application-javascript",Nano.mimes["text"]);Nano.register_mime("text-css",Nano.mimes["text-x"]);