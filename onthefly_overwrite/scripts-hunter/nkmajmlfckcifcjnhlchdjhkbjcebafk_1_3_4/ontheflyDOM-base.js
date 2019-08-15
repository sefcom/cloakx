//
// ontheflyDOM.js by Oleksii Starov -- 10/20/2015
//
var PREFIX = "dd_ext_";
var MAX_NUM = 101;

// To track created on queries DOM nodes
function assignIdentifier(new_node) {
    var ind = document.dd_number;
    document.dd_number = ind + 1;
    new_node.setAttribute(PREFIX + "index", String(ind));
    var log = encodeURIComponent(new_node.outerHTML)
    document.body.setAttribute(PREFIX + "created" + Math.random() + "_" + (new Date().getTime()), log);
}

// To log DOM queries made
function logQuery(query, obj) {
    if (obj === document) {
        document.body.setAttribute(PREFIX + "query" + Math.random() + "_" + (new Date().getTime()), encodeURIComponent(query));
    }
    else {
        document.body.setAttribute(PREFIX + "ms-query" + Math.random() + "_" + (new Date().getTime()), encodeURIComponent(query));
    }
}

// To support queries on each object
function retrieveParent(obj) {    
    if (obj === document) {
        return document.body;
    }
    return obj;
}

// Parses the last tag in CSS query
function parseCSSQuery(selector) {
    // Eleminate repeated spaces
    selector = selector.replace(/ +(?= )/g, '');
    // Separate tokens
    var tokens = selector.split(/[\s,>+~]/);
    var tag = tokens[tokens.length-1];
    var re = /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/;
    var m;
    if ((m = re.exec(tag)) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        return m[0];
    }
    // by default
    return "div";
}

// Create a token from CSS query
function createSingleCSSElement(token) {
    // Regex for attributes used by Sizzle
    // http://www.w3.org/TR/css3-selectors/#whitespace
	var whitespace = "[\\x20\\t\\r\\n\\f]";
	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	var identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+";
	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	var attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]";
    var re = new RegExp(attributes);
    
    // Separating just name
    var cl, id;
    var name = token;
    if (name.indexOf(":") !== -1) name = name.slice(0, name.indexOf(":"));
    if (name.indexOf("[") !== -1) name = name.slice(0, name.indexOf("["));
    // has an id
    if (name.indexOf("#") > -1) {
        var tmp = name.split("#");
        name = tmp[0];
        id = tmp[1];
    }
    // has a class
    if (name.indexOf(".") > -1) {
        var tmp = name.split(".");
        name = tmp[0];
        cl = tmp[1];
    }   
    if (name.length == 0) name = "div";
    
    new_node = document.createElement(name);
    
    if (cl !== undefined) new_node.setAttribute("class", cl);
    if (id !== undefined) new_node.setAttribute("id", id);
    
    // Process attributes
    var m;
    if ((m = re.exec(token)) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        if (m[1] !== undefined) {
            // has an attribute
            // We do not care about exact comparison
            var nval = m[3];
            if (m[4] !== undefined) nval = m[4];
            if (m[5] !== undefined) nval = m[5];
            
            if (nval !== undefined) {
                // has value
                new_node.setAttribute(m[1], nval);
            }
            else {
                new_node.setAttribute(m[1], "any");
            }
        }
    }
    
    // TODO: :nth-child(2), :only-child, :not, etc.
    
    assignIdentifier(new_node);
    overrideQueries(new_node);
    return new_node;
}

// Attempts to recreate full hierarchy of CSS query
function processCSSQuery(selector, initialParent) {
    try {
        // Eleminate repeated spaces
        selector = selector.replace(/ +(?= )/g, '');
        // Retrieve tokens and relations-ops
        var relations = [' ', '>', '+', '~', ',']
        var tokens = [];
        var ops = [];
        var str = ''
        var brackets = false;
        // just a simple loop
        for (var i = selector.length-1; i >= 0; --i) {
            var ch = selector.charAt(i);
            if (ch === ']') brackets = true;
            if (ch === '[') brackets = false;
            if (relations.indexOf(ch) > -1 && !(ch === "~" && brackets)) {
                tokens.push(str);
                str = '';
                if (',' === ch) {
                    // We'll consider only last part
                    break;
                }
                if (' ' === ch && i-1 >= 0 &&
                    relations.indexOf(selector.charAt(i-1)) > -1) {
                    ops.push(selector.charAt(i-1));
                    i -= 2;
                }
                else {
                    ops.push(ch);
                }
            }
            else {
                str = ch + str;
                if (i == 0) {
                    tokens.push(str);
                }
            }
        }
        //console.log(tokens)
        //console.log(ops)
        // Main loop
        var parent = initialParent;
        var prev = createSingleCSSElement(tokens[tokens.length-1]);
        parent.appendChild(prev);
        for (var i = tokens.length-2; i >= 0; --i) {
            var node = createSingleCSSElement(tokens[i]);
            if ([' ', '>'].indexOf(ops[i]) > -1) {
                parent = prev;
            }
            parent.appendChild(node);
            prev = node;
        }   
        return prev;
    }
    catch(err) {
        console.log(err);
        return null;
    }
}

function overrideQueries(obj) {
    // 1 - getElementById (document only)
    if (obj.getElementById !== null) {
        obj.dd_getElementById = obj.getElementById;
        obj.getElementById = function(elemId) {
            logQuery("getElementById: " + elemId, this);
            var result = document.dd_getElementById(elemId);
            if (result === null && document.dd_number < MAX_NUM) {
                var new_node = document.createElement('div');
                new_node.setAttribute("id", elemId);
                assignIdentifier(new_node);
                overrideQueries(new_node);
                retrieveParent(this).appendChild(new_node); 
                result = new_node;
            }
            return result;
        };
        obj.getElementById.toString = function() { 
            return "getElementById() { [native code] }" 
        }
    } 

    // 2 - getElementsByName (document only)
    if (obj.getElementsByName !== null) {
        obj.dd_getElementsByName = obj.getElementsByName;
        obj.getElementsByName = function(elemName) {
            logQuery("getElementsByName: " + elemName, this);
            var result = document.dd_getElementsByName(elemName);
            if (result.length === 0 && !elemName.startsWith('sizzle') && document.dd_number < MAX_NUM) {
                var new_node = document.createElement('div');
                new_node.setAttribute("name", elemName);
                assignIdentifier(new_node);
                overrideQueries(new_node);
                retrieveParent(this).appendChild(new_node); 
                result = document.dd_getElementsByName(elemName);
            }
            return result;
        };
        obj.getElementsByName.toString = function() { 
            return "getElementsByName() { [native code] }" 
        }
    } 

    // 3 - getElementsByTagName (document/node)
    if (obj.getElementsByTagName !== null) {
        obj.dd_getElementsByTagName = obj.getElementsByTagName;
        obj.getElementsByTagName = function(tagName) {
            logQuery("getElementsByTagName: " + tagName, this);
            
            // Just to check if it is still jQuery
            pCaller = arguments.callee.caller;
            realSelector = tagName.slice(0);
            while (pCaller !== null) {                	
                if (pCaller.fn != undefined && pCaller.fn.jquery !== undefined) {
                	//console.log(pCaller.fn.jquery);
                	realSelector = pCaller.arguments[0].slice(0);
                }      	
                pCaller = pCaller.arguments.callee.caller;
            }
            if (realSelector !== tagName) {
                logQuery("jquery-full: " + realSelector, this);
            }
                    
            var result = document.dd_getElementsByTagName(tagName);
            if (result.length === 0 && document.dd_number < MAX_NUM) {
                if (tagName === "*") tagName = "div";
                var new_node = document.createElement(tagName);
                assignIdentifier(new_node);
                overrideQueries(new_node);
                retrieveParent(this).appendChild(new_node);
                result = document.dd_getElementsByTagName(tagName);
            }
            return result;
        };
        obj.getElementsByTagName.toString = function() { 
            return "getElementsByTagName() { [native code] }" 
        }
    } 
        
    // 4 - getElementsByClassName (document/node)
    if (obj.getElementsByClassName !== null) {
        obj.dd_getElementsByClassName = obj.getElementsByClassName;
        obj.getElementsByClassName = function(className) {
            logQuery("getElementsByClassName: " + className, this);
            var result = document.dd_getElementsByClassName(className);
            if (result.length === 0 && document.dd_number < MAX_NUM) {
                var new_node = document.createElement("div");
                new_node.setAttribute("class", className);
                assignIdentifier(new_node);
                overrideQueries(new_node);
                retrieveParent(this).appendChild(new_node);
                result = document.dd_getElementsByClassName(className);
            }
            return result;
        };
        obj.getElementsByClassName.toString = function() { 
            return "getElementsByClassName() { [native code] }" 
        }
    } 

    // 5 - querySelector (document/node)
    if (obj.querySelector !== null) {
        obj.dd_querySelector = obj.querySelector;
        obj.querySelector = function(selector) {
            //alert("hi!");
            logQuery("querySelector: " + selector, this);
            var result = document.dd_querySelector(selector);
            if (result === null && document.dd_number < MAX_NUM) {
                result = processCSSQuery(selector, retrieveParent(this));
                if (result === null) {
                    // One more simpler try
                    tag = parseCSSQuery(selector);
                    if (tag !== null) {
                        var new_node = document.createElement(tag);
                        assignIdentifier(new_node);
                        overrideQueries(new_node);
                        retrieveParent(this).appendChild(new_node);
                        result = new_node;
                    }
                }
            }
            return result;
        };
        obj.querySelector.toString = function() { 
            return "querySelector() { [native code] }" 
        }
    }
        
    // 6 - querySelectorAll (document/node)
    if (obj.querySelectorAll !== null) {
        obj.dd_querySelectorAll = obj.querySelectorAll;
        obj.querySelectorAll = function(selector) {
            //alert("hi!");
            logQuery("querySelectorAll: " + selector, this);
            var result = document.dd_querySelectorAll(selector);
            if (result.length === 0 && document.dd_number < MAX_NUM) {
                processCSSQuery(selector, retrieveParent(this));
                result = document.dd_querySelectorAll(selector);
                if (result.length === 0) {
                    // One more simpler try
                    tag = parseCSSQuery(selector);
                    if (tag !== null) {
                        var new_node = document.createElement(tag);
                        assignIdentifier(new_node);
                        overrideQueries(new_node);
                        retrieveParent(this).appendChild(new_node);
                        result = document.dd_querySelectorAll(tag);
                    }
                }
            }
            return result;
        };
        obj.querySelectorAll.toString = function() { 
            return "querySelectorAll() { [native code] }" 
        }
    } 
    
    // 7 - getElementsByTagNameNS (document/node)
    if (obj.getElementsByTagNameNS !== null) {
        obj.dd_getElementsByTagNameNS = obj.getElementsByTagNameNS;
        obj.getElementsByTagNameNS = function(ns, tagName) {
            logQuery("getElementsByTagNameNS: " + ns + "-" + tagName, this);
            var result = document.dd_getElementsByTagNameNS(ns, tagName);
            if (result.length === 0 && document.dd_number < MAX_NUM) {
                if (tagName === "*") tagName = "div";
                var new_node = document.createElement(tagName);
                assignIdentifier(new_node);
                overrideQueries(new_node);
                retrieveParent(this).appendChild(new_node);
                // Ignoring the namespace
                result = document.dd_getElementsByTagName(tagName);
            }
            return result;
        };
        obj.getElementsByTagNameNS.toString = function() { 
            return "getElementsByTagNameNS() { [native code] }" 
        }
    } 
        
    // 8 - evaluate (document/node)
    if (obj.evaluate !== null) {
        obj.dd_evaluate = obj.evaluate;
        obj.evaluate = function(xpath, context, resolver, type, result) {
            // Just to log for now
            logQuery("evaluate: " + xpath);
            var result = document.dd_evaluate(xpath, context, resolver, type, result);
            return result;
        };
        obj.evaluate.toString = function() { 
            return "getElementsByTagNameNS() { [native code] }" 
        }
    } 
}

function overrideQueriesAll() {
    var initial = document.dd_getElementsByTagName("*")
    console.log(initial.length);
    for (var i = 0; i < initial.length; ++i) {
        //console.log(initial[i].tagName);
        overrideQueries(initial[i]);
    }
}

document.dd_number = 1;
overrideQueries(document);





