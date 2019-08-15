(function () {
    'use strict';

    var widget = {

        name: 'Recommended Defaults',

        initialize: function(){
            widget.show = location.pathname === '/upload_defaults';
        },

        start: function () {
            if (!widget.show) return;

            util.$wait('#creator-subheader', function (err, element) {
                if (err || !element) return;

                element.$('.creator-subheader-controls')[0].append_child(
                    ['button', {
                            class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-primary',
                            onclick: widget.set_default_settings
                        }, ['span', {
                            class: 'yt-uix-button-content'
                        }, 'Recommended Defaults']
                    ]
                );
            });
        },

        set_default_settings: function (e) {
            e.preventDefault();

            var evt,
                captions_certificate_ele = util.$('select[name="captions_certificate"]')[0],
                check_box = [
                    'input[name="allow_comments"]',
                    'input[name="allow_ratings"]',
                    'input[name="overlay_ads"]',
                    'input[name="trueview_instream_ads"]',
                    'input[name="instream_ads"]',
                    'input[name="long_instream_ads"]',
                    'input[name="product_listing_ads"]',
                    'input[name="auto_gen_midroll_ads"]',
                    'input[name="captions_crowdsource"]'
                ];

            _(util.$(check_box.join()))
                .forEach(function (ele) {
                    if (!ele.checked) {
                        ele.click();
                    }
                })
                .commit();

            captions_certificate_ele.selectedIndex = 1;

            evt = document.createEvent('HTMLEvents');
            evt.initEvent('change', false, true);
            captions_certificate_ele.dispatchEvent(evt);
        }
    };

    widgets.push(widget);
})();
