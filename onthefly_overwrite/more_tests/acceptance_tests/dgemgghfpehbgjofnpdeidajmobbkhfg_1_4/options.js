var fixfixed_options_class = function(chrome) {
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
		
		
	self.init = function() {	
		
		self.storage = chrome.storage.local; 
		self.default_options = self.options; 
		
		self.load_options();
		
	}
	
	
	self.byId = function(id) {
		return document.getElementById(id); 
	}

	self.flash_message = function( text ) {
		// Update status to let user know options were saved.
			self.byId("status").innerHTML = text ;
			self.byId("status").style.display = "block";
			setTimeout(function() {
				self.byId("status").innerHTML = "";
				self.byId("status").style.display = "none";
				
			}, 2000);
	}

	// Saves options to localStorage.
	self.save_options = function() {
		for ( var key in self.options ) {
			if (self.options.hasOwnProperty(key)) {
				if ( self.byId( key ) ) {
					self.options[key] = self.byId( key ).value ; 
				}
			}
		};	
	
		self.storage.set( self.options , function() {
			self.flash_message( "Options Saved !" );
		});
	}
	
	self.info_options = function() {
		self.storage.get( null , function( data ){
			console.log( data );
		});
	}
	
	
	// Restores select box state to saved value from localStorage.
	self.load_options = function() {
		// restore from storage // lazy init()	
		self.storage.get( self.options , function( data ){
		
			self.options = data	
			console.log( data );
			
			for ( var key in self.options ) {
				if (self.options.hasOwnProperty(key)) {
					if ( self.byId( key ) ) {
						self.byId( key ).value = self.options[key] ; 
					}
				}
			}
		});
	}
	
	// Restores select box state to saved value from localStorage.
	self.reset_options = function() {
			// restore from storage // lazy init()	
		
			self.options = self.default_options;	
			
			for ( var key in self.options ) {
				if (self.options.hasOwnProperty(key)) {
					if ( self.byId( key ) ) {
						self.byId( key ).value = self.options[key] ; 
					}
				}
			}
			
			self.flash_message( "Options Reset. Not Saved !" );
	}
	
	//self.init();
}

var ext_options = new fixfixed_options_class(chrome);

// init
document.addEventListener('DOMContentLoaded', ext_options.init );
chrome.storage.onChanged.addListener(ext_options.load_options);

document.querySelector('#save' ).addEventListener('click', ext_options.save_options);
document.querySelector('#reset').addEventListener('click', ext_options.reset_options);

//window.save = ext_options.save_options;

