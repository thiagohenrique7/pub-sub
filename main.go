package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type canalChat struct {
	nome        string
	clientes    map[*cliente]bool
	transmissao chan []byte
	recente     []string
	mutex       sync.Mutex
}

type cliente struct {
	conexao *websocket.Conn
	canal   chan []byte
}

var canais = make(map[string]*canalChat)

func main() {
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		conexao, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println(err)
			return
		}

		nomeCanal := r.URL.Query().Get("canal")

		ch := obterOuCriarCanal(nomeCanal)

		cli := &cliente{
			conexao: conexao,
			canal:   make(chan []byte),
		}
		ch.clientes[cli] = true

		for _, msg := range ch.recente {
			cli.canal <- []byte(msg)
		}

		go func() {
			defer func() {
				conexao.Close()
				delete(ch.clientes, cli)
				close(cli.canal)
			}()
			for {
				_, msg, err := conexao.ReadMessage()
				if err != nil {
					return
				}
				fmt.Println(string(msg))
				ch.adicionarMensagemRecente(string(msg))
				ch.transmissao <- msg
			}
		}()

		go func() {
			for {
				msg, ok := <-cli.canal
				if !ok {
					return
				}
				err := conexao.WriteMessage(websocket.TextMessage, msg)
				if err != nil {
					return
				}
			}
		}()
	})

	go func() {
		for {
			for _, ch := range canais {
				msg := <-ch.transmissao
				ch.mutex.Lock()
				for c := range ch.clientes {
					c.canal <- msg
				}
				ch.mutex.Unlock()
			}
		}
	}()

	fmt.Println("Servidor WebSocket está escutando na porta 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func obterOuCriarCanal(nome string) *canalChat {
	ch, existe := canais[nome]
	if !existe {
		ch = &canalChat{
			nome:        nome,
			clientes:    make(map[*cliente]bool),
			transmissao: make(chan []byte),
		}
		go ch.iniciarTransmissao()
		canais[nome] = ch
	}
	return ch
}

func (ch *canalChat) iniciarTransmissao() {
	for {
		msg := <-ch.transmissao
		ch.mutex.Lock()
		for c := range ch.clientes {
			c.canal <- msg
		}
		ch.mutex.Unlock()
	}
}

func (ch *canalChat) adicionarMensagemRecente(msg string) {
	ch.mutex.Lock()
	defer ch.mutex.Unlock()

	if len(ch.recente) >= 10 {
		ch.recente = ch.recente[1:]
	}
	ch.recente = append(ch.recente, msg)
}
