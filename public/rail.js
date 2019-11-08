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
                console.log("No active ServiceWorker");
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
        localStorage['trainNumber'] = $("#trainNumber").val()
        localStorage['origin'] = $("#origin").val()
        localStorage['target'] = $("#target").val()
}

//update input boxes from cache fedaults
function updateFromCache() {
        $("#trainNumber").val(localStorage['trainNumber']);
        $("#origin").val(localStorage['origin']);
        $("#target").val(localStorage['target']);
}



window.onload = function() {
        updateFromCache();
        askPermission();
        $("#update").click(function() {
                navigator.serviceWorker.getRegistrations().then(
                        function(registrations) {
                                for (let registration of registrations) {
                                        registration.unregister();
                                        reg();
                                }
                        });
                oneWayCommunication($("#trainNumber").val(), $("#origin").val(), $("#target").val());
                updateCache();
        });


};
