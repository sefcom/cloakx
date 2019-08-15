(function () {
    'use strict';

    var widget = {
        
        name: 'Icon mode only on watch page',

        initialize: function () {
            widget.show = location.pathname === '/watch';
        },

        start: function () {
            if (!widget.show || !settings.icon_mode) return;

            util.$wait('#watch8-secondary-actions', function (err, el) {
                if (err) return;

                el.add_class('icon_mode');
            });
        },

        stop: function () {
            util.$('#watch8-secondary-actions').remove_class('icon_mode');
        },

        settings_changed: function (change) {
            if (change.icon_mode && widget.show) {
                settings.icon_mode
                    ? widget.start()
                    : widget.stop();
            }
        }
    };

    widgets.push(widget);
})();
