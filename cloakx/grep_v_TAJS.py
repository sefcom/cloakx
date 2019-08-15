import json
from os.path import basename, splitext
import glob
import re
import glob, json
from tqdm import tqdm


list_dirs = []
ext_dirs = glob.iglob("/mnt/d/hidex-local/cloakx/data/jsons/*.json")
for cex_report in ext_dirs:
    list_dirs.append(cex_report)
rep_data = []
for i in tqdm(range(0, len(list_dirs)), desc="Extensions"):
    cex_report = list_dirs[i]
    with open(cex_report, "r") as jf:
        temp = json.load(jf)
        temp[0]["appid"] = splitext(basename(cex_report))[0]
        rep_data.append(temp)

with open("wars.json","r") as jf: dwars = json.load(jf)


mat_appids=set()
js_found = 0
retty_match = []
for ext in rep_data:
    ext = ext[0]
    if "war_map" in ext and ext["appid"] in dwars:
#        print (ext["appid"])
        d_app_wars = dwars[ext["appid"]]
        cs_ids = [] #d_app_wars["classes"]
        cs_ids.extend(d_app_wars["ids"])
        cs_ids = list(set(cs_ids))

        for k,d in ext["war_map"].items():
            if k == "finish_ts": continue
            if not k.endswith(".js"): continue
            for ij_file in d_app_wars["wars"]:
                if k.endswith(basename(ij_file)):
                    for fn in glob.iglob("/mnt/d/Xhound_Exts/" + ext["appid"] + "/**/" + d):
                        js_data = open(fn,"r").read()
                        found = False
                        found_item = dict()
                        for item in cs_ids:
                            if js_data.find(item) > -1:
                                all_matches = re.findall(item,js_data)
                                found = True
                                found_item[item] = len(all_matches)
                        if found:
                            for w in ext["droplets"][0]["wars"]:
                                if w["filename"] == fn and "error" not in w:
                                    retty_match.append((fn, found_item, w["matches"]))
                                    #print ("{} {}".format(fn,found_item))
                                    js_found += 1
print(json.dumps(retty_match, indent=4))




#actual_matches is from data_report
actual_matches = ['/mnt/d/Xhound_Exts/afacfppcedpinkojedhcaokjbfihiebp/i9y5bv_funciones.js', '/mnt/d/Xhound_Exts/bchnamjcpocgphheheekmchilaabjdnb/qn87qy_page_script.js', '/mnt/d/Xhound_Exts/bghjgajoiopjdomgbjbgbeendnpleglc/xzlb8q_injection.js', '/mnt/d/Xhound_Exts/bhlchidmlalaccjoechflhbgkgkndjoh/scripts/4kxxrp_script.js', 'droplet_e35ebb95f139042f3f9b895d91650d02', '/mnt/d/Xhound_Exts/cbimabofgmfdkicghcadidpemeenbffn/js/p5j24w_pageScript.js', '/mnt/d/Xhound_Exts/cgaocdmhkmfnkdkbnckgmpopcbpaaejo/content_scripts/kp0gli_lib_detect.js', '/mnt/d/Xhound_Exts/cnnmjeggdmicjojlnjghdgkdlijiobke/6typhv_detector.js', '/mnt/d/Xhound_Exts/dibjolekoofgnehcoecjjokehebncdhp/lork3k_inject.js', '/mnt/d/Xhound_Exts/egfnnnfdmdpjaelfbndjfclonlfpfacf/qtu94n_detector.js', '/mnt/d/Xhound_Exts/epckjefillidgmfmclhcbaembhpdeijg/kq46aw_notify_hook.js', 'droplet_7781f962b19b188aec211e3b998aa020', '/mnt/d/Xhound_Exts/fhhdlnnepfjhlhilgmeepgkhjmhhhjkh/js/0ef9aq_detector.js', '/mnt/d/Xhound_Exts/fkkiledfpofpabjblkjjeapmiiedjndm/js/q2k84f_popunder_analyzer_content.js', 'droplet_5c883d226fbe4cc22743b7f5781beaf7', '/mnt/d/Xhound_Exts/gdbojpeicfhjmehcbbpffcdbifgikgjl/js/ueg6g7_popunder_analyzer_content.js', 'droplet_5431db892f1d5bd900d434d1c963a461', 'droplet_3457765a85dd504a69f4021ecd51aed7', '/mnt/d/Xhound_Exts/ibgjbjnjknkohmdoijjfcdhoomffoiae/5dmq2r_inject.js', 'droplet_95ac89c8826323cfc5aa9e2d4737b04d', 'droplet_6981ab3e002b74b47c2eea01c9ab294b', 'droplet_bd90120fdf4b2c0fdfa7fde8746eae55', '/mnt/d/Xhound_Exts/kobbebjdlkjcdbnnonblhfofcajfkigj/js/j4dnyo_pageAgent.js', '/mnt/d/Xhound_Exts/ldfboinpfdahkgnljbkohgimhimmafip/ku5emq_native-commands-handler.js', '/mnt/d/Xhound_Exts/mbmnchcghndejohlahcjfhmiocgiklbn/js/in73c5_popunder_analyzer_content.js', '/mnt/d/Xhound_Exts/mhdcaiodhdpcjcphclghpmlpmfgmibng/js/4gdi0g_popunder_analyzer_content.js', 'droplet_bd90120fdf4b2c0fdfa7fde8746eae55', '/mnt/d/Xhound_Exts/njeebhjilmmcmiikhknfpidmgeohkadh/scripts/zkl3la_page_options_extension.js', '/mnt/d/Xhound_Exts/njhjcpdcjnbehafecnoknepjcoefbgmo/js/rz6p5a_popunder_analyzer_content.js', '/mnt/d/Xhound_Exts/nmeoibhnikioaihlkpfajfnjbhkbpchp/plugin/js/gk32yt_ytht.main.js', '/mnt/d/Xhound_Exts/nmeoibhnikioaihlkpfajfnjbhkbpchp/plugin/js/common/55qex2_cmnConstant.js', '/mnt/d/Xhound_Exts/odkdoekijebogaiopbjgkgogkgifjfnk/fsczm8_detector.js', '/mnt/d/Xhound_Exts/olfjeepflfbeaecgmlphadojomeidpif/src/mocciu_detector.js', '/mnt/d/Xhound_Exts/pbkgodffljfhdlinelnhklhcdoiedbej/f17cjo_drawController.js']

aactual_matches = set(actual_matches)
count = 0
for x in retty_match:
    if x[0] not in actual_matches:
        print (x)
        count +=1
print (count)