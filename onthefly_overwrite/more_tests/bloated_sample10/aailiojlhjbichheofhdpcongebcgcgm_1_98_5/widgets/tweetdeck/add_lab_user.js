/*admin only*/

(function () {

    'use strict';

    var widget = {
        initialize: function () {
            session.on_ready(function () {
                if (!session.has_role('admin')) return;
                this.get_sents();
                setInterval(this.waiting, 5000);

                util.$wait('.js-send-button-container', function (err, elems) {
                    if (err || util.$('.insert_login_link').length) return;

                    elems[0].insertBefore(jsonToDOM(['a', {
                            class: 'insert_login_link position-rel add_to_lab',
                            onclick: this.insert_login_link,
                            title: 'Invite to Heartbeat Lab'
                        },
                        ['i', {class: 'icon icon-message'}]
                    ]), elems[0].firstChild);
                }.bind(this));
            }.bind(this));
        },

        waiting: function () {
            util.$wait('article.stream-item:not(.freedom)', function (err, elems) {
                if (err) return;

                elems.forEach(this.update_item);
            }.bind(this));
        },

        update_item: function (elem) {
            var ul = util.$('.tweet-actions', elem)[0],
                username = util.$('.username', elem)[0],
                following = util.$('.icon-follow', elem).length,
                that = this,
                on_add_user_to_lab = function () {
                    that.send_invitation(username, function (err) {
                        if (err) return alert('Can only invite heartbeat users or twitter users who following you.');
                        elem.add_class('invited');
                    });
                }

            elem.add_class('freedom');
            username =  username && username.textContent.replace('@', '').toLowerCase();

            if (!ul || !username || (!this.heartbeat_lab_invitations[username] && !following)) return;

            if (username && this.heartbeat_lab_invitations[username].in_lab) {
                elem.add_class('invited');
            }

            ul.insertBefore(jsonToDOM(['li', {class: 'tweet-action-item'},
                ['a', {
                        class: 'tweet-action position-rel add_to_lab',
                        onclick: on_add_user_to_lab,
                        title: elem.has_class('invited') ? 'Joined Heartbeat Lab' : 'Invite to Heartbeat Lab'
                    },
                    ['i', {class: 'icon icon-message'}],
                    ['i', {class: 'icon icon-favorite'}]
                ]
            ]), ul.firstChild);
        },

        get_sents: function () {
            util.api('get_twitters_in_lab')
                .get(
                    {'ACCESS-TOKEN': session.access_token}, 
                    null,
                    function (err, result) {
                        var tmp = {};

                        _.forEach(result, function (item) {
                            tmp[item.channel_id.toLowerCase()] = item;
                        });

                        this.heartbeat_lab_invitations = tmp;
                        this.hightlight_sents();
                    }.bind(this)
                );
        },

        hightlight_sents: function () {
            var heartbeat_lab_invitations = this.heartbeat_lab_invitations;

            _(util.$('article.stream-item:not(.invited)'))
                .forEach(function (elem) {
                    var username = util.$('.username', elem)[0];

                    username = username && username.textContent.replace('@', '').toLowerCase();
                    if (username && heartbeat_lab_invitations[username] && heartbeat_lab_invitations[username].in_lab) {
                        elem.add_class('sent');
                    }
                })
                .commit();
        },

        send_invitation: function (username, callback) {
            util.api('twitter')('invite_to_lab')
                .post(
                    {'ACCESS-TOKEN': session.access_token}, 
                    {username: username}, 
                    function (err, result) {
                        if (err || !result.success) return callback && callback(err || 'fail to invite users');
                        
                        this.heartbeat_lab_invitations[username] = 1;
                    }.bind(this)
                );
        },

        insert_login_link: function () {
            var txt = util.$('.js-compose-scroller .js-compose-text')[0];

            if (!txt) return;

            txt.value += 'https://www.heartbeat.tm/login.html#join_lab';
        }
    };

    widgets.push(widget);
})();
