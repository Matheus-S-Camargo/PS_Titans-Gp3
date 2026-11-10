// ===============================================
// Balloone
// ===============================================
#include <Arduino.h>              // Funções básicas do Arduino
#include <WiFi.h>                 // Biblioteca de Wi-Fi para ESP32
#include <ESPAsyncWebServer.h>    // Servidor HTTP/WebSocket assíncrono
#include <atomic>                 // Variáveis atômicas (seguras entre tasks diferentes)


// ----------------- Configurações -----------------
const char *ssid = "Grupo3_Balloone"; // Nome da rede Wi-Fi
const char *password = "12345678";    // Senha do Wi-Fi

constexpr uint32_t CONTROLADOR        = 0;    // ids de cliente começam em 1
constexpr uint32_t TIMEOUT_SEGURANCA  = 300;  // sem comando: para os motores
constexpr uint32_t LIBERAR_CONTROLE   = 5000; // sem comando: libera o controle


//----------------- Variáveis globais -----------------
AsyncWebServer server(80);  // Servidor HTTP na porta 80
AsyncWebSocket ws("/ws");   // Endpoint WebSocket: ws://IP_DO_ESP32/ws

// Estado compartilhado entre a task do AsyncTCP (callbacks) e a loop()
std::atomic<uint32_t> ID_DE_CONTROLE{CONTROLADOR};  // ID do cliente que controla agora (0 = ninguém)
std::atomic<uint32_t> lastMsgMs{0};                 // Momento (millis) da última mensagem do controlador
std::atomic<int> aceleracao{0};                       // Aceleração: -100 (ré total) a 100 (frente total)
std::atomic<int> direcao{0};                          // Direção: -100 (esquerda) a 100 (direita)
std::atomic<bool> frear{false};                        // True = freio ativo


// ----------------- Motores -----------------
void applyDrive(int thr, int str) {
  if (frear.load()) {
    // Ponte H em modo freio
    return;
  }
}

void stopMotors() {
  aceleracao = 0;
  direcao = 0;
  frear = true;   // Em falha de sinal, freia em vez de deslizar
}


// ----------------- Controle exclusivo -----------------

// Tenta dar o controle ao cliente "id". Retorna true se conseguiu.
bool tryClaimControl(uint32_t id) {
  uint32_t expected = CONTROLADOR;   // O valor que esperamos encontrar: "ninguém controlando"
  // Atômico: se duas conexôes chegarem juntas, só uma consegue
  if (ID_DE_CONTROLE.compare_exchange_strong(expected, id)) {
    lastMsgMs = millis(); // Marca agora como a última atividade (evita timeout imediato)
    stopMotors(); // Começa com os motores parados, por segurança
    return true;  // Controle concedido
  }
  return false;   // Já havia outro controlador: pedido negado
}

// Libera o controle, mas SOMENTE se "id" for o controlador atual.
bool releaseControl(uint32_t id) {
  uint32_t expected = id;  // Espera-se que o controlador atual sela este id
  // Se o ID_DE_CONTROLE for igual a "id", volta para 0
  if (ID_DE_CONTROLE.compare_exchange_strong(expected, CONTROLADOR)) {
    stopMotors();   // Para os motores
    return true;    // Libera o controle
  }
  return false;     // Não faz nada: quem chamou não era o controlador
}


//----------------- Eventos do WebSocket -----------------
void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  const uint32_t id = client->id();   //ID do cliente que disparou o evento

  switch (type) {               // Verifica qual evento ocorreu

    case WS_EVT_CONNECT:        // Um cliente se conectou
      if (tryClaimControl(id)) {    // Tenta dar o controle a ele
        Serial.printf("Cliente #%u assumiu o controle\n", id);  // Log: ele ganhou
        client->text("CONTROL:GRANTED");      // Aviso o cliente que ele controla
      } else {    // Já existe um controlador ativo
        Serial.printf("Cliente #%u rejeitado (ocupado)\n", id);  // Log: ele perdeu
        client->text("CONTROL:BUSY");   // Avisa que está ocupado
        client->close(1013, "busy");    // Fecha a conexão (código 1013 = "tente depois")
      }
      break;    // Fim do caso

    case WS_EVT_DISCONNECT:     // Um cliente se desconectou
      // Clientes rejeitados também disparam este evento;
      // releaseControl ignora quem não é o controlador.
      if (releaseControl(id)) {     // Se ele era o controlador, libera o controle
        Serial.printf("Cliente #%u desconectado\n", client->id());  // Log
      }
      break;    // Fim do caso

    case WS_EVT_DATA: {       // Chegou uma mensagem de um cliente
      if (id != ID_DE_CONTROLE.load()) break; //ignora quem não controla

      AwsFrameInfo *info = (AwsFrameInfo*)arg;    // Informações sobre o frame recebido
      // Só TEXTO, completo em um frame
      if (!(info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT)) break;     // Se não for, ignora

      lastMsgMs = millis();         //Qualquer mensagem válida reinicia o timer de timeout do controlador

      char buf[32];     // Buffer pequeno para a mensagem
      size_t n = len < sizeof(buf) - 1 ? len : sizeof(buf) - 1;   // Limita o tamanho para não estourar o buffer
      memcpy(buf, data, n);   // Copia os bytes recebidos para o buffer
      buf[n] = '\0';    // Termina a string com o caractere nulo

      if (strcmp(buf, "PING") == 0) {   // Se a mensagem for exatamente "PING"
        client->text("PONG");           // Responde "PONG"
      } else if (strcmp(buf, "BRAKE") == 0) {   // Cliente pediu freio
        aceleracao = 0;   // Zera a aceleraçao
        direcao = 0;      // Zera a direção
        frear = true;     // Aiva os freios
      } else {        // Senão, tenta interpretar como comando de direção
        int t, s;     // Variáveis que guardam aceleração e direção temporariamente
        // formato: "D:throttle,steer" ex: "D:80, -20"
        if (sscanf(buf, "D:%d,%d", &t, &s) == 2) {    // Se conseguiu ler dois inteiros
          frear = false;
          aceleracao = constrain(t, -100, 100);   //Guarda a aceleração, entre -100 e 100
          direcao = constrain(s, -100, 100);      // Guarda a direção, entre -100 e 100
        }
      }
      break;      // Fim do caso
    }

    default:      // Ignora outros eventos
      break;
  }
}


// ----------------- Setup e loop -----------------
void setup() {
  // Inicia a comunicação serial para debug
  Serial.begin(115200);

  WiFi.begin(ssid, password);                 // Começa a conexão Wi-Fi
  while (WiFi.status() != WL_CONNECTED) {     // Enquanto não estiver conectado, espere
    delay(100);                               // Espera 100ms
    Serial.print(".");                        // Imprime um ponto para indicar que está tentando conectar
  }
  
  Serial.println("\nIP: ");                   // Quebra de e texto "IP: "
  Serial.println(WiFi.localIP());             // Mostra o IP do ESP32
  
  ws.onEvent(onWsEvent);                      // Registra a função que trata os eventos do websocket
  server.addHandler(&ws);                     // Liga o websocket ao servidor HTTP
  server.begin();                             // Inicia o servidor

}


// ------------------ Loop principal -----------------
void loop() {
  ws.cleanupClients(); // libera clientes desconectados

  uint32_t id = ID_DE_CONTROLE.load();    // Lê quem é o controlador atual
  if (id != CONTROLADOR) {                // Se existe um controlador ativo
    uint32_t idle = millis() - lastMsgMs.load();  // calcula há quanto tempo ele não envia mensagem

    if (idle > LIBERAR_CONTROLE) {    // Passou de 5 segundos sem comando: libera o controle
      Serial.printf("Controlador #%u sem sinal. Liberando\n", id);  // Log
      releaseControl(id);   // Libera o controle
      AsyncWebSocketClient *c = ws.client(id);    // Busca o cliente que perdeu o controle
      if (c) c->close(1001, "timeout");     // Se ainda existir, fecha a conexão
    } else if (idle > TIMEOUT_SEGURANCA) {    // passou de 300ms sem comando: para os motores
      stopMotors();                               //failsafe
    }
  } else {    // Se não há controlador nenhum
    stopMotors();   // Garante que o carrinho fique parado
  }

  applyDrive(aceleracao.load(), direcao.load());    // Envia aceleração e direção atuais aos motores
  delay(10);  // Pausa de 10ms
}


void loop() {
  // put your main code here, to run repeatedly:
}
