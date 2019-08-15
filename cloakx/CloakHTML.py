
from os.path import isfile, isdir, join, abspath, splitext, basename, exists, dirname

from cloakx import Extension
from cloakx.CloakBase import CloakBase
import re
from bs4 import BeautifulSoup
from cloakx.utils import multi_open

class CloakHTML(CloakBase):
    def fn_filter(fn):
        has_extension = fn.endswith('.html') or fn.endswith('htm')
        return has_extension and isfile(fn)

    def __init__(self, extension):
        super().__init__()
        self.ext = extension  # type: Extension

        self.variable_regex = re.compile(self.ident_pattern, re.IGNORECASE)

    def cloak(self, token_map, all_tokens):
        e = self.ext # type: Extension

        html_fns = e.get_filtered_filenames(CloakHTML.fn_filter)
        #print(html_fns)

        for fn in html_fns:
            with multi_open(fn) as fp:
                soup = BeautifulSoup(fp, 'html.parser')

            made_change = False

            for search_cls in list(all_tokens['CLASS'].keys()):
                for tag in soup.find_all(class_=search_cls):
                    for index, cls in enumerate(tag['class']):
                        if cls == search_cls:
                            temp = tag['class'][index]
                            tag['class'][index] = token_map[search_cls]
                            self.change_tracker[fn].append({'type': 'class', 'orig': temp, 'new': tag['class'][index]})
                            made_change = True

            for search_id in list(all_tokens['ID'].keys()):
                for tag in soup.find_all(id=search_id):
                    temp = tag['id']
                    tag['id'] = token_map[search_id]
                    self.change_tracker[fn].append({'type': 'id', 'orig': temp, 'new': tag['id']})

            if made_change:
                print(self.get_change_results())

            # if found_style:
            #     pass
            #     # todo: write soup out to file before moving on




    def replace_in_rules(self, cssRules, token_map):
        """
        This parses all the cssRules and replaces the variables with their counterpart located in the token_map
        :param cssRules: 
        :type cssRules: 
        :param token_map: 
        :type token_map: 
        :return: 
        :rtype: 
        """

        for rule in cssRules:
            if hasattr(rule, 'selectorText'):
                rule.selectorText = self.token_replace_by_map(rule.selectorText, token_map)

            if hasattr(rule, 'cssRules'):
                print('found cssRules %d' % len(rule.cssRules))
                self.replace_in_rules(rule.cssRules, token_map)

