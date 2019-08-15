(function () {
    'use strict';

    var widget = {

        name: 'Disable annotations',

        initialize: function () {
            widget.show = location.pathname === '/watch';

            if (!widget.show) return;

            widget.hide_anno_css = jsonToDOM(
                ['style', {
                        id: 'hb_hide_anno',
                        type: 'text/css'
                    },
                    '#player-api .video-annotations{display:none};'
                ]
            );
        },

        start: function () {
            if (!widget.show || !settings.disable_annotations || util.$('#hb_hide_anno')) return;

            util.$wait('head', function (err, eles) {
                eles[0].appendChild(widget.hide_anno_css);
            });
        },

        stop: function () {
            util.$remove('#hb_hide_anno');
        },

        settings_changed: function (change) {
            if (change.disable_annotations && widget.show) {
                settings.disable_annotations ? widget.start() : widget.stop();
            }
        }
    };

    widgets.push(widget);

})();
