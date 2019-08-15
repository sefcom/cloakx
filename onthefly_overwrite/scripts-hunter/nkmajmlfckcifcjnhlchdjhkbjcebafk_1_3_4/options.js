var randomUsername = "Guest_" + Math.floor((Math.random() * 9999) + 1111);

function save_options() {
    var username = document.getElementById('username').value;
    var room = document.getElementById('room').value;
    var picture = document.getElementById('picture').value;
    var autoopen = document.getElementById('autoopen').checked.toString();
    var sound = document.getElementById('sound').checked.toString();
    console.log("Saving username:" + username + " room:" + room);
    chrome.storage.sync.set({
        username: username
        , room: room
        , picture: picture
        , autoopen: autoopen
        , sound: sound
    }, function () {
        //document.getElementById('status').innerHTML = "Good job! You clicked on save! Cool!";
        chrome.tabs.getCurrent(function (tab) {
            chrome.tabs.remove(tab.id, function () {});
        });
    });
}

function load_options() {
    chrome.storage.sync.get({
        username: randomUsername
        , room: ''
        , picture: ''
        , autoopen: 'false'
        , sound: 'true'
    }, function (items) {
        document.getElementById('username').value = items.username;
        document.getElementById('room').value = items.room;
        document.getElementById('picture').value = items.picture;
        document.getElementById('autoopen').checked = JSON.parse(items.autoopen.toLowerCase());
        document.getElementById('sound').checked = JSON.parse(items.sound.toLowerCase());
    });
}

function cancel() {
    load_options();
    chrome.tabs.getCurrent(function (tab) {
        chrome.tabs.remove(tab.id, function () {});
    });
}
document.addEventListener('DOMContentLoaded', load_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('cancel').addEventListener('click', cancel);