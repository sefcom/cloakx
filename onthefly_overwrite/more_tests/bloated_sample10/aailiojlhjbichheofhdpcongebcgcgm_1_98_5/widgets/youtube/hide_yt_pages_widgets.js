(function () {
    'use strict';

    var widget = {

        name: 'Heartbeat YouTube Watch Page Widgets Hider',
        container: '#hb_yt_watch_page_widgets_hider',

        initialize: function () {
            var createHiddenTag = function (sel) {
                return jsonToDOM(['style', sel + ' {display: none;}']);
            }

            widget.all_widgets = {
                hide_yt_video_information: createHiddenTag('#watch-header'),
                hide_yt_video_description: createHiddenTag('#action-panel-details'),
                hide_yt_video_comments: createHiddenTag('#watch-discussion'),
                hide_yt_footer: createHiddenTag('#footer-container'),
                hide_yt_up_next_playlist: createHiddenTag('#watch7-sidebar-contents'),
                hide_yt_dislike_button: createHiddenTag('button.like-button-renderer-dislike-button[title="I dislike this"]')
            };
        },

        start: function () {
            if (!settings.hide_youtube_widgets) {
                return;
            }

            _(widget.all_widgets)
                .forEach(function (hidden_tag, name) {
                    if (settings[name]) {
                       util.$('head')[0].appendChild(hidden_tag);
                    }
                })
                .commit();
        },

        stop: function () {
            _(widget.all_widgets)
                .forEach(function (hidden_tag, name) {
                    hidden_tag.remove();
                })
                .commit();
        },

        settings_changed: function (change) {

            if (change.hide_youtube_widgets) {

                if (settings.hide_youtube_widgets) {
                    widget.start();
                }
                else {
                    widget.stop();
                }
                return;
            }

            var head = util.$('head')[0],
                check = function (name, hidden_tag) {
                    if (settings[name]) {
                        head.appendChild(hidden_tag);
                    }
                    else {
                        hidden_tag.remove();
                    }

                    return true;
                };

            _(widget.all_widgets)
                .some(function (hidden_tag, name) {
                    if (change[name]) {
                        if (name === 'hide_yt_footer' && change[name].newValue) {
                            util.log_count_per_day('hide_yt_footer');
                        }
                        return check(name, hidden_tag);
                    }
                });
        }
    };

    widgets.push(widget);
})();

