(function () {
    'use strict';

    var widget = {

        name: 'Subscription Status',
        container: '#freedom_sub_status',

        initialize: function () {
            this.containerClass = '.channel-header-subscription-button-container';
        },

        generate_box: function (subscribers) {
            var e = util.$(this.containerClass)[0],
                taunt = null,
                display = settings.subscribed_to_me ? 'display:block;' : 'display:none;';

            if (!subscribers) {
                taunt = util.locale('subscription_status_na');
            }
            else if (subscribers.length > 0) {
                taunt = util.locale('subscribed_to_you');
            }
            else {
                taunt = util.locale('subscribed_to_you_not');
            }

            e.style.textAlign = 'right';

            return jsonToDOM(['div', {
                class: 'freedom_subscribed_to_me',
                style: 'font-size: smaller; position: relative; top: 7px; bottom: 5px;' +
                    display
            }, taunt]);
        },

        start: function () {
            var i = setInterval(function () {
                if (util.$(this.containerClass).length) {
                    clearInterval(i);
                    this.render();
                }
            }.bind(this), 1000);
        },

        render: function () {
            var channel_link = util.$('.guide-my-channel-icon')[0];

            channel_link = channel_link.parentElement
                        && channel_link.parentElement.parentElement;
                                   
            var my_channel_id = channel_link && channel_link.attributes['data-external-id'].value;

            if (window.data.channel_id && my_channel_id) {
                util.api('get_subscriptions')({
                        channel_id: window.data.channel_id,
                        my_channel_id: my_channel_id.trim()
                    })
                    .get(function (err, result) {
                        var e;

                        if (err) {
                            result = null;
                        }

                        e = util.$('.freedom_subscribed_to_me');

                        e.forEach(function (k) {
                            k.remove();
                        });

                        this.box = this.generate_box(result);

                        util.$(this.containerClass)[0].appendChild(this.box);
                    }.bind(this));
            }
        },

        settings_changed: function (change) {
            if (change.subscribed_to_me) {
                this.box.style.display = settings.subscribed_to_me ? 'block' : 'none';
            }
        }
    };

    widgets.push(widget);

})();
