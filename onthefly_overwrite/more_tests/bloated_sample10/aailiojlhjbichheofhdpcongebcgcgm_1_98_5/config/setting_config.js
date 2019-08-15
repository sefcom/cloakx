var settings_config = {
    youtube: ['youtube',
        {
            videos: ['videos',
                {
                    video_statistics: ['video_statistics',
                        {
                            branded_video: ['branded_video'],
                            //video_age: ['show_video_age'],
                            monetization: ['show_monetized'],
                            estimated_earnings: ['show_estimated_earnings'],
                            social_stats: ['show_stats']
                        }
                    ],
                    heartbeat_labs: ['heartbeat_labs', {'pick_a_winner': ['pick_a_winner']}],
                    heartbeat_tags: ['heartbeat_tags', {'tag_search_result': ['show_in_search_results']}],
                    tags: ['video_tags', {open_tags: ['open_tags']}],
                    save_moment: ['save_moment'],
                    peek_video_link: ['peek_video_link']
                }
            ],

            uploads: ['uploads',
                {
                    remaining_characters: ['remaining_characters']
                }
            ]
        }
    ],

    youtube_music: ['youtube',
        {
            videos: ['watch_page',
                {
                    video_statistics: ['video_statistics',
                        {
                            branded_video: ['branded_video'],
                            //video_age: ['show_video_age'],
                            monetization: ['show_monetized'],
                            estimated_earnings: ['show_estimated_earnings'],
                            social_stats: ['show_stats']
                        }
                    ],
                    hide_youtube_widgets: ['hide_youtube_widgets',
                        {
                            hide_yt_video_information: ['hide_yt_video_information'],
                            hide_yt_video_description: ['hide_yt_video_description'],
                            hide_yt_video_comments: ['hide_yt_video_comments'],
                            hide_yt_up_next_playlist: ['hide_yt_up_next_playlist'],
                            hide_yt_footer: ['hide_yt_footer'],
                            hide_yt_dislike_button: ['hide_yt_dislike_button']
                        }
                    ],
                    reaction_count: ['reaction_count'],
                    icon_mode: ['icon_mode'],
                    heartbeat_labs: ['heartbeat_labs', {'pick_a_winner': ['pick_a_winner']}],
                    heartbeat_tags: ['heartbeat_tags', {'tag_search_result': ['show_in_search_results']}],
                    tags: ['video_tags', {open_tags: ['open_tags']}],
                    save_moment: ['Heartbeat_moments'],
                    stats_collection: ['heartbeat_stats_collection'],
                    annotation_tool: ['annotations'],
                    scroll_to_top: ['scroll_to_top'],
                    toggle_yt_shortcut: ['toggle_yt_shortcut'],
                    disable_autoplay_new: ['disable_autoplay'],
                    disable_annotations: ['disable_annotations'],
                    show_creator_bar_status: ['show_creator_bar_status'],
                    auto_pause: ['auto_pause', {
                        auto_resume: ['auto_resume']
                    }],
                    auto_expand_description: ['auto_expand_description'],
                    enable_playback_speed: ['enable_playback_speed'],
                    auto_hd: ['auto_hd'],
                    shorter_title: ['shorter_title'],
                    peek_video_link: ['peek_video_link'],
                    autorepeat: ['autorepeat_video']
                }
            ],

            general: ['general',
                {
                    rating_bar: ['rating_bar'],
                    hide_watched_video: ['hide_watched_video'],
                    comment_count: ['comment_count'],
                    peek_video_link: ['peek_video_link'],
                    subscription_recent_uploads: ['slv_subscription_recent_uploads'],
                    heartbeat_discovery: ['heartbeat_discovery']
                }
            ],

            uploads: ['uploads',
                {
                    remaining_characters: ['remaining_characters']
                }
            ],

            player: ['player',
                {
                    flash_player: ['change_the_play_mode']
                }
            ],

            feed: ['feed',
                {
                    truncate_long_title: ['truncate_long_title'],
                    toggle_more_space: ['toggle_more_space']
                }
            ],

            playlist: ['playlist',
                {
                    sort_playlist: ['sort_playlist'],
                    playlist_deleted_video_remover: ['deleted_video_remover'],
                    hide_deleted_and_privated_videos: ['hide_deleted_and_privated_videos'],
                    hide_not_available_videos: ['hide_not_available_videos']
                }
            ],

            creator_studio: ['creator_studio',
                {
                    freedom_dashboard: ['freedom_dashboard']
                }
            ],

            external_apps: ['external_apps',
                {
                    crm: ['crm_toggle']
                }
            ],

            channels: ['channels',
                {
                    vpm: ['show_vpm'],
                    spm: ['show_spm'],
                    videos: ['videos'],
                    vpd: ['show_vpd'],
                    spd: ['show_spd'],
                    subscribed_to_me: ['subscribed_to_me'],
                    vph: ['show_vph'],
                    sph: ['show_sph'],
                    channel_latest_stats: ['show_channel_24h_stats'],
                    channel_identifier: ['channel_identifier'],
                    feed_tab: ['social_media_feeds'],
                    website: ['website']
                }
            ],

            video_icon: ['video_icon',
                {
                    light_switch: ['dark_mode'],
                    show_video_manager: ['video_manager'],
                    show_watch_later: ['watch_later'],
                    show_comments: ['comments'],
                    show_analytics: ['analytics'],
                    channel_activity: ['yta_channel_activity'],
                    yt_legacy_menu: ['legacy_menu']
                }
            ],

            others: ['others',
                {
                    comment_count: ['comment_count']
                }
            ]
        }
    ],

    twitch: ['twitch',
        {
            twitch_earnings: ['show_estimated_earnings'],
            twitch_dark_mode: ['dark_mode'],
            twitch_social_feed: ['feed']
        }
    ],

    hitbox: ['hitbox',
        {
            hitbox_earnings: ['show_estimated_earnings']
        }
    ],

    dailymotion: ['dailymotion',
        {
            dailymotion_earnings: ['show_estimated_earnings'],
            dailymotion_light: ['dark_mode'],
            dailymotion_view_comment_count: ['dailymotion_view_comment_count'],
            dailymotion_follower_count: ['dailymotion_follower_count']
        }
    ],

    facebook: ['facebook',
        {
            fb_block_seen_chat: ['fb_block_seen_chat']
        }
    ],

    // heartbeat theme
    heartbeat_theme: ['heartbeat_theme', {
        youtube_theme: ['youtube_theme', {
            youtube_theme_global: ['youtube_theme_global', {
                youtube_theme_background_color: ['background_color'],
                youtube_theme_text_color: ['text_color'],
                youtube_theme_border_color: ['border_color']
            }],
            youtube_theme_button: ['youtube_theme_button', {
                youtube_theme_button_background_color: ['background_color'],
                youtube_theme_button_text_color: ['text_color'],
                youtube_theme_button_border_color: ['border_color']
            }],
            youtube_theme_body: ['youtube_theme_body', {
                youtube_theme_body_background_color: ['background_color']
            }],
            youtube_theme_input: ['youtube_theme_input', {
                youtube_theme_input_background_color: ['background_color'],
                youtube_theme_input_text_color: ['text_color'],
                youtube_theme_input_border_color: ['border_color']
            }],
            youtube_theme_video_link: ['youtube_theme_video_link', {
                youtube_theme_video_link_text_color: ['text_color'],
                youtube_theme_video_link_hover_color: ['hover_color'],
                youtube_theme_video_link_visited_color: ['visited_color']
            }],
        }]
    }],

    beta_keys: {
        show_watch_later: true
    }
};
