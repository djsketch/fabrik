var FbRadio=new Class({Extends:FbElement,initialize:function(b,a){this.plugin="fabrikradiobutton";this.parent(b,a);this._getSubElements();if(this.options.allowadd===true&&this.options.editable!==false){this.watchAddToggle();this.watchAdd()}},watchAddToggle:function(){var i=this.getContainer();var g=i.getElement("div.addoption");var b=i.getElement(".toggle-addoption");if(this.mySlider){var h=g.clone();var f=i.getElement(".fabrikElement");g.getParent().destroy();f.adopt(h);g=i.getElement("div.addoption");g.setStyle("margin",0)}this.mySlider=new Fx.Slide(g,{duration:500});this.mySlider.hide();b.addEvent("click",function(a){new Event(a).stop();this.mySlider.toggle()}.bind(this))},watchAdd:function(){var a;if(this.options.allowadd===true&&this.options.editable!==false){var d=this.options.element;var b=this.getContainer();b.getElement("input[type=button]").addEvent("click",function(i){var c=b.getElement("input[name=addPicklistLabel]");var f=b.getElement("input[name=addPicklistValue]");var g=c.value;if(f){a=f.value}else{a=g}if(a===""||g===""){alert(Joomla.JText._("PLG_ELEMENT_RADIO_ENTER_VALUE_LABEL"))}else{var h=this.subElements.getLast().findUp("div").clone();h.getElement("input").value=a;var j=h.getElement("input").id.replace(d+"_","").toInt();j++;h.getElement("input").checked="checked";h.getElement("input").id=d+"_"+j;h.getElement("span").set("text",g);h.inject(this.subElements.getLast().findUp("div"));this._getSubElements();e.stop();if(f){f.value=""}c.value="";this.addNewOption(a,g)}}.bind(this))}},getValue:function(){if(!this.options.editable){return this.options.value}var a="";this._getSubElements().each(function(b){if(b.checked){a=b.get("value");return a}return null});return a},setValue:function(a){if(!this.options.editable){return}this._getSubElements().each(function(b){if(b.value===a){b.checked="checked"}})},_getSubElements:function(){if(!this.element){this.subElements=$A([])}else{this.subElements=this.element.getElements("input")}return this.subElements},addNewEvent:function(action,js){if(action==="load"){this.loadEvents.push(js);this.runLoadEvent(js)}else{this._getSubElements();this.subElements.each(function(el){el.addEvent(action,function(e){$type(js)==="function"?js.delay(0):eval(js)})})}},update:function(b){if(!this.options.editable){if(b===""){this.element.innerHTML="";return}this.element.innerHTML=$H(this.options.data).get(b);return}else{var a=this._getSubElements();if(typeOf(b)==="array"){a.each(function(c){if(b.contains(c.value)){c.setProperty("checked","checked")}})}else{a.each(function(c){if(c.value===b){c.setProperty("checked","checked")}})}}},cloned:function(){if(this.options.allowadd===true&&this.options.editable!==false){this.watchAddToggle();this.watchAdd()}}});