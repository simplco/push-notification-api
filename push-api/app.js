require('dotenv').config({ path: 'vars.env' });
const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');
const mailjet = require('node-mailjet')
    .connect('d32fe1881748d0e8468e1d3d730b0f9e', '3ef5c9ddf068808d389b989d383439c8')

const app = express();

app.use(express.static(path.join(__dirname, "client")));
app.use(bodyParser.json());

const publicKey = process.env.PUBLIC_VAPID_KEY; //generated through command 'web-push generate-vapid-keys'
const privateKey = process.env.PRIVATE_VAPID_KEY;
const notification = {
    title: "Peak Time Hours Begin Soon",
    body: "Click to begin cooling your home. ",
    icon: "https://i.imgur.com/GDHivYy.png"
};
webpush.setVapidDetails( //Connect to web-push API with generated keys
    "mailto:test@test.com",
    publicKey,
    privateKey
);
app.get('/publickey', (req, res) => { //Send the publickey to the client
    res.json({ publickey: publicKey });
});
app.post('/subscribe', (req, res) => {
    console.log(req.body);
    const subscription = req.body.subscr;
    //db.setSub(subscription, userdata); //persist the subscription and user data for later use. This will just be a simple call to whatever db we use
    res.sendStatus(201);
});
app.post('/notify', (req, res) => { //Sends the recurring notifications. This is where the actual interfacing is done with the web-push API. 
    const subscription = req.body.subscr;
    setTimeout(() => {
        emailNotification();
        webpush.sendNotification(subscription, JSON.stringify(notification)).catch((err) => console.error(err)); //method that sends the notification to the service worker
        setInterval(() => { //continuously notify at a set interval time
            webpush.sendNotification(subscription, JSON.stringify(notification)).catch((err) => console.error(err));
        }, 60000); //86,400,000 ms in 24 hours, 60000 ms in 1 minute
    }, parseInt(req.body.msUntilTrigger));
    console.log(subscription);
    res.sendStatus(201);
});
function emailNotification() {
    const request = mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [{
                "From": {
                    "Email": "email@email.com", //requires a valid email and new keys. These can be easily generated by creating an 
                    "Name": "Nate"              //account on mailjet
                },
                "To": [{
                    "Email": "email@email.com",
                    "Name": "Nate"
                }
                ], "Subject": "Peak Time Hours Begin Soon",
                "TextPart": "My first Mailjet email",
                "HTMLPart": "<h3>Click <a href='https://www.nest.com/'>here</a> to begin cooling your home.</h3>",
                "CustomID": "AppGettingStartedTest"
            }]
        })
    request
        .then((result) => {
            console.log(result.body)
        })
        .catch((err) => {
            console.log(err.statusCode)
        })
}
app.listen(process.env.PORT, () => console.log('Server started on port %s', process.env.PORT));