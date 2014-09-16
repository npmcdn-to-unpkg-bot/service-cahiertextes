'use strict';

angular.module('cahierDeTexteApp')
    .controller('ImportCtrl',
		[ '$scope', '$http', '$upload', 'APP_PATH', 'Annuaire', 'User',
		  function ( $scope, $http, $upload, APP_PATH, Annuaire, User ) {
		      $scope.in_progress = false;
		      $scope.result = false;

		      $scope.fichiers = null;
		      $scope.launch_import = function( $files ) {
			  $scope.result = false;
			  //$files: an array of files selected, each file has name, size, and type.
			  for (var i = 0; i < $files.length; i++) {
			      var file = $files[i];
			      $scope.upload = $upload.upload({
				  url: APP_PATH + '/api/v1/import/pronote',
				  method: 'POST',
				  file: file
			      })
				  .progress( function( evt ) {
				      $scope.in_progress = true;
				      console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
				  })
				  .error( function() {
				      $scope.in_progress = false;
				  })
				  .success( function( data, status, headers, config ) {
				      $scope.in_progress = false;
				      $scope.result = data;

				      $scope.identifie_objet = function( mrpni ) {
					  $http.put( APP_PATH + '/api/v1/import/mrpni/' + mrpni.sha256 + '/est/' + mrpni.id_annuaire )
					      .success( function() {
						  mrpni.identified = true;
					      });
				      };
				      $scope.identifie_massivement_objets = function( mrpnis ) {
					  _(mrpnis).each( function( mrpni ) {
					      if ( !_(mrpni.id_annuaire).isNull() ) {
						  $scope.identifie_objet( mrpni );
					      }
					  } );
				      };

				      if ( !_($scope.result.rapport.matieres.error).isEmpty() ) {
					  Annuaire.get_matieres()
					      .then( function( response ) {
						  $scope.matieres = response.data;
					      } );
				      }
				      if ( !_($scope.result.rapport.enseignants.error).isEmpty() ) {
					  User.get_user().success( function ( response ) {
					      $scope.current_user = response;
					      Annuaire.get_etablissement_enseignants( $scope.current_user.profil_actif.uai )
						  .then( function( response ) {
						      $scope.enseignants = response.data;
						  } );
					  } );
				      }
				      if ( !_($scope.result.rapport.regroupements.Classe.error).isEmpty()
					   || !_($scope.result.rapport.regroupements.Groupe.error).isEmpty()
					   || !_($scope.result.rapport.regroupements.PartieDeClasse.error).isEmpty() ) {
					  User.get_user().success( function ( response ) {
					      $scope.current_user = response;
					      Annuaire.get_etablissement_regroupements( $scope.current_user.profil_actif.uai )
						  .then( function( response ) {
						      $scope.regroupements = response.data;
						  } );;
					  } );
				      }
				  });
			  }
		      };

		      $scope.onFileSelect = function( $files ) {
			  $scope.fichiers = $files;
		      };
		  } ] );
