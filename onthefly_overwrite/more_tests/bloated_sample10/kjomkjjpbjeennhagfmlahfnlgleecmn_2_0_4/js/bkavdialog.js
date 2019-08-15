var BkavDialog = function()
{
	var m_objIfSelf = this;
	var div1 = $('<div class = "bkav-wrapper"></div>');
	var m_objWrapperDiv = null;
	var m_objDialogDiv = null;

	this.ShowConfirmDialog = function(objData)
	{
		m_objWrapperDiv = $('<div class = "bkav-wrapper"></div>');
		m_objDialogDiv = $('\
						<div class = "bkav-modal-dialog">\
							<div class = "bkav-model-content">\
								<div class = "bkav-model-header">\
									<img class = "bkav-icon" src = "' + objData.img + '">\
									<span>'+ objData.title + '</span>\
								</div>\
								<div class = "bkav-model-body">\
									<span>' + objData.content + '</span>\
								</div>\
								<div class = "bkav-model-footer">\
									<div><button class = "bkav-button bkav-cancelbutton">' + objData.cancelbutton.label + '</button></div>\
									<div><button class = "bkav-button bkav-okbutton">' + objData.okbutton.label +'</button></div>\
								</div>\
							</div>\
						</div>')

		m_objDialogDiv.find(".bkav-cancelbutton").click(function(){
			objData.cancelbutton.action(m_objIfSelf);
		});

		m_objDialogDiv.find(".bkav-okbutton").click(function(){
			objData.okbutton.action(m_objIfSelf);
		});

		$("body").append(m_objWrapperDiv);	

		$("body").append(m_objDialogDiv);

		m_objWrapperDiv.hide();
		m_objDialogDiv.hide();
		m_objWrapperDiv.fadeIn(500);
		m_objDialogDiv.fadeIn(500);
	}

	this.Close = function()
	{
		m_objWrapperDiv.fadeOut(500);
		m_objDialogDiv.fadeOut(500);
	}
}