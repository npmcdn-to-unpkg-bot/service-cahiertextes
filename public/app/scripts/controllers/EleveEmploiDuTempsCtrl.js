'use strict';

angular.module('cahierDeTexteApp')
    .controller('EleveEmploiDuTempsCtrl',
		[ '$scope', '$rootScope', '$modal', 'EmploisDuTemps', 'Matieres',
		  function ( $scope, $rootScope, $modal, EmploisDuTemps, Matieres ) {
		      $scope.matieres = {};

		      // configuration du composant calendrier
		      $scope.calendar = { options: $rootScope.globalCalendarOptions,
					  events: [  ] };
		      $scope.calendar.options.defaultView = 'agendaWeek';
		      $scope.calendar.options.height = 600;
		      $scope.calendar.options.editable = false;
		      $scope.calendar.options.header = { left: 'title',
							 center: 'agendaDay agendaWeek month',
							 right: 'today prev,next' };
		      // TODO: serait-il possible d'utiliser un template à la place de cette série de concaténations ?
		      $scope.calendar.options.eventRender = function( event, element ) {
			  if ( $scope.emploi_du_temps.fullCalendar( 'getView' ).name == 'agendaDay') {
			      if ( _(event.details.cours).size() > 0 ) {
				  var contenu_cellule = '<div class="cdt-agendaDay-container col-md-12">';
				  contenu_cellule += '  <div class="cdt-agendaDay-event col-md-12">';
				  contenu_cellule += '    <button type="button" disabled class="btn btn-primary btn-xs col-md-1">' + event.title + '</button>';
				  contenu_cellule += '    <div id="cours' + event.details.cours.id + '" class="col-md-4 cdt-agendaDay-cours">';
				  contenu_cellule += event.details.cours.contenu;
				  contenu_cellule += '    </div>';

				  if ( _(event.details.devoir).size() > 0 ) {
				      contenu_cellule += '    <span class="col-md-1">Taf <span class="glyphicon glyphicon-chevron-right"></span></span>';
				      contenu_cellule += '    <span class="col-md-1"><span class="glyphicon glyphicon-chevron-left"> Cours</span></span>';
				      contenu_cellule += '    <div id="devoir' + event.details.devoir.id + '" class="col-md-5 ';
				      contenu_cellule += ( event.details.devoir.fait ) ? 'cdt-agendaDay-devoir-fait' : 'cdt-agendaDay-devoir';
				      contenu_cellule += '">';
				      contenu_cellule += event.details.devoir.contenu;
				      contenu_cellule += '    </div>';
				  }
				  contenu_cellule += '  </div>';
				  contenu_cellule += '</div>';
				  element.find('.fc-event-title').html( contenu_cellule );
			      }
			  } else  {
			      element.find('.fc-event-title').append( event.description );
			  }
		      };
		      $scope.calendar.options.eventClick = function( event ) {
			  $scope.creneau = _(event.source.events).findWhere({_id: event._id});
			  $scope.matiere = event.title;
			  $scope.cours = $scope.creneau.details.cours;
			  if ( _($scope.cours).size() > 0 ) {
			      $scope.devoir = $scope.creneau.details.devoir;
			      $scope.affiche_details(  );
			  }
		      };

		      // popup d'affichage des détails
		      $scope.cours = {};
		      $scope.devoir = {};
		      $scope.affiche_details = function(  ) {
			  $modal.open({ templateUrl: 'views/modals/eleve/detail_emploi_du_temps.html',
					controller: modalInstanceCtrl,
					resolve: { matiere: function() { return $scope.matiere; },
						   cours: function() { return $scope.cours; },
						   devoir: function() { return $scope.devoir; } } })
			      .result.then( function ( fait ) {
				  if ( fait != -1 ) {
				      $scope.creneau.color = fait ? $rootScope.theme.calendar.devoir_fait : $rootScope.theme.calendar.devoir;
				  }
				  $scope.emploi_du_temps.fullCalendar( 'renderEvent', $scope.creneau );
			      });
		      };

		      var modalInstanceCtrl = function( $scope, $modalInstance, Devoirs, matiere, cours, devoir ) {
			  $scope.matiere = matiere;
			  $scope.cours = cours;
			  $scope.devoir = devoir;

			  $scope.fait = function() {
			      Devoirs.fait({ id: devoir.id },
					     function() { devoir.fait = true; });
			  };

			  $scope.fermer = function() {
			      $modalInstance.close( ( _(devoir).size() > 0 ) ? devoir.fait : -1 );
			  };
		      };

		      $scope.assemble_fullCalendar_event = function( item_emploi_du_temps ) {
			  var calendar_event = { details: { cours: item_emploi_du_temps.cours,
							    devoir: item_emploi_du_temps.devoir },
						 allDay: false,
						 title: '',
						 description: '',
						 start: new Date( item_emploi_du_temps.start ),
						 end: new Date( item_emploi_du_temps.end ),
						 color: '' };

			  // choix de la couleur
			  if ( _(item_emploi_du_temps.cours).size() > 0 ) {
			      if ( _(item_emploi_du_temps.devoir).size() > 0 ) {
				  if ( item_emploi_du_temps.devoir.fait ) {
				      calendar_event.color = $rootScope.theme.calendar.devoir_fait;
				  } else {
				      calendar_event.color = $rootScope.theme.calendar.devoir;
				  }
			      } else {
				  calendar_event.color = $rootScope.theme.calendar.saisie;
			      }
			  } else {
			      calendar_event.color = $rootScope.theme.calendar.vide;
			  }

			  // composition de la description
			  if ( _(item_emploi_du_temps.cours).size() > 0 ) {
			      calendar_event.description += '<br><span style="color:' + $rootScope.calendar.couleurs.cours + '">';
			      calendar_event.description += item_emploi_du_temps.cours.contenu.substring( 0, $rootScope.calendar.cours_max_length );
			      calendar_event.description += item_emploi_du_temps.cours.contenu.length > $rootScope.calendar.cours_max_length ? '…' : '';
			      calendar_event.description += '</span>';
			      if ( _(item_emploi_du_temps.devoir).size() > 0 ) {
				  calendar_event.description += '<br><span style="color:' + $rootScope.calendar.couleurs.devoir + '">';
				  calendar_event.description += item_emploi_du_temps.devoir.contenu.substring( 0, $rootScope.calendar.devoir_max_length );
				  calendar_event.description += item_emploi_du_temps.devoir.contenu.length > $rootScope.calendar.devoir_max_length ? '…' : '';
				  calendar_event.description += '</span>';
			      }
			  }
			  
			  // composition du titre
			  if ( $scope.matieres[ item_emploi_du_temps.matiere_id ] === undefined ) {
			      $scope.matieres[ item_emploi_du_temps.matiere_id ] = Matieres.get({ matiere_id: item_emploi_du_temps.matiere_id }).$promise;
			  }
			  $scope.matieres[ item_emploi_du_temps.matiere_id ].then( function success( response ) {
			      calendar_event.title = response.libelle_long;
			  });
			  
			  return calendar_event;
		      };

		      // population des créneaux d'emploi du temps avec les cours et devoirs éventuels
		      EmploisDuTemps.query( function( response ) {
			  $scope.calendar.events.push( response.map( function( event ) {
			      return $scope.assemble_fullCalendar_event( event );
			  } ) );
		      });
		  } ] );