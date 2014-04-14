;(function($, window){

	"use strict";

	var $window = window.app && window.app.$window || $(window);

	function resolveType(element, options){

		if ($.data(element, 'skinform')) { return; }

		var $el = $(element), data;

		if ($el.is('select')) { data = new Skinselect(element, options && options.select); }
		else if ($el.is('input[type="checkbox"]')) { data = new Skincheckbox(element, options && options.checkbox); }
		else if ($el.is('input[type="radio"]')) { data = new Skinradio(element, options && options.radio); }
		else if ($el.is('input[type="file"]')){ data = new Skinfile( element, options && options.file); }

		if (data) { $.data(element, 'skinform', data); }

	}

	// SKIN SELECT
	// ****************************************************************

	function Skinselect(element, options){

		this.options = $.extend({}, $.skinform.defaults.select, options);
		this.$select = $(element);
		this.init();

	}

	Skinselect.prototype = {

		init: function(){

			this.$el = this.$select.wrap('<div class="'+ this.options.skinClass +'" />').parent();
			this.$btn = $('<span>').addClass(this.options.btnClass).text(this.$select.find('option:selected').text()).appendTo(this.$el);

			if (this.$select.data('class')) { this.$el.addClass( this.$select.data('class') ); }
			if (this.$select.data('btn-class')) { this.$btn.addClass( this.$select.data('btn-class') ); }

			this.events();

		},

		events: function(){

			var self = this;

			this.$select.on({
				'focus': function(){ self.$el.addClass( self.options.focusClass ); },
				'blur': function(){ self.$el.removeClass( self.options.focusClass ); },
				'change': function(){ self.$btn.text( self.$select.find('option:selected').text() ); }
			});

		}
	};

	// SKIN CHECKBOX
	// ****************************************************************

	function Skincheckbox(element, options){

		this.options = $.extend({}, $.skinform.defaults.checkbox, options);
		this.$input = $(element);
		this.init();

	}

	Skincheckbox.prototype = {

		init: function(){

			this.$el = this.$input.parent();

			if ( !this.$el.is('label') ) {
				this.$el = this.$input.wrap('<label class="'+ this.options.skinClass +'"></label>').parent();
				this.$el.prepend( this.$input.attr('value') );
			} else {
				this.$el.addClass( this.options.skinClass );
			}

			if ( this.$input.prop("checked") ) { this.$el.addClass( this.options.toggleClass ); }
			if ( this.$input.data('class') ) { this.$el.addClass( this.$input.data('class') ); }

			this.events();

		},

		events: function(){

			var self = this;

			self.$input.on({
				'change': function(){ self.$el.toggleClass( self.options.toggleClass ); },
				'focus': function(){ self.$el.addClass( self.options.focusClass ); },
				'blur': function(){ self.$el.removeClass( self.options.focusClass ); }
			});

		}

	};

	// SKIN FILE
	// ****************************************************************

	function Skinfile(element, options){

		this.options = $.extend({}, $.skinform.defaults.file, options);
		this.input = element;
		this.init();

	}

	Skinfile.prototype = {

		init: function(){

			this.$input = $( this.input );
			this.$el = $('<div class="'+ this.options.skinClass +'">');
			this.$label = $('<div class="'+ this.options.labelClass +'">'+ this.options.labelText +'</div>').appendTo(this.$el);
			this.$btn = $('<div class="'+ this.options.btnClass +'">'+ this.options.btnText +'</div>').appendTo(this.$el);

			this.$el.insertAfter(this.$input);
			this.$input.appendTo(this.$el);

			this.events();

		},

		events: function(){

			var self = this;

			this.$input.on({

				'focus': function(){ self.$input.data('val', this.$input.val()); },
				'blur': function(){ self.$input.trigger('checkChange'); },
				'checkChange': function(){

					var inputVal = self.$input.val();

					if(inputVal && inputVal != self.$input.data('val')) {
						self.$input.trigger('change');
					}

				},
				'change': function(){

					var fileName = self.$input.val().split(/\\/).pop(),
						fileExtClass = 'skinfileExt-' + fileName.split('.').pop().toLowerCase();

					self.$label.text(fileName).removeClass( self.$label.data('fileExtClass') || '').addClass(fileExtClass).data('fileExtClass', fileExtClass);
					self.$btn.text( self.options.btnChangeText );

				},
				click: function(){

					self.$input.data('val', self.$input.val());
					setTimeout(function(){ self.$input.trigger('checkChange'); },100);

				}

			});

			this.$el.on('mousemove', function(e){

				var map = {
					'left': e.pageX - self.$el.offset().left - self.$input.outerWidth() + 20, //position right side 20px right of cursor X)
					'top': e.pageY - self.$el.offset().top - $window.scrollTop() - 3
				};

				if ( self.options.fixedPosition ){ map.top = e.pageY - self.$el.offset().top - 3; }

				self.$input.css( map );

			});

		}
	};


	// SKIN RADIO
	// ****************************************************************

	function Skinradio(element, options){

		this.options = $.extend({}, $.skinform.defaults.radio, options);
		this.input = element;
		this.init();

	}

	Skinradio.prototype = {

		init: function(){

			var self = this;
			this.$input = $( this.input );
			var inputName = this.input.name;

			if($.data(this.input, 'skinform-'+ inputName)) { return; }

			this.$wrap = this.options.groupSelector ? this.$input.closest( this.options.groupSelector ) : this.$input.closest('form');
			if (!this.$wrap.length) { this.$wrap = $('body'); }

			this.$elems = this.$wrap.find('input[name="'+ inputName +'"]');
			this.$labels = $();

			this.$elems.each(function(){

				var input = this,
					$input = $(this),
					$el = $input.parent();

				if (!$el.is('label')) {
					$el = $input.wrap('<label class="'+ self.options.skinClass +'"></label>').parent();
					$el.prepend( input.value );
				} else {
					$el.addClass( self.options.skinClass );
				}

				if ($input.prop("checked")){ $el.addClass( self.options.toggleClass ); }

				self.$labels = self.$labels.add( $el );
				$.data(input, 'skinform-'+ inputName, self);

			});

			this.events();


		},

		events: function(){

			var self = this;

			this.$elems.on({
				change: function(){ self.$labels.removeClass( self.options.toggleClass ); $(this).parent().addClass( self.options.toggleClass ); },
				focus: function(){ self.$labels.removeClass( self.options.focusClass ); $(this).parent().addClass( self.options.focusClass ); },
				blur: function(){ $(this).parent().removeClass( self.options.focusClass ); }
			});

		}

	};

	// ...AND GO!
	// ****************************************************************

	$.skinform = {};

	$.fn.skinform = function( options ){
		return this.each(function(){ resolveType(this, options); });
	};

	$.skinform.defaults = {
		select: {
			skinClass: 'skin_select',
			btnClass: 'btn',
			focusClass: 'focused'
		},
		checkbox: {
			skinClass: 'skin_checkbox',
			toggleClass: 'on',
			focusClass: 'focused'
		},
		radio: {
			skinClass: 'skin_radio',
			toggleClass: 'on',
			focusClass: 'focused',
			groupSelector: null
		},
		file: {
			skinClass: 'skin_file',
			btnClass: 'skin_file_btn',
			labelClass: 'skin_file_label',
			btnText: 'Odaberi',
			btnChangeText: 'Promijeni',
			labelText: 'Odaberite datoteku'
		}
	};

})( window.jQuery || window.Zepto, window );