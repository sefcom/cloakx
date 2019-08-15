//
// ontheflyDOM.js by Oleksii Starov -- 04/01/2018
//

(function( window ) {
	// Borrowed and modified from Sizzle CSS Selector Engine
	var Sizzle = function() {};

	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};

	var booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,

	// CSS escapes
	// http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// CSS string/identifier serialization
	// https://drafts.csswg.org/cssom/#common-serializing-idioms
	rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
	fcssescape = function( ch, asCodePoint ) {
		if ( asCodePoint ) {

			// U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
			if ( ch === "\0" ) {
				return "\uFFFD";
			}

			// Control characters and (dependent upon position) numbers get escaped as code points
			return ch.slice( 0, -1 ) + "\\" + ch.charCodeAt( ch.length - 1 ).toString( 16 ) + " ";
		}

		// Other potentially-special ASCII characters get backslash-escaped
		return "\\" + ch;
	},

	Expr = {

		preFilter: {
			"ATTR": function( match ) {
				match[1] = match[1].replace( runescape, funescape );

				// Move the given value to match[3] whether quoted or unquoted
				match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

				if ( match[2] === "~=" ) {
					match[3] = " " + match[3] + " ";
				}

				return match.slice( 0, 4 );
			},

			"CHILD": function( match ) {
				/* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/
				match[1] = match[1].toLowerCase();

				if ( match[1].slice( 0, 3 ) === "nth" ) {
					// nth-* requires argument
					if ( !match[3] ) {
						Sizzle.error( match[0] );
					}

					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
					match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

				// other types prohibit arguments
				} else if ( match[3] ) {
					Sizzle.error( match[0] );
				}

				return match;
			},

			"PSEUDO": function( match ) {
				var excess,
					unquoted = !match[6] && match[2];

				if ( matchExpr["CHILD"].test( match[0] ) ) {
					return null;
				}

				// Accept quoted arguments as-is
				if ( match[3] ) {
					match[2] = match[4] || match[5] || "";

				// Strip excess characters from unquoted arguments
				} else if ( unquoted && rpseudo.test( unquoted ) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

					// excess is a negative index
					match[0] = match[0].slice( 0, excess );
					match[2] = unquoted.slice( 0, excess );
				}

				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice( 0, 3 );
			}
		},

		filter: {

			"TAG": "TAG",

			"CLASS": "CLASS",

			"ATTR": "ATTR",

			"CHILD": "CHILD",

			"PSEUDO": "PSEUDO",

			"ID": "ID"	// Wasn't here originally!
		}
	};

	Sizzle.tokenize = function( selector ) {
		var matched, match, tokens, type,
			soFar, groups, preFilters;

		soFar = selector;
		groups = [];
		preFilters = Expr.preFilter;

		while ( soFar ) {

			// Comma and first run
			if ( !matched || (match = rcomma.exec( soFar )) ) {
				if ( match ) {
					// Don't consume trailing commas as valid
					soFar = soFar.slice( match[0].length ) || soFar;
				}
				groups.push( (tokens = []) );
			}

			matched = false;

			// Combinators
			if ( (match = rcombinators.exec( soFar )) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					// Cast descendant combinators to space
					type: match[0].replace( rtrim, " " )
				});
				soFar = soFar.slice( matched.length );
			}

			// Filters
			for ( type in Expr.filter ) {
				if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
					(match = preFilters[ type ]( match ))) ) {
					matched = match.shift();
					tokens.push({
						value: matched,
						type: type,
						matches: match
					});
					soFar = soFar.slice( matched.length );
				}
			}

			if ( !matched ) {
				break;
			}
		}

		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens

		//if (soFar) Sizzle.error(selector);

		//console.log(groups.length);
        //console.log(groups[0]);
        return groups;
	};

	Sizzle.toSelector = function( groups ) {
        var selector = "";
        for (var j=0; j < groups.length; ++j) {
            var tokens = groups[j];
             var i = 0, len = tokens.length;
            for ( ; i < len; i++ ) {
                selector += tokens[i].value;
            }
            if (j != groups.length-1)
                selector += ",";
        }
        return selector;
    }

	// EXPOSE
	window.SizzleCSSTokenizer = Sizzle;

})( window );


// Though, we also safe on the HTML element:
// this["onthefly_real_id"] and this["onthefly_real_className"]
//var global_map_to_random = {};
//var global_map_from_random = {};

// To log DOM queries made
function logQuery(query, obj) {
    //console.log("> Query - " + query);
}

// To log DOM injections
function logInjection(data, obj) {
    //console.log("> Injection - " + data);
}

/*
// To get new random identifier
function generateRandomToken() {
    console.log("Generate random token.");
    return "onthefly_" + Math.random().toString(36).substring(2, 15);
}
*/

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
    try {
        var groups = SizzleCSSTokenizer.tokenize(selector);
        for (var j = 0; j < groups.length; ++j) {
            var tokens = groups[j];
            for (var i = 0; i < tokens.length; ++i) {
                var token = tokens[i];
                if (token.type == "CLASS") {
                    token.value = "." + getMaskingClass(token.value.slice(1));
                }
                else if (token.type == "ID") {
                    token.value = "#" + getMaskingID(token.value.slice(1));
                }
            }
        }

        // TODO: tokens of ATTR type...
        //console.log(tokens.length);

        return SizzleCSSTokenizer.toSelector(groups);
    }
    catch(err) {
        console.log(err);
        return null;
    }
}

/*
// Processing CSS query
function maskCSSQuery(selector) {
    // TODO: complex class names like ".sticky-note sticky-just-created sticky-color-yellow"
    // TODO: wildcards like '*'
    // TODO: "[id='sizzle-1521767805448'] p.js-tweet-text"
    try {
        var res = "";
        // TODO: validate the method!
        var subselectors = selector.split(" ");
        for (var i = 0 ; i < subselectors.length; ++i) {
            var tokens = subselectors[i].split(/(?=\.)|(?=#)|(?=\[)|(?=,)/);
            for (var j = 0; j < tokens.length; ++j) {
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
*/


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
            var className = getMaskingClass(className);

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
    // NOTE: we do not care about document.write

    // For innerHTML and insertAdjacentHTML
    var prepareTempContainer = function(container) {

        var items_with_id = container.dd_querySelectorAll("*[id]");
        for (var i = 0; i < items_with_id.length; ++i) {
            var node = items_with_id[i];

            if (!(node instanceof HTMLElement)) {
                continue;
            }

            if (global_map_to_random["#" + node.id] != undefined) {
                var random_id = global_map_to_random["#" + node.id];
                node.prev_setAttribute("id", random_id);
            }
        }

        var items_with_class = container.dd_querySelectorAll("*[class]");
        for (var i = 0; i < items_with_class.length; ++i) {
            var node = items_with_class[i];

            if (!(node instanceof HTMLElement)) {
                continue;
            }

            var original_classes = node.className.split(" ");
            var final_class = "";
            for (var j in original_classes) {
                var original_class = original_classes[j];
                if (global_map_to_random["." + original_class] != undefined) {
                    var random_class = global_map_to_random["." + original_class];
                    final_class += random_class + " ";
                }
                else {
                    final_class += original_class + " ";
                }
            }

            node.prev_setAttribute("class", final_class.trim());
        }
    }

    var prepareFinalContainer = function(container) {

        var items_with_id = container.dd_querySelectorAll("*[id]");
        for (var i = 0; i < items_with_id.length; ++i) {
            var node = items_with_id[i];

            if (!(node instanceof HTMLElement)) {
                continue;
            }

            // Just set the proper onthefly_real_id
            var random_id = node.prev_getAttribute("id");
            node["onthefly_real_id"] = global_map_from_random["#" + random_id];
        }

        var items_with_class = container.dd_querySelectorAll("*[class]");
        for (var i = 0; i < items_with_class.length; ++i) {
            var node = items_with_class[i];

            if (!(node instanceof HTMLElement)) {
                continue;
            }

            // Just set the proper onthefly_real_class
            var random_classes = node.prev_getAttribute("class").split(" ");
            var final_class = "";
            for (var j = 0; j < random_classes.length; ++j) {
                var random_class = random_classes[j];
                if (global_map_from_random["." + random_class] != undefined) {
                    final_class += global_map_from_random["." + random_class] + " ";
                }
                else {
                    final_class += random_class + " ";
                }
            }

            node["onthefly_real_class"] = final_class.trim();
        }
    }

    var htmlelement_apis = ["innerHTML"];   // We do not care about the innerText for now
    for (i = 0; i < htmlelement_apis.length; ++i) {
        var api = htmlelement_apis[i];
        var getter = HTMLElement.prototype.__lookupGetter__(api);
        HTMLElement.prototype.getter_innerHTML = getter;
        var prev = HTMLElement.prototype.__lookupSetter__(api);     // Note, no [api] for some properties 
        (function(api, prev, getter) {
            HTMLElement.prototype.__defineSetter__(api, function (val) {
                //logInjection(api + ": " + val.substr(0,100), this);
                //return prev.apply(this, [val]);

                // First: change the DOMString in memory
                var container = document.createElement("div");
        		prev.apply(container, [val]);
        		prepareTempContainer(container);

                //console.log(container);

                // Second: get the resulting nodes
                var res = prev.apply(this, [getter.call(container)]);
                
                // Third: process the resulting nodes
                prepareFinalContainer(this);

                // Ref to results
                return res;
            });

            HTMLElement.prototype.__defineGetter__(api, function () {
                // TODO: potentially, we should mask here as well!
                return getter.call(this);
            });

        })(api, prev, getter);
    }

    var prev_insertAdjacentHTML = HTMLElement.prototype.insertAdjacentHTML;       // And this is a normal function
    HTMLElement.prototype.__defineGetter__("insertAdjacentHTML", function () {
        return function(position, text) {
            //logInjection("insertAdjacentHTML: " + text.substr(0,100), this);
            
            // First: change the DOMString in memory
            var container = document.createElement("div");
            prev_insertAdjacentHTML.apply(container, ["afterbegin", text]);
            prepareTempContainer(container);

            // Second: get the resulting nodes (after inserting innerHTML of the container)
            var res = prev_insertAdjacentHTML.apply(this, [position, HTMLElement.prototype.getter_innerHTML.call(container)]);

            // Third: process the resulting nodes
            if (position == "afterbegin" || position == "beforeend") {
            	prepareFinalContainer(this);
            }
            else {
            	// "beforebegin", "afterend"
            	prepareFinalContainer(this.parentElement);
            }
            
            return res;
        };
    });

    var prev_insertAdjacentElement = HTMLElement.prototype.insertAdjacentElement;		// And this is a normal function
    HTMLElement.prototype.__defineGetter__("insertAdjacentElement", function () {
        return function() {

            if (arguments[1].outerHTML != undefined) {
                //logInjection("insertAdjacentElement: " + arguments[1].outerHTML.substr(0,100), this);
            }
            // ASSUMPTION: the nodes is already processed
            var result = prev_insertAdjacentElement.apply(this, arguments);
            return result;
        };
    });

    var prev_insertBefore = HTMLElement.prototype.insertBefore;		// And this is a normal function
    HTMLElement.prototype.__defineGetter__("insertBefore", function () {
        return function() {
        	// var insertedNode = parentNode.insertBefore(newNode, referenceNode);
            if (arguments[0].outerHTML != undefined) {
                //logInjection("insertBefore: " + arguments[0].outerHTML.substr(0,100), this);
            }
            // ASSUMPTION: the nodes is already processed
            var result = prev_insertBefore.apply(this, arguments);
            return result;
        };
    });

    var prev_appendChild = HTMLElement.prototype.appendChild;       // And this is a normal function
    HTMLElement.prototype.__defineGetter__("appendChild", function () {
        return function() {
            // It can be a text node!
            if (arguments[0].outerHTML != undefined) {
                //logInjection("appendChild: " + arguments[0].outerHTML.substr(0,100), this);
            }
            else {
                //logInjection("appendChild: " + arguments[0], this);
            }

            // ASSUMPTION: the nodes is already processed
            //var node = arguments[0];
            //processNewNode(node);
            
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
                    //logInjection("append: " + arguments[i].outerHTML.substr(0,100), this);
                    // ASSUMPTION: all the nodes are already processed
                    //var node = arguments[i];
                    //processNewNode(node);
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
            //console.log("getAttribute " + arguments[0]);
            // ASSUMPTION: all obfuscated nodes must have ["onthefly_real_*"]
            if (arguments[0] == "id" && this["onthefly_real_id"] != undefined) return this["onthefly_real_id"];
            if (arguments[0] == "class" && this["onthefly_real_class"] != undefined) return this["onthefly_real_class"];

            var result = this.prev_getAttribute.apply(this, arguments);
            return result;
        };
    });

    var prev_classList = HTMLElement.prototype.__lookupGetter__("classList");
    HTMLElement.prototype.__defineGetter__("classList", function () {
        var token_list = prev_classList.call(this);

        // DOMTokenList.prototype is too universal
        // TODO: replace, supports, toggle, entries, forEach, keys, values
        var node = this;
        token_list.__defineGetter__("contains", function () {
            return function() {
                var original_class = arguments[0];
                if (global_map_to_random["." + original_class] != undefined) {	// This class must be obfuscated
                    return node.className.split(" ").indexOf(original_class) != -1;
                }
                var result = DOMTokenList.prototype.contains.apply(this, arguments);
                return result;
            };
        });
        token_list.__defineGetter__("add", function () {
            return function() {
            	if (node["onthefly_real_class"] == undefined) node["onthefly_real_class"] = "";
            	for (var i in arguments) {
            		var original_class = arguments[i];
            		if (node["onthefly_real_class"].split(" ").indexOf(original_class) == -1) {
            			node["onthefly_real_class"] = node["onthefly_real_class"] + " " + original_class;
            		}
            		var random_class = global_map_to_random["." + original_class];
            		if (random_class != undefined) {	// This class must be obfuscated
            			arguments[i] = random_class;
            		}
            	}
                DOMTokenList.prototype.add.apply(this, arguments);
                return;
            };
        });
        token_list.__defineGetter__("remove", function () {
            return function() {
            	if (node["onthefly_real_class"] == undefined) node["onthefly_real_class"] = "";
            	var onthefly_list = node["onthefly_real_class"].split(" ");
            	for (var i in arguments) {
            		var original_class = arguments[i];
            		var index = onthefly_list.indexOf(original_class);
            		if (index != -1) onthefly_list.splice(index, 1);
            		var random_class = global_map_to_random["." + original_class];
            		if (random_class != undefined) {	// This class must be obfuscated
            			arguments[i] = random_class;
            		}
            	}
            	node["onthefly_real_class"] = onthefly_list.join(" ").trim();
                DOMTokenList.prototype.remove.apply(this, arguments);
                return;
            };
        });

        return token_list;
    });

    var prev_setAttribute = HTMLElement.prototype.setAttribute;       // And this is a normal function
    HTMLElement.prototype.prev_setAttribute = prev_setAttribute;
    HTMLElement.prototype.__defineGetter__("setAttribute", function () {
        return function() {
            //console.log("setAttribute " + arguments[0]);
            // Only for "id" and "class" for now
            if (arguments[0] == "id" || arguments[0] == "class") {
                var original_ids = (arguments[0] == "id") ? [arguments[1]] : arguments[1].split(" ");
                var id_selector = (arguments[0] == "id") ? "#" : ".";
                var id_type = (arguments[0] == "id") ? "id" : "class";

                var obfuscated = false;
                var final_id = "";
                for (var i in original_ids) {
                    var original_id = original_ids[i];
                    if (global_map_to_random[id_selector + original_id] != undefined) {
                        var random_id = global_map_to_random[id_selector + original_id];
                        final_id += random_id + " ";
                        obfuscated = true;
                    }
                    else {
                        final_id += original_id + " ";
                    }
                }

                if (obfuscated) {
                    final_id = final_id.trim();
                    this["onthefly_real_" + id_type] = arguments[1];
                    return this.prev_setAttribute.apply(this, [id_type, final_id]);
                }
            }
            
            // Default variant
            var result = this.prev_setAttribute.apply(this, arguments);
            return result;
        };
    });

    // Globally masked properties

    Object.defineProperty(HTMLElement.prototype, "id", {
        get() { 
            var res = this.getAttribute("id"); 
            return (res == null) ? "" : res; 
        },
        set(newValue) { 
            this.setAttribute("id", newValue);
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(HTMLElement.prototype, "className", {
        get() { 
            var res = this.getAttribute("class");
            return (res == null) ? "" : res; 
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











