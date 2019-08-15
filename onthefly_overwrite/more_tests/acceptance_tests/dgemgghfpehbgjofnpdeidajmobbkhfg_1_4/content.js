var fixfixed_content_class = function( chrome ) {
	var self = this;
	
	self.uuid_class = "chrome-fixfixed";
	self.options = {
		'on_off':				1,
		'show_badge': 			1, 
		'animation': 			0, 
		'transition': 			0, 
		'highlight': 			0, 
		'background':			1,
		'scrollcover': 			1, 
		'antializing_delay': 	1000,
		'antializing_scroll':  	1,
		'antializing_color':  	0
	}
	
	
	self.init = function(window) {
		self.storage = chrome.storage.local; 
		self.counter = 0; 
	
		self.oldScrollY = 0;
		self.disableRefresh = 0;
		self.filterTag = "*";
		self.firstRun = 1;
		self.extraCSSRestore = ''; 
		
		self.cover = document.createElement('fixfixedscrollcover'); /* prevent problems of "body>div" styles */
		self.cover.setAttribute('class', 'fixfixedscrollcover');
		self.coverIsVisible = false;
	
		self.default_options = self.options;
	
		self.storage.get( self.options , function(data) {
			self.options = data ; 
		
			chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: '' });
	
		});
	}
	
	// called on document-end when dom is ready
	// we need working dom so we can change body.classes
	self.ready = function(window) {
		console.log( 'ready called ');
		
		if ( self.options.on_off == 1) {
		
			self.enable_features();
			self.addClasses(window);
			
			// wait for start to do this
			//self.addClasses(window); // mark possible divs a .fixfixed
			document.onscroll = function() {
				self.tryScrollCover(window)
			}
		
			// turn on once and keep
			if ( self.options['antializing_scroll'] == 0) {
				document.body.classList.add( self.uuid_class +"-scrolling" );
			}
			
			if ( self.options['antializing_color'] == 1) {
				//setTimeout( function(){
					self.addColorFix();
				//}, 1000);
			}
			
		} else {
			chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: 'off' });
		
		}
		
	}
	
	self.addColorFix = function() { 
		var transColor = 'rgba(0, 0, 0, 0)';
	    var elems = document.getElementsByTagName('*');
		for ( nr = 0, max = elems.length;  nr < max ; nr++ ) {
			var elem = elems[nr];
			var style = getComputedStyle( elem ); 
			if ( style.position == 'fixed' && style.backgroundColor == transColor ) {
				parentElem = elem.parentElement;
				
				while (parentElem  ) {
					//console.log( parentElem );
					
					if ( getComputedStyle( parentElem ).backgroundColor != transColor ) {
						elem.style.backgroundColor = getComputedStyle( parentElem ); 
					} 	
					parentElem = parentElem.parentElement;
				}
			}
		}
	}
	
	self.enable_features = function() {
		for ( key in self.options) {
			self.on_off_feature( key )	 
        }
    }


	self.on_off_feature = function( name ) {
		if ( self.options[name] == 1 ){
			document.body.classList.add( self.uuid_class +"-"+ name );
		} else {
			document.body.classList.remove( self.uuid_class +"-"+ name );
		}	
	}

	self.storageChange = function(changes, namespace) {
		for (key in changes) {
			self.options[key] = changes[key].newValue;
		}
		
		if( self.options.on_off == 0) {
			chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: 'off' });
		}
		
		
	}
	
	self.onMessage = function(message, sender, sendResponse) {
	    //console.log ( "got message");
	    
	    if ( message.type == 'refresh_badge' ) {
		    self.sendMessageBadge();
	    }
	    
	    // workaround trigger refresh
	    if ( message.type == 'toggle_on_off' ) {
		    self.enable_features();
		    //console.log( "message toggle")
	    }
	}


	self.tryScrollCover = function(window) {
		//console.log( self.disableRefresh ); 
		var name = "on_off";
		 
		if ( self.disableRefresh == 0 ) {
			//console.log( 'try scrollx');
			//console.log(this)
			if (typeof self.coverTimer != 'undefined') {
				clearTimeout(self.coverTimer);
			}
			if (!self.coverIsVisible) {
				document.body.appendChild(self.cover);
				if ( self.options['on_off'] == 1 && self.options['antializing_scroll'] == 1) {
					if (typeof self.scrollingTimer != 'undefined') {
						clearTimeout(self.scrollingTimer);
					}
					document.body.classList.add( self.uuid_class +"-scrolling" );
				}
				self.coverIsVisible = true;
				//self.refresh(window)
			}
			self.coverTimer = setTimeout(function() {
				// we are now in global scope !
				//console.log( self.cover );
				
				try {
					document.body.removeChild(self.cover);
					if ( self.options['on_off'] == 1 && self.options['antializing_scroll'] == 1) {
						self.scrollingTimer = setTimeout( function() {
							// delay a bit if scrolling continues
							document.body.classList.remove( self.uuid_class +"-scrolling" );
						}, self.antialize_delay);
					}
					self.coverIsVisible = false;
				} catch (e) {
					// already removed
				}
				
				//self.refresh(window)
			}, 166); /* config ms ? */
		}
	}

	self.sendMessageBadge = function() {
		var badge = self.counter; 
		
		if ( self.options.on_off == 0 ) {
			badge = "off";
		}
		
		if ( self.options.show_badge == 0 ) {
			badge = ""; // remove badge
		}
		
		// should send this only for foreground tabs and not popups
		chrome.runtime.sendMessage({ 
				type: 'badge', 
				text: "set counter", 
				number: badge 
		});
	}


	
	

	self.load_stylesheet = function( href, callback ) {
		
		// we could try to cache these stylesheets
		// and even cache the cssfixed for these stylesheets
		// actually only store the fixes with the href as key
		// need to expire sometimes as css could have changed !
		
		// read default_user_style via xhr from file
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange=function() {
		  if (xhr.readyState==4 && xhr.status==200) {
		    callback( xhr.responseText );
		  }
		};
		xhr.open('GET', href , true);
		xhr.send();
			
	}
	
	self.debug_rules = function( rules ) {
		for ( key in rules ) {
		   //console.log( rules[ key ] );
    	   //console.log( rules[x].selectorText );
    	}
	}
	
	self.appendCSS = function( extraCSS ) {
		if ( extraCSS != '' ) {
				var extraCSSStyle = document.createElement('style'); /* prevent problems of "body>div" styles */
				
				extraCSSStyle.setAttribute('type', 'text/css');
				extraCSSStyle.innerHTML = extraCSS;
				document.body.appendChild( extraCSSStyle );
				
				// we are async, so we update each time, its fast.
				chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: self.counter });
		}
	}
	
	// one line 
	self.createExtraCSS = function ( rule , mediaText ) {
		var extraCSS = ''; 
		if (typeof mediaText == "undefined" ) { 
			mediaText = "" ;
		}
		//console.log( "rule: ", rule ); 
		var mediaBegin = ( mediaText != '' ) ? " @media "+ mediaText + "{ " : " "; 
		var mediaEnd   = ( mediaText != '' ) ? " } " : " "; 
		
		if ( typeof rule.style == 'undefined' ) {
			//console.log( "undefined", rule ); 
			return ""; 
		}
		
		if( (typeof rule.style.transform != "undefined" && rule.style.transform != '' ) || 
			(typeof rule.style.webkitTransform != "undefined" && rule.style.webkitTransform != '')  ) {
				//console.log('nope: has transform ', rule );
			
				// collect the transforms and append them at the end, to correct some false-positives	
				self.extraCSSRestore += mediaBegin + rule.selectorText + " { /* restore */ transform: "+ rule.style.transform +" } " + mediaEnd ;
			
		} else {
			
			//console.log( "rule:" , rule.cssText );
			//console.log( "sel:"  , rule.selectorText );
			
			
					
			if ( rule.style.position == 'fixed' && /* fix html4test.com */ !( rule.style.top == '0px' && rule.style.left == '0px' && rule.style.display == 'block' ) ) {
					//console.log( rule.style ); 
					
					var css_highlight = ( self.options['highlight'] == 1) ? " border:3px dotted orange ": ""; 
					extraCSS +=  mediaBegin + " body.chrome-fixfixed-scrolling " + rule.selectorText + " { transform: translateZ(0); "+ css_highlight + " }" + mediaEnd;
				
					self.counter++; 
			}
			
			
			
			
						 
		}
		return extraCSS;
	}
	
	self.checkRules = function( rules , callback ) {
				extraCSS = ''; 
				if ( rules != null ) {
					//console.log( 'new: ', rules );
					
					for ( key in rules ) {
						var rule = rules[key];
						
						
						//console.log( typeof rule.media );
						
						if ( typeof rule.media == "object" ) {
							
							//console.log( rule.cssRules );
							
							if ( typeof rule.cssRules != "undefined") {
								
								for( key2 in rule.cssRules ) {
									var rule2 = rule.cssRules[key2];
									
									//console.log("rule2: ",  rule2 );
									
									if ( typeof rule2.cssText == "undefined" ) { continue; } 
									
									extraCSS +=  self.createExtraCSS( rule2 ,  rule.media.mediaText );
									
								}	
							}
						} else {
							var rule_text = rule.cssText;
									
							if ( typeof rule_text != "undefined" ) {
								extraCSS += self.createExtraCSS( rule );
							} else {
								// ignore exotic rules
								//console.log("bad: ", rule );
							}
						}
						
					}
					// we append one <style> per stylesheet
					
					self.appendCSS( extraCSS ); 
			
					//self.debug_rules( rules );
					console.log( "has rules first run");
				} else {
					console.log( "no rules "  );
				}
			
			if ( typeof callback == "function") {
				callback();
			}

	}
			
	self.rulesForCssText = function (styleContent) {
	    var doc = document.implementation.createHTMLDocument(""),
	        styleElement = document.createElement("style");
	
	   styleElement.textContent = styleContent;
	    // the style will only be parsed once it is added to a document
	    doc.body.appendChild(styleElement);
	
	    return styleElement.sheet.cssRules;
	};		

	self.addClasses = function(window) {
		
		chrome.runtime.sendMessage({ type: 'badge', text: "set counter", number: self.counter });
	    
	    
		// read stylesheets
		// scan for position:fixed
		
		var stylesheets = document.styleSheets; 
		var stylesheets_count = stylesheets.length; 
		
		console.log( 'stylesheets');
		
		self.extraCSSs = ''; 
		self.async_loop = 1; 
		self.async_running = 0; 
		
		for ( key_s in stylesheets ) {
			var stylesheet = document.styleSheets[key_s]; 
			var rules = stylesheet.cssRules ;
		
			console.log( "--------");
			//console.log( "stylesheet:" , stylesheet );
			//console.log( "rules:" 	   , stylesheet.cssRules );
			console.log( "href:" 	   , stylesheet.href );
		
			if ( typeof stylesheet.checked == 'undefined' ) {
			
				if (  rules == null &&
					 typeof stylesheet.href  != 'undefined'
					  ){
					
					console.log( "fetch" );
					
					stylesheet.checked = 1 ; // prevent fetching again.
					
					// fetch rules via xhr
					self.async_running++; 
					
					self.load_stylesheet( stylesheet.href , function( css ){
						self.async_running--;
						var rules = self.rulesForCssText(css);
					
						self.checkRules( rules  , self.async_finished  ); 
						
					});
					
					//self.debug_rules( rules );
				} else {
					// load direct
					stylesheet.checked = 1 ; // prevent fetching again.
			
					self.checkRules( rules );			
				}
			} else {
				console.log( "already checked");
			}
			
			
		}
		self.async_loop = 0; 
		self.async_finished(); 
		
		return; 
		
			
	}
	
	self.async_finished = function() {
		if ( self.async_running == 0 && self.async_loop == 0) {
			// last async finished; 
			// try to apply transform css again, so they will 
			// cancel out our translateZ(0) which might break the rendering
			if ( self.extraCSSRestore != '' ) {
				self.appendCSS( self.extraCSSRestore );
			}
		}
	}
	// scan the dom after a while to detect changes
	// only scan if number of document.stylesheets has changed
	// -- full reparse of styles
	// only scan elements which have style-attribute in html
	
	self.refresh = function(window) {
		return ; 
		
		if (self.disableRefresh == 0) {
			if (typeof window.scrollY != "undefined" && window.scrollY > 0) {
				if (window.scrollY > self.oldScrollY || window.scrollY < self.oldScrollY - 200 /* scrollback */ ) {
					//	console.log("recheck")
					self.addClasses(window);
					self.oldScrollY = (window.scrollY) + 0;
				} else {
					//console.log("check idle, no scroll " + (window.scrollY) + " : " + (self.oldScrollY ) )
				}
			}
		}
	}
	
	// auto-init
	self.init();
}

ext_fixfixed = new fixfixed_content_class(chrome);
//console.log('fixfixed content.js loaded');

chrome.storage.onChanged.addListener(ext_fixfixed.storageChange);
chrome.runtime.onMessage.addListener(ext_fixfixed.onMessage);

//window.ext_fixfixed = ext_fixfixed;
