function resizeIframe(ev) {
	console.log("Resize iframe");
	ev.target.style.height = ev.target.contentWindow.document.body.scrollHeight + 'px';
	ev.target.style.width = ev.target.contentWindow.document.body.scrollWidth + 'px';
}
document.getElementById("frame").addEventListener("load", resizeIframe);
