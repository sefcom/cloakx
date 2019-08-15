#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from tqdm import tqdm
from termcolor import cprint
from os.path import exists, join, basename
import sys
import glob
SKIPPED = 1
PROCESSED = 0
NO_WARMAP = 2

def log_error(msg):
    cprint(msg, "red")
    open("check_all_renames_error.log", "a").write(msg + "\n")

def scan_extension(ext_dir, app_id):
    hidex_config = join(ext_dir, "hidex_config.json")
    if not exists(hidex_config):
        return SKIPPED
    with open(hidex_config, "r") as jf:
        jdata = json.load(jf)

    if "war_map" not in jdata:
        log_error("Error manifest in {} did not contain 'war_map' key".format(dir))
        return NO_WARMAP

    war_map = jdata['war_map']

    all_files = glob.glob(join(ext_dir, "**/*"), recursive=True)

    for old_name, new_name in war_map.items():
        found_cnt = 0
        for f in all_files:
            if f.endswith(new_name):
                found_cnt +=1
        if found_cnt == 1:
            #perfect
            pass
        elif found_cnt == 0:
            log_error("{} : {} NOT FOUND ".format(app_id, new_name))
        elif found_cnt > 1:
            log_error("{} : {} TOO MANY FOUND ".format(app_id, new_name))
    return PROCESSED

def main(basedir):
    nowm_cnt = 0
    skip_cnt = 0
    processed_cnt = 0
    total_cnt = 0
    open("check_all_renames_error.log", "w").write("")
    #basedir = "/mnt/d/v6_all_xhounds_war_ren_only_2356/"

    ext_dirs = glob.iglob(join(basedir, "*"))
    list_dirs = []
    for cex_report in ext_dirs:
        list_dirs.append(cex_report)
    pbar = tqdm(range(0, len(list_dirs)), desc="Loading Extensions")
    for i in pbar:
        cex_loc = list_dirs[i]
        appid = basename(cex_loc)
        pbar.set_description("Processing:{}".format(appid))
        results = scan_extension(cex_loc, appid)

        if results == NO_WARMAP:
            nowm_cnt += 1
        elif results == SKIPPED:
            skip_cnt += 1
        elif results == PROCESSED:
            processed_cnt += 1
        total_cnt += 1

    print("Skipped: {}".format(skip_cnt))
    print("No war_map: {}".format(nowm_cnt))
    print("processed_cnt: {}".format(processed_cnt))
    print("total_cnt: {}".format(total_cnt))

if __name__ == "__main__":
    if len(sys.argv) == 1:
        main("data/jsons")
    else:
        main(sys.argv[1])

