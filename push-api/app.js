const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, "client")));
app.use(bodyParser.json());

const publicKey = 'BDaN5wuHsjiFedtmmm_LcwtqzipDxZHWySVh4Sfez167_dTmdGPQpcb4qSIVHENXqPIhglRnfzLvEboMEOKoeII';
const privateKey = 'OWrBRsOPjOCxxbnjzj2cVB7ZCy5UhkNkBNtwnCpE8z4';
//generated through command 'web-push generate-vapid-keys'

webpush.setVapidDetails( //Connect to web-push API with generated keys
    "mailto:test@test.com",
    publicKey,
    privateKey
);
app.post('/subscribe', (req,res)=>{ //Awaits valid subscription. This is where the actual interfacing is done with the web-push API. 
    const subscription = req.body; 
    console.log(subscription);
    const notification = {
        title: "Notification",
        body: "You have been notified",
        icon: "https://i.imgur.com/GDHivYy.png"
    };
    res.sendStatus(201);
    webpush.sendNotification(subscription, JSON.stringify(notification)).catch((err) => console.error(err)); //Send notification to service workers. 
});
app.listen(80, () => console.log('Server started on port 80'));