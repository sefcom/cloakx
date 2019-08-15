//
// ontheflyDOM.js by Oleksii Starov -- 02/25/2018
//

var all_dom_interactions = "";

function printDomLog() {
	console.log(all_dom_interactions);
}


// To log DOM queries made
function logQuery(query, obj) {
    //console.log("> Query - " + query);
    all_dom_interactions += "> Query - " + query + "\n";
}

// To log DOM injections
function logInjection(data, obj) {
    //console.log("> Injection - " + data);
    all_dom_interactions += "> Injection - " + data + "\n";;
}

function overrideQueries(obj) {
    // 1 - getElementById (document only)
    if (obj.getElementById !== undefined) {
        obj.dd_getElementById = obj.getElementById;
        obj.getElementById = function(elemId) {
            logQuery("getElementById: " + elemId, this);
            var result = this.dd_getElementById(elemId);
            return result;
        };
        obj.getElementById.toString = function() { 
            return "getElementById() { [native code] }" 
        }
    } 

    // 2 - getElementsByName (document only)
    if (obj.getElementsByName !== undefined) {
        obj.dd_getElementsByName = obj.getElementsByName;
        obj.getElementsByName = function(elemName) {
            // Only recording...
            logQuery("getElementsByName: " + elemName, this);
            var result = this.dd_getElementsByName(elemName);
            return result;
        };
        obj.getElementsByName.toString = function() { 
            return "getElementsByName() { [native code] }" 
        }
    } 

    // 3 - getElementsByTagName (document/node)
    if (obj.getElementsByTagName !== undefined) {
        obj.dd_getElementsByTagName = obj.getElementsByTagName;
        obj.getElementsByTagName = function(tagName) {
            // Only recording...
            logQuery("getElementsByTagName: " + tagName, this);
            var result = this.dd_getElementsByTagName(tagName);
            return result;
        };
        obj.getElementsByTagName.toString = function() { 
            return "getElementsByTagName() { [native code] }" 
        }
    } 
        
    // 4 - getElementsByClassName (document/node)
    if (obj.getElementsByClassName !== undefined) {
        obj.dd_getElementsByClassName = obj.getElementsByClassName;
        obj.getElementsByClassName = function(className) {
            logQuery("getElementsByClassName: " + className, this);
            var result = this.dd_getElementsByClassName(className);
            return result;
        };
        obj.getElementsByClassName.toString = function() { 
            return "getElementsByClassName() { [native code] }" 
        }
    } 

    // 5 - querySelector (document/node)
    if (obj.querySelector !== undefined) {
        obj.dd_querySelector = obj.querySelector;
        obj.querySelector = function(selector) {
            logQuery("querySelector: " + selector, this);
            var result = this.dd_querySelector(selector);
            return result;
        };
        obj.querySelector.toString = function() { 
            return "querySelector() { [native code] }" 
        }
    }
        
    // 6 - querySelectorAll (document/node)
    if (obj.querySelectorAll !== undefined) {
        obj.dd_querySelectorAll = obj.querySelectorAll;
        obj.querySelectorAll = function(selector) {
            logQuery("querySelectorAll: " + selector, this);
            var result = this.dd_querySelectorAll(selector);
            return result;
        };
        obj.querySelectorAll.toString = function() { 
            return "querySelectorAll() { [native code] }" 
        }
    } 
    
    // 7 - getElementsByTagNameNS (document/node)
    if (obj.getElementsByTagNameNS !== undefined) {
        obj.dd_getElementsByTagNameNS = obj.getElementsByTagNameNS;
        obj.getElementsByTagNameNS = function(ns, tagName) {
            // Only recording...
            logQuery("getElementsByTagNameNS: " + ns + "-" + tagName, this);
            var result = document.dd_getElementsByTagNameNS(ns, tagName);
            return result;
        };
        obj.getElementsByTagNameNS.toString = function() { 
            return "getElementsByTagNameNS() { [native code] }" 
        }
    } 
        
    // 8 - evaluate (document/node)
    if (obj.evaluate !== undefined) {
        obj.dd_evaluate = obj.evaluate;
        obj.evaluate = function(xpath, context, resolver, type, result) {
            // TODO: parse XPath selectors!
            // Only recording...
            logQuery("evaluate: " + xpath);
            var result = this.dd_evaluate(xpath, context, resolver, type, result);
            return result;
        };
        obj.evaluate.toString = function() { 
            return "getElementsByTagNameNS() { [native code] }" 
        }
    } 
}

function overrideInjections() {
    // Note: we do not care about document.write

    var htmlelement_apis = ["innerHTML", "innerText"];   // We do not care about the innerText for now
    for (i = 0; i < htmlelement_apis.length; ++i) {
        var api = htmlelement_apis[i];
        var getter = HTMLElement.prototype.__lookupGetter__(api);
        var prev = HTMLElement.prototype.__lookupSetter__(api);     // Note, no [api] for some properties 
        (function(api, prev) {
            HTMLElement.prototype.__defineSetter__(api, function (val) {
                logInjection(api + ": " + val, this);
                var res = prev.apply(this, arguments);
                return res;
            });

            HTMLElement.prototype.__defineGetter__(api, function () {
                // TODO: potentially, we should mask here as well!
                return getter.call(this);
            });

        })(api, prev);


    }

    var prev_appendChild = HTMLElement.prototype.appendChild;       // And this is a normal function
    HTMLElement.prototype.__defineGetter__("appendChild", function () {
        return function() {
            logInjection("appendChild: " + arguments[0].outerHTML, this);
            var result = prev_appendChild.apply(this, arguments);
            return result;
        };
    });

    var prev_append = HTMLElement.prototype.append;                 // And this is a normal function
    HTMLElement.prototype.__defineGetter__("append", function () {
        return function() {

            for (var i = 0; i < arguments.length; ++i) {
                if (typeof arguments[i] == 'string' || arguments[i] instanceof String) {
                    logInjection("append: " + arguments[i], this);
                }
                else {
                    logInjection("append: " + arguments[i].outerHTML, this);
                }
            }
            
            var result = prev_append.apply(this, arguments);
            return result;
        };
    });

    var prev_getAttribute = HTMLElement.prototype.getAttribute;     // And this is a normal function
    HTMLElement.prototype.prev_getAttribute = prev_getAttribute;
    HTMLElement.prototype.__defineGetter__("getAttribute", function () {
        return function() {
            logQuery("getAttribute: " + arguments[0], this);
            var result = prev_getAttribute.apply(this, arguments);
            return result;
        };
    });

    var prev_setAttribute = HTMLElement.prototype.setAttribute;       // And this is a normal function
    HTMLElement.prototype.prev_setAttribute = prev_setAttribute;
    HTMLElement.prototype.__defineGetter__("setAttribute", function () {
        return function() {
            logInjection("setAttribute: " + arguments[0], this);
            var result = prev_setAttribute.apply(this, arguments);
            return result;
        };
    });

    // Globally masked properties

    Object.defineProperty(HTMLElement.prototype, "id", {
        get() { 
            var res = this.getAttribute("id");
            return res; 
        },
        set(newValue) { 
            this.setAttribute("id", newValue);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(HTMLElement.prototype, "className", {
        get() { 
            var res = this.prev_getAttribute("class");
            return res; 
        },
        set(newValue) { 
            this.setAttribute("class", newValue);
        },
        enumerable: true,
        configurable: true
    });
    

}


// Overriding
overrideQueries(document);                  // Querries via 'document' object
overrideQueries(HTMLElement.prototype);     // Querries from HTML elements
overrideInjections();                       // From HTML elements only











