const express = require('express');
const path = require('path');

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


      const eventGridEvent = parsedReq.data;
        const eventData = eventGridEvent.data;

        console.log('eventGridEvent ' + eventGridEvent);
        console.log('eventData ' + eventData);
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
        } else if (eventGridEvent.eventType == CustomTopicEvent) {
            console.log('Got ContosoItemReceived event data, item SKU ' + eventData.itemSku);
        }else {
            console.log('Got myevent event data ' );

        }


 /*       parsedReq.forEach(eventGridEvent => {
            var eventData = eventGridEvent.data;
            // Deserialize the event data into the appropriate type based on event type using if/elif/else
            if (eventGridEvent.eventType == SubscriptionValidationEvent) {
                console.log('*************');

                console.log('Got SubscriptionValidation event data, validationCode: ' + eventData.validationCode + ', topic: ' + eventGridEvent.topic);
                console.res = {
                    validationResponse: eventData.validationCode
                };
                res.status(200).send(JSON.stringify(console.res));
            } else if (eventGridEvent.eventType == StorageBlobCreatedEvent) {
                console.log('Got Blobcreated event data, blob URI ' + eventData.url);
            } else if (eventGridEvent.eventType == CustomTopicEvent) {
                console.log('Got ContosoItemReceived event data, item SKU ' + eventData.itemSku);
            }else {
                console.log('Got myevent event data ' );

            }
        });*/



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
