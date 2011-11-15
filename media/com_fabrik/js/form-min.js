var FbForm=new Class({Implements:[Options,Events],options:{admin:false,ajax:false,primaryKey:null,error:"",submitOnEnter:false,delayedEvents:false,updatedMsg:"Form saved",pages:[],start_page:0,ajaxValidation:false,customJsAction:"",plugins:[],ajaxmethod:"post",inlineMessage:true,images:{alert:"",action_check:"",ajax_loader:""}},initialize:function(b,a){this.id=b;this.result=true;this.setOptions(a);this.plugins=this.options.plugins;this.options.pages=$H(this.options.pages);this.subGroups=$H({});this.currentPage=this.options.start_page;this.formElements=$H({});this.bufferedEvents=$A([]);this.duplicatedGroups=$H({});this.clickDeleteGroup=this.deleteGroup.bindWithEvent(this);this.clickDuplicateGroup=this.duplicateGroup.bindWithEvent(this);this.fx={};this.fx.elements=[];this.fx.validations={};this.setUpAll();this._setMozBoxWidths()},_setMozBoxWidths:function(){if(Browser.firefox){this.getForm().getElements(".fabrikElementContainer > .displayBox").each(function(a){var c=a.getParent().getSize().x===0?400:a.getParent().getSize().x;a.setStyle("width",c+"px")})}},setUpAll:function(){this.setUp();this.winScroller=new Fx.Scroll(window);if(this.options.ajax||this.options.submitOnEnter===false){this.stopEnterSubmitting()}this.watchAddOptions();$H(this.options.hiddenGroup).each(function(d,c){if(d===true&&typeOf(document.id("group"+c))!=="null"){var e=document.id("group"+c).getElement(".fabrikSubGroup");this.subGroups.set(c,e.cloneWithIds());this.hideLastGroup(c,e)}}.bind(this));this.repeatGroupMarkers=$H({});this.form.getElements(".fabrikGroup").each(function(d){var f=d.id.replace("group","");var e=d.getElements(".fabrikSubGroup").length;this.repeatGroupMarkers.set(f,e)}.bind(this));var a=this.options.editable===true?"form":"details";var b={option:"com_fabrik",view:a,controller:"form",fabrik:this.id,rowid:this.form.getElement("input[name=rowid]").value,format:"raw",task:"paginate",dir:1};[".previous-record",".next-record"].each(function(c,d){b.dir=d;if(this.form.getElement(c)){var e=new Request({url:"index.php",method:this.options.ajaxmethod,data:b,onComplete:function(f){Fabrik.loader.stop("form_"+this.id);f=JSON.decode(f);this.update(f);this.form.getElement("input[name=rowid]").value=f.post.rowid}.bind(this)});this.form.getElement(c).addEvent("click",function(f){e.options.data.rowid=this.form.getElement("input[name=rowid]").value;f.stop();Fabrik.loader.start("form_"+this.id,Joomla.JText._("COM_FABRIK_LOADING"));e.send()}.bind(this))}}.bind(this))},watchAddOptions:function(){this.fx.addOptions=[];this.getForm().getElements(".addoption").each(function(e){var b=e.getParent().getElement(".toggle-addoption");var c=new Fx.Slide(e,{duration:500});c.hide();b.addEvent("click",function(a){a.stop();c.toggle()})})},setUp:function(){this.form=this.getForm();this.watchGroupButtons();this.watchSubmit();this.createPages();this.watchClearSession()},getForm:function(){this.form=document.id(this.getBlock());return this.form},getBlock:function(){return this.options.editable===true?"form_"+this.id:"details_"+this.id},addElementFX:function(g,f){var e,a,d;g=g.replace("fabrik_trigger_","");if(g.slice(0,6)==="group_"){g=g.slice(6,g.length);a=g;e=$(g)}else{g=g.slice(8,g.length);a="element"+g;if(!document.id(g)){return}e=document.id(g).getParent(".fabrikElementContainer")}if(e){if((e).get("tag")==="li"){d=new Element("div").adopt(e.getChildren());e.empty();d.inject(e)}else{d=e}var b={duration:800,transition:Fx.Transitions.Sine.easeInOut};this.fx.elements[a]={};this.fx.elements[a].css=new Fx.Morph(d,b);if(typeOf(d)!=="null"&&(f==="slide in"||f==="slide out"||f==="slide toggle")){this.fx.elements[a].slide=new Fx.Slide(d,b)}else{this.fx.elements[a].slide=null}}},doElementFX:function(f,e){var a,d,b,c;f=f.replace("fabrik_trigger_","");if(f.slice(0,6)==="group_"){f=f.slice(6,f.length);if(f.slice(0,6)==="group_"){f=f.slice(6,f.length)}a=f;d=true}else{d=false;f=f.slice(8,f.length);a="element"+f}b=this.fx.elements[a];if(!b){return}c=d?b.css.element:b.css.element.getParent(".fabrikElementContainer");switch(e){case"show":c.fade("show").removeClass("fabrikHide");if(d){document.id(f).getElements(".fabrikinput").setStyle("opacity","1")}break;case"hide":c.fade("hide").addClass("fabrikHide");break;case"fadein":c.removeClass("fabrikHide");if(b.css.lastMethod!=="fadein"){b.css.element.show();b.css.start({opacity:[0,1]})}break;case"fadeout":if(b.css.lastMethod!=="fadeout"){b.css.start({opacity:[1,0]}).chain(function(){b.css.element.hide();c.addClass("fabrikHide")})}break;case"slide in":b.slide.slideIn();break;case"slide out":b.slide.slideOut();c.removeClass("fabrikHide");break;case"slide toggle":b.slide.toggle();break}b.lastMethod=e;Fabrik.fireEvent("fabrik.form.doelementfx",[this])},watchClearSession:function(){if(this.form&&this.form.getElement(".clearSession")){this.form.getElement(".clearSession").addEvent("click",function(a){a.stop();this.form.getElement("input[name=task]").value="removeSession";this.clearForm();this.form.submit()}.bind(this))}},createPages:function(){if(this.options.pages.getKeys().length>1){this.options.pages.each(function(c,b){var d=new Element("div",{"class":"page",id:"page_"+b});d.inject(document.id("group"+c[0]),"before");c.each(function(e){d.adopt(document.id("group"+e))})});var a=this._getButton("submit");if(a&&this.options.rowid===""){a.disabled="disabled";a.setStyle("opacity",0.5)}this.form.getElement(".fabrikPagePrevious").disabled="disabled";this.form.getElement(".fabrikPageNext").addEvent("click",this._doPageNav.bindWithEvent(this,[1]));this.form.getElement(".fabrikPagePrevious").addEvent("click",this._doPageNav.bindWithEvent(this,[-1]));this.setPageButtons();this.hideOtherPages()}},_doPageNav:function(g,b){if(this.options.editable){this.form.getElement(".fabrikMainError").addClass("fabrikHide");if(typeOf(document.getElement(".tool-tip"))!=="null"){document.getElement(".tool-tip").setStyle("top",0)}var a=Fabrik.liveSite+"index.php?option=com_fabrik&format=raw&task=form.ajax_validate&form_id="+this.id;Fabrik.loader.start("form_"+this.id,"validating");var c=this.options.pages.get(this.currentPage.toInt());var h=$H(this.getFormData());h.set("task","form.ajax_validate");h.set("fabrik_ajax","1");h.set("format","raw");h=this._prepareRepeatsForAjax(h);var f=new Request({url:a,method:this.options.ajaxmethod,data:h,onComplete:function(d){Fabrik.loader.stop("form_"+this.id);d=JSON.decode(d);if(this._showGroupError(d,h)===false){this.changePage(b);this.saveGroupsToDb()}new Fx.Scroll(window).toElement(this.form)}.bind(this)}).send()}else{this.changePage(b)}g.stop()},saveGroupsToDb:function(){if(this.options.multipage_save===0){return}Fabrik.fireEvent("fabrik.form.groups.save.start",[this]);if(this.result===false){this.result=true;return}var d=this.form.getElement("input[name=format]").value;var c=this.form.getElement("input[name=task]").value;this.form.getElement("input[name=format]").value="raw";this.form.getElement("input[name=task]").value="savepage";var a=Fabrik.liveSite+"index.php?option=com_fabrik&format=raw&page="+this.currentPage;Fabrik.loader.start("form_"+this.id,"saving page");var b=this.getFormData();new Request({url:a,method:this.options.ajaxmethod,data:b,onComplete:function(e){Fabrik.fireEvent("fabrik.form.groups.save.completed",[this]);if(this.result===false){this.result=true;return}this.form.getElement("input[name=format]").value=d;this.form.getElement("input[name=task]").value=c;if(this.options.ajax){Fabrik.fireEvent("fabrik.form.groups.save.end",[this,e])}Fabrik.loader.stop("form_"+this.id)}.bind(this)}).send()},changePage:function(a){this.changePageDir=a;Fabrik.fireEvent("fabrik.form.page.change",[this]);if(this.result===false){this.result=true;return}this.currentPage=this.currentPage.toInt();if(this.currentPage+a>=0&&this.currentPage+a<this.options.pages.getKeys().length){this.currentPage=this.currentPage+a;if(!this.pageGroupsVisible()){this.changePage(a)}}this.setPageButtons();document.id("page_"+this.currentPage).setStyle("display","");this._setMozBoxWidths();this.hideOtherPages();Fabrik.fireEvent("fabrik.form.page.chage.end",[this]);if(this.result===false){this.result=true;return}},pageGroupsVisible:function(){var a=false;this.options.pages.get(this.currentPage).each(function(b){if(document.id("group"+b).getStyle("display")!=="none"){a=true}});return a},hideOtherPages:function(){this.options.pages.each(function(b,a){if(a.toInt()!==this.currentPage){document.id("page_"+a).setStyle("display","none")}}.bind(this))},setPageButtons:function(){var c=this._getButton("submit");var b=this.form.getElement(".fabrikPagePrevious");var a=this.form.getElement(".fabrikPageNext");if(this.currentPage===this.options.pages.getKeys().length-1){if(typeOf(c)!=="null"){c.disabled="";c.setStyle("opacity",1)}a.disabled="disabled";a.setStyle("opacity",0.5)}else{if(typeOf(c)!=="null"&&this.options.rowid===""){c.disabled="disabled";c.setStyle("opacity",0.5)}a.disabled="";a.setStyle("opacity",1)}if(this.currentPage===0){b.disabled="disabled";b.setStyle("opacity",0.5)}else{b.disabled="";b.setStyle("opacity",1)}},addElements:function(b){b=$H(b);b.each(function(c,a){c.each(function(d){if(typeOf(d)!=="null"){this.addElement(d,d.options.element,a)}}.bind(this))}.bind(this));b.each(function(a){a.each(function(c){if(typeOf(c)!=="null"){try{c.attachedToForm()}catch(d){fconsole(c.options.element+" attach to form:"+d)}}}.bind(this))}.bind(this));Fabrik.fireEvent("fabrik.form.elements.added",[this])},addElement:function(b,a,c){a=a.replace("[]","");var d=a.substring(a.length-3,a.length)==="_ro";b.form=this;b.groupid=c;this.formElements.set(a,b);if(d){a=a.substr(0,a.length-3);this.formElements.set(a,b)}},dispatchEvent:function(b,a,d,e){if(!this.options.delayedEvents){var c=this.formElements.get(a);if(c&&e!==""){c.addNewEvent(d,e)}}else{this.bufferEvent(b,a,d,e)}},bufferEvent:function(b,a,c,d){this.bufferedEvents.push([b,a,c,d])},processBufferEvents:function(){this.setUp();this.options.delayedEvents=false;this.bufferedEvents.each(function(c){var a=c[1];var b=this.formElements.get(a);b.element=document.id(a);this.dispatchEvent(c[0],a,c[2],c[3])}.bind(this))},action:function(a,c){var b=this.formElements.get(c);Browser.exec("oEl."+a+"()")},triggerEvents:function(a){this.formElements.get(a).fireEvents(arguments[1])},watchValidation:function(c,b){if(this.options.ajaxValidation===false){return}var a=document.id(c);if(typeOf(a)==="null"){fconsole("watch validation failed, could not find element "+c);return}if(a.className==="fabrikSubElementContainer"){a.getElements(".fabrikinput").each(function(d){d.addEvent(b,this.doElementValidation.bindWithEvent(this,[true]))}.bind(this));return}a.addEvent(b,this.doElementValidation.bindWithEvent(this,[false]))},doElementValidation:function(j,b,h){var f;if(this.options.ajaxValidation===false){return}h=typeOf(h)==="null"?"_time":h;if(typeOf(j)==="event"||typeOf(j)==="object"){f=j.target.id;if(b===true){f=document.id(j.target).getParent(".fabrikSubElementContainer").id}}else{f=j}if(typeOf(document.id(f))==="null"){return}if(document.id(f).getProperty("readonly")===true||document.id(f).getProperty("readonly")==="readonly"){}var g=this.formElements.get(f);if(!g){f=f.replace(h,"");g=this.formElements.get(f);if(!g){return}}Fabrik.fireEvent("fabrik.form.element.validaton.start",[this,g,j]);if(this.result===false){this.result=true;return}g.setErrorMessage(Joomla.JText._("COM_FABRIK_VALIDATING"),"fabrikValidating");var k=$H(this.getFormData());k.set("task","form.ajax_validate");k.set("fabrik_ajax","1");k.set("format","raw");k=this._prepareRepeatsForAjax(k);var i=g.origId?g.origId:f;g.options.repeatCounter=g.options.repeatCounter?g.options.repeatCounter:0;var c=Fabrik.liveSite+"index.php?option=com_fabrik&form_id="+this.id;var a=new Request({url:c,method:this.options.ajaxmethod,data:k,onComplete:this._completeValidaton.bindWithEvent(this,[f,i])}).send()},_completeValidaton:function(c,d,a){c=JSON.decode(c);Fabrik.fireEvent("fabrik.form.elemnet.validation.complete",[this,c,d,a]);if(this.result===false){this.result=true;return}var b=this.formElements.get(d);if((c.modified[a]!==undefined)){b.update(c.modified[a])}if(typeOf(c.errors[a])!=="null"){this._showElementError(c.errors[a][b.options.repeatCounter],d)}else{this._showElementError([],d)}},_prepareRepeatsForAjax:function(a){this.getForm();if(typeOf(a)==="hash"){a=a.getClean()}this.form.getElements("input[name^=fabrik_repeat_group]").each(function(b){var d=b.name.match(/\[(.*)\]/)[1];a["fabrik_repeat_group["+d+"]"]=b.get("value")});return a},_showGroupError:function(e,f){var a;var b=$A(this.options.pages.get(this.currentPage.toInt()));var c=false;$H(f).each(function(g,d){d=d.replace(/\[(.*)\]/,"");if(this.formElements.has(d)){var h=this.formElements.get(d);if(b.contains(h.groupid.toInt())){if(e.errors[d]){var i="";if(typeOf(e.errors[d])!=="null"){i=e.errors[d].flatten().join("<br />")}if(i!==""){a=this._showElementError(e.errors[d],d);if(c===false){c=a}}else{h.setErrorMessage("","")}}if(e.modified[d]){if(h){h.update(e.modified[d])}}}}}.bind(this));return c},_showElementError:function(a,d){var c="";if(typeOf(a)!=="null"){c=a.flatten().join("<br />")}var b=(c==="")?"fabrikSuccess":"fabrikError";if(c===""){c=Joomla.JText._("COM_FABRIK_SUCCESS")}this.formElements.get(d).setErrorMessage(c,b);return(b==="fabrikSuccess")?false:true},updateMainError:function(){var c,b;var a=this.form.getElement(".fabrikMainError");a.set("html",this.options.error);b=this.form.getElements(".fabrikError").filter(function(f,d){return !f.hasClass("fabrikMainError")});if(b.length>0&&a.hasClass("fabrikHide")){a.removeClass("fabrikHide");c=new Fx.Tween(a,{property:"opacity",duration:500}).start(0,1)}if(b.length===0){c=new Fx.Tween(a,{property:"opacity",duration:500,onComplete:function(){a.addClass("fabrikHide")}}).start(1,0)}},_getButton:function(c){var a=this.form.getElement("input[type=button][name="+c+"]");if(!a){a=this.form.getElement("input[type=submit][name="+c+"]")}return a},watchSubmit:function(){var b=this._getButton("submit");if(!b){return}var a=this._getButton("apply");if(this.form.getElement("input[name=delete]")){this.form.getElement("input[name=delete]").addEvent("click",function(c){if(confirm(Joomla.JText._("COM_FABRIK_CONFIRM_DELETE"))){this.form.getElement("input[name=task]").value="delete"}else{return false}}.bind(this))}if(this.options.ajax){$A([a,b]).each(function(c){if(typeOf(c)!=="null"){c.addEvent("click",this.doSubmit.bindWithEvent(this,[c]))}}.bind(this))}this.form.addEvent("submit",this.doSubmit.bindWithEvent(this))},doSubmit:function(c,a){Fabrik.fireEvent("fabrik.form.submit.start",[this,c,a]);this.elementsBeforeSubmit(c);if(this.result===false){this.result=true;c.stop();this.updateMainError()}if(this.options.pages.getKeys().length>1){this.form.adopt(new Element("input",{name:"currentPage",value:this.currentPage.toInt(),type:"hidden"}))}if(this.options.ajax){if(this.form){Fabrik.loader.start("form_"+this.id,Joomla.JText._("COM_FABRIK_LOADING"));this.elementsBeforeSubmit(c);var b=$H(this.getFormData());b=this._prepareRepeatsForAjax(b);b.fabrik_ajax="1";b.format="raw";var d=new Request.JSON({url:this.form.action,data:b,method:this.options.ajaxmethod,onError:function(f,e){fconsole(f)},onComplete:function(h,e){if(typeOf(h)==="null"){fconsole("error in returned json",h,e);return}var f=false;if(h.errors!==undefined){$H(h.errors).each(function(j,i){i=i.replace(/(\[)|(\]\[)/g,"___").replace(/\]/,"");if(this.formElements.has(i)&&j.flatten().length>0){f=true;this._showElementError(j,i)}}.bind(this))}this.updateMainError();if(f===false){Fabrik.loader.stop("form_"+this.id);var g=h.msg!==undefined?h.msg:Joomla.JText._("COM_FABRIK_FORM_SAVED");if(h.baseRedirect!==true){if(h.url!==undefined){Fabrik.getWindow({id:"redirect",type:"redirect",contentURL:h.url,caller:this.getBlock(),height:400})}else{alert(g)}}else{alert(g)}Fabrik.fireEvent("fabrik.form.submitted",[this,h]);if(a.name!=="apply"){this.clearForm();if(Fabrik.Windows[this.options.fabrik_window_id]){Fabrik.Windows[this.options.fabrik_window_id].close()}}}else{Fabrik.loader.stop("form_"+this.id,Joomla.JText._("COM_FABRIK_VALIDATION_ERROR"))}}.bind(this)}).send()}}Fabrik.fireEvent("fabrik.form.submit.end",[this]);if(this.result===false){this.result=true;c.stop();this.updateMainError()}},elementsBeforeSubmit:function(a){this.formElements.each(function(c,b){if(!c.onsubmit()){a.stop()}})},getFormData:function(){this.getForm();var c=this.form.toQueryString();var b={};c=c.split("&");var d=$H({});c.each(function(f){f=f.split("=");var e=f[0];if(e.substring(e.length-2)==="[]"){e=e.substring(0,e.length-2);if(!d.has(e)){d.set(e,0)}else{d.set(e,d.get(e)+1)}e=e+"["+d.get(e)+"]"}b[e]=f[1]});var a=this.formElements.getKeys();this.formElements.each(function(f,e){if(f.plugin==="fabrikfileupload"){b[e]=f.get("value")}if(typeOf(b[e])==="null"){var g=false;$H(b).each(function(i,h){h=unescape(h);h=h.replace(/\[(.*)\]/,"");if(h===e){g=true}}.bind(this));if(!g){b[e]=""}}}.bind(this));return b},getFormElementData:function(){var a={};this.formElements.each(function(c,b){if(c.element){a[b]=c.getValue();a[b+"_raw"]=a[b]}}.bind(this));return a},watchGroupButtons:function(){this.unwatchGroupButtons();this.form.getElements(".deleteGroup").each(function(b,a){b.addEvent("click",this.clickDeleteGroup)}.bind(this));this.form.getElements(".addGroup").each(function(b,a){b.addEvent("click",this.clickDuplicateGroup)}.bind(this));this.form.getElements(".fabrikSubGroup").each(function(b){var a=b.getElement(".fabrikGroupRepeater");if(a){b.addEvent("mouseenter",function(c){a.fade(1)});b.addEvent("mouseleave",function(c){a.fade(0.2)})}})},unwatchGroupButtons:function(){this.form.getElements(".deleteGroup").each(function(b,a){b.removeEvent("click",this.clickDeleteGroup)}.bind(this));this.form.getElements(".addGroup").each(function(b,a){b.removeEvent("click",this.clickDuplicateGroup)}.bind(this));this.form.getElements(".fabrikSubGroup").each(function(a){a.removeEvents("mouseenter");a.removeEvents("mouseleave")})},deleteGroup:function(j){Fabrik.fireEvent("fabrik.form.group.delete",[this,j]);if(this.result===false){this.result=true;return}j.stop();var m=j.target.getParent(".fabrikGroup");var f=0;m.getElements(".deleteGroup").each(function(i,e){if(i.getElement("img")===j.target){f=e}}.bind(this));var h=m.id.replace("group","");delete this.duplicatedGroups.i;if(document.id("fabrik_repeat_group_"+h+"_counter").value==="0"){return}var b=m.getElements(".fabrikSubGroup");var k=j.target.getParent(".fabrikSubGroup");this.subGroups.set(h,k.clone());if(b.length<=1){this.hideLastGroup(h,k)}else{var a=k.getPrevious();var c=new Fx.Tween(k,{property:"opacity",duration:300,onComplete:function(){if(b.length>1){k.dispose()}this.formElements.each(function(n,i){if(typeOf(n.element)!=="null"){if(typeOf(document.id(n.element.id))==="null"){n.decloned(h);delete this.formElements.k}}}.bind(this));b=m.getElements(".fabrikSubGroup");var e={};this.formElements.each(function(n,i){if(n.groupid===h){e[i]=n.decreaseName(f)}}.bind(this));$H(e).each(function(n,i){if(i!==n){this.formElements[n]=this.formElements[i];delete this.formElements[i]}}.bind(this))}.bind(this)}).start(1,0);if(a){var l=$(window).getScroll().y;var g=a.getCoordinates();if(g.top<l){var d=g.top;this.winScroller.start(0,d)}}}document.id("fabrik_repeat_group_"+h+"_counter").value=document.id("fabrik_repeat_group_"+h+"_counter").get("value").toInt()-1;this.repeatGroupMarkers.set(h,this.repeatGroupMarkers.get(h)-1)},hideLastGroup:function(a,c){var b=c.getElement(".fabrikSubGroupElements");b.setStyle("display","none");new Element("div",{"class":"fabrikNotice"}).appendText(Joomla.JText._("COM_FABRIK_NO_REPEAT_GROUP_DATA")).inject(b,"after")},isFirstRepeatSubGroup:function(b){var a=b.getElements(".fabrikSubGroup");return a.length===1&&a[0].getElement(".fabrikNotice")},getSubGroupToClone:function(b){var d=document.id("group"+b);var a=d.getElement(".fabrikSubGroup");if(!a){a=this.subGroups.get(b)}var e=null;var c=false;if(this.duplicatedGroups.has(b)){c=true}if(!c){e=a.cloneNode(true);this.duplicatedGroups.set(b,e)}else{if(!a){e=this.duplicatedGroups.get(b)}else{e=a.cloneNode(true)}}return e},repeatGetChecked:function(b){var a=[];b.getElements(".fabrikinput").each(function(c){if(c.type==="radio"&&c.getProperty("checked")){a.push(c)}});return a},duplicateGroup:function(r){var m,k;Fabrik.fireEvent("fabrik.form.group.duplicate",[this,r]);if(this.result===false){this.result=true;return}if(r){r.stop()}var p=r.target.getParent(".fabrikGroup").id.replace("group","");var f=document.id("group"+p);var u=this.repeatGroupMarkers.get(p);if(u>=this.options.maxRepeat[p]&&this.options.maxRepeat[p]!==0){return}document.id("fabrik_repeat_group_"+p+"_counter").value=document.id("fabrik_repeat_group_"+p+"_counter").get("value").toInt()+1;if(this.isFirstRepeatSubGroup(f)){var q=f.getElements(".fabrikSubGroup");q[0].getElement(".fabrikNotice").dispose();q[0].getElement(".fabrikSubGroupElements").show();this.repeatGroupMarkers.set(p,this.repeatGroupMarkers.get(p)+1);return}var t=this.getSubGroupToClone(p);var w=this.repeatGetChecked(f);f.appendChild(t);w.each(function(c){c.setProperty("checked",true)});var h=[];this.subelementCounter=0;var d=false;var b=t.getElements(".fabrikinput");var n=null;this.formElements.each(function(i){var x=false;m=null;var e=-1;b.each(function(C){d=i.hasSubElements();k=C.getParent(".fabrikSubElementContainer");var B=(d&&k)?k.id:C.id;if(i.options.element===B){n=C;x=true;if(d){e++;m=C.getParent(".fabrikSubElementContainer");C.cloneEvents(document.id(B).getElement("input"))}else{C.cloneEvents(i.element);var D=$A(i.element.id.split("_"));D.splice(D.length-1,1,u);C.id=D.join("_");var A=C.getParent(".fabrikElementContainer").getElement("label");if(A){A.setProperty("for",C.id)}}C.name=C.name.replace("[0]","["+u+"]")}}.bind(this));if(x){if(d&&typeOf(m)!=="null"){var o=$A(i.options.element.split("_"));o.splice(o.length-1,1,u);m.id=o.join("_")}var c=i.options.element;var z=i.unclonableProperties();var y=new CloneObject(i,true,z);y.container=null;y.options.repeatCounter=u;y.origId=c;if(d&&typeOf(m)!=="null"){y.element=document.id(m);y.options.element=m.id;y._getSubElements()}else{y.element=document.id(n.id);y.options.element=n.id}y.reset();h.push(y)}}.bind(this));h.each(function(c){c.cloned(u)});var l={};l[p]=h;this.addElements(l);var s=window.getHeight();var a=$(window).getScroll().y;var j=t.getCoordinates();if(j.bottom>(a+s)){var v=j.bottom-s;this.winScroller.start(0,v)}var g=new Fx.Tween(t,{property:"opacity",duration:500}).set(0);t.fade(1);Fabrik.fireEvent("fabrik.form.group.delete.end",[this,r,p,u]);this.repeatGroupMarkers.set(p,this.repeatGroupMarkers.get(p)+1);this.unwatchGroupButtons();this.watchGroupButtons()},update:function(d){Fabrik.fireEvent("fabrik.form.update",[this,d.data]);if(this.result===false){this.result=true;return}var a=arguments[1]||false;var b=d.data;this.getForm();if(this.form){var c=this.form.getElement("input[name=rowid]");if(c&&b.rowid){c.value=b.rowid}}this.formElements.each(function(f,e){if(typeOf(b[e])==="null"){if(e.substring(e.length-3,e.length)==="_ro"){e=e.substring(0,e.length-3)}}if(typeOf(b[e])==="null"){if(d.id===this.id&&!a){f.update("")}}else{f.update(b[e])}}.bind(this))},reset:function(){this.addedGroups.each(function(a){var c=$(a).findClassUp("fabrikGroup");var b=c.id.replace("group","");$("fabrik_repeat_group_"+b+"_counter").value=$("fabrik_repeat_group_"+b+"_counter").get("value").toInt()-1;a.remove()});this.addedGroups=[];Fabrik.fireEvent("fabrik.form.reset",[this]);if(this.result===false){this.result=true;return}this.formElements.each(function(b,a){b.reset()}.bind(this))},showErrors:function(a){var b=null;if(a.id===this.id){var c=new Hash(a.errors);if(c.getKeys().length>0){if(typeOf(this.form.getElement(".fabrikMainError"))!=="null"){this.form.getElement(".fabrikMainError").set("html",this.options.error);this.form.getElement(".fabrikMainError").removeClass("fabrikHide")}c.each(function(f,g){if(typeOf(document.id(g+"_error"))!=="null"){var h=document.id(g+"_error");var i=new Element("span");for(var d=0;d<f.length;d++){for(var j=0;j<f[d].length;j++){b=new Element("div").appendText(f[d][j]).inject(h)}}}else{fconsole(g+"_error not found (form show errors)")}})}}},appendInfo:function(a){this.formElements.each(function(c,b){if(c.appendInfo){c.appendInfo(a,b)}}.bind(this))},clearForm:function(){this.getForm();if(!this.form){return}this.formElements.each(function(b,a){if(a===this.options.primaryKey){this.form.getElement("input[name=rowid]").value=""}b.update("")}.bind(this));this.form.getElements(".fabrikError").empty();this.form.getElements(".fabrikError").addClass("fabrikHide")},stopEnterSubmitting:function(){var a=this.form.getElements("input.fabrikinput");a.each(function(c,b){c.addEvent("keypress",function(d){if(d.key==="enter"){d.stop();if(a[b+1]){a[b+1].focus()}if(b===a.length-1){this._getButton("submit").focus()}}}.bind(this))}.bind(this))}});