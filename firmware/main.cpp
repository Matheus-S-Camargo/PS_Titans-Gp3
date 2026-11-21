#include <Arduino.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <atomic>
#include <cstring>
#include "movimento.h"
#include "protocolo.h"

const char *nomeRede = "Grupo3_Balloone";
const char *senhaRede = "12345678";

AsyncWebServer servidorHttp(80);
AsyncWebSocket websocket("/ws");

constexpr uint32_t SEM_CONTROLADOR = 0;
constexpr uint32_t ATIVAR_FREIOS = 300;

std::atomic<uint32_t> idControlador{SEM_CONTROLADOR};
std::atomic<uint32_t> ultimaMensagemValidaMs{0};
std::atomic<int> comandoVertical{0};
std::atomic<int> comandoHorizontal{0};
std::atomic<bool> freioAtivo{true};
std::atomic<bool> joystickBloqueado{true};

void pararComandoDeMovimento() {
    comandoVertical = 0;
    comandoHorizontal = 0;
    freioAtivo = true;
}

void analisarMensagemDeControle(
    AsyncWebSocketClient *cliente,
    const uint8_t *dados,
    size_t tamanho
) {
    char mensagem[32];

    if (tamanho == 0 ||
        tamanho >= sizeof(mensagem) ||
        std::memchr(dados, '\0', tamanho) != nullptr) {
        pararComandoDeMovimento();
        return;
    }

    std::memcpy(mensagem, dados, tamanho);
    mensagem[tamanho] = '\0';

    if (std::strcmp(mensagem, "PING") == 0) {
        ultimaMensagemValidaMs = millis();
        cliente->text("PONG");
        return;
    }

    if (std::strcmp(mensagem, "BRAKE") == 0) {
        ultimaMensagemValidaMs = millis();
        pararComandoDeMovimento();
        return;
    }

    Movimento movimento;

    if (!lerEixosDaMensagem(mensagem, movimento)) {
        pararComandoDeMovimento();
        return;
    }

    bool bloqueado = joystickBloqueado.load();
    Decisao decisao = interpretarMovimento(movimento, bloqueado);
    joystickBloqueado = bloqueado;

    if (decisao.estado == COMANDO_INVALIDO) {
        pararComandoDeMovimento();
        return;
    }

    ultimaMensagemValidaMs = millis();

    if (decisao.estado == CONTROLE_BLOQUEADO ||
        decisao.estado == PARAR) {
        pararComandoDeMovimento();
        return;
    }

    comandoVertical = decisao.intensidadeVertical;
    comandoHorizontal = decisao.intensidadeHorizontal;
    freioAtivo = false;
}

void tratarEventoWebSocket(
    AsyncWebSocket *servidor,
    AsyncWebSocketClient *cliente,
    AwsEventType tipo,
    void *arg,
    uint8_t *dados,
    size_t tamanho
) {
    (void)servidor;

    const uint32_t idCliente = cliente->id();

    if (tipo == WS_EVT_CONNECT) {
        uint32_t idEsperado = SEM_CONTROLADOR;

        if (idControlador.compare_exchange_strong(idEsperado, idCliente)) {
            joystickBloqueado = true;
            pararComandoDeMovimento();
            ultimaMensagemValidaMs = millis();

            Serial.printf("Cliente #%u recebeu o controle\n", idCliente);
            cliente->text("CONTROL:GRANTED");
        } else {
            Serial.printf("Cliente #%u: controle ocupado\n", idCliente);
            cliente->text("CONTROL:BUSY");
            cliente->close(1013, "busy");
        }

        return;
    }

    if (tipo == WS_EVT_DISCONNECT) {
        uint32_t idEsperado = idCliente;

        if (idControlador.compare_exchange_strong(
                idEsperado,
                SEM_CONTROLADOR
            )) {
            joystickBloqueado = true;
            pararComandoDeMovimento();

            Serial.printf("Cliente #%u liberou o controle\n", idCliente);
        }

        return;
    }

    if (tipo == WS_EVT_DATA) {
        if (idCliente != idControlador.load()) {
            return;
        }

        AwsFrameInfo *informacao = static_cast<AwsFrameInfo *>(arg);

        if (informacao == nullptr ||
            !informacao->final ||
            informacao->index != 0 ||
            informacao->len != tamanho ||
            informacao->opcode != WS_TEXT) {
            pararComandoDeMovimento();
            return;
        }

        analisarMensagemDeControle(cliente, dados, tamanho);
    }
}

void setup() {
    Serial.begin(115200);

    WiFi.mode(WIFI_AP);
    WiFi.softAP(nomeRede, senhaRede);

    Serial.print("\nIP: ");
    Serial.println(WiFi.softAPIP());

    websocket.onEvent(tratarEventoWebSocket);
    servidorHttp.addHandler(&websocket);
    servidorHttp.begin();
}

void loop() {
    websocket.cleanupClients();

    const uint32_t controladorAtual = idControlador.load();

    if (controladorAtual != SEM_CONTROLADOR) {
        const uint32_t tempoSemSinal = millis() - ultimaMensagemValidaMs.load();
        
        if (tempoSemSinal > ATIVAR_FREIOS) {
            uint32_t idEsperado = controladorAtual;

            if (idControlador.compare_exchange_strong(idEsperado, SEM_CONTROLADOR)) {
                joystickBloqueado = true;
                pararComandoDeMovimento();
                Serial.printf("Controlador #%u desconectado por inatividade\n", controladorAtual);
            }

            AsyncWebSocketClient *cliente = websocket.client(controladorAtual);
            if (cliente != nullptr) {
                cliente->close(1001, "timeout");
            }
        }

    } else {
        pararComandoDeMovimento();
    }

    //Tem que colocar a função da ponte H aqui
    //Faltam colocar as funções dos LED também 

    delay(10);
}