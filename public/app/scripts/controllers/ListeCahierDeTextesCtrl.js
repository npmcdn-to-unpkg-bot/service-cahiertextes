'use strict';

angular.module('cahierDeTexteApp')
    .controller('ListeCahierDeTextesCtrl',
		[ '$scope', '$modal', '$q', 'APP_PATH', 'API', 'Annuaire', 'EmploisDuTemps', 'User', 'CreneauEmploiDuTemps',
		  function ( $scope, $modal, $q, APP_PATH, API, Annuaire, EmploisDuTemps, User, CreneauEmploiDuTemps ) {
		      var matieres = [];
		      var matieres_enseignees = [];
		      $scope.selected_regroupement_id = null;
		      $scope.selected_creneau_vide = null;

		      // popup d'édition
		      var ouvre_popup_edition = function ( raw_data, matieres, classes, creneau, cours, devoirs, popup_callback ) {
			  $modal.open( {
			      templateUrl: APP_PATH + '/app/views/enseignant/edition_emploi_du_temps.html',
			      controller: 'EmploiDuTempsPopupEditionCtrl',
			      resolve: {
				  raw_data	: function () { return raw_data; },
				  matieres	: function () { return matieres; },
				  classes	: function () { return classes; },
				  creneau	: function () { return creneau; },
				  cours		: function () { return cours; },
				  devoirs	: function () { return devoirs; }
			      }
			  } )
			      .result.then( // éxécuté à la fermeture de la popup
				  function ( scope_popup ) {
				      // appel du callback
				      popup_callback( scope_popup );
				  } );
		      };

		      $scope.edition_creneau = function ( event ) {
			  CreneauEmploiDuTemps.get( { id: event.creneau_emploi_du_temps_id } )
			      .$promise
			      .then( function( creneau_selectionne ) {
				  creneau_selectionne.dirty = false;
				  creneau_selectionne.heure_debut = new Date( event.start );
				  creneau_selectionne.heure_fin = new Date( event.end );
				  creneau_selectionne.regroupement_id = event.regroupement_id;

				  ouvre_popup_edition( $scope.raw_data,
						       matieres_enseignees, $scope.classes,
						       creneau_selectionne, event.cours, event.devoirs,
						       retrieve_data );
			      } );
		      };

		      var filter_class = function( data, selected_regroupement_id ) {
			  // Filtrage sur une seule classe
			  if ( ! _(selected_regroupement_id).isNull() ) {
			      data = _( data ).filter( function( creneau ) {
				  return creneau.regroupement_id == selected_regroupement_id;
			      } );
			  }
			  return data;
		      };

		      var filter_creneaux_avec_saisies = function( raw_data ) {
			  var filtered_data = _.chain(raw_data)
				  .filter( function( creneau ) {
				      return creneau.enseignant_id === $scope.current_user.uid;
				  } )
				  .reject( function( creneau ) {
				      return _(creneau.cours).isEmpty();
				  })
				  .uniq( function( creneau ) {
				      return creneau.creneau_emploi_du_temps_id;
				  })
				  .map( function( creneau ) {
				      creneau.devoirs.ouvert = false;
				      return creneau;
				  })
				  .value();

			  return filtered_data;
		      };

		      var filter_creneaux_vides = function( raw_data ) {
			  var filtered_data = _.chain(raw_data)
				  .filter( function( creneau ) {
				      return creneau.enseignant_id === $scope.current_user.uid;
				  } )
				  .filter( function( creneau ) {
				      return _(creneau.cours).isEmpty();
				  })
				  .uniq( function( creneau ) {
				      return creneau.creneau_emploi_du_temps_id;
				  })
				  .value();

			  return filtered_data;
		      };

		      $scope.refresh_data = function() {
			  $scope.creneaux_saisies = filter_class( filter_creneaux_avec_saisies( $scope.raw_data ), $scope.selected_regroupement_id );
			  $scope.creneaux_vides = filter_class( filter_creneaux_vides( $scope.raw_data ), $scope.selected_regroupement_id );
			  $scope.selected_creneau_vide = null;
		      };

		      var list_matieres = function(raw_data) {
			  return _.chain(raw_data)
			      .pluck('matiere_id')
			      .uniq()
			      .compact()
			      .reject( function( id ) { return id === 'undefined'; } )
			      .map(function(matiere_id) {
				  return [ matiere_id, Annuaire.get_matiere( matiere_id ) ];
			      })
			      .object()
			      .value();
		      };

		      $scope.week_offset = 0;

		      // retrieve_data() when the value of week_offset changes
		      // n.b.: triggered when week_offset is initialized above
		      $scope.$watch( 'week_offset', function() {
			  retrieve_data();
		      } );

		      $scope.incr_week_offset = function() {
			  $scope.week_offset++;
		      };
		      $scope.decr_week_offset = function() {
			  $scope.week_offset--;
		      };
		      $scope.reset_week_offset = function() {
			  $scope.week_offset = 0;
		      };

		      var retrieve_data = function() {
			  $scope.from_date = moment().startOf( 'week' ).subtract( 'days', $scope.week_offset * 7 ).toDate();
			  $scope.to_date = moment().endOf( 'week' ).subtract( 'days', $scope.week_offset * 7 ).toDate();
			  EmploisDuTemps.query( { debut: $scope.from_date,
						  fin: $scope.to_date,
						  uai: $scope.current_user.profil_actif.uai } )
			      .$promise
			      .then( function success( response ) {
				  $scope.raw_data = response;
				  matieres = list_matieres( $scope.raw_data );

				  _($scope.raw_data).each( function( creneau ) {
				      creneau.matiere = Annuaire.get_matiere( creneau.matiere_id );
				      creneau.regroupement = Annuaire.get_regroupement( creneau.regroupement_id );
				  });
				  $scope.refresh_data();
			      });
		      };

		      User.get_user().then( function( response ) {
			  $scope.current_user = response.data;

			  matieres_enseignees = $scope.current_user.profil_actif.matieres;
			  $scope.classes = $scope.current_user.profil_actif.classes;
		      } );
		  } ] );
