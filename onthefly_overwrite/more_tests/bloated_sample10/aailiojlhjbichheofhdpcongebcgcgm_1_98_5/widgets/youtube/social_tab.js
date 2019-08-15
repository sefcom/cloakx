(function () {
    'use strict';

    var widget = {
        name: 'Social tab',
        twitter_user: null,
        facebook_user: null,
        height: 0,

        initialize: function () {
            this.social_tab = jsonToDOM(['div', {id: 'hb_youtube_social_tab', class: 'paper-tabs'},
                ['ul', {id: 'social_tab_menu'},
                    ['li', {
                        id: 'facebook_tab',
                        onclick: this.load_facebook_page
                    }, 'Facebook'],
                    ['li', {
                        id: 'twitter_tab',
                        onclick: this.load_twitter_timeline
                    }, 'Twitter']
                ]
            ]);

            this.social_tab_content = jsonToDOM(['div', {id: 'social_tab_content'},
                ['div', {
                    class: 'social_tab_content_box',
                    id: 'facebook_content'
                }],
                ['div', {
                    class: 'social_tab_content_box',
                    id: 'twitter_content'
                }]
            ]);
        },

        start: function () {
            
            if (settings.hb_youtube_social_tab && ~window.location.href.indexOf('gaming.youtube.com')) {
                this.render();
            }
 
        },

        render: function () {
            var that = this,
                tab;

            util.$wait('#tabs', function (err, ele) {
                if (!err && ele) {
                    ele.appendChild(that.social_tab);
                    ele.add_class('tabs_fix');

                    util.$('#tabsContainer').add_class('tabs_container_fix');
                    tab = util.$('.ytg-watch-sidebar-0')[0];
                    that.social_tab_content.style.height = tab.offsetHeight + 'px';
                    
                    if (tab) {
                        tab.appendChild(that.social_tab_content);
                    }

                    that.find_social_links();
                    that.add_listener();
                }
            });
        },

        find_social_links: function () {
            var owner = util.$('#owner'),
                channel_id = owner.parentNode.getAttribute('href').split('/')[2],
                that = this,
                inside,
                i;

            if (channel_id) {
                var youtube_iframe = jsonToDOM(['iframe', {
                    id: 'freedom_youtube_iframe',
                    src: 'https://www.youtube.com/channel/' + channel_id,
                }]);
                
                this.social_tab_content.appendChild(youtube_iframe);

                i = setInterval(function () {
                    inside = that.iframeRef(document.getElementById('freedom_youtube_iframe'));

                    if (inside && inside.readyState === 'interactive') {
                        clearInterval(i);
                        that.get_user();  
                    }
                }, 300);
            }    
        },
       
        load_twitter_timeline: function () {
            var twitter_iframe = util.$('#freedom_twitter_timeline_iframe'),
                facebook_iframe = util.$('#freedom_facebook_timeline_iframe'),
                width = this.social_tab_content.offsetWidth - 60,
                height = this.social_tab_content.offsetHeight - 20,
                screen_name = this.twitter_user || 'youtube',
                url = config.server_ip_add + '/twitch/twitter_timeline?',
                facebook_tab = util.$('#facebook_tab'),
                twitter_tab = util.$('#twitter_tab');
 
            url += 'screen_name=' + screen_name +
                '&width=' + width + '&height=' + height;

            if (!twitter_iframe) {
                twitter_iframe = jsonToDOM(['iframe', {
                    id: 'freedom_twitter_timeline_iframe',
                    src: url
                }]);

                util.$('#twitter_content').appendChild(twitter_iframe);
            }
            else {
                twitter_iframe.remove_class('hide');
            }

            if (facebook_iframe) {
                facebook_iframe.add_class('hide');
            }

            if (facebook_tab && twitter_tab) {
                twitter_tab.add_class('tab_active');
                facebook_tab.remove_class('tab_active');
                this.social_tab_content.style.display = 'block';
            }
        },

        load_facebook_page: function () {
            var facebook_iframe = util.$('#freedom_facebook_timeline_iframe'),
                twitter_iframe = util.$('#freedom_twitter_timeline_iframe'),
                facebook_conent = util.$('#facebook_content'),
                facebook_tab = util.$('#facebook_tab'),
                twitter_tab = util.$('#twitter_tab');
            
            if (!this.facebook_user) {
                this.facebook_user = 'youtube';
            }

            if (!facebook_iframe) {
                facebook_iframe = jsonToDOM(['iframe', {
                    id: 'freedom_facebook_timeline_iframe',
                    src: config.assets_url + 'social/index.html?screenname=' + this.facebook_user + '&width=500&height=620'
                }]);

                if (facebook_conent) {
                    facebook_conent.appendChild(facebook_iframe);
                }
            }
            else {
                facebook_iframe.remove_class('hide');
            }

            if (twitter_iframe) {
                twitter_iframe.add_class('hide');     
            }

            if (facebook_tab && twitter_tab) {
                facebook_tab.add_class('tab_active');
                twitter_tab.remove_class('tab_active');
                this.social_tab_content.style.display = 'block';
            }
        },

        settings_changed: function (change) {

            if (change.hb_youtube_social_tab) {
                if (!settings.hb_youtube_social_tab) {
                    this.remove();
                }
                else {
                    this.start();
                }
            }   
        },

        remove: function () {
            this.social_tab.remove();
            this.social_tab_content.remove();
            util.$('#tabs').remove_class('tabs_fix');
            util.$('#tabsContainer').remove_class('tabs_container_fix');
        },

        parse_social_name: function (link) {
            return link.split('/').pop();
        },

        iframeRef: function (frameRef) {
            return frameRef.contentWindow
                ? frameRef.contentWindow.document
                : frameRef.contentDocument
        },

        get_user: function () {
            var inside = this.iframeRef(document.getElementById('freedom_youtube_iframe')),
                links = util.$('.about-channel-link', inside),
                that = this,
                href;

            _(links)
                .forEach(function (link){
                    href = link.getAttribute('href');

                    if (~href.indexOf('twitter')) {
                        that.twitter_user = that.parse_social_name(href);
                    }

                    if (~href.indexOf('facebook')) {
                        that.facebook_user = that.parse_social_name(href);
                    }
                })
                .commit();

            util.$('#freedom_youtube_iframe').remove();
        },

        add_listener: function () {
            var menu  = util.$('#tabsContent'),
                that = this;

            if (menu) {
                menu.addEventListener('click', function (evt) {
                    that.social_tab_content.style.display = 'none';
                });
            }
        }
    };

    widgets.push(widget);
})();

