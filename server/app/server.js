/// <reference path="typings/tsd.d.ts" />

var http = require('http')
var db = require('mongoose');
var express = require('express');
var id = require('shortid');
var app = express();
var dateFormat = require('dateformat');
var webSocketServer = require('websocket').server;
var History;
var conectionCntr = 0;
var chatHistory = [];
var chatClients = [];
const msgTypeEnum = {
    init: 0,
    text: 1,
    newConnection: 2
}

var server = http.createServer(function (req, resp) {
    console.log('ok');
});

server.listen(4000);

var wsServer = new webSocketServer({
    httpServer: server
});

var dbConfig = {
    host: 'mongodb://127.0.0.1/smileDb',
}

db.connection.on('error', function () {
    console.log("db connection error");
});

db.connection.on('connected', function () {
    console.log("db connection success.");

    var history_schema = db.Schema({
        nick: String,
        content: String,
        date: String,
    });

    History = db.model('history', history_schema);
});

db.connect(dbConfig.host);

wsServer.on('close', function (req) {

  chatClients=chatClients.filter((client)=>{
      return client.id!=req.id;
  });
   sendConnectionBroadCast();
})

wsServer.on('request', function (req) {
    var connection = req.accept(null, req.origin);
    connection.id = conectionCntr++;
    chatClients.push(connection);
    
    getChatHistory().then((history) => {
        sendChatHistory(history, connection);
    });

    connection.on('message', function (message) {
        if (!connection.nick) {
            setNick(connection, message);

        } else {
            sendMessage(message);
        }
    });
});

function addToChatHistory(msg) {
    var history = new History(msg);
    history.save();
}

function getChatHistory() {
    return History.find({}, 'nick content date', function (err, history) {
        return history;
    });
}

function sendMessage(message) {
    var msg = parseMessage(message);
    if (msg) {
        var msgObj = { nick: msg.sender, content: msg.content, date: dateFormat(msg.date, "dd/mm/yy | HH:MM:ss") }
        addToChatHistory(msgObj);
        for (var client of chatClients) {
            client.send(JSON.stringify(msgObj));
        }
    }
}

function sendChatHistory(history, connection) {
    for (var msg of history) {
        connection.send(JSON.stringify(msg));
    }
}

function parseMessage(message) {
    if (message.type === 'utf8') {
        return JSON.parse(message.utf8Data);
    }
    return;
}

function sendNickStatus(con,newNick){
    return con.send(JSON.stringify({ newNick: true, nick: newNick}));
}

function setNick(con, msg) {
    var parsedMsg = parseMessage(msg);
   
    if (parsedMsg.init && parsedMsg.hasOwnProperty(parsedMsg.nick));
        var duplicates=checkNick(parsedMsg.nick);
         if(duplicates>0){
             parsedMsg.nick=`${parsedMsg.nick}_${id.generate()}`
             sendNickStatus(con,parsedMsg.nick);
        }
        var registeredCon = chatClients.find((connection)=>{return connection.id===con.id});
        registeredCon.nick = parsedMsg.nick;
        sendConnectionBroadCast();
    
}

function checkNick(nick){
var duplicates=chatClients.filter((client)=>{return client.nick===nick});
return duplicates.length;
}

function sendConnectionBroadCast() {
    var chatList=chatClients.map(function(val){
        return {nick:val.nick};
    });

   Object.keys(chatClients).forEach(function(key) {
        var connection = chatClients[key];
        if (connection.connected) {
              connection.send(JSON.stringify({type:msgTypeEnum.newConnection,clients:chatList}));
        }
    });    
}