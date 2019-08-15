(function () {
    'use strict';

    var widget = {

        name : 'Auto-repeat',
        state : {enabled : false},
        state_observed : false,
        container : '#heartbeat_autorepeat_button',

        initialize : function () {
            // Reset state to default values on every initialization.
            this.state.enabled = false;

            this.autorepeat_button = this.autorepeat_button || jsonToDOM(
                ['button', {
                        id : this.container.slice(1),
                        class : 'yt-uix-tooltip',
                        type : 'button',
                        'data-tooltip-text' : util.locale('autorepeat_video'),
                        onclick : this.click_action
                    },
                    ['span', {class : 'yt-uix-button-content'},
                        ['i', {class : 'fa fa-retweet'}]
                    ]
                ]
            );
        },

        get_label_text : function () {
            return util.locale('autorepeat_' + (this.state.enabled ? 'on' : 'off'));
        },

        click_action : function () {
            this.state.enabled = !this.state.enabled;
            this.notify_page();
            this.update_ui(this.state);
        },

        notify_page : function () {
            window.postMessage({
                type : 'hb-autorepeat',
                value : this.state.enabled
            }, '*');
        },

        start : function () {
            this.show = location.pathname === '/watch';
            if (!this.show) {
                return;
            }

            this.render();
        },

        integrity : function () {
            return util.$(this.container);
        },

        render : function () {
            var cont = util.$('.ytp-chrome-controls')[0];

            if (!cont || !settings.autorepeat) {
                return;
            }

            cont.appendChild(this.autorepeat_button);
        },

        update_ui : function (state) {
            var button = this.autorepeat_button,
                label = button.querySelector('.hb-autorepeat-label');

            if (label) {
                label.textContent = this.get_label_text();
            }

            button.style.opacity = state.enabled ? 1 : 0.5;
        },

        settings_changed : function (change) {
            if (change.autorepeat) {
                this.state.enabled = false;
                this.notify_page();
                util.toggle(this.container.slice(1), settings.autorepeat);
            }
        }

    };

    widgets.push(widget);

})();
