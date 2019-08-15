(function () {

    'use strict';

    var widget = {

        name: 'Heartbeat moments on progress bar',

        initialize: function () {
            this.show = location.pathname === '/watch';

            if (this.show && !this.widget_dom) {
                this.widget_dom = jsonToDOM(['div', {id: 'saved_moment_progress_bar'}]);
            }
        },

        start: function () {
            var qs = util.parse_qs(),
                that = this;

            if (!settings.save_moment || !this.show) {
                this.remove();
                return;
            }

            this.video_id = qs.v;
            util.wait_for(this.is_ready_to_play, function (err) {
                if (err) return;
                that.render();
                that.load_commented_moments();
            });
        },

        render: function () {
            var bar_container = util.$('#player-api .ytp-progress-list')[0];

            this.remove();
            if (bar_container) {
                bar_container.appendChild(this.widget_dom);
            }

            // remove all old tooltips
            this.hide_all_tooltips();
        },

        remove: function () {
            if (this.widget_dom) {
                util.bind_elem_functions(this.widget_dom).empty();
                this.widget_dom.remove();
            }
            
            this.hide_all_tooltips();
        },

        integrity: function() {
            return util.$('#saved_moment_progress_bar')
                && this.video_id === util.parse_qs().v;
        },

        settings_changed: function (change) {
            if (change.save_moment && !settings.save_moment) {
                this.remove();
            }
        },

        load_commented_moments: function () {
            var that = this,
                limit = 30;

            util.api('hb_moments')({
                    video_id: util.parse_qs().v,
                    limit: limit,
                    comment: true,
                    sort: 'inserted_date',
                    sort_dir: 'DESC'
                })
                .get(function (err, result) {
                    if (err || !result || !result.items.length) {
                        return;
                    }

                    that.commented_moments = _.sortBy(
                        result.items, 
                        function (item) {
                            item.start_at_secs = moment.duration(item.start_at).asSeconds();
                            return item.start_at_secs;
                        }
                    );

                    that.render_commented_moments();
                });
        },

        render_commented_moments: function () {
            // show moments
            _.forEach(this.commented_moments, this.add_moment_progress_bar);

            // set timer
            clearInterval(this.tooltip_interval);
            this.tooltip_interval = setInterval(this.check_for_tooltip_show, 1000);
        },

        get_video_player: function () {
            return util.$('#player video')[0];
        },

        is_ready_to_play: function () {
            var player = this.get_video_player();

            return player && player.duration;
        },

        add_moment_progress_bar: function (info) {
            var progress_bar = util.$('#saved_moment_progress_bar'),
                bar_container = util.$('#player-api .ytp-progress-list')[0],
                video_player = this.get_video_player(),
                moment_bar = jsonToDOM(['div', {
                        id: 'moment_' + info.id,
                        class: 'hb_moment_bar',
                        tooltip: info.comment
                    }]);

            if (!bar_container || !video_player || !video_player.duration) {
                return;
            }

            if (!progress_bar) {
                progress_bar = jsonToDOM(['div', {id: 'saved_moment_progress_bar'}]);
                bar_container.appendChild(progress_bar);
            }

            progress_bar.appendChild(moment_bar);
            moment_bar.style.left = (info.start_at_secs / video_player.duration * 100) + '%';
        },

        show_tooltip: function (mm) {
            var progress_bar = util.$('.ytp-progress-bar-container')[0],
                moment_elem = util.$('#moment_' + mm.id),
                left = parseInt(moment_elem.style.left.replace('%', '')) / 100 * progress_bar.offsetWidth,
                tooltip = util.$('.hb_moment_tooltip[moment_id="moment_' + mm.id + '"]')[0];

            if (!progress_bar) {
                return;
            }

            if (!tooltip) {
                tooltip = jsonToDOM(['div', {
                        class: 'hb_moment_tooltip',
                        moment_id: moment_elem.id
                    }, 
                    ['div', {class: 'hb_moment_tooltip_inner'}, moment_elem.getAttribute('tooltip')],
                    ['div', {class: 'tooltip_arrow'}]
                ]);
                progress_bar.appendChild(tooltip);
            }

            tooltip.style.top = -5 - tooltip.offsetHeight + 'px';
            tooltip.style.left = left - tooltip.offsetWidth / 2 + moment_elem.offsetWidth / 2 + 'px';
        },

        hide_tooltip: function (mm) {
            var tooltip = util.$('.hb_moment_tooltip[moment_id="moment_' + mm.id + '"]')[0];

            if (tooltip) {
                tooltip.remove();
            }
        },

        hide_all_tooltips: function () {
            this.showing_tooltip = null;
            clearInterval(this.tooltip_interval);
            _.forEach(util.$('.hb_moment_tooltip'), function (elem) {
                elem.remove();
            });
        },

        is_near_playhead: function (moment) {
            var video_player = this.get_video_player(),
                progress_bar_width = util.$('.ytp-progress-bar-container')[0].offsetWidth,
                moment_range = 20,
                distance = Math.abs(moment.start_at_secs - video_player.currentTime);

            return distance / video_player.duration * progress_bar_width < moment_range;
        },

        check_for_tooltip_show: function () {
            var video_player = this.get_video_player(),
                min_distance = this.get_video_player().duration,
                current_time = video_player.currentTime,
                closest = null,
                that = this;

            _.forEach(this.commented_moments, function (mm) {
                var distance = Math.abs(mm.start_at_secs - current_time);

                if (!that.is_near_playhead(mm)) {
                    return;
                }

                if (min_distance > distance) {
                    min_distance = distance;
                    closest = mm;
                }
            });

            if (this.showing_tooltip) {
                this.hide_tooltip(this.showing_tooltip);
            }

            if (closest) {
                this.showing_tooltip = closest;
                this.show_tooltip(closest);
            }
        }
    };

    widgets.push(widget);

})();
