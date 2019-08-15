#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import glob
from os import remove as removefile
from os.path import join, basename, isdir, isfile
from os.path import isdir
import argparse
from subprocess import Popen, PIPE
import json
from cloakx.utils import log_factory
from urllib.request import urlopen, URLError
import random
import string
import re
from cloakx.utils import Color

log = log_factory('cloak')


h = "[0-9a-f]"
unicode = "\\\\{h}{1,6}(\\r\\n|[ \\t\\r\\n\\f])?".replace("{h}", h)
escape = "({unicode}|\\\\[^\\r\\n\\f0-9a-f])".replace("{unicode}", unicode)
nonascii = "[\\240-\\377]"
nmchar = "([_a-z0-9-]|{nonascii}|{escape})".replace("{nonascii}", nonascii).replace("{escape}", escape)
nmstart = "([_a-z]|{nonascii}|{escape})".replace("{nonascii}", nonascii).replace("{escape}", escape)
ident_pattern = "-?{nmstart}{nmchar}*".replace("{nmstart}", nmstart).replace("{nmchar}", nmchar)

variable_regex = re.compile(ident_pattern, re.IGNORECASE)

FAILED_MSG = Color.FAIL_COLOR + "FAILED" + Color.NONE

def check_arguments(_args):
    if not isdir(_args['extensionpath']):
        if not isfile(_args['extensionpath']):
            raise argparse.ArgumentTypeError("readable_dir:{0} is not a valid path or file".format(_args['extensionpath']))


def gen_new_targeted(base_str, search, replace):
    if len(base_str) == len(search):
        return base_str.replace(search, replace)
    if len(base_str) > len(search):
        temp = base_str
        for match_obj in variable_regex.finditer(base_str):
            # print(match_obj.group())
            # temp =
            if match_obj.group() == search:
                temp = temp[:match_obj.start()] + replace + temp[match_obj.end():]
        return temp

    return base_str

def tryint(s):
    try:
        return int(s)
    except:
        return s

def alphanum_key(s):
    """ Turn a string into a list of string and number chunks.
        "z23a" -> ["z", 23, "a"]
    """
    return [ tryint(c) for c in re.split('([0-9]+)', s) ]


def main(args):
    floc = args['extensionpath']
    ext_dirs = []
    if isfile(floc):
        ext_dirs.extend(glob.iglob(floc));
    else:
        ext_dirs.extend(glob.iglob(join(floc, "*.js")))
        ext_dirs.extend(glob.iglob(join(floc, "*.html")))

    rnd = random.SystemRandom()
    search_str = "XXXXX"
    search_type = "ID"
    if args['test']:
        random_name = 'n08qz'
    else:
        random_name = ''.join(rnd.choice(string.ascii_lowercase + string.digits)
                          for _ in range(5))

    for fn in sorted(ext_dirs, key=alphanum_key):
        #if basename(fn) != 'simple2.js':
        #    continue
        # -searchFor YYYYY -searchType ID
        #print("\n" + fn)

        inputfn = fn + ".json"
        inputfn_expect = inputfn+".expect"
        outputjs = fn + ".out"
        outputerr = fn + ".err"

        if isfile(inputfn):
            removefile(inputfn)
        if isfile(outputjs):
            removefile(outputjs)
        if isfile(outputerr):
            removefile(outputerr)

        # -console-model -timing -quiet - searchFor XXXXX - searchType ID
        cmd = ["java", "-jar", "./tajs-dev.jar", fn, "-dom", "-uneval", "-no-messages", "-quiet", "-console-model",
               "-timing","-determinacy", "-searchFor", search_str, "-searchType", search_type]
        proc = Popen(cmd, stdout=PIPE, stderr=PIPE)
        parsed = ""
        stdout, stderr = proc.communicate()


        strerror_out = ""
        if len(stderr) > 0:
            strerror_out += stderr.decode('ascii') + "\n"
            print (strerror_out)

        if fn.find("-NONE") > -1:
            if isfile(inputfn):
                strerror_out += stdout.decode('ascii') + "\n"
                open(outputerr,"w+").write(strerror_out)
                print(basename(fn) + "  --> " + FAILED_MSG)
            else:
                print(basename(fn) + "  --> PASSED")
            continue

        if not isfile(inputfn):
            strerror_out += stdout.decode('ascii') + "\n"
            open(outputerr, "w+").write(strerror_out)
            #print (strerror_out)
            print(basename(fn) + "  --> " + FAILED_MSG + " missing json input file")
            continue
        if args['test']:
            proc = Popen(['diff',inputfn,inputfn_expect], stdout=PIPE, stderr=PIPE)
            parsed = ""
            stdout, stderr = proc.communicate()
            if len(stdout) > 0:
                print (stdout)
                print(basename(fn) + "  --> " + FAILED_MSG + " json output did not match expected json")
                continue

        with open(inputfn) as jsfn:
            parsed = json.load(jsfn)

        for str, locs in parsed.items():
            if (str.find(search_str) > -1):
                for sl in locs:
                    try:
                        if sl['kind'] == "STATIC":
                            jsfile = urlopen(sl['location'])
                        elif sl['kind'] == "DYNAMIC":
                            jsfile = urlopen(sl['loaderLocation']['location'])

                        data = jsfile.read().decode('utf-8')
                        line_cnt = 1
                        targeted_loc = ""

                        output = ""

                        for line in data.split("\n"):

                            if line_cnt >= sl['lineNumber'] and line_cnt <= sl['endLineNumber']:
                                if line_cnt == sl['lineNumber']:
                                    # columnNumbers start at 1 and not 0, but python's element location starts with 0
                                    if sl['lineNumber'] == sl['endLineNumber']:
                                        targeted_loc += line[sl['columnNumber']: (sl['endColumnNumber'] - 2)]
                                        #print(targeted_loc)
                                        old_targeted_loc = targeted_loc
                                        targeted_loc = gen_new_targeted(targeted_loc, search_str, random_name)
                                        #print(targeted_loc)
                                        output += line[:sl['columnNumber']] + targeted_loc + line[
                                                                                             sl['endColumnNumber'] - 2:] + "\n"
                                        if old_targeted_loc == targeted_loc:
                                            strerror_out += stdout.decode('ascii') + "\n"
                                            open(outputerr, "w+").write(strerror_out)
                                            print(basename(fn) + "  --> " + FAILED_MSG + " " + old_targeted_loc + " == " + targeted_loc)

                                        else:
                                            print(basename(fn) + "  --> PASSED")
                                    else:
                                        targeted_loc += line[sl['columnNumber']:]
                                        output += line[:sl['columnNumber']]
                                elif line_cnt == sl['endLineNumber']:
                                    targeted_loc += line[:sl['endColumnNumber'] - 2]
                                    output += targeted_loc + line[sl['endColumnNumber'] - 2:] + "\n"
                                    print(targeted_loc)
                                else:
                                    targeted_loc += line + "\n"
                            else:
                                output += line + "\n"
                            line_cnt += 1

                    except URLError as urle:
                        strerror_out += stdout.decode('ascii') + "\n"
                        strerror_out += urle
                        open(outputerr, "w+").write(strerror_out)
                        print(basename(fn) + "  --> " + FAILED_MSG + " (see error file)")
                    except KeyError as keye:
                        strerror_out += stdout.decode('ascii') + "\n"
                        strerror_out += keye + "\n"
                        strerror_out += json.dumps(parsed, indent=4, sort_keys=True) + "\n"
                        open(outputerr, "w+").write(strerror_out)
                        print(basename(fn) + "  --> " + FAILED_MSG + " (see error file)")


                    else:
                        if data[:-1] != "\n":
                            output = output[:-1]
                        open(outputjs, "w+").write(output)

                # parsed = json.loads(stdout.decode('utf-8'))
                # print (json.dumps(parsed, indent=4, sort_keys=True))

                # exit(0)


####
# lifbcibllhkdhoafpjfnlhfpfgnpldfl is not decoding but also not giving an error
###

if __name__ == "__main__":

    parser = argparse.ArgumentParser(description='Cloak an extension')

    parser.add_argument('extensionpath', action='store', help='the path to the extensions')
    parser.add_argument('--test', action='store_true')

    _args = vars(parser.parse_args())

    try:
        check_arguments(_args)
        main(_args)
    except argparse.ArgumentTypeError as ate:
        log.error(ate)
        print("Error with processing extension, {}".format(ate))
        parser.print_help()
