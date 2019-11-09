lookingFor = 231;
origin = 4600;
target = 4900;
last_push = 0;

//standart time text
function zeroPadTime(number) {
        return mins = ('0' + number).slice(-2);
}

// handle push,run a loop for checking the israil api
pushEvenet = function(event) {
        console.log("in push event");
        info = "can't find train";
        lastDelay = -99

        function checker() {
                if (performance.now() - last_push < 8000) {
                        return -9;
                }
                last_push = performance.now();
                //standart time desplay
                var today = new Date();
                var year = today.getFullYear()
                var month = zeroPadTime(today.getMonth() + 1);
                var day = zeroPadTime(today.getDate());
                var hours = zeroPadTime(today.getHours());
                var minutes = zeroPadTime(today.getMinutes());
                var seconds = zeroPadTime(today.getSeconds());


                var time = hours + ":" + minutes + ":" + seconds;
                //get train delay data
                api_url = 'https://www.rail.co.il/apiinfo/api/Plan/GetRoutes?OId=' + origin + '&TId=' + target + '&Date=' + year + month + day + '&Hour=' + hours + minutes;

                console.log(lookingFor, " @ ", api_url);
                fetch(api_url)
                        .then(res => res.json())
                        .then((data) => {
                                for (var i in data["Data"]["TrainPositions"]) {
                                        var train = data["Data"]["TrainPositions"][i];
                                        if (train["TrainNumber"] == lookingFor) {
                                                currentDelay = train["DifMin"];

                                                title = train["DifType"] + ": " + currentDelay + " min";
                                                info = "For train " + train["TrainNumber"] + "\nAs of [ " + time + "]";
                                                if (train["DifType"] != "DELAY") {
                                                        info = "no delay";
                                                } else if (lastDelay != currentDelay) {
                                                        lastDelay = train["DifMin"];
                                                        console.log(title + " " + info);
                                                        const title = "Delay: " + currentDelay;
                                                }
                                                const options = {
                                                        body: info,
                                                        silent: true,
                                                        icon: 'icon.png',
                                                        tag: 'report'
                                                }

                                                self.registration.showNotification(title, options);
                                        }
                                }
                        }).catch(err => console.error(err));
        }
        setInterval(checker, 10000)
};


self.addEventListener('push', pushEvenet);

//make a push happen, shock the service worker to life
function TriggerPush() {
        pushTrigger = new Event('push');
        self.dispatchEvent(pushTrigger);
}

//on install of service worker,trigger a push
self.addEventListener('install', (event) => {
        console.log("in install event");
        event.waitUntil(self.skipWaiting());
        TriggerPush();
});

self.addEventListener('activate', function(event) {
        event.waitUntil(self.clients.claim()); // Become available to all pages
});



//on message from main page
self.addEventListener('message', function(event) {
        console.log("in message event");
        var data = event.data;

        if (data.command == "oneWayCommunication") {
                lookingFor = data.train;
                origin = data.origin;
                target = data.target;
                console.log("new confic received in service worker",lookingFor, origin, target);
                self.registration.showNotification("configuration pdated 👀", {
                        body: (lookingFor + " " + origin + " " + target)
                });
        } else {
                console.log("strage communication protocol");
        }
        TriggerPush();
});
