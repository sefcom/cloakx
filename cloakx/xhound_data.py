import json
from os.path import isfile, isdir, join, abspath, splitext, basename, exists, dirname
import re
from bs4 import BeautifulSoup
from urllib import parse
import csv
from sys import maxsize

class XHoundActions:
    ATTRIBUTE = 'ATTRIBUTE'
    NEW_NODE = 'NEW NODE'
    DEL_NODE = 'DEL_NODE'
    TEXT = 'TEXT'

    @staticmethod
    def storage_dictionary():
        xhk = XHoundActions()
        all_attrs = [attr for attr in dir(xhk) if not callable(getattr(xhk, attr)) and not attr.startswith("__")]
        starting_dict = {}

        for attr in all_attrs:
            starting_dict[getattr(xhk, attr)] = []
        return starting_dict

    @staticmethod
    def regex():
        outstr = ""
        xhk = XHoundActions()
        all_attrs = [attr for attr in dir(xhk) if not callable(getattr(xhk, attr)) and not attr.startswith("__")]
        for attr in all_attrs:
            outstr += getattr(xhk, attr) + ":|"
        if len(outstr) > 0:
            outstr = outstr[:-1]
        return outstr


#TODO: add unique attribute extraction
def extract_var_data(html, common_html_attrs):
    soup = BeautifulSoup(html, 'html.parser')

    cls_search_tokens = set()
    id_search_tokens = set()
    attribute_search_tokens = set()
 ######## RIGHT HERE !!!!!!!! TODO: add unique


    for tag in soup.find_all():

        if tag.has_attr("class"):
            for cls in tag["class"]:
                if cls not in cls_search_tokens:
                    cls_search_tokens.add(cls)
        if tag.has_attr("id"):
            tid = tag["id"]
            if tid not in id_search_tokens:
                id_search_tokens.add(tid)

    tokens = {'ID': id_search_tokens, 'CLASS': cls_search_tokens, 'ATTRIBUTE': attribute_search_tokens}
    return tokens

def get_xhound_data():
    xhound_data_json_fn = join(dirname(abspath(__file__)), "xhound_data.json")

    if (exists(xhound_data_json_fn)):
        with open("xhound_data.json", "r") as xout:
            apps = json.load(xout)
            return apps

    common_html_attrs = get_viable_attributes()

    xhound_data_csv_fn = join(dirname(abspath(__file__)), "xhound_data.txt")

    keywords = XHoundActions.regex()
    xpat = re.compile("(%s)((.+?(?=(%s)))|.+$)" % (keywords, keywords))
    xhound_actions = {}
    apps = {}
    if (exists(xhound_data_csv_fn)):
        csv.field_size_limit(maxsize) # increase max size allowed
        with open(xhound_data_csv_fn, "r") as csvout:
            csvdata = csv.reader(csvout, delimiter="\t")
            for row in csvdata:

                appid = row[1]
                for colptr in range(5,len(row)):
                    col =parse.unquote(row[colptr])

                    #print (col)
                    for match in re.finditer(xpat, col):
                        xhound_attribute = match.group(1).replace(":", "").strip()
                        xhdeets = extract_var_data(match.group(2).rstrip(), common_html_attrs)
                        for key in xhdeets:
                            if key not in xhound_actions:
                                xhound_actions[key] = {}

                            for item in xhdeets[key]:
                                #print (item)
                                if item in xhound_actions[key]:
                                    if xhound_actions[key][item].find(xhound_attribute) == -1:
                                        xhound_actions[key][item] += ", " + xhound_attribute
                                else:
                                    xhound_actions[key][item] = xhound_attribute

                #print(appid)
                if len(appid) > 5:
                    apps[appid] = xhound_actions
                    xhound_actions = {}

            # for key, val in apps.items():
            #     if "ID" in val:
            #         if len(val['ID']) > 0:
            #             print(("{}  {}".format(key, val["ID"]))[0:140])

            with open(xhound_data_json_fn, "w+") as xout:
                json.dump(apps, xout, indent="  ")
    return apps


def get_viable_attributes():

    try:
        f = open('html4.dtd')
    except Exception as ex:
        f = open('/home/etrickel/Dropbox (ASU)/Private-Browser-Ext/hidex/cloakx/html4.dtd')
        
    dtd_doc = f.read()
    f.close()

    import re

    eles = re.split(">\n",dtd_doc)

    entvar_pat = re.compile("<!ENTITY\s*?%\s([0-9a-zA-Z_-]{0,128})(\s*\n*\s*)\"(.*)\"", re.DOTALL)
    recurvar_pat = re.compile("%([0-9a-zA-Z_-]{0,128});?")
    variables = {}
    for e in eles:
        #print (repr(e))
        for match in re.finditer(entvar_pat, e):
            var_name =  match.group(1)
            variables[var_name] = set()
            #print (match.group(1))
            if (match.group(3)):
                values = match.group(3)
                #print("\t\t" + match.group(3))
            else:
                values = match.group(2)
                #print("\t" + match.group(2))

            for v in values.split("\n"):
                temp = v.strip()
                if len(temp) > 0 and temp[0] == "%":
                    for match in re.finditer(recurvar_pat, temp):
                        var_to_find = match.group(1)
                        temp = temp.replace(var_to_find, "")
                        variables[var_name].update(variables[var_to_find])
                else:
                    temp = temp.split(" ")[0].strip()
                    variables[var_name].add(temp)

            #print ("%s : %s" % (var_name, variables[var_name]))


    #print("-"*50)
    attlist_pat = re.compile("<!ATTLIST\s*([0-9a-zA-Z_-]{0,128})(\s*(\\n)*\s*)(.*)", re.DOTALL)

    helems = {}
    for e in eles:
        # print (repr(e))
        for match in re.finditer(attlist_pat, e):

            ele_name = match.group(1)
            if len(ele_name) > 0:
                helems[ele_name] = set()
                values = ""
                for g in match.groups():
                    if g is None or g == ele_name or len(g.strip()) == 0:
                        continue
                    else:
                        values = g
                        for v in values.split("\n"):
                            v = v.strip()
                            if len(v) == 0:
                                continue
                            if v[0] == '%':
                                var_to_find = re.search(recurvar_pat, v).group(1)
                                helems[ele_name].update( variables[var_to_find])
                            else:
                                temp = v.split(" ")[0].strip()
                                helems[ele_name].add(temp)

                            # if v.find(" ") > -1:
                            #
                            #     if (temp[-1:] == ";"):
                            #         temp = temp[:-1]
                            #
                            #     if temp[0] == "%":
                            #         temp = temp[1:]
                            #         print (temp)
                            #         if temp in variables:
                            #             helems[ele_name].union(variables[temp])
                            #     else:


                #print("%s : %s" % (ele_name, helems[ele_name]))
    return helems

if __name__ == "__main__":
    get_xhound_data()

