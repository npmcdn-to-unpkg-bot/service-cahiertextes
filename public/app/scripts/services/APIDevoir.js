'use strict';

angular.module('cahierDeTexteApp')
  .factory('APIDevoir', [ '$resource', function($resource) {
      return $resource( '/api/v0/devoir/:id',
			{ id: '@id' },
			{ update: { method: 'PUT' },
			  fait: { method: 'PUT',
				  url: '/api/v0/devoir/:id/fait' }});
  } ] );
