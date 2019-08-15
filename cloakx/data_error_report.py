#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from os.path import basename, splitext
from collections import defaultdict
import operator
import json
import glob
import sys
from os.path import join
from termcolor import cprint
'''
[{"inline_scripts": [{"error_fn": "droplet_5cc0ec11741a7187ee800e7ec7c4327b", "cmd_search_str": "finish_ts,#registerEmail,#registerEmail2,#PIB_pause,#registerCaptcha,#registerPasswordCompare,.validateTips,#pib_dialog-registered,#seccode,#pib_dialog-register,#registerPassword,#PIB_window", "prepare_js": {"msg": "Preparation of JS completed successfully"}, "filename": "droplet_5cc0ec11741a7187ee800e7ec7c4327b", "error": "Timeout"}]
'''

def main(base_path):
    tots = 0
    droplets = 0
    counts = defaultdict(lambda: 0, {})
    timeouts=0
    inline_scripts=0
    wars_scripts = 0
    analysis_excep =0
    syntax_error = 0
    other_errors = []
    timeouters_ext = []
    errors_fn = []

    for fn in glob.iglob(join(base_path, "*.json")):
        with open(fn, "r") as jf:
            jdata = json.load(jf)
        if len(jdata) == 1:
            jdata = jdata[0]
        if "droplets" in jdata:
            drops = jdata["droplets"]
            droplets += 1
            for drop in drops:
                dstr = json.dumps(drop)
                has_error = False
                if "inline_scripts" in drop:
                    iscrs = drop["inline_scripts"]
                    for iscr in iscrs:
                        has_error = "error" in iscr or "Error:" in iscr

                        if has_error and iscr["error"] == "Timeout":
                            timeouts += 1
                            timeouters_ext.append(splitext(basename(fn))[0])
                            inline_scripts+=1
                        elif has_error:
                            if iscr["stderr"].find("AnalysisException") > -1:
                                analysis_excep += 1
                            elif iscr["stderr"].find("Syntax error") > -1:
                                syntax_error += 1
                            else:
                                other_errors.append(iscr["stderr"][:120])
                        else:
                            if "prepare_js" in iscr:
                                ppj = iscr["prepare_js"]
                                has_error = "Error:" in ppj
                                if has_error and ppj["Error:"] == "Timeout":
                                    timeouts += 1
                                    timeouters_ext.append(splitext(basename(fn))[0])
                                    inline_scripts += 1
                                elif has_error:
                                    other_errors.append(ppj["Error:"][:120])


                elif "wars" in drop:
                    wars = drop["wars"]

                    for war in wars:
                        has_error = has_error or "error" in war or "Error:" in war

                        if "error" in war:
                            war_fn = war["filename"]
                            extension_id = splitext(basename(fn))[0]
                            areas = war_fn.split(extension_id)
                            #print("{} {} {}".format(extension_id, areas[1], war["error"]))

                        if "error" in war and war["error"] == "Timeout":
                            timeouts+=1
                            timeouters_ext.append(splitext(basename(fn))[0])
                            wars_scripts+=1
                            bn = basename(war["error_fn"])
                            bn = bn[bn.find("_")+1:]
                            counts[bn] += 1
                        elif "error" in war:
                            if war["stderr"].find("AnalysisException") > -1:
                                analysis_excep +=1
                            elif war["stderr"].find("Syntax error") > -1:
                                syntax_error += 1
                            else:
                                other_errors.append(war["stderr"][:120])
                        # else:
                        #     print (war)

                if not has_error:
                    if dstr.find('"error"') > -1:
                        cprint(dstr, "red")


        tots += 1

    print ("\nTOTAL {}".format(tots))
    print ("\tDroplets {}".format(droplets))
    print("\tTimeouts: {}".format(timeouts))
    print("\t\tInline Scripts: {}".format(inline_scripts))
    print("\t\tWARS: {}".format(wars_scripts))
    for key, val in reversed(sorted(counts.items(), key=operator.itemgetter(1))):
        print ("\t\t\t{}: {}".format(key, val))
    print("\tErrors:")
    print("\t\tAnalysis Exceptions: {} ".format(analysis_excep))
    print("\t\tSyntax Errors: {} ".format(analysis_excep))
    for x in other_errors:
        print("\t\t"+x)
    print("\n")

    reds_fn = open("redo-timeouts.dat","w")
    for t in timeouters_ext:
        reds_fn.write(t + "\n")





if __name__ == "__main__":
    if len(sys.argv) == 1:
        main("data/jsons")
    else:
        main(sys.argv[1])



