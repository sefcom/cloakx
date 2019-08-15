$xhr = {
	_isJsonMIME: /application\/json/,
    // @member of $xhr - send ajax request
    // @param {String} url - request url
	// @param {String} method - "POST" or "GET"
    // @param {Object} params
    // @param {Function} onsuccess - callback
	// @param {Bool} forceJSON - force convert JSON
    _ajax: function(url, params, method, onsuccess, onerror, forceJSON){
        var 	urlencoded = [];
        
		for(var key in params){
			 params.hasOwnProperty(key) && urlencoded.push(key + "=" + encodeURIComponent(params[key]));
        }
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            
			if (xhr.readyState == 4){
                
				if(xhr.status > 199 && xhr.status < 300){
					var 	contentType = xhr.getResponseHeader('Content-Type'),
							response;
							
					if(xhr.responseXML){
						response = xhr.responseXML;
					}else if($xhr._isJsonMIME.test(contentType) && xhr.responseText, forceJSON){
						response = JSON.parse(xhr.responseText);
					}else{
						response = xhr.responseText;
					}
                    onsuccess(response, xhr);
                }else{
					onerror(xhr);
				}
            }else{
				// Load continue
			}
        };

		if(method.toLowerCase() == "post"){
			xhr.open(method, url, true);
			xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=utf-8");
			xhr.send(urlencoded.join("&"));
		}else{
			url += "?" + urlencoded.join("&");
			xhr.open(method, url, true);
			xhr.send(null);
		}
		return xhr;
    },
	post: function(url, params, onsuccess, onerror, resFormat){
		return this._ajax(url, params, 'POST', onsuccess || function(){}, onerror || function(){}, resFormat == 'json');
	},
    get: function(url, params, onsuccess, onerror, resFormat){
        return this._ajax(url, params, 'GET', onsuccess || function(){}, onerror || function(){}, resFormat == 'json');
    }
}
//////////////////////////////////////////////////////////
function $chain(callback) {
	var 	_queue = [];
	
	function _next(arg1) {
		var cb = _queue.shift();
		cb && cb(_next,arg1);
	}
 	setTimeout(_next, 0);
	var then = function(cb) {
		_queue.push(cb);
		return { 
			then: then
		};
	}
	
 	return then(callback);
}
//////////////////////////////////////////////////////////



// namespace `$m` for some helpers methods
var $m = {
	// function for inheritance opportunity
	// @param {Function} - modifiable constructor
	// @param {Function} - base constructor
	// @param {object} - custom object properties
	inherit: function(Constructor, Base, extendProperties){
		var buf = Constructor.prototype;
		
		Constructor.prototype = Object.create(Base.prototype, extendProperties);
		Constructor.prototype._base = Base;
		this.extend(Constructor.prototype, buf);
		
		return Constructor;
	},

	// @memberOf $m - Detect if argument is instance of Function
	// @param {Object} obj
	// @return {Bool} - true if obj is a function
	isFunction: function(obj){
		return this.instance(obj)==='[object Function]'; 
	},
	// @memberOf $m - get type of argument
	// @return {Object} obj
	// @return {String}
	instance: function(obj){
		return Object.prototype.toString.call(obj);
	},
	isNumber: function(obj){
		return this.instance(obj)==='[object Number]'; 
	},
	isString: function(obj){
		return this.instance(obj) === '[object String]';
	},
	isRegExp: function(obj){
		return this.instance(obj) === '[object RegExp]'; 
	},
	isBoolean: function(obj){
		return this.instance(obj) === '[object Boolean]'; 
	},
	isObject: function(o){
		return o === Object(o);
	},
	// @memberOf $m - check if Object Empty
	// @param {Object} o
	// @return {Bool}
	isEmpty: function(o){
		if(!this.isObject(o)){
			return false;
		}

		for(var i in o){
		  if(o.hasOwnProperty(i)) return false;
		}

		return true;
	},
	defined: function(o){
		return typeof o != "undefined";
	},
	// @memberOf $m - implementation of undescore _.extend method by es5 methods
	// @param {Object} target
	// @param {Object} source
	extend: function (target, source) {
		Object.
			getOwnPropertyNames(source).
			forEach(function(propKey) {
				var desc = Object.getOwnPropertyDescriptor(source, propKey);
				Object.defineProperty(target, propKey, desc);
			});
		return target;
	}
};

// Plain Model Constructor
// @param {Object} defaultAttr
var BaseModel = function(defaultAttr){
	this.attr = {} || defaultAttr;
	this.onchange = {};
};
BaseModel.prototype = {
	// @memberOf {BaseModel} - set value to model attribute (can be like 'user.group.id')
	// @param {String} name 
	// @param {*} value
	// @param {Bool} preventDefault
	set: function(name, value, preventDefault){
		var prev;
	
		if(~name.indexOf('.')){
			var 	parts = name.split('.'),
					root,
					len = parts.length,
					seg = parts[0];
					
			if(this.attr[seg] == undefined){
				this.attr[seg] = {};
			}
			root = this.attr[seg];
					
			if(len > 1){
				for(var i = 1; seg = parts[i], i < len - 1; i++){
					if(!root[seg]){
						root[seg] = {};
					}
					root = root[seg];
				}
			}
			prev = root[seg];
			root[seg] = value;
			
		}else{
			prev = this.attr[name];
			this.attr[name] = value;
		}
		
		if(!preventDefault && Array.isArray(this.onchange[name])){
			for(var i = 0, len = this.onchange[name].length; i < len; i++){
				this.onchange[name][i](value, this, name, prev);
			}
		}
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
	// @memberOf {BaseModel}
	destroy: function(){
		for(var key in this.onchange){
			if(this.onchange.hasOwnProperty(key)){
				this.off(key);
			}
		}
	},
	// @memberOf {BaseModel} - attach callback on change
	on: function(name, cb){
		if(!Array.isArray(this.onchange[name])){
			this.onchange[name] = [];
		}
		this.onchange[name].push(cb);
	},
	// @memberOf {BaseModel} - deattach event
	off: function(name, cb){
		if(Array.isArray(this.onchange[name])){
			if(cb){
				var pos = this.onchange[name].indexOf(cb);
				this.onchange[name].splice(pos, 1);
			}else{
				this.onchange[name].length = 0;
			}
		}
	}
};

var LocalStorageModel = function(storageName, defaultAttr){
	this._base.call(this);
	this.storageName = storageName;
	this.restoreData();
}
LocalStorageModel.prototype = {
	set: function(name, value, preventDefault){
		this._base.prototype.set.call(this, name, value, preventDefault);
		preventDefault || this.saveData();
	},
	saveData: function(){
		window.localStorage[this.storageName] = JSON.stringify(this.attr);
	},
	restoreData: function(){
		var dataStr = window.localStorage[this.storageName];
		
		if(dataStr){
			this.attr = JSON.parse(dataStr);
		}
	},
	defined: function(property){
		return this.attr[property] != undefined;
	}
}
$m.inherit(LocalStorageModel, BaseModel);
