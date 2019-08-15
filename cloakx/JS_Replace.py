#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from slimit import ast
from slimit.parser import Parser
from slimit.visitors import nodevisitor
from pprint import PrettyPrinter
import re
import esprima

pp = PrettyPrinter(indent=2)
data = """
var a = "content other"        // YES NO
var b = 'content -content'    // YES NO
var c = "im-content"          // NO
var d = "content-u-r"         // NO
var f = ".content"            // YES
var g = "#content"            // YES
var h = "CONTENT"             // NO
form.contentList()            // NO
$($container.find('.content')[1]).css('top', '56px'); // YES
yahooOptions.buttons = [
        {
            text: "pocket",
            successText: i18n[getCurrentContentCode()]['success_saved_text'],
            container: '.content.cf',           // NO??
            content: 'side-button content',     // NO: NO YES
            selector: '.pocket-yahoo-button',
            data: function (elem) {
                // The link is direct on the element within the data-url property
                var link = $(elem).attr('data-url').trim();
                link = unescape(link);

                // First a element is the article title
                var article = $(elem).find("a")[0];
                var title = $(article).text().trim();
                var hacked = 'content';            //YES
                var content = 'harder content lessdifficult'  // NO YES NO

                return {title: title, url: link};
            }
        }
    ];
  
var content = "nobody"
yahooOptions.buttons[0]['content'] = "24"  // NO, but how :(
$.foo({
    type: "content",
    url: 'http://www.content.com',
    data: {
        email: 'abc@g.com',
        phone: 'content',
        content: 'XYZ'
    }
});

 q
p(document.body, "css/mCH.css", [{t: 1, l: "div", a: [{n: "class", v: "content"}],
        c: [{t: 1, l: "img", a: [{n: "src", v: "i/home64.png"}]}, {t: 1, l: "b", c: [{t: 3, v: "Home"}]}]}])
        

var executePocketButtonCode = function() {
  $('#content-btn-js').remove()
  $('#content').remove()
  };

var ha = document.createElement("div");
var divhtml = "<div>This is my content</div>"  // should not change text body
ha.innerHTML = divhtml;
document.appendChild(ha);

var foo = document.createElement("div");
var foohtml = "<div class='maincontent content mocontent'>This is my content</div>"  // NO, YES, NO, NO
ha.innerHTML = foohtml;
document.appendChild(foohtml);
  
"""

# problem, we want all the times

varpattern = re.compile("(^[.]?[ ])")
h = "[0-9a-f]"
unicode = "\\\\{h}{1,6}(\\r\\n|[ \\t\\r\\n\\f])?".replace("{h}", h)
escape = "({unicode}|\\\\[^\\r\\n\\f0-9a-f])".replace("{unicode}", unicode)
nonascii = "[\\240-\\377]"
nmchar = "([_a-z0-9-]|{nonascii}|{escape})".replace("{nonascii}", nonascii).replace("{escape}", escape)
nmstart = "([_a-z]|{nonascii}|{escape})".replace("{nonascii}", nonascii).replace("{escape}", escape)
ident = "-?{nmstart}{nmchar}*".replace("{nmstart}", nmstart).replace("{nmchar}", nmchar)

varpattern = re.compile(ident)

print(ident)
#-?
# ([_a-z]|[\240-\377]|(\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f]))
# ([_a-z0-9-]|[\240-\377]|(\\[0-9a-f]{1,6}(\r\n|[ \t\r\n\f])?|\\[^\r\n\f0-9a-f]))*

#parser = Parser()
#tree = parser.parse(data)

tree = esprima.parseScript(data)

str_to_find = 'content'
replace = 'FOOBARBAR'
import json
print(json.dumps(tree.toDict(),indent=2))



def match_replace(str_to_parse, str_to_find, replace):
    temp = str_to_parse
    # print("var " + node.identifier.value + " value to >> " + node.initializer.value + " <<")
    for match_obj in varpattern.finditer(str_to_parse):
        #print(match_obj.group())
        # temp =
        if match_obj.group() == str_to_find:
            temp = temp[:match_obj.start()] + replace + temp[match_obj.end():]
    return temp



for node in nodevisitor.visit(tree):
    if isinstance(node, ast.VarDecl):
        if node.initializer is not None and type(node.initializer) is ast.String:
            node.initializer.value = match_replace(node.initializer.value, str_to_find, replace)
            # print ("var " + node.identifier.value + ' >> ' + node.initializer.value )
    if isinstance(node, ast.Assign):
        if type(node.right) is ast.String:
            node.right.value = match_replace(node.right.value, str_to_find, replace)
            # print("var " + node.left.value + " value to >> " + node.right.value + " <<")

    if type(node) is ast.String:
        node.value = match_replace(node.value, str_to_find, replace)
                # print("var " + node.left.value + " value to >> " + node.right.value + " <<")
    print(str(type(node)) + " " + str(vars(node) ))



print(tree.to_ecma())

#
# fields = {getattr(node.left, 'value', ''): getattr(node.right, 'value', '')
#           for node in nodevisitor.visit(tree)
#           if isinstance(node, ast.Assign)}
#
# print (fields)

class JS_Replace():
    def __init__(self):
        pass
