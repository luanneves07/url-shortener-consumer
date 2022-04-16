require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');

const amqp = require('./services/mqservices');
amqp.connect(() => {
    console.log("Connection with Rabbitmq was successful");
},
    persistData);

const knex = require('knex')({
    client: 'pg',
    debug: false,
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
});

const { request } = require('undici');
const generatorEndpoint = process.env.URL_GENERATOR_ENDPOINT;

/**
 * Environment
 */
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
/**
 * Presenter
 */
app.get('/', (req, res) => {
    res.sendFile(path.resolve('public/index.html'));
});

app.listen(port, () => {
    console.log(`Server started at port ${port}/`);
});

async function persistData(data) {
    if (data) {
        const originalUrl = JSON.parse(data);
        const { body } = await request(generatorEndpoint);
        const shortenedUrl = await body.json();
        const shortenerUniqueID = shortenedUrl.shortened_url;
        const shortenedData = {
            original_url: originalUrl.original_url,
            shortened_url: shortenerUniqueID
        }
        knex('urls').insert(shortenedData)
            .then((insertedData) => {
                console.log(insertedData);
                console.log(shortenedData);
            })
            .catch(err => {
                console.log(JSON.stringify(err.message));
            });
    }
}
