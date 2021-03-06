'use strict';

angular.module( 'cahierDeTextesClientApp' )
// https://stackoverflow.com/a/18609594/144263
    .factory( 'RecursionHelper',
	      [ '$compile',
		function( $compile ){
		    return {
			/**
			 * Manually compiles the element, fixing the recursion loop.
			 * @param element
			 * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
			 * @returns An object containing the linking functions.
			 */
			compile: function(element, link){
			    // Normalize the link parameter
			    if( angular.isFunction( link ) ) {
				link = { post: link };
			    }

			    // Break the recursion loop by removing the contents
			    var contents = element.contents().remove();
			    var compiledContents;
			    return {
				pre: (link && link.pre) ? link.pre : null,
				/**
				 * Compiles and re-adds the contents
				 */
				post: function( scope, element ){
				    // Compile the contents
				    if ( !compiledContents ) {
					compiledContents = $compile( contents );
				    }
				    // Re-add the compiled contents to the element
				    compiledContents( scope, function( clone ) {
					element.append(clone);
				    } );

				    // Call the post-linking function, if any
				    if( link && link.post ) {
					link.post.apply( null, arguments );
				    }
				}
			    };
			}
		    };
		}])
    .directive( 'cartable',
		[ 'RecursionHelper',
		  function( RecursionHelper ) {
		      return {
			  scope: {
			      racine: '=racine',
			      target: '=target',
			      regroupement: '=regroupement',
			      addCallback: '=addCallback'
			  },
			  replace: true,
			  controller: [ '$scope', '$sce', 'DOCS_URL', 'Documents',
					function( $scope, $sce, DOCS_URL, Documents ) {
					    $scope.getChildren = function( noeud ) {
						Documents.list_files( noeud.hash ).then( function ( response ) {
						    noeud.children = _( response.data.files ).rest();
						} );
					    };

					    $scope.add_ressource_to_target = function( target, node, regroupement ) {
						if ( target.ressources === undefined ) {
						    target.ressources = [];
						}
						if ( _( target.ressources ).findWhere( { hash: node.hash } ) === undefined ) {
						    Documents.ajout_au_cahier_de_textes( regroupement, node.hash )
							.success( $scope.addCallback( target ) )
							.error( function ( response ) {
							    console.debug( response.error );
							} );
						}
					    };

					    $scope.add_ressource_already_in_CT_to_target = function( target, node ) {
						target.ressources.push( {
						    name: node.name,
						    hash: node.hash,
						    url: $sce.trustAsResourceUrl( DOCS_URL + '/api/connector?cmd=file&target=' + node.hash )
						} );
					    };
					}
				      ],
			  template: ' \
<ul class="cartable"> \
  <li data-ng-repeat="node in racine" \
      data-ng-class="{\'disabled\': node.name == \'Cahier de textes.ct\'}" \
      style="list-style-type: none"> \
    <span class="glyphicon" \
	  data-ng-class="{\'glyphicon-folder-open\': node.children, \'glyphicon-folder-close\': !node.children}" \
	  data-ng-if="node.mime ==  \'directory\'" \
			  data-ng-click="getChildren( node )"> \
			  {{node.name}} <span data-ng-if="node.mime !=  \'directory\'">({{node.mime}})</span> \
			  </span> \
			      <button class="btn btn-sm btn-success from-docs" \
			  style="padding-top: 0; padding-bottom: 0" \
			  data-ng-if="node.mime != \'directory\'" \
			  data-ng-click="add_ressource_to_target( target, node, regroupement )"> \
      <span class="glyphicon glyphicon-plus"></span> \
    </button> \
    <button class="btn btn-sm btn-success from-ct" \
			  style="padding-top: 0; padding-bottom: 0" \
			  data-ng-if="node.mime != \'directory\'" \
			  data-ng-click="add_ressource_already_in_CT_to_target( target, node )"> \
      <span class="glyphicon glyphicon-plus"></span> \
    </button> \
			      <span class="glyphicon glyphicon-file" data-ng-if="node.mime != \'directory\'"> \
			  {{node.name}} <span data-ng-if="node.mime !=  \'directory\'">({{node.mime}})</span> \
			  </span> \
			      <div cartable \
	 data-ng-if="node.mime ==  \'directory\'" \
	 data-racine="node.children" \
	 data-target="target" \
	 data-regroupement="regroupement" \
	 data-add-callback="addCallback"> \
    </div> \
  </li> \
</ul>',
			  compile: RecursionHelper.compile
		      };
		  } ] );
