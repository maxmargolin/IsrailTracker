defaultTrain = 131;
defaultOrigin = 4600;
defaultTarget = 4900;

//ask permission to send notificaions
function askPermission() {
        return new Promise(function(resolve, reject) {
                        const permissionResult = Notification.requestPermission(function(result) {
                                resolve(result);
                        });

                        if (permissionResult) {
                                permissionResult.then(resolve, reject);
                        }
                })
                .then(function(permissionResult) {
                        if (permissionResult !== 'granted') {
                                throw new Error('We weren\'t granted permission.');
                                ask
                        }
                });
}


//send message with new configuration to the service worker
function updateTrainConfig(trainNumber, origin, target) {
        // ONE WAY COMMUNICATION
        if (navigator.serviceWorker.controller) {
                console.log("Sending train config service worker");
                navigator.serviceWorker.controller.postMessage({
                        "command": "oneWayCommunication",
                        "train": trainNumber,
                        "origin": origin,
                        "target": target
                });
        } else {
                console.log(navigator.serviceWorker.controller, "No active ServiceWorker");
        }
}

//send message to service worker asking to delet user from firebase
function unregisterMessage() {
        // ONE WAY COMMUNICATION
        if (navigator.serviceWorker.controller) {
                console.log("Sending unregister message to service worker");
                navigator.serviceWorker.controller.postMessage({
                        "command": "unregister"
                });
        } else {
                console.log(navigator.serviceWorker.controller, "unregister: No active ServiceWorker");
        }
}


// register background service worker to deal with all the ai stuff
function reg() {
        navigator.serviceWorker.register('sw.js', {
                        scope: ''
                })
                .then((regr) => {
                        // registration worked
                        console.log('Registration succeeded. Scope is ' + regr.scope);

                }).catch((error) => {
                        // registration failed
                        console.log('Registration failed with ' + error);
                });
}


// change cache
function updateCache() {
        localStorage['trainNumber'] = $("#trainNumber").val();
        localStorage['origin'] = $("#originSelect").val();
        localStorage['target'] = $("#targetSelect").val();
}

//update input boxes from cache fedaults
function updateFromCache() {
        $("#trainNumber").val(localStorage['trainNumber']);
        $("#originSelect").value = localStorage['origin'];
        $("#targetSelect").value = localStorage['target'];
}



function getStationPairs() {
        api_url = "https://israiltracker.firebaseapp.com/static_resources/stations.json"
        fetch(api_url)
                .then(res => res.json())
                .then((data) => {
                        var originSelect = document.getElementById("originSelect");
                        var targetSelect = document.getElementById("targetSelect");
                        for (var i in data["Stations"]["Station"]) {
                                station = data["Stations"]["Station"][i];
                                optionID = station["StationId"];
                                optionName = station["EngName"] + " " + station["DescriptionHe"] + " " + station["ArbName"];
                                originSelect.options[originSelect.options.length] = new Option(optionName, optionID, false, false);
                                targetSelect.options[targetSelect.options.length] = new Option(optionName, optionID, false, false);
                        }
                        originSelect.value = localStorage['origin'];
                        targetSelect.value = localStorage['target'];
                }).catch(err => console.error(err));
}


window.onload = function() {


          reg();
        getStationPairs();
        updateFromCache();

        $("#update").click(function() {
                updateTrainConfig($("#trainNumber").val(), $("#originSelect").val(), $("#targetSelect").val());
                updateCache();
        });
        $("#unregister").click(unregisterMessage);

        $("#allowNotifications").click(function() {
                askPermission();
        });


};
