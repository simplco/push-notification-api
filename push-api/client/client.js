var publicKey;
var subscription;
var subscribeOptions;
// if('serviceWorker' in navigator)
//     subscribe().catch(err => console.log(err));

$.ajax({ //simple ajax call once the web page is first loaded. Retrieves publicKey from backend
    url: '/publickey',
    type: 'GET',
    success: function (data) {
        publicKey = data.publickey;
        subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
        };
    }
});
async function subscribe() { //Registers and subscribes service-worker.js to client's browser. Sends this subscription to the backend,
                             //and tells the backend to begin the timer of when to send the web-push notification
    if ('serviceWorker' in navigator) { //does the client's browser support service workers?
        const register = await navigator.serviceWorker.register('/service-worker.js', { scope: "/" }) //Register local service worker on web browser with worker.js config file
            .then((registration) => {
                console.log("Service Worker successfully registered.")
                return registration;
            })
            .catch((err) => { console.error(err) });
        subscription = await register.pushManager.subscribe(subscribeOptions).then((pushSubscription) => { //Subscribe this service worker to the backend API so it can receive notifications/instructions
            console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
            return pushSubscription;
        });
        await fetch('/subscribe', { //Persist subscription object in backend and begin the timer to trigger the notification
            method: 'POST',
            body: JSON.stringify({ subscr: subscription, username: $('#username').val() }),
            headers: {
                'content-type': 'application/json'
            }
        }).then((res) => {
            beginTimer();
        });
    }
}
async function beginTimer() {
    var minutes = 60 - $('#minutes').val();
    var currTime = new Date();
    var timeTrigger = new Date(currTime);
    timeTrigger.setHours(16, minutes, 0, 0); //Set the time to trigger the notification. 3:(minutes) pm e.g. 3:30
    if (currTime > timeTrigger) {
        timeTrigger.setDate(currTime.getDate() + 1); //if its already past peak time, offset the trigger time by one day
    }
    var msUntilTrigger = timeTrigger - currTime;
    console.log("Triggering in %s seconds", msUntilTrigger / 1000);
    //lines 43-54 take the user's input to calculate the time delay until when the user requested to be notified. Peak hours are
    //assumed to begin at 4 everyday.  

    await fetch('/notify', { //this is the route that tells the backend which service worker to trigger and how long to delay giving the notification. 
        method: 'POST',      //this is the money route for this application
        body: JSON.stringify({ subscr: subscription, msUntilTrigger: msUntilTrigger }),
        headers: {
            'content-type': 'application/json'
        }
    });
}
function urlBase64ToUint8Array(base64String) { //See web-push documentation
    const padding = "=".repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}