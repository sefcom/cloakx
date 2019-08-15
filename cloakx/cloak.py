#!/usr/bin/env python3
# -*- coding: utf-8 -*-


from os.path import isdir
import argparse

from cloakx.utils import log_factory
from cloakx.all_extensions import AllExtensions

log = log_factory('cloak')



def check_arguments(_args):

    if not isdir(_args['extensionpath']):
        raise argparse.ArgumentTypeError("readable_dir:{0} is not a valid path".format(_args['extensionpath']))


def main(args):
    do_tajs_only = False
    do_war_only = False
    check_wars_only = False
    do_all = False
    if "reset" in args and args["reset"]:
        open("data/processed.dat","w").write("")
    if "tajs_only" in args and args["tajs_only"]:
        do_tajs_only = True
    if "war_only" in args and args["war_only"]:
        do_war_only = True
    if "check_wars" in args and args["check_wars"]:
        check_wars_only = True
    if "all" in args and args["all"]:
        do_all = True

    if do_tajs_only or do_war_only or check_wars_only or do_all:
        ext = AllExtensions(args['extensionpath'])
        if check_wars_only:
            ext.check_wars_exist()
        else:
            failed_cloaks = ext.cloak_all(do_tajs_only, do_war_only)
            if len(failed_cloaks) > 0:
                print("Failed to Cloak ")
                for ex in failed_cloaks:
                    failed_cloaks_file = open('failed_cloaks.dat','w+')
                    out_str = "{} {} {}\n".format(ex.getappid(), ex.get_name(), ex.get_failed_files())
                    print (out_str)
                    failed_cloaks_file.write(out_str)
    else:
        print("You must choose the type of processing to complete, see help for options")
        exit(27)

####
# lifbcibllhkdhoafpjfnlhfpfgnpldfl is not decoding but also not giving an error
###

if __name__ == "__main__":

    parser = argparse.ArgumentParser(description='Cloak an extension')

    parser.add_argument('extensionpath', action='store', help='the path to the extensions')
    parser.add_argument('-a', '--all', required=False, action='store_true', default=False,
                        help="do all processing of extensions")
    parser.add_argument('-r', '--reset', required=False, action='store_true', default=False,
                        help="reset processed.dat")
    parser.add_argument('-t', '--tajs_only', required=False, action='store_true', default=False,
                        help="do tajs analysis only no war renaming")
    parser.add_argument('-w', '--war_only', required=False, action='store_true', default=False,
                        help="do war renaming only ")
    parser.add_argument('-c', '--check_wars', required=False, action='store_true', default=False,
                        help="check for any extensions with war in manifest but no accessible wars")
    _args = vars(parser.parse_args())

    try:
        check_arguments(_args)
        main(_args)
    except argparse.ArgumentTypeError as ate:
        log.error(ate)
        print("Error with processing extension, {}".format(ate))
        parser.print_help()

