class Application.ToolTipManager

	constructor: ->
		Application.vent.subscribe "remove:tool:tips:event", @onRemoveToolTips,this

		Application.validator =

			isValid:(options)->
				value = $(options.id).val()
				for property of options.validation
					switch property
						when 'required'
							options.isValid = !@isEmpty(value)
							if(!options.isValid)
								@setToolTip(options,property)
								return false

						when 'email'
							options.isValid = @isEmail(value)
							if(!options.isValid)
								@setToolTip(options,property)
								return false

				return true

			isEmail:(val)->
				return /^\w+([\.\-_+]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val)

			isEmpty:(val)->
				return val is ''

			setToolTip:(options,property)->
				options.content = options.validation[property]
		return

	elements: {}

	manage: (options) ->

		if !@elements[options.page]?
			@elements[options.page] = []
		@elements[options.page].push options.id

		if(options.iconClass?)
			options.content = '<span class="tooltip-icon '+options.iconClass+'"></span><div class="content">' + options.content + '</div>'

		largeTabletWidth = 1280

		$(options.id).focus(->
			console.log "FOCUS #{options.id} options.isValid:%o",options.isValid
			options.isFocused = true
			if options.isValid is true
				$(this).tooltipster "destroy" if $(this).hasClass("tooltipstered")
				return

			$(this).tooltipster "destroy"  if $(this).hasClass("tooltipstered")
			if $('body').hasClass('mobile-platform')
					$parent = $(this).parent()
					$parent.find('.mobile-tooltip').remove()
					$parent.prepend("<span class='mobile-tooltip'>#{options.content}</span>")
			else
				$(this).tooltipster(
					theme: "tooltipster-email2"
					position: if $('body').width() <= largeTabletWidth then "top" else "right"
					content: options.content
					contentAsHTML:true
					maxWidth: 300
				)
				$(this).tooltipster "show"

			return
		)
		$(options.id).blur(->
			return if !options.isFocused?
			content = options.content

			$(this).parent().find('.mobile-tooltip').remove()

			if options.validation? and !Application.validator.isValid(options)
				$(this).tooltipster "destroy" if $(this).hasClass("tooltipstered")

				if $('body').hasClass('mobile-platform')

					$parent = $(this).parent()
					$parent.find('mobile-tooltip').remove()
					$parent.prepend("<span class='mobile-tooltip error'>#{options.content}</span>")

				else
					$(this).tooltipster(
						theme: "tooltipster-email2-error"
						position: if $('body').width() <= largeTabletWidth then "top" else "right"
						content: options.content
						contentAsHTML:true
						maxWidth: 300
					)
					$(this).tooltipster "show"
			else
				$(this).tooltipster "destroy" if $(this).hasClass("tooltipstered")

			options.content = content
			console.log "BLUR #{options.id} options.isValid:%o",options.isValid
			return
		)
		return

	onRemoveToolTips: (page) ->

#		console.log "Removing ToolTips for page: %o",page

		if @elements[page]?
			elements = @elements[page]
			ii = 0

			while ii < elements.length
				@unManage elements[ii]
				ii++
			delete @elements[page]
#		else
#			console.log "Page is not managed: #{page}"
		return

	unManage: (id) ->
		$(id).unbind('focus').unbind('blur')
		$(id).tooltipster "destroy"  if $(id).hasClass("tooltipstered")
		$('span.mobile-tooltip').remove()
		$('input').removeClass('mobile-tooltip')
		return

if	typeof module != 'undefined' and module.exports
	module.exports = Application.ToolTipManager
