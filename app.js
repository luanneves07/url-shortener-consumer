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

function persistData(data) {
    if (data) {
        const shortenedData = JSON.parse(data);
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
