(function () {
    'use strict';

    var widget = {

        name: 'Default Playback Speed',

        container: '#heartbeat_default_playback_speed',

        show: false,

        initialize: function () {
            if (location.pathname === '/watch') {
                // enable widget on this page
                widget.show = true;

                // initialize widget components
                widget.playback_control = jsonToDOM(
                    ['button', {
                            id : widget.container.slice(1),
                            class : 'yt-uix-tooltip hb_yt_video_control',
                            type : 'button',
                            'data-tooltip-text' : util.locale('enable_playback_speed'),
                            onclick : widget.open_playback_popup
                        },
                        ['span', {class : 'yt-uix-button-content'},
                            ['i', {class : 'fa fa-rocket'}]
                        ]
                    ]
                );

                widget.playback_popup = jsonToDOM(
                    ['div', {
                            id: 'hb_yt_playback_popup',
                            class: 'ytp-popup'
                        },
                        ['div', { class: 'ytp-panel'},
                            ['div', {class: 'ytp-panel-header'}, 'Default speed'],
                            ['div', {class: 'ytp-panel-content'},
                                ['div', {class: 'ytp-menu'},
                                    ['div', {
                                            class: 'ytp-menuitem',
                                            role: 'menuitemradio',
                                            onclick: widget.select_speed(0.25),
                                            'aria-checked': settings.default_playback_speed === 0.25 ? 'true' : undefined
                                        },
                                        ['div', {class: 'ytp-menuitem-label'}, '0.25']
                                    ],
                                    ['div', {
                                            class: 'ytp-menuitem',
                                            role: 'menuitemradio',
                                            onclick: widget.select_speed(0.5),
                                            'aria-checked': settings.default_playback_speed === 0.5 ? 'true' : undefined
                                        },
                                        ['div', {class: 'ytp-menuitem-label'}, '0.5']
                                    ],
                                    ['div', {
                                            class: 'ytp-menuitem',
                                            role: 'menuitemradio',
                                            onclick: widget.select_speed(1),
                                            'aria-checked': settings.default_playback_speed === 1 ? 'true' : undefined
                                        },
                                        ['div', {class: 'ytp-menuitem-label'}, 'Normal']
                                    ],
                                    ['div', {
                                            class: 'ytp-menuitem',
                                            role: 'menuitemradio',
                                            onclick: widget.select_speed(1.25),
                                            'aria-checked': settings.default_playback_speed === 1.25 ? 'true' : undefined
                                        },
                                        ['div', {class: 'ytp-menuitem-label'}, '1.25']
                                    ],
                                    ['div', {
                                            class: 'ytp-menuitem',
                                            role: 'menuitemradio',
                                            onclick: widget.select_speed(1.5),
                                            'aria-checked': settings.default_playback_speed === 1.5 ? 'true' : undefined
                                        },
                                        ['div', {class: 'ytp-menuitem-label'}, '1.5']
                                    ],
                                    ['div', {
                                            class: 'ytp-menuitem',
                                            role: 'menuitemradio',
                                            onclick: widget.select_speed(2),
                                            'aria-checked': settings.default_playback_speed === 2 ? 'true' : undefined
                                        },
                                        ['div', {class: 'ytp-menuitem-label'}, '2']
                                    ]
                                ]
                            ]
                        ]
                    ]
                );
            }
        },

        start: function () {
            if (widget.show && settings.enable_playback_speed) {
                // change speed of video to default speed
                widget.change_playback_speed(settings.default_playback_speed || 1);

                if (util.$('#heartbeat_default_playback_speed')) return;

                // insert UI control
                util.$wait('#movie_player', function (err, ele) {
                    if (err || !ele) return;

                    var ytp_chrome_control = util.$('.ytp-chrome-controls', ele)[0],
                        control_count = ytp_chrome_control.childElementCount,
                        total_width = 12-20;

                    for (var i = 1; i < control_count; i++) {
                        total_width += ytp_chrome_control.childNodes[i].clientWidth;
                    }

                    widget.playback_popup.style.right = total_width + 'px';

                    ele.appendChild(widget.playback_popup);
                    ytp_chrome_control.appendChild(widget.playback_control);
                })


            }
        },

        stop: function () {
            // reset playback speed of video to 1
            widget.change_playback_speed(1);

            // remove UI control
            widget.playback_control.remove();
            widget.playback_popup.remove();
        },

        open_playback_popup: function (e) {
            var display = widget.playback_popup.style.display;

            widget.playback_popup.style.display = display === 'block' ? 'none' : 'block';
        },

        select_speed: function (speed) {
            return function (e) {
                // save to settings
                settings.set('default_playback_speed', speed);

                // change on UI
                util.$('#hb_yt_playback_popup .ytp-menuitem[aria-checked=true]')[0].removeAttribute('aria-checked');
                e.currentTarget.setAttribute('aria-checked', 'true');

                // change video playback speed
                widget.change_playback_speed(speed);

                // close popup
                widget.open_playback_popup();
            };
        },

        change_playback_speed: function (speed) {
            util.$wait('video', function (err, eles) {
                if (err || !eles.length) return;

                eles[0].playbackRate = speed;
            });
        },

        settings_changed: function (change) {
            if (change.enable_playback_speed && widget.show) {
                if (settings.enable_playback_speed) {
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
