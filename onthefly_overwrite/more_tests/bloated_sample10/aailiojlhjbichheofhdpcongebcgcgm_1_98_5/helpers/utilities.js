/*
    Utilities
*/
(function (root) {
    'use strict';

    root.util = {

        api: fermata.json(config.server_ip_add),
        api2: fermata.json(config.server2_ip_add),
        youtube_api: fermata.json('https://www.youtube.com'),

        locale: function () {
            return chrome.i18n.getMessage.apply(chrome.i18n, arguments) || arguments[0];
        },

        toggle: function (id, display) {
            var element = this.$('#' + id);

            if (element) {
                element.style.display = getComputedStyle(element).display === 'none' ? display || 'block' : 'none';
            }
        },

        simple_pluralize: function (string, number) {
            return this.lang === 'en' ? (number === 1 ? string : string + 's') : string;
        },

        number_with_commas: function (x) {
            return x > -1 ? (x || '0').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : 'Unknown';
        },

        decode_HTML: function (string) {
            var map = {
                gt: '>',
                lt: '<',
                quot: '"',
                apos: '\''
            };
            return string.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, function ($0, $1) {
                return $1[0] === '#' ? (String.fromCharCode($1[1].toLowerCase() === 'x' ? parseInt(
                    $1.substr(2), 16) : parseInt($1.substr(1), 10))) : (map.hasOwnProperty($1) ?
                    map[$1] : $0);
            });
        },

        clean_string: function (s) {
            return s.match(/\S{1,30}/g) ? s.match(/\S{1,30}/g).join(' ') : '';
        },

        $: function (s, doc) {
            var is_id = function (str) {
                    return (str[0] === '#' && !~str.indexOf(' '));
                },
                arr = [],
                elem,
                i;

            s = s.trim();

            // if (doc && !doc.querySelectorAll) {
            //     console.log(s, doc);
            // }

            elem = is_id(s)
                ? (doc || document).querySelector(s)
                : (doc || document).querySelectorAll(s);

            if (elem) {
                if (is_id(s)) {
                    this.bind_elem_functions(elem);
                }

                else if (typeof(elem.length) === 'number') {

                    for (i = elem.length; i--; arr.unshift(elem[i])) {}

                    elem = arr.map(this.bind_elem_functions);
                }

            }

            return elem;
        },

        bind_elem_functions: function (elem) {

            elem.$ = function (selector) {
                return root.util.$(selector, this);
            };

            elem.append_child = function (array) {
                this.appendChild(jsonToDOM(array));
                return this;
            };

            elem.empty = function () {
                while (this.lastChild) {
                    this.removeChild(this.lastChild);
                }
                return this;
            };

            elem.replace = function (new_elem) {
                this.empty()[Array.isArray(new_elem) ? 'append_child' : 'appendChild'](new_elem);

                return this;
            };

            elem.add_class = function (class_name) {
                if (this.classList) {
                    this.classList.add(class_name);
                }
                else {
                    this.className += ' ' + class_name;
                }
                return this;
            };

            elem.remove_class = function (class_name) {
                if (this.classList) {
                    this.classList.remove(class_name);
                }
                else {
                    this.className = this.className
                        .replace(new RegExp('(^|\\b)' + class_name.split(' ')
                            .join('|') + '(\\b|$)', 'gi'), ' ');
                }
                return this;
            };

            elem.has_class = function (class_name) {
                return this.classList
                    ? this.classList.contains(class_name)
                    : new RegExp('(^| )' + class_name + '( |$)', 'gi').test(this.className);
            };

            elem.toggle_class = function (class_name) {
                if (elem.has_class(class_name)) {
                    elem.remove_class(class_name);
                }
                else {
                    elem.add_class(class_name);
                }
                return this;
            };

            elem.parent = function (selector) {
                var current = elem.parentNode;

                if (selector && !current.matches(selector)) {
                    return null;
                }

                return current;
            };

            elem.parents = function (selector) {
                var parents = [],
                    current = elem.parentNode;

                for (; current.nodeType !== 9; current = current.parentNode) {

                    if (selector && !current.matches(selector)) {
                        continue;
                    }

                    parents.push(current);
                }

                return _(parents).forEach(root.util.bind_elem_functions).value();
            };

            elem.show = function () {
                if (getComputedStyle(elem).display === 'none') {
                    elem.style.display = 'block';
                }
                return this;
            };

            elem.hide = function () {
                if (getComputedStyle(elem).display !== 'none') {
                    elem.style.display = 'none';
                }
                return this;
            };

            return elem;
        },

        // wait for element util the timeout is over
        // - selector is css selector supported by util.$ function
        // - interval timer defaults to 500ms
        // - timeout defaults to 30s
        // - callback will receive the first param as error if any
        //   and second param contains found element(s)
        $wait: function (selector, callback, timer, timeout) {
            var timeout = +new Date() + (timeout || 30000),
                i = setInterval(function () {

                    var element = util.$(selector),
                        isExist = !_.isEmpty(element);

                    if (isExist || (+new Date() >= timeout)) {
                        clearInterval(i);
                        callback && callback(
                            isExist ? null : new Error('TIMEDOUT: Element not found'),
                            element
                        );
                    }
                }, timer || 500);
        },

        wait_for: function (test, done, timer, timeout) {
            var i, t,
                callback = function (err) {
                    clearInterval(i);
                    clearTimeout(t);
                    done && done(err);
                };

            // run timer for checking test fn
            i = setInterval(function () {
                if (test && test()) {
                    callback();
                }
            }, timer || 500);

            // set timeout for checking the timeout is over
            t = setTimeout(function () {
                callback(new Error('Timeout'));
            }, timeout || 30000);
        },

        $remove: function (selector, doc) {
            var elements = (doc || document).querySelectorAll(selector);

            _(elements)
                .forEach(function (ele) {
                    ele.remove();
                })
                .commit();
        },

        strip: function (html) {
            return html.replace(/<(?:.|\n)*?>/gm, '');
        },

        scroll_to_element: function (pageElement) {
            var positionX = 0,
                positionY = 0;

            while (pageElement !== null) {
                positionX += pageElement.offsetLeft;
                positionY += pageElement.offsetTop;
                pageElement = pageElement.offsetParent;
                window.scrollTo(positionX, positionY);
            }
        },

        retrieve_window_variables: function (variables) {
            var scriptContent = '',
                variable,
                script,
                temp,
                i;

            for (i in variables) {
                variable = variables[i];

                if (heartbeat_chrome) {
                    scriptContent += 'if (typeof ' + variable + ' !== "undefined"){' +
                        'document.body.setAttribute("tmp_' + variable + '", ' + variable + ');}';
                }
                else {
                    variables[i] = variable.split('.')
                        .reduce(function (o, x) {
                            return o[x];
                        }, window);
                }
            }

            if (!heartbeat_chrome) {
                return variables;
            }

            script = document.createElement('script');
            script.id = 'temp_script';
            script.appendChild(document.createTextNode(scriptContent));
            (document.body || document.head || document.documentElement).appendChild(script);

            for (i in variables) {
                variable = variables[i];
                variables[i] = document.body.getAttribute('tmp_' + variable);
                document.body.removeAttribute('tmp_' + variable);
            }

            temp = this.$('#temp_script');
            temp.parentElement.removeChild(temp);

            return variables;
        },

        extend: function (obj, source) {
            var prop;

            for (prop in source) {
                if (source.hasOwnProperty(prop)) {
                    obj[prop] = source[prop];
                }
            }

            return obj;
        },

        stringify: function (obj) {
            var ret = [],
                key;

            for (key in obj) {
                ret.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
            }

            return ret.join('&');
        },

        parse_qs: function (url) {
            var obj = {};

            if (!url) {
                url = location.search;
            }

            url.slice(url.indexOf('?') + 1)
                .split('&')
                .forEach(function (a) {
                    if (a) {
                        a = a.split('=');
                        obj[a[0]] = decodeURIComponent(a.slice(1).join('='));
                    }
                });

            return obj;
        },

        get_offset: function (el) {
            var rect = el.getBoundingClientRect();

            return {
                top: rect.top + document.body.scrollTop,
                left: rect.left + document.body.scrollLeft
            };
        },

        light_switch_text: function () {
            return settings.lights ? this.locale('dark_mode') : this.locale('light_mode');
        },

        analytics_text: function () {
            return settings.realtime_analytics ? this.locale('realtime_analytics') : this.locale(
                'analytics');
        },

        comments_text: function () {
            return settings.spam_comments ? 'Likely spam comments' : this.locale('all_comments');
        },

        get_element_offset: function (el) {
            var x = 0,
                y = 0;
            while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
                x += el.offsetLeft - el.scrollLeft;
                y += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
            }
            return {
                top: y,
                left: x
            };
        },

        generate_UUID: function () {
            /**
             * Fast UUID generator, RFC4122 version 4 compliant.
             * @author Jeff Ward (jcward.com).
             * @license MIT license
             * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
             **/
            var UUID = (function() {
                var self = {},
                    lut = [],
                    i = 0;

                for (; i < 256; i += 1) {
                    lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
                }

                self.generate = function () {
                    var d0 = Math.random() * 0xffffffff|0,
                        d1 = Math.random() * 0xffffffff|0,
                        d2 = Math.random() * 0xffffffff|0,
                        d3 = Math.random() * 0xffffffff|0;

                    return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
                    lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
                    lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
                    lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
                };

                return self;
            })();

            return UUID.generate();
        },

        in_iframe: function () {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        },

        hms_to_seconds: function (str) {
            var arr = str.split(':'),
                s = 0,
                m = 1;

            while (arr.length > 0) {
                s += m * parseInt(arr.pop(), 10);
                m *= 60;
            }

            return s;
        },

        seconds_to_hms: function (d, watch_format) {
            var h, m, s;

            d = Number(d);
            h = Math.floor(d / 3600);
            m = Math.floor(d % 3600 / 60);
            s = Math.floor(d % 3600 % 60);

            if (watch_format) {
                return ((h > 0 ? h + 'h' : '') +
                    (m > 0 ? (h > 0 && m < 10 ? '0' : '') + m + 'm' : '0m') +
                    (s < 10 ? '0' : '') + s) + 's';
            }

            return ((h > 0 ? h + ':' : '') +
                (m > 0 ? (h > 0 && m < 10 ? '0' : '') + m + ':' : '0:') +
                (s < 10 ? '0' : '') + s);
        },

        load_script: function (fn, exec) {
            var insertion_el = document.body || document.getElementsByTagName('head')[0] || document.documentElement,
                script;

            if (typeof(exec) === 'undefined') {
                exec = true;
            }

            script = fn.toString();

            if (exec) {
                script = '(' + script + ')()';
            }

            script = jsonToDOM(
                ['script',
                    {type: 'text/javascript'},
                    script + ';'
                ]);

            insertion_el.appendChild(script);
            if (exec) {
                insertion_el.removeChild(script);
            }
        },

        is_valid_url: function (url) {
            var regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;

            return url.match(regex);
        },

        is_valid_email: function (url) {
            return url.match(/[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim);
        },

        linkify: function (str) {
            var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim,
                pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim,
                emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

            return str
                .replace(urlPattern, '<a title="$&" class="hb_link" href="$&">$&</a>')
                .replace(pseudoUrlPattern, '$1<a title="$2" class="hb_link" href="http://$2">$2</a>')
                .replace(emailAddressPattern, '<a title="$&" class="hb_link" href="mailto:$&">$&</a>');
        },

        inject_script: function (src, callback) {
            var insertion_el = document.body
                    || document.getElementsByTagName('head')[0]
                    || document.documentElement,

                script = jsonToDOM(
                    ['script',
                        {
                            type: 'text/javascript',
                            src: src,
                            onload: callback
                        }
                    ]);

            insertion_el.appendChild(script);
        },

        reset_settings: function () {
            _(config.key_default)
                .forEach(function (key) {
                    if (key === 'heartbeat_position' || key === 'public_token_id') {
                        return;
                    }

                    if (key[0] === '!') {
                        key = key.slice(1);
                        settings[key] = false;
                    }
                    else {
                        settings[key] = true;
                    }
                })
                .commit();

            settings.save();

            return settings;
        },

        contains_offensive_words: function (expression) {
            var i, words, found;

            if (!blacklist_words) {
                return true;
            }

            words = expression.split(/[., ]/);
            for (i = 0; i < words.length; i++) {
                if (~blacklist_words.indexOf('|' + words[i] + '|')) {
                    return true;
                }
            }

            return false;
        },

        get_login_link: function (return_url) {
            return config.website_ip_add + '/login.html' +
                (return_url ? '?return_url=' + encodeURIComponent(return_url) : '') +
                '#force_login';
        },

        log_count_per_day: function (event, data) {
            var now = new Date(),
                current_date = [now.getDate(), now.getMonth(), now.getFullYear()].join(''),
                tracking_data = localStorage.getItem('track_' + event) || {
                    event: event,
                    count: 0
                };

            if (_.isString(tracking_data)) {
                try { tracking_data = JSON.parse(tracking_data); } catch (e) {}
            }

            if (data) {
                tracking_data = _.extend(tracking_data, data);
            }

            if (tracking_data.date !== current_date) {


                // send data to Google Analytics
                chrome.runtime.sendMessage({
                    message: 'log_analytics',
                    data: {
                        hitType: 'event',
                        eventLabel: 'heartbeat_tags',
                        eventAction: 'click',
                        eventCategory: event,
                        eventValue: tracking_data.count || 0,
                        metric0: tracking_data.upvote || 0,
                        metric1: tracking_data.downvote || 0
                    }
                });

                // change to new date
                tracking_data.date = current_date;
                tracking_data.count = 0;
            }

            tracking_data.count++;
            localStorage.setItem('track_' + event, JSON.stringify(tracking_data));
        },

        json_parse: function (string) {
            try {
                return JSON.parse(string);
            }
            catch (e) {
                return null;
            }
        },

        hex_code_to_str: function (code) {
            if (code.length === 4)
                return String.fromCharCode(parseInt(code, 16));

            var unicode = parseInt(code, 16),
                the20bits = unicode - 0x10000,
                highSurrogate = (the20bits >> 10) + 0xD800,
                lowSurrogate = (the20bits & 1023) + 0xDC00;

            return String.fromCharCode(highSurrogate) + String.fromCharCode(lowSurrogate);
        }

    }

})(this);
