//
// ontheflyDOM.js by Oleksii Starov -- 02/25/2018
//

var MASKING_DOM_ENABLED = true;

// Though, we also safe on the HTML element:
// this["onthefly_real_id"] and this["onthefly_real_className"]
//var global_map_to_random = {};
//var global_map_from_random = {};

// To log DOM queries made
function logQuery(query, obj) {
    console.log("> Query - " + query);
}

// To log DOM injections
function logInjection(data, obj) {
    console.log("> Injection - " + data);
}

// To get new random identifier
function generateRandomToken() {
    console.log("Generate random token.");
    return "onthefly_" + Math.random().toString(36).substring(2, 15);
}

// To mask IDs in queries
function getMaskingID(originalId) {
    var res = global_map_to_random["#" + originalId];
    if (res == undefined) return originalId;
    return res;
}

// To mask Class names in queries
function getMaskingClass(originalId) {
    var res = global_map_to_random["." + originalId];
    if (res == undefined) return originalId;
    return res;
}

// Processing CSS query
function maskCSSQuery(selector) {
    // TODO: complex class names like ".sticky-note sticky-just-created sticky-color-yellow"
    // TODO: wildcards like '*'
    try {
        var res = "";
        // TODO: validate the method!
        var subselectors = selector.split(" ");
        for (var i = 0 ; i < subselectors.length; ++i) {
            var tokens = subselectors[i].split(/(?=\.)|(?=#)|(?=\[)|(?=,)/);
            for (var j = 0 ; j < tokens.length; ++j) {
                if (tokens[j][0] == "#") {
                    res += "#" + getMaskingID(tokens[j].slice(1));
                }
                else if (tokens[j][0] == ".") {
                    res += "." + getMaskingClass(tokens[j].slice(1));
                }
                else {
                    res += tokens[j];
                }
            }
            res += " ";
        }
        return res;
    }
    catch(err) {
        console.log(err);
        return null;
    }
}

// Patching new node element
function processNewNode(node) {
    // We might not need this anymore!!!
    return;

    var attributes = [{"id": "id", "key": "#"}, {"id": "className", "key": "."}];
    // Iterating over the attributes
    attributes.forEach(function(attr) { 
        var id = attr.id;
        var key = attr.key;
        
        // Patching only new node elements - they already can be masked!
        // ID can be present, ID can be masked, ID can be original...
        if (node[id] && !node["onthefly_real_" + id]) {
            var original_id = node[id];

            // The same class can appear several times!
            var random_id = global_map_to_random[key + original_id];
            if (random_id == undefined) random_id = generateRandomToken();
            
            global_map_to_random[key + original_id] = random_id;
            global_map_from_random[key + random_id] = original_id;
            node[id] = random_id; 

            node["onthefly_real_" + id] = original_id;
        }
    });
}

function overrideQueries(obj) {
    // 1 - getElementById (document only)
    if (obj.getElementById !== undefined) {
        obj.dd_getElementById = obj.getElementById;
        obj.getElementById = function(elemId) {
            logQuery("getElementById: " + elemId, this);

            // Masking
            elemId = getMaskingID(elemId);

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

            // Masking
            lassName = getMaskingClass(className);

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

            // Masking
            var new_selector = maskCSSQuery(selector);
            if (new_selector != null) {
                selector = new_selector;
            }

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

            var new_selector = maskCSSQuery(selector);
            if (new_selector != null) {
                selector = new_selector;
            }

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

    var htmlelement_apis = ["innerHTML"];   // We do not care about the innerText for now
    for (i = 0; i < htmlelement_apis.length; ++i) {
        var api = htmlelement_apis[i];
        var getter = HTMLElement.prototype.__lookupGetter__(api);
        var prev = HTMLElement.prototype.__lookupSetter__(api);     // Note, no [api] for some properties 
        (function(api, prev) {
            HTMLElement.prototype.__defineSetter__(api, function (val) {
                logInjection(api + ": " + val.substr(0,100), this);

                var container = document.createElement("div");
                prev.apply(container, [val]);
                //console.log(container);

                // First: change the DOMString
                var items_with_id = container.dd_querySelectorAll("*[id]");
                for (var i = 0; i < items_with_id.length; ++i) {
                    var node = items_with_id[i];

                    // NEW-NEW!!!
                    if (!(node instanceof HTMLElement)) {
                        console.log("!!! Not a HTMLElement: " + node);
                        continue;
                    }


                    if (global_map_from_random["#" + node.id] == undefined) {

                        var original_id = node.id;
                        console.log(">>> " + original_id);
                        var random_id = global_map_to_random["#" + original_id];
                        if (random_id == undefined) random_id = generateRandomToken();
                        global_map_to_random["#" + original_id] = random_id;
                        global_map_from_random["#" + random_id] = original_id;
                        node.prev_setAttribute("id", random_id);
                    }
                }

                var items_with_class = container.dd_querySelectorAll("*[class]");
                for (var i = 0; i < items_with_class.length; ++i) {
                    var node = items_with_class[i];

                    // NEW-NEW!!!
                    if (!(node instanceof HTMLElement)) {
                        continue;
                    }

                    if (global_map_from_random["." + node.className] == undefined) {
                        var original_class = node.className;
                        var random_class = global_map_to_random["." + original_class];
                        if (random_class == undefined) random_class = generateRandomToken();
                        global_map_to_random["." + original_class] = random_class;
                        global_map_from_random["." + random_class] = original_class;
                        node.prev_setAttribute("class", random_class); 
                    }
                }

                //console.log(container);

                // Second: get the resulting nodes
                var res = prev.apply(this, [getter.call(container)]);
                
                // Third: process the resulting nodes
                var items_with_id = this.dd_querySelectorAll("*[id]");
                for (var i = 0; i < items_with_id.length; ++i) {
                    var node = items_with_id[i];
                    // NEW-NEW!!!
                    if (!(node instanceof HTMLElement)) {
                        continue;
                    }
                    var random_id = node.prev_getAttribute("id");
                    // Just set the proper onthefly_real_id
                    node["onthefly_real_id"] = global_map_from_random["#" + random_id];
                }

                var items_with_class = this.dd_querySelectorAll("*[class]");
                for (var i = 0; i < items_with_class.length; ++i) {
                    var node = items_with_class[i];
                    // NEW-NEW!!!
                    if (!(node instanceof HTMLElement)) {
                        continue;
                    }
                    var random_class = node.prev_getAttribute("class");
                    // Just set the proper onthefly_real_className
                    node["onthefly_real_className"] = global_map_from_random["." + random_class];
                }

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
            logInjection("appendChild: " + arguments[0].outerHTML.substr(0,100), this);
            var node = arguments[0];

            // Processing only the top node!
            processNewNode(node);
            
            var result = prev_appendChild.apply(this, arguments);
            return result;
        };
    });

    var prev_append = HTMLElement.prototype.append;                 // And this is a normal function
    HTMLElement.prototype.__defineGetter__("append", function () {
        return function() {

            for (var i = 0; i < arguments.length; ++i) {
                if (typeof arguments[i] == 'string' || arguments[i] instanceof String) {
                    // We do not care about the text nodes
                }
                else {
                    logInjection("append: " + arguments[i].outerHTML.substr(0,100), this);
                    var node = arguments[i];
                    processNewNode(node);
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
            // Similar patching...
            if (arguments[0] == "id" || arguments[0] == "class") {
                var original_id = arguments[1];
                var key = (arguments[0] == "id") ? "#" : ".";
                var id = (arguments[0] == "id") ? "id" : "className";

                var random_id = global_map_to_random[key + original_id];
                if (random_id != undefined) {
                    return prev_getAttribute.apply(this, [id, random_id]);
                }
            }

            var result = prev_getAttribute.apply(this, arguments);
            return result;
        };
    });

    var prev_setAttribute = HTMLElement.prototype.setAttribute;       // And this is a normal function
    HTMLElement.prototype.prev_setAttribute = prev_setAttribute;
    HTMLElement.prototype.__defineGetter__("setAttribute", function () {
        return function() {
            // Similar patching...
            if (arguments[0] == "id" || arguments[0] == "class") {
                //console.log("YES!!!");
                var original_id = arguments[1];
                var key = (arguments[0] == "id") ? "#" : ".";
                var id = (arguments[0] == "id") ? "id" : "class";

                if (!this["onthefly_real_" + id]) {
                    var random_id = global_map_to_random[key + original_id];
                    if (random_id == undefined) random_id = generateRandomToken();
                    global_map_to_random[key + original_id] = random_id;
                    global_map_from_random[key + random_id] = original_id;
                    this["onthefly_real_" + id] = original_id;
                    // We need to add to the DOM!
                    var result = prev_setAttribute.apply(this, [id, random_id]);
                    return result;
                }
                else {
                    // Should be already patched...
                    if (id == "class") id = "className";
                    this[id] = arguments[1];
                }

                return;
            }
            else {
                var result = prev_setAttribute.apply(this, arguments);
                return result;
            }
        };
    });

    // Globally masked properties

    Object.defineProperty(HTMLElement.prototype, "id", {
        get() { 
            if (this["onthefly_real_id"] != undefined) return this["onthefly_real_id"];
            return this.prev_getAttribute("id"); 
        },
        set(newValue) { 
            var prev_original_id = this["onthefly_real_id"];
            if (prev_original_id != undefined) {
                var random_id = global_map_to_random["#" + prev_original_id];
                global_map_from_random["#" + random_id] = newValue;
                global_map_to_random["#" + newValue] = random_id;
                delete global_map_to_random["#" + prev_original_id];
                this["onthefly_real_id"] = newValue;
            } else {
                //var random_id = generateRandomToken();
                //global_map_from_random["#" + random_id] = newValue;
                //global_map_to_random["#" + newValue] = random_id;
                //this["onthefly_real_id"] = newValue;
                this.setAttribute("id", newValue);
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(HTMLElement.prototype, "className", {
        get() { 
            if (this["onthefly_real_className"] != undefined) return this["onthefly_real_className"];
            return this.prev_getAttribute("class"); 
        },
        set(newValue) { 
            var prev_original_id = this["onthefly_real_className"];
            if (prev_original_id != undefined) {
                var random_id = global_map_to_random["." + prev_original_id];
                global_map_from_random["." + random_id] = newValue;
                global_map_to_random["." + newValue] = random_id;
                delete global_map_to_random["." + prev_original_id];
                this["onthefly_real_className"] = newValue;
            } else {
                //var random_id = generateRandomToken();
                //global_map_from_random["." + random_id] = newValue;
                //global_map_to_random["." + newValue] = random_id;
                //this["onthefly_real_className"] = newValue;
                this.setAttribute("class", newValue);
            }
        },
        enumerable: true,
        configurable: true
    });
    

}


// Overriding
overrideQueries(document);                  // Querries via 'document' object
overrideQueries(HTMLElement.prototype);     // Querries from HTML elements
overrideInjections();                       // From HTML elements only











