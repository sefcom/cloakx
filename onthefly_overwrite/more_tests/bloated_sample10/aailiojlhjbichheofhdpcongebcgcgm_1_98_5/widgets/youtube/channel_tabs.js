(function () {

    'use strict';

    var widget = {

        name: 'Tabs',
        tabs: ['website'],

        initialize: function () {
            this.current_tab = location.pathname.split('/').slice(-1)[0];
        },

        start: function () {
            this.render();
        },

        render: function () {
            var that = this,
                channel_nav = util.$('#channel-navigation-menu'),
                appbar = util.$('.appbar-nav-menu')[0],
                username = data.username || data.channel_id,
                link;

            if (!username || !channel_nav || !appbar) {
                return;
            }

            this.remove();

            link = (username.slice(0, 2) === 'UC' && username.length === 24)
                    ? '/channel/'
                    : '/user/';

            _(this.tabs)
                .forEach(function (tab) {
                    var tab_id = 'freedom_' + tab + '_li';

                    if (settings[tab] === false || util.$('.' + tab_id).length) return;

                    channel_nav.insertBefore(
                        that.current_tab === tab
                            ? that.h2(tab_id, tab)
                            : that.create_tab(tab_id, link + data.username + '/' + tab, tab, true),
                        channel_nav.lastElementChild
                    );

                    appbar.appendChild(
                        that.current_tab === tab
                            ? that.h2(tab_id, tab)
                            : that.create_tab(tab_id, link + data.username + '/' + tab, tab, true),
                        appbar.lastElementChild
                    );
                })
                .commit();


            if (this.current_tab === 'website') {
                // remove highlighted home
                channel_nav.removeChild(channel_nav.firstElementChild);
                appbar.removeChild(appbar.firstElementChild);

                // insert normal home
                appbar.insertBefore(
                    this.create_tab('', link + data.username + '/featured', util.locale('home')),
                    appbar.firstElementChild
                );

                channel_nav.insertBefore(
                    this.create_tab('', link + data.username + '/featured', util.locale('home')),
                    channel_nav.firstElementChild
                );
            }

            session.on_ready(widget.on_session_ready);

            if (this.current_tab !== 'website' || (this.is_editable() && !session.user)) {
                that.set_tab_content();
                return;
            }

            this.load_website(function (err, result) {
                if (err || !result) {
                    return;
                }

                if (!result.length && that.is_editable()) {
                    that.show_website_creator();
                    return;
                }

                that.website = result[0];
                that.set_tab_content();
            });
        },

        settings_changed: function (change) {
            if (change.website) {
                if (!settings.website) {
                    widget.remove_tab('website');
                }
                else {
                    widget.render();
                }
            }
        },

        remove_tab: function (tab) {
            var tab_eles = util.$('.freedom_'+tab+'_li');

            tab_eles.length && tab_eles.forEach(function (ele) {
                ele.remove();
            });
        },

        remove: function () {
            var container = util.$('.branded-page-v2-body.branded-page-v2-primary-column-content')[0],
                toolbar = util.$('#freedom_website_toolbar');

            _(util.$('.freedom_added_li'))
                .forEach(function (li) {
                    li.remove();
                })
                .commit();

            if (container && this.is_freedom_tab()) {
                container.replace(document.createTextNode(''));
            }

            if (toolbar) {
                toolbar.remove();
            }
        },

        is_freedom_tab: function () {
            return ~this.tabs.indexOf(this.current_tab);
        },

        integrity: function() {
            return data.page !== 'channel' || util.$('.freedom_added_li').length;
        },

        load_website: function (callback) {
            if (!data.username || !data.channel_id) {
                return;
            }

            util.api('website')({id: data.channel_id})
                .get(callback);
        },

        start_website: function (new_website) {
            var editable = this.is_editable() && session.user && !util.parse_qs().view_as,
                container = util.$('.branded-page-v2-body.branded-page-v2-primary-column-content')[0];

            this.website = {};

            if (new_website) {
                this.website.default_website = true;
            }

            container.replace(this.build_website_tab_page());
            if (editable) {
                this.load_editor();
            }
        },

        show_website_creator: function () {
            var that = this,
                editable = this.is_editable() && session.user,
                container = util.$('.branded-page-v2-body.branded-page-v2-primary-column-content')[0];

            if (!editable) {
                return;
            }

            container.replace(jsonToDOM(['div', {id: 'freedom_website_creator'},
                ['button', {
                        id: 'freedom_start_website',
                        class: 'freedom_button yt-uix-button yt-uix-button-primary yt-uix-button-size-default ' +
                            'yt-uix-button-has-icon',
                        onclick: function () { that.start_website(true); }
                    },
                    util.locale('start_my_website')
                ],
                ['p', {class: 'padding_10'}, 'Or'],
                ['button', {
                        id: 'freedom_start_remote_website',
                        class: 'freedom_button yt-uix-button yt-uix-button-primary yt-uix-button-size-default ' +
                            'yt-uix-button-has-icon',
                        onclick: function () { that.start_website(false); }
                    },
                    util.locale('use_my_existing_website')
                ]
            ]));
        },

        save_website_content: function () {
            var that = this,
                website_container = util.$('#freedom_website_content'),
                website = this.website || {},
                button = util.$('#freedom_save_website'),
                json = [];

            if (website_container.childNodes.length > 1) {
                json = ['div', JsonML.fromHTML(website_container.firstChild)];
            } else if (website_container.firstChild) {
                json = JsonML.fromHTML(website_container.firstChild);
            }

            button.setAttribute('disabled', 'disabled');

            util.api('website')
                .post(
                    {'ACCESS-TOKEN': session.access_token},
                    {
                        id: data.own_channel_id,
                        content: JSON.stringify(json),
                        website: util.$('#freedom_txt_website_url').value.trim(),
                        iframe_height: util.$('#freedom_txt_website_height').value || 400,
                        default_website: util.$('#heartbeat_website_ck').has_class('fa-check-square-o')
                    }, function (err, result) {
                        button.removeAttribute('disabled');

                        if (err) {
                            return;
                        }

                        that.show_notification(util.locale('save_success'));
                    });
        },

        is_editable: function () {
            return data.own_channel_id === data.channel_id &&
                !util.parse_qs().view_as;
        },

        set_tab_content: function () {
            var container = util.$('.branded-page-v2-body.branded-page-v2-primary-column-content')[0],
                editable = this.is_editable() && session.user;

            if (!this.is_freedom_tab()) {
                return;
            }

            switch (this.current_tab) {
                case 'website':
                    container.replace(this.build_website_tab_page());
                    if (editable) {
                        this.load_editor();
                    }

                    break;
            }
        },

        on_session_ready: function () {
            if (this.current_tab !== 'website' || !this.is_editable()) return;
            this.build_website_tab_page();
        },

        build_website_tab_page: function () {
            var editable = this.is_editable(),
                website = this.website || { default_website: true },
                that = this,

                login_link = util.get_login_link(location.href),

                on_website_tab_change = function () {that.on_website_tab_change(this);},
                on_default_website_change = function () {that.on_default_website_change(this);};

            if (!editable) {
                return jsonToDOM(['div', {
                        id: 'freedom_website_content',
                        class: website.default_website ? 'padding_10' : ''
                    },
                    this.get_website_content(website.default_website ? '' : 'iframe')
                ]);
            }

            if (!session.user) {
                return ['div', {id: 'freedom_website_login'},
                    ['a', {href: login_link}, util.locale('save_moment_login_link')]
                ];
            }

            return jsonToDOM(['div',
                ['div', {id: 'freedom_website_tab_setting'},
                    ['a', {
                            tab_id: 'freedom_heartbeat_website',
                            class: 'tab_button ' + (website.default_website ? 'active' : ''),
                            onclick: on_website_tab_change
                        },
                        util.locale('heartbeat_website')
                    ],
                    ['a', {
                            tab_id: 'freedom_remote_website',
                            class: 'tab_button ' + (!website.default_website ? 'active' : ''),
                            onclick: on_website_tab_change
                        },
                        util.locale('existing_website')
                    ],
                    ['button', {
                            id: 'freedom_save_website',
                            class: 'freedom_button yt-uix-button yt-uix-button-default ' +
                                'yt-uix-button-size-default yt-uix-button-has-icon',
                            onclick: that.save_website_content,
                            style: 'margin-bottom: 2px'
                        },
                        ['i', {class: 'fa fa-floppy-o'}],
                        util.locale('save')
                    ]
                ],
                ['div', {
                        id: 'freedom_remote_website',
                        class: 'freedom_website_tab_setting '  + (!website.default_website ? 'active' : '')
                    },
                    ['div', {class: 'padding_bottom_10'},
                        util.locale('website_input_instruction')
                    ],
                    ['div', {class: 'padding_bottom_10'},
                        ['label', util.locale('website_link')],
                        ['input', {
                            type: 'text',
                            id: 'freedom_txt_website_url',
                            placeholder: 'https://example.com',
                            value: website.website || '',
                            onchange: this.on_website_url_change
                        }],
                        ['label', util.locale('website_height')],
                        ['input', {
                            type: 'number',
                            id: 'freedom_txt_website_height',
                            value: website.iframe_height || 400,
                            onchange: this.on_website_height_change
                        }],
                        ['label', {onclick: on_default_website_change},
                            ['i', {
                                class: 'default_website_ck fa ' +
                                    (website.default_website ? 'fa-square-o' : 'fa-check-square-o'),
                                id: 'remote_website_ck'
                            }],
                            ['span', util.locale('use_my_youtube_website')]
                        ]
                    ],
                    ['div', {id: 'freedom_remote_website_preview'},
                        this.get_website_content('iframe')
                    ]
                ],
                ['div', {
                        id: 'freedom_heartbeat_website',
                        class: 'freedom_website_tab_setting '  + (website.default_website ? 'active' : '')
                    },
                    ['div', {class: 'padding_bottom_10'},
                        ['label', {onclick: on_default_website_change},
                            ['i', {
                                class: 'default_website_ck fa ' +
                                    (website.default_website ? 'fa-check-square-o' : 'fa-square-o'),
                                id: 'heartbeat_website_ck'
                            }],
                            ['span', util.locale('use_my_youtube_website')]
                        ]
                    ],
                    ['div', {
                            id: 'freedom_website_content',
                            class: 'editing',
                            contenteditable: 'true'
                        },
                        this.get_website_content(website.content === undefined ? 'sample' : '')
                    ]
                ]
            ]);
        },

        load_editor: function () {
            var that = this;

            if (!session.user) {
                return;
            }

            if (!this.script_loaded) {
                util.inject_script(chrome.extension.getURL('/lib/ckeditor_config.js'));
                util.inject_script(
                    'https://s3.amazonaws.com/heartbeat.asset/ckeditor/ckeditor.js',
                    function () {
                        postMessage({
                            id: 'freedom_website_content',
                            ckeditor: true
                        }, '*');
                    });

                this.script_loaded = true;
            }
        },

        get_website_content: function (content) {
            var website = this.website || {};

            if (content === 'sample') {
                return ['div',
                    ['h1', util.locale('sample_header')],
                    ['p'],
                    ['p', util.locale('sample_content')]
                ];
            }

            if (content === 'iframe') {
                return  ['iframe', {
                    id: 'remote_website_iframe',
                    src: website.website,
                    style: 'width: 100%; height:' + (website.iframe_height || 400) + 'px'
                }];
            }

            if (website.content) {
                return JSON.parse(website.content.replace(/data-cke-saved-src/g, 'src'));
            }

            if (!this.is_editable()) {
                return ['div',
                    ['p', util.locale('website_not_ready')]
                ];
            }

            return [];
        },

        create_tab: function (tab_id, href, text) {
            var elem = jsonToDOM(
                ['li', {
                        class: 'freedom_added_li ' + tab_id
                    },
                    ['a', {
                            href: href,
                            target: '_top',
                            onclick: 'location.reload()',
                            class: 'yt-uix-button spf-link yt-uix-sessionlink' +
                                ' yt-uix-button-epic-nav-item yt-uix-button-size-default'
                        },
                        ['span', {class: 'relative'},
                            ['span', {class: 'yt-uix-button-content'}, text]
                        ]
                    ]
                ]
            );

            if (tab_id === 'freedom_website_li' && !settings.website) {
                elem.style.display = 'none';
            }

            return elem;
        },

        h2: function (class_name, label) {
            return jsonToDOM(
                ['li', {class: 'freedom_added_li ' + class_name},
                    ['h2', {class: 'epic-nav-item-heading'},
                        ['span', {class: 'relative'}, util.locale(label)]
                    ]
                ]
            );
        },

        show_notification: function (text, timeout) {
            var wrapper = util.$('#appbar-main-guide-notification-container'),
                body = util.$('body')[0],
                dom = ['div', {
                            id: 'heartbeat_website_notification',
                            class: 'appbar-guide-notification',
                            role: 'alert'
                        },
                        ['span', {class: 'appbar-guide-notification-content-wrapper yt-valign'},
                            ['span', {class: 'appbar-guide-notification-icon yt-sprite'}],
                            ['span', {class: 'appbar-guide-notification-text-content'}, text]
                        ]
                    ];

            body.add_class('show-guide-button-notification');

            if (wrapper) {
                wrapper.replace(jsonToDOM(dom));
            }

            if (this.notification_timeout) {
                clearTimeout(this.notification_timeout);
            }

            this.notification_timeout = setTimeout(function () {
                    body.remove_class('show-guide-button-notification');
                }, timeout || 3000);
        },

        on_default_website_change: function (label) {
            var checkboxes = util.$('.default_website_ck'),
                checkbox = util.$('.default_website_ck', label)[0],
                that = this;

            this.toggle_checkbox(checkbox);

            _(checkboxes)
                .forEach(function (ck) {
                    if (ck === checkbox) {
                        return;
                    }

                    that.toggle_checkbox(ck, checkbox.has_class('fa-check-square-o'));
                })
                .commit();

            this.save_website_content();
        },

        toggle_checkbox: function (checkbox, checked) {
            checked = checked || checkbox.has_class('fa-check-square-o');

            if (checked) {
                checkbox.remove_class('fa-check-square-o');
                checkbox.add_class('fa-square-o');
            }
            else {
                checkbox.remove_class('fa-square-o');
                checkbox.add_class('fa-check-square-o');
            }
        },

        on_website_tab_change: function (tab) {
            var tabs = util.$('#freedom_website_tab_setting .tab_button'),
                tab_pages = util.$('.freedom_website_tab_setting');

            tab.add_class('active');
            _(tabs)
                .forEach(function (a_tab) {
                    if (tab === a_tab) {
                        return;
                    }

                    a_tab.remove_class('active');
                })
                .commit();

            _(tab_pages)
                .forEach(function (tab_page) {
                    if (tab_page.getAttribute('id') === tab.getAttribute('tab_id')) {
                        tab_page.add_class('active');
                        return;
                    }

                    tab_page.remove_class('active');
                })
                .commit();

            if (tab.getAttribute('tab_id') === 'freedom_heartbeat_website' && this.script_loaded) {
                postMessage({
                    id: 'freedom_website_content',
                    ckeditor: true
                }, '*');
            }
        },

        on_website_url_change: function () {
            var iframe = util.$('#remote_website_iframe'),
                txt = util.$('#freedom_txt_website_url'),
                url = txt.value.trim();

            if (!url) {
                iframe.src = '';
                return;
            }

            if (!util.is_valid_url(url)) {
                alert(util.locale('invalid_url'));
                return;
            }

            if (!~url.indexOf('https://')) {
                alert(util.locale('only_https_is_allowed'));
                return;
            }

            util.api('can_iframe')({website: url})
                .get(function (err) {
                    if (err) {
                        alert(util.locale('this_website_cannot_displayed_in_iframe'));
                        return;
                    }

                    iframe.src = url;
                });
        },

        on_website_height_change: function () {
            var iframe = util.$('#remote_website_iframe'),
                txt = util.$('#freedom_txt_website_height');

            if (txt.value && isFinite(parseInt(txt.value))) {
                iframe.style.height = txt.value + 'px';
            }
        }
    };

    widgets.push(widget);

})();
