#!/usr/bin/env python3
# -*- coding: utf-8 -*-


from os.path import isdir
import argparse

from cloakx.utils import log_factory
from cloakx.all_extensions import AllExtensions

log = log_factory('createX')


def check_arguments(_args):

    if not isdir(_args['extensionpath']):
        raise argparse.ArgumentTypeError("readable_dir:{0} is not a valid path".format(_args['extensionpath']))


def main(args):

    ext = AllExtensions(args['extensionpath'])



    failed_cloaks = ext.cloak_all()
    if len(failed_cloaks) > 0:
        print("Failed to Cloak ")
        for ex in failed_cloaks:
            failed_cloaks_file = open('failed_cloaks.dat','w+')
            out_str = "{} {} {}\n".format(ex.getappid(), ex.get_name(), ex.get_failed_files())
            print (out_str)
            failed_cloaks_file.write(out_str)

####
# lifbcibllhkdhoafpjfnlhfpfgnpldfl is not decoding but also not giving an error
###

if __name__ == "__main__":

    parser = argparse.ArgumentParser(description='Cloak an extension')

    parser.add_argument('extensionpath', action='store', help='the path to the extensions')
    parser.add_argument('testloc', action='store', help='the path to the extensions')
    _args = vars(parser.parse_args())

    try:
        check_arguments(_args)
        main(_args)
    except argparse.ArgumentTypeError as ate:
        log.error(ate)
        print("Error with processing extension, {}".format(ate))
        parser.print_help()

