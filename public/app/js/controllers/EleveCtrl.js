'use strict';

angular.module( 'cahierDeTextesClientApp' )
    .controller('EleveCtrl',
		[ '$scope', '$state', '$stateParams', 'current_user',
		  function ( $scope, $state, $stateParams, current_user ) {
		      $scope.tabs = [ { heading: 'Emploi du temps',
					uisref: 'eleve.emploi_du_temps',
					css_class: 'glyphicon glyphicon-calendar',
					active: false },
				      { heading: 'Liste des devoirs',
					uisref: 'eleve.devoirs',
					css_class: 'glyphicon glyphicon-list',
					active: false } ];
		      _($scope.tabs).each( function( tab ) {
			  tab.active = tab.uisref == $state.current.name;
		      } );

		      $scope.current_user = current_user;

		      $scope.reload = function() {
			  $state.transitionTo( $state.current, $stateParams, { reload: true, inherit: true, notify: true } );
		      };
		  } ] );
