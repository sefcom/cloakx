Application.Router = {
	initialize:->
		console.log 'Router Initialized'

		@initRouter()

		if window.location.hash
			$(window).trigger('hashchange')

		return

	initRouter:->
		$(window).on('hashchange',->
			route = location.hash.replace('#','')
			if route isnt ''
				Application.vent.publish(route + ':route:event')
		)
		return
}
