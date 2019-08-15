'use strict';
/*
    @@name Autoplay Disable
*/

(function () {

    var widget = {

        name: 'Autoplay disable',

        initialize: function () {
            var i,
                trigger = jsonToDOM(
                    ['script',
                        'i = setInterval(function () {var ply = document.getElementById("movie_player"),seek = window.location.href.split("&t=")[1] || 0,parse = typeof(seek) === "string" ? seek.split("m") : seek;if (parse.length) {seek = (+parse[0] * 60) + +(parse[1].split("s")[0]);}if (ply) {ply.mute();clearInterval(i);i = setInterval(function () {if (ply.getAdState() === 1 && ply.getPlayerState() === 3) {ply.unMute();}else {clearInterval(i);i = setInterval(function () {if (ply.getPlayerState() === 1 && ply.getCurrentTime() > 0) {clearInterval(i);ply.pauseVideo();ply.unMute();ply.seekTo(+seek);}}, 50);}}, 50);}}, 50);'
                    ]
                );

            if (window.location.href.indexOf('watch') > -1 && settings.disable_autoplay_new) {
                i = setInterval(function () {
                    if (util.$('body').length) {
                        clearInterval(i);
                        util.$('body')[0].appendChild(trigger);
                    }
                });
            }
        }
    };

    widgets.push(widget);

})();
