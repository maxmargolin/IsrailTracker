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

window.onload = function() {
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
  });

};
