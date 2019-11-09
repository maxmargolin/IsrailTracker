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
function oneWayCommunication(trainNumber, origin, target) {
        // ONE WAY COMMUNICATION
        if (navigator.serviceWorker.controller) {
                console.log("Sending message to service worker");
                navigator.serviceWorker.controller.postMessage({
                        "command": "oneWayCommunication",
                        "train": trainNumber,
                        "origin": origin,
                        "target": target
                });
        } else {
                console.log(navigator.serviceWorker.controller, "No active ServiceWorker");
                reg();
        }
}


// register background service worker to deal with all the ai stuff
function reg() {
        navigator.serviceWorker.register('sw.js', {
                        scope: ''
                })
                .then((reg) => {
                        // registration worked
                        console.log('Registration succeeded. Scope is ' + reg.scope);

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

        getStationPairs();
        updateFromCache();

        $("#update").click(function() {
                navigator.serviceWorker.getRegistrations().then(
                        function(registrations) {
                                for (let registration of registrations) {
                                        registration.unregister();
                                }
                                reg();
                        });
                oneWayCommunication($("#trainNumber").val(), $("#originSelect").val(), $("#targetSelect").val());
                updateCache();
        });


        $("#allowNotifications").click(function() {
                askPermission();
        });


};
