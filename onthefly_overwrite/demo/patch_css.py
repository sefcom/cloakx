import codecs
import cssutils
import random
import string

foutJS = open("aibmmfofaeipbiaocgabhobgedbfdiih_2_14/onthefly_config.js", "w")
foutCSS = open("aibmmfofaeipbiaocgabhobgedbfdiih_2_14/css/application.css", "w")

def generateRandom():
    return "onthefly_" + ''.join([random.choice(string.ascii_letters + string.digits) for n in xrange(11)]) + "_css" 

config_map = {} 

with open("aibmmfofaeipbiaocgabhobgedbfdiih_2_14/css/application.css.prev", "r") as fin:
    sheet = cssutils.parseString(fin.read())
    for rule in sheet:
        if rule.type == rule.STYLE_RULE: 
            print(rule.selectorText)
            newSelector = ""
            subselectors_top = rule.selectorText.split(" ")
            for subselector_top in subselectors_top:
                subselectors = subselector_top.split(",")
                for subselector in subselectors:
                    if subselector.startswith(".") or subselector.startswith("#"):
                        tmp = subselector.split(":")
                        prev = tmp[0]
                        novel = config_map.get(prev, generateRandom())
                        if subselector.startswith(".") and not novel.startswith("."):
                            novel = "." + novel
                        if subselector.startswith("#") and not novel.startswith("#"):
                            novel = "#" + novel
                        config_map[prev] = novel
                        if len(tmp) > 1:
                            newSelector += novel +  ":" + ":".join(tmp[1:]) + ","
                        else:
                            newSelector += novel + ","
                    else:
                        newSelector += subselector + ","
                newSelector = newSelector[:-1]
                newSelector += " "
            newSelector = newSelector.strip()
            print(newSelector)
            #print(dir(rule))
            rule.selectorText = newSelector
            #print(rule)
            #break                    
                    
foutCSS.write(sheet.cssText)

foutJS.write("var global_map_to_random = {};\n")
foutJS.write("var global_map_from_random = {};\n\n")

for k in config_map.keys():
    v = config_map[k]
    foutJS.write("global_map_to_random['" + k + "'] = '" + v[1:] + "';\n")
    foutJS.write("global_map_from_random['" + v + "'] = '" + k[1:] + "';\n")

foutJS.write("\n")                 

foutJS.close()
foutCSS.close()


