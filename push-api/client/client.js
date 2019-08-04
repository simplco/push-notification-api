const publicKey = 'BDaN5wuHsjiFedtmmm_LcwtqzipDxZHWySVh4Sfez167_dTmdGPQpcb4qSIVHENXqPIhglRnfzLvEboMEOKoeII';

if('serviceWorker' in navigator){ //I believe this is checking browser compatibility with serviceWorkers. Some browsers don't support them. 
    send().catch(err => console.log(err));
}
async function send(){
    const register = await navigator.serviceWorker.register('/worker.js',{ //Register local service worker on web browser with worker.js config file
        scope: '/' //worker only runs on main page
    });
    const subscription = await register.pushManager.subscribe({ //Subscribe this service worker to the backend API so it can receive notifications/instructions. 
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
    await fetch('/subscribe', { //Send service worker subscription object to backend to connect worker to web-push API
        method: 'POST',
        body: JSON.stringify(subscription),
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