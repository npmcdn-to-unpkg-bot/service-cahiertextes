'use strict';

angular.module( 'cahierDeTextesClientApp' )
    .controller('CahierDeTextesCtrl',
		[ '$scope', '$sce', '$q', '$stateParams', 'APP_PATH', 'DOCS_URL', 'API', 'Annuaire', 'EmploisDuTemps', 'current_user', 'PopupsCreneau', 'CreneauEmploiDuTemps',
		  function ( $scope, $sce, $q, $stateParams, APP_PATH, DOCS_URL, API, Annuaire, EmploisDuTemps, current_user, PopupsCreneau, CreneauEmploiDuTemps ) {
		      $scope.current_user = current_user;

		      var matieres = [];
		      var matieres_enseignees = [];
		      var popup_ouverte = false;
		      $scope.scope = $scope;
		      $scope.selected_regroupement_id = null;
		      $scope.selected_creneau_vide = null;

		      $scope.complet = false;
		      // FIXME: double appel à l'API
		      $scope.$watch( 'complet', function() {
			  $scope.retrieve_data();
		      } );

		      var filter_creneaux_avec_saisies = function( raw_data ) {
			  return _.chain(raw_data)
			      .filter( function( creneau ) {
				  return creneau.enseignant_id === $scope.current_user.uid;
			      } )
			      .reject( function( creneau ) {
				  return _(creneau.cours).isEmpty() && _(creneau.devoirs).isEmpty();
			      })
			      .map( function( creneau ) {
				  creneau.devoirs.ouvert = true;
				  return creneau;
			      })
			      .value();
		      };
		      var filter_creneaux_vides = function( raw_data ) {
			  return _.chain(raw_data)
			      .filter( function( creneau ) {
				  return creneau.enseignant_id === $scope.current_user.uid;
			      } )
			      .filter( function( creneau ) {
				  return _(creneau.cours).isEmpty();
			      })
			      .value();
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

		      $scope.period_offset = $scope.current_user.date ? moment.duration( moment() - moment( $scope.current_user.date ) ).months() : 0;

		      // $scope.retrieve_data() when the value of week_offset changes
		      // n.b.: triggered when week_offset is initialized above
		      var nb_mois_depuis_septembre = Math.abs( 9 - ( moment().month() + 1 ) );
		      $scope.period_offsets_list = _.range( nb_mois_depuis_septembre,
							    ( 10 - nb_mois_depuis_septembre ) * -1,
							    -1 )
			  .map( function( offset ) {
			      return { offset: offset,
				       label: offset == 0 ? 'ce mois' : moment().add( offset * -1, 'months' ).fromNow() };
			  } );
		      $scope.period_offsets_list.push( { offset: 9999,
							 label: 'année complète'} );

		      $scope.$watch( 'period_offset', function() {
			  $scope.complet = $scope.period_offset == 9999;
			  $scope.retrieve_data();
		      } );

		      $scope.incr_offset = function() {
			  $scope.period_offset++;
		      };
		      $scope.decr_offset = function() {
			  $scope.period_offset--;
		      };
		      $scope.reset_offset = function() {
			  $scope.period_offset = 0;
		      };

		      $scope.retrieve_data = function() {
			  if ( $scope.complet ) {
			      var now = moment();
			      $scope.from_date = moment();
			      $scope.to_date = moment();
			      if ( now.month() + 1 > 8 ) {
				  $scope.from_date.set( 'year', now.year() );
				  $scope.to_date.set( 'year', now.year() + 1 );
			      } else {
				  $scope.from_date.set( 'year', now.year() - 1);
				  $scope.to_date.set( 'year', now.year() );
			      }
			      $scope.from_date.set( 'month', 8 );
			      $scope.from_date.set( 'date', 1 );
			      $scope.to_date.set( 'month', 7 );
			      $scope.to_date.set( 'date', 1 );

			      $scope.from_date = $scope.from_date.toDate();
			      $scope.to_date = $scope.to_date.toDate();
			  } else {
			      $scope.current_user.date = moment().subtract( $scope.period_offset, 'months' ).toDate();

			      $scope.from_date = moment( $scope.current_user.date ).subtract( 2, 'weeks' ).startOf( 'week' ).toDate();
			      $scope.to_date = moment( $scope.current_user.date ).add( 2, 'weeks' ).endOf( 'week' ).toDate();
			  }

			  EmploisDuTemps.query( { debut: $scope.from_date,
						  fin: $scope.to_date,
						  uai: $scope.current_user.profil_actif.etablissement_code_uai } )
			      .$promise
			      .then( function success( response ) {
				  $scope.raw_data = response;
				  matieres = list_matieres( $scope.raw_data );

				  _($scope.raw_data).each( function( creneau ) {
				      creneau.matiere = Annuaire.get_matiere( creneau.matiere_id );
				      creneau.regroupement = Annuaire.get_regroupement( creneau.regroupement_id );
				  });

				  $scope.creneaux_vides = filter_creneaux_vides( $scope.raw_data );

				  $scope.creneaux_saisies = filter_creneaux_avec_saisies( $scope.raw_data );
				  _($scope.creneaux_saisies).each( function( creneau ) {
				      if ( !_(creneau.cours).isNull() ) {
					  _(creneau.cours.ressources).each( function( ressource ) {
					      ressource.url = $sce.trustAsResourceUrl( DOCS_URL + '/api/connector?cmd=file&target=' + ressource.hash );
					  } );
				      }
				      _(creneau.devoirs).each( function( devoir ) {
					  _(devoir.ressources).each( function( ressource ) {
					      ressource.url = $sce.trustAsResourceUrl( DOCS_URL + '/api/connector?cmd=file&target=' + ressource.hash );
					  } );
				      } );
				  } );

				  $scope.selected_creneau_vide = null;
			      });
		      };
		      $scope.popup_callback = $scope.retrieve_data;

		      $scope.edition_creneau = function ( event ) {
			  CreneauEmploiDuTemps.get( { id: event.creneau_emploi_du_temps_id } )
			      .$promise
			      .then( function( creneau_selectionne ) {
				  creneau_selectionne.dirty = false;
				  creneau_selectionne.en_creation = false;
				  creneau_selectionne.heure_debut = new Date( event.start );
				  creneau_selectionne.heure_fin = new Date( event.end );
				  creneau_selectionne.regroupement_id = event.regroupement_id;

				  PopupsCreneau.edition( $scope.raw_data,
							 matieres_enseignees, $scope.classes,
							 creneau_selectionne, event.cours, event.devoirs,
							 $scope.popup_callback, popup_ouverte );
			      } );
		      };
		      matieres_enseignees = $scope.current_user.profil_actif.matieres;
		      $scope.classes = $scope.current_user.profil_actif.classes;

		      angular.element('#ui-view-content').after( current_user.marqueur_xiti );
		  } ] );
