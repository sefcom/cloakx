import os

exts = []
tokens = {}
with open("./sample_of2356.txt", "r") as fin:
    for l in fin.readlines():
        tmp = l.strip().split("\t")
        ext = tmp[0]
        #exts.append(ext)
        
        if not os.path.isfile("2356extensions_output_original/" + ext + "-log.txt"):
            continue

        filename = "../hidex/onthefly_overwrite/final_pipeline/shared_folder/more_joint_tests_by_alex/no_wars_2356/" + ext + "/onthefly_config.js"
        if not os.path.isfile(filename):
            filename = "../hidex/onthefly_overwrite/final_pipeline/shared_folder/more_joint_tests_by_alex/no_wars_2356/" + ext.split("_")[0] + "/onthefly_config.js"
            ext = ext.split("_")[0]
       
        #if ext == "aaakpbbojhipcodjiknnbjkafgjolnjn_1_1_3":
        #    print("hi!")
             
        exts.append(ext)
        with open(filename, "r") as fin:
            for l in fin.readlines():
                if l.startswith("global_map_to_random"):
                    token = l.strip().split("cloakx_")[1]
                    token = token.split("'")[0]
                    prev = tokens.get(ext, set())
                    prev.add("cloakx_" + token)
                    tokens[ext] = prev
                    if ext == "aaakpbbojhipcodjiknnbjkafgjolnjn_1_1_3":
                        print(prev)
        if len(tokens.get(ext, set())) == 0:
            print(ext)
            exts.remove(ext)
            
                           
#print(tokens.values()[0])
#print(tokens["dd_djcfdncoelnlbldjfhinnjlhdjlikmph_0_9_3.html"])

print(len(set(exts)))

found_per_ext = {}
done = []
for f in ["2356extensions_output_proxied"]:
    for ext in exts:
        if not os.path.isfile("2356extensions_output_proxied/" + ext + "-log.txt"):
            continue
        
        for p in ["-1.html", "-2.html", "-3.html"]:
            path = f + "/" + ext + p
            if not os.path.exists(path):
                #print(ext)
                continue
            with open(path, "r") as fin:
                dump = fin.read()
                found_tokens = []
                for t in tokens[ext]:
                    if t in dump:
                        found_tokens.append(t)
                #if ext.endswith("dd_djcfdncoelnlbldjfhinnjlhdjlikmph_0_9_3.html"):
                #    print(">>> " + " ".join(found_tokens))
                
                if len(found_tokens) > 0:
                #if len(set(found_tokens)) == len(set(tokens[ext])):
                #if set(found_tokens) == set(tokens[ext]):
                    done.append(ext)
                found_per_ext[ext] = set(found_tokens)

done = list(set(done))

print(len(done))
#print(done[0])

#print(len(set(exts) - set(done)))
#print("\n".join(list(set(exts) - set(done))))

#print("Found:")
#print((found_per_ext["dd_micdflbloikncjlmgckpiegheelgmeec_1_6.html"]))
#print("Obfuscated:")
#print((tokens["dd_micdflbloikncjlmgckpiegheelgmeec_1_6.html"]))


