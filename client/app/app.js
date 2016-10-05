var config = {
    wsAddress: "ws://127.0.0.1:4000",
    components: {
        input: '#input',
        output: "#output",
        send: "#send",
        userslist: "#chatlist"
    }
}

var app = angular.module('chat', []);
app.controller('appController', function ($scope) {
    $scope.showModal = true;
    $scope.isNickEmpty = true;
    $scope.onNick = onNick;
    $scope.startChat = startChat;
    config.nick = $scope.nick;

    function startChat() {

        if (!$scope.isNickEmpty) {
            $scope.showModal = false;
            chatBuilder.build(config);
        }
    }

    function onNick(nick) {
        config.nick = nick;
        $scope.isNickEmpty = nick ? false : true;
    }

});