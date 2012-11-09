/* dl from https://github.com/valums/file-uploader/tree/3.0 */
var qq=qq||{};var qq=function(element){"use strict";return{hide:function(){element.style.display='none';return this;},attach:function(type,fn){if(element.addEventListener){element.addEventListener(type,fn,false);}else if(element.attachEvent){element.attachEvent('on'+type,fn);}
return function(){qq(element).detach(type,fn);};},detach:function(type,fn){if(element.removeEventListener){element.removeEventListener(type,fn,false);}else if(element.attachEvent){element.detachEvent('on'+type,fn);}
return this;},contains:function(descendant){if(element==descendant){return true;}
if(element.contains){return element.contains(descendant);}else{return!!(descendant.compareDocumentPosition(element)&8);}},insertBefore:function(elementB){elementB.parentNode.insertBefore(element,elementB);return this;},remove:function(){element.parentNode.removeChild(element);return this;},css:function(styles){if(styles.opacity!=null){if(typeof element.style.opacity!='string'&&typeof(element.filters)!='undefined'){styles.filter='alpha(opacity='+Math.round(100*styles.opacity)+')';}}
qq.extend(element.style,styles);return this;},hasClass:function(name){var re=new RegExp('(^| )'+name+'( |$)');return re.test(element.className);},addClass:function(name){if(!qq(element).hasClass(name)){element.className+=' '+name;}
return this;},removeClass:function(name){var re=new RegExp('(^| )'+name+'( |$)');element.className=element.className.replace(re,' ').replace(/^\s+|\s+$/g,"");return this;},getByClass:function(className){if(element.querySelectorAll){return element.querySelectorAll('.'+className);}
var result=[];var candidates=element.getElementsByTagName("*");var len=candidates.length;for(var i=0;i<len;i++){if(qq(candidates[i]).hasClass(className)){result.push(candidates[i]);}}
return result;},children:function(){var children=[],child=element.firstChild;while(child){if(child.nodeType==1){children.push(child);}
child=child.nextSibling;}
return children;},setText:function(text){element.innerText=text;element.textContent=text;return this;},clearText:function(){return qq(element).setText("");}};};qq.log=function(message,level){if(window.console){if(!level||level==='info'){window.console.log(message);}
else
{if(window.console[level]){window.console[level](message);}
else{window.console.log('<'+level+'> '+message);}}}};qq.isObject=function(variable){"use strict";return variable!==null&&variable&&typeof(variable)==="object"&&variable.constructor===Object;};qq.extend=function(first,second,extendNested){"use strict";var prop;for(prop in second){if(second.hasOwnProperty(prop)){if(extendNested&&qq.isObject(second[prop])){if(first[prop]===undefined){first[prop]={};}
qq.extend(first[prop],second[prop],true);}
else{first[prop]=second[prop];}}}};qq.indexOf=function(arr,elt,from){if(arr.indexOf)return arr.indexOf(elt,from);from=from||0;var len=arr.length;if(from<0)from+=len;for(;from<len;from++){if(from in arr&&arr[from]===elt){return from;}}
return-1;};qq.getUniqueId=(function(){var id=0;return function(){return id++;};})();qq.ie=function(){return navigator.userAgent.indexOf('MSIE')!=-1;}
qq.ie10=function(){return navigator.userAgent.indexOf('MSIE 10')!=-1;}
qq.safari=function(){return navigator.vendor!=undefined&&navigator.vendor.indexOf("Apple")!=-1;}
qq.chrome=function(){return navigator.vendor!=undefined&&navigator.vendor.indexOf('Google')!=-1;}
qq.firefox=function(){return(navigator.userAgent.indexOf('Mozilla')!=-1&&navigator.vendor!=undefined&&navigator.vendor=='');}
qq.windows=function(){return navigator.platform=="Win32";}
qq.preventDefault=function(e){if(e.preventDefault){e.preventDefault();}else{e.returnValue=false;}};qq.toElement=(function(){var div=document.createElement('div');return function(html){div.innerHTML=html;var element=div.firstChild;div.removeChild(element);return element;};})();qq.obj2url=function(obj,temp,prefixDone){var uristrings=[],prefix='&',add=function(nextObj,i){var nextTemp=temp?(/\[\]$/.test(temp))?temp:temp+'['+i+']':i;if((nextTemp!='undefined')&&(i!='undefined')){uristrings.push((typeof nextObj==='object')?qq.obj2url(nextObj,nextTemp,true):(Object.prototype.toString.call(nextObj)==='[object Function]')?encodeURIComponent(nextTemp)+'='+encodeURIComponent(nextObj()):encodeURIComponent(nextTemp)+'='+encodeURIComponent(nextObj));}};if(!prefixDone&&temp){prefix=(/\?/.test(temp))?(/\?$/.test(temp))?'':'&':'?';uristrings.push(temp);uristrings.push(qq.obj2url(obj));}else if((Object.prototype.toString.call(obj)==='[object Array]')&&(typeof obj!='undefined')){for(var i=0,len=obj.length;i<len;++i){add(obj[i],i);}}else if((typeof obj!='undefined')&&(obj!==null)&&(typeof obj==="object")){for(var i in obj){add(obj[i],i);}}else{uristrings.push(encodeURIComponent(temp)+'='+encodeURIComponent(obj));}
if(temp){return uristrings.join(prefix);}else{return uristrings.join(prefix).replace(/^&/,'').replace(/%20/g,'+');}};qq.DisposeSupport={_disposers:[],dispose:function(){var disposer;while(disposer=this._disposers.shift()){disposer();}},addDisposer:function(disposeFunction){this._disposers.push(disposeFunction);},_attach:function(){this.addDisposer(qq(arguments[0]).attach.apply(this,Array.prototype.slice.call(arguments,1)));}};qq.UploadButton=function(o){this._options={element:null,multiple:false,acceptFiles:null,name:'file',onChange:function(input){},hoverClass:'qq-upload-button-hover',focusClass:'qq-upload-button-focus'};qq.extend(this._options,o);qq.extend(this,qq.DisposeSupport);this._element=this._options.element;qq(this._element).css({position:'relative',overflow:'hidden',direction:'ltr'});this._input=this._createInput();};qq.UploadButton.prototype={getInput:function(){return this._input;},reset:function(){if(this._input.parentNode){qq(this._input).remove();}
qq(this._element).removeClass(this._options.focusClass);this._input=this._createInput();},_createInput:function(){var input=document.createElement("input");if(this._options.multiple){input.setAttribute("multiple","multiple");}
if(this._options.acceptFiles)input.setAttribute("accept",this._options.acceptFiles);input.setAttribute("type","file");input.setAttribute("name",this._options.name);qq(input).css({position:'absolute',right:0,top:0,fontFamily:'Arial',fontSize:'118px',margin:0,padding:0,cursor:'pointer',opacity:0});this._element.appendChild(input);var self=this;this._attach(input,'change',function(){self._options.onChange(input);});this._attach(input,'mouseover',function(){qq(self._element).addClass(self._options.hoverClass);});this._attach(input,'mouseout',function(){qq(self._element).removeClass(self._options.hoverClass);});this._attach(input,'focus',function(){qq(self._element).addClass(self._options.focusClass);});this._attach(input,'blur',function(){qq(self._element).removeClass(self._options.focusClass);});if(window.attachEvent){input.setAttribute('tabIndex',"-1");}
return input;}};qq.FineUploaderBasic=function(o){var that=this;this._options={debug:false,button:null,multiple:true,maxConnections:3,disableCancelForFormUploads:false,autoUpload:true,request:{endpoint:'/server/upload',params:{},customHeaders:{},forceMultipart:false,inputName:'qqfile'},validation:{allowedExtensions:[],sizeLimit:0,minSizeLimit:0,stopOnFirstInvalidFile:true},callbacks:{onSubmit:function(id,fileName){},onComplete:function(id,fileName,responseJSON){},onCancel:function(id,fileName){},onUpload:function(id,fileName,xhr){},onProgress:function(id,fileName,loaded,total){},onError:function(id,fileName,reason){},onAutoRetry:function(id,fileName,attemptNumber){}},messages:{typeError:"{file} has an invalid extension. Valid extension(s): {extensions}.",sizeError:"{file} is too large, maximum file size is {sizeLimit}.",minSizeError:"{file} is too small, minimum file size is {minSizeLimit}.",emptyError:"{file} is empty, please select files again without it.",noFilesError:"No files to upload.",onLeave:"The files are being uploaded, if you leave now the upload will be cancelled."},retry:{enableAuto:false,maxAutoAttempts:3,autoAttemptDelay:5,preventRetryResponseProperty:'preventRetry'}};qq.extend(this._options,o,true);this._wrapCallbacks();qq.extend(this,qq.DisposeSupport);this._filesInProgress=0;this._storedFileIds=[];this._autoRetries=[];this._retryTimeouts=[];this._preventRetries=[];this._handler=this._createUploadHandler();if(this._options.button){this._button=this._createUploadButton(this._options.button);}
this._preventLeaveInProgress();};qq.FineUploaderBasic.prototype={log:function(str,level){if(this._options.debug&&(!level||level==='info')){qq.log('[FineUploader] '+str);}
else if(level&&level!=='info'){qq.log('[FineUploader] '+str,level);}},setParams:function(params){this._options.request.params=params;},getInProgress:function(){return this._filesInProgress;},uploadStoredFiles:function(){"use strict";while(this._storedFileIds.length){this._filesInProgress++;this._handler.upload(this._storedFileIds.shift(),this._options.request.params);}},clearStoredFiles:function(){this._storedFileIds=[];},retry:function(id){if(this._onBeforeManualRetry(id)){this._handler.retry(id);return true;}
else{return false;}},cancel:function(fileId){this._handler.cancel(fileId);},reset:function(){this.log("Resetting uploader...");this._handler.reset();this._filesInProgress=0;this._storedFileIds=[];this._autoRetries=[];this._retryTimeouts=[];this._preventRetries=[];this._button.reset();},_createUploadButton:function(element){var self=this;var button=new qq.UploadButton({element:element,multiple:this._options.multiple&&qq.UploadHandlerXhr.isSupported(),acceptFiles:this._options.validation.acceptFiles,onChange:function(input){self._onInputChange(input);}});this.addDisposer(function(){button.dispose();});return button;},_createUploadHandler:function(){var self=this,handlerClass;if(qq.UploadHandlerXhr.isSupported()){handlerClass='UploadHandlerXhr';}else{handlerClass='UploadHandlerForm';}
var handler=new qq[handlerClass]({debug:this._options.debug,endpoint:this._options.request.endpoint,forceMultipart:this._options.request.forceMultipart,maxConnections:this._options.maxConnections,customHeaders:this._options.request.customHeaders,inputName:this._options.request.inputName,demoMode:this._options.demoMode,log:this.log,onProgress:function(id,fileName,loaded,total){self._onProgress(id,fileName,loaded,total);self._options.callbacks.onProgress(id,fileName,loaded,total);},onComplete:function(id,fileName,result,xhr){self._onComplete(id,fileName,result,xhr);self._options.callbacks.onComplete(id,fileName,result);},onCancel:function(id,fileName){self._onCancel(id,fileName);self._options.callbacks.onCancel(id,fileName);},onUpload:function(id,fileName,xhr){self._onUpload(id,fileName,xhr);self._options.callbacks.onUpload(id,fileName,xhr);},onAutoRetry:function(id,fileName,responseJSON,xhr){self._preventRetries[id]=responseJSON[self._options.retry.preventRetryResponseProperty];if(self._shouldAutoRetry(id,fileName,responseJSON)){self._maybeParseAndSendUploadError(id,fileName,responseJSON,xhr);self._options.callbacks.onAutoRetry(id,fileName,self._autoRetries[id]+1);self._onBeforeAutoRetry(id,fileName);self._retryTimeouts[id]=setTimeout(function(){self._onAutoRetry(id,fileName,responseJSON)},self._options.retry.autoAttemptDelay*1000);return true;}
else{return false;}}});return handler;},_preventLeaveInProgress:function(){var self=this;this._attach(window,'beforeunload',function(e){if(!self._filesInProgress){return;}
var e=e||window.event;e.returnValue=self._options.messages.onLeave;return self._options.messages.onLeave;});},_onSubmit:function(id,fileName){if(this._options.autoUpload){this._filesInProgress++;}},_onProgress:function(id,fileName,loaded,total){},_onComplete:function(id,fileName,result,xhr){this._filesInProgress--;this._maybeParseAndSendUploadError(id,fileName,result,xhr);},_onCancel:function(id,fileName){clearTimeout(this._retryTimeouts[id]);var storedFileIndex=qq.indexOf(this._storedFileIds,id);if(this._options.autoUpload||storedFileIndex<0){this._filesInProgress--;}
else if(!this._options.autoUpload){this._storedFileIds.splice(storedFileIndex,1);}},_onUpload:function(id,fileName,xhr){},_onInputChange:function(input){if(this._handler instanceof qq.UploadHandlerXhr){this._uploadFileList(input.files);}else{if(this._validateFile(input)){this._uploadFile(input);}}
this._button.reset();},_onBeforeAutoRetry:function(id,fileName){this.log("Waiting "+this._options.retry.autoAttemptDelay+" seconds before retrying "+fileName+"...");},_onAutoRetry:function(id,fileName,responseJSON){this.log("Retrying "+fileName+"...");this._autoRetries[id]++;this._handler.retry(id);},_shouldAutoRetry:function(id,fileName,responseJSON){if(!this._preventRetries[id]&&this._options.retry.enableAuto){if(this._autoRetries[id]===undefined){this._autoRetries[id]=0;}
return this._autoRetries[id]<this._options.retry.maxAutoAttempts}
return false;},_onBeforeManualRetry:function(id){if(this._preventRetries[id]){this.log("Retries are forbidden for id "+id,'warn');return false;}
else if(this._handler.isValid(id)){var fileName=this._handler.getName(id);this.log("Retrying upload for '"+fileName+"' (id: "+id+")...");this._filesInProgress++;return true;}
else{this.log("'"+id+"' is not a valid file ID",'error');return false;}},_maybeParseAndSendUploadError:function(id,fileName,response,xhr){if(!response.success){if(xhr&&xhr.status!==200&&!response.error){this._options.callbacks.onError(id,fileName,"XHR returned response code "+xhr.status);}
else{var errorReason=response.error?response.error:"Upload failure reason unknown";this._options.callbacks.onError(id,fileName,errorReason);}}},_uploadFileList:function(files){if(files.length>0){for(var i=0;i<files.length;i++){if(this._validateFile(files[i])){this._uploadFile(files[i]);}else{if(this._options.validation.stopOnFirstInvalidFile){return;}}}}
else{this._error('noFilesError',"");}},_uploadFile:function(fileContainer){var id=this._handler.add(fileContainer);var fileName=this._handler.getName(id);if(this._options.callbacks.onSubmit(id,fileName)!==false){this._onSubmit(id,fileName);if(this._options.autoUpload){this._handler.upload(id,this._options.request.params);}
else{this._storeFileForLater(id);}}},_storeFileForLater:function(id){this._storedFileIds.push(id);},_validateFile:function(file){var name,size;if(file.value){name=file.value.replace(/.*(\/|\\)/,"");}else{name=(file.fileName!==null&&file.fileName!==undefined)?file.fileName:file.name;size=(file.fileSize!==null&&file.fileSize!==undefined)?file.fileSize:file.size;}
if(!this._isAllowedExtension(name)){this._error('typeError',name);return false;}else if(size===0){this._error('emptyError',name);return false;}else if(size&&this._options.validation.sizeLimit&&size>this._options.validation.sizeLimit){this._error('sizeError',name);return false;}else if(size&&size<this._options.validation.minSizeLimit){this._error('minSizeError',name);return false;}
return true;},_error:function(code,fileName){var message=this._options.messages[code];function r(name,replacement){message=message.replace(name,replacement);}
var extensions=this._options.validation.allowedExtensions.join(', ');r('{file}',this._formatFileName(fileName));r('{extensions}',extensions);r('{sizeLimit}',this._formatSize(this._options.validation.sizeLimit));r('{minSizeLimit}',this._formatSize(this._options.validation.minSizeLimit));this._options.callbacks.onError(null,fileName,message);return message;},_formatFileName:function(name){if(name.length>33){name=name.slice(0,19)+'...'+name.slice(-13);}
return name;},_isAllowedExtension:function(fileName){var ext=(-1!==fileName.indexOf('.'))?fileName.replace(/.*[.]/,'').toLowerCase():'';var allowed=this._options.validation.allowedExtensions;if(!allowed.length){return true;}
for(var i=0;i<allowed.length;i++){if(allowed[i].toLowerCase()==ext){return true;}}
return false;},_formatSize:function(bytes){var i=-1;do{bytes=bytes/1024;i++;}while(bytes>99);return Math.max(bytes,0.1).toFixed(1)+['kB','MB','GB','TB','PB','EB'][i];},_wrapCallbacks:function(){var self,safeCallback;self=this;safeCallback=function(callback,args){try{return callback.apply(self,args);}
catch(exception){self.log("Caught "+exception+" in callback: "+callback,'error');}}
for(var prop in this._options){if(/^on[A-Z]/.test(prop)){(function(){var oldCallback=self._options[prop];self._options[prop]=function(){return safeCallback(oldCallback,arguments);}}());}}}};qq.FineUploader=function(o){qq.FineUploaderBasic.apply(this,arguments);qq.extend(this._options,{element:null,listElement:null,dragAndDrop:{extraDropzones:[],hideDropzones:true,disableDefaultDropzone:false},text:{uploadButton:'Upload a file',cancelButton:'Cancel',retryButton:'Retry',failUpload:'Upload failed',dragZone:'Drop files here to upload',formatProgress:"{percent}% of {total_size}",waitingForResponse:"Processing..."},template:'<div class="qq-uploader">'+
((!this._options.dragAndDrop||!this._options.dragAndDrop.disableDefaultDropzone)?'<div class="qq-upload-drop-area"><span>{dragZoneText}</span></div>':'')+
(!this._options.button?'<div class="qq-upload-button">{uploadButtonText}</div>':'')+
(!this._options.listElement?'<ul class="qq-upload-list"></ul>':'')+'</div>',fileTemplate:'<li>'+'<div class="qq-progress-bar"></div>'+'<span class="qq-upload-spinner"></span>'+'<span class="qq-upload-finished"></span>'+'<span class="qq-upload-file"></span>'+'<span class="qq-upload-size"></span>'+'<a class="qq-upload-cancel" href="#">{cancelButtonText}</a>'+'<a class="qq-upload-retry" href="#">{retryButtonText}</a>'+'<span class="qq-upload-status-text">{statusText}</span>'+'</li>',classes:{button:'qq-upload-button',drop:'qq-upload-drop-area',dropActive:'qq-upload-drop-area-active',dropDisabled:'qq-upload-drop-area-disabled',list:'qq-upload-list',progressBar:'qq-progress-bar',file:'qq-upload-file',spinner:'qq-upload-spinner',finished:'qq-upload-finished',retrying:'qq-upload-retrying',retryable:'qq-upload-retryable',size:'qq-upload-size',cancel:'qq-upload-cancel',retry:'qq-upload-retry',statusText:'qq-upload-status-text',success:'qq-upload-success',fail:'qq-upload-fail',successIcon:null,failIcon:null},failedUploadTextDisplay:{mode:'default',maxChars:50,responseProperty:'error',enableTooltip:true},messages:{tooManyFilesError:"You may only drop one file"},retry:{showAutoRetryNote:true,autoRetryNote:"Retrying {retryNum}/{maxAuto}...",showButton:false},showMessage:function(message){alert(message);}},true);qq.extend(this._options,o,true);this._wrapCallbacks();this._options.template=this._options.template.replace(/\{dragZoneText\}/g,this._options.text.dragZone);this._options.template=this._options.template.replace(/\{uploadButtonText\}/g,this._options.text.uploadButton);this._options.fileTemplate=this._options.fileTemplate.replace(/\{cancelButtonText\}/g,this._options.text.cancelButton);this._options.fileTemplate=this._options.fileTemplate.replace(/\{retryButtonText\}/g,this._options.text.retryButton);this._options.fileTemplate=this._options.fileTemplate.replace(/\{statusText\}/g,"");this._element=this._options.element;this._element.innerHTML=this._options.template;this._listElement=this._options.listElement||this._find(this._element,'list');this._classes=this._options.classes;if(!this._button){this._button=this._createUploadButton(this._find(this._element,'button'));}
this._bindCancelAndRetryEvents();this._setupDragDrop();};qq.extend(qq.FineUploader.prototype,qq.FineUploaderBasic.prototype);qq.extend(qq.FineUploader.prototype,{clearStoredFiles:function(){qq.FineUploaderBasic.prototype.clearStoredFiles.apply(this,arguments);this._listElement.innerHTML="";},addExtraDropzone:function(element){this._setupExtraDropzone(element);},removeExtraDropzone:function(element){var dzs=this._options.dragAndDrop.extraDropzones;for(var i in dzs)if(dzs[i]===element)return this._options.dragAndDrop.extraDropzones.splice(i,1);},getItemByFileId:function(id){var item=this._listElement.firstChild;while(item){if(item.qqFileId==id)return item;item=item.nextSibling;}},reset:function(){qq.FineUploaderBasic.prototype.reset.apply(this,arguments);this._element.innerHTML=this._options.template;this._listElement=this._options.listElement||this._find(this._element,'list');if(!this._options.button){this._button=this._createUploadButton(this._find(this._element,'button'));}
this._bindCancelAndRetryEvents();this._setupDragDrop();},_leaving_document_out:function(e){return((qq.chrome()||(qq.safari()&&qq.windows()))&&e.clientX==0&&e.clientY==0)||(qq.firefox()&&!e.relatedTarget);},_storeFileForLater:function(id){qq.FineUploaderBasic.prototype._storeFileForLater.apply(this,arguments);var item=this.getItemByFileId(id);qq(this._find(item,'spinner')).hide();},_find:function(parent,type){var element=qq(parent).getByClass(this._options.classes[type])[0];if(!element){throw new Error('element not found '+type);}
return element;},_setupExtraDropzone:function(element){this._options.dragAndDrop.extraDropzones.push(element);this._setupDropzone(element);},_setupDropzone:function(dropArea){var self=this;var dz=new qq.UploadDropZone({element:dropArea,onEnter:function(e){qq(dropArea).addClass(self._classes.dropActive);e.stopPropagation();},onLeave:function(e){},onLeaveNotDescendants:function(e){qq(dropArea).removeClass(self._classes.dropActive);},onDrop:function(e){if(self._options.dragAndDrop.hideDropzones){qq(dropArea).hide();}
qq(dropArea).removeClass(self._classes.dropActive);if(e.dataTransfer.files.length>1&&!self._options.multiple){self._error('tooManyFilesError',"");}
else{self._uploadFileList(e.dataTransfer.files);}}});this.addDisposer(function(){dz.dispose();});if(this._options.dragAndDrop.hideDropzones){qq(dropArea).hide();}},_setupDragDrop:function(){var self,dropArea;self=this;if(!this._options.dragAndDrop.disableDefaultDropzone){dropArea=this._find(this._element,'drop');this._options.dragAndDrop.extraDropzones.push(dropArea);}
var dropzones=this._options.dragAndDrop.extraDropzones;var i;for(i=0;i<dropzones.length;i++){this._setupDropzone(dropzones[i]);}
if(!this._options.dragAndDrop.disableDefaultDropzone&&(!qq.ie()||qq.ie10())){this._attach(document,'dragenter',function(e){if(qq(dropArea).hasClass(self._classes.dropDisabled))return;dropArea.style.display='block';for(i=0;i<dropzones.length;i++){dropzones[i].style.display='block';}});}
this._attach(document,'dragleave',function(e){if(self._options.dragAndDrop.hideDropzones&&qq.FineUploader.prototype._leaving_document_out(e)){for(i=0;i<dropzones.length;i++){qq(dropzones[i]).hide();}}});qq(document).attach('drop',function(e){if(self._options.dragAndDrop.hideDropzones){for(i=0;i<dropzones.length;i++){qq(dropzones[i]).hide();}}
e.preventDefault();});},_onSubmit:function(id,fileName){qq.FineUploaderBasic.prototype._onSubmit.apply(this,arguments);this._addToList(id,fileName);},_onProgress:function(id,fileName,loaded,total){qq.FineUploaderBasic.prototype._onProgress.apply(this,arguments);var item,progressBar,text,percent,cancelLink,size;item=this.getItemByFileId(id);progressBar=this._find(item,'progressBar');percent=Math.round(loaded/total*100);if(loaded===total){cancelLink=this._find(item,'cancel');qq(cancelLink).hide();qq(progressBar).hide();qq(this._find(item,'statusText')).setText(this._options.text.waitingForResponse);text=this._formatSize(total);}
else{text=this._formatProgress(loaded,total);qq(progressBar).css({display:'block'});}
qq(progressBar).css({width:percent+'%'});size=this._find(item,'size');qq(size).css({display:'inline'});qq(size).setText(text);},_onComplete:function(id,fileName,result,xhr){qq.FineUploaderBasic.prototype._onComplete.apply(this,arguments);var item=this.getItemByFileId(id);qq(this._find(item,'statusText')).clearText();qq(item).removeClass(this._classes.retrying);qq(this._find(item,'progressBar')).hide();if(!this._options.disableCancelForFormUploads||qq.UploadHandlerXhr.isSupported()){qq(this._find(item,'cancel')).hide();}
qq(this._find(item,'spinner')).hide();if(result.success){qq(item).addClass(this._classes.success);if(this._classes.successIcon){this._find(item,'finished').style.display="inline-block";qq(item).addClass(this._classes.successIcon);}}else{qq(item).addClass(this._classes.fail);if(this._classes.failIcon){this._find(item,'finished').style.display="inline-block";qq(item).addClass(this._classes.failIcon);}
if(this._options.retry.showButton&&!this._preventRetries[id]){qq(item).addClass(this._classes.retryable);}
this._controlFailureTextDisplay(item,result);}},_onUpload:function(id,fileName,xhr){qq.FineUploaderBasic.prototype._onUpload.apply(this,arguments);var item=this.getItemByFileId(id);this._showSpinner(item);},_onBeforeAutoRetry:function(id){var item,progressBar,cancelLink,failTextEl,retryNumForDisplay,maxAuto,retryNote;qq.FineUploaderBasic.prototype._onBeforeAutoRetry.apply(this,arguments);item=this.getItemByFileId(id);progressBar=this._find(item,'progressBar');this._showCancelLink(item);progressBar.style.width=0;qq(progressBar).hide();if(this._options.retry.showAutoRetryNote){failTextEl=this._find(item,'statusText');retryNumForDisplay=this._autoRetries[id]+1;maxAuto=this._options.retry.maxAutoAttempts;retryNote=this._options.retry.autoRetryNote.replace(/\{retryNum\}/g,retryNumForDisplay);retryNote=retryNote.replace(/\{maxAuto\}/g,maxAuto);qq(failTextEl).setText(retryNote);if(retryNumForDisplay===1){qq(item).addClass(this._classes.retrying);}}},_onBeforeManualRetry:function(id){if(qq.FineUploaderBasic.prototype._onBeforeManualRetry.apply(this,arguments)){var item=this.getItemByFileId(id);this._find(item,'progressBar').style.width=0;qq(item).removeClass(this._classes.fail);this._showSpinner(item);this._showCancelLink(item);return true;}
return false;},_addToList:function(id,fileName){var item=qq.toElement(this._options.fileTemplate);if(this._options.disableCancelForFormUploads&&!qq.UploadHandlerXhr.isSupported()){var cancelLink=this._find(item,'cancel');qq(cancelLink).remove();}
item.qqFileId=id;var fileElement=this._find(item,'file');qq(fileElement).setText(this._formatFileName(fileName));qq(this._find(item,'size')).hide();if(!this._options.multiple)this._clearList();this._listElement.appendChild(item);},_clearList:function(){this._listElement.innerHTML='';this.clearStoredFiles();},_bindCancelAndRetryEvents:function(){var self=this,list=this._listElement;this._attach(list,'click',function(e){e=e||window.event;var target=e.target||e.srcElement;if(qq(target).hasClass(self._classes.cancel)||qq(target).hasClass(self._classes.retry)){qq.preventDefault(e);var item=target.parentNode;while(item.qqFileId==undefined){item=target=target.parentNode;}
if(qq(target).hasClass(self._classes.cancel)){self.cancel(item.qqFileId);qq(item).remove();}
else{qq(item).removeClass(self._classes.retryable);self.retry(item.qqFileId);}}});},_formatProgress:function(uploadedSize,totalSize){var message=this._options.text.formatProgress;function r(name,replacement){message=message.replace(name,replacement);}
r('{percent}',Math.round(uploadedSize/totalSize*100));r('{total_size}',this._formatSize(totalSize));return message;},_controlFailureTextDisplay:function(item,response){var mode,maxChars,responseProperty,failureReason,shortFailureReason;mode=this._options.failedUploadTextDisplay.mode;maxChars=this._options.failedUploadTextDisplay.maxChars;responseProperty=this._options.failedUploadTextDisplay.responseProperty;if(mode==='custom'){failureReason=response[responseProperty];if(failureReason){if(failureReason.length>maxChars){shortFailureReason=failureReason.substring(0,maxChars)+'...';}}
else{failureReason=this._options.text.failUpload;this.log("'"+responseProperty+"' is not a valid property on the server response.",'warn');}
qq(this._find(item,'statusText')).setText(shortFailureReason||failureReason);if(this._options.failedUploadTextDisplay.enableTooltip){this._showTooltip(item,failureReason);}}
else if(mode==='default'){qq(this._find(item,'statusText')).setText(this._options.text.failUpload);}
else if(mode!=='none'){this.log("failedUploadTextDisplay.mode value of '"+mode+"' is not valid",'warn');}},_showTooltip:function(item,text){item.title=text;},_showSpinner:function(item){var spinnerEl=this._find(item,'spinner');spinnerEl.style.display="inline-block";},_showCancelLink:function(item){if(!this._options.disableCancelForFormUploads||qq.UploadHandlerXhr.isSupported()){var cancelLink=this._find(item,'cancel');cancelLink.style.display='inline';}},_error:function(code,fileName){var message=qq.FineUploaderBasic.prototype._error.apply(this,arguments);this._options.showMessage(message);}});qq.UploadDropZone=function(o){this._options={element:null,onEnter:function(e){},onLeave:function(e){},onLeaveNotDescendants:function(e){},onDrop:function(e){}};qq.extend(this._options,o);qq.extend(this,qq.DisposeSupport);this._element=this._options.element;this._disableDropOutside();this._attachEvents();};qq.UploadDropZone.prototype={_dragover_should_be_canceled:function(){return qq.safari()||(qq.firefox()&&qq.windows());},_disableDropOutside:function(e){if(!qq.UploadDropZone.dropOutsideDisabled){if(this._dragover_should_be_canceled){qq(document).attach('dragover',function(e){e.preventDefault();});}else{qq(document).attach('dragover',function(e){if(e.dataTransfer){e.dataTransfer.dropEffect='none';e.preventDefault();}});}
qq.UploadDropZone.dropOutsideDisabled=true;}},_attachEvents:function(){var self=this;self._attach(self._element,'dragover',function(e){if(!self._isValidFileDrag(e))return;var effect=qq.ie()?null:e.dataTransfer.effectAllowed;if(effect=='move'||effect=='linkMove'){e.dataTransfer.dropEffect='move';}else{e.dataTransfer.dropEffect='copy';}
e.stopPropagation();e.preventDefault();});self._attach(self._element,'dragenter',function(e){if(!self._isValidFileDrag(e))return;self._options.onEnter(e);});self._attach(self._element,'dragleave',function(e){if(!self._isValidFileDrag(e))return;self._options.onLeave(e);var relatedTarget=document.elementFromPoint(e.clientX,e.clientY);if(qq(this).contains(relatedTarget))return;self._options.onLeaveNotDescendants(e);});self._attach(self._element,'drop',function(e){if(!self._isValidFileDrag(e))return;e.preventDefault();self._options.onDrop(e);});},_isValidFileDrag:function(e){if(qq.ie()&&!qq.ie10())return false;var dt=e.dataTransfer,isSafari=qq.safari();var effectTest=qq.ie10()?true:dt.effectAllowed!='none';return dt&&effectTest&&(dt.files||(!isSafari&&dt.types.contains&&dt.types.contains('Files')));}};qq.UploadHandlerAbstract=function(o){this._options={debug:false,endpoint:'/upload.php',maxConnections:999,log:function(str,level){},onProgress:function(id,fileName,loaded,total){},onComplete:function(id,fileName,response,xhr){},onCancel:function(id,fileName){},onUpload:function(id,fileName,xhr){},onAutoRetry:function(id,fileName,response,xhr){}};qq.extend(this._options,o);this._queue=[];this._params=[];this.log=this._options.log;};qq.UploadHandlerAbstract.prototype={add:function(file){},upload:function(id,params){var len=this._queue.push(id);var copy={};qq.extend(copy,params);this._params[id]=copy;if(len<=this._options.maxConnections){this._upload(id,this._params[id]);}},retry:function(id){var i=qq.indexOf(this._queue,id);if(i>=0){this._upload(id,this._params[id]);}
else{this.upload(id,this._params[id]);}},cancel:function(id){this.log('Cancelling '+id);this._cancel(id);this._dequeue(id);},cancelAll:function(){for(var i=0;i<this._queue.length;i++){this._cancel(this._queue[i]);}
this._queue=[];},getName:function(id){},getSize:function(id){},getQueue:function(){return this._queue;},reset:function(){this.log('Resetting upload handler');this._queue=[];this._params=[];},_upload:function(id){},_cancel:function(id){},_dequeue:function(id){var i=qq.indexOf(this._queue,id);this._queue.splice(i,1);var max=this._options.maxConnections;if(this._queue.length>=max&&i<max){var nextId=this._queue[max-1];this._upload(nextId,this._params[nextId]);}},isValid:function(id){}};qq.UploadHandlerForm=function(o){qq.UploadHandlerAbstract.apply(this,arguments);this._inputs={};this._detach_load_events={};};qq.extend(qq.UploadHandlerForm.prototype,qq.UploadHandlerAbstract.prototype);qq.extend(qq.UploadHandlerForm.prototype,{add:function(fileInput){fileInput.setAttribute('name',this._options.inputName);var id='qq-upload-handler-iframe'+qq.getUniqueId();this._inputs[id]=fileInput;if(fileInput.parentNode){qq(fileInput).remove();}
return id;},getName:function(id){return this._inputs[id].value.replace(/.*(\/|\\)/,"");},isValid:function(id){return this._inputs[id]!==undefined;},reset:function(){qq.UploadHandlerAbstract.prototype.reset.apply(this,arguments);this._inputs={};this._detach_load_events={};},_cancel:function(id){this._options.onCancel(id,this.getName(id));delete this._inputs[id];delete this._detach_load_events[id];var iframe=document.getElementById(id);if(iframe){iframe.setAttribute('src','javascript:false;');qq(iframe).remove();}},_upload:function(id,params){this._options.onUpload(id,this.getName(id),false);var input=this._inputs[id];if(!input){throw new Error('file with passed id was not added, or already uploaded or cancelled');}
var fileName=this.getName(id);params[this._options.inputName]=fileName;var iframe=this._createIframe(id);var form=this._createForm(iframe,params);form.appendChild(input);var self=this;this._attachLoadEvent(iframe,function(){self.log('iframe loaded');var response=self._getIframeContentJSON(iframe);setTimeout(function(){self._detach_load_events[id]();delete self._detach_load_events[id];qq(iframe).remove();},1);if(!response.success){if(self._options.onAutoRetry(id,fileName,response)){return;}}
self._options.onComplete(id,fileName,response);self._dequeue(id);});this.log('Sending upload request for '+id);form.submit();qq(form).remove();return id;},_attachLoadEvent:function(iframe,callback){var self=this;this._detach_load_events[iframe.id]=qq(iframe).attach('load',function(){self.log('Received response for '+iframe.id);if(!iframe.parentNode){return;}
try{if(iframe.contentDocument&&iframe.contentDocument.body&&iframe.contentDocument.body.innerHTML=="false"){return;}}
catch(error){self.log('Error when attempting to access iframe during handling of upload response ('+error+")",'error');}
callback();});},_getIframeContentJSON:function(iframe){try{var doc=iframe.contentDocument?iframe.contentDocument:iframe.contentWindow.document,response;var innerHTML=doc.body.innerHTML;this.log("converting iframe's innerHTML to JSON");this.log("innerHTML = "+innerHTML);if(innerHTML.slice(0,5).toLowerCase()=='<pre>'&&innerHTML.slice(-6).toLowerCase()=='</pre>'){innerHTML=doc.body.firstChild.firstChild.nodeValue;}
response=eval("("+innerHTML+")");}catch(error){self.log('Error when attempting to parse form upload response ('+error+")",'error');response={success:false};}
return response;},_createIframe:function(id){var iframe=qq.toElement('<iframe src="javascript:false;" name="'+id+'" />');iframe.setAttribute('id',id);iframe.style.display='none';document.body.appendChild(iframe);return iframe;},_createForm:function(iframe,params){var protocol=this._options.demoMode?"GET":"POST"
var form=qq.toElement('<form method="'+protocol+'" enctype="multipart/form-data"></form>');var queryString=qq.obj2url(params,this._options.endpoint);form.setAttribute('action',queryString);form.setAttribute('target',iframe.name);form.style.display='none';document.body.appendChild(form);return form;}});qq.UploadHandlerXhr=function(o){qq.UploadHandlerAbstract.apply(this,arguments);this._files=[];this._xhrs=[];this._loaded=[];};qq.UploadHandlerXhr.isSupported=function(){var input=document.createElement('input');input.type='file';return('multiple'in input&&typeof File!="undefined"&&typeof FormData!="undefined"&&typeof(new XMLHttpRequest()).upload!="undefined");};qq.extend(qq.UploadHandlerXhr.prototype,qq.UploadHandlerAbstract.prototype)
qq.extend(qq.UploadHandlerXhr.prototype,{add:function(file){if(!(file instanceof File)){throw new Error('Passed obj in not a File (in qq.UploadHandlerXhr)');}
return this._files.push(file)-1;},getName:function(id){var file=this._files[id];return(file.fileName!==null&&file.fileName!==undefined)?file.fileName:file.name;},getSize:function(id){var file=this._files[id];return file.fileSize!=null?file.fileSize:file.size;},getLoaded:function(id){return this._loaded[id]||0;},isValid:function(id){return this._files[id]!==undefined;},reset:function(){qq.UploadHandlerAbstract.prototype.reset.apply(this,arguments);this._files=[];this._xhrs=[];this._loaded=[];},_upload:function(id,params){this._options.onUpload(id,this.getName(id),true);var file=this._files[id],name=this.getName(id),size=this.getSize(id);this._loaded[id]=0;var xhr=this._xhrs[id]=new XMLHttpRequest();var self=this;xhr.upload.onprogress=function(e){if(e.lengthComputable){self._loaded[id]=e.loaded;self._options.onProgress(id,name,e.loaded,e.total);}};xhr.onreadystatechange=function(){if(xhr.readyState==4){self._onComplete(id,xhr);}};params=params||{};params[this._options.inputName]=name;var queryString=qq.obj2url(params,this._options.endpoint);var protocol=this._options.demoMode?"GET":"POST";xhr.open(protocol,queryString,true);xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");xhr.setRequestHeader("X-File-Name",encodeURIComponent(name));xhr.setRequestHeader("Cache-Control","no-cache");if(this._options.forceMultipart){var formData=new FormData();formData.append(this._options.inputName,file);file=formData;}else{xhr.setRequestHeader("Content-Type","application/octet-stream");xhr.setRequestHeader("X-Mime-Type",file.type);}
for(key in this._options.customHeaders){xhr.setRequestHeader(key,this._options.customHeaders[key]);};this.log('Sending upload request for '+id);xhr.send(file);},_onComplete:function(id,xhr){"use strict";if(!this._files[id]){return;}
var name=this.getName(id);var size=this.getSize(id);var response;this._options.onProgress(id,name,size,size);this.log("xhr - server response received for "+id);this.log("responseText = "+xhr.responseText);try{if(typeof JSON.parse==="function"){response=JSON.parse(xhr.responseText);}else{response=eval("("+xhr.responseText+")");}}catch(error){this.log('Error when attempting to parse xhr response text ('+error+')','error');response={};}
if(xhr.status!==200||!response.success){if(this._options.onAutoRetry(id,name,response,xhr)){return;}}
this._options.onComplete(id,name,response,xhr);this._xhrs[id]=null;this._dequeue(id);},_cancel:function(id){this._options.onCancel(id,this.getName(id));this._files[id]=null;if(this._xhrs[id]){this._xhrs[id].abort();this._xhrs[id]=null;}}});