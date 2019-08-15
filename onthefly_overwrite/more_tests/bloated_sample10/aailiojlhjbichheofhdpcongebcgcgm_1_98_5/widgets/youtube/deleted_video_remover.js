'use strict';
/*
    @@name Deleted video remover
*/

(function () {

    var widget = {

        name: 'Deleted video remover',

        initialize: function () {
            this.remover_button_div = jsonToDOM(
                ['button', {
                        id: 'deleted-video-remover',
                        class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default playlist-add-video-button',
                        style: settings.deleted_video_remover ? '' : 'display:none',
                        onclick: 'return false;'
                    },
                    ['span', {
                            class: 'yt-uix-button-content'
                        },
                        util.locale('deleted_video_remover')
                    ]
                ]
            );

            this.remover_button_div.addEventListener('click', this.remove_videos);
        },

        start: function () {
            if (data.page === 'playlist' && ~window.location.href.indexOf('?list') && settings.deleted_video_remover) {
                this.render();
            }
            else {
                this.remover_button_div.remove();
            }
        },

        render: function () {
            var container = util.$('#playlist-add-video-form');

            if (container) {
                container.appendChild(this.remover_button_div);
            }
        },

        remove_videos: function () {
            _(util.$('.pl-video'))
                .forEach(function (e) {
                    if (e.getAttribute('data-title') === '[Deleted Video]') {
                        util.$('.pl-video-edit-options', e)[0].children[1].click();
                    }
                })
                .commit();

            return false;
        },

        settings_changed: function (change) {
            if (change.deleted_video_remover) {
                if (!settings.deleted_video_remover) {
                    return this.remover_button_div.remove();
                }
                
                this.start();
            }
        },

        integrity: function() {
            return util.$('#deleted-video-remover');
        }
    };

    widgets.push(widget);

})();

