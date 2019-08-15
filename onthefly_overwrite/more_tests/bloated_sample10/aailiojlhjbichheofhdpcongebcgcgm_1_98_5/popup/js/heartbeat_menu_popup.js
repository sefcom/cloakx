var heartbeat_menu_popup = (function () {

    'use strict';

    return {

        setting_pages: [],
        tooltips: {},
        is_admin: false,

        initialize: function () {
            var that = this,
                ready_check_interval;

            this.lang = _(window.navigator.language.split('-')).first();
            this.is_admin = session.user && ~session.user.roles.indexOf('admin');

            this.popup_dom = jsonToDOM(
                ['div', {id: 'heartbeat_menu_popup'},
                    ['div', {id: 'heartbeat_menu_header'},
                        ['div', {id: 'heartbeat_hearder_title'},
                            util.locale('heartbeat_services')
                        ],
                        ['div', {id: 'heartbeat_session'},
                            this.get_user_profile()
                        ],
                        ['div', {id: 'heartbeat_version'}, util.locale('version') + ' ' + config.version]
                    ],
                    ['div', {
                            id: 'heartbeat_menu_body'
                        },
                        ['div', {
                                id: 'heartbeat_sidebar'
                            },
                            ['ul', { id: 'heartbeat_sidebar_items' }]
                        ],
                        ['div', { id: 'heartbeat_content' }]
                    ],
                    ['div', { id: 'heartbeat_footer' }]
                ]
            );

            util.$('body')[0].appendChild(this.popup_dom);

            this.add_event_listeners();

            // wait for all settings loaded
            ready_check_interval = setInterval(function () {
                if (settings) {
                    clearInterval(ready_check_interval);

                    that.start();
                }
            }, 50);

            this.load_resource();
        },

        start: function () {
            var tab_id = localStorage.getItem('heartbeat_current_setting_id') || 'youtube_content',
                that = this;

            _(this.setting_pages)
                .forEach(function (setting_page) {
                    if (setting_page.beta) {
                        session.on_ready(function () {
                            if (session.has_role('lab')) {
                                setting_page.start && setting_page.start();
                            }
                        });
                        return;
                    }

                    setting_page.start && setting_page.start();
                })
                .commit();

            if (tab_id !== 'music_player_content' && tab_id !== 'custom_theme') {
                chrome.tabs.query({active: true}, function (tabs) {
                    var tab = tabs[0];

                    if (~tab.url.indexOf('youtube.com')) {
                        tab_id = 'youtube_content';
                    }
                    else if (~tab.url.indexOf('dailymotion.com')) {
                        tab_id = 'dailymotion_content';
                    }
                    else if (~tab.url.indexOf('twich.tv')) {
                        tab_id = 'twitch_content';
                    }
                    else if (~tab.url.indexOf('hitbox.tv')) {
                        tab_id = 'hitbox_content';
                    }
                    else {
                        tab_id = 'default_content';
                    }

                    that.select_menu(tab_id);
                });
            }
            else {
                this.select_menu(tab_id);
            }
        },

        load_resource: function () {
            var that = this;

            util.api('locale')({lang: this.lang})
                .get(function (err, result) {
                    if (err) {  return; }

                    _.forEach(result, function (item) {
                        item.id = item.id.replace('_' + item.lang, '');
                        that.tooltips[item.id] = item.text;
                    });
                });
        },

        add_page: function (page) {
            this.setting_pages.push(page);
        },

        add_event_listeners: function () {
            var that = this;

            util.$('#heartbeat_sidebar_items').addEventListener('click', function (evt) {
                var elem = util.bind_elem_functions(evt.srcElement),
                    content_id = elem.getAttribute('content_id');

                that.select_menu(content_id);

                localStorage.setItem('heartbeat_current_setting_id', content_id);
            });

            util.$('#heartbeat_content').addEventListener('scroll', function () {
                that.hide_tooltip(0);
            });

            document.addEventListener('click', function () {
                var ul = util.$('#heartbeat_session ul')[0];

                ul && ul.add_class('hide');
            });

            session.on_ready(function () {
                util.$('#heartbeat_session').replace(jsonToDOM(that.get_user_profile()));
                that.is_admin = ~session.user.roles.indexOf('admin');
            });
        },

        select_menu: function (id) {
            var items = util.$('#heartbeat_sidebar_items li[content_id="' + id + '"]'),
                menu_items = util.$('#heartbeat_sidebar_items li'),
                setting_page_content = util.$('#' + id),
                setting_page_contents = util.$('.setting_page_content');

            if (!items.length && !setting_page_content) {
                return;
            }

            if (items.length) {
                var item = items[0];

                _(menu_items)
                    .forEach(function (li) {
                        li.remove_class('active');
                    })
                    .commit();
                item.add_class('active');
            }

            if (setting_page_content) {
                _(setting_page_contents)
                    .forEach(function (frame) {
                        frame.remove_class('active');
                    })
                    .commit();
                setting_page_content.add_class('active');
            }
        },

        build_toggle_option: function (id, text, opt) {
            var option = opt || {},
                checked = this.get_toggle_setting_value(id),
                that = this,
                div_option = {
                    class: 'setting_option_item show' + (option.parent_id ? ' sub_item' : '')
                        + (option.class || ''),
                    onmouseenter: function (evt) { that.show_tooltip(this); },
                    onmouseleave: function (evt) { that.hide_tooltip(evt); }
                },
                input_option = {
                    type: 'checkbox',
                    id: id,
                    onchange: option.onchange || undefined,
                    checked: checked || undefined
                };

            if (option.parent_id) {
                div_option.parent_id = option.parent_id;
                if (!this.get_toggle_setting_value(option.parent_id)) {
                    div_option.class = div_option.class.replace(' show', '');
                }
            }

            return ['div', div_option,
                ['label',
                    ['input', input_option],
                    ['span', text]
                ]
            ];
        },

        get_toggle_setting_value: function (id) {
            var key = id.replace('!', ''),
                checked = settings[key];

            return id && id.length && id[0] === '!' ? !checked : checked;
        },

        on_setting_change: function (evt) {
            var elem = util.bind_elem_functions(evt.srcElement),
                checked = !!elem.checked,
                list_child = util.$('.setting_option_item.sub_item[parent_id="' + elem.id + '"]');

            settings.set(elem.id.replace('!', ''), elem.id[0] === '!'
                ? !checked
                : checked);

            _(list_child)
                .forEach(function (li) {
                    var input = util.$('input', li)[0];

                    if (!input) return;

                    if (checked) {
                        li.add_class('show');
                    }
                    else {
                        li.remove_class('show');
                    }
                })
                .commit();
        },

        on_platform_shortcut_change: function () {
            var links = util.$('#platform_shortcut a'),

                all_hide = !_(links).find(function (a) {
                    return a.style.display !== 'none';
                });

            util.$('#platform_shortcut').style.display = all_hide ? 'none' : 'block';
        },

        load_setting: function (object, parent_id) {
            var that = this,
                dom = [];

            function add_it (value, key) {
                var div = that.build_toggle_option(
                    key,
                    util.locale(value[0]),
                    parent_id ? {parent_id: parent_id} : undefined
                );

                dom.push(div);

                if (value[1]) {
                    div.push(['div', that.load_setting(value[1], key)]);
                }
            }

            _.forEach(object, function(value, key) {
                if (settings_config.beta_keys[key]) {
                    session.on_ready(function () {
                        if (session.has_role('lab')) {
                            add_it(value, key);
                        }
                    });
                    return;
                }

                add_it(value, key);
            });

            return dom;
        },

        wrap_settings: function (setting_arr, cols) {
            var result = ['div'],
                items = _.flatten(setting_arr),
                items_per_col = Math.floor(items.length / cols),
                container;

            _(items)
                .forEach(function (item, index) {
                    if (index % items_per_col === 0) {
                        container = ['div', {class: 'setting_option_col'}];
                        result.push(container);
                    }

                    container.push(item);
                })
                .commit();

            return result;
        },

        show_tooltip: function (target) {
            var target_id = util.$('input', target)[0].id,
                position = util.get_element_offset(target),
                tooltip = util.$('#freedom_tooltip'),
                that = this,
                title = this.tooltips[target_id] || '';

            if (!title && !this.is_admin) {
                this.hide_tooltip();
                return;
            }

            if (!tooltip) {
                tooltip = util.bind_elem_functions(jsonToDOM(['div', {
                        id: 'freedom_tooltip',
                        class: 'tooltip top freedom_hid',
                        onmouseenter: function () { that.keep_showing_tooltip(); },
                        onmouseleave: function () { that.hide_tooltip(); }
                    },
                    ['div', {class: 'tooltip_arrow'},
                        ['div', {class: 'tooltip_arrow_inner'}],
                        ['div', {class: 'tooltip_arrow_inner2'}]
                    ],
                    ['div', {
                        class: 'tooltip_inner',
                        contenteditable: this.is_admin,
                        onblur: function () { that.save_tooltip(); }
                    }, title]
                ]));

                util.$('#heartbeat_menu_popup').appendChild(tooltip);
            }

            clearTimeout(this.tooltip_timeout);
            this.tooltip_timeout = setTimeout(function () {
                var inner_div = util.$('.tooltip_inner', tooltip)[0];

                if (that.is_editing()) {
                    return;
                }

                inner_div.innerText = title;
                if (that.is_admin) {
                    inner_div.setAttribute('contenteditable', 'true');
                }
                else {
                    inner_div.removeAttribute('contenteditable');
                }
                tooltip.setAttribute('target_id', target_id);
                tooltip.remove_class('freedom_hid');
                tooltip.style.left = position.left - tooltip.offsetWidth / 2 + target.firstChild.offsetWidth / 2 + 'px';
                tooltip.style.top = position.top - tooltip.offsetHeight + 'px';
            }, 1000);
        },

        keep_showing_tooltip: function () {
            clearTimeout(this.tooltip_timeout);
        },

        hide_tooltip: function (t) {
            var that = this;

            clearTimeout(this.tooltip_timeout);
            this.tooltip_timeout = setTimeout(function () {
                var target = util.$('#freedom_tooltip');

                if (that.is_editing()) {
                    return;
                }

                if (target) {
                    target.add_class('freedom_hid');
                }
            }, t || 1000);
        },

        is_editing: function () {
            var focus = document.activeElement;

            return focus && focus.classList.contains('tooltip_inner');
        },

        save_tooltip: function () {
            var tooltip = util.$('#freedom_tooltip'),
                text = tooltip.innerText,
                id = tooltip.getAttribute('target_id');

            if (!this.is_admin) {
                return;
            }

            this.tooltips[id] = text;
            util.api('locale')
                .post({
                    id: id,
                    text: text,
                    lang: this.lang
                }, _.noop);
        },

        get_user_profile: function () {
            return ['div',
                ['a', {
                    class: session.user ? 'hide' : '',
                    target: '_blank',
                    href: util.get_login_link()
                }, 'Login'],
                ['a', {
                        class: !session.user ? 'hide' : '',
                        onclick: this.on_toggle_user_menu
                    },
                    ['img', {src: session.user && session.user.photo_url}],
                    ['span', session.user && session.user.display_name],
                    ['i', {class: 'fa fa-caret-down'}]
                ],
                ['ul', {class: 'hide'},
                    ['li', ['a', {
                            href: config.website_ip_add + '/user/profile.html#' + session.access_token,
                            target: '_blank'
                        },
                        util.locale('my_profile')
                    ]],
                    ['li', ['a', {onclick: this.log_out}, util.locale('log_out')]]
                ]
            ];
        },

        on_toggle_user_menu: function (evt) {
            var ul = util.$('#heartbeat_session ul')[0];

            ul.toggle_class('hide');
            evt.stopPropagation();
        },

        log_out: function () {
            var lnks = util.$('#heartbeat_session > a');

            session.destroy(function () {
                chrome.runtime.sendMessage({action: 'update_session'});
                location.reload();
            });

            _.forEach(lnks, function (lnk) {
                lnk.toggle_class('hide');
            });
        }
    };
})();

heartbeat_menu_popup.initialize();
