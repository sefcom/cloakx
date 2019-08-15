/*
    Unlink export widget
*/

(function () {
    'use strict';

    var widget = {

        name: 'Unlink export',

        initialize: function () {
            if (location.pathname !== '/my_channels_unlink') {
                return;
            }

            this.export_button = jsonToDOM([
                    'button', {
                        id: 'heartbeat_export_channels_button',
                        class: 'yt-uix-button yt-uix-button-size-default yt-uix-button-default'
                    },
                    'Export all channels'
                ]);

            this.export_button
                .addEventListener('click', this.download_csv);
        },

        download_csv: function () {
            var a = document.createElement('a');

            a.setAttribute('download', 'unlink-requests-' + moment().format('YYYY-MM-DD') + '.csv');
            a.type = 'text/csv';
            a.target = '_blank';
            a.onclick = function () {
                this.parentNode.removeChild(this);
            };

            a.href = encodeURI('data:text/csv;charset=utf-8,' +
                'Channel ID,Chanel link,Title,Link date,Pending unlink days,Views,Subscribers,Videos\n' +
                Array.prototype.map.apply(util.$('#mc-channel-list-ol').children, [function (_a) {
                    var props = _a.querySelectorAll('.mc-channel-metric-value'),
                        dates = _a.querySelectorAll('.mc-channel-date');
                    return [
                        _a.querySelector('.video-thumb').getAttribute('data-ytid'),
                        _a.querySelector('.ux-thumb-wrap').href,
                        _a.querySelector('.mc-channel-title-content').innerText.replace(
                            /,/g, ''),
                        dates[0].innerText.slice(7).replace(/,/g, ''),
                        dates[1].innerText.slice(18),
                        props[0].innerText.replace(/,/g, ''), +props[1].innerText.replace(
                            /,/g, ''),
                        props[2].innerText.replace(/,/g, '')
                    ];
                }])
                .sort(function (_a, b) {
                    return b[6] - _a[6];
                })
                .map(function (_a) {
                    return _a.join();
                })
                .join('\n'));

            document.getElementsByTagName('body')[0].appendChild(a);
            a.click();
        },

        start: function () {
            if (location.pathname !== '/my_channels_unlink') {
                return;
            }

            util.$('.mc-actions')[0].appendChild(this.export_button);
        }
    };

    widgets.push(widget);

})();
