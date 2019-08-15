(function () {
    'use strict';

    var widget = {

        name: 'YouTube Scroll To Top',
        container: '#yt_scroll_to_top',

        initialize: function () {
            if (window.location.pathname === '/watch' && util.$('#body-container')) {
                widget.set_button();
            }
            else {
                setTimeout(widget.initialize, 1000);
            }
        },

        set_button: function () {
            var scroll_to_top = function () {
                window.scrollTo(0, 0);
            };

            if (!util.$('#hb_scroll_top')) {
                widget.scroll_button = jsonToDOM(
                    ['div', {
                            id: 'hb_scroll_top',
                            onclick: scroll_to_top
                        },
                        ['i', {class: 'fa fa-arrow-up'}]
                    ]
                );

                util.$('#body-container').appendChild(widget.scroll_button);
            }

            if (window.scrollY < config.yt_scroll_limit) {
                widget.scroll_button.style.display = 'none';
            }

            window.onscroll = widget.detect_scroll;
        },

        detect_scroll: function () {
            if (settings.scroll_to_top) {
                widget.scroll_button.style.display = (window.scrollY >= config.yt_scroll_limit) ? 'block' : 'none';
            }
            else {
                widget.scroll_button.style.display = 'none'; 
            }
        },

        settings_changed: function (change) {
            if (change.scroll_to_top) {
                this.detect_scroll();
            }
        }

    };

    widgets.push(widget);

})();
