let socket;
let currentChannel;

function connectToChannel() {
    const channelInput = document.getElementById("channelInput");
    currentChannel = channelInput.value;
    socket = new WebSocket(`ws://localhost:8080/ws?canal=${currentChannel}`);

    socket.onopen = function(event) {
        console.log(`Conectado ao canal: ${currentChannel}`);
        document.getElementById("chatArea").style.display = "block";
    };

    socket.onmessage = function(event) {
        const message = event.data;
        const messageBox = document.getElementById("messageBox");
        messageBox.innerHTML += `<p>${message}</p>`;
    };

    socket.onclose = function(event) {
        console.log(`Desconectado do canal: ${currentChannel}`);
    };
}

function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value;
    socket.send(message);
    messageInput.value = "";
}
