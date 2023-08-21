const socket = new WebSocket("ws://localhost:8080/ws?channel=mychannel");

socket.addEventListener("open", (event) => {
  console.log("Conexão WebSocket aberta.");
});

socket.addEventListener("message", (event) => {
  const chatBox = document.getElementById("chatBox");
  const message = document.createElement("div");
  message.textContent = event.data;
  chatBox.appendChild(message);
});

socket.addEventListener("close", (event) => {
  console.log("Conexão WebSocket fechada.");
});

document.getElementById("sendButton").addEventListener("click", () => {
  const messageInput = document.getElementById("message");
  const message = messageInput.value;
  socket.send(message);
  messageInput.value = "";
});
