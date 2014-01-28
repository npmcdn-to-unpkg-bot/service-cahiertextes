'use strict';

angular.module('cahierDeTexteApp')
  .factory('Matieres',
	   [ '$resource',
	     function( $resource ) {
		 return $resource( '/api/v0/annuaire/matieres/:matiere_id',
				   { matiere_id: '@matiere_id' } );
	     } ] );

angular.module('cahierDeTexteApp')
  .factory('Regroupements',
	   [ '$resource',
	     function( $resource ) {
		 return $resource( '/api/v0/annuaire/regroupements/:regroupement_id',
				   { regroupement_id: '@regroupement_id' } );
	     } ] );

angular.module('cahierDeTexteApp')
  .factory('Users',
	   [ '$resource',
	     function( $resource ) {
		 return $resource( '/api/v0/annuaire/users/:user_id',
				   { user_id: '@user_id' } );
	     } ] );

angular.module('cahierDeTexteApp')
    .service('Annuaire',
	     [ 'Matieres', 'Regroupements', 'Users',
	       function( Matieres, Regroupements, Users ) {
		   this.get_matiere = _.memoize( function( matiere_id ) {
		       return Matieres.get({ matiere_id: matiere_id }).$promise;
		   });

		   this.get_regroupement = _.memoize( function( regroupement_id ) {
		       return Regroupements.get({ regroupement_id: regroupement_id }).$promise;
		   });

		   this.get_user = _.memoize( function( user_id ) {
		       return Users.get({ user_id: user_id }).$promise;
		   });
	       }
	     ] );
