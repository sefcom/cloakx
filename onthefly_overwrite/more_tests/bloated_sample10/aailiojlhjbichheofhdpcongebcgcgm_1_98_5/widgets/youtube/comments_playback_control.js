(function () {
    'use strict';

    var widget = {

        name : 'Comments control',
        container : '#heartbeat_comments_notice_container',

        scroll_listened : false,
        active : false,
        enabled : true,

        set_enabled : function (enabled) {
            this.enabled = !!enabled;
            this.update_ui();
        },

        set_active : function (active) {
            this.active = !!active;
            this.update_ui();
        },

        is_playlist : function () {
            return /[\?&]list=/.test(location.search);
        },

        // move to util
        scrolled_past_comments : function () {
            var comments_el = util.$('#watch-discussion');

            if (!comments_el || !this.is_playlist()) {
                return false;
            }

            return document.body.scrollTop > +comments_el.getBoundingClientRect().top;
        },

        set_default_state : function () {
            this.active = false;
            this.enabled = true;
        },

        initialize : function () {
            this.comments_notice = this.comments_notice || jsonToDOM(['div', {
                id: this.container.slice(1),
                style: 'display:none'
            },
                ['div', {id: 'heartbeat_comments_notice'},
                    ['span', util.locale('comments_playback_paused')],
                    ['a', {
                            href: '#',
                            onclick: this.resume_click_action,
                            style: 'display:none'
                        },
                        util.locale('comments_playback_resume')
                    ]
                ]
            ]);
        },

        resume_click_action : function () {
            window.scrollTo(0, 0);
        },

        notify_page : function () {
            window.postMessage({
                type : 'hb-prevent-next',
                value : this.active
            }, '*');
        },

        start : function () {
            this.show = location.pathname === '/watch' && this.is_playlist();
            if (!this.show) {
                return;
            }

            this.set_default_state();
            this.render();
        },

        render : function () {
            var masthead = util.$('#masthead-positioner'),
                notice = this.comments_notice,
                masthead_height,
                notice_height;

            document.body.appendChild(notice);

            if (masthead) {
                masthead_height = parseInt(getComputedStyle(masthead).height, 10);
                notice_height = parseInt(getComputedStyle(notice).height, 10);
                if (masthead_height && notice_height) {
                    notice.style.top = '' + Math.floor(masthead_height - notice_height / 2) + 'px';
                }
            }

            this.set_scroll_listener_enabled(this.enabled);
        },

        state_changed : function (changes) {
            changes.forEach(function (change) {
                switch (change.name) {
                    case 'enabled' :
                        this.set_scroll_listener_enabled(change.object.enabled);
                        break;
                    case 'active' :
                        this.notify_page();
                        break;
                }
            }.bind(this));

            this.update_ui();
        },

        update_ui : function () {
            this.comments_notice.style.display = this.active ? 'block' : 'none';
        },

        set_scroll_listener_enabled : function (enabled) {
            if (enabled && !this.scroll_listened) {
                window.addEventListener('scroll', this.page_did_scroll.bind(this), false);
                this.scroll_listened = true;
            }
        },

        page_did_scroll : function () {
            var is_active = this.active,
                scrolled_past_comments;

            if (!this.enabled) {
                return;
            }

            scrolled_past_comments = this.scrolled_past_comments();

            if ((scrolled_past_comments && !is_active) ||
                (!scrolled_past_comments && is_active)) {
                this.set_active(!is_active);
                this.notify_page();
            }
        },

        integrity : function () {
            return util.$(this.container);
        },

        settings_changed : function (change) {
            var enabled;

            if (change.comments_playback_control) {
                enabled = settings.comments_playback_control;
                this.set_enabled(enabled);
                if (!enabled) {
                    this.set_active(enabled);
                }

                this.notify_page();
            }
        }

    };

    widgets.push(widget);
})();
