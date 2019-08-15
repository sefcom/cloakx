(function () {
    'use strict';

    var widget = {

        name : 'Auto insert heartbeat tags',

        initialize: function () {
            if (!(location.pathname === '/upload' || location.pathname === '/edit')) return;
        },

        start: function () {
            if (!(location.pathname === '/upload' || location.pathname === '/edit')) return;

            util.$wait('#active-uploads-contain [ng-non-bindable]', function (err, elems) {
                if (err || elems[0].$('.auto_insert_hbtags').length) return;

                widget.checked = (settings.auto_insert_tags !== undefined) ? settings.auto_insert_tags : true;

                elems[0].append_child(
                    ['div', {class: 'auto_insert_hbtags_wrapper'},
                        ['input', {
                                class: 'auto_insert_hbtags',
                                type: 'checkbox',
                                onchange: widget.check_change,
                                checked: !widget.checked ? undefined : true
                            }
                        ],
                        util.locale('auto_insert_hbtags')
                    ]
                );

                widget.bind_save_event();
            });
        },

        save_changes_handler: function () {
            var tags = '',
                tags_el = util.$('.yt-chip'),
                video_id = location.search.split('=')[2],
                save_data = {
                    video_id: video_id,
                    email: data.email
                };

            if (!widget.checked || !video_id || !tags_el) return;

            save_data.tag_name = _(tags_el)
                                    .map(function (e) { return e.getAttribute('title'); })
                                    .value()
                                    .join(',');

            util.api('video_tags')
                .post(save_data, _.noop);
        },

        bind_save_event: function () {
            var btn_save_changes = util.$('.save-changes-button');

            //save changes when user click save changes button on edit page or publish button on upload page
            _(btn_save_changes)
                .forEach(function (elem) {
                    elem.addEventListener('click', widget.save_changes_handler);
                })
                .commit();

            if (location.pathname === '/upload') {
                var tag_input = util.$('.video-settings-add-tag')[0],
                    progress_bar = util.$('.progress-bar-uploading')[0],
                    //save changes when upload video completed
                    interval = setInterval(function () {
                        if (progress_bar.getAttribute('aria-valuenow') === '100') {
                            widget.save_changes_handler();
                            clearInterval(interval);
                        }
                    }, 500);

                //save changes when user enter in tab input to save a new tab
                tag_input.addEventListener('keydown', function (e) {
                    if (e.keyCode === 13 && progress_bar.getAttribute('aria-valuenow') === '100') {
                        widget.save_changes_handler();
                    }
                });
            }
        },

        check_change: function (e) {
            widget.checked = e.target.checked;
            settings.set('auto_insert_tags', widget.checked);
        },

        integrity: function () {
            var basic_info_first_collumn = util.$('#active-uploads-contain [ng-non-bindable]');

            return util.$('.auto_insert_hbtags', basic_info_first_collumn[0]).length;
        }
    };

    widgets.push(widget);

})();
