Application.imageLoader =
	loadImage:(options)->
		$img = options.$img
		return if $img.length is 0

		$img.load(->
			options.success.call()
		).error(->
			options.error.call()
		)
		$img.attr('src',options.url)
		return

	loadImageOld: (options) ->
		options.dataType = "image/jpg" or options.datatype
		$.ajax(
			type: "GET"
			url: options.url
			dataType: options.dataType
			success: options.success
			done:options.done
			error: options.error
			crossDomain: true
		)
		return
