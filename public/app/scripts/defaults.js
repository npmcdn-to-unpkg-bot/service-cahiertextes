'use strict';

// Note: pour des raisons pratiques certaines constantes sémantiquement parlant sont en fait des factory ou des services

angular.module( 'cahierDeTexteApp' )
    .constant( 'API_VERSION', 'v1' )
    .constant( 'SEMAINES_VACANCES', { A: [ 1, 7, 8, 16, 17, 28, 29, 30, 31, 32, 33, 34, 43, 44 ],
				      B: [ 1, 7, 8, 16, 17, 28, 29, 30, 31, 32, 33, 34, 43, 44 ],
				      C: [ 1, 7, 8, 16, 17, 28, 29, 30, 31, 32, 33, 34, 43, 44 ] } )
    .constant( 'ZONE', 'A' )
// Configuration d'angular-moment
    .constant('angularMomentConfig', {
	timezone: 'Europe/Paris'
    })
// définition des couleurs
    .constant( 'THEME', { filled: { base: '#aaffaa',
				    stroke: '#88aa88' },
			  validated: { base: '#00ff00',
				       stroke: '#00aa00' }
			} )

// options des calendriers
    .constant( 'CALENDAR_PARAMS', { max_length: 16,
				    couleurs: {
					'cours': '#ffc',
					'devoir': '#eff'
				    }} )
    .factory( 'CALENDAR_OPTIONS', [ '$locale',
				    function( $locale ) {
					return { height: 600,
						 header: { left: '',
							   center: 'title',
							   right: 'today prev,next' },
						 firstDay: 1,
						 minTime: 7,
						 maxTime: 19,
						 ignoreTimezone: true,
						 timeFormat: { month: $locale.DATETIME_FORMATS.shortTime + '{ - ' + $locale.DATETIME_FORMATS.shortTime + '}',
							       week: '',
							       day: '' },
						 axisFormat: $locale.DATETIME_FORMATS.shortTime,
						 allDaySlot: false,
						 columnFormat: { month: 'ddd',
								 week: 'ddd d/M',
								 day: 'dddd d MMMM' },
						 titleFormat: { month: 'MMMM yyyy',
								week: "'Semaine du' d[ MMMM][ yyyy]{ 'au' d MMMM yyyy}",
								day: 'dddd d MMMM yyyy' },
						 monthNames: $locale.DATETIME_FORMATS.MONTH,
						 monthNamesShort: $locale.DATETIME_FORMATS.SHORTMONTH,
						 dayNames: $locale.DATETIME_FORMATS.DAY,
						 dayNamesShort: $locale.DATETIME_FORMATS.SHORTDAY,
						 buttonText: { prev:     '&lsaquo;',
							       next:     '&rsaquo;',
							       prevYear: '&laquo;',
							       nextYear: '&raquo;',
							       today:    'aujourd\'hui',
							       month:    'mois',
							       week:     'semaine',
							       day:      'jour' },
						 defaultView: 'agendaWeek',
						 editable: false,
						 eventDurationEditable: false,
						 disableDragging: true,
						 selectable: false,
						 selectHelper: true,
						 weekends: false
					       };
				    } ] )

// options des graphiques
    .factory( 'CHART_COLORS_FUNCTION', [ 'THEME',
					 function( THEME ) {
					     return function() {
						 var couleurs = [ THEME.validated.base, THEME.filled.base ];
						 return function( d, i ) {
						     return couleurs[ i ];
						 };
					     };
					 } ] )
    .service( 'BARCHART_DEFINITION', [ 'CHART_COLORS_FUNCTION',
				       function( CHART_COLORS_FUNCTION ) {
					   return function() {
					       return { data: [],
							tooltipContent: function() {
							    return function( key, x, y, e, graph ) {
								return '<h2>' + x + '</h2><p>' + y + ' ' + key + '</p>';
							    };
							},
							xAxisTickFormatFunction: function() { return function( d ) { return d; }; },
							colorFunction: CHART_COLORS_FUNCTION };
					   };
				       } ] )
    .service( 'PIECHART_DEFINITION', [ 'CHART_COLORS_FUNCTION',
				       function( CHART_COLORS_FUNCTION ) {
					   return function() {
					       return { data: [ { label: 'saisie', value: 0 },
								{ label: 'valide', value: 0 } ],
							xFunction: function(){ return function(d) { return d.label; }; },
							yFunction: function(){ return function(d) { return d.value; }; },
							colorFunction: CHART_COLORS_FUNCTION };
					   };
				       } ] )
    .config(['$provide', function($provide){
	// this demonstrates how to register a new tool and add it to the default toolbar
	$provide.decorator( 'taOptions',
			    [ '$delegate', 'taRegisterTool',
			      function( taOptions, taRegisterTool ){
				  // $delegate is the taOptions we are decorating
				  // here we override the default toolbars and classes specified in taOptions.
				  // taOptions.toolbar = [
				  //     ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
				  //     ['bold', 'italics', 'underline', 'ul', 'ol', 'redo', 'undo', 'clear'],
				  //     ['justifyLeft','justifyCenter','justifyRight'],
				  //     ['html', 'insertImage', 'insertLink', 'unlink']
				  // ];

				  taOptions.toolbar = [
				      [ 'bold', 'italics', 'underline', 'ul', 'ol', 'quote', 'justifyLeft', 'justifyCenter', 'justifyRight', 'insertLink', 'redo', 'undo' ]
				  ];

				  var colorpicker_taTool = function( type ) {
				      var style = ( type === 'backcolor' ) ? 'background-' : '';
				      return { display: '<span class="dropdown"><a class="dropdown-toggle"><i class="fa fa-font" style="' + style + 'color:red"></i> <i class="fa fa-caret-down"></i></a><ng-color-picker class="dropdown-menu" selected="selected"></ng-color-picker></span>',
					       action:function( ) {
						   return ( this.selected === 'nil' ) ? false : this.$editor().wrapSelection( type, this.selected );
					       }
					     };
				  };

				  taRegisterTool( 'fontColor', colorpicker_taTool( 'forecolor' ) );
				  taOptions.toolbar[0].push( 'fontColor' );

				  taRegisterTool( 'backgroundColor', colorpicker_taTool( 'backcolor' ) );
				  taOptions.toolbar[0].push( 'backgroundColor' );

				  taOptions.classes = {
				      focussed: 'focussed',
				      toolbar: 'btn-toolbar',
				      toolbarGroup: 'btn-group',
				      toolbarButton: 'btn btn-default',
				      toolbarButtonActive: 'active',
				      disabled: 'disabled',
				      textEditor: 'form-control',
				      htmlEditor: 'form-control'
				  };
				  return taOptions; // whatever you return will be the taOptions
			      }]);
	// this demonstrates changing the classes of the icons for the tools for font-awesome v3.x
	// $provide.decorator('taTools', ['$delegate', function(taTools){
	//     taTools.bold.iconclass = 'icon-bold';
	//     taTools.italics.iconclass = 'icon-italic';
	//     taTools.underline.iconclass = 'icon-underline';
	//     taTools.ul.iconclass = 'icon-list-ul';
	//     taTools.ol.iconclass = 'icon-list-ol';
	//     taTools.undo.iconclass = 'icon-undo';
	//     taTools.redo.iconclass = 'icon-repeat';
	//     taTools.justifyLeft.iconclass = 'icon-align-left';
	//     taTools.justifyRight.iconclass = 'icon-align-right';
	//     taTools.justifyCenter.iconclass = 'icon-align-center';
	//     taTools.clear.iconclass = 'icon-ban-circle';
	//     taTools.insertLink.iconclass = 'icon-link';
	//     // taTools.unlink.iconclass = 'icon-link red';
	//     taTools.insertImage.iconclass = 'icon-picture';
	//     // there is no quote icon in old font-awesome so we change to text as follows
	//     delete taTools.quote.iconclass;
	//     taTools.quote.buttontext = 'quote';
	//     return taTools;
	// }]);
    } ] );
