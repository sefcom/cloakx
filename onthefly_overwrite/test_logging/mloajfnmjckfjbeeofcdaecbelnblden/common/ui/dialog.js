window.dji=window.dji||{};window.dji.ui=window.dji.ui||{};
(function(d){d.showModal=function(d,e){var a=$("#"+d),b=a.find(".__dji_cwe_dialog_close button")[0],c=a.find(".__dji_cwe_dialog_footer button")[0];$(document.body).addClass("__dji_cwe_dialog");a.show();clickHandler=function(){b&&b.removeEventListener("click",clickHandler,!1);c&&c.removeEventListener("click",clickHandler,!1);a.hide();$(document.body).removeClass("__dji_cwe_dialog");e&&e()};b&&b.addEventListener("click",clickHandler,!1);c&&c.addEventListener("click",clickHandler,!1)}})(window.dji.ui.dialog=
window.dji.ui.dialog||{});
