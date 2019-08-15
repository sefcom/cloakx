(function () {
    'use strict';

    var keypress_timeout,
        freedom_owner_tags = 'freedom_owner_tags',
        freedom_suggested_tags = 'freedom_suggested_tags',
        freedom_favorites_tags = 'freedom_favorites_tags',
        blacklist = blacklist_words, // from helpers blacklist_words.js

        widget = {
            name: 'Heartbeat tags',

            container_selector: '#freedom_tag_video',
            other_container_selector: '#freedom_other_tags_video',
            video_tags: [],
            favorite_tags: [],
            other_user_tags: [],

            initialize: function () {
                this.widget_dom = jsonToDOM(['div', {
                        id: 'freedom_tag_video',
                        class: 'yt-card yt-card-has-padding'
                    },
                    ['div', {class: 'freedom_card_header'},
                        ['span', util.locale('heartbeat_tags')],
                        ['a', {
                                class: 'freedom_support_link',
                                href: 'https://www.youtube.com/watch?v=gjSpAdFAYcE&list=PLxLYo5_7D3SewSqkRSIRxrp2mfuVbsS2q'
                            },
                            util.locale('click_here_to_learn_more')
                        ]
                    ],
                    ['div', {
                            id: 'freedom_tag_badge',
                            class: 'yt-uix-tooltip',
                            style: 'display: none',
                            title: util.locale('heartbeat_tag_badge_tooltip')
                        },
                        ['i', {class: 'fa fa-certificate'}],
                        ['i', {class: 'fa fa-check'}]
                    ],
                    ['div', {class: 'freedom_card_body'},
                        ['div', {id: 'freedom_tags_container'},
                            ['div', {id: 'freedom_taglist'}],
                            ['div', {class: 'freedom_tag_input_wrapper'},
                                ['input', {
                                    id: 'freedom_tag_input',
                                    placeholder: util.locale('enter_your_tag')
                                }],
                                ['div', {id: 'blacklist_check'}, util.locale('blacklist_tips')],
                                ['div', {
                                        id: 'freedom_tag_popup',
                                        style: 'display: none'
                                    },
                                    ['div', {
                                            id: freedom_suggested_tags,
                                            class: 'freedom_tag_section'
                                        },
                                        ['div', {class: 'freedom_tag_section_header'},
                                            util.locale('suggested_tags')
                                        ],
                                        ['div', {class: 'freedom_tag_section_body'}],
                                        ['a', {class: 'show_more'}, util.locale('more_dotdotdot')],
                                    ],
                                    ['div', {
                                            id: freedom_favorites_tags,
                                            class: 'freedom_tag_section'
                                        },
                                        ['div', {class: 'freedom_tag_section_header'},
                                            util.locale('favorite_tags')
                                        ],
                                        ['div', {class: 'freedom_tag_section_body'}],
                                        ['a', {class: 'show_more'}, util.locale('more_dotdotdot')],
                                    ],
                                    ['div', {
                                            id: freedom_owner_tags,
                                            class: 'freedom_tag_section'
                                        },
                                        ['div', {class: 'freedom_tag_section_header'},
                                            util.locale('video_owner_tags')
                                        ],
                                        ['div', {class: 'freedom_tag_section_body'}],
                                        ['a', {class: 'show_more'}, util.locale('more_dotdotdot')],
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]);

                this.other_tags_dom = jsonToDOM(['div', {
                        id: 'freedom_other_tags_video',
                        class: 'yt-card yt-card-has-padding'
                    },
                    ['div', {class: 'freedom_card_header'},
                        util.locale('tags_from_others')
                    ],
                    ['div', {class: 'freedom_card_body'},
                        ['div', {id: 'freedom_tags_container'},
                            ['div', {
                                id: 'freedom_other_taglist',
                                class: 'freedom_custom_scrollbar'
                            }]
                        ]
                    ]
                ]);

                this.add_event_handlers();
            },

            start: function () {
                if (!this.integrity()) {
                    this.video_id = util.parse_qs().v;
                    this.render();
                    this.load_video_tags();
                    this.load_favorite_tags();
                    this.load_other_user_video_tags();
                    this.load_video_votes();
                    this.load_user_votes();
                    this.show_user_badge();
                }
            },

            remove: function () {
                var tag_list = util.$('#freedom_taglist', this.widget_dom),
                    widget = util.$(this.container_selector),
                    other_tags = util.$(this.other_container_selector),
                    other_tag_list = util.$('#freedom_other_taglist', this.other_tags_dom);

                if (widget) {
                    widget.remove();
                    tag_list.replace(document.createTextNode(''));
                }

                if (other_tags) {
                    other_tags.remove();
                    other_tag_list.replace(document.createTextNode(''));
                }
            },

            render: function () {
                var tag_widget = _(widgets).find(function (w) {
                        return w.name && w.name === 'Tags';
                    });

                if (!data.email || !settings.heartbeat_tags || !this.is_watching() || !tag_widget) {
                    this.remove();
                    return;
                }

                if (!util.$(this.other_container_selector)) {
                    tag_widget.tags_panel.appendChild(this.other_tags_dom);
                }

                if (!util.$(this.container_selector)) {
                    tag_widget.tags_panel.appendChild(this.widget_dom);
                }
            },

            add_event_handlers: function () {
                var that = this,
                    text_box = util.$('#freedom_tag_input', this.widget_dom);

                text_box.addEventListener('keydown', function (evt) {
                    var enter_keys = [13, 9, 188];

                    if (~enter_keys.indexOf(evt.keyCode)) {
                        that.on_insert_new_tag_from_textbox();
                    }

                    text_box.old_value = text_box.value;
                });

                text_box.addEventListener('keyup', function () {
                    // avoid too much db query
                    if (keypress_timeout) {
                        clearTimeout(keypress_timeout);
                    }

                    // no change or text is blank spaces
                    if (text_box.old_value === text_box.value || !text_box.value.trim()) {
                        return;
                    }

                    that.hide_tooltip_box();
                    if (util.contains_offensive_words(text_box.value)) {
                        util.$('#freedom_tag_popup').style.display = 'none';
                        return that.show_tooltip_box();
                    }

                    keypress_timeout = setTimeout(function () {
                        that.load_suggested_tags(that.show_auto_complete_popup);
                    }, 1250);
                    //I think a 1.25s delay would be enough to lessen request calls
                });

                text_box.addEventListener('focus', function () {
                    that.load_suggested_tags(that.show_auto_complete_popup);
                });

                text_box.addEventListener('click', function (evt) {
                    that.hide_tooltip_box();
                    evt.stopPropagation();
                });

                util.$('#freedom_tag_popup', this.widget_dom).addEventListener('click', function (evt) {
                    evt.stopPropagation();
                });

                _(util.$('.show_more', this.widget_dom))
                    .forEach(function (link) {
                        link.addEventListener('click', that.on_show_more);
                    })
                    .commit();
            },

            settings_changed: function (change) {
                if (change.heartbeat_tags && !settings.heartbeat_tags) {
                    this.remove();
                }
            },

            integrity: function () {
                return !data.email
                    || !settings.heartbeat_tags
                    || !this.is_watching()
                    || util.$(this.container_selector);
            },

            on_show_more: function (evt) {
                var link = evt.srcElement,
                    section = util.bind_elem_functions(link.parentElement);

                section.remove_class('has_more');
            },

            on_insert_new_tag_from_textbox: function () {
                var text_box = util.$('#freedom_tag_input', this.widget_dom),
                    that = this;

                text_box.setAttribute('disabled', 'disabled');
                this.insert_new_tag(text_box.value,
                    function (result) {
                        text_box.value = '';
                        setTimeout(function () { text_box.focus(); }, 500);
                        _(result)
                            .forEach(function (tag) {
                                that.video_tags.push(tag);
                                that.append_tags([tag]);
                            })
                            .commit();

                        that.load_suggested_tags(that.show_auto_complete_popup);
                    },
                    function () {
                        text_box.removeAttribute('disabled');
                    });
            },

            load_other_user_video_tags: function () {
                var that = this;

                util.api('video_tags')('other_users')({
                        video_id: util.parse_qs().v,
                        email: data.email
                    })
                    .get(function (err, result) {
                        if (err) {
                            return;
                        }

                        that.other_user_tags = _(result).sortByOrder('user_count', false).value();
                        that.render_other_user_tags(result);
                    });
            },

            load_video_votes: function () {
                var that = this;

                util.api('video_tag')('votes')({
                        video_id: util.parse_qs().v
                    })
                    .get(function (err, result) {
                        that.votes = {};

                        if (err) {
                            return;
                        }

                        _.forEach(result, function (vote) {
                            that.votes[vote.tag_name] = vote;
                        });
                    });
            },

            load_user_votes: function () {
                var that = this;

                util.api('video_tag')('user_votes')({
                        video_id: util.parse_qs().v,
                        email: data.email
                    })
                    .get(function (err, result) {
                        that.user_votes = {};

                        if (err) {
                            return;
                        }

                        _.forEach(result, function (vote) {
                            that.user_votes[vote.tag_name] = vote;
                        });
                    });
            },

            load_video_tags: function () {
                var that = this;

                util.api('video_tags')({
                        video_id: util.parse_qs().v,
                        email: data.email
                    })
                    .get(function (err, result) {
                        if (err) {
                            return;
                        }

                        that.video_tags = result;
                        that.append_tags(result);
                    });
            },

            load_suggested_tags: function (callback) {
                var text_box = util.$('#freedom_tag_input', this.widget_dom),
                    is_show_system_tag = !this.video_tags.length && !text_box.value,
                    that = this,
                    related_tag = '';

                // if user has not typed anything, show based on previous selected tag
                if (text_box.value.length <= 1 && this.video_tags.length) {
                    related_tag = this.video_tags[this.video_tags.length - 1].tag_name;
                }

                if (is_show_system_tag && this.system_tags) {
                    this.suggested_tags = this.system_tags;
                    callback && callback();
                    return;
                }

                if (related_tag && this.related_suggested_tags && this.related_suggested_tags[related_tag]) {
                    this.suggested_tags = this.related_suggested_tags[related_tag];
                    callback && callback();
                    return;
                }

                util.api('tags')({
                        tag_name: text_box.value,
                        is_system_tag: is_show_system_tag,
                        related_tag_name: related_tag,
                        limit: 10
                    })
                    .get(function (err, result) {
                        if (err) {
                            return;
                        }

                        that.suggested_tags = result;

                        if (related_tag) {
                            that.related_suggested_tags = that.related_suggested_tags || {};
                            that.related_suggested_tags[related_tag] = result;
                        }

                        if (is_show_system_tag) {
                            that.system_tags = result;
                        }

                        callback && callback();
                    });
            },

            show_auto_complete_popup: function () {
                var text_box = util.$('#freedom_tag_input', this.widget_dom),
                    owners = this.filter_used_tags(data.keywords),
                    favorites = this.filter_used_tags(this.favorite_tags),
                    suggested = this.filter_used_tags(this.suggested_tags);

                text_box.focus();

                this.refresh_auto_complete_popup(suggested, favorites, owners);

                document.removeEventListener('click', this.hide_auto_complete_popup);
                document.addEventListener('click', this.hide_auto_complete_popup);
            },

            load_favorite_tags: function () {
                var that = this;

                util.api('favorite_tags')({
                        email: data.email,
                        limit: 10
                    })
                    .get(function (err, result) {
                        if (err) {
                            return;
                        }

                        that.favorite_tags = result;
                    });
            },

            append_tags: function (tags) {
                var that = this,
                    tag_list = util.$('#freedom_taglist', this.widget_dom);

                _(tags)
                    .forEach(function (tag) {
                        tag_list.appendChild(jsonToDOM([
                            'div', {
                                id: 'freedom_vt_' + tag.video_tag_id,
                                class: 'freedom_video_tag'
                            },
                            ['i', {
                                    class: 'fa fa-times remove',
                                    onclick: that.on_remove_video_tag,
                                    video_tag_id: tag.video_tag_id
                                }
                            ],
                            ['a', {
                                    title: tag.tag_name,
                                    href: 'https://www.youtube.com/results?search_query=' +
                                        encodeURIComponent(tag.tag_name)
                                },
                                tag.tag_name
                            ]
                        ]));
                    })
                    .commit();

                //this.refresh_other_list_status();
            },

            render_other_user_tags: function () {
                var that = this,
                    initial_display = 10,
                    tag_list = util.$('#freedom_other_taglist', this.other_tags_dom);

                if (!this.other_user_tags.length) {
                    tag_list.replace(jsonToDOM(['span', {class: 'no_tag_found'}, util.locale('no_tag_found')]));
                    return;
                }

                _(this.other_user_tags)
                    .forEach(function (tag, index) {
                        tag_list.appendChild(jsonToDOM([
                            'div', {
                                class: 'freedom_video_tag ' + (index > initial_display ?
                                    'initial_hidden' : ''),
                                tag_name: tag.tag_name
                            },
                            ['span', {
                                    class: 'freedom_tags_badge tag_users',
                                    title: 'tagged by ? users'.replace('?', tag.user_count.toLocaleString())
                                },
                                ['i', {class: 'fa fa-users'}],
                                tag.user_count.toLocaleString()
                            ],
                            ['a', {
                                    title: tag.tag_name,
                                    href: 'https://www.youtube.com/results?search_query=' +
                                        encodeURIComponent(tag.tag_name)
                                },
                                tag.tag_name
                            ],
                            ['span', {
                                    class: 'freedom_tags_badge tag_up_votes',
                                    tag_name: tag.tag_name,
                                    onclick: that.on_up_vote
                                },
                                ['i', {class: 'fa fa-thumbs-up'}],
                                ['span', {class: 'text'}]
                            ],
                            ['span', {
                                    class: 'freedom_tags_badge tag_down_votes',
                                    tag_name: tag.tag_name,
                                    onclick: that.on_down_vote
                                },
                                ['i', {class: 'fa fa-thumbs-down'}],
                                ['span', {class: 'text'}]
                            ]
                        ]));
                    })
                    .commit();

                if (this.other_user_tags.length > initial_display) {
                    tag_list.appendChild(jsonToDOM(['a', {
                            id: 'show_more_other_tags',
                            onclick: that.show_more_other_tags
                        },
                        util.locale('show_more') + '...'
                    ]));
                }

                //this.refresh_other_list_status();
                this.render_votes();
                this.render_user_votes();
            },

            render_votes: function () {
                var tag_divs = util.$('#freedom_other_taglist .freedom_video_tag', this.other_tags_dom),
                    that = this;

                if (!this.other_user_tags || !tag_divs.length) {
                    return;
                }

                util.wait_for(function () { return that.votes; }, function (err) {
                    if (err) {
                        return;
                    }

                    _(tag_divs)
                        .forEach(that.update_tag_vote)
                        .commit();
                });
            },

            update_tag_vote: function (tag_div) {
                var vote = this.votes[tag_div.getAttribute('tag_name')],
                    up_vote_span = util.$('.tag_up_votes .text', tag_div)[0],
                    down_vote_span = util.$('.tag_down_votes .text', tag_div)[0];

                if (!vote || !up_vote_span || !down_vote_span) {
                    return;
                }

                up_vote_span.innerText = vote.up_votes ? vote.up_votes.toLocaleString() : '';
                down_vote_span.innerText = vote.down_votes ? vote.down_votes.toLocaleString() : '';
            },

            render_user_votes: function () {
                var tag_divs = util.$('#freedom_other_taglist .freedom_video_tag', this.other_tags_dom),
                    that = this;

                if (!this.other_user_tags || !tag_divs.length) {
                    return;
                }

                util.wait_for(function () { return that.user_votes; }, function (err) {
                    if (err) {
                        return;
                    }

                    _(tag_divs)
                        .forEach(that.check_user_votable)
                        .commit();
                });
            },

            check_user_votable: function (tag_div) {
                var vote = this.user_votes[tag_div.getAttribute('tag_name')],
                    up_vote_span = util.$('.tag_up_votes', tag_div)[0],
                    down_vote_span = util.$('.tag_down_votes', tag_div)[0];

                if (!up_vote_span || !down_vote_span) {
                    return;
                }

                // reset
                up_vote_span.add_class('active').remove_class('voted');
                down_vote_span.add_class('active').remove_class('voted');

                if (vote && vote.vote > 0) {
                    up_vote_span.remove_class('active').add_class('voted');
                    down_vote_span.add_class('active').remove_class('voted');
                }
                else if (vote && vote.vote < 0) {
                    up_vote_span.add_class('active').remove_class('voted');
                    down_vote_span.remove_class('active').add_class('voted');
                }

                up_vote_span.setAttribute('title', vote && vote.vote > 0 ? util.locale('already_upvoted') : util.locale('upvote'));
                down_vote_span.setAttribute('title', vote && vote.vote < 0 ? util.locale('already_downvoted') : util.locale('downvote'));
            },

            on_up_vote: function (evt) {
                var tag_span = util.bind_elem_functions(evt.currentTarget),
                    tag_div = tag_span.parentElement,
                    tag_name = tag_span.getAttribute('tag_name'),
                    user_vote = this.user_votes[tag_name] || {tag_name: tag_name},
                    vote = this.votes[tag_name] || {tag_name: tag_name, up_votes: 0, down_votes: 0},
                    is_down_voted_before = user_vote.vote === -1,
                    that = this;

                if (!tag_span.has_class('active')) {
                    return;
                }

                this.vote_tag(tag_name, 1, function (err) {
                    if (err) {
                        return;
                    }

                    that.track_vote(true);

                    that.user_votes[tag_name] = user_vote;
                    user_vote.vote = 1;
                    that.check_user_votable(tag_div);

                    that.votes[tag_name] = vote;
                    vote.up_votes += 1;
                    if (is_down_voted_before) {
                        vote.down_votes -= 1;
                    }

                    that.update_tag_vote(tag_div);
                });
            },

            on_down_vote: function (evt) {
                var tag_span = util.bind_elem_functions(evt.currentTarget),
                    tag_div = tag_span.parentElement,
                    tag_name = tag_span.getAttribute('tag_name'),
                    user_vote = this.user_votes[tag_name] || {tag_name: tag_name},
                    vote = this.votes[tag_name] || {tag_name: tag_name, up_votes: 0, down_votes: 0},
                    is_up_voted_before = user_vote.vote === 1,
                    that = this;

                if (!tag_span.has_class('active')) {
                    return;
                }

                this.vote_tag(tag_name, -1, function (err) {
                    if (err) {
                        return;
                    }

                    that.track_vote(false);

                    that.user_votes[tag_name] = user_vote;
                    user_vote.vote = -1;
                    that.check_user_votable(tag_div);

                    that.votes[tag_name] = vote;
                    vote.down_votes += 1;
                    if (is_up_voted_before) {
                        vote.up_votes -= 1;
                    }

                    that.update_tag_vote(tag_div);
                });
            },

            track_vote: function (is_up) {
                var now = new Date(),
                    current_date = [now.getDate(), now.getMonth(), now.getFullYear()].join(''),
                    tracking_data = localStorage.getItem('hb_track_tag_vote_count') || {
                        event: 'tag_vote',
                        date: current_date,
                        upvote: 0,
                        downvote: 0,
                        count: 0
                    };

                if (_.isString(tracking_data)) {
                    try { tracking_data = JSON.parse(tracking_data); } catch (e) {}
                }

                if (!tracking_data.date === current_date) {

                    // send data to Google Analytics
                    chrome.runtime.sendMessage({
                        message: 'log_analytics',
                        data: {
                            hitType: 'event',
                            eventLabel: 'heartbeat_tags',
                            eventAction: 'click',
                            eventCategory: tracking_data.event,
                            eventValue: tracking_data.count || 0,
                            metric0: tracking_data.upvote || 0,
                            metric1: tracking_data.downvote || 0
                        }
                    });


                    // change to new date
                    tracking_data.date = current_date;
                    // reset count
                    tracking_data.count = 0;
                    tracking_data.upvote = 0;
                    tracking_data.downvote = 0;
                }

                // count+1
                tracking_data.count++;
                is_up ? tracking_data.upvote++ : tracking_data.downvote++;

                // save back to local storage
                localStorage.setItem('hb_track_tag_vote_count', JSON.stringify(tracking_data));
            },

            vote_tag: function (tag_name, vote, callback) {
                var input = {
                        email: data.email,
                        video_id: this.video_id,
                        tag_name: tag_name,
                        vote: vote
                    },
                    that = this;

                if (this.is_voting) {
                    return;
                }

                that.is_voting = true;
                util.api('video_tag')('vote')
                    .post(input, function (err) {
                        that.is_voting = false;
                        callback && callback(err);
                    });
            },

            show_more_other_tags: function () {
                var elem = util.$('#show_more_other_tags', this.other_tags_dom);

                elem.style.display = 'none';
                util.$('#freedom_other_taglist', this.other_tags_dom).add_class('show_all');
            },

            render_popup_tag_list: function (list_id, tags) {
                var div_list = util.$('#' + list_id, this.widget_dom),
                    ul_container = util.$('#' + list_id + ' .freedom_tag_section_body', this.widget_dom)[0],
                    ul = ['ul'],
                    that = this;

                div_list.remove_class('has_more');
                _(tags)
                    .forEach(function (tag) {
                        ul.push(['li', {
                                class: 'tag_list_item',
                                onclick: that.on_select_tag,
                                title: tag
                            },
                            ['span', tag],
                            ['a', {
                                    href: 'https://www.youtube.com/results?search_query=' +
                                        encodeURIComponent(tag)
                                },
                                ['i', {class: 'fa fa-search'}]
                            ],
                        ]);
                    })
                    .commit();

                if (ul.length > 1) {
                    util.$('#' + list_id + ' ul', this.widget_dom);
                    ul_container.replace(jsonToDOM(ul));

                    if (list_id === freedom_owner_tags && ul.length > 12) {
                        div_list.add_class('has_more');
                    }
                }
                else {
                    ul_container.replace(jsonToDOM(['span', {class: 'no_suggestion'},
                        util.locale('no_tag_found')
                    ]));
                }
            },

            refresh_auto_complete_popup: function (suggested_tags, favorite_tags, owner_tags) {
                if (suggested_tags) {
                    this.render_popup_tag_list(freedom_suggested_tags, suggested_tags);
                }

                if (favorite_tags) {
                    this.render_popup_tag_list(freedom_favorites_tags, favorite_tags);
                }

                if (owner_tags) {
                    this.render_popup_tag_list(freedom_owner_tags, owner_tags);
                }

                util.$('#freedom_tag_popup').style.display = 'block';
            },

            filter_used_tags: function (tags) {
                var filtered = [],
                    that = this,
                    found;

                _(tags || [])
                    .forEach(function (tag) {
                        found = that.find_video_tag(tag);
                        if (found) {
                            return;
                        }

                        filtered.push(tag);
                    })
                    .commit();

                return filtered;
            },

            hide_auto_complete_popup: function () {
                var popup = util.$('#freedom_tag_popup');

                popup.style.display = 'none';
                document.removeEventListener('click', this.hide_auto_complete_popup);
            },

            on_select_tag: function (evt) {
                var text_box = util.$('#freedom_tag_input', this.widget_dom);

                text_box.value = evt.srcElement.innerText;
                this.on_insert_new_tag_from_textbox();
            },

            on_remove_video_tag: function (evt) {
                var that = this,
                    btn = evt.srcElement,
                    video_tag_id = btn.getAttribute('video_tag_id');

                util.api('video_tags')({video_tag_id: video_tag_id})
                    .delete(function (err) {
                        if (err) {
                            return;
                        }

                        that.remove_video_tag(video_tag_id);
                        //that.refresh_other_list_status();
                    });
            },

            on_insert_video_tag_from_others: function (evt) {
                var that = this,
                    btn = util.bind_elem_functions(evt.srcElement),
                    tag_name = btn.getAttribute('tag_name');

                if (this.find_video_tag(tag_name)) {
                    return;
                }

                this.insert_new_tag(tag_name, function (result) {
                    _(result)
                        .forEach(function (tag) {
                            that.video_tags.push(tag);
                            that.append_tags([tag]);
                        })
                        .commit();

                    btn.add_class('added');
                });
            },

            find_video_tag: function (tag) {
                var found = null;

                return _(this.video_tags).find(function (elem) {
                    return elem.tag_name && elem.tag_name.toLowerCase() === tag.toLowerCase();
                });
            },

            insert_new_tag: function (tag, on_success, always) {
                var that = this,
                    err = this.check_input(tag),
                    video_id = util.parse_qs().v;

                if (err) {
                    this.show_tooltip_box(err);
                    always && always();
                    return;
                }

                if (!video_id) {
                    always && always();
                    return;
                }

                util.api('video_tags')
                    .post({
                        video_id: video_id,
                        email: data.email,
                        tag_name: tag
                    }, function (err, result) {
                        if (err || !result) {
                            that.show_tooltip_box(util.locale('tag_not_allowed'));
                        }
                        else if (on_success) {
                            on_success(result);
                        }

                        always && always();
                    });
             },

            remove_video_tag: function (video_tag_id) {
                var tag_index = -1,
                    tag_dom = util.$('#freedom_vt_' + video_tag_id);

                tag_index = _(this.video_tags).findIndex(function (video_tag) {
                    return video_tag.video_tag_id === +video_tag_id;
                });

                if (~tag_index) {
                    this.video_tags.splice(tag_index, 1);
                }

                if (tag_dom) {
                    tag_dom.remove();
                }
            },

            is_watching: function () {
                return location.pathname === '/watch';
            },

            refresh_other_list_status: function () {
                var that = this,
                    user_tags = util.$('.freedom_video_tag', this.other_tags_dom);

                _(user_tags)
                    .forEach(function (tag_elem) {
                        var icon = util.$('.add', tag_elem)[0];

                        if (that.find_video_tag(tag_elem.getAttribute('tag_name'))) {
                            icon.add_class('added');
                            return;
                        }

                        icon.remove_class('added');
                    })
                    .commit();
            },

            show_user_badge: function () {
                var that = this;
                util.api('taggers')
                    ({email: data.email})
                    .get(function (err, result) {
                        if (err || !result) return;

                        util.$('#freedom_tag_badge', that.widget_dom).style.display =
                            result.is_good_tagger ? 'block' : 'none';
                    });
            },

            show_tooltip_box: function (err) {
                var tooltip = util.$('#blacklist_check');

                tooltip.style.display = 'block';
                tooltip.innerText = err || util.locale('blacklist_tips');
                tooltip.style.top = 0 - tooltip.offsetHeight - 10 + 'px';
            },

            hide_tooltip_box: function () {
                util.$('#blacklist_check').style.display = 'none';
            },

            check_space_only: function (tag) {
                return /^\s+$/.test(tag) || tag === '';
            },

            check_input: function (tag) {
                if (util.contains_offensive_words(tag)) {
                    return util.locale('blacklist_tips');
                }

                if (this.check_space_only(tag)) {
                    return util.locale('tag_cannot_space');
                }

                if (tag.length < 2) {
                    return util.locale('tag_so_short');
                }

                return '';
            }
        };

    widgets.push(widget);

})();
