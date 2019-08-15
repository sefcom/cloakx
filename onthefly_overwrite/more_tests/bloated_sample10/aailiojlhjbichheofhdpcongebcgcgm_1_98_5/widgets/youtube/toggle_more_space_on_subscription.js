(function () {
    'use strict';

    var widget = {

        name: 'Toggle more space on description',

        el: null,

        start: function () {
            if (location.pathname !== '/feed/subscriptions' || !settings.toggle_more_space) return;

            util.$wait('#content', function (err, el) {
                if (err) return;

                widget.el = el;
                widget.el.add_class('hb_more_space');
            });
        },

        settings_changed: function (change) {
            if (change.toggle_more_space && widget.el) {
                settings.toggle_more_space
                    ? widget.el.add_class('hb_more_space')
                    : widget.el.remove_class('hb_more_space');
            }
        }

    };

    widgets.push(widget);
})();
