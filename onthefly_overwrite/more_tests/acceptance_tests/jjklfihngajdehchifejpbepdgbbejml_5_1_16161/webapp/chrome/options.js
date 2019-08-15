function save_options() {
  var office = document.getElementById('inline_office').checked;
  var gmail = document.getElementById('inline_gmail').checked;
  var zimbra = document.getElementById('inline_zimbra').checked;
  chrome.storage.sync.set({
    "office": office,
    "gmail": gmail,
    "zimbra": zimbra
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
      "office": true,
      "gmail": true,
      "zimbra": true
  }, function(items) {
      document.getElementById('inline_office').checked = items.office;
      document.getElementById('inline_gmail').checked = items.gmail;
      document.getElementById('inline_zimbra').checked = items.zimbra;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
