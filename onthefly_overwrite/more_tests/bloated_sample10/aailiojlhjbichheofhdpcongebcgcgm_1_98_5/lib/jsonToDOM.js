/*
    dom insertion library function from MDN
    https://developer.mozilla.org/en-US/docs/XUL_School/DOM_Building_and_HTML_Insertion

    edited by Raven Lagrimas (github.com/ravenjohn)
*/

var jsonToDOM = function jsonToDOM (xml, doc, nodes) {
    'use strict';

    doc = doc || document;

    function namespace (name) {
        var m = /^(?:(.*):)?(.*)$/.exec(name);
        return [jsonToDOM.namespaces[m[1]], m[2]];
    }

    function tag (name, attr) {
        var frag,
            args,
            vals,
            elem,
            key,
            val;

        if (Array.isArray(name)) {
            frag = doc.createDocumentFragment();

            Array.prototype.forEach.call(arguments, function (arg) {
                if (!Array.isArray(arg[0])) {
                    frag.appendChild(tag.apply(null, arg));
                }
                else {
                    arg.forEach(function (_arg) {
                        frag.appendChild(tag.apply(null, _arg));
                    });
                }
            });

            return frag;
        }


        args = Array.prototype.slice.call(arguments, 2);
        vals = namespace(name);
        elem = doc.createElementNS(vals[0] || jsonToDOM.defaultNamespace, vals[1]);

        if (arguments.length > 1 && (typeof arguments[1] !== 'object' || Array.isArray(arguments[1]))) {
            args = Array.prototype.slice.call(arguments, 1);
            attr = {};
        }

        for (key in attr) {
            val = attr[key];

            if (nodes && key === 'key') {
                nodes[val] = elem;
            }

            vals = namespace(key);

            if (typeof val === 'function') {
                elem.addEventListener(key.replace(/^on/, ''), val, false);
            }
            else if (val !== undefined) {
                elem.setAttributeNS(vals[0] || '', vals[1], val);
            }
        }

        args.forEach(function(e) {
            try {
                if (!e.length && typeof(e) !== 'number') {
                    return;
                }

                elem.appendChild(Array.isArray(e)
                    ? tag.apply(null, e)
                    : e instanceof doc.defaultView.Node
                        ? e
                        : doc.createTextNode(e)
                );
            }
            catch (ex) {
                elem.appendChild(doc.createTextNode(ex));
            }
        });

        return elem;
    }

    return tag.apply(null, xml);
};

jsonToDOM.namespaces = {
    html: 'http://www.w3.org/1999/xhtml',
    xul: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'
};

jsonToDOM.defaultNamespace = jsonToDOM.namespaces.html;

/*end - dom insertion library function from MDN*/
