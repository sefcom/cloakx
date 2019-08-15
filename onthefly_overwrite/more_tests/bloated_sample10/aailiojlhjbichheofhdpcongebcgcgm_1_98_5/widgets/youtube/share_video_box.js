(function () {

    'use strict';

    var widget = {

        name: 'Share video',

        initialize: function () {
            if (!this.is_editing_video()) {
                return;
            }

            this.video_id = util.parse_qs().video_id;
            this.share_source = _.first(location.pathname.split('/'));
            this.share_box_wrapper = jsonToDOM(['div', {id: 'freedom_sharebox_wrapper'},
                ['div', {class: 'freedom_sharebox_title'}, util.locale('share_to_label')]
            ]);
        },

        start: function () {
            if (!this.is_editing_video()) {
                return;
            }

            this.load_share_html();
        },

        render: function () {
            util.$('#player-and-info-pane').appendChild(this.share_box_wrapper);
            widget.bind_event();
        },

        bind_event: function () {
            var social_el = util.$('li', this.share_box_wrapper);

            _(social_el)
                .forEach(function (element) {
                    element.addEventListener('click', function () {
                        util.log_count_per_day('share_box');
                    })
                })
                .commit();
        },

        load_share_html: function () {
            var that = this;

            util.youtube_api('share_ajax')
                ({
                    action_get_share_box: 1,
                    video_id: this.video_id,
                    share_at: true,
                    share_source: this.share_source,
                    verticals: 1,
                    vertical: 0,
                    intentional: 1
                })
                .get(function (err, result) {
                    var dom;

                    if (err) {
                        return;
                    }

                    dom = _(JsonML.fromHTMLText(result.share_html))
                        .filter(function (item) {
                            return _.isArray(item);
                        })
                        .first();

                    that.url_short = result.url_short;
                    if (dom) {
                        that.share_box_wrapper.appendChild(jsonToDOM(dom));
                    }
                    that.render();
                });
        },

        is_editing_video: function () {
            return this.is_in_upload() || this.is_in_edit();
        },

        is_in_upload: function () {
            return location.pathname === '/upload' &&
                util.$('#upload-page') &&
                util.$('#upload-page').has_class('active-upload-page');
        },

        is_in_edit: function () {
            return location.pathname === '/edit';
        }
    };

    widgets.push(widget);
})();
