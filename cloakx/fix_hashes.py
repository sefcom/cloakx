#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import glob
import json
import hashlib
count = 0
droplet_cnt = 0
for fn in glob.iglob("/mnt/d/tajs_only_cloak/**/hidex_config.json"):
    with open(fn,"r") as jf:
        jdata = json.load(jf)

    count+=1

    if "droplets" in jdata:
        droplet_cnt += 1
        for droplet in jdata["droplets"]:

            old_js = droplet["old_js"]
            md5 = hashlib.md5()
            old_js = old_js[:-1]
            md5.update(old_js.encode("utf-8"))
            new_hash = md5.hexdigest()

            #print("{}\n{}\n{}\n\n".format(old_js[-1]=="\n",new_hash, droplet["hash"] ))

            droplet["hash"] = new_hash
            droplet["old_js"] = old_js

        #with open(fn, "w") as jf:
        #    json.dump(jdata, jf)

        appid = ""
        for val in fn.split("/"):
            if len(val) == 32:
                appid = val
                break
        print("ssh alex mkdir /mnt_exts/updated_configs/{}".format(appid))
        print("rsync {} alex:/mnt_exts/updated_configs/{}/hidex_config.json"
              .format(fn, appid))


print("Droplets = {} Total {}".format(droplet_cnt, count))
