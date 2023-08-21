let soquete;
let canalAtual;
let tempoInicioTesteLatencia;

function conectarAoCanal() {
    const entradaCanal = document.getElementById("channelInput");
    canalAtual = entradaCanal.value;
    soquete = new WebSocket(`ws://localhost:8080/ws?canal=${canalAtual}`);

    soquete.onopen = function(evento) {
        console.log(`Conectado ao canal: ${canalAtual}`);
        document.getElementById("chatArea").style.display = "block";
        document.getElementById("latencyTestArea").style.display = "block";
    };

    soquete.onmessage = function(evento) {
        const mensagem = evento.data;
        const caixaMensagens = document.getElementById("messageBox");
        if (mensagem === "TesteDeLatencia") {
            tratarRespostaTesteLatencia();
        } else {
            caixaMensagens.innerHTML += `<p>${mensagem}</p>`;
        }
    };

    soquete.onclose = function(evento) {
        console.log(`Desconectado do canal: ${canalAtual}`);
    };
}

function enviarMensagem() {
    const entradaMensagem = document.getElementById("messageInput");
    const mensagem = entradaMensagem.value;
    soquete.send(mensagem);
    entradaMensagem.value = "";
}

function executarTesteDeLatencia() {
    if (soquete && soquete.readyState === WebSocket.OPEN) {
        tempoInicioTesteLatencia = Date.now();
        soquete.send("TesteDeLatencia");
    }
}

function tratarRespostaTesteLatencia() {
    if (tempoInicioTesteLatencia) {
        const latencia = Date.now() - tempoInicioTesteLatencia;
        const resultadoLatencia = document.getElementById("latencyResult");
        resultadoLatencia.innerHTML = `Latência: ${latencia} ms`;
        tempoInicioTesteLatencia = null;
    }
}

window.onload = function() {
    const botaoTesteLatencia = document.getElementById("runLatencyTest");
    botaoTesteLatencia.addEventListener("click", executarTesteDeLatencia);
};
