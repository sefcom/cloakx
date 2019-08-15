(function () {
    'use strict';

    var widget = {

        name: 'Truncate long title',

        el: null,

        start: function () {
            if (location.pathname !== '/feed/subscriptions' || !settings.truncate_long_title) return;

            util.$wait('#content', function (err, el) {
                if (err) return;

                widget.el = el;
                widget.el.add_class('title_truncated');
            });
        },

        settings_changed: function (change) {
            if (change.truncate_long_title) {
                settings.truncate_long_title
                    ? widget.el.add_class('title_truncated')
                    : widget.el.remove_class('title_truncated');
            }
        }

    };

    widgets.push(widget);
})();
