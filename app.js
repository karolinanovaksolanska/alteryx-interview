const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("./helpers/jwt");
const config = require('./config.json');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(jwt());

app.use('/users', require('./controllers/users.controller'));

const port = config.port;
const databaseNameUsers = config.databaseNameUsers;
const databaseNameBlacklistTokens = config.databaseNameBlacklistTokens;

const server = app.listen(port, function () {
    if(!db.has(databaseNameUsers).value()){
        db.set(databaseNameUsers, []).write();
    }
    if(!db.has(databaseNameBlacklistTokens).value()){
        db.set(databaseNameBlacklistTokens, []).write();
    }
    console.log("Server is running on the port: " + server.address().port);
});