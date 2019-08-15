
from os.path import isfile, isdir, join, abspath, splitext, basename, exists
import string
import random
from collections import defaultdict
from cloakx.utils import Color
import re

class CloakBase:

    def __init__(self):
        self._rnd = random.SystemRandom()

        h = "[0-9a-f]"
        unicode = "\\\\{h}{1,6}(\\r\\n|[ \\t\\r\\n\\f])?".replace("{h}", h)
        escape = "({unicode}|\\\\[^\\r\\n\\f0-9a-f])".replace("{unicode}", unicode)
        nonascii = "[\\240-\\377]"
        nmchar = "([_a-z0-9-]|{nonascii}|{escape})".replace("{nonascii}", nonascii).replace("{escape}", escape)
        nmstart = "([_a-z]|{nonascii}|{escape})".replace("{nonascii}", nonascii).replace("{escape}", escape)
        self.ident_pattern = "-?{nmstart}{nmchar}*".replace("{nmstart}", nmstart).replace("{nmchar}", nmchar)
        self.change_tracker = defaultdict(list)
        self.fn = ""


    def cloak(self, **kwargs):
        raise NotImplementedError

    def token_replace_by_map(self, str_to_search, token_map):
        """
        replaces the every occurence of (oldtok,newtok) inside token_map in the str_to_search 
        :param str_to_search: 
        :type str_to_search: 
        :param token_map: 
        :type token_map: 
        :return: 
        :rtype: 
        """
        output_str = str_to_search

        for oldtok, newtok in token_map.items():
            temp_str = ""
            for selector in output_str.split(','):
                temp_str += self.match_replace(selector, oldtok, newtok) + ", "

            if len(temp_str) > 1:
                output_str = temp_str[:-2]
            else:
                output_str = temp_str

        return output_str

    def match_replace(self, str_to_parse, var_to_replace, new_var_name):
        """
        Searches through the str_to_parse for all valid variable names, when var_to_replace is equal to a variable name
        it is replaced with the new_var_name.
        :param str_to_parse: 
        :type str_to_parse:  
        :param var_to_replace: 
        :type var_to_replace: 
        :param new_var_name: 
        :type new_var_name: 
        :return: 
        :rtype: 
        """
        temp = str_to_parse
        # print("var " + node.identifier.value + " value to >> " + node.initializer.value + " <<")
        for match_obj in self.variable_regex.finditer(str_to_parse):
            # print(match_obj.group())
            # temp =
            if match_obj.group() == var_to_replace:
                temp = temp[:match_obj.start()] + new_var_name + temp[match_obj.end():]
        return temp

    def get_change_results(self):
        """
        Outputs the changes made to the files 
        :return: the change results report
        :rtype: string 
        """
        import difflib
        lastfn = ""
        outstr = ""
        diff = difflib.Differ()
        for fn, results in self.change_tracker.items():
            if lastfn != fn:
                outstr += fn + "\n"
                lastfn = fn

            for r in results:
                mout = ""
                prior = ""
                vars_orig = re.split('([, ])', r['orig'])
                vars_new = re.split('([, ])', r['new'])

                for i in range(0, len(vars_orig)):
                    vo = vars_orig[i]
                    vn = vars_new[i]
                    for c in (list(diff.compare(vo, vn))):
                        if c.startswith("  "):
                            if prior != "  ":
                                mout += Color.NONE
                            prior = "  "
                        if c.startswith("+ "):
                            if prior != "+ ":
                                mout += Color.BOLD_GREEN
                            prior = "+ "
                        if c.startswith("- "):
                            print(Color.BOLD_RED + "ERROR with diff check code '%s'" % c)
                            print(list(diff.compare(vo, vn)))
                            print("\tSO FAR: " + mout )
                            print("\tvo:    " + vo + " vn:" + vn)
                            print("\tORIG:   " + r['orig'] + "\n\tNEW:    " + r['new'] + "\n" + Color.NONE)
                            prior = "- "
                            from sys import exit
                            exit(11)

                        mout += c[-1:]
                mout += Color.NONE
                outstr += "\t" + mout + "   " + Color.BOLD_WHITE + r['type'] + Color.NONE + "\n"

        return outstr