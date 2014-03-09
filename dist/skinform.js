// Skinform plugin -- Damir Brekalo

;(function ( $, window, document ) {

    "use strict";

    var $window = $(window),
        $document = $(document);

    function ResolveType( element, options ){

        if( $.data(element, 'skinform') ) { return; }

        var $el = $(element);
        var defaults = $.skinform.defaults;
        var data = null;

        if ( $el.is('select') ) {

            data = new Skinselect( element, defaults.select, options && options.select ? options.select : {} );

        } else if ( $el.is('input[type="checkbox"]') ) {

            data = new Skincheckbox( element, defaults.checkbox, options && options.checkbox ? options.checkbox : {} );

        } else if ( $el.is('input[type="radio"]') ){

            data = new Skinradio( element, defaults.radio, options && options.radio ? options.radio : {} );

        } else if ( $el.is('input[type="file"]') ){

            data = new Skinfile( element, defaults.file, options && options.file ? options.file : {} );

        }

        if ( data ) { $.data( element, 'skinform', data);  }

    }


    // SKIN FILE
    // ****************************************************************

    function Skinfile( element, defaults, options ){

        this.options = $.extend( {}, defaults, options);
        this.input = element;
        this.init();

    }

    Skinfile.prototype = {

        init: function(){

            this.$input = $( this.input );
            this.$el = $('<div class="'+ this.options.skin_class +'">');
            this.$label = $('<div class="'+ this.options.label_class +'">'+ this.options.label_text +'</div>').appendTo(this.$el);
            this.$btn = $('<div class="'+ this.options.btn_class +'">'+ this.options.btn_text +'</div>').appendTo(this.$el);

            this.$el.insertAfter( this.$input );
            this.$input.appendTo( this.$el );

            this.setup_events();

        },

        setup_events: function(){

            var self = this;

            this.$input.on({

                'focus': function(){ self.$input.data('val', fileInput.val()); },
                'blur': function(){ self.$input.trigger('check_change'); },
                'check_change': function(){ if(self.$input.val() && self.$input.val() != self.$input.data('val')){ self.$input.trigger('change'); }},
                'change': function(){

                    var fileName = self.$input.val().split(/\\/).pop(),
                        fileExt = 'skin_file_ext_' + fileName.split('.').pop().toLowerCase();

                    self.$label.text(fileName).removeClass( self.$label.data('fileExt') || '').addClass(fileExt).data('fileExt', fileExt);
                    self.$btn.text( self.options.btn_change_text );

                },
                click: function(){

                    self.$input.data('val', self.$input.val());
                    setTimeout(function(){ self.$input.trigger('check_change'); },100);

                }

            });

            this.$el.on('mousemove', function(e){

                var map = {
                    'left': e.pageX - self.$el.offset().left - self.$input.outerWidth() + 20, //position right side 20px right of cursor X)
                    'top': e.pageY - self.$el.offset().top - $window.scrollTop() - 3
                };

                if ( self.options.fixed_position ){ map.top = e.pageY - self.$el.offset().top - 3; }

                self.$input.css( map );

            });

        }
    };


    // SKIN RADIO
    // ****************************************************************

    function Skinradio( element, defaults, options ) {

        this.options = $.extend( {}, defaults, options);
        this.input = element;
        this.init();

    }

    Skinradio.prototype = {

        init: function(){

            var skinobj = this;
            this.$input = $( this.input );
            var input_name = this.input.name;

            if( $.data(this.input, 'skinform_'+ input_name) ) { return; }

            this.$wrap = this.options.group_selector ? this.$input.closest( this.options.group_selector ) : this.$input.closest('form');
            if ( !this.$wrap.length ) { this.$wrap = $('body'); }

            this.$elems = this.$wrap.find('input[name="'+ input_name +'"]');
            this.$labels = $();

            this.$elems.each(function(){

                var input = this,
                    $input = $(this),
                    $el = $input.parent();

                if ( !$el.is('label') ) {
                    $el = $input.wrap('<label class="'+ skinobj.options.skin_class +'"></label>').parent();
                    $el.prepend( input.value );
                } else {
                    $el.addClass( skinobj.options.skin_class );
                }

                if ( $input.prop("checked") ){ $el.addClass( skinobj.options.toggle_class ); }

                skinobj.$labels = skinobj.$labels.add( $el );
                $.data(input, 'skinform_'+ input_name, skinobj);

            });

            this.setup_events();


        },

        setup_events: function(){

            var self = this;

            this.$elems.on({
                change: function(){ self.$labels.removeClass( self.options.toggle_class ); $(this).parent().addClass( self.options.toggle_class ); },
                focus: function(){ self.$labels.removeClass( self.options.focus_class ); $(this).parent().addClass( self.options.focus_class ); },
                blur: function(){ $(this).parent().removeClass( self.options.focus_class ); }
            });

        }

    };

    // SKIN CHECKBOX
    // ****************************************************************

    function Skincheckbox( element, defaults, options ) {

        this.options = $.extend( {}, defaults, options);
        this.$input = $(element);
        this.init();

    }

    Skincheckbox.prototype = {

        init: function(){

            this.$el = this.$input.parent();

            if ( !this.$el.is('label') ) {
                this.$el = this.$input.wrap('<label class="'+ this.options.skin_class +'"></label>').parent();
                this.$el.prepend( this.$input.attr('value') );
            } else {
                this.$el.addClass( this.options.skin_class );
            }

            if ( this.$input.prop("checked") ) { this.$el.addClass( this.options.toggle_class ); }
            if ( this.$input.data('class') ) { this.$el.addClass( this.$input.data('class') ); }

            this.setup_events();

        },

        setup_events: function(){

            var self = this;

            self.$input.on({
                'change': function(){ self.$el.toggleClass( self.options.toggle_class ); },
                'focus': function(){ self.$el.addClass( self.options.focus_class ); },
                'blur': function(){ self.$el.removeClass( self.options.focus_class ); }
            });

        }

    };


    // SKIN SELECT
    // ****************************************************************

    function Skinselect( element, defaults, options ) {

        this.options = $.extend( {}, defaults, options);
        this.$select = $(element);
        this.init();

    }

    Skinselect.prototype = {

        init: function(){

            this.$el = this.$select.wrap('<div class="'+ this.options.skin_class +'" />').parent();
            this.$btn = $('<span class="'+ this.options.btn_class +'">'+ this.$select.find('option:selected').text()+'</span>');
            this.$el.prepend( this.$btn );

            if ( this.$select.data('class') ) { this.$el.addClass( this.$select.data('class') ); }
            if ( this.$select.data('btn-class') ) { this.$btn.addClass( this.$select.data('btn-class') ); }

            this.setup_events();

        },

        setup_events: function(){

            var self = this;
            this.$select.on({
                'focus': function(){ self.$el.addClass( self.options.focus_class ); },
                'blur': function(){ self.$el.removeClass( self.options.focus_class ); },
                'change': function(){ self.$btn.text( self.$select.find('option:selected').text() ); }
            });

        }
    };

    // ...AND GO!
    // ****************************************************************

    $.skinform = {};

    $.fn.skinform = function( options ){
        return this.each(function(){ ResolveType(this, options); });
    };

    $.skinform.defaults = {
        select: {
            skin_class: 'skin_select',
            btn_class: 'btn',
            focus_class: 'focused'
        },
        checkbox: {
            skin_class: 'skin_checkbox',
            toggle_class: 'on',
            focus_class: 'focused'
        },
        radio: {
            skin_class: 'skin_radio',
            toggle_class: 'on',
            focus_class: 'focused',
            group_selector: null
        },
        file: {
            skin_class: 'skin_file',
            btn_class: 'skin_file_btn',
            label_class: "skin_file_label",
            btn_text: 'Odaberi',
            btn_change_text: 'Promijeni',
            label_text: 'Odaberite datoteku'
        }
    };

})( jQuery, window, document );