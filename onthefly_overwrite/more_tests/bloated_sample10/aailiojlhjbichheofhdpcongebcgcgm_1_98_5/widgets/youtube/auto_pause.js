(function () {
    'use strict';

    var widget = {

        name : 'Auto Pause',

        show: false,

        initialize: function () {
            if (window.location.pathname === '/watch') {
                widget.show = true;
            }
        },

        start : function () {
            if (widget.show && settings.auto_pause) {
                window.addEventListener('blur', widget.pause);
            }
        },

        stop: function () {
            window.removeEventListener('blur', widget.pause);
        },

        pause: function () {
            var video = util.$('video')[0];

            if (video && !video.paused) {
                video.pause();

                // only auto resume when video playing
                if (settings.auto_resume) {
                    window.addEventListener('focus', widget.resume);
                }
            }
        },

        resume: function () {
            var video = util.$('video')[0];
            video && video.paused && video.play();

            window.removeEventListener('focus', widget.resume);
        },

        settings_changed : function (change) {
            if (change.auto_pause && widget.show) {
                if (settings.auto_pause) {
                    widget.start();
                }
                else {
                    widget.stop();
                }
            }
        }

    };

    widgets.push(widget);

})();
