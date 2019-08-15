import os
import json

exts = []
tokens = {}
with open("./sample_of100_updated.txt", "r") as fin:
    for l in fin.readlines():
        tmp = l.strip().split("\t")
        ext = tmp[0]
        exts.append(ext)
        '''
        with open("./100extensions_new_patched/" + tmp[0] + "/onthefly_config.js", "r") as fin:
            for l in fin.readlines():
                if "onthefly_" in l:
                    token = l.strip().split("onthefly_")[1].split("_css")[0]
                    prev = tokens.get(ext, set())
                    prev.add("onthefly_" + token + "_css")
                    tokens[ext] = prev
        '''

count = 0
            
for ext in exts:
    logs1 = set()
    with open("100extensions_output_original2/" + ext + "-log.txt", "r") as fin:
        for l in fin.readlines():
            #logs1.add(l.strip())
            msg = json.loads(l.strip())
            msg["timestamp"] = ""
            logs1.add(str(sorted(msg.items())))
    logs2 = set()
    with open("100extensions_output_patched2/" + ext + "-log.txt", "r") as fin:
        for l in fin.readlines():
            #logs2.add(l.strip())
            msg = json.loads(l.strip())
            msg["timestamp"] = ""
            logs2.add(str(sorted(msg.items())))

    # Both are 93 cases!    
    if logs1 == logs2:
    #if len(logs1) == len(logs2):
        count += 1
    else:
        print(ext)
        print(logs2 - logs1)
        print("-----")
        
    #if ext == "polahlomkjnohnamcebkmhdhmmlioimd_1_2":
    #    print(logs1)
    #    print(logs2)

    

print(count)

    
