(function () {
    'use strict';

    var start_script = function () {
        var player      = document.querySelector('#movie_player'),
            duration    = player.getDuration();

        window.bind_shortcut = function (e) {
            if (is_input(e.target)) return;

            var key_code            = e.keyCode,
                pause_shortcut      = 32,
                backward_shortcuts  = [37, 39],
                volume_shorcuts     = [38, 40],
                seek_shortcuts      = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];

            if (~seek_shortcuts.indexOf(key_code)) {
                seek_to(key_code);
            }
            else if (~backward_shortcuts.indexOf(key_code)) {
                player.seekTo(player.getCurrentTime() + (key_code > 38 ? 5 : -5));
            }
            else if (~volume_shorcuts.indexOf(key_code)) {
                player.isMuted() && player.unMute();
                player.setVolume(player.getVolume() + (key_code < 39 ? 5 : -5));
            }
            else if (key_code === pause_shortcut) {
                player.getPlayerState() === 2
                    ? player.playVideo()
                    : player.pauseVideo();
            }
        }

        function is_input (el) {
            var el_type = el.getAttribute('type');

            return el_type === 'text' || el_type === 'textarea';
        }

        function seek_to (key_code) {
            var gap     = key_code - ((key_code > 57) ? 96 : 48),
                time    = Math.ceil(duration * gap / 10);

            player.seekTo(time);
        }

        document.addEventListener('keyup', bind_shortcut)
    };

    var stop_script = function () {
        document.removeEventListener('keyup', window.bind_shortcut);
    };

    var widget = {

        name: 'Turn on youtube shortcut',

        start: function () {
            if (location.pathname !== '/watch' || !settings.toggle_yt_shortcut) return;

            util.$wait('#movie_player', function (err) {
                if (err) return;

                util.load_script(start_script);
            });
        },

        settings_changed: function (change) {
            if (change.toggle_yt_shortcut) {
                settings.toggle_yt_shortcut
                    ? util.load_script(start_script)
                    : util.load_script(stop_script)
            }
        }
    };

    widgets.push(widget);
})();
