(function() {

    // var socket = io.connect();

    var app = angular.module("app", []);
    app.controller("AppCtrl", function($scope, $http) {
		devices = {};
		
		$scope.delete = function( device_id ) {
			var confirm_result = confirm( "Are you sure you want to delete this device?" );
			
			if( ! confirm_result )
				return;
			
			var elementId = "#" + device_id;

			var url = "/devices/delete/" + device_id;
			var params = {};
			
			$http.post( url, params ).then(
				function (response) {
					$( "#" + device_id ).remove();
				},
				function error(err) {
					alert( "Failed to delete device" );
				}
			);

		}
		
		$scope.toggle = function( device_id ) {
			var elementId = "#" + device_id;
			var power_state = $( elementId ).data( 'powered' );

			if( power_state == "0" ) {
				var url = "/devices/arm/" + device_id;
				var params = {};
				
				$http.post( url, params ).then(
					function (response) {
						$( "#" + device_id ).data( 'powered', 1 );
					},
					function error(err) {
						alert( "Failed to activate device" );
					}
				);
			} else if( power_state == 1 ) {
				var url = "/devices/unarm/" + device_id;
				var params = {};
			
				$http.post( url, params).then(
					function (response) {
						$( "#" + device_id ).data( 'powered', 0 );
					},
					function error(err) {
						alert( "Failed to deactivate device" );
					}
				);
			}
			
			$scope.updateDeviceStatus( device_id );
		}
		
		$scope.updateDeviceStatus = function( device_id ) {
			
			var stateUrl = "/devices/details/" + device_id;
			$http.get( stateUrl ).then(
				function( response ) {
					var elementId = "#" + device_id;
					$( elementId ).data( 'powered', response.data.state.powered );
				},
				function error( err ) {
					console.log( err );
				}
			);
		}
    });
})();