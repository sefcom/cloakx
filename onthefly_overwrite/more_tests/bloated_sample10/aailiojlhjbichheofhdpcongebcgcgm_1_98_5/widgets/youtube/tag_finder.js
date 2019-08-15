/*
    Tag Finder
*/

(function () {
    'use strict';

    var widget = {

        name: 'Tag Finder',
        container: '#freedom_tag_finder',
        suggested_keywords: [],
        selected_engine: 'google',

        initialize: function () {
            var that = this;

            if (this.widget_dom) {
                return;
            }
            
            this.tag_finder_icon = jsonToDOM(['div', {id: 'freedom_tag_finder_wrapper'},
                ['div', {id: 'freedom_tag_finder'},
                    ['span', {class: 'heartbeat_branding_icon'}],
                    ['span', util.locale('tag_finder')]
                ]
            ]);

            this.tag_finder_popup = jsonToDOM(
                ['div', {
                        id: 'freedom_tag_finder_popup',
                        class: 'freedom_popup freedom_hid',
                        onclick: function (evt) {
                            evt.stopPropagation();
                            evt.preventDefault();
                        }
                    },
                    ['div', {class: 'freedom_popup_header'},
                        ['span', {class: 'freedom_popup_header_title'}, 'Tag finder'],
                        ['i', {
                            class: 'freedom_popup_header_close fa fa-times',
                            onclick: this.on_close_tag_finder
                        }]
                    ],
                    ['div', {class: 'freedom_popup_content'},
                        ['div', {id: 'txt_search_tag_wrapper'}, 
                            ['input', {
                                id: 'txt_search_tag',
                                type: 'text',
                                placeholder: util.locale('tag_finder_enter_keyword'),
                                onkeydown: this.on_search_keydown
                            }],
                            ['button', {
                                    id: 'btn_search_tag',
                                    class: 'yt-uix-button yt-uix-button-size-default ' + 
                                        'yt-uix-button-default yt-uix-button-has-icon',
                                    onclick: this.search_tags
                                },
                                ['i', {class: 'fa fa-search'}],
                                ['span', util.locale('search')]
                            ]
                        ],
                        ['div', {id: 'div_search_result'},
                            ['ul', {id: 'div_search_engines'},
                                ['li', {class: 'selected', engine: 'google'}, 'Google'],
                                ['li', {engine: 'youtube'}, 'Youtube'],
                                ['li', {engine: 'bing'}, 'Bing'],
                                ['li', {engine: 'app-store'}, 'App Store']
                            ],
                            ['div', {class: 'div_search_result_header'},
                                ['table',
                                    ['thead',
                                        ['tr',
                                            ['th', {class: 'checkbox'}],
                                            ['th', {class: 'tag_name'}, util.locale('keywords')],
                                            ['th', {class: 'tag_rank'},
                                                ['span', util.locale('volume')],
                                                ['i', {
                                                    class: 'fa fa-question-circle yt-uix-tooltip',
                                                    'data-tooltip-text': util.locale('volume_tooltip')
                                                }]
                                            ],
                                            ['th', {class: 'tag_rank'}, 
                                                ['span', util.locale('cpc')],
                                                ['i', {
                                                    class: 'fa fa-question-circle  yt-uix-tooltip',
                                                    'data-tooltip-text': util.locale('cpc_tooltip')
                                                }]
                                            ],
                                            ['th', {class: 'tag_rank'},
                                                ['span', util.locale('competition')],
                                                ['i', {
                                                    class: 'fa fa-question-circle  yt-uix-tooltip',
                                                    'data-tooltip-text': util.locale('competition_tooltip')
                                                }]
                                            ],
                                            ['th'],
                                        ]
                                    ]
                                ],
                            ],
                            ['div', {class: 'div_search_result_body'}, 
                                ['table',
                                    ['tbody',
                                        ['tr', ['td', {
                                            colspan: 15,
                                            class: 'loading'
                                        }, util.locale('no_key_found')]]
                                    ]
                                ]
                            ],
                            ['div', {
                                    id: 'div_search_canvas',
                                    class: 'freedom_hidden'
                                },
                                ['div', {class: 'search_chart_title'}, util.locale('average_monthly_searches')],
                                ['canvas', {
                                    id: 'search_canvas',
                                    width: '780',
                                    height: '150'
                                }]
                            ],
                            ['div', {id: 'div_search_result_suggested', class: 'div_search_result_body'}, 
                                ['table',
                                    ['tbody']
                                ]
                            ]
                        ]
                    ]
                ]
            );

            this.register_event_listeners();
        },

        start: function () {
            if (!~location.pathname.indexOf('/edit') && !~location.pathname.indexOf('/upload')) {
                this.remove();
                return;
            }

            this.render();
        },

        remove: function () {
            var tag_input_wrap = util.$('.video-settings-tag-chips-container');

            this.tag_finder_icon.remove();
            this.tag_finder_popup.remove();

            if (tag_input_wrap.length) {
                _(tag_input_wrap)
                    .forEach(function (el) {
                        el.remove_class('has_tag_finder');
                    })
                    .commit();
            }
        },

        render: function () {
            var tag_container = util.$('.video-settings-tag-chips-container'),
                content_box = util.$('#content'),
                tag_input_wrap = util.$('.video-settings-tag-chips-container'),
                uploaded = ~location.pathname.indexOf('/edit') || 
                    (util.$('#active-uploads-contain') && util.$('#active-uploads-contain').firstChild);

            if (!uploaded) {
                return;
            }

            if (tag_container.length) {
                _(tag_container)
                    .forEach(function (el) {
                        var cloneTag = widget.tag_finder_icon.cloneNode(true);

                        cloneTag.onclick = widget.show_tag_finder;
                        el.appendChild(cloneTag);
                    })
                    .commit();
            }

            if (content_box) {
                content_box.appendChild(this.tag_finder_popup);
            }

            if (tag_input_wrap.length) {
                _(tag_input_wrap)
                    .forEach(function (el) {
                        el.add_class('has_tag_finder');
                    })
                    .commit();
            }
        },

        integrity: function () {
            var tag_container = util.$('.video-settings-tag-chips-container'),
                reCheck = true;

            _(tag_container)
                .forEach(function (el) {
                    if (!util.$('.heartbeat_branding_icon', el).length) {
                        return reCheck = false;
                    };
                })
                .commit();

            return reCheck;
        },

        register_event_listeners: function () {
            document.addEventListener('mousedown', this.on_header_mousedown);
            document.addEventListener('mousemove', this.on_header_mousemove);
            document.addEventListener('mouseup', this.on_header_mouseup);

            util.$('#div_search_engines', this.tag_finder_popup)
                .addEventListener('click', this.on_search_engine_change);
        },

        on_search_engine_change: function (evt) {
            var li = evt.target,
                engine = li.getAttribute('engine'),
                selected = util.$('#div_search_engines > li.selected')[0];

            evt.stopPropagation();
            evt.preventDefault();

            if (!engine || selected === li) {
                return;
            }

            li.add_class('selected');
            selected && selected.remove_class('selected');
            this.selected_engine = engine;

            this.search_tags();
        },

        on_close_tag_finder: function (evt) {
            var popup = util.$('#freedom_tag_finder_popup');

            evt.stopPropagation();
            if (!popup) {
                return;
            }

            popup.add_class('freedom_hid');
        },

        show_tag_finder: function () {
            var popup = util.$('#freedom_tag_finder_popup'),
                container = popup.parentNode;

            if (!popup) {
                return;
            }

            popup.remove_class('freedom_hid');
            util.$('#txt_search_tag').focus();
            this.dragging_x = (container.clientWidth - popup.clientWidth) / 2;
            this.dragging_y = (window.innerHeight - popup.clientHeight) / 2 - 20;
            this.move_popup(this.dragging_x, this.dragging_y);

            this.render_keywords();
        },

        move_popup: function (x, y) {
            var popup = util.$('#freedom_tag_finder_popup');

            if (!popup) {
                return;
            }

            popup.style.left = x + 'px';
            popup.style.top = y + 'px';
        },

        on_header_mousedown: function (evt) {
            var header = util.bind_elem_functions(evt.target);

            evt.stopPropagation();

            if (!header.has_class('freedom_popup_header') && 
                !header.has_class('freedom_popup_header_title')) {
                return;
            }

            util.$('body')[0].add_class('freedom_user_dragging');
            this.is_dragging = true;
            this.dragging_x = evt.clientX;
            this.dragging_y = evt.clientY;
        },

        on_header_mousemove: function (evt) {
            var popup = util.$('#freedom_tag_finder_popup'), 
                x, y;
            
            if (!this.is_dragging) {
                return;
            }

            x = parseInt(popup.style.left) + evt.clientX - this.dragging_x;
            y = parseInt(popup.style.top) + evt.clientY - this.dragging_y;
            this.dragging_x = evt.clientX;
            this.dragging_y = evt.clientY;
            this.move_popup(x, y);
        },

        on_header_mouseup: function () {
            this.is_dragging = false;
            util.$('body')[0].remove_class('freedom_user_dragging');
        },

        on_search_keydown: function (evt) {
            if (evt.keyCode === 13) {
                this.search_tags();
            }
        },

        set_grid_status: function (msg) {
            var tbody = util.$('#div_search_result tbody')[0];

            _(util.$('#div_search_result tbody tr', this.tag_finder_popup))
                .forEach(function (tr) { tr.remove(); })
                .commit();

            tbody.replace(jsonToDOM(['tr', ['td', {
                    colspan: 5, class: 'loading'
                }, msg]]));

            util.$('#div_search_canvas', this.tag_finder_popup).add_class('freedom_hidden');
        },

        search_tags: function () {
            var that = this,
                keyword = util.$('#txt_search_tag').value.trim().toLowerCase();

            if (!keyword) {
                that.set_grid_status(util.locale('no_key_found'));
                return;
            }

            util.$('#txt_search_tag').value = keyword;
            this.set_grid_status(util.locale('searching'));

            util.api('find_tags')({
                    keyword: keyword,
                    engine: this.selected_engine
                })
                .get(function (err, result) {
                    var items = [], 
                        months = [],
                        search_term,
                        i;

                    if (err || !result || !result[''] || !result[keyword] || !result[keyword][0]) {
                        that.set_grid_status(util.locale('no_key_found'));
                        return;
                    }

                    search_term = result[''][0];
                    items.push(search_term);
                    result[keyword].sort(function (l, r) {
                        return (r.volume || 0) - (l.volume || 0);
                    });

                    _.forEach(result[keyword], function (item) {
                        if (item.volume) {
                            items.push(item);
                        }
                    });

                    that.suggested_keywords = items;

                    for(i = 1; i <= 12; i++) {
                        if (search_term['m' + i]) {
                            months.push(search_term['m' + i]);
                        }
                    }

                    that.render_chart(months);
                    that.render_keywords(months);
                });

            // log
            chrome.runtime.sendMessage({
                message: 'tag_finder_log', 
                keyword: keyword
            });
        },

        add_tag: function (tag_name) {
            var txt = util.$('.video-settings-add-tag')[0];

            txt.value = tag_name;
            txt.focus();
            txt.blur();
        },

        remove_tag: function (tag_name) {
            var tag_span = util.$('.video-settings-tag-chips-container .yt-chip[title="' + tag_name + '"]')[0];

            if (!tag_span) {
                return;
            }

            util.$('.yt-delete-chip', tag_span)[0].click();
        },

        on_toggle_checkbox: function (evt) {
            var chk = util.bind_elem_functions(evt.currentTarget),
                tag_name = chk.getAttribute('tag_name');

            chk.toggle_class('fa-times');
            chk.toggle_class('fa-plus');

            if (chk.has_class('fa-times')) {
                this.add_tag(tag_name);
                return;
            }

            this.remove_tag(tag_name);
        },

        is_tag_added: function (tag_name) {
            return !!util.$('.video-settings-tag-chips-container .yt-chip[title="' + tag_name + '"]').length;
        },

        render_keywords: function () {
            var tbody_suggested = util.$('#div_search_result tbody')[1],
                tbody_term = util.$('#div_search_result tbody')[0],
                search_term = util.$('#txt_search_tag').value,
                that = this;

            _(util.$('#div_search_result tbody tr', this.tag_finder_popup))
                .forEach(function (tr) { tr.remove(); })
                .commit();

            if (!this.suggested_keywords.length) {
                that.set_grid_status(util.locale('no_key_found'));
                return;
            }

            _(this.suggested_keywords)
                .forEach(function (keyword) {
                    var added = that.is_tag_added(keyword.string),
                        tbody = keyword.string == search_term ? tbody_term : tbody_suggested;

                    tbody.appendChild(jsonToDOM(['tr', 
                        ['td', {class: 'checkbox'}, ['i', {
                            tag_name: keyword.string,
                            class: 'fa ' + (added ? 'fa-times' : 'fa-plus'),
                            onclick: that.on_toggle_checkbox
                        }]],
                        ['td', {class: 'tag_name'},
                            that.highlight_words(keyword.string, search_term)
                        ],
                        ['td', {class: 'tag_rank'}, (keyword.volume || 0).toLocaleString()],
                        ['td', {class: 'tag_rank'}, keyword.cpc ? '$' + keyword.cpc : 'n/a'],
                        ['td', {class: 'tag_rank'}, 
                            ['span', keyword.cmp ? keyword.cmp : 'n/a'],
                            that.add_progress_bar(keyword.cmp)
                        ],
                        ['td']
                    ]));
                })
                .commit();

            _(util.$('.div_search_result_header table', that.tag_finder_popup))
                .forEach(function (tbl) {
                    tbl.style.width = util.$('#div_search_result_suggested table')[0].clientWidth + 'px';
                })
                .commit();
        },

        on_search_selected_tag: function (evt) {
            util.$('#txt_search_tag', this.tag_finder_popup).value = evt.target.getAttribute('tag_name');
            this.search_tags();
        },

        render_chart: function (data) {
            var ctx = util.$('#search_canvas', this.tag_finder_popup).getContext('2d'),
                chart_data = {
                    labels: [],
                    datasets: [
                        {
                            label: 'Search volume by month',
                            fillColor: 'rgba(220,220,220,0.5)',
                            strokeColor: 'rgba(220,220,220,0.8)',
                            highlightFill: 'rgba(220,220,220,0.75)',
                            highlightStroke: 'rgba(220,220,220,1)',
                            data: data
                        }
                    ]
                }, 
                mm = moment(),
                n = chart_data.datasets[0].data.length,
                i;

            if (this.chart) {
                this.chart.destroy();
            }

            util.$('#div_search_canvas').remove_class('freedom_hidden');

            for (i = 0; i < n; i++) {
                mm.subtract(1, 'months');
                chart_data.labels[n - i - 1] = mm.format('MMM YY');
            }

            this.chart = new Chart(ctx).Bar(chart_data, {
                scaleShowGridLines: false
            });
        },

        highlight_words: function (keyword, term) {
            var idx = keyword.indexOf(term),
                result = ['div'],
                arr = [0, idx, idx + term.length, keyword.length],
                temp, i;

            if (keyword == term) {
                return ['span', term];
            }

            for (i = 0; i < arr.length - 1; i++) {
                temp = keyword.substring(arr[i], arr[i + 1]);

                if (temp == term) {
                    result.push(['span', temp]);
                }
                else if (temp) {
                    result.push(['span', {class: 'search_term_matched'}, temp]);
                }
            }

            result.push(['i', {
                tag_name: keyword,
                class: 'fa fa-external-link-square',
                onclick: this.on_search_selected_tag
            }]);
            
            return result;
        },

        add_progress_bar: function (val) {
            if (val == null)
                return '';

            val = val * 100 + 25;
            return ['div', {class: 'search_progress_bar'},
                ['div', {
                    class: 'progress',
                    style: 'width:' + (val > 125 ? 125 : val) + 'px'
                }]
            ];
        }
    };

    widgets.push(widget);
})();

