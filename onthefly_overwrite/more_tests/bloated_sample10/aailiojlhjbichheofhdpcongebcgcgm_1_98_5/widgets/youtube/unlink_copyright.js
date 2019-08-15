/*
    Unlink copyright widget
*/

(function () {
    'use strict';

    var widget = {

        name: 'Unlink copyright',
        checkboxes: [],

        initialize: function () {
            if (location.pathname !== '/my_channels_copyright_strikes' &&
                location.pathname !== '/my_channels_monetization_suspended') {
                return;
            }

            this.checkbox = jsonToDOM(
                ['span', {class: 'yt-uix-form-input-checkbox-container'},
                    ['input', {
                            type: 'checkbox',
                            class: 'yt-uix-form-input-checkbox mc-channel-checkbox'
                        }
                    ],
                    ['span', {class: 'yt-uix-form-input-checkbox-element'}]
                ]
            );

            this.check_all = jsonToDOM(
                ['span', {class: 'yt-uix-form-input-checkbox-container'},
                    ['input', {
                            type: 'checkbox',
                            class: 'yt-uix-form-input-checkbox mc-all-channels-checkbox',
                            onclick: this.add_checked_class
                        }
                    ],
                    ['span', {class: 'yt-uix-form-input-checkbox-element'}]
                ]
            );

            this.unlink_button = jsonToDOM(
                ['button', {
                        id: 'heartbeat_export_channels_button',
                        class: 'yt-uix-button yt-uix-button-size-default' +
                            ' yt-uix-button-default mc-require-n-selected mc-bulk-action'
                    },
                    'Unlink channel'
                ]
            );

            this.unlink_button
                .addEventListener('click', this.unlink_selected);
        },

        start: function () {
            var containers,
                self = this;

            if (location.pathname !== '/my_channels_copyright_strikes' &&
                location.pathname !== '/my_channels_monetization_suspended') {
                return;
            }

            containers = util.$('.mc-bulk-select-checkbox');

            containers.forEach(function (a) {
                var clone = self.checkbox.cloneNode(true);
                clone.setAttribute('data-id', 'UC' + a.parentElement.parentElement.id.slice(11));
                a.appendChild(clone);
                self.checkboxes.push(clone);
            });

            util.$('.mc-select-all')[0].appendChild(this.check_all);
            util.$('.mc-actions')[0].appendChild(this.unlink_button);
        },

        add_checked_class: function () {
            this.checkboxes.forEach(function (a) {
                a.classList.add('checked');
            });
        },

        unlink_selected: function () {
            if (!confirm('Are you sure?')) {
                return;
            }

            this.checkboxes
                .filter(function (a) {
                    return a.classList.contains('checked');
                })
                .map(function (a) {
                    return a.getAttribute('data-id');
                })
                .forEach(this.unlink_channel);

            location.reload();
        },

        unlink_channel: function (channel) {
            var xhr = new XMLHttpRequest(),
                data = 'si=0&so=tcld&session_token=' + document.getElementsByName('session_token')[0].value +
                '&o=' + location.href.substr(location.href.indexOf('?') + 3) + '&channels=' + channel.substring(
                    2) + '&sq=' + channel;

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    console.log('done');
                }
            };

            xhr.open('POST', 'https://www.youtube.com/my_channels_ajax?action_remove=1', false);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(data);
        }
    };

    widgets.push(widget);

})();
