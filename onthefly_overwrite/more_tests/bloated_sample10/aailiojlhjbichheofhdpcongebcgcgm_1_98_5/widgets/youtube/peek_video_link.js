(function () {
    'use strict';

    var widget = {

        name: 'Peek video link',
        image_index: 1,

        start: function () {
            if (!settings.peek_video_link) {
                this.stop();
                return;
            }

            document.addEventListener('mousemove', this.on_show);
        },

        stop: function () {
            document.removeEventListener('mousemove', this.on_show);
            this.stop_animate();
        },

        get_video_link: function (a) {
            var url = a.getAttribute('href');

            return a.tagName === 'A' &&
                url &&
                ~url.indexOf('/watch?v=') &&
                util.parse_qs(url).v;
        },

        on_show: function (evt) {
            var that = this;

            clearTimeout(this.verify_timer);
            this.verify_timer = setTimeout(function () {
                that.verify_showing(evt.target);
            }, 100);
        },

        verify_showing: function (a) {
            var video_id,
                count = 5;

            if (a.tagName !== 'IMG') {
                this.stop_animate();
                return;
            }

            do {
                video_id = this.get_video_link(a);
                if (video_id) {
                    break;
                }

                a = a.parentElement;
                count -= 1;
            } while (a && !video_id && count > 0);

            if (!video_id || !a) {
                this.stop_animate();
                return;
            }

            this.start_animatie(a);
        },

        start_animatie: function (target) {

            if (!target) return;

            var that = this,
                now = new Date(),
                current_date = [now.getDate(), now.getMonth(), now.getFullYear()].join(''),
                tracking_data = localStorage.getItem('peek_video_count') ||
                                {
                                    event: 'thumbnail_preview',
                                    date: current_date,
                                    count: 0
                                };

            if (_.isString(tracking_data)) {
                try { tracking_data = JSON.parse(tracking_data); } catch (e) {}
            }

            if (!tracking_data.date === current_date) {

                // send data to Google Analytics
                chrome.runtime.sendMessage({
                    message: 'log_analytics',
                    data: {
                        hitType: 'event',
                        eventAction: 'hover',
                        eventCategory: tracking_data.event,
                        eventValue: tracking_data.count,
                        dimension0: data.email
                    }
                });

                // change to new date
                tracking_data.date = current_date;
                // reset count
                tracking_data.count = 0;
            }

            // count+1
            tracking_data.count++;
            // save back to local storage
            localStorage.setItem('peek_video_count', JSON.stringify(tracking_data));

            // do animation
            this.target = target;
            clearInterval(this.peek_image_interval);
            this.image_index = 0;
            this.peek_image_interval = setInterval(function () {
                that.on_change_image();
            }, 800);
        },

        stop_animate: function () {
            var img = this.target ? util.$('img', this.target)[0] : null;

            clearInterval(this.peek_image_interval);
            if (img && img.org_src) {
                img.src = img.org_src;
            }
        },

        settings_changed: function(change) {
            if (change.peek_video_link) {
                this.start();
            }
        },

        on_change_image: function (evt) {
            var video_id = util.parse_qs(this.target.getAttribute('href')).v,
                img = util.$('img', this.target)[0];

            if (evt) {
                evt.stopPropagation();
            }

            if (!img) {
                return;
            }

            if (!img.org_src) {
                img.org_src = img.src;
            }

            this.image_index += 1;
            if (this.image_index > 3) {
                this.image_index = 1;
            }

            img.src = '//img.youtube.com/vi/' + video_id + '/' + this.image_index + '.jpg';
        }
    };

    widgets.push(widget);
}());
