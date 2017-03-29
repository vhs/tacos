var updateDeviceStates = function() {
	$( ".device-card" ).each( function( idx ) {
		var device_id = $( this ).attr( 'id' );
		var stateUrl = "/devices/details/" + device_id;
		$.get( stateUrl, function( response ) {
			$( "#" + device_id ).data( 'powered', response.state.powered );
			$( "#" + device_id ).data( 'last_seen', response.last_seen );
		});
	});
}


var updateTimeago = function() {
	$( ".timeago" ).each( function( idx ) {
		var device_id = $( this ).data( 'id' );
		var last_seen = $( "#" + device_id ).data( 'last_seen' );
		$( this ).html( $.timeago( parseInt( last_seen ) ) );
	});
}

var updatePowerStates = function() {
	$( ".powerstate" ).each( function( idx ) {
		var device_id = $( this ).data( 'id' );
		var power_state = $( "#" + device_id ).data( 'powered' );
		
		if( power_state == 0 ) {
			$( this ).html( "Unarmed" ).removeClass( "text-armed" );
		} else if( power_state == 1 ) {
			$( this ).html( "Armed" ).addClass( "text-armed" );
		}
	});
}

var updatePowerButtons = function() {
	$( ".powerbutton" ).each( function( idx ) {
		var device_id = $( this ).data( 'id' );
		var power_state = $( "#" + device_id ).data( 'powered' );
	
		if( power_state == 0 ) {
			$( this ).html( "Activate" ).removeClass( "btn-danger" ).addClass( "btn-success" );
		} else if( power_state == 1 ) {
			$( this ).html( "Unarm" ).addClass( "btn-danger" ).removeClass( "btn-success" );
		}
	});
}

var stateUpdates = function() {
	updateDeviceStates();
	updateTimeago();
	updatePowerStates();
	updatePowerButtons();
}

jQuery(document).ready(function() {
	stateUpdates();
	
	setInterval( function(){
		stateUpdates();
	}, 5000 );
	
	$( ".description-control" ).on( 'blur', function() {
		var device_id = $( this ).data( 'id' );
		var postUrl = "/devices/update/description/" + device_id;
		var params = { "description" : $( this ).val() };
		$.post( postUrl, params, function( response ) {
			if( ! response.result == "OK" )
				alert( "Something went wrong while updating the device description:\n" + response.message );
		});
	});
	
	$( ".role-control" ).on( 'blur', function() {
		var device_id = $( this ).data( 'id' );
		var postUrl = "/devices/update/role/" + device_id;
		var params = { "role" : $( this ).val() };
		$.post( postUrl, params, function( response ) {
			if( ! response.result == "OK" )
				alert( "Something went wrong while updating the device description:\n" + response.message );
		});
	});
	
	$( ".authentication-control" ).on( 'click', function() {
		var device_id = $( this ).data( 'id' );
		var postUrl = "/devices/update/hassecret/" + device_id;
		var params = { "hasSecret" : $( this ).is(':checked') };
		$.post( postUrl, params, function( response ) {
			if( ! response.result == "OK" )
				alert( "Something went wrong while updating the device description:\n" + response.message );
		});
	});
	
	$( ".terminal-description-control" ).on( 'blur', function() {
		var device_id = $( this ).data( 'id' );
		var postUrl = "/terminals/update/description/" + device_id;
		var params = { "description" : $( this ).val() };
		$.post( postUrl, params, function( response ) {
			if( ! response.result == "OK" )
				alert( "Something went wrong while updating the device description:\n" + response.message );
		});
	});
	
	$( ".secret-control" ).on( 'blur', function() {
		var device_id = $( this ).data( 'id' );
		var postUrl = "/terminals/update/secret/" + device_id;
		var params = { "secret" : $( this ).val() };
		$.post( postUrl, params, function( response ) {
			if( ! response.result == "OK" )
				alert( "Something went wrong while updating the device secret:\n" + response.message );
		});
	});
	
	$( ".target-control" ).on( 'blur', function() {
		var device_id = $( this ).data( 'id' );
		var postUrl = "/terminals/update/target/" + device_id;
		var params = { "target" : $( this ).val() };
		$.post( postUrl, params, function( response ) {
			if( ! response.result == "OK" )
				alert( "Something went wrong while updating the terminal target:\n" + response.message );
		});
	});
	
	$( ".terminal-enabled-control" ).on( 'click', function() {
		var device_id = $( this ).data( 'id' );
		var postUrl = "/terminals/update/enabled/" + device_id;
		var params = { "enabled" : $( this ).is(":checked") };
		$.post( postUrl, params, function( response ) {
			if( ! response.result == "OK" )
				alert( "Something went wrong while updating the terminal enabled state:\n" + response.message );
		});
	});
});