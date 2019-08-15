(function () {
    'use strict';

    var widget = {

        name: 'Shorten url',

        initialize: function () {
            widget.show = location.pathname === '/upload' || location.pathname === '/edit';

            if (!widget.show) return;

            this.widget_dom = jsonToDOM(['div', {id: 'upload_shorten_url'},
                ['input', {
                    id: 'txt_long_url',
                    style: 'display: none',
                    class: 'yt-uix-form-input-text',
                    onclick: function (evt) {evt.currentTarget.select();},
                    placeholder: util.locale('paste_your_long_url_here')
                }],
                ['button', {
                    id: 'btn_generate_url',
                    onclick: this.generate_short_url,
                    class: 'yt-uix-button yt-uix-button-default'
                }, util.locale('shorten_url')],
                ['span', {id: 'icon_copied',},
                    ['i', {class: 'fa fa-check'}],
                    util.locale('url_copied')
                ]
            ]);
        },

        start: function () {
            if (!widget.show) {
                return widget.stop();
            }

            widget.render();
        },

        stop: function () {
            util.$remove('#upload_shorten_url');
        },

        render: function () {
            if (widget.is_in_upload()){
                widget.render_in_upload();
                return;
            }

            if (widget.is_in_edit()){
                widget.render_in_edit();
            }
        },

        render_in_upload: function () {
            var content = util.$('#content'),
                uploaded = util.$('#active-uploads-contain') && util.$('#active-uploads-contain').firstChild;

            if (content && uploaded) {
                content.appendChild(widget.widget_dom);
            }
        },

        render_in_edit: function () {
            var content = util.$('.video-settings-form .metadata-column')[0];

            if (content) {
                content.appendChild(widget.widget_dom);
                util.$('#txt_long_url', widget.widget_dom).style.display = 'inline';
            }
        },

        generate_short_url: function (evt) {
            var txt_long_url = util.$('#txt_long_url', widget.widget_dom),
                wrapper = util.$('#upload_shorten_url');

            evt.stopPropagation();
            evt.preventDefault();

            if (txt_long_url.style.display === 'none') {
                txt_long_url.style.display = 'inline';
                txt_long_url.focus();
                return;
            }

            if (!txt_long_url.value) {
                return;
            }

            wrapper.remove_class('copied');

            util.api('shorten_url')({url: txt_long_url.value})
                .get(function (err, result) {
                    if (err || !result) return;

                    var short_url = 'goto.tm/' + result.short_url;

                    txt_long_url.value = short_url;

                    chrome.runtime.sendMessage({
                        message: 'copy_text',
                        text: short_url
                    }, function () {
                        wrapper.add_class('copied');
                    });
                });
        },

        integrity: function () {
            return util.$('#upload_shorten_url');
        },

        is_in_upload: function () {
            return location.pathname === '/upload';
        },

        is_in_edit: function () {
            return location.pathname === '/edit';
        }
    };

    widgets.push(widget);

})();
