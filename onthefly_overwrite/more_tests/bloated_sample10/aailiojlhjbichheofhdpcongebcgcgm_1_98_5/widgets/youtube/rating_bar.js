(function () {
    'use strict';

    var widget = {

        name: 'Video Rating Bar',

        initialize: function () {
            if (!settings.rating_bar) return;

            this.video_info = {};
            this.bar_counter = 0;
            this.rating_overlay = jsonToDOM(
                ['span', {class: 'freedom_rating_overlay'},
                ['span', {class: 'freedom_overlay_likes'}],
                ['span', {class: 'freedom_overlay_dislikes'}]
            ]);

            this.rating_bar = jsonToDOM(
                ['span', {class: 'freedom_bar_container'},
                ['span', {class: 'freedom_rating_bar'}],
                ['span', {class: 'freedom_rating_bar'}]
            ]);
        },

        start: function () {
            var li_sect,
                li_secty,
                video_ids = [],
                i = 0,
                obj,
                x,
                y,
                id_container,
                vid_timer,
                vid_thumb;

            if (!settings.rating_bar) return;

            if (data.page === 'results') {
                li_sect = util.$('.item-section>li');
                id_container = 'data-context-item-id';
                vid_timer = '.video-time';
                vid_thumb = '.yt-lockup-thumbnail';
            }
            else if (data.page === 'watch') {

                li_sect = util.$('.watch-sidebar-body .video-list-item');
                id_container = 'data-vid';
                vid_timer = undefined;
                vid_thumb = '.thumb-wrapper';

                if (util.$('#watch-more-related-button') !== null) {
                    util.$('#watch-more-related-button').addEventListener('click', function (evt) {
                         widget.on_rerating();
                    });
                }

                if (util.$('#watch-more-related .video-list-item') !== undefined) {
                    li_secty = util.$('.watch-sidebar-body #watch-more-related .video-list-item');
                }

            }
            else if (location.pathname === '/feed/subscriptions' || data.page === 'index') {
                li_sect = util.$('li.yt-shelf-grid-item');
                id_container = 'data-context-item-id';
                vid_timer = '.yt-shelf-grid-item .video-time';
                vid_thumb = '.yt-shelf-grid-item .yt-lockup-thumbnail';

                if (util.$('.load-more-button').length) {
                    document.addEventListener('click', function (evt) {
                        var btn = util.bind_elem_functions(evt.target);

                        if (btn.has_class('load-more-text')) {
                            widget.on_rerating();
                        }
                    });

                    document.addEventListener('scroll', widget.on_scroll_lazy_load);
                }
            }
            else {
                return;
            }

            if (!li_sect.length) {
                return;
            }

            for (i; i < li_sect.length; i++) {

                obj = {};
                switch (data.page) {
                    case 'watch':
                        if (li_sect) {
                            x = li_sect[i].querySelector('.yt-uix-simple-thumb-wrap');
                        }
                        /*if (li_secty.length !== 0) {
                            y = li_secty[i].querySelectorAll('.yt-uix-button')[1];
                        }*/
                        break;
                    case 'results':
                        x = li_sect[i].querySelector('div');
                        break;
                    case 'feed':
                    case 'index':
                        x = li_sect[i].querySelector('div.yt-lockup-video');
                        break;
                    default:
                        break;
                }

                if (x && x.getAttribute(id_container) !== undefined) {
                    obj.video_id = x.getAttribute(id_container);
                    obj.timer = li_sect[i].querySelector(vid_timer);
                    obj.thumb = li_sect[i].querySelector(vid_thumb);
                }
                else {
                    obj.video_id = null;
                }

                if (obj.video_id !== null) {
                    video_ids.push(obj.video_id);
                    this.video_info[obj.video_id] = obj;
                }
            }

            if (li_secty && li_secty.length) {
                i = 0;

                for (i; i < li_secty.length; i++) {

                    obj = {};
                    y = li_secty[i].querySelectorAll('.yt-uix-button')[1];

                    if (y && y.getAttributeNode(id_container) !== undefined) {
                        obj.video_id = y.getAttribute(id_container);
                        obj.timer = li_secty[i].querySelector(vid_timer);
                        obj.thumb = li_secty[i].querySelector(vid_thumb);
                    }
                    else {
                        obj.video_id = null;
                    }

                    if (obj.video_id !== null) {
                        video_ids.push(obj.video_id);
                        this.video_info[obj.video_id] = obj;
                    }
                }
            }

            this.get_ratings(video_ids, this.on_rating);
        },

        get_ratings: function (video_ids, callback) {
            var ratings = localStorage.getItem('heartbeat_video_ratings'),
                new_video_ids = [],
                results = [],

                save_and_next = function () {
                    _.forEach(results,  function (item) {
                        if (ratings[item.id]) return;

                        ratings[item.id] = item;
                        ratings[item.id].inserted_date = new Date();
                    });

                    localStorage.setItem('heartbeat_video_ratings', JSON.stringify(ratings));
                    callback && callback(results);
                };

            if (ratings) {
                try {ratings = JSON.parse(ratings);} catch (e) { ratings = {}; };
            }
            else {
                ratings = {};
            }

            _.forEach(video_ids, function (video_id) {
                var valid = ratings[video_id] && moment().diff(ratings[video_id].inserted_date, 'hours') < 72;

                if (valid) {
                    results.push(ratings[video_id]);
                }
                else {
                    delete ratings[video_id];
                    new_video_ids.push(video_id);
                }
            });

            if (!new_video_ids.length) {
                return save_and_next();
            }

            async.until(
                function () {
                    return !new_video_ids.length;
                },
                function (callback) {
                    var video_ids_to_call = new_video_ids.splice(0, 50).join();

                    fermata.json('https://www.googleapis.com/youtube/v3/videos')
                        ({
                            part: 'statistics',
                            id: video_ids_to_call,
                            key: config.youtube_browser_key2
                        })
                        .get(function (err, data) {
                            if (err) return callback(err);

                            if (data.items.length) {
                                results = results.concat(data.items);
                            }

                            callback();
                        });
                },
                function (err) {
                    if (err) return;

                    save_and_next();
                }
            );
        },

        on_rating: function (items) {
            _.forEach(items,  function (item) {
                widget.video_info[item.id].likes = item.statistics.likeCount;
                widget.video_info[item.id].dislikes = item.statistics.dislikeCount;
            });

            this.render();
        },

        parse_rating: function (text) {
            var rt = parseInt(text);

            return isFinite(rt) ? rt : 0;
        },

        render: function () {
            var i = 0,
                clone_bar,
                clone_overlay,
                l,
                d;

            if (!this.video_info) {
                return;
            }

            for (i in this.video_info) {

                if (this.video_info[i].thumb
                    && !this.video_info[i].thumb.querySelector('.freedom_bar_container')
                    && this.video_info[i].video_id) {

                    if (this.video_info[i].timer !== null) {
                        this.video_info[i].timer.style.bottom = '9px';
                        this.video_info[i].timer.className += ' freedom_video_timer';
                    }

                    l = this.parse_rating(this.video_info[i].likes);
                    d = this.parse_rating(this.video_info[i].dislikes);

                    if (l !== 0 || d !== 0) {
                        this.bar_counter += 1;
                        clone_bar = this.rating_bar.cloneNode(true);
                        clone_bar.firstChild.style.width = (l * 100) / (l + d) + '%';
                        clone_bar.firstChild.style.background = '#25811C';
                        clone_bar.lastChild.style.width = (d * 100) / (l + d) + '%';
                        clone_bar.lastChild.style.background = '#CD201F';
                        clone_overlay = this.rating_overlay.cloneNode(true);
                        clone_overlay.firstChild.textContent = '  ' + l + '\n';
                        clone_overlay.lastChild.textContent = '  ' + d;
                        this.video_info[i].thumb.appendChild(clone_overlay);
                        if (this.video_info[i].thumb) {
                            this.video_info[i].thumb.appendChild(clone_bar);

                        }
                    }
                    else {
                        this.bar_counter += 1;
                        clone_bar = this.rating_bar.cloneNode(true);
                        clone_bar.firstChild.style.width = '50%';
                        clone_bar.firstChild.style.background = '#777777';
                        clone_bar.lastChild.style.width = '50%';
                        clone_bar.lastChild.style.background = '#777777';
                        this.video_info[i].thumb.appendChild(clone_bar);
                    }
                }
            }

            if (!settings.rating_bar) {
                util.$('.freedom_bar_container').forEach(function (node) {
                    node.style.display = 'none';
                });
                util.$('.freedom_rating_overlay').forEach(function (node) {
                    node.style.display = 'none';
                });
                util.$('.freedom_video_timer').forEach(function (node) {
                    node.style.bottom = '2px';
                });
            }

            this.settings_changed(settings);
        },

        settings_changed: function (change) {
            if (change.rating_bar) {
                util.$('.freedom_bar_container').forEach(function (node) {
                    node.style.display = settings.rating_bar ? 'inline' : 'none';
                });
                util.$('.freedom_rating_overlay').forEach(function (node) {
                    node.style.display = settings.rating_bar ? '' : 'none';
                });
                util.$('.freedom_video_timer').forEach(function (node) {
                    node.style.bottom = settings.rating_bar ? '9px' : '2px';
                });
            }
        },

        on_rerating: function () {
            setTimeout(widget.start, 2500);
        },

        on_scroll_lazy_load: function () {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                document.removeEventListener('scroll', this.on_scroll_lazy_load);
                this.on_rerating();
            }
        }
    };

    widgets.push(widget);

})();
