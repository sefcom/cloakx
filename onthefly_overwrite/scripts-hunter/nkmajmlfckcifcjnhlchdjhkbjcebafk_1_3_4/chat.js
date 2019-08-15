// Line count to check for incoming messages
var lineCount = -1;
var latestCount = -2;
var displayed = false;
var randomUsername = "Guest_" + Math.floor((Math.random() * 9999) + 1111);
var waitingForOwnMessage = true; // temp disable sound if own message
var firstTime = true; // save count in cookies if first time
var enlarged = false;
var wasLarge = false;

// Load settings and setup automated verification
$(document).ready(function () {


    setInterval(TalkCount, 500);
    RegisterEvents();
    $("#talk_drag").draggable({
        axis: "x"
    });
    if (TalkGetSetting("autoopen") == "true") {
        TalkToggle(false);
    }

});

// Register keyboard and mouse events
function RegisterEvents() {
    /*$("#talk_message").keyup(function (e) {
        if (e.keyCode == 13) {
            TalkSend();
        }
    });*/
    $("#talk_send").click(function () {
        TalkSend();
    });
}

function RegisterEnter(e) {
    if (e.keyCode == 13)
        TalkSend();

}

// Plays the notification sound
function TalkPlayAudio() {
    if (TalkGetSetting("sound") == "true") {
        var audio = new Audio('https://performetudes.ca/chat/sounds/sndNotification.mp3');
        audio.volume = 0.5;
        audio.play();
    }
}

// Open options page
function OpenSettings() {
    var optionsUrl = $("#talk_settingsurl").val();
    var win = window.open(optionsUrl, '_blank');
    win.focus();
}

// Returns the current room
function TalkGetRoom() {
    if ($("#talk_room").val().length == 0) {
        return location.host;
    } else {
        return $("#talk_room").val();
    }
}

// Sends a message
function TalkSend() {
    var room = TalkGetRoom();
    (function ($) {
        var url = 'https://performetudes.ca/chat/chat.php?callback=?&action=message&name=' + $("#talk_name").val() + '&room=' + room + '&message=' + $("#talk_message").val() + '&picture=$protocol' + $("#talk_picture").val().substr($("#talk_picture").val().indexOf('://') + 3);
        console.log("SENDING> " + $("#talk_name").val() + ": " + $("#talk_message").val());
        $("#talk_message").val("");
        $.ajax({
            type: 'GET'
            , url: url
            , async: false
            , /*jsonpCallback: 'jsonCallback',*/
            contentType: "application/json"
            , dataType: 'jsonp'
            , success: function (result) {
                waitingForOwnMessage = true;
                console.log("SENT> " + $("#talk_name").val() + ": " + $("#talk_message").val());
                var date = new Date();
                $("#talk_updated").html("Sent " + TalkFormatMonth(date.getMonth()) + "/" + TalkFormatDouble(date.getDate()) + "/" + date.getFullYear() + " " + date.getHours() + ":" + TalkFormatDouble(date.getMinutes()));
            }
            , error: function (e) {
                console.log(e.message);
            }
        });
        return 'https://performetudes.ca/chat/chat.php?callback=?&action=message&name=' + $("#talk_name").val() + '&room=' + room + '&message=' + $("#talk_message").val();
    })(jQuery);
    /*console.log("SENDING> " + $("#talk_name").val() + ": " + $("#talk_message").val());
    $.getJSON("https://performetudes.ca/chat/chat.php?callback=?", "action=message", "room="+$("#talk_room").val(),"name="+$("#talk_name").val(),"message="+$("#talk_message").val(),
    function(result){
        console.log("SENT> " + $("#talk_name").val() + ": " + $("#talk_message").val());
        $("#talk_message").val("");
    });
    return 'https://performetudes.ca/chat/chat.php?callback=?&action=message&name='+$("#talk_name").val()+'&room='+$("#talk_room").val();*/
}

function TalkFormatMonth(month) {
    if (month.toString().length == 1) {
        return '0' + (month + 1).toString();
    } else {
        return (month + 1).toString();
    }
}

function TalkFormatDouble(double) {
    if (double.toString().length == 1) {
        return '0' + (double).toString();
    } else {
        return (double).toString();
    }
}

// Updates the chat
function TalkUpdate() {
    var room = TalkGetRoom();
    (function ($) {
        var url = 'https://performetudes.ca/chat/chat.php?callback=?&action=update&room=' + room;

        $.ajax({
            type: 'GET'
            , url: url
            , async: false
            , /*jsonpCallback: 'jsonCallback',*/
            contentType: "application/json"
            , dataType: 'jsonp'
            , success: function (result) {
                if (result.json != null && result.json != "") {
                    console.log("UPDATED> " + result.json.length + " bytes");
                    var date = new Date();
                    $("#talk_updated").html("Updated " + TalkFormatMonth(date.getMonth()) + "/" + TalkFormatDouble(date.getDate()) + "/" + date.getFullYear() + " " + date.getHours() + ":" + TalkFormatDouble(date.getMinutes()));
                    $("#talk_chat").html(result.json);
                    $("#talk_chat").animate({
                        scrollTop: $("#talk_chat")[0].scrollHeight - $("#talk_chat")[0].clientHeight
                    }, 100);
                    if (TalkIsNewMessage(room, result.json.length)) {
                        if (waitingForOwnMessage)
                            waitingForOwnMessage = false;
                        else
                            TalkPlayAudio();
                    }
                }
            }
            , error: function (e) {
                console.log(e.message);
            }
        });

    })(jQuery);
    /*$.getJSON("https://performetudes.ca/chat/chat.php?action=update&room="+$("#talk_room").val()+"&callback=?", function(result){
        if(result.json != null && result.json != "")
        {
            console.log("UPDATED> " + result.json.length + " lignes");
            $("#talk_chat").html(result.json);
            $("#talk_chat").animate({
                scrollTop: $("#talk_chat")[0].scrollHeight - $("#talk_chat")[0].clientHeight
            }, 100);
        }
    });*/
    return 'https://performetudes.ca/chat/chat.php?callback=?&action=update&room=' + room;
}

// Check for new incoming messages
function TalkCount() {
    var room = TalkGetRoom();
    (function ($) {
        var url = 'https://performetudes.ca/chat/chat.php?callback=?&action=count&room=' + room;
        $.ajax({
            type: 'GET'
            , url: url
            , async: false
            , /*jsonpCallback: 'jsonCallback',*/
            contentType: "application/json"
            , dataType: 'jsonp'
            , success: function (result) {
                console.log("COUNT> " + result.json);
                if (firstTime) {
                    TalkSetCookie(room, result.json);
                    firstTime = false
                }
                if (result.json != lineCount) {
                    console.log("REQUEST UPDATE>");
                    TalkUpdate();
                    lineCount = result.json;
                }
            }
            , error: function (e) {
                console.log(e.message);
            }
        });

    })(jQuery);
    /*$.getJSON("https://performetudes.ca/chat/chat.php?callback=?", "action=count", "room="+$("#talk_room").val(), function(result){
        console.log("COUNT> " + result.json);
        if(result.json != lineCount)
        {
            console.log("REQUEST UPDATE>");
            TalkUpdate();
            lineCount = result.json;
        }
    });*/
    return 'https://performetudes.ca/chat/chat.php?callback=?&action=count&room=' + room;
}

// Toggles the chat on or off
function TalkToggle(focus) {
    if ($("#talkify").css("bottom") != "0px") {
        $("#talkify").animate({
            bottom: "0px"
        }, 100);
        $("#talk_toggle_icon").attr("src", "https://performetudes.ca/chat/Images/imgClose.png");
        if (focus)
            $("#talk_message").focus();
        displayed = true;
        if (wasLarge)
            SetChatSize(true);
    } else {
        if (enlarged)
            SetChatSize(false);
        $("#talkify").animate({
            bottom: "-328px"
        }, 100);
        $("#talk_toggle_icon").attr("src", "https://performetudes.ca/chat/Images/imgOpen.png");
        displayed = false;
    }
}

// Save settings in cookies
function TalkSaveSettings() {
    /*document.cookie = "username=" + $("#talk_name").val();
    document.cookie = "room=" + $("#talk_room").val();*/
}

// Retrieve saved settings from cookies
function TalkGetSettings() {
    /*$("#talk_name").val(TalkGetCookie("username"));
    $("#talk_room").val(TalkGetCookie("room"));
    TalkUpdate();*/
}

function TalkIsNewMessage(room, count) {
    /*if (TalkGetCookie(room) == count) {
        return false;
    } else {
        TalkSetCookie(room, count);
        return true;
    }*/
    return true;
}

// Get setting value by name
function TalkGetSetting(setting) {
    switch (setting) {
    case "sound":
        return $("#talk_sound").val();
        break;
    case "autoopen":
        return $("#talk_autoopen").val();
        break;
    case "picture":
        return $("#talk_picture").val();
        break;
    default:
        return "";
        break;
    }
}

// Save cookie
function TalkSetCookie(name, value) {
    document.cookie = name + "=" + value;
}

// Retrieve cookie value from its name
function TalkGetCookie(name) {
    var name = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Enlarge or minimize chat
function ChangeChatSize() {
    if (!displayed) {
        return;
    }
    if (!enlarged) {
        enlarged = true;
        wasLarge = true;
        var myClass = $("#talk_message").attr('class');
        var myValue = $("#talk_message").val();
        var textarea = $(document.createElement('textarea')).attr('class', myClass).attr('id', 'talk_message').attr('maxlength', '400').val(myValue);
        $("#talk_message").replaceWith(textarea);
        $("#talk_chat").addClass("textarea_enlarged");
        $("#talk_outerinput").addClass("input_enlarged");
        $("#talk_send").addClass("send_enlarged");
        $("#talk_container").addClass("blur");
        $("#talk_background").css("display", "block");
        $("#talk_drag").css({
            "height": "505px"
            , "width": "700px"
        });
        $("#talk_message").focus();
    } else {
        wasLarge = false;
        enlarged = false;
        var myClass = $("#talk_message").attr('class');
        var myValue = $("#talk_message").val();
        var textbox = $(document.createElement('input')).attr('type', 'text').attr('class', myClass).attr('id', 'talk_message').attr('maxlength', '400').attr('onkeyup', 'RegisterEnter(event)').val(myValue);
        $("#talk_message").replaceWith(textbox);
        $("#talk_chat").removeClass("textarea_enlarged");
        $("#talk_outerinput").removeClass("input_enlarged");
        $("#talk_background").css("display", "none");
        $("#talk_container").removeClass("blur");
        $("#talk_send").removeClass("send_enlarged");
        $("#talk_drag").css({
            "height": "357px"
            , "width": "288px"
        });
        $("#talk_message").focus();
    }
}

// Set the chat size (large or not)
function SetChatSize(large) {
    if (!displayed) {
        return;
    }
    if (large) {
        enlarged = true;
        var myClass = $("#talk_message").attr('class');
        var myValue = $("#talk_message").val();
        var textarea = $(document.createElement('textarea')).attr('class', myClass).attr('id', 'talk_message').attr('maxlength', '400').val(myValue);
        $("#talk_message").replaceWith(textarea);
        $("#talk_chat").addClass("textarea_enlarged");
        $("#talk_outerinput").addClass("input_enlarged");
        $("#talk_send").addClass("send_enlarged");
        $("#talk_container").addClass("blur");
        $("#talk_background").css("display", "block");
        $("#talk_drag").css({
            "height": "505px"
            , "width": "700px"
        });
        $("#talk_message").focus();
    } else {
        enlarged = false;
        var myClass = $("#talk_message").attr('class');
        var myValue = $("#talk_message").val();
        var textbox = $(document.createElement('input')).attr('type', 'text').attr('class', myClass).attr('id', 'talk_message').attr('maxlength', '400').attr('onkeyup', 'RegisterEnter(event)').val(myValue);
        $("#talk_message").replaceWith(textbox);
        $("#talk_chat").removeClass("textarea_enlarged");
        $("#talk_outerinput").removeClass("input_enlarged");
        $("#talk_background").css("display", "none");
        $("#talk_container").removeClass("blur");
        $("#talk_send").removeClass("send_enlarged");
        $("#talk_drag").css({
            "height": "357px"
            , "width": "288px"
        });
        $("#talk_message").focus();
    }
}