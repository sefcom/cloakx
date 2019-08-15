/*
    Tags widget
*/

(function () {
    'use strict';

    var widget = {

        name: 'Tags',
        container: '#freedom_tags_panel',

        initialize: function () {

            this.show = location.pathname === '/watch';
            if (!this.show) {
                return;
            }

            this.tags_button = jsonToDOM(
                ['div', {
                        id: 'freedom_tags_button',
                        class: 'yt-uix-tooltip' + ((settings.tags && settings.open_tags) ? '' :
                            ' muted'),
                        title: util.locale('view_tags'),
                        style: settings.tags ? '' : 'display:none'
                    },
                    ['img', {
                        src: config.assets_url + 'tag-' + ((settings.tags && settings.open_tags) ?
                            'icon' : 'lighter') + '.png'
                    }],
                    util.locale('tags')
                ]
            );

            this.tags_panel = jsonToDOM(
                ['div', {
                        class: 'action-panel-content yt-card yt-card-has-padding' +
                            ' yt-uix-expander yt-uix-expander-collapsed',
                        id: this.container.slice(1),
                        style: (settings.tags && settings.open_tags) ? '' : 'display:none',
                        'data-vid-id': util.parse_qs().v
                    },
                    ['div', {
                            class: 'yt-uix-button-panel',
                            id: 'freedom_tags_container'
                        },
                        ['h4', {id: 'freedom_tags_header'}, util.locale('tags')],
                        ['button', {
                            id: 'freedom_copy_button',
                            onclick: widget.copy_tags
                        }, util.locale('tags_copy')],
                        ['button', {
                                class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default' +
                                    ' yt-uix-button-empty yt-uix-button-has-icon yt-uix-button-opacity yt-uix-close',
                                type: 'button',
                                id: 'freedom_tags_close'
                            },
                            ['i', {class: 'fa fa-times'}]
                        ],
                        ['br'],
                        ['br']
                    ]
                ]
            );

            this.listen_tag_events();
        },

        start: function () {
            var ul = ['ul', {id: 'freedom_tags_ul'}],
                lis;

            this.show = location.pathname === '/watch';
            if (!this.show || !data.keywords) {
                return;
            }

            lis = data.keywords.map(function (a, index, array) {
                return array.length - 1 === index
                    ? ['li', {class: 'freedom_tag_li'}, a]
                    : ['li', {class: 'freedom_tag_li'}, a,
                        ['span', {class: 'hidden_comma'}, ', ']
                    ];
            });

            if (!util.$('#freedom_tags_ul')) {
                ul = data.keywords.length > 0 ? ul.concat(lis) : ul.concat([
                    ['li', {class: 'freedom_tag_li'}, util.locale('no_tags')]
                ]);

                util.$('#freedom_tags_container', this.tags_panel)
                    .appendChild(jsonToDOM(ul));
            }

            this.render();
        },

        copy_tags: function () {
            var copy_btn = util.$('#freedom_copy_button');
            
            chrome.runtime.sendMessage({
                message: 'copy_text',
                text: data.keywords.join(', ')
            }, function () {
                copy_btn.innerText = util.locale('tags_copied')

                setTimeout(function () {
                    copy_btn.innerText = util.locale('tags_copy');
                }, 1500);
            });
        },

        toggle_tags: function (e) {
            var img = util.$('#freedom_tags_button');

            if (!img) {
                return;
            }

            img = img.firstChild;

            if (img.src === config.assets_url + 'tag-icon.png') {
                img.src = config.assets_url + 'tag-lighter.png';
                this.tags_button.className = 'yt-uix-tooltip muted';
            }
            else {
                img.src = config.assets_url + 'tag-icon.png';
                this.tags_button.className = 'yt-uix-tooltip';
            }

            this.tags_panel.style.display = (settings.open_tags && settings.tags) ? '' : 'none';

            if (!e) {
                this.tags_button.style.display = settings.tags ? 'inline' : 'none';
            }
        },

        listen_tag_events: function () {
            var toggle_tags_and_checkbox = function () {
                settings.set('open_tags', !settings.open_tags);
            };

            util.$('#freedom_tags_close', this.tags_panel)
                .addEventListener('click', toggle_tags_and_checkbox, true);
            this.tags_button.addEventListener('click', toggle_tags_and_checkbox, true);
        },

        remove: function () {
            var elem = util.$(this.container);
            if (elem) {
                elem.parentElement.removeChild(elem);
            }
        },

        render: function () {
            var elem = util.$('#watch8-secondary-actions');

            this.remove();

            if (!data.keywords) {
                return;
            }

            if (!util.$('#freedom_tags_button') && elem) {
                elem.insertBefore(this.tags_button, elem.lastChild);
            }

            util.$wait('#watch7-content', function (err, e) {
                if (!err && e) {
                    e.insertBefore(this.tags_panel, util.$('#action-panel-details'));
                }
            }.bind(this));
        },

        integrity: function () {
            var elem = util.$(this.container);
            return elem && elem.getAttribute('data-vid-id') === data.video_id;
        },

        settings_changed: function (change) {
            if (change.tags || change.open_tags) {
                this.toggle_tags();
            }
        }
    };

    widgets.push(widget);
})();
