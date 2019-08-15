from zipfile import ZipFile
import glob
from os import walk, path
from os.path import isfile, isdir, join, abspath, splitext, basename, exists, dirname
from os import rename as file_rename
import json
import pprint
import string
import random
import fileinput
import re
import time
from cloakx.utils import log_factory
from cloakx.CloakCSS import CloakCSS
from cloakx.CloakHTML import CloakHTML
from cloakx.CloakJS import CloakJS
from termcolor import cprint, colored
from cloakx.xhound_data import get_xhound_data, XHoundActions
import codecs
log = log_factory('cloak')

MANIFEST_FN = 'manifest.json'
pp = pprint.PrettyPrinter(indent=2)

class ExtensionError(Exception):
    pass

class CloakExceptionError(Exception):
    pass


def safejoin(path, *paths):
    for p in paths:
        if p.find("/") > -1 or p.find("\\") > -1:
            subpaths = []
            if "/" in p:
                subpaths = p.split("/")
            elif "\\" in p:
                subpaths = p.split("\\")
            for subp in subpaths:
                path = join(path, subp)
        else:
            path = join(path, p)
    return path


def file_text_replace(file_to_search, text_to_search, text_to_replace, use_prefix=False):
    # https://stackoverflow.com/questions/17140886/how-to-search-and-replace-text-in-a-file-using-python
    encoding = 'utf-8'
    try:
        text_data = open(file_to_search, 'r', encoding=encoding).read()
    except UnicodeDecodeError as ude :
        try:
            encoding = 'latin'
            text_data = open(file_to_search, 'r', encoding=encoding).read()
        except:
            log.exception("SECOND TRY to read from {} using utf-8 or latin-1 " + file_to_search)
            print("Error reading from {}".format(file_to_search))
            raise CloakExceptionError("failed to open {}".format(file_to_search))

    import sre_constants
    if use_prefix:
        regex_search = "([/\"\'])" + re.escape(text_to_search) + "([#\?\'\"\) ])"
        sub_replace_text = "\g<1>" + text_to_replace + "\\2"
    else:
        regex_search = re.escape(text_to_search) + "([#\?\'\"\) ])"
        found_cnt_og_method = len(re.findall(regex_search, text_data))

        regex_search = "([^a-zA-Z0-9_-])" + re.escape(text_to_search) + "([#\?\'\"\) ])"
        found_cnt_new_method = len(re.findall(regex_search, text_data))

        sub_replace_text = "\g<1>" + text_to_replace + "\\2"
        if found_cnt_og_method != found_cnt_new_method:
            regex_found_line = ".{0,20}" + re.escape(text_to_search) + "[#\?\'\"\) ].{0,20}"
            all_toks = re.findall(regex_found_line, text_data)
            found_toks = "\t\t\n".join(all_toks)
            cprint("\tAutomatically switched to requiring prefix, please review " +
                   "file={}\n\tcnt_with={}v{} to_search={}\n{}"
                   .format(file_to_search, found_cnt_og_method, found_cnt_new_method, text_to_search, found_toks),
                   "yellow")
    try:
        num_replacements = len(re.findall(regex_search, text_data))
        text_data = re.sub(regex_search, sub_replace_text, text_data)
    except sre_constants.error as sreerr:
        cprint("\tError with replacement " +
               "file={}\n\trexex={} replace={}\n{}"
               .format(basename(file_to_search), regex_search, sub_replace_text, sub_replace_text),
               "yellow")
        raise(sre_constants.error(sreerr))
    # if basename(file_to_search) == "manifest.json" and text_to_search.endswith("analytics.js"):
    #     regex_found_line = ".{0,20}" + "[/\"\']" + re.escape(text_to_replace) + "[#\?\'\"\) ]" + ".{0,20}"
    #     all_toks = re.findall(regex_found_line, text_data)
    #     cprint("\tplease review " +
    #            "file={}\n\tto_search={} finds={}\n{}\n{}"
    #            .format(basename(file_to_search), text_to_search, num_replacements, regex_search, all_toks),
    #            "yellow")
    #

    #text_data = text_data.replace(text_to_search, text_to_replace)

    try:
        open(file_to_search, 'w', encoding=encoding).write(text_data)
    except:
        log.exception("SECOND TRY to write to {} using utf-8 or latin-1 " + file_to_search)
        exit(88)
        raise CloakExceptionError("failed to write to {} using utf-8 or latin-1".format(file_to_search))

    return num_replacements

class Extension:
    xhd = get_xhound_data()

    def __init__(self, extension_loc):
        if isfile(extension_loc):
            print ("unzipping and creating folder")
            zip_ref = ZipFile(extension_loc, 'r')
            self._dir = abspath(splitext(extension_loc)[0])
            zip_ref.extractall(self._dir)
            zip_ref.close()
        elif isdir(extension_loc):
            self._dir = abspath(extension_loc)

        self._manifest_fp = None
        self._name = None
        self._wars = []
        self._wars_search_token = []
        self._manifest = None
        self._has_war_wildcard = False
        self._all_contents = []
        self._rnd = random.SystemRandom()
        self._failed_to_open_files = []
        self._job_num = 0
        # sets main_dir to _dir if it contains the manifest, otherwise, a version directory is assumed
        # and it searches until it finds the first directory containing a manifest.json
        # if a manifest is not found using either method an exception is raised.

        self._appid = basename(self._dir)
        #print("SELF._DIR={}".format(self._dir))
        manifest_path = join(self._dir, MANIFEST_FN )
        if exists(manifest_path):
            self._main_dir = self._dir
            #print("***** {}".format(self._main_dir))
            self._manifest_fp = manifest_path
        else:
            vdirs = glob.glob(join(self._dir, "*"))
            for vdir in  vdirs:
                if isdir(vdir):
                    root_contents = glob.glob(join(vdir, "*"))
                    for ele in root_contents:
                        if ele.endswith(MANIFEST_FN):
                            if basename(ele) != MANIFEST_FN:
                                raise ExtensionError("This shouldn't happen...full {} v basename {}".format(ele, basename(ele)))
                            self._main_dir = vdir
                            self._manifest_fp = join(vdir, MANIFEST_FN)
                            #print(ele)
                            break
                    if self._manifest_fp is not None:
                        break

        if self._manifest_fp is None:
            raise ExtensionError("could not find properly formed extension under {}".format(self._dir))
        #print("manifest_fp = {}".format(self._manifest_fp))
        self._load_manifest()

        self._load_critical_info()
        self.cloak_results_fn = "data/jsons/" + self.getappid() + ".json"

    @property
    def num_of_wars (self):
        return len(self._wars)

    @property
    def num_of_war_search_toks(self):
        return len(self._wars_search_token)

    @property
    def get_path(self):
        return self._dir

    def _load_critical_info(self):
        critinfo_fn = join(self._main_dir, 'critical_info.dat')
        if exists(critinfo_fn):
            critinfo_file = open(critinfo_fn, 'r', encoding='utf-8')
            crit_info = json.load(critinfo_file)
            critinfo_file.close()
            self._name = crit_info['title']
            self._rating = crit_info['rating']
            self._num_users = crit_info['num_users']
        else:
            self._name = "unknown"
            self._raiting = "5"
            self._num_users = "-1"

    @staticmethod
    def insensitive_glob(pattern, recursive=False):
        def either(c):
            return '[%s%s]' % (c.lower(), c.upper()) if c.isalpha() else c

        return glob.glob(''.join(map(either, pattern)))


    def get_war_files(self, app_dir, start_dir):

        filenames = glob.glob(start_dir, recursive=True)
        found_wars = self.do_file_search(app_dir, filenames)

        if len(found_wars) == 0:
            filenames = Extension.insensitive_glob(start_dir, recursive=True)
            found_wars = self.do_file_search(app_dir, filenames, True)


        return found_wars

    def do_file_search(self, app_dir, filenames, secondtry=False):
        out_wars2 = []
        for filename in filenames:
            if not exists(filename):
                if secondtry:
                    cprint("BOOOO!!! {}".format(filename), "blue")
                    all_contents = self.get_all_filenames()
                    for fn in all_contents:
                        if fn.lower() == filename.lower():
                            cprint("YES!!! {}".format(filename), "green")
                            break
            elif isfile(filename):
                if basename(filename).lower() != MANIFEST_FN and basename(filename) != 'messages.json':
                    file_parts = filename.split(app_dir)
                    rel_name = file_parts[len(file_parts) - 1]
                    rel_name = rel_name.replace("\\", "/")
                    rel_name = rel_name.replace("/.", "")
                    if rel_name.startswith("./"):
                        rel_name = rel_name[2:]
                    elif rel_name.startswith("/"):
                        rel_name = rel_name[1:]

                    out_wars2.append(rel_name)
        return out_wars2

    def _load_manifest(self):
        self._wars = []
        self._wars_search_token = []

        manifest_contents = self.get_file_contents(self._manifest_fp)
        self._manifest = json.loads(manifest_contents)


        if "web_accessible_resources" in self._manifest:
            temp_wars = self._manifest["web_accessible_resources"]
        else:
            return

        # copy each WAR and expand any wildcards
        for war in temp_wars:

            if war.find("*") > -1:
                # since this is checking urls and such, keep the forward slash and do not use join
                war_dir = self._main_dir + "/" + war
                war_expansion= [] #glob.iglob(war_dir, recursive=True)
                #print(glob.glob(war_dir, recursive=True))
                temp_war = war.replace("*.*", "*")
                temp_war = temp_war.replace("**", "*")
                temp_war = temp_war.replace("*", "**/*")
                start_dir1 = self._main_dir + "/" + temp_war
                extra_wars = self.get_war_files(self._main_dir, start_dir1)

                start_dir2 = self._main_dir + "/" + war
                temp_ex_wars = self.get_war_files(self._main_dir, start_dir2)
                extra_wars.extend(temp_ex_wars)
                if war.endswith("*"):
                    start_dir3 = self._main_dir + "/" + war + "*"
                    temp_ex_wars = self.get_war_files(self._main_dir, start_dir3)
                    extra_wars.extend(temp_ex_wars)

                if len(extra_wars) > 0:
                    #print("{} found {} wars".format(start_dir, len(extra_wars)))
                    self._wars.extend(extra_wars)
                # else:
                #     if war.endswith("*"):
                #         # add additional star to end so that it recurses all sub directories too
                #
                #         cprint("\t\t\tno wars found for war filter ending with * ", "red")
                #         cprint("\t\t\tsd1=" + start_dir1 + "\n\t\t\tsd2=" + start_dir2 + "\n\t\t\tsd3=" + start_dir3,
                #             "yellow")
                #     else:
                #         cprint("\t\t\tno wars found for war filter containing *", "red")
                #         cprint("\t\t\tsd1=" + start_dir1 + "\n\t\t\tsd2=" + start_dir2 ,"yellow")
                #self._has_war_wildcard = True
            else:
                #print("MAINDIR_2={}".format(self._main_dir))

                if basename(war) == MANIFEST_FN and dirname(war) == "/" or basename(war) == 'messages.json':
                    #print("skipping manifest.json")
                    pass
                else:
                    if isfile(self._main_dir + "/" + war):
                        self._wars.append(war)
                    else:
                        filename = self._main_dir + "/" + war
                        all_contents = self.get_all_filenames()
                        for fn in all_contents:
                            if fn.lower() == filename.lower():
                                self._wars.append(war)
                                break
                        #print("{} is missing".format(self._main_dir + "/" + war))
                        pass


        # make sure no duplicates
        self._wars = list(set(self._wars))
        if len(self._wars) == 0:
            cprint("{} has NO wars".format(self._appid), "yellow")
        #print (self._wars)
        #print("\tProcessing {} WARs".format(len(self._wars)))

        self._wars_search_token = self.build_search_tokens(self._wars)
        # print()
        # print (sorted(self._wars_search_token))

    def has_wars_declared(self):
        return len(self._wars) > 0

    def build_search_tokens(self, wars):
        token_cnt = {}
        all_files = glob.glob(join(self._main_dir, "**"), recursive=True)
        for war in wars:
            tester = basename(war)

            if len(tester) > 0 and isfile(safejoin(self._main_dir, war)):
                token_cnt[tester] = 0

        have_mult = True
        rnd_cnt = 1
        while have_mult == True:
            have_mult = False
            for key in token_cnt.keys():
                token_cnt[key] = 0

            if "tether-theme-arrows.sass" in token_cnt:
                erikwazhere=""

            for f in all_files:
                if f.endswith("_metadata/verified_contents.json"):
                    #skip it
                    continue
                all_paths = f.split(path.sep)

                if rnd_cnt > len(all_paths):
                    continue
                else:
                    base_fn = "/".join(all_paths[-(rnd_cnt):])

                if (base_fn in token_cnt):
                    if isdir(f):
                        pass
                    else:
                        token_cnt[base_fn] += 1
                        if base_fn.endswith("tether-theme-arrows.sass"):
                            erikwazhere = ""
                    if token_cnt[base_fn] > 1:
                        have_mult = True
                elif base_fn.find("/") == -1:

                    for tk in token_cnt.keys():
                        # fixes when token is ambiguous because by itself it ends the name
                        # of another resource. e.g., Clipper.js isn't unique for the find/replace
                        # if Clipper.js and GmailClipper.js both exists
                        if base_fn.endswith(tk):
                            token_cnt[tk] += 1
                            #print("{} {} {}".format(base_fn, tk, token_cnt[tk]))
                            if token_cnt[tk] > 1:
                                have_mult = True



# problem is images/head.svg and bar/images/head.svg

            if have_mult:
                for war in wars:
                    absolute = False
                    tester = war
                    if rnd_cnt == 1:
                        tester = basename(war)
                    else:
                        all_paths = war.split("/")
                        if rnd_cnt >= len(all_paths):
                            use_tallest = len(all_paths)
                            absolute = True
                            tester = "/".join(all_paths[-(use_tallest):])
                        else:
                            tester = "/".join(all_paths[-(rnd_cnt):])

                    #tester = basename(war)
                    if tester in token_cnt:
                        if token_cnt[tester] > 1:
                            token_cnt.pop(tester, None)
                            for war_to_add in wars:
                                comp = war_to_add
                                if not comp.startswith("/"):
                                    comp = "/" + comp
                                if absolute and tester == war_to_add:
                                    token_cnt[tester] = 0
                                elif not absolute and (comp.endswith("/" + tester) or comp.endswith("\\" + tester)):
                                    areas = war_to_add.split(tester)

                                    if len(areas) > 1:
                                        loc = len(areas) - 2
                                        new_name = basename(areas[loc][:-1]) + areas[loc][-1:] + tester
                                        if new_name == "bower_components/history.js":
                                            erikwazhere=""
                                        if isfile(join(self._main_dir, war_to_add)):
                                            token_cnt[new_name] = 0
                rnd_cnt += 1


        return token_cnt.keys()

    def get_filtered_filenames(self, filter):
        filt_fns = []
        all_fns = self.get_all_filenames()
        for fn in all_fns:
            if filter(fn):
                filt_fns.append(fn)

        return filt_fns


    def get_all_filenames(self):
        if not self._all_contents :
            for root, directories, filenames in walk(self._main_dir):
                for directory in directories:
                    if directory != self._main_dir:
                        self._all_contents.append(join(root, directory))
                for filename in filenames:
                    self._all_contents.append(join(root, filename))
        # print("old={}, new={}".format(len(glob.glob(join(self._main_dir, "**/*"), recursive=True)),
        #                                   len(self._all_contents)))
        return self._all_contents

    def get_file_contents(self, entry, ignoreExts=['.jpg', '.png', '.gif', '.mac', '.eot', '.ttf', '.woff'], ignoreFiles=[]):
        contents = ""
        filename, file_extension = splitext(entry)

        if isfile(entry):
            if file_extension not in ignoreExts and basename(entry) not in ignoreFiles:
                try:
                    # do this first and if fails, can then try utf8, the other way doesn't work b/c
                    # json.loads() throws error if UTF BOM is encoded as utf8
                    contents = open(entry, encoding="utf-8-sig").read()

                except UnicodeDecodeError as ude:
                    if file_extension in ['.js', '.html', '.css', '.json']:
                        try:
                            contents = open(entry, encoding="utf8").read()
                        except:
                            try:
                                contents = open(entry, encoding="latin-1").read()
                            except Exception as openerr:
                                log.exception("SECOND TRY to open " + str(entry) +
                                              " in extension {} ({})".format(self._name, self._appid))
                                print("error, this cloaking is cancelled")
                                self._failed_to_open_files.append(entry)
                                raise CloakExceptionError("could not get contents of .js file")
                    # else:
                    #     print("skipping unknown filetype '{}'".format(entry))
        return contents

    def search_for_tokens(self, search_tokens):
        search_results = []
        ignoreFiles = ['manifest.json', 'js_errors.json', 'full_metadata.dat']

        all_files = self.get_all_filenames()
        for fn in all_files:
            #print (ignoreFiles)
            contents = self.get_file_contents(fn, ignoreFiles=ignoreFiles).split("\n")
            if len(contents) > 0:
                for tok in search_tokens:
                    str_exp = ".{0,120}" + tok + ".{0,120}"
                    regex = re.compile(str_exp)
                    line_no = 0
                    for line in contents:
                        line_no += 1
                        if line.find(tok) > -1:
                            outlines = ""
                            MAX_MULTILINE_LEN = 80
                            if len(line) < 80:
                                if line_no > 3 and len(contents[line_no - 3]) < MAX_MULTILINE_LEN:
                                    outlines += contents[line_no - 3] + "\n"
                                if line_no > 2 and len(contents[line_no - 2]) < MAX_MULTILINE_LEN:
                                    outlines += contents[line_no - 2] + "\n"
                                outlines += line + "\n"
                                if (line_no) < len(contents) and len(contents[line_no]) < MAX_MULTILINE_LEN:
                                    outlines += contents[line_no] + "\n"
                                if (line_no + 1) < len(contents) and len(contents[line_no + 1]) < MAX_MULTILINE_LEN:
                                    outlines += contents[line_no + 1] + "\n"
                                outlines = outlines[:-1]
                            else :
                                reg_srch = regex.search(line)
                                if reg_srch:
                                    outlines = reg_srch.group()
                                else:
                                    print ("ERROR: couldn't find token in str with reg ex")

                            fd = {'token': tok, 'file': fn, 'line_no': line_no, 'lines': outlines}
                            search_results.append(fd)
        return search_results

    def _get_files_accessing_wars(self):
        files_that_access = []

        all_files = self.get_all_filenames()
        for entry in all_files:
            contents = self.get_file_contents(entry)
            if len(contents) > 0:
                for war_token in self._wars_search_token:
                    if contents.find(war_token) > -1:
                        files_that_access.append((entry, war_token))

        return files_that_access

    def _create_map(self, rnd_length, token_list):
        static_name = "warcloakx"
        war_map = {}
        randoms = []
        for war_token in self._wars_search_token:
            if basename(war_token) == MANIFEST_FN:
                war_map[war_token] = war_token
                continue
            # make 100% sure random
            random_name = ''.join(self._rnd.choice(string.ascii_lowercase + string.digits)
                                  for _ in range(rnd_length))
            # while random in randoms:
            #     random_name = ''.join(self._rnd.choice(string.ascii_lowercase + string.digits)
            #                           for _ in range(self._rnd_length))
            bname = basename(war_token)
            #print("{} {} ".format(bname, war_token))
            new_war = self.rreplace(war_token, bname, static_name + "_" + random_name + "_" + bname, 1)
            #new_war = war_token.replace(bname, static_name + "_" + random_name + "_" + bname)
            war_map[war_token] = new_war

        return war_map

    def rreplace(self, s, old, new, occurrence):
        li = s.rsplit(old, occurrence)
        return new.join(li)

    def _update_extension(self, ft_access_wars, war_map):
        stats = {}
        num_of_replacements=0

        total_num_rep = 0

        # do content renames starting with longest war token first
        for acc_file, war_token in sorted(ft_access_wars, key=lambda x: len(x[1]), reverse=True):
            war = None
            wt_occurrs = 0
            for subsrch_tok in war_map.keys():
                if subsrch_tok.endswith(war_token):
                    wt_occurrs += 1

            for fwar in self._wars:
                if war_token.find("/") > -1:
                    if len(war_token) + 2 > len(fwar):
                        if fwar.endswith(war_token):
                            war = fwar
                    elif fwar.endswith("/" + war_token):
                        war = fwar
                else:
                    if wt_occurrs > 1 and war_token.find("/") > -1:
                        if fwar == war_token:
                            found = True
                            war = fwar
                    else:
                        if basename(fwar) == war_token:
                            found = True
                            war = fwar

            # if basename(acc_file) == "manifest.json" and war_token == "analytics.js":
            #     cprint("\twar={} isfile={}, war_token={}, wt_occurs={}".format(war, isfile(safejoin(self._main_dir, war)), war_token, wt_occurrs), "blue")
            #     print([basename(x) for x in self._wars])

            #replacing of war values in files done below
            if war is not None and isfile(safejoin(self._main_dir, war)):
                # resource to be replaced actually exists
                #print("\treplacing '{}' with '{}' in {}".format(war_token, war_map[war_token], (acc_file)))
                if war_token not in war_map:
                    erikwazhere=""
                if wt_occurrs > 1:

                    num_replacements = file_text_replace(acc_file, war_token, war_map[war_token], use_prefix=True)
                else:
                    num_replacements = file_text_replace(acc_file, war_token, war_map[war_token])
                total_num_rep += num_replacements
                stats[war] = {"num_replacements": num_replacements}

        num_renamed = 0
        num_failed_rename = 0
        #print("size of self._wars {} {}".format(len(self._wars), len(self._wars_search_token)))

        #order allwars by len
        all_war_files = sorted(self._wars, key=lambda x: (len(basename(x)),len(x)), reverse=True)

        print("\t" + "\n\t".join([x for x in all_war_files]))
        renamed_fwars = set()

        # do file renames starting with longest war token first


        for war_token, new_war_token in sorted(war_map.items(), key=lambda x: len(x[1]), reverse=True):
            last_fwar = ""
            found = False
            wt_occurrs = 0
            if war_token.endswith("glyphicons-halflings-regular.woff"):
                erikwazhere=""

            for subsrch_tok in war_map.keys():
                if subsrch_tok.endswith(war_token):
                    wt_occurrs += 1

            for fwar in all_war_files:

                # skip fwars already renamed
                if fwar in renamed_fwars:
                    continue

                if war_token.find("/") > -1:
                    if len(war_token) + 2 > len(fwar):
                        if fwar.endswith(war_token):
                            found = True
                            renamed_fwars.add(fwar)
                            war = fwar
                    elif fwar.endswith("/" + war_token):
                        found = True
                        renamed_fwars.add(fwar)
                        war = fwar
                else:
                    # so this is meant to catch where a root file has same name as one with a path
                    # this might need to be more sophistacted taking children on paths into account
                    # but will try this for now
                    if wt_occurrs > 1 and fwar.find("/") == -1:
                        if fwar == war_token:
                            found = True
                            war = "/" + fwar
                            renamed_fwars.add(fwar)
                    else:
                        if basename(fwar) == war_token:
                            found = True
                            renamed_fwars.add(fwar)
                            war = fwar

                if found:
                    # if fwar.endswith("history.js"):
                    #     cprint((fwar), "red")

                    break


            # if war.endswith("history.js"):
            #     cprint((war, war_token, new_war_token), "blue")


            if not found:
                cprint("war=unknown\nwar_token={}".format( war_token), "yellow")
                continue


            from_fn = safejoin(self._main_dir, war)
            new_war = war.replace(war_token, new_war_token)

            # if war_token.endswith("history.js"):
            #     cprint((war_token, new_war_token, from_fn[-40:]), "blue")

            to_fn = safejoin(self._main_dir, new_war)
            if not exists(to_fn):
                new_war = self.rreplace(war, war_token, new_war_token, 1)
                to_fn = safejoin(self._main_dir, new_war)
                if not exists(dirname(to_fn)):
                    erikwazhere = ""
                    # print("attempting to rename {} to {}".format(from_fn, to_fn))
            if not exists(dirname(to_fn)):
                erikwazhere=""
                #print("attempting to rename {} to {}".format(from_fn, to_fn))

            if war not in stats:
                stats[war] = {"num_replacements": 0}

            if war_token.endswith("history.js"):
                cprint((war_token, new_war_token, from_fn[-40:], to_fn[-40:]), "blue")

            if isfile(from_fn):
                #print("\trenaming {} to {} with tokens {} and {}".format(war, new_war, war_token, new_war_token))
                if from_fn.endswith("history.js"):
                    cprint ((from_fn[-40:], to_fn[-40:]), "green")

                if from_fn.endswith("style.css"):
                    erikwashere=""

                file_rename(from_fn, to_fn)

                #print (war)

                stats[war]["success"] = "{} to {} with tokens {} and {}".format(war, new_war, war_token, new_war_token)
                num_renamed += 1
            else:
                cprint("\tFAILED to rename\n\t{} to\n\t{}\n with \n\tWarToken={}\n\tNEW_WT={}\n\t\tfrom_fn={}"
                       .format(war, new_war, war_token, new_war_token, from_fn), 'red' )
                stats[war]["error"] = "FAILED to rename {} to {}".format(war, new_war)
                num_failed_rename += 1

        stats["totals"] = {"total_num_reps": total_num_rep, "num_renamed" : num_renamed,
                           "num_failed_rename": num_failed_rename}

        print("\tWAR Renaming TOTALS for Renames:{} Failed_Rens:{} Replacements:{} "
              .format(num_renamed, num_failed_rename, total_num_rep))

        self.write_to_results("war_mods", stats)


                # raise CloakExceptionError("YIKES!!! :-( Failed to rename file {} to {}").format(key, val)
    def read_config(self):
        cfg_fn = self.get_path + "/hidex_config.json"
        if exists(cfg_fn):
            with open(cfg_fn, "r") as jf:
                hcfg = json.load(jf)
        else:
            hcfg = {}

        return hcfg

    def write_to_config(self, key, info, del_no_war_rename=False):
        cfg_fn = self.get_path + "/hidex_config.json"
        hcfg = self.read_config()

        hcfg[key] = info

        if del_no_war_rename:
            if "no_war_rename" in hcfg:
                del hcfg["no_war_rename"]

        with open(cfg_fn, "w") as jf:
            json.dump(hcfg, jf)

    def start_cloak_results(self):
        starter = {"starttime": time.time()}
        if not exists(self.cloak_results_fn):
            with open(self.cloak_results_fn,"w") as jf:
                json.dump([starter], jf)
            self._job_num = 0
        else:
            with open(self.cloak_results_fn, "r") as jf:
                results = json.load(jf)
            self._job_num = len(results)  # no subtract, because append is next
            results.append(starter)
            with open(self.cloak_results_fn, "w") as jf:
                json.dump(results, jf)

    def write_to_results(self, key, value, allowOverrite=False):

        with open(self.cloak_results_fn, "r") as jf:
            results = json.load(jf)

        value["finish_ts"] = time.time()

        if key in results:
            if allowOverrite:
                results[self._job_num][key] = value
            else:
                results[self._job_num][key].append(value)
        else:
            if allowOverrite:
                results[self._job_num][key] = value
            else:
                results[self._job_num][key] = [value]

        with open(self.cloak_results_fn, "w") as jf:
            json.dump(results, jf)

    def cloak(self, rnd_length=6):

        self.start_cloak_results()
        if self._wars:
            #pp.pprint (self._wars)
            str_exp = "^[\w\d]{" + str(rnd_length) + "}_"
            regex = re.compile(str_exp)
            # if regex.search(self._wars[0]):
            cfg = self.read_config()
            if "war_map" in cfg and "no_war_rename" not in cfg:
                #print (self._wars)
                print("\tWARs already processed")
            else:
                try:
                    ft_access_wars = self._get_files_accessing_wars()

                    war_map = self._create_map(rnd_length, self._wars_search_token)

                    #print("attempting update")
                    #pp.pprint(war_map)
                    self._update_extension(ft_access_wars, war_map)
                    #print(war_map)

                    self.write_to_config("war_map", war_map, del_no_war_rename=True)
                    open("data/modified_extensions.dat", "a").write(self.getappid() + "\n")
                    self.write_to_results("war_map",war_map, True)
                except CloakExceptionError as cee:
                    self.write_to_results("war_map", {"Error": "Error cloaking exception " + repr(cee)}, False)
                    return False
        else:
            print("\tExtension {} ({}) does not have any WARs".format(self._name, self._appid))

        #pp.pprint(war_map)

        return True

    def _create_forward_dom_map(self, rnd_length, token_list):

        forward_token_map = {}
        reverse_token_map = {}

        random_name = self._rnd.choice(string.ascii_lowercase).join(
            self._rnd.choice(string.ascii_lowercase + string.digits)
            for _ in range(rnd_length - 1))

        for token in token_list:
            prefix = token[0:1]
            new_token = token.replace(token, "cloakx_" + token[1:] + "_" + random_name)
            forward_token_map[token] = new_token
            reverse_token_map[prefix+new_token] = token[1:]

        return forward_token_map, reverse_token_map


    def get_json(self, json_path):
        results = {}
        with open(json_path, "r") as jf:
            results = json.load(jf)
        return results

    def extract_tokens(self, info):
        token_list = []
        if "ids" in info:
            for x in info['ids']:
                token_list.append("#"+x)
        else:
            token_list = []

        if "classes" in info:
            for x in info['classes']:
                token_list.append("."+x)

        return token_list

    def dropplet_cloak(self, rnd_length=6, droponly=False):

        if droponly:
            self.start_cloak_results()
            self.write_to_results("no_wmap", {}, True)
            # creates and stores war_map where token = token
            war_map = {}
            for war_token in self._wars_search_token:
                war_map[war_token] = war_token
            self.write_to_config("war_map", war_map)
            self.write_to_config("no_war_rename", {})

        #print("\tStarting JS Analysis on %s" % self.get_name())
        all_war_info = self.get_json("wars.json")

        all_d_info = self.get_json("drops.json")
        #print("PATH={}".format(self.get_path))

        if self.getappid() in all_d_info:
            ext_ds_info = all_d_info[self.getappid()]
            unq_tokens = set(self.extract_tokens(ext_ds_info))
        else:
            unq_tokens = set()
            ext_ds_info = {}

        if self.getappid() in all_war_info:
            ext_war_info = all_war_info[self.getappid()]
            unq_tokens.update(self.extract_tokens(ext_war_info))
        else:
            ext_war_info = {}


        if len(unq_tokens) > 0:

            #print("\tFound app id {}".format(self.getappid()))
            token_list = list(unq_tokens)

            #print ("\tTokens from wars.json and drops.json={}".format(token_list))

            id_map, rev_id_map = self._create_forward_dom_map(rnd_length, token_list)
            self.write_to_results("global_map_to_random", id_map, True)
            self.write_to_config("global_map_to_random", id_map)
            self.write_to_results("global_map_from_random", rev_id_map, True)
            self.write_to_config("global_map_from_random", rev_id_map)

            hcfg = self.read_config()

            if "war_map" in hcfg:
                war_map = hcfg['war_map']
            else:
                war_map = {}
            #print("\tWARMAP={}".format(war_map))
            js_cloak = CloakJS(self)

            modified = False
            wars_to_check = []
            analysis_results = {}
            # these are modified b/c they showed up Xhound and are called via Droplet
            out_str = ""
            if 'wars' in ext_war_info:
                wars_not_found = []
                for war in ext_war_info['wars']:
                    js_f = basename(war)
                    if ("jquery" in js_f and js_f.endswith(".js")) or "foreground.js" in js_f or js_f.endswith("in_vk.js") or js_f.endswith(
                            "Kernel.js"):
                        cprint("\tSkipping due to always timing out{}".format(war), "yellow")
                        continue

                    if war in war_map:
                        wars_to_check.append(war.replace(war, war_map[war]))

                    # Xhound includes full relative path, but CloakX tries to use smallest unique path
                    # so we need to move methodically from full length to smaller
                    elif war.startswith("/"):
                        war_path = war
                        found = False
                        # this should include a flat basename
                        while len(war) > len(basename(war)):
                            war_path = re.sub(r'^.*?/', '', war_path)
                            if war_path in war_map:
                                #print("GOTCHYA, shorter war_path found in WM, Original:{} Shorter:{}, TO:{}"
                                #      .format(war, war_path, war_map[war_path]))

                                wars_to_check.append(war.replace(war_path, war_map[war_path]))
                                found = True
                                break
                            if len(war_path) == len(basename(war_path)):
                                break
                        if not found:
                            wars_not_found.append(war)
                            cprint("Javascript sourced in DROPLET but is not defined as WAR --> {}".format(war), "red")
                    else:
                        cprint("Javascript not found in DROPLET but is not defined as WAR --> {}".format(war), "red")
                        wars_not_found.append(war)

                if len(wars_not_found) > 0:
                    analysis_results["missing_wars"] = {"message": "Javascript sourced in DROPLET but is not defined as WAR",
                                                        "js_files" : wars_not_found}

                cloak_results = js_cloak.cloak_dropped_wars(wars_to_check, id_map)
                #self.write_to_results("dropped_wars", cloak_results)
                analysis_results["wars"] = cloak_results

                modified = True
                errors = 0
                analyzed_blocks = 0
                total_blocks = 0
                matches = 0
                for result in cloak_results:
                    if "error" in result:
                        errors += 1
                    if "analysis" in result:
                        analyzed_blocks += result["analysis"]["analyzedBlocks"]
                        total_blocks += result["analysis"]["totalBlocks"]
                    if "matches" in result:
                        matches += len(result["matches"])

                out_str += "\t\tDropped WARs:   {} of {} with {} errors " \
                    .format(len(cloak_results), len(ext_war_info['wars']), errors)
                out_str += "and analyzing {} of {} BBs making {} matches" \
                    .format(analyzed_blocks, total_blocks, matches)

            # Check out inline scripts

            if "script_data" in ext_ds_info:
                cloak_results = js_cloak.cloak_dropped_inline_scripts(ext_ds_info["script_data"], id_map)

                if len(cloak_results) > 0:
                    droplet_info = []
                    errors = 0
                    analyzed_blocks = 0
                    total_blocks = 0
                    matches = 0
                    for result in cloak_results:
                        if "hash" in result:
                            droplet_info.append(result)
                        if "error" in result:
                            errors += 1
                        if "analysis" in result:
                            analyzed_blocks += result["analysis"]["analyzedBlocks"]
                            total_blocks += result["analysis"]["totalBlocks"]
                        if "matches" in result:
                            matches += len(result["matches"])

                    if len(out_str) > 0:
                        out_str += "\n"

                    if len(droplet_info) > 0:
                        self.write_to_config("droplets", droplet_info)

                        out_str += "\t\tInline Scripts: {} of {} with {} errors "\
                            .format(len(cloak_results), len(ext_ds_info["script_data"]), errors)
                        out_str += "and analyzing {} of {} BBs making {} matches"\
                            .format(analyzed_blocks,total_blocks, matches)
                    else:
                        out_str += "\t\tNO Matches in {} Inline Scripts to {} ID/Classes "\
                            .format(len(ext_ds_info["script_data"]), unq_tokens)

                    modified = True

                analysis_results["inline_scripts"] = cloak_results

            # write out all the analysis
            self.write_to_results("droplets", analysis_results)

            if modified:
                open("data/modified_extensions.dat","a").write(self.getappid() + "\n")
                print("\tDroplet Analysis completed using {} ID/Classes".format(len(unq_tokens)))
                print(out_str)

            else:
                print("\tNO Matches in Droplets to {} ID/Classes".format(len(unq_tokens)))

        return True


    def getappid(self):
        return self._appid

    def get_name(self):
        return self._name

    def get_failed_files(self):
        return self._failed_to_open_files


