var functions = require('firebase-functions');
var admin = require('firebase-admin');
 
admin.initializeApp(functions.config().firebase);


exports.enteredBus = functions.database.ref('/users/{user}/bus')
        .onWrite(event => {
        var bus =event.data.val();
        var user=event.params.user;
        console.log(user);
        console.log("entrou no autocarro "+bus);
        if(bus==null){
        	console.log("enteredBus Vazio");
        	return;
        }
        event.data.ref.parent.parent.child(user).child('coordenadas').once("value",function(data)
        	{event.data.ref.parent.parent.parent.child('bus').child(bus).child("passageiros").child(user).set(data.val())
        	event.data.ref.parent.parent.parent.child("bus").child(bus).child("vazio").set(false)
        });
        });


exports.userChangeLocation=functions.database.ref('/users/{user}/coordenadas')
        .onWrite(event => {
        var user=event.params.user;
        console.log("user "+user);
        var aux = admin.database().ref("users").child(user);
        aux.once("value").then(function(snapshot) {
        	if (!snapshot.child("bus").exists()) {
        		return;}
        	var coordenadas=event.data.val();
        	var bus=snapshot.child("bus").val();
        	var auxRef = admin.database().ref('bus').child(bus).child("passageiros").child(user).set(coordenadas);
        	});
        });

exports.exitBus=functions.database.ref('/users/{user}/bus')
     .onWrite(event => {
        var user=event.params.user;
        var previousBus=event.data.previous.val();
        if(previousBus==null){
        	console.log("exitBus Vazio");
        	return;
        }
        console.log("user "+user);
        console.log("previusBus "+previousBus);
        var auxRef = admin.database().ref('bus').child(previousBus).child("passageiros").child(user).remove()
			.then(function() {
				console.log("Remove succeeded.")
			})
			.catch(function(error) {
				console.log("Remove failed: " + error.message)
			});
		if(!admin.database().ref('bus').child(previousBus).child("passageiros").exists){
			admin.database().ref('bus').child(previousBus).child("vazio").set(true);
			admin.database().ref("bus").child(previousBus).child("coordenadas").set(null);
		}
        });

exports.teste=functions.database.ref("/bus/{Bus}/passageiros")
	.onWrite(event=> {
		var bus=event.params.Bus;
		event.data.ref.orderByValue().on("value",function(snapshot){
			var count=snapshot.numChildren();
			var totalLatitude=0;
			var totalLongitude=0;
			if(count==0){
				return;
			}
			snapshot.forEach(function(userCoo) {
				totalLatitude+=userCoo.val().latitude;
				totalLongitude+=userCoo.val().longitude;
			});
			var newCoordinates={latitude:totalLatitude/count, longitude:totalLongitude/count};
			return admin.database().ref("bus").child(bus).child("coordenadas").set(newCoordinates);
		})

});

	