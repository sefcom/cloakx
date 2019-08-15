#! /usr/bin python3
from os import walk
from os.path import join, exists, isfile, basename
from urllib.parse import unquote, unquote_plus
from bs4 import BeautifulSoup
from tqdm import tqdm
import re
from urllib import parse
import json
from termcolor import cprint
from shutil import copyfile
#from esprima import parseScript, tokenize

ONTHEFLY_DIR = "/home/etrickel/tmp/xhound_bloat/output_bloating_onthefly/"
EMPTYPG_DIR = "/home/etrickel/tmp/xhound_bloat/output_bloating_emptypage/"
CEXS_DIR = "/media/hd280/xhound_detect"

used_data = 0
using_cnt = 0
appid_pattern = re.compile("^([a-p]{32})$")

def read_js_file(jsf):
    encoding = 'utf-8'
    text_data = ""
    try:
        text_data = open(jsf, 'r', encoding=encoding).read()
    except UnicodeDecodeError as ude:
        try:
            encoding = 'latin-1'
            text_data = open(jsf, 'r', encoding=encoding).read()
        except:
            print("\n\nSECOND TRY to read from {} using utf-8 or latin-1 ")
            print("Error reading from {}\n\n".format(jsf))
    return text_data

war_exists_in_extension =0
extension_exists=0
script_identified =0
total_script_tags_found =0
total_script_tags_with_src_found=0
src_not_in_script=0
def load_hidex_data(src):
    jide = {}
    if exists(src + "/hidex_config.json"):
        with open(src + "/hidex_config.json","r") as jf:
            jide = json.load(jf)
    return jide

def get_wars( data, ids_classes, appid):
    global used_data, using_cnt, war_exists_in_extension, extension_exists, script_identified, total_script_tags_found
    global total_script_tags_with_src_found, src_not_in_script
    first = True
    found = False
    #print("\nsearching js")
    script_out =""

    if appid == "pkdaehnlimdebdbjjgocgaiknchfpnli":
        print(data)

    data = unquote_plus(data)

    all_scripts_cnt2 = len(re.findall("script ", data))

    #data = data.replace("<script","</script><script")
    data += "</script>"
    #print(data)
    soup = BeautifulSoup(data, 'html.parser')
 
    #print("soup={}".format(soup))
    war_data = []


    all_script_tags = soup.find_all("script")

    #print("{}  {} ".format(len(all_script_tags), all_scripts_cnt2 ))

    for script in all_script_tags:
        hasSource = False
        total_script_tags_found += 1
        if script.has_attr("src") and script['src'] is not None:
            total_script_tags_with_src_found += 1
            if script['src'].find("chrome-extension") > -1:

                src = script['src']
                #src = src.replace("aldoijjooohjeibbjhlddjlpnjnkmgbf", appid).replace("kheghanhgmknkdkmolnknijkjcplcjge", appid)

                src_url = parse.urlsplit(src)
                src_location = appid + "" + src_url.path
                script_identified += 1
                # if "war_map" in jide:
                #     for oldname, newname in jide["war_map"].items():
                #         if src_url.path.endswith(oldname):
                #             src_location = src_location.replace(oldname, newname)

                if exists("/mnt/d/Xhound_backups/" + src_location):
                    war_data.append(src_url.path)
                    # ids_classes[appid]["location"] = "/media/hd280/xhound_detect/" + src_location
                    # ids_classes[appid]["alt_loc"] = "testwars/" + src_location.replace(" / ", "_")
                    # ids_classes[appid]["rel_loc"] =
                    war_exists_in_extension += 1
                else:
                    cprint("\tChrome-Extension source not found {} {}".format(appid, src_location), "red")
                # try:
                #
                #     #copyfile("/media/hd280/xhound_detect/"+src_location, "testwars/" + src_location.replace("/","_"))
                # except FileNotFoundError:
                #     pass
                #print (src_location)
            else:
                src_not_in_script+=1
                #print ("\t" + script['src'])


        #print("SCRIPT!!!{}".format(script))
        # if script.text is not None and len(script.text) > 5:
        #     script_out += script.text + "\n"
        #     script_out = script_out.replace("!!empty!!","")
        #     if len(script_out)>5 and hasSource:
        #         print (data)

    return war_data




ids_classes = {}
#lines = open("../xhound_stats/final_aggregated_setting_id_and_class.txt","r").read()
lines = open("../xhound_stats/final_aggregated_setting_id_and_class_notriggerclasses.txt", "r").read()
for line in lines.split("\n"):
    appid = line.split("_")[0]
    if len(appid) == 0:
        continue

    ids_classes[appid] = {}
    classes = []
    ids = []
    for val in line.split("\t"):
        if len(val) == 0:
            continue
        if val[0] == "#":
            ids.append(val[1:])
        elif val[0] == ".":
            classes.append(val[1:])

    ids_classes[appid] = {"ids": ids, "classes":classes}


#print("Number of scripts in final agg {} ".format(len(ids_classes)))

lines = open("data/new_exts_w_dropplets.txt").read().split("\n")
#lines = open("../xhound_stats/final_aggregated_dropped_stale_scripts.txt").read().split("\n")
#lines = open("../xhound_stats/final_dropped_scripts_after_script_hunt.txt", "r").read().split("\n")
#lines = open("data/hunted_exts_piped.txt", "r").read().split("\n")
selected_files = []
ext_cnt = 0
war_data = {}
war_cnt = 0
not_in_id_classes=0
in_id_classes=0
one_war_found=0
no_wars_found =0
wars_out = ""
print("Number of extensions found in file: {}".format(len(lines)))

for line in lines: #tqdm(lines, total=len(lines), unit="extension"):
    ext_cnt += 1
    arr = line.split("|")
    if len(arr) < 2:
        continue
    cex = arr[0]
    data = arr[1]
    if cex.find("_") == -1:
        print("ERROR!!! couldn't find underscore in extension value, skipping...")
        continue

    cex_loc = cex.split("_")[0]

    print("Starting on extension {} id={}".format(ext_cnt, cex_loc))

    if cex_loc in ids_classes:

        if exists("/mnt/d/Xhound_backups/" + cex_loc):
            extension_exists += 1
        else:
            cprint("DOES NOT EXIST? {}".format(cex_loc), "red")

        for x in range(1, len(arr)):
            data = arr[x]
            wars = get_wars(data, ids_classes, cex_loc)
            if len(wars) > 0:
                war_data[cex_loc] = {'ids': ids_classes[cex_loc]['ids'], 'classes': ids_classes[cex_loc]['classes'],
                                     'wars': wars}
                war_cnt += len(wars)
                wars_out += cex_loc + "\n"
                one_war_found += 1
            else:
                no_wars_found += 1
        in_id_classes += 1
    else:
        not_in_id_classes += 1

print("in id/classes = {}   not identified in Xhound dropped settings no trig = {} ".format(in_id_classes, not_in_id_classes))
print("\textension exists = {} ".format(extension_exists))
print("\t\tTotal Script Tags Found = {}, Tags with SRC = {}".format(total_script_tags_found, total_script_tags_with_src_found ))
print("\t\tSRC in CEX = {}, SRC outside of CEX = {} ".format(script_identified, src_not_in_script))
print("\t\tAt least One WAR found = {}, No Wars Found ={}".format(one_war_found, no_wars_found))
print("\t\tWAR exists = {}".format(war_exists_in_extension))
print("\t\tWAR exists = {}".format(war_cnt))

open("wars.dat","w").write(wars_out)
with open("wars.json", "w") as jf:
    json.dump(war_data, jf)

    #if len(js_only.replace("\n","").strip()) > 5:
    #    using_cnt += 1
        #print("js_only***\n{}".format(js_only))
        #open("tests2/{}.js".format(cex_loc),"w").write(js_only)
#    else:
        #print("DID NOT FIND CODE FOR " + cex_loc +"\n" + unquote(data))
    #print("\tNumber of extensions searched {}".format(used_data))
    #print("\tNumber of extensions where found code {}".format(using_cnt))
    #print("\tNumber of Files {}".format(len(selected_files)))
    # process(otf_fn, cex_loc)
    # process(emptypg_fn, cex_loc)



