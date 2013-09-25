'use strict';

angular.module('cahierDeTexteApp')
    .controller('PrincipalEnseignantCtrl', [ '$scope', '$stateParams', 'EnseignantAPI', 'CoursAPI',
					     function ( $scope, $stateParams, EnseignantAPI, CoursAPI ) {
	$scope.enseignant_id = $stateParams.enseignant_id;
	$scope.classe = -1;

	$scope.process_data = function(  ) {
	    $scope.saisies = [];
	    if ( typeof $scope.raw_data !== 'undefined' ) {
		_.each( $scope.raw_data.saisies, function( m ) {
		    _.each( m, function ( e ) {
			if ( ( $scope.classe == -1 ) || ( e.classe_id == $scope.classe ) ) {
			    $scope.saisies.push( { classe: e.classe_id,
						   cours: e.cours,
						   devoir: e.devoir,
						   valide: e.valide,
						   cours_id: e.cours_id,
						   devoir_id: e.devoir_id } );
			}
		    } );
		} );
		if ( $scope.classe == -1 ) {
		    $scope.classes = _.uniq( $scope.saisies.map( function( e ) {
			return e.classe;
		    } ) );
		}
	    }
	};
	
	// Tableau
	$scope.gridEntries = {
	    data: 'saisies',
	    enableCellEdit: false,
	    plugins: [new ngGridFlexibleHeightPlugin()],
	    rowHeight: 60,
	    columnDefs: [
		{ field: 'classe', displayName: 'Classe' },
		{ field: 'cours', displayName: 'Cours', cellTemplate: '<span style="overflow-y:auto" ng-bind-html-unsafe="row.entity.cours">{{row.entity.cours}}</span>' },
		{ field: 'devoir', displayName: 'Travail à faire', cellTemplate: '<span style="overflow-y:auto" ng-bind-html-unsafe="row.entity.devoir">{{row.entity.devoir}}</span>' },
		{ field: 'validated', displayName: 'Validé',
		  // TODO: better
		  cellTemplate: '<div class="ngSelectionCell"><input tabindex="-1" class="ngSelectionCheckbox" type="checkbox" ng-model="row.entity.valide" ng-show="!row.entity.valide" ng-click="toggle_valide( {{row.entity.cours_id}} )" /><input tabindex="-1" class="ngSelectionCheckbox" type="checkbox" disabled checked ng-show="row.entity.valide" /></div>'}
	    ]
	};

	$scope.toggle_valide = function( cours_id ) {
	    CoursAPI.valide({ id: cours_id }, {});
	};

	$scope.validateAllEntries = function() {
	    _.each( $scope.saisies, function( e ) {
		CoursAPI.valide({ id: e.cours_id }, {});
		e.valide = true;
	    });
	};

	// Récupération et consommation des données
	EnseignantAPI.get( { enseignant_id: $scope.enseignant_id,
			     etablissement_id: '0134567A' },
			   function( response ) {
			       $scope.raw_data = response;
			       $scope.process_data();
			   } );
    } ] );
