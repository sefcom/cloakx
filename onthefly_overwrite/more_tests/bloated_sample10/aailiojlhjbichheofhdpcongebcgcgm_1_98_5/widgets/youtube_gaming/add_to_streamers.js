(function () {

    'use strict';

    var widget = {

        name: 'Heartbeat streamer',
        interval: 5 * 60 * 1000, // 5 minutes

        initialize: function () {},

        start: function () {
            if (!this.check_live_status_interval) {
                this.check_live_status();
            }

            clearInterval(this.check_live_status_interval);
            this.check_live_status_interval = setInterval(function () {
                widget.check_live_status();
            }, this.interval);
        },

        check_live_status: function () {
            this.video_id = util.parse_qs().v;

            if (!this.video_id) {
                return;
            }

            util.api('video_details')
                ({
                    part: 'id,snippet,statistics,liveStreamingDetails',
                    video_id: this.video_id
                })
                .get(this.update_live_status);
        },

        parse_profile_img: function () {
            var a = _.last(util.$('.shelf ytg-thumbnail[avatar] #image.ytg-thumbnail'));

            if (!a) {
                return '';
            }

            return a.style.backgroundImage.replace('url(', '').replace(')', '');
        },

        parse_playing_game: function () {
            var a = _.last(util.$('.byline a'));

            if (!a) {
                return '';
            }

            return a.innerText.trim();
        },

        update_live_status: function (err, result) {
            var data;

            if (err || !result || !result.length || !result[0].liveStreamingDetails ||
                !result[0].liveStreamingDetails.concurrentViewers) {
                return;
            }

            result = result[0];
            data = {
                platform: 'youtube',
                url: window.location.toString(),
                username: result.snippet.channelId,
                status: result.snippet.title,
                created_at: result.liveStreamingDetails.actualStartTime || null,
                playing_game: this.parse_playing_game(),
                current_viewers: +result.liveStreamingDetails.concurrentViewers,
                display_name: result.snippet.channelTitle,
                profile_image: this.parse_profile_img(),
                stream_preview: result.snippet.thumbnails.medium.url,
                lang: result.snippet.defaultAudioLanguage ? _.first(result.snippet.defaultAudioLanguage.split('-')) : ''
            };

            util.api('streamer')
                .post(data, _.noop);
        },

        integrity: function () {
            return this.video_id === util.parse_qs().v;
        }
    };

    widgets.push(widget);
})();
