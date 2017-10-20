'use strict';
const express = require('express');
const app = express();
const API = './api_secret';

const apiai = require("apiai")(API.APIAI_TOKEN_ID);

app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/public'));

const server = app.listen(5000);

const io = require("socket.io")(server);
io.on("connection", function (socket) {
    console.log("a user connected");
});

app.get("/", (req, res) => {
    res.sendFile("index.html");
});

io.on("connection", function (socket) {
    socket.on("chat message", text => {
        console.log("Message: " + text);

        // Get a reply from API.ai

        let apiaiReq = apiai.textRequest(text, {
            sessionId: APIAI_SESSION_ID
        });

        apiaiReq.on("response", (response) => {
            let aiText = response.result.fulfillment.speech;
            console.log("Bot reply: " + aiText);            

            socket.emit("bot reply", aiText);
            
        });

        socket.on('bot reply', function (replyText) {
            synthVoice(replyText);

            
        });

        apiaiReq.on("error", error => {
            console.log(error);
        });

        apiaiReq.end();
    });
});