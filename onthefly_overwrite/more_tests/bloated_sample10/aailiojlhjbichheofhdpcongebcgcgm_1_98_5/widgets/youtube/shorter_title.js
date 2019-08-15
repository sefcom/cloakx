(function () {
    'use strict';

    var widget = {

        name: 'Shorter video title',

        el: null,

        start: function () {
            if (location.pathname !== '/watch' || !settings.shorter_title) return;

            util.$wait('#watch-headline-title', function (err, el) {
                if (err) return;

                widget.el = el;
                widget.el.add_class('shorter_title');
            });
        },

        settings_changed: function (change) {
            if (change.shorter_title) {
                settings.shorter_title
                    ? widget.el.add_class('shorter_title')
                    : widget.el.remove_class('shorter_title');
            }
        }

    };

    widgets.push(widget);
})();
