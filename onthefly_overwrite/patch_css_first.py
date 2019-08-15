import cssutils
import codecs
import random
import string
import shutil
import json
import sys
import os


ONTHEFLY_HIDEX = "ontheflyDOM-hidex.js"
ONTHEFLY_LOGS = "ontheflyDOM-logs.js"
ONTHEFLY_CONFIG = "onthefly_config.js"


def patchManifest(folder, only_logging):
    manifest = os.path.join(folder, "manifest.json")

    # 1 - Copy the original manifest file
    if not os.path.exists(manifest + ".original"):
        shutil.copyfile(manifest, manifest + ".original")

    found_css_files = []

    # TODO: We also need to patch HTML files!

    # 2 - Retrieving CSS files
    m = json.loads(codecs.open(manifest + ".original", 'r', 'utf-8-sig').read())
    scripts = m.get('content_scripts', [])
    for s in scripts:
        matches = s.get('css', [])
        for match in matches:
            found_css_files.append(os.path.join(folder + match))

    # TODO: including iframes?

    # Injecting our libraries
    if only_logging == True:
        script = dict()
        script["matches"] = ["<all_urls>"]
        script["js"] = [ONTHEFLY_LOGS]
        script["run_at"] = "document_start"
        scripts.insert(0, script)
    else:
        script = dict()
        script["matches"] = ["<all_urls>"]
        script["js"] = [ONTHEFLY_HIDEX]
        script["run_at"] = "document_start"
        scripts.insert(0, script)
        # In this case we also patch CSS rules
        script = dict()
        script["matches"] = ["<all_urls>"]
        script["js"] = [ONTHEFLY_CONFIG]
        script["run_at"] = "document_start"
        scripts.insert(0, script)

    m['content_scripts'] = scripts

    # Writing to the actual manifest
    with codecs.open(manifest, "w", "utf-8-sig") as fout:
        fout.write(json.dumps(m, indent=4))

    return found_css_files


def generateRandom():
    return "onthefly_" + ''.join([random.choice(string.ascii_letters + string.digits) for n in xrange(11)]) + "_css"


def main(argv):
    if len(argv) < 2:
        print("Please, provide a path to an unpacked extension.")
        return

    EXTENSION_FOLDER = argv[1]
    ONLY_LOGGING = False
    if len(argv) > 2:
        ONLY_LOGGING = True

    config_map = {}  # For IDs and Classes

    css_files = patchManifest(EXTENSION_FOLDER, ONLY_LOGGING);

    shutil.copyfile(ONTHEFLY_HIDEX, os.path.join(EXTENSION_FOLDER, ONTHEFLY_HIDEX))

    if not ONLY_LOGGING:
        # In this case we also patch CSS rules
        foutJS = open(os.path.join(EXTENSION_FOLDER, "onthefly_config.js"), "w")

        for css_file in css_files:
            # 1 - Save originals
            if not os.path.exists(css_file + ".original"):
                shutil.copyfile(css_file, css_file + ".original")
            # 2 - Overwrite CSS rules
            foutCSS = open(css_file, "w")
            print(css_file)
            with open(css_file + ".original", "r") as fin:
                sheet = cssutils.parseString(fin.read())
                for rule in sheet:
                    if rule.type == rule.STYLE_RULE:
                        #print(rule.selectorText)
                        new_selector = ""
                        # TODO: space is not required, e.g. .class1.class2
                        # ".pocket-twitter .Icon.Icon--circle, .pocket-twitter .Icon.Icon--circleFill"
                        subselectors_top = rule.selectorText.split(" ")
                        for subselector_top in subselectors_top:
                            subselectors = subselector_top.split(",")
                            for subselector in subselectors:
                                # TODO: there are more complex cases like a[id='something']...
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
                                        new_selector += novel + ":" + ":".join(tmp[1:]) + ","
                                    else:
                                        new_selector += novel + ","
                                else:
                                    new_selector += subselector + ","
                            new_selector = new_selector[:-1]
                            new_selector += " "
                        new_selector = new_selector.strip()
                        rule.selectorText = new_selector
            # Flushing updated CSS rules
            foutCSS.write(sheet.cssText)
            foutCSS.close()

    # Pre-populating the global map
    foutJS.write("var global_map_to_random = {};\n")
    foutJS.write("var global_map_from_random = {};\n\n")

    for k in config_map.keys():
        v = config_map[k]
        foutJS.write("global_map_to_random['" + k + "'] = '" + v[1:] + "';\n")
        foutJS.write("global_map_from_random['" + v + "'] = '" + k[1:] + "';\n")

    foutJS.write("\n")
    foutJS.close()


if __name__ == "__main__":
    main(sys.argv)

