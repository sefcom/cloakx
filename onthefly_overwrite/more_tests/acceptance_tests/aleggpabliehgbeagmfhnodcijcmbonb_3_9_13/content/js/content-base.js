// DOM helpers
var $4 = {
    // Get html element by id
	// @param {String} id
	// @return {HTMLElement} 
	id: function(id){
		return document.getElementById(id);
	},
    // slector api
	// @param {Node} node
	// @param {String} selector -ccss selector
	// @param {Bool} getAll - get all results or first related
	// @return {NodeList|Node}
	select: function(selector, getAll, node){
		return (node || document)[getAll ? "querySelectorAll" : "querySelector"](selector);
	},
	parentByTag: function(node, tagName){
		tagName = tagName.toUpperCase();
		var currentNode = node;
		
		while(currentNode.tagName != tagName && currentNode != document.body){
			currentNode = currentNode.parentNode;
		}
		
		return currentNode;
	},
	// @param {string} text
	// @return {TextNode}
	t: function(text){
		return document.createTextNode(text);
	},
	// Create new HTML Element with options
	// @param {_} - First is Tag name <) console.dir($4.cr("option","value","email","textContent","Hello")); 
	// @return {HTMLElement}
	cr: function(){
		if(!arguments[0]){
			return false;
		}
		var EL = document.createElement(arguments[0]);
		for(var i = 1, m = arguments.length; i < m; i += 2){
			arguments[i] && arguments[i + 1] && (EL[arguments[i]] = arguments[i + 1]);
		}
		return EL;
	},
	// Prepend node
	// @param {Node} parent
	// @param {Node} node
	prepend: function(parent, node){
		if(parent.firstChild){
			parent.insertBefore(node, parent.firstChild);
		}else{
			parent.appendChild(node);
		}
	},
	// @return {Bool} true if node is child Of rootNode
	isChildOf: function(node, rootNode){
		var 	currentNode = node;
		
		while(currentNode != rootNode && currentNode != document.body){
			currentNode = currentNode.parentNode;
		}
		
		return currentNode != document.body;
	},
	removeNode: function(node){
		node && node.parentNode.removeChild(node);
	},
    removeNodes: function(nodeList){
		var len = nodeList.length;
		
		while(len--){
			this.removeNode(nodeList[len]);
		}
	},
    emptyNode: function(node){
		var childNodes = node.childNodes;
		for(i = childNodes.length; i--;){
			node.removeChild(childNodes[i]);
		}
	},
};

var _global = {
	prevent: function(e){
		e.preventDefault();
		e.stopPropagation();
	},
	getDOMstring: function(target){
		// TODO refctor this code:
		var DOMstring = "";
		var parentTaregtNode = target.parentNode;
        
		var chlsNumber = 0;
		for(var i = 0; i < parentTaregtNode.children.length; i++){
			if(parentTaregtNode.children[i] == target){
				chlsNumber = i;
				break;
			}
		}
		
		var actualChildElemetsCount = 0;
        for(var i = 0, child; child = parentTaregtNode.children[i], i < parentTaregtNode.children.length; i++){
			if(!child.getAttribute("flashnode")){
				actualChildElemetsCount++;
			}				
		}
		
		DOMstring += "[" + actualChildElemetsCount + "]" + "[" + "]" + "[" + "]" + "[" + chlsNumber + "]";
		var childNumber = 0;
		var toIdent = target;
		while(parentTaregtNode.tagName != "BODY"){
			// Would be better
			// for(var i=0; i<parentTaregtNode.children.length; i++){
			// 	if(parentTaregtNode.children[i] == toIdent){
			// 		childNumber = childNumber + i;
			// 		break;
			// 	}
			// }
			DOMstring += parentTaregtNode.tagName + "&" + parentTaregtNode.className + "%" + childNumber + "%";
			toIdent = parentTaregtNode;
			parentTaregtNode = parentTaregtNode.parentNode;
			if(target.tagName == "OBJECT" || target.tagName == "EMBED"){
				break;
			}
		}
		return DOMstring;
	}
};

var $m = {
	// @memberOf $m - deep clone of object
	// @param {Object} o - origin object
	// @param {Bool} notUseRecursion
	// @return {Object} c
	clone: function(o, notUseRecursion) {// Out of the memory in IE8
		if(!o || 'object' !== typeof o){
			return o;
		}
		
		var     c = 'function' === typeof o.pop ? [] : {},
				p, 
				v;
				
		for(p in o) {
			if(o.hasOwnProperty(p)) {
			//if (Object.prototype.hasOwnProperty.call(o,p)){ // for IE8
				v = o[p];
				c[p] = (v && 'object' === typeof(v) && !notUseRecursion) ? this.clone(v) : v;
			}
		} 
		return c;
	}    
};

// Default Model Constructor
var BaseModel = function(initObj){
	this.attr = initObj || {};
	this.onchange = {};
};
BaseModel.prototype = {
	// @memberOf {BaseModel} - set value to model attribute without event triggering
	// @param {String} name (can be like 'user.group.id')
	// @param {*} value
	set: function(name, value){
		var prev;
	
		if(~name.indexOf('.')){
			var 	parts = name.split('.'),
					root = this.attr,
					len = parts.length,
					seg;
					
			for(var i = 0; seg = parts[i], i < len - 1; i++){
				
				if(!root[seg]){
					root[seg] = {};
				}
				root = root[seg];
			}
			prev = root[seg];
			root[seg] = value;
		}else{
			prev = this.attr[name];
			this.attr[name] = value;
		}
	},
	// @memberOf {BaseModel} - set value to model attribute with event triggering
	// @param {String} name (can be like 'user.group.id')
	// @param {*} value
	change: function(name, value){
		var 	root = this.attr,
				seg = name,
				prev = this.attr[name],
				eventStack = [];
	
		if(~name.indexOf('.')){
			var 	parts = name.split('.'),
					len = parts.length;
					
			name = '';		
			for(var i = 0; seg = parts[i], i < len - 1; i++){
				
				if(!root[seg]){
					root[seg] = {};
				}
				root = root[seg];
				name += (i ? '.' : '') + seg;
				//console.log('Prev key: `%s`', name);
				if(this.onchange[name]){
					eventStack.push(name);
				}
			}
			//console.log('Final seg %s', seg);
			prev = root[seg];
			root[seg] = value;
			//console.dir(this.attr);
			name += '.' + seg;
		}else{
			//prev = root[seg];
			root[seg] = value;
        }
		
		// console.log('Prev key: `%s`', name);
		if(this.onchange[name]){
			eventStack.push(name);
		}
		
		var 	evIndex = eventStack.length,
				callbackRes;
		
		if(evIndex){
			while(evIndex--){
				//console.log('Ev #%s %s', evIndex, eventStack[evIndex]);
				
				if(this._executeEvent(eventStack[evIndex], name, value, prev)){ // if callback return true - stop propagation
					break;
				}
			}
		}
	},
	// @memberOf {BaseModel} - execute event callbacks
	// @param {String} name - event name
	// @param {String} property - modify property
	// @param {String} value - new value
	// @param {String} prev - previous value
	// @return {Bool} - if true - stop event propagation
	_executeEvent: function(name, property, value, prev, operation){
		if(Array.isArray(this.onchange[name])){
			for(var i = 0, len = this.onchange[name].length; i < len; i++){
				if(this.onchange[name][i](value, property, this, prev, operation)){
					return true;
				}
			}
		}
		return false;
	},
	// @memberOf {BaseModel}
	// @param {String} name,
	get: function(name){
		if(~name.indexOf('.')){
			var 	names = name.split("."),
					i = -1, 
					len = names.length, 
					ref = this.attr;
					
			while(i++, i < len){
				ref = ref[names[i]];
				if(ref == undefined){
					break;
				} 
			}
			return ref;
		}else{
			return this.attr[name];
		}
	},
	// @memberOf {BaseModel} - remove all event listeners
	destroy: function(){
		for(var key in this.onchange){
			if(this.onchange.hasOwnProperty(key)){
				this.off(key);
			}
		}
	},
	// @memberOf {BaseModel} - attach callback on change
	// @param {String} name - property of model
	// @param {Function} cb - callback
	on: function(name, cb){
		if(!Array.isArray(this.onchange[name])){
			this.onchange[name] = [];
		}
		this.onchange[name].push(cb);
	},
	// @memberOf {BaseModel} - deattach event
	// @param {String} name - property of model
	// @param {Function} cb - callback
	off: function(name, cb){
		if(Array.isArray(this.onchange[name])){
			if(cb){
				var pos = this.onchange[name].indexOf(cb);
				this.onchange[name].splice(pos, 1);
			}else{
				this.onchange[name].length = 0;
			}
		}
	},
	// @return {Object} - represent model data
	toJSON: function(){
		return $m.clone(this.attr);
	},
	list: function(name, operation, value){
		//console.log('\tCALL push %s', name);
		// TODO use code of change()
		var 	prev,
				seg = name,
				res,
				root = this.attr,
				eventStack = [];
		if(~name.indexOf('.')){
			var 	parts = name.split('.'),
					len = parts.length;
			name = '';		
			for(var i = 0; seg = parts[i], i < len - 1; i++){
				//console.log('\tSEG `%s`', seg);
				if(!root[seg]){
					root[seg] = {};
				}
				root = root[seg];
				name += (i ? '.' : '') + seg;
				//console.log('Prev key: `%s`', name);
				if(this.onchange[name]){
					eventStack.push(name);
				}
			}
			//console.log('Final seg %s', seg);
			name += '.' + seg;
		}
		prev = root[seg];
		
		if(Array.isArray(prev)){
			switch(operation){
				case 'push': res = prev.push(value); break; // ret new length
				case 'del': res = prev.splice(value, 1); break; // remove by index, return array with removed
				case 'pop':  res = prev.pop(); break; // remove last return last
				case 'shift': res = prev.shift(); break; //remove first, return first
				case 'removeAll': // value - cb(item, index)
					var index = prev.length;
					while(index--){
						value(prev[index], index) && prev.splice(index, 1);
					}
					res = prev;
				break;
			}
		}else{
			root[seg] = value; // Maybe create new array
		}
		// console.log('\t Final name: `%s`', name);
		if(this.onchange[name]){
			eventStack.push(name);
		}
		
		var 	evIndex = eventStack.length,
				callbackRes;
		if(evIndex){ // can work without this statement
			while(evIndex--){
				if(this._executeEvent(eventStack[evIndex], name, value, prev, operation)){ // if callback return true - stop propagation
					break;
				}
			}
		}
		return res;
	}
};