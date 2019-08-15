(function () {
    'use strict';

    var widget = {

        name: 'Auto Expand Description',

        initialize: function () {
            widget.show = location.pathname === '/watch';
        },

        start: function () {
            if (!widget.show || !settings.auto_expand_description) return;

            util.$wait('#action-panel-details.yt-uix-expander-collapsed', function (err, ele) {
                if (err) return;

                ele.remove_class('yt-uix-expander-collapsed');
            });
        },

        stop: function () {
            var ele = util.$('#action-panel-details:not(.yt-uix-expander-collapsed)');

            ele && ele.add_class('yt-uix-expander-collapsed');
        },

        settings_changed: function (change) {
            if (change.auto_expand_description && widget.show) {
                settings.auto_expand_description ? widget.start() : widget.stop();
            }
        }
    };

    widgets.push(widget);

})();
