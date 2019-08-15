(function () {
    'use strict';

    var widget = {

        name: 'Reaction Count',

        can_run: false,

        initialize: function () {
            widget.reaction_count = jsonToDOM(
                ['span',
                    ['button', {
                        class: 'yt-uix-button'
                    },
                        ['span', {
                            id: 'hb_reaction_count',
                            class: 'yt-uix-button-content'
                        }]
                    ]
                ]
            );
        },

        start: function () {
            if ('watch' === data.page && settings.reaction_count) {
                util.$wait('#watch8-sentiment-actions', function (err, ele) {
                    if (err || !ele) return;

                    var like_count_ele = util.$('.like-button-renderer-like-button-unclicked .yt-uix-button-content', ele)[0],
                        dislike_count_ele = util.$('.like-button-renderer-dislike-button-unclicked .yt-uix-button-content', ele)[0],
                        like_count = parseInt(like_count_ele.innerText.split(/,|\./).join('')),
                        dislike_count = parseInt(dislike_count_ele.innerText.split(/,|\./).join('')),
                        reaction_count = like_count + dislike_count;

                    util.$('.yt-uix-button-content', ele).forEach(function (item) {
                        item.style.display = 'none';
                    })

                    util.$('#hb_reaction_count', widget.reaction_count).innerText = reaction_count.toLocaleString();
                    util.$('.like-button-renderer', ele)[0].appendChild(widget.reaction_count);
                });
            }
        },

        stop: function () {
            util.$wait('#watch8-sentiment-actions', function (err, ele) { 
                util.$('.yt-uix-button-content', ele).forEach(function (item) {
                    item.style.display = '';
                });
                widget.reaction_count.remove();
            });
        },

        settings_changed: function (change) {
            if (change.reaction_count && 'watch' === data.page) {
                if (settings.reaction_count) {
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
