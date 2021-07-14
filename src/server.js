const express = require('express');
const path = require('path');
const  fetch = require('node-fetch');


const outgoing_URL= 'https://swcompany.webhook.office.com/webhookb2/39bdc88e-8fff-4ba1-b60a-06049a6be189@44b79a67-d972-49ba-9167-8eb05f754a1a/IncomingWebhook/5e8f605f8afe4ffdb34cc26d11b9a3eb/6d139f40-a8a7-4485-a5ed-9de798a1a121';

// ignore request for FavIcon. so there is no error in browser
const ignoreFavicon = (req, res, next) => {
    if (req.originalUrl.includes('favicon.ico')) {
        res.status(204).end();
    }
    next();
};

const rawBody = (req, res, next) => {
    req.setEncoding('utf8');
    req.rawBody = '';
    req.on('data', (chunk) => {
        req.rawBody += chunk;
    });
    req.on('end', next);
};


// fn to create express server
const create = async () => {

    // server
    const app = express();

    // configure nonFeature
    app.use(ignoreFavicon);

    app.use(rawBody);


    // root route - serve static file
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/client.html'));
    });

    // root route - serve static file
    app.post('/rotatekey', async(req, res) => {
        const SubscriptionValidationEvent = "Microsoft.EventGrid.SubscriptionValidationEvent";
        const SecretNearExpiryEvent = "Microsoft.KeyVault.SecretNearExpiry";
        const CustomTopicEvent = "Contoso.Items.ItemReceivedEvent";

        const order = req.rawBody;

        const parsedReq = JSON.parse(req['rawBody']);
        console.log('JavaScript HTTP trigger function processed a request.' + JSON.stringify(parsedReq));


        const eventGridEvent =  parsedReq[0];
        console.log('eventGridEventeventGridEventeventGrid.\n' + JSON.stringify(eventGridEvent));

        const eventData =  eventGridEvent.data;

        console.log('eventGridEvent ' + JSON.stringify(eventGridEvent));
        console.log('eventData ' + JSON.stringify(eventData));
        console.log('******eventGridEvent*******');


        if (eventGridEvent.eventType == SubscriptionValidationEvent) {
            console.log('Got SubscriptionValidation event data, validationCode: ' + eventData.validationCode + ', topic: ' + eventGridEvent.topic);

            console.log('Got SubscriptionValidation event URL: '+  eventGridEvent.url);

            console.res = {
                validationResponse: eventData.validationCode
            };
            res.status(200).send(JSON.stringify(console.res));

        } else if (eventGridEvent.eventType == SecretNearExpiryEvent) {
            console.log('Got Blobcreated event data, blob URI ' + eventData.url);
            const body = {
                "@type": "MessageCard",
                "@context": "http://schema.org/extensions",
                "summary": "TESTING Azure Key Vault - Storage Account Secret Near Expiry Event",
                "sections": [
                    {
                        "activityTitle": "TESTING Azure Key Vault - Storage Account Secret Near Expiry Event",
                        "facts": [
                            {
                                "name": "Key Vault",
                                "value": eventData.VaultName,
                            },
                            {
                                "name": "Secret Name",
                                "value": eventData.ObjectName,
                            },
                            {
                                "name": "Secret Version",
                                "value": eventData.Version,
                            },
                            {
                                "name": "Secret Access URL",
                                "value": eventData.Id,
                            }
                        ]
                    }
                ],
                "potentialAction": [
                    {
                        "@context": "http://schema.org",
                        "@type": "ViewAction",
                        "name": "Learn more on Wikipedia",
                        "target": [
                            "https://en.wikipedia.org/wiki/Pluto"
                        ]
                    }
                ]
            }
        console.log("****Teams Notification data***"+ JSON.stringify(body))
            const teamsResp = await  fetch(outgoing_URL, {
                method: 'post',
                body: JSON.stringify(body),
                headers: {'Content-Type': 'application/json'},
            });
            console.log("***teamsResp***"+ teamsResp.status)

            res.status(202).send("success!")


        } else if (eventGridEvent.eventType == CustomTopicEvent) {
            console.log('Got ContosoItemReceived event data, item SKU ' + eventData.itemSku);
        }else {
            console.log('Got myevent event data ' );

        }

    });

    // Error handler
    /* eslint-disable no-unused-vars */
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });
    return app;
};

module.exports = {
    create
};
