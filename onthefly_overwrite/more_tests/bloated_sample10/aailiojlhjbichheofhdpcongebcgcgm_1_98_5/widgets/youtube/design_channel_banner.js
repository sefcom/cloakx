/*
    Design channel banner
*/

(function () {
    'use strict';

    var widget = {

        name: 'Design channel banner',
        GRD_MAX_VALUE: 200,
        ZOOM_SCALE: 3,
        CANVAS_WIDTH: 2560,
        CANVAS_HEIGHT: 1440,
        FONTS: ['Architects Daughter', 'Arial', 'Arimo', 'Calligraffitti', 'Cantarell', 'Courier New', 'Dancing Script', 'Helvetica', 'Inconsolata', 'Lato', 'Lobster', 'Lora', 'Lucida Console', 'Marmelad', 'Nothing You Could Do', 'Oswald', 'Pacifico', 'Play', 'Playfair Display', 'PT Sans', 'PT Sans Narrow', 'Reenie Beanie', 'Roboto', 'Satisfy', 'Sigmar One', 'Tahoma', 'Times New Roman', 'Titillium Web', 'Trebuchet MS', 'Yanone Kaffeesatz'],

        elements: [],

        initialize: function () {
            var css, font_family;

            if (this.edit_channel_li) {
                return;
            }

            font_family = _(this.FONTS)
                .map(function (font) {
                    return font.replace(/\s/, '+');
                })
                .join('|');
            css = jsonToDOM(['link', {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css?family=' + font_family,
                id: 'hb_design_fonts'
            }]);
            (document.head || document.body || document.documentElement).appendChild(css);

            this.edit_channel_li = jsonToDOM(['li', {
                    id: 'freedom_design_banner_li',
                    role: 'menuitem',
                    onclick: this.open_popup
                },
                ['span', {class: 'heartbeat_branding_icon'}],
                ['span', {class: 'yt-uix-button-menu-item'}, 'Design banner']
            ]);

            this.branding_icon = jsonToDOM(['span', {
                class: 'heartbeat_branding_icon',
                id: 'freedom_design_banner_branding_icon'
            }]);

            this.edit_channel_popup = jsonToDOM(['div', {
                    id: 'freedom_design_banner_popup',
                    class: 'freedom_hid freedom_popup'
                },
                ['div', {
                        class: 'freedom_popup_content',
                        onclick: function (evt) {evt.stopPropagation();}
                    },
                    ['div', {id: 'freedom_banner_canvas_container'},
                        ['canvas', {
                            id: 'freedom_banner_canvas',
                            width: this.CANVAS_WIDTH,
                            height: this.CANVAS_HEIGHT
                        }]
                    ],
                    ['div', {
                            id: 'freedom_color_tool',
                            class: 'banner_tool freedom_hid freedom_noselect'
                        },
                        ['div', {class: 'padding_10'},
                            ['div', {id: 'freedom_color_tool_content'},
                                ['p', {class: 'design_form_field_section'}, util.locale('design_upload_background_image')],
                                ['form', {id: 'freedom_banner_bg_image_form'},
                                    ['input', {
                                        id: 'freedom_banner_bg_image_file',
                                        type: 'file',
                                        accept: '.png,.jpg,.jpeg',
                                        data_field: 'image_data',
                                        onchange: this.on_bg_image_change
                                    }],
                                ],
                                ['p', {class: 'design_form_field_section'}, util.locale('design_background_color')],
                                ['div', {id: 'freedom_color_bg_div'},
                                    ['input', {
                                        id: 'freedom_solid_color',
                                        type: 'color',
                                        onchange: this.on_bg_color_change
                                    }],
                                    ['p', {class: 'design_form_field_section'}, 'Gradient background'],
                                    ['div', {id: 'freedom_preview_canvas_wrap'},
                                        ['canvas', {
                                            width: this.GRD_MAX_VALUE,
                                            height: 20,
                                            id: 'freedom_preview_canvas',
                                        }]
                                    ],
                                    ['p', {class: 'design_form_field_section'}, util.locale('rotate')],
                                    ['input', {
                                        type: 'range',
                                        id: 'freedom_color_rotate',
                                        max: 360,
                                        min: 0,
                                        onchange: this.on_color_rotate_change
                                    }]
                                ],
                                ['p', {class: 'design_form_field_section'},
                                    ['button', {
                                            class: 'yt-uix-button yt-uix-button-default',
                                            onclick: this.on_clear_bg
                                        },
                                        util.locale('clear')
                                    ]
                                ]
                            ]
                        ]
                    ],
                    ['div', {
                            id: 'freedom_text_tool',
                            class: 'banner_tool freedom_hid freedom_noselect'
                        },
                        ['div', {class: 'padding_10'},
                            ['div',
                                ['p', {class: 'design_form_field_section'}, util.locale('banner_content')],
                                ['input', {
                                    type: 'text',
                                    id: 'freedom_banner_text_content',
                                    data_field: 'text',
                                    onchange: this.on_text_attr_change
                                }],
                                ['p', {class: 'design_form_field_section'}, util.locale('font')],
                                ['select', {
                                        id: 'freedom_font_select',
                                        data_field: 'font_name',
                                        onchange: this.on_text_attr_change
                                    },
                                    _.map(this.FONTS, function (font) {
                                        return ['option', {value: font, style: 'font-family: ' + font}, font]
                                    })
                                ],
                                ['p', {class: 'design_form_field_section'}, util.locale('font_size')],
                                ['input', {
                                    type: 'range',
                                    id: 'freedom_font_size',
                                    max: 400,
                                    min: 50,
                                    data_field: 'font_size',
                                    onchange: this.on_text_attr_change
                                }],
                                ['p', {class: 'design_form_field_section'}, util.locale('color')],
                                ['input', {
                                    id: 'freedom_text_color',
                                    type: 'color',
                                    data_field: 'text_color',
                                    onchange: this.on_text_attr_change
                                }],
                                ['p', {class: 'design_form_field_section'}, {class: 'margin_top_10'}],
                                ['button', {
                                        id: 'freedom_banner_add_text',
                                        class: 'yt-uix-button yt-uix-button-default',
                                        onclick: this.on_add_new_text
                                    },
                                    ['i', {class: 'fa fa-plus'}],
                                    ['span', util.locale('add_text')]
                                ]
                            ]
                        ]
                    ],
                    ['div', {
                            id: 'freedom_image_tool',
                            class: 'banner_tool freedom_hid freedom_noselect'
                        },
                        ['div', {class: 'padding_10'},
                            ['div',
                                ['p', {class: 'design_form_field_section'}, util.locale('design_select_image')],
                                ['input', {
                                    id: 'freedom_banner_image_file',
                                    type: 'file',
                                    accept: '.png,.jpg,.jpeg',
                                    data_field: 'image_data',
                                    onchange: this.on_image_attr_change
                                }],
                                ['p', {class: 'design_form_field_section'}, util.locale('icons')],
                                ['div', {id: 'freedom_predefined_icons'},
                                    ['div', {
                                        class: 'icon_wrapper',
                                        icon_src: config.assets_url + 'flare_orange.png',
                                        style: 'background-image: url(' + config.assets_url + 'flare_orange.png' + ')'
                                    }],
                                    ['div', {
                                        class: 'icon_wrapper',
                                        icon_src: config.assets_url + 'flare_blue.png',
                                        style: 'background-image: url(' + config.assets_url + 'flare_blue.png' + ')'
                                    }],
                                    ['div', {
                                        class: 'icon_wrapper',
                                        icon_src: config.assets_url + 'flare_green.png',
                                        style: 'background-image: url(' + config.assets_url + 'flare_green.png' + ')'
                                    }],
                                    ['div', {
                                        class: 'icon_wrapper',
                                        icon_src: config.assets_url + 'flare_white.png',
                                        style: 'background-image: url(' + config.assets_url + 'flare_white.png' + ')'
                                    }],
                                    ['div', {
                                        class: 'icon_wrapper',
                                        icon_src: config.assets_url + 'sun.png',
                                        style: 'background-image: url(' + config.assets_url + 'sun.png' + ')'
                                    }]
                                ],
                                ['img', {
                                    id: 'freedom_banner_image_preview',
                                    crossOrigin: 'anonymous',
                                    class: 'freedom_banner_image_preview'
                                }],
                                ['p', {class: 'design_form_field_section'}, util.locale('design_image_size')],
                                ['input', {
                                    type: 'range',
                                    id: 'freedom_image_size',
                                    max: 1000,
                                    min: 0,
                                    value: 20,
                                    data_field: 'image_size',
                                    onchange: this.on_image_attr_change
                                }],
                                ['p', {class: 'design_form_field_section'}, {class: 'margin_top_10'}],
                                ['button', {
                                        id: 'freedom_banner_add_image',
                                        disabled: 'disabled',
                                        class: 'yt-uix-button yt-uix-button-default',
                                        onclick: this.on_add_new_image
                                    },
                                    ['i', {class: 'fa fa-plus'}],
                                    ['span', util.locale('design_image_add')]
                                ]
                            ]
                        ]
                    ],
                    ['div', {id: 'freedom_banner_toolbox'},
                        ['button', {
                                class: 'yt-uix-button yt-uix-button-default has_toolbox',
                                tool_id: 'freedom_color_tool',
                                onclick: this.show_tool,
                                title: util.locale('background')
                            },
                            ['i', {class: 'fa fa-magic'}]
                        ],
                        ['button', {
                                class: 'yt-uix-button yt-uix-button-default has_toolbox',
                                tool_id: 'freedom_text_tool',
                                onclick: this.show_tool,
                                title: util.locale('text')
                            }, 'T'
                        ],
                        ['button', {
                                class: 'yt-uix-button yt-uix-button-default has_toolbox',
                                tool_id: 'freedom_image_tool',
                                onclick: this.show_tool,
                                title: util.locale('image')
                            },
                            ['i', {class: 'fa fa-picture-o'}]
                        ],
                        ['button', {
                                id: 'freedom_banner_crop_image',
                                class: 'yt-uix-button yt-uix-button-default',
                                onclick: this.on_toggle_crop,
                                title: util.locale('toggle_crop')
                            },
                            ['i', {class: 'fa fa-crop'}]
                        ],
                        ['button', {
                                id: 'freedom_banner_remove_element',
                                disabled: 'disabled',
                                class: 'yt-uix-button yt-uix-button-default',
                                onclick: this.on_remove_element,
                                title: util.locale('remove')
                            },
                            ['i', {class: 'fa fa-trash'}]
                        ],
                        ['button', {
                                id: 'freedom_set_channel_banner',
                                class: 'yt-uix-button yt-uix-button-default',
                                onclick: this.save_channel_banner,
                                title: util.locale('save')
                            },
                            ['i', {class: 'fa fa-floppy-o'}],
                        ],
                        ['button', {
                                id: 'freedom_close_popup',
                                class: 'yt-uix-button yt-uix-button-default',
                                onclick: this.close_popup,
                                title: util.locale('close')
                            },
                            ['i', {class: 'fa fa-power-off'}]
                        ]
                    ]
                ]
            ]);
        },

        start: function () {
            if (!this.is_in_own_channel()) {
                this.remove();
                return;
            }

            this.add_gradient_handler({color: '#000000', left: 0});
            this.add_gradient_handler({color: '#eeeeee', left: this.GRD_MAX_VALUE});
            this.register_events();

            this.render();
            this.render_gradient(util.$('#freedom_preview_canvas'));
            util.$('#freedom_banner_text_content', this.edit_channel_popup).value =
                util.$('.branded-page-header-title-link')[0].innerText;
            util.$('#freedom_text_color', this.edit_channel_popup).value = '#ff0000';
        },

        remove: function () {
            this.edit_channel_li.remove();
            this.branding_icon.remove();
            this.edit_channel_popup.remove();
        },

        render: function () {
            var menu_button = util.$('.c4-module-editor-actions')[0],
                ul = util.$('#c4-branding-dropdown-menu'),
                page = util.$('#page-container');

            if (!menu_button || !ul || !page) {
                return;
            }

            menu_button.appendChild(this.branding_icon);
            ul.appendChild(this.edit_channel_li);
            page.appendChild(this.edit_channel_popup);
        },

        integrity: function () {
            return this.is_in_own_channel() &&
                util.$('#freedom_design_banner_li') &&
                util.$('#freedom_design_banner_branding_icon');
        },

        is_in_own_channel: function () {
            return (~location.pathname.indexOf('/channel') || ~location.pathname.indexOf('/user')) &&
                data.channel_id === data.own_channel_id;
        },

        close_popup: function () {
            var popup_wrapper = util.$('#freedom_design_banner_popup');

            if (!popup_wrapper) {
                return;
            }

            popup_wrapper.add_class('freedom_hid');
        },

        open_popup: function (evt) {
            var popup_wrapper = util.$('#freedom_design_banner_popup'),
                popup = util.$('#freedom_design_banner_popup .freedom_popup_content')[0];

            evt.stopPropagation();

            if (!popup_wrapper) {
                return;
            }

            popup_wrapper.remove_class('freedom_hid');
            popup.style.left = (popup_wrapper.clientWidth -
                popup.clientWidth) / 2 + 'px';
            popup.style.top = (popup_wrapper.clientHeight -
                popup.clientHeight) / 2 + 'px';

            util.$('#c4-branding-dropdown-menu').style.display = 'none';
            this.on_image_change();
            this.on_toggle_crop();
        },

        close_tool: function (except) {
            _(util.$('.banner_tool'))
                .forEach(function (tool) {
                    if (tool !== except) {
                        tool.add_class('freedom_hid');
                    }
                })
                .commit();
        },

        show_tool: function (evt) {
            var button = util.bind_elem_functions(evt.currentTarget),
                tool_id = button.getAttribute('tool_id'),
                tool = util.$('#' + tool_id);

            evt.stopPropagation();

            if (!tool) {
                return;
            }

            this.close_tool(tool);
            tool.toggle_class('freedom_hid');

            button.toggle_class('active');
            _(util.$('#freedom_banner_toolbox button.has_toolbox'))
                .forEach(function (btn) {
                    if (btn === button) {
                        return;
                    }

                    btn.remove_class('active');
                })
                .commit();
        },

        show_tool_by_id: function (tool_id) {
            var tool = util.$('#' + tool_id);

            this.close_tool(tool);
            tool.remove_class('freedom_hid');

            _(util.$('#freedom_banner_toolbox button.has_toolbox'))
                .forEach(function (btn) {
                    if (btn.getAttribute('tool_id') === tool_id) {
                        btn.add_class('active');
                        return;
                    }

                    btn.remove_class('active');
                })
                .commit();
        },

        add_gradient_handler: function (option) {
            var color = (option && option.color) || '#000000',
                left = (parseInt((option && option.left) || '0') - 6) + 'px',
                handler = jsonToDOM(['div', {
                        class: 'color_handle',
                        ondblclick: this.on_show_color_picker,
                        style: 'background-color: ' + color + '; left: ' + left,
                        title: util.locale('double_click_to_change_color')
                    },
                    ['span', {class: 'border_color_handle_arrow'}],
                    ['span', {class: 'color_handle_arrow', style: 'border-bottom-color: ' + color}],
                    ['input', {
                        type: 'color',
                        value: color,
                        onchange: this.on_color_handler_change_color
                    }]
                ]);

            util.$('#freedom_preview_canvas_wrap', this.edit_channel_popup)
                .appendChild(handler);
        },

        get_closed_val: function (cur, min, max) {
            if (cur < min) {
                return min;
            }

            if (cur > max) {
                return max;
            }

            return cur;
        },

        on_element_keydown: function (evt) {
            if (evt.keyCode === 46 && evt.target.tagName === 'BODY') {
                this.on_remove_element();
            }
        },

        on_element_mousedown: function (evt) {
            var canvas = evt.target,
                pos = util.get_offset(canvas),
                scroll_top = util.$('body')[0].scrollTop;

            if (canvas.getAttribute('id') !== 'freedom_banner_canvas') {
                return;
            }

            this.dragging_element = this.find_selected_text_element(evt.clientX - pos.left, evt.clientY + scroll_top - pos.top);
            this.on_select_element(this.dragging_element);
            if (!this.dragging_element) {
                return;
            }

            this.dragging_element_x = evt.clientX;
            this.dragging_element_y = evt.clientY;
        },

        find_selected_text_element: function (x, y) {
            var that = this;

            return _(this.elements)
                .filter(function (elem) {
                    var m = that.get_element_metrics(elem);

                    if (x < elem.x || x > elem.x + m.width ||
                        y < elem.y || y > elem.y + m.height) {
                        return false;
                    }

                    return true;
                })
                .last();
        },

        on_element_mousemove: function (evt) {
            var dx, dy;

            if (!this.dragging_element) {
                return;
            }

            util.bind_elem_functions(this.edit_channel_popup).add_class('dragging');

            dx = evt.clientX - this.dragging_element_x;
            dy = evt.clientY - this.dragging_element_y;
            this.dragging_element_x = evt.clientX;
            this.dragging_element_y = evt.clientY;
            this.dragging_element.x += dx;
            this.dragging_element.y += dy;

            this.on_image_change();
        },

        on_element_mouseup: function () {
            this.dragging_element = null;
            util.bind_elem_functions(this.edit_channel_popup).remove_class('dragging');
        },

        on_color_handler_mousedown: function (evt) {
            var i = 0,
                temp = util.bind_elem_functions(evt.target);

            while (!temp.has_class('color_handle') && i < 3) {
                temp = util.bind_elem_functions(temp.parentElement);
                i += 1;
            }

            if (temp.has_class('color_handle')) {
                this.dragging_handler = temp;
                this.dragging_x = evt.clientX;
            }
        },

        on_color_handler_mousemove: function (evt) {
            var dx, left;

            if (!this.dragging_handler) {
                return;
            }

            left = parseInt(this.dragging_handler.style.left);
            dx = evt.clientX - this.dragging_x;
            this.dragging_x = evt.clientX;
            left = this.get_closed_val(left + dx, -6, 194);

            this.dragging_handler.style.left = left + 'px';
            this.use_gradient = true;

            evt.stopPropagation();
        },

        on_color_handler_mouseup: function () {
            if (!this.dragging_handler) {
                return;
            }

            this.bg_mode = 'gradient';
            this.on_image_change();
        },

        on_crop_handler_mousedown: function (evt) {
            if (evt.target.id !== 'freedom_banner_canvas' || this.dragging_element ||
                !this.cropping || !this.dragging_crop) {
                return;
            }

            this.is_dragging_crop = true;
            this.dragging_crop_x = evt.clientX;
            this.dragging_crop_y = evt.clientY;
            evt.stopPropagation();
        },

        on_crop_handler_mousemove: function (evt) {
            var dx, dy;

            if (this.dragging_element || this.dragging_handler ||
                !this.is_dragging_crop || !this.cropping || !this.dragging_crop) {
                return;
            }

            dx = evt.clientX - this.dragging_crop_x;
            dy = evt.clientY - this.dragging_crop_y;
            this.dragging_crop_x = evt.clientX;
            this.dragging_crop_y = evt.clientY;
            this.dragging_crop.x += dx * this.ZOOM_SCALE;
            this.dragging_crop.y += dy * this.ZOOM_SCALE;

            this.on_image_change();
            evt.stopPropagation();
            util.bind_elem_functions(this.edit_channel_popup).add_class('dragging');
        },

        on_crop_handler_mouseup: function () {
            this.is_dragging_crop = false;
            this.on_image_change();
            util.bind_elem_functions(this.edit_channel_popup).remove_class('dragging');
        },

        on_bg_image_change: function (evt) {
            var image = new Image(),
                that = this,
                file = evt.currentTarget.files.length ? evt.currentTarget.files[0] : null;

            this.bg_mode = 'image';

            if (!file) {
                this.bg_image = null;
                this.on_image_change();
                return;
            }

            image.onload = function() {
                that.bg_image = image;
                that.on_image_change();
            };

            this.read_file(file, function (e) {
                image.src = e.target.result;
            });
        },

        on_bg_color_change: function () {
            this.bg_mode = 'solid';
            this.on_image_change();
        },

        on_image_change: function () {
            var banner = util.$('#freedom_banner_canvas', this.edit_channel_popup);

            this.clear_bg(banner);

            if (this.bg_mode === 'image') {
                this.render_bg_image(banner);
            }
            else if (this.bg_mode === 'gradient') {
                this.render_gradient(banner);
            }
            else if (this.bg_mode === 'solid') {
                this.render_solid_color(banner);
            }

            if (this.cropping) {
                this.render_crop_handler(banner);
            }

            this.render_elements(banner);
            this.hight_light_selection(banner);
            this.dragging_handler = null;
        },

        on_show_color_picker: function (evt) {
            var elem = evt.currentTarget,
                input = util.$('input', elem)[0];

            input.click();
        },

        on_color_handler_change_color: function (evt) {
            var input = evt.currentTarget,
                elem = input.parentElement,
                arrow = util.$('.color_handle_arrow', elem)[0];

            elem.style.backgroundColor = input.value;
            arrow.style.borderBottomColor = input.value;

            this.on_color_rotate_change();
        },

        on_color_rotate_change: function () {
            this.bg_mode = 'gradient';
            this.render_gradient(util.$('#freedom_preview_canvas', this.design_thumbnail_popup));
            this.on_image_change();
        },

        register_events: function () {
            document.addEventListener('mousedown', this.on_element_mousedown);
            document.addEventListener('mousemove', this.on_element_mousemove);
            document.addEventListener('mouseup', this.on_element_mouseup);
            document.addEventListener('keydown', this.on_element_keydown);

            document.addEventListener('mousedown', this.on_color_handler_mousedown);
            document.addEventListener('mousemove', this.on_color_handler_mousemove);
            document.addEventListener('mouseup', this.on_color_handler_mouseup);

            document.addEventListener('mousedown', this.on_crop_handler_mousedown);
            document.addEventListener('mousemove', this.on_crop_handler_mousemove);
            document.addEventListener('mouseup', this.on_crop_handler_mouseup);

            util.$('#freedom_predefined_icons', this.edit_channel_popup)
                .addEventListener('click', this.on_predefined_img_click);
        },

        on_predefined_img_click: function (evt) {
            var icon = util.bind_elem_functions(evt.target),
                preview = util.$('#freedom_banner_image_preview', this.edit_channel_popup),
                selected = util.$('#freedom_predefined_icons .selected')[0],
                btn = util.$('#freedom_banner_add_image', this.edit_channel_popup),
                size =  util.$('#freedom_image_size', this.edit_channel_popup);

            if (!icon.has_class('icon_wrapper')) {
                return;
            }

            icon.add_class('selected');
            if (selected) {
                selected.remove_class('selected');
            }

            preview.crossOrigin = 'anonymous';
            preview.src = icon.getAttribute('icon_src');
            preview.style.display = 'block';
            size.value = 100;
            btn.removeAttribute('disabled');
        },

        on_clear_bg: function () {
            var canvas = util.$('#freedom_banner_canvas');

            this.clear_bg(canvas);
            this.bg_mode = '';
            this.bg_image = null;
            this.render_elements(canvas);
            this.hight_light_selection(canvas);

            util.$('#freedom_banner_bg_image_form', this.edit_channel_popup).reset();
        },

        clear_bg: function (canvas) {
            var ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },

        render_gradient: function (canvas) {
            if (!canvas) return;

            var handlers = util.$('#freedom_color_tool_content .color_handle', this.edit_channel_popup),
                angle = 180 - util.$('#freedom_color_rotate', this.edit_channel_popup).value,
                is_inverted = angle < 0,
                ctx = canvas.getContext('2d'),
                that = this,
                x1 = 0,
                y1 = 0,
                x2 = 0,
                y2 = 0,
                grd;

            angle = Math.abs(angle);

            if (angle <= 90) {
                 x1 = canvas.width / 2 + Math.tan(90 - angle) * canvas.height / 2;
                 x2 = canvas.width / 2 - Math.tan(90 - angle) * canvas.height / 2;
                 y2 = canvas.height;
            }
            else {
                y1 = canvas.height / 2 + Math.tan(180 - angle) * canvas.width / 2;
                y2 = canvas.height / 2 - Math.tan(180 - angle) * canvas.width / 2;
                x2 = canvas.width;
            }

            if (is_inverted) {
                x1 = canvas.width - x1;
                x2 = canvas.width - x2;
                y1 = canvas.height - y1;
                y2 = canvas.height - y2;
            }

            grd = ctx.createLinearGradient(x1, y1, x2, y2);

            _(handlers)
                .forEach(function (handler) {
                    var left = parseInt(handler.style.left) + 6,
                        color = util.$('input', handler)[0].value;

                    grd.addColorStop(1.0 * left  / that.GRD_MAX_VALUE, color);
                })
                .commit();

            ctx.save();
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        },

        render_solid_color: function (canvas) {
            var ctx = canvas.getContext('2d'),
                color = util.$('#freedom_solid_color').value;

            ctx.save();
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        },

        render_bg_image: function (canvas) {
            var ctx = canvas.getContext('2d');

            if (!this.bg_image) {
                return;
            }

            ctx.drawImage(
                this.bg_image,
                0,
                0,
                this.bg_image.naturalWidth,
                this.bg_image.naturalHeight
            );
        },

        render_elements: function (canvas) {
            var ctx = canvas.getContext('2d'),
                that = this;

            _(this.elements)
                .forEach(function (elem) {
                    if (elem.text) {
                        that.render_text(ctx, elem);
                        return;
                    }

                    if (elem.image_data) {
                        that.render_image(ctx, elem);
                    }
                })
                .commit();
        },

        render_text: function (ctx, elem) {
            var h = this.calculate_text_height(elem);

            ctx.save();
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = elem.text_color;
            ctx.font = elem.font_size + 'px ' + elem.font_name;
            ctx.fillText(elem.text, elem.x * this.ZOOM_SCALE, elem.y * this.ZOOM_SCALE + h / 2);
            ctx.restore();
        },

        render_image: function (ctx, elem) {
            var that = this;

            ctx.drawImage(
                elem.image_data,
                elem.x * that.ZOOM_SCALE,
                elem.y * that.ZOOM_SCALE,
                elem.width * that.ZOOM_SCALE,
                elem.height * that.ZOOM_SCALE);
        },

        render_crop_handler: function (canvas) {
            var ctx = canvas.getContext('2d'),
                w = this.dragging_crop.width,
                h = this.dragging_crop.height,
                h2 = 350,
                dh =  h / 2 - h2 / 2,
                x = this.dragging_crop.x,
                y = this.dragging_crop.y;

            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(x, y, w, dh);
            ctx.fillRect(x, y + dh + h2, w, dh);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.rect(x, y, w, h);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        },

        get_saved_canvas: function () {
            var src_canvas = util.$('#freedom_banner_canvas'),
                canvas = src_canvas,
                ctx;

            if (this.cropping) {
                canvas = document.createElement('canvas');
                canvas.width = this.dragging_crop.width;
                canvas.height = this.dragging_crop.height;

                ctx = canvas.getContext('2d');
                ctx.drawImage(
                    src_canvas,
                    this.dragging_crop.x,
                    this.dragging_crop.y,
                    this.dragging_crop.width,
                    this.dragging_crop.height,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );
            }

            return canvas;
        },

        get_image_data: function () {
            var scale = 1,
                canvas = this.get_saved_canvas(),
                base64_data,
                blob_data,
                arr = [],
                i = 0,
                file;

            base64_data = canvas.toDataURL('image/png', scale);
            blob_data = atob(base64_data.split(',')[1]);
            for (; i < blob_data.length; i++) {
                arr.push(blob_data.charCodeAt(i));
            }

            file = new Blob([new Uint8Array(arr)]);

            return file;
        },

        download_canvas: function (canvas, filename) {
            var lnk = this.download_lnk || document.createElement('a'),
                e;

            this.download_lnk = lnk;
            lnk.download = filename;
            lnk.href = canvas.toDataURL('image/png');

            if (document.createEvent) {
                e = document.createEvent('MouseEvents');
                e.initMouseEvent('click', true, true, window,
                    0, 0, 0, 0, 0, false, false, false,
                    false, 0, null);

                lnk.dispatchEvent(e);
            }
            else if (lnk.fireEvent) {
                lnk.fireEvent('onclick');
            }
        },

        save_channel_banner: function () {
            var cropping = this.cropping,
                that = this,
                data = {},
                analytics_event = 'font_name',
                local_data = JSON.parse(localStorage.getItem('track_' + analytics_event));

            //save google analytics font
            data.fonts = local_data ? local_data.fonts : [];
            data.fonts = data.fonts.concat(_.compact(_.pluck(this.elements, 'font_name')));
            util.log_count_per_day(analytics_event, data);

            // refresh
            this.enable_ui(false);
            this.selected_element = null;
            this.cropping = false;
            this.on_image_change();
            this.cropping = cropping;

            // move to next event loop, avoid accidental action trigged by users
            setTimeout(function () {
                that.download_canvas(that.get_saved_canvas(), 'banner.png');
                that.on_image_change();
                that.enable_ui(true);
            }, 0);
        },

        post_data: function (file) {
            var xhr = new XMLHttpRequest(),
                form_data = new FormData(),
                that = this;

            form_data.append('channel_bg_file', file);

            // can't upload with fermata
            xhr.open('POST', config.server_ip_add + '/set_banner?' + util.stringify({
                channel_id: data.channel_id,
                token_id: settings.public_token_id
            }));
            xhr.onload = function() {
                var result;

                that.enable_ui(true);

                if (xhr.status === 200 && xhr.readyState === 4) {
                    result = JSON.parse(xhr.responseText);
                    util.$('#c4-header-bg-container').style.backgroundImage = 'url(' + result.url + ')';

                    that.on_image_change();
                    that.close_popup();
                }
            };
            xhr.send(form_data);
        },

        enable_ui: function (enabled) {
            var block_ui = util.$('#freedom_banner_block_ui', this.save_a_moment_dom);

            if (enabled) {
                if (block_ui) {
                    block_ui.remove();
                }

                return;
            }

            if (block_ui) {
                return;
            }

            util.$('#freedom_design_banner_popup .freedom_popup_content', this.edit_channel_popup)[0]
                .appendChild(jsonToDOM(['div', {id: 'freedom_banner_block_ui'}]));
        },

        calculate_text_height: function (elem) {
            var div = jsonToDOM(['div', {
                    class: 'freedom_offscreen',
                    style: 'margin: 0; padding: 0; font: ' + elem.font_size + 'px ' + elem.font_name
                }, elem.text]),
                h = 0;

            util.$('body')[0].appendChild(div);
            h = div.offsetHeight;
            div.remove();

            return h;
        },

        get_element_metrics: function (elem) {
            var m;

            if (elem.text) {
                m = this.get_text_metrics(elem);

                return {
                    width: m.width / this.ZOOM_SCALE,
                    height: this.calculate_text_height(elem) / this.ZOOM_SCALE
                };
            }

            return {
                width: elem.width || 0,
                height: elem.height || 0
            };
        },

        get_text_metrics: function (elem) {
            var canvas = util.$('#freedom_banner_canvas'),
                ctx = canvas.getContext('2d'),
                m;

            ctx.save();
            ctx.fillStyle = elem.text_color;
            ctx.font = elem.font_size + 'px ' + elem.font_name;
            m = ctx.measureText(elem.text);
            ctx.restore();

            return {
                width: m.width,
                height: this.calculate_text_height(elem)
            };
        },

        add_new_text: function (text, x, y) {
            var elem = {
                    x: isNaN(x) ? 100 : x,
                    y: isNaN(y) ? 100 : y,
                    text: text || util.$('#freedom_banner_text_content', this.edit_channel_popup).value,
                    font_size: util.$('#freedom_font_size', this.edit_channel_popup).value,
                    text_color: util.$('#freedom_text_color', this.edit_channel_popup).value,
                    font_name: util.$('#freedom_font_select', this.edit_channel_popup).value
                };

            this.elements.push(elem);
            this.on_select_text_element(elem);
        },

        add_new_image: function (callback) {
            var img = util.$('#freedom_banner_image_preview', this.edit_channel_popup),
                size =  util.$('#freedom_image_size', this.edit_channel_popup).value,
                image = new Image(),
                that = this;

            image.crossOrigin = 'anonymous';
            image.src = img.src;
            image.onload = function() {
                var elem = {
                    x: 100,
                    y: 100,
                    width: size / 100 * image.naturalWidth,
                    height: size / 100 * image.naturalHeight,
                    natural_width: image.naturalWidth,
                    natural_height: image.naturalHeight,
                    image_size: size,
                    image_data: image
                };

                that.elements.push(elem);
                that.on_select_image_element(elem);
                callback && callback();
            };
        },

        on_add_new_text: function () {
            this.add_new_text();
            this.on_image_change();
        },

        on_add_new_image: function () {
            this.add_new_image(this.on_image_change);
        },

        on_remove_element: function () {
            var that = this;

            if (!this.selected_element) {
                return;
            }

            _.remove(this.elements, function (elem) {
                return elem === that.selected_element;
            });
            this.selected_element = null;
            this.on_image_change();
        },

        on_select_element: function (elem) {
            this.selected_element = elem;
            this.bring_to_front(elem);

            if (elem && elem.text) {
                this.on_select_text_element(elem);
                return this.on_image_change();
            }

            if (elem && elem.image_data) {
                this.on_select_image_element(elem);
                return this.on_image_change();
            }

            util.$('#freedom_banner_remove_element', this.edit_channel_popup).setAttribute('disabled', 'disabled');
            this.on_image_change();
        },

        on_select_text_element: function (elem) {
            util.$('#freedom_banner_text_content', this.edit_channel_popup).value = elem.text;
            util.$('#freedom_font_size', this.edit_channel_popup).value = elem.font_size;
            util.$('#freedom_text_color', this.edit_channel_popup).value = elem.text_color;
            util.$('#freedom_font_select', this.edit_channel_popup).value = elem.font_name;
            util.$('#freedom_banner_remove_element', this.edit_channel_popup).removeAttribute('disabled');
            this.show_tool_by_id('freedom_text_tool');
        },

        on_select_image_element: function (elem) {
            var img = util.$('#freedom_banner_image_preview', this.edit_channel_popup);

            img.src = elem.image_data.src;
            img.style.display = 'block';
            util.$('#freedom_image_size', this.edit_channel_popup).value = elem.image_size;
            util.$('#freedom_banner_remove_element', this.edit_channel_popup).removeAttribute('disabled');
            this.show_tool_by_id('freedom_image_tool');
        },

        on_text_attr_change: function (evt) {
            if (!this.selected_element || !this.selected_element.text) {
                return;
            }

            this.selected_element[evt.currentTarget.getAttribute('data_field')] = evt.currentTarget.value;
            this.on_image_change();
        },

        on_image_attr_change: function (evt) {
            var elem = evt.currentTarget,
                img = util.$('#freedom_banner_image_preview', this.edit_channel_popup),
                btn = util.$('#freedom_banner_add_image', this.edit_channel_popup);

            if (elem.id === 'freedom_banner_image_file') {
                if (elem.files.length) {
                    this.read_file(elem.files[0], function (e) {
                        img.src = e.target.result;
                        img.style.display = 'block';
                    });
                    btn.removeAttribute('disabled');
                }
                else {
                    img.style.display = 'none';
                    btn.setAttribute('disabled', 'disabled');
                }
            }

            if (!this.selected_element || !this.selected_element.image_data) {
                return;
            }

            if (elem.id === 'freedom_image_size') {
                this.selected_element.image_size = util.$('#freedom_image_size', this.edit_channel_popup).value;
                this.selected_element.width = this.selected_element.image_size / 100 * this.selected_element.natural_width;
                this.selected_element.height = this.selected_element.image_size / 100 * this.selected_element.natural_height;
            }

            this.on_image_change();
        },

        read_file: function (file, callback) {
            var reader = new FileReader();

            reader.onload = callback;
            reader.readAsDataURL(file);
        },

        hight_light_selection: function (canvas) {
            var ctx = canvas.getContext('2d'),
                m, x, y, width, height;

            if (!this.selected_element) {
                return;
            }

            x = this.selected_element.x * this.ZOOM_SCALE;
            y = this.selected_element.y * this.ZOOM_SCALE;

            if (this.selected_element.text) {
                m = this.get_text_metrics(this.selected_element);
                width = m.width;
                height = m.height;
            }

            if (this.selected_element.image_data) {
                width = this.selected_element.width * this.ZOOM_SCALE;
                height = this.selected_element.height * this.ZOOM_SCALE;
            }

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([10]);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.rect(x, y, width, height);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        },

        bring_to_front: function (elem) {
            if (!elem) {
                return;
            }

            _.remove(this.elements, function(e) {
                return elem === e;
            });

            this.elements.push(elem);
        },

        on_toggle_crop: function (evt) {
            var canvas = util.$('#freedom_banner_canvas'),
                btn = util.$('#freedom_banner_crop_image'),
                w = 2048,
                h = 1152;

            this.cropping = !this.cropping;
            btn.toggle_class('active');

            if (this.cropping && !this.dragging_crop) {
                this.dragging_crop = {
                    x: canvas.width / 2 - w / 2,
                    y: canvas.height / 2 - h / 2,
                    width: w,
                    height: h
                };
            }

            this.on_image_change();
        }
    };

    widgets.push(widget);

})();
