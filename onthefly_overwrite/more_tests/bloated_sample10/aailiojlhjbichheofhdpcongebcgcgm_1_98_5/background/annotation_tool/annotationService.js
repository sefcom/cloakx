/*globals util, data, chrome*/

var annotationService = (function () {
    var videobar_button = '<annotation id="annotation_" type="highlight">' +
                '<segment>' +
                    '<movingRegion type="rect">' +
                        '<rectRegion x="0.00000" y="0.00000" w="11.05400" h="12.56300" t="0:00.000"/>' +
                        '<rectRegion x="0.00000" y="0.00000" w="11.05400" h="12.56300" t="3:00.000"/>' +
                    '</movingRegion>' +
                '</segment>' +
                '<appearance bgColor="0" highlightWidth="0" borderAlpha="0.0"/>' +
                '<action type="openUrl" trigger="click">' +
                    '<url target="current" value="linkhere"/>' +
                '</action>' +
            '</annotation>',
        videobar_button_text = '<annotation id="annotation_" type="text" style="highlightText">' +
                '<TEXT>text here</TEXT>' +
                '<segment spaceRelative="annotation_">' +
                    '<movingRegion type="rect">' +
                        '<rectRegion x="11.93500" y="7.54900" w="3.89900" h="6.87300" t="never"/>' +
                        '<rectRegion x="11.93500" y="7.54900" w="3.89900" h="6.87300" t="never"/>' +
                    '</movingRegion>' +
                '</segment>' +
                '<appearance bgAlpha="0" textSize="3.911599999999999" highlightFontColor="15921906"/>' +
                '<trigger>' +
                    '<condition ref="annotation_" state="rollOver"/>' +
                '</trigger>' +
            '</annotation>',

        // order is important!
        // it should follow the order of buttons in the videobar image
        videobar_button_templates = [
            'videobar_skip_ahead',
            'videobar_skip1',
            'videobar_skip2',
            'videobar_skip3',
            'videobar_star',
            'videobar_playnow',
            'videobar_music',
            'videobar_next',
            'videobar_hide'
        ],

        get_region_nodes = function (node) {
            var segment_node = node.getElementsByTagName('segment')[0],
                moving_region_nodes = segment_node.getElementsByTagName('movingRegion')[0],
                moving_region_type = moving_region_nodes.attributes.type.value;

            if (moving_region_type === 'anchoredRect') {
                moving_region_type = 'anchored';
            }

            return moving_region_nodes.getElementsByTagName(moving_region_type + 'Region');
        },

        get_annotation_duration = function (annotation) {
            var region_nodes = get_region_nodes(annotation),
                start_time = util.hms_to_seconds(region_nodes[0].attributes.t.value),
                stop_time = util.hms_to_seconds(region_nodes[1].attributes.t.value);

            return {
                start_time: start_time,
                stop_time: stop_time,
                duration_time: stop_time - start_time
            };
        },

        set_annotation_duration = function (node, duration) {
            var region_nodes = get_region_nodes(node);

            region_nodes[0].setAttribute('t', util.seconds_to_hms(duration.start_time));
            region_nodes[1].setAttribute('t', util.seconds_to_hms(duration.stop_time));

            return node;
        },

        set_xml_header = function (xml, data) {
            var request_header_elem = xml.createElement('requestHeader'),
                authentication_header_elem = xml.createElement('authenticationHeader');

            request_header_elem.setAttribute('video_id', data.video_id);
            xml.documentElement.appendChild(request_header_elem);

            authentication_header_elem.setAttribute('auth_token', data.token);
            authentication_header_elem.setAttribute('video_id', data.video_id);
            xml.documentElement.appendChild(authentication_header_elem);
        },

        get_document_for_update = function (xml, data, prefix) {
            if (typeof xml !== 'string') {
                xml = (new XMLSerializer()).serializeToString(xml);
            }

            xml = xml.replace(/<annotations/g, '<updatedItems');
            xml = xml.replace(/<\/annotations>/g, '</updatedItems>');

            xml = (new DOMParser()).parseFromString(xml, 'application/xml');
            _(xml.getElementsByTagName('updatedItems')[0].childNodes)
                .forEach(function (node) {
                    if (node.nodeName === 'annotation') {
                        if (!~node.getAttribute('id').indexOf('freedom')) {
                            node.setAttribute('id', prefix + node.getAttribute('id'));
                        }

                        if (!node.attributes.author) {
                            node.setAttribute('author', '');
                        }
                    }
                })
                .commit();

            set_xml_header(xml, data);

            return xml;
        },

        get_document_for_delete = function (xml, data) {
            var deleted_xml = text_to_xml('<document><deletedItems></deletedItems></document>');

            if (typeof xml === 'string') {
                xml = text_to_xml(xml);
            }

            _(xml.getElementsByTagName('annotations')[0].childNodes)
                .forEach(function (node) {
                    if (node && node.nodeName === 'annotation') {
                        var deleted_node,
                            id = node.getAttribute('id'),
                            author = node.getAttribute('author') || '';

                        // ignore nodes that are not to be deleted
                        if (!data.delete_all && !~node.getAttribute('id').indexOf('freedom')) {
                            return;
                        }

                        deleted_node = text_to_xml('<deletedItem id="' + id + 
                            '" author="' + author  + '" />').firstChild;

                        deleted_xml.getElementsByTagName('deletedItems')[0].appendChild(deleted_node);
                    }
                })
                .commit();

            set_xml_header(deleted_xml, data);

            return deleted_xml;
        },

        fix_time = function (xml, source_duration, destination_duration) {
            var scale = 1.0 * destination_duration / source_duration,
                updated_items = xml.getElementsByTagName('updatedItems')[0].childNodes;

            _(updated_items)
                .forEach(function (updated_item) {
                    var scaled_duration = {},
                        annotation_duration;

                    if (updated_item.nodeName == 'annotation' &&
                        (updated_item.attributes.type.value === 'highlight' ||
                            (updated_item.attributes.type.value === 'text' &&
                                updated_item.attributes.style.value !== 'highlightText'))) {

                        annotation_duration = get_annotation_duration(updated_item);
                        scaled_duration.start_time = scale * annotation_duration.start_time;
                        scaled_duration.stop_time = scale * annotation_duration.stop_time;

                        set_annotation_duration(updated_item, scaled_duration);
                    }
                })
                .commit();
        },

        post_xml = function (xml, mode, video, callback) {
            var url = mode === 'publish' 
                    ? 'https://www.youtube.com/annotations_auth/publish2'
                    : 'https://www.youtube.com/annotations_auth/update2';

            if (typeof xml !== 'string') {
                xml = (new XMLSerializer()).serializeToString(xml);
            }

            $.ajax({
                type: 'POST',
                url: url,
                data: xml,
                headers: {
                    'content-type': '*/*',
                    video: video.id,
                    mode: mode,
                    identifier: video.id
                },
                xhrFields: {
                    withCredentials: true
                }
            }).done(function (data) {
                callback(null, data);
            }).fail(function (jqXHR, err) {
                callback(err);
            });
        },

        format_duration = function (s) {
            var duration = s.replace(/PT/g, '').replace(/M|H/g, ':');

            if (~s.indexOf('S')) {
                duration = duration.replace(/S/g, '.00');
            }
            else {
                duration = duration + '00';
            }

            return duration;
        },

        format_video_item = function (video) {
            video.duration = format_duration(video.contentDetails.duration);
            video.date = new Date(video.snippet.publishedAt.replace(/T/g, ' '));
        },

        format_video_items = function (videos) {
            _(videos)
                .forEach(format_video_item)
                .commit();
        },

        apply_metadata = function (xml_text, metadata) {
            var channel_id_regex = /value="https:\/\/www\.youtube\.com\/channel\/[A-Za-z0-9]*"/g,
                channel_link = 'value="https://www.youtube.com/channel/' + metadata.channel_id + '"',

                user_id_regex = /value="https:\/\/plus\.google\.com\/u\/0\/[A-Za-z0-9]*"/g,
                user_link = 'value="https://plus.google.com/u/0/' + metadata.google_plus_user_id + '"';

            xml_text = xml_text.replace(channel_id_regex, channel_link);
            xml_text = xml_text.replace(user_id_regex, user_link);

            return xml_text;
        },

        publish_changes = function (video, token, callback) {
            var xml = '<document>' +
                '<requestHeader video_id="' + video.id + '"/>' +
                '<authenticationHeader video_id="' + video.id +
                '" auth_token="' + token + '"/>' +
                '</document>';

            post_xml(xml, 'publish', video.id, callback);
        },

        is_defined_button = function (button) {
            return ~videobar_button_templates.indexOf(button.name);
        },

        text_to_xml = function (xml_text) {
            return (new DOMParser()).parseFromString(xml_text, 'application/xml');
        },

        get_videobar_button_url = function (button) {
            var url = button.url;

            if (!url) {
                return '';
            }

            if (button.skip_to) {
                url += '#t=' + util.seconds_to_hms(button.skip_to, true);
            }

            return url;
        },

        get_text_width = function (text, font) {
            var width = 0,
                letters = {
                    '1': 1.3265,
                    '2': 1.3265,
                    '3': 1.3265,
                    '4': 1.3265,
                    '5': 1.3265,
                    '6': 1.3265,
                    '7': 1.3265,
                    '8': 1.3265,
                    '9': 1.3265,
                    'A': 1.4849,
                    'a': 1.3249,
                    'B': 1.4834,
                    'b': 1.3249,
                    'C': 1.6419,
                    'c': 1.1665,
                    'D': 1.6419,
                    'd': 1.3249,
                    'E': 1.4834,
                    'e': 1.3249,
                    'F': 1.4834,
                    'f': 0.691,
                    'G': 1.8004,
                    'g': 1.3249,
                    'H': 1.4834,
                    'h': 1.3408,
                    'I': 0.5325,
                    'i': 0.5325,
                    'J': 1.008,
                    'j': 0.5325,
                    'K': 1.4993,
                    'k': 1.1665,
                    'L': 1.3249,
                    'l': 0.5325,
                    'M': 1.8004,
                    'm': 1.8004,
                    'N': 1.4834,
                    'n': 1.3249,
                    'O': 1.8004,
                    'o': 1.3249,
                    'P': 1.4834,
                    'p': 1.3249,
                    'Q': 1.8003,
                    'q': 1.3407,
                    'R': 1.6735,
                    'r': 0.8494,
                    'S': 1.4992,
                    's': 1.1823,
                    'T': 1.4834,
                    't': 0.691,
                    'U': 1.4834,
                    'u': 1.3249,
                    'V': 1.4834,
                    'v': 1.1664,
                    'W': 2.1236,
                    'w': 1.4897,
                    'X': 1.3312,
                    'x': 1.0301,
                    'Y': 1.4897,
                    'y': 1.1727,
                    'Z': 1.3312,
                    'z': 1.0143,
                    '\'': 0.5388,
                    '-': 0.8558,
                    ':': 0.6973,
                    '(': 0.8558,
                    ')': 0.8558,
                    '!': 0.8558,
                    ' ': 0.6487,
                };

            _(text)
                .forEach(function (c) {
                    width += letters[c] ? letters[c] : 0.7;
                })
                .commit();

            return {
                w: width + 0.5,
                h: 6.87300
            };
        },

        calculate_text_rect = function (button) {
            var size = get_text_width(button.text),
                max = 100,
                x, y;

            if (button.x + size.w > max) {
                x = -size.w;
                y = button.h / 2 - (size.h / 2);
            }
            else if (button.x - size.w < 0) {
                x = button.w + 1;
                y = button.h / 2 - (size.h / 2);
            }
            else {
                x = button.w / 2 - (size.w / 2);
                y = button.h;
            }

            return {
                x: x,
                y: y,
                w: size.w,
                h: size.h
            };
        },

        set_button_rect = function (node, rect) {
            _(get_region_nodes(node))
                .forEach(function (node) {
                    node.setAttribute('x', rect.x);
                    node.setAttribute('y', rect.y);
                    node.setAttribute('w', rect.w);
                    node.setAttribute('h', rect.h);
                })
                .commit();
        },

        publish_video_changes = function (video, token, callback) {
            publish_changes(video, token, function (err) {
                if (err) {
                    return callback && callback(err);
                }

                callback && callback(null, { success: true });
            });
        };

    return {
        load_annotation: function (video_id, callback) {
            var url = 'https://www.youtube.com/annotations_invideo?' +
                util.stringify({
                    features: 1,
                    legacy: 1,
                    video_id: video_id
                });

            $.ajax({
                url: url,
                contentType: 'application/data'
            }).done(function (xml) {
                var xml_text = (new XMLSerializer()).serializeToString(xml),
                    has_annotation;

                // remove card info
                xml_text = xml_text.replace(/<annotation [^>]*?id="channel:[\S\s]*?<\/annotation>/g,
                    '');
                xml_text = xml_text.replace(/<annotation [^>]*?id="video:[\S\s]*?<\/annotation>/g,
                    '');
                xml = text_to_xml(xml_text);

                // clean up data
                _(xml.getElementsByTagName('annotation'))
                    .forEach(function (annotation) {
                        annotation.removeAttribute('log_data');
                    })
                    .commit();

                has_annotation = xml.getElementsByTagName('annotation').length > 0;

                callback(data ? null : 'Unknown error', 
                    has_annotation ? (new XMLSerializer()).serializeToString(xml) : null);
            }).fail(function (jqXHR, err) {
                callback(err);
            });
        },

        get_auth_token: function (uploaded_video_id, callback) {
            var extract_auth_token = function (source) {
                    var from = source.indexOf('"auth_token":'),
                        to = source.substring(from).indexOf(','),
                        auth_token = source.substring(from, to + from)
                            .replace(/"/g, '')
                            .split(':');

                    if (auth_token.length && auth_token[0] === 'auth_token') {
                        return auth_token[1];
                    }

                    return null;
                },

                listen_for_token = function (request) {
                    var token = null;

                    if (request.action === 'get_source') {
                        token = extract_auth_token(request.source);
                        chrome.extension.onMessage.removeListener(listen_for_token);

                        callback(token ? null : 'token not found', token);
                    }
                };

            // open a tab to edit annotation page to get the authentication token
            chrome.tabs.create({
                url: 'https://www.youtube.com/my_videos_annotate?v=' + uploaded_video_id,
                active: false
            }, function (tab) {
                chrome.extension.onMessage.addListener(listen_for_token);

                chrome.tabs.executeScript(
                    tab.id, {
                        file: 'popup/annotation_tool/getPageSource.js'
                    },
                    function () {
                        chrome.tabs.remove(tab.id);
                    }
                );
            });
        },

        copy_annotation: function (token, src_video, video, metadata, callback) {
            var start = function () {
                    format_video_items([src_video, video]);
                    copy_video_annotation(src_video.annotations);
                },

                copy_video_annotation = function (xml_text) {
                    var xml;

                    if (metadata) {
                        xml_text = apply_metadata(xml_text, metadata);
                    }

                    xml = get_document_for_update(xml_text, {
                        'video_id': video.id,
                        'token': token
                    }, 'freedom_');

                    fix_time(xml,
                        util.hms_to_seconds(src_video.duration),
                        util.hms_to_seconds(video.duration));

                    post_xml(xml, 'update', video, function (err) {
                        if (err) {
                            return callback(err);
                        }

                        publish_video_changes(video, token, callback);
                    });
                };

            start();
        },

        delete_annotation: function (token, video, delete_all, callback) {
            var that = this,

                start = function () {
                    that.load_annotation(video.id, function (err, result) {
                        if (err) {
                            return callback(err);
                        }

                        if (!result) {
                            // nothing to delete
                            return callback(null, { success: true });
                        }

                        delete_video_annotation(video, result);
                    });
                },

                delete_video_annotation = function (video, annotations) {
                    var xml = get_document_for_delete(annotations, {
                        video_id: video.id,
                        token: token,
                        delete_all: delete_all
                    });

                    post_xml(xml, 'delete', video, function (err) {
                        if (err) {
                            return callback(err);
                        }

                        publish_video_changes(video, token, callback);
                    });
                };

            start();
        },

        make_videobar: function (token, video, template, callback) {
            var xml = text_to_xml('<document><annotations></annotations></document>'),
                buttons = [],
                video_duration,

                start = function () {
                    format_video_item(video);

                    build_template_buttons();

                    set_buttons_attributes();

                    render_document();

                    send_for_update();
                },

                build_template_buttons = function () {
                    video_duration = util.hms_to_seconds(video.duration);

                    // get template buttons
                    _(videobar_button_templates)
                        .forEach(function (val, key) {
                            var url = template[val] && template[val].url ? template[val].url : '',
                                skip_to;

                            if (val === 'videobar_skip1' ||
                                val === 'videobar_skip2' ||
                                val === 'videobar_skip3' ||
                                val === 'videobar_skip_ahead') {
                                url = 'http://www.youtube.com/watch?v=' + video.id
                            }

                            if (val === 'videobar_skip_ahead' &&
                                template[val] &&
                                template[val].buttons &&
                                template[val].buttons.length > 0) {

                                _(template[val].buttons)
                                    .forEach(function (button, index) {
                                        var button_id = val;

                                        if (index > 0) {
                                            button_id += '_' + index;
                                        }

                                        skip_to = button.skip_to ?
                                            util.hms_to_seconds(button.skip_to) : undefined;

                                        if (!skip_to || skip_to > video_duration) {
                                            return;
                                        }

                                        buttons.push({
                                            name: button_id,
                                            id: button_id,
                                            text: button.text,
                                            skip_to: skip_to,
                                            url: url
                                        });
                                    })
                                    .commit();

                                return;
                            }

                            if (template[val]) {
                                skip_to = template[val].skip_to ?
                                    Math.min(util.hms_to_seconds(template[val].skip_to), video_duration) :
                                    undefined;

                                buttons.push({
                                    name: val,
                                    id: val,
                                    skip_to: skip_to,
                                    url: url,
                                    text: template[val].text
                                });
                            }
                        })
                        .commit();
                },

                set_buttons_attributes = function () {
                    var len,
                        button_width = 10.95700,
                        button_height,
                        button_y = 0,
                        button_t = 0;

                    // calculate duration, size and position
                    len = _(buttons).sum(function (button) {
                        return is_defined_button(button) ? 1 : 0;
                    });
                    button_height = 100 / len;

                    _(buttons)
                        .forEach(function (button) {
                            button.x = 0;
                            button.w = button_width;
                            button.h = button_height - 0.5;

                            if (is_defined_button(button)) {
                                button.start_time = 0;
                                button.stop_time = video_duration;
                                button.y = button_y;

                                button_y += button_height;
                            }

                            if (~button.name.indexOf('videobar_skip_ahead')) {
                                button.start_time = button_t;
                                button.stop_time = button.skip_to;
                                button.y = 0;

                                button_t = button.stop_time;
                            }
                        })
                        .commit();
                },

                render_document = function () {
                    var xml_annotations = xml.getElementsByTagName('annotations')[0],
                        prefix = 'freedom_annotation_';

                    _(buttons)
                        .forEach(function (button) {
                            var annotation_button = text_to_xml(videobar_button).firstChild,
                                annotation_text = text_to_xml(videobar_button_text).firstChild;

                            annotation_button.setAttribute('id', prefix + button.id);
                            annotation_button.getElementsByTagName('url')[0].setAttribute(
                                'value', get_videobar_button_url(button));

                            annotation_text.setAttribute('id', prefix + button.id + '_text');
                            annotation_text.getElementsByTagName('TEXT')[0].textContent = button.text;
                            annotation_text.getElementsByTagName('segment')[0].setAttribute(
                                'spaceRelative', annotation_button.getAttribute('id'));
                            annotation_text.getElementsByTagName('condition')[0].setAttribute(
                                'ref', annotation_button.getAttribute('id'));

                            set_annotation_duration(annotation_button, {
                                start_time: button.start_time,
                                stop_time: button.stop_time
                            });

                            set_button_rect(annotation_button, button);
                            set_button_rect(annotation_text, calculate_text_rect(button));

                            xml_annotations.appendChild(annotation_button);
                            xml_annotations.appendChild(annotation_text);
                        })
                        .commit();
                },

                send_for_update = function () {
                    xml = get_document_for_update(xml, {
                        'video_id': video.id,
                        'token': token
                    }, '');

                    post_xml(xml, 'update', video, function (err) {
                        if (err) {
                            return callback(err);
                        }

                        publish_video_changes(video, token, callback);
                    });
                };

            start();
        }
    };
})();

