var functions = require('firebase-functions');
var admin = require('firebase-admin');
 
admin.initializeApp(functions.config().firebase);


exports.enteredBus = functions.database.ref('/users/{user}/bus')
        .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        var bus =event.data.val();
        var user=event.params.user;
        console.log(user);
        console.log("entrou no autocarro "+bus);
        event.data.ref.parent.parent.child(user).child('coordenadas').once("value",function(data)
        	{event.data.ref.parent.parent.parent.child('bus').child(bus).child("passageiros").child(user).set(data.val())});
        });

exports.setBusLocation=functions.database.ref('/bus/{Nbus}/passageiros')
		.onWrite(event => {
			var nbus=event.params.Nbus;
			console.log("autocarro "+nbus);
			console.log(event.data.val());

		});