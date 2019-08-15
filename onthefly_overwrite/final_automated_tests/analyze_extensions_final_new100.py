import os

exts = []
tokens = {}
with open("./sample_of100_updated.txt", "r") as fin:
    for l in fin.readlines():
        tmp = l.strip().split("\t")
        ext = tmp[0]
        exts.append(ext)
        with open("./100extensions_new_patched/" + tmp[0] + "/onthefly_config.js", "r") as fin:
            for l in fin.readlines():
                if "onthefly_" in l:
                    token = l.strip().split("onthefly_")[1].split("_css")[0]
                    prev = tokens.get(ext, set())
                    prev.add("onthefly_" + token + "_css")
                    tokens[ext] = prev
                           
#print(tokens.values()[0])
#print(tokens["dd_djcfdncoelnlbldjfhinnjlhdjlikmph_0_9_3.html"])

print(len(set(exts)))

found_per_ext = {}
done = []
for f in ["100extensions_output_patched2"]:
    for ext in exts:
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
                
                #if len(found_tokens) > 0:
                #if len(set(found_tokens)) == len(set(tokens[ext])):
                if set(found_tokens) == set(tokens[ext]):
                    done.append(ext)
                found_per_ext[ext] = set(found_tokens)

done = list(set(done))

print(len(done))
#print(done[0])

#print(len(set(exts) - set(done)))
print("\n".join(list(set(exts) - set(done))))

#print("Found:")
#print((found_per_ext["dd_micdflbloikncjlmgckpiegheelgmeec_1_6.html"]))
#print("Obfuscated:")
#print((tokens["dd_micdflbloikncjlmgckpiegheelgmeec_1_6.html"]))


