import cssutils
import codecs
import random
import string
import shutil
import json
import sys
import os
import re


ONTHEFLY_HIDEX = "ontheflyDOM-hidex.js"
ONTHEFLY_LOGS = "ontheflyDOM-logs.js"
ONTHEFLY_CONFIG = "onthefly_config.js"


def patch_manifest(folder, only_logging):
    manifest = os.path.join(folder, "manifest.json")

    # 1 - Copy the original manifest file
    if not os.path.exists(manifest + ".original"):
        shutil.copyfile(manifest, manifest + ".original")

    found_css_files = []

    # TODO: We also need to patch HTML files?!

    # 2 - Retrieving CSS files
    m = json.loads(codecs.open(manifest + ".original", 'r', 'utf-8-sig').read())
    scripts = m.get('content_scripts', [])
    for s in scripts:
        matches = s.get('css', [])
        for match in matches:
            found_css_files.append(os.path.join(folder,  match))

    # Injecting our libraries
    if only_logging:
        script = dict()
        script["matches"] = ["<all_urls>"]
        script["all_frames"] = True
        script["match_about_blank"] = True
        script["js"] = [ONTHEFLY_LOGS]
        script["run_at"] = "document_start"
        scripts.insert(0, script)
    else:
        script = dict()
        script["matches"] = ["<all_urls>"]
        script["all_frames"] = True
        script["match_about_blank"] = True
        script["js"] = [ONTHEFLY_HIDEX]
        script["run_at"] = "document_start"
        scripts.insert(0, script)
        # In this case we also patch CSS rules
        script = dict()
        script["matches"] = ["<all_urls>"]
        script["all_frames"] = True
        script["match_about_blank"] = True
        script["js"] = [ONTHEFLY_CONFIG]
        script["run_at"] = "document_start"
        scripts.insert(0, script)

    m['content_scripts'] = scripts

    # Writing to the actual manifest
    with codecs.open(manifest, "w", "utf-8-sig") as fout:
        fout.write(json.dumps(m, indent=4))

    return found_css_files


def generate_random():
    return "onthefly_" + ''.join([random.choice(string.ascii_letters + string.digits) for n in xrange(11)]) + "_css"


def get_css_tokenizer():
    # Taken from Erik's cloak code
    h = "[0-9a-f]"
    unicode = "\\\\{h}{1,6}(\\r\\n|[ \\t\\r\\n\\f])?".replace("{h}", h)
    escape = "({unicode}|\\\\[^\\r\\n\\f0-9a-f])".replace("{unicode}", unicode)
    nonascii = "[\\240-\\377]"
    nmchar = "([_a-z0-9-]|{nonascii}|{escape})".replace("{nonascii}", nonascii).replace("{escape}", escape)
    nmstart = "([_a-z]|{nonascii}|{escape})".replace("{nonascii}", nonascii).replace("{escape}", escape)
    ident_pattern = "-?{nmstart}{nmchar}*".replace("{nmstart}", nmstart).replace("{nmchar}", nmchar)
    variable_regex = re.compile(ident_pattern, re.IGNORECASE)
    return variable_regex


# For Viewport Dimensions
#XHOUND_FILTER = set(["#viewPortSize", ".bottom_right"])

# For Hover Zoom
#XHOUND_FILTER = set([".hoverZoomLink"])

# For KUKU.io
#XHOUND_FILTER = set([".kuku-io-extension-installed-in-this-browser"])

# For Fretboard
#XHOUND_FILTER = set([".detail-cell", ".wrapper", ".fretboard-title-row", ".row", ".col", ".fretboard-heading",
#                    ".string-status", ".fretboard-logo", ".fretboard-title", "#fretboard-title", ".fretboard",
#                    "#fretboard", ".bubble", "#bubble", ".fretboard-details"])

# For Web PKI
XHOUND_FILTER = set([".dcngeagmmhegagicpcmpinaoklddcgon", "#dcngeagmmhegagicpcmpinaoklddcgon"])

def main(argv):
    if len(argv) < 2:
        print("Please, provide a path to an unpacked extension.")
        return

    extension_folder = argv[1]
    only_logging = False
    if len(argv) > 2:
        only_logging = True

    config_map = {}  # For IDs and Classes

    css_files = patch_manifest(extension_folder, only_logging);

    shutil.copyfile(ONTHEFLY_HIDEX, os.path.join(extension_folder, ONTHEFLY_HIDEX))

    if not only_logging:
        # In this case we also patch CSS rules
        fout_js = open(os.path.join(extension_folder, "onthefly_config.js"), "w")

        for css_file in css_files:
            # 1 - Save originals
            if not os.path.exists(css_file + ".original"):
                shutil.copyfile(css_file, css_file + ".original")
            # 2 - Overwrite CSS rules
            fout_css = open(css_file, "w")
            print(css_file)
            with open(css_file + ".original", "r") as fin:
                sheet = cssutils.parseString(fin.read())
                for rule in sheet:
                    if rule.type == rule.STYLE_RULE:
                        print("<<< " + rule.selectorText)
                        new_selector = rule.selectorText[:]
                        tokenizer = get_css_tokenizer()
                        for match_obj in tokenizer.finditer(rule.selectorText):
                            token = match_obj.group()
                            # print(token + " - " + str(match_obj.start()) + " - " + str(match_obj.end()))
                            if match_obj.start() == 0: continue
                            ttype = rule.selectorText[match_obj.start() - 1]
                            if ttype in [".", "#"]:
                                # Check with XHound!
                                if ttype + token not in XHOUND_FILTER:
                                    novel = token
                                else:
                                    novel = config_map.get(ttype + token, generate_random())
                                    if novel[0] == ttype: novel = novel[1:]
                                    config_map[ttype + token] = ttype + novel
                                diff = len(new_selector) - len(rule.selectorText)
                                new_selector = new_selector[:diff + match_obj.start()] + novel + new_selector[diff + match_obj.end():]
                        
                        new_selector = new_selector.strip()
                        print(">>> " + new_selector)
                        rule.selectorText = new_selector
            # Flushing updated CSS rules
            fout_css.write(sheet.cssText)
            fout_css.close()

    # Pre-populating the global map
    fout_js.write("var global_map_to_random = {};\n")
    fout_js.write("var global_map_from_random = {};\n\n")

    '''
    for k in config_map.keys():
        v = config_map[k]
        fout_js.write("global_map_to_random['" + k + "'] = '" + v[1:] + "';\n")
        fout_js.write("global_map_from_random['" + v + "'] = '" + k[1:] + "';\n")
    '''

    for k in XHOUND_FILTER:
        v = config_map.get(k, k[0] + generate_random())
        fout_js.write("global_map_to_random['" + k + "'] = '" + v[1:] + "';\n")
        fout_js.write("global_map_from_random['" + v + "'] = '" + k[1:] + "';\n")

    fout_js.write("\n")
    fout_js.close()


if __name__ == "__main__":
    main(sys.argv)

