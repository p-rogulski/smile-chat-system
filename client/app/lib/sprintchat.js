/*
╔═╗┌─┐┬─┐┬┌┐┌┌┬┐╔═╗┬ ┬┌─┐┌┬┐
╚═╗├─┘├┬┘││││ │ ║  ├─┤├─┤ │
╚═╝┴  ┴└─┴┘└┘ ┴ ╚═╝┴ ┴┴ ┴ ┴ 
client v1.0 p-rogulski'2016
*/


(function ($) {
    /*functions callbacks*/
    var chatList;

    const msgTypeEnum = {
        init: 0,
        text: 1,
        newConnection: 2
    }

    function sendCallback(msg) {

        msg.send();
    }

    function inputKeyPressCallback(chat, el) {
        let msg = el.value.trim();

        if (window.event.which === 13 && $('#onEnter').is(':checked')) {
            sendCallback(new chat.Message(chat.User.nick, msg));
            el.value = '';
        }
    }

    function sendPressCallback(chat, el) {
        let msg = el.value.trim();
        sendCallback(new chat.Message(chat.User.nick, msg));
        el.value = '';
    }

    function onMessageCallback(chat,conn, el) {
        conn.onmessage = function (msg) {
            var msgParse = JSON.parse(msg.data);
            if (msgParse.type === msgTypeEnum.newConnection) {
                chatListHandler(msgParse.clients);
            } else if(msgParse.newNick){
                chat.User.nick=msgParse.nick;
                console.log(config.nick);
            } else {
                el.innerHTML += `<span><b>${msgParse.nick} [${msgParse.date}]:<br></b> ${msgParse.content}</span><br><br>`;
                el.scrollTop = el.scrollHeight;
            }
        }
    }

    function chatListHandler(clients) {
        var html = "";
        clients.forEach((val) => {
            if (val.nick) {
                html += `<img src="./assets/img/connected.png" /> ${val.nick}<br>`
            }
        });

        $('.chat-items').html(html);

    }


    /*chat object definition*/

    sprintChat = function ($, conn) {

        this.User = function (nick) {
            this.nick = nick;
        }

        this.Message = function (sender, content) {
            this.sender = sender;
            this.content = content;
            this.date = new Date();
        }

        this.Listener = function () {
            this.listeners = new Array();
        }

        this.Message.prototype = {
            send: function () {
                return conn.send(JSON.stringify(this));
            }
        }

        this.Listener.prototype = {
            register: function (jQueryEvent, element, callback) {
                $(element.id)[jQueryEvent](function () {
                    callback(this);
                });
                this.listeners.push({ el: element, event: jQueryEvent });
            },
            unregister: function (name) {
                this.listeners = $.grep(listeres, function (listener) {
                    if (listener.el.name === name) {
                        this.off(listener.el.name);
                    }
                    return listener.el.name != name;
                })
            },
            on: function (name) {
                let listener = $.grep(listeres, function (listener) {
                    return listener.el.name === name;
                })
                $(listener.id).on(event);
            },
            off: function (name) {
                let listener = $.grep(listeres, function (listener) {
                    return listener.el.name === name;
                })
                $(listener.id).off(event);
            }
        }
    }

    //contruct chat
    chatBuilder = {
        build: function (config) {
            let conn = new WebSocket(config.wsAddress);
            conn.nick = config.nick;
            conn.onerror = function () {
                window.alert('Connection Error! :(');
            }

            conn.onopen = function (res) {

                if (res.isTrusted) {
                    let chat = new sprintChat($, conn);
                    chat.Listener = new chat.Listener();
                    chat.User = new chat.User(config.nick);
                    conn.send(JSON.stringify({ init: true, nick: config.nick }));

                    $.each(config.components, (key, val) => {

                        let element = { name: key.toString(), id: val }

                        if (element.name === 'send') {

                            chat.Listener.register('click', element, function () {
                                sendPressCallback(chat, document.getElementById('input'));
                            });
                        } else if (element.name === 'input') {

                            chat.Listener.register('keypress', element, function (el) {
                                inputKeyPressCallback(chat, el);
                            });

                        } else if (element.name === 'output') {
                            chat.Listener.register('html', element, function (el) {
                                onMessageCallback(chat,conn, el);
                            });
                        }
                    });
                }
            }
        }
    }

})(jQuery);
