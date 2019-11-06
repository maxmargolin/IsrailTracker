lookingFor = 231;
origin = 4600;
target = 3900;

function zeroPadTime(number) {
        return mins = ('0' + number).slice(-2);
}


pushEvenet = function(event) {
        info = "can't find train";
        lastDelay = -99

        function checker() {
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
                console.log(api_url);
                fetch(api_url)
                        .then(res => res.json())
                        .then((data) => {
                                console.log("lookin in json for details for train number" + lookingFor);
                                for (var i in data["Data"]["TrainPositions"]) {
                                        var train = data["Data"]["TrainPositions"][i];
                                        if (train["TrainNumber"] == lookingFor) {
                                                currentDelay = train["DifMin"];
                                                info = "train " + train["TrainNumber"] + " , diff type: " + train["DifType"] + " " + currentDelay + " min as of [ " +
                                                        time + "]";
                                                if (train["DifType"] != "DELAY") {
                                                        info = "no delay";
                                                } else if (lastDelay != currentDelay) {
                                                        console.log(info);
                                                        const title = "Delay: " + currentDelay;
                                                        const options = {
                                                                body: info
                                                        };
                                                        self.registration.showNotification(title, options);
                                                } else {
                                                        console.log("no change,no notification @ " + time);
                                                }
                                                lastDelay = train["DifMin"];
                                        }
                                }
                        }).catch(err => console.error(err));

        }
        setInterval(checker, 30000)

};


self.addEventListener('push', pushEvenet);

self.addEventListener('install', (event) => {
        event.waitUntil(self.skipWaiting());
        pushTrigger = new Event('push');
        self.dispatchEvent(pushTrigger);
});
self.addEventListener('activate', function(event) {
        event.waitUntil(self.clients.claim()); // Become available to all pages
});


self.addEventListener('message', function(event) {
        var data = event.data;

        if (data.command == "oneWayCommunication") {
                lookingFor = data.train;
                origin = data.origin;
                target = data.target;
        }
        self.registration.showNotification("msg", options = {});
});
