# Planejamento de Software e Integração entre Equipes

## 1. Visão geral

O **Baloone** é um robô móvel de três rodas controlado por um ESP32. O projeto prevê transmissão de vídeo por câmera, envio de comandos em tempo real por WebSocket e mecanismos de segurança para interromper o movimento em caso de perda de conexão.

Este documento organiza os módulos de software, define as mensagens previstas para monitoramento pelo Monitor Serial e reúne as decisões técnicas que precisam ser alinhadas entre as equipes de Hardware/Eletrônica e Frontend.

---

## 2. Organização do software

Para facilitar o desenvolvimento, a manutenção e a integração entre as equipes, o código deverá ser organizado por responsabilidade. A estrutura poderá ser implementada em arquivos separados no PlatformIO ou em abas da Arduino IDE.

| Módulo | Responsabilidade |
|---|---|
| `main` | Arquivo principal (`.ino` ou `.cpp`). Inicializa os componentes no `setup()` e executa o ciclo principal, monitorando o estado do switch e da conexão. |
| `controle_wifi` | Gerencia a conexão do ESP32 à rede local e as tentativas de reconexão em caso de perda de sinal. |
| `controle_websocket` | Gerencia a comunicação bidirecional em tempo real. **Requisito de segurança:** ao detectar a desconexão do cliente de controle, deve acionar imediatamente a rotina de parada dos motores. |
| `controle_motores` | Controla o acionamento dos motores por meio da ponte H, incluindo os movimentos para frente, para trás, para a esquerda e para a direita, além da função de freio/parada. |
| `controle_camera` | Configura o hardware da câmera do ESP32 e inicializa o fluxo de imagens. |
| `controle_leds` | Gerencia os indicadores visuais de estado do sistema. |

### 2.1. Indicadores visuais

| Indicador | Significado |
|---|---|
| LED verde | Sistema ligado e em operação. |
| LED amarelo | Alerta de perda de conexão Wi-Fi ou WebSocket. |

---

## 3. Logs e monitoramento

O Monitor Serial deverá apresentar mensagens organizadas por contexto, facilitando o diagnóstico de falhas e o acompanhamento do estado do Baloone.

### 3.1. Inicialização

```log
[SISTEMA] Baloone iniciando...
[CAMERA] Câmera iniciada com sucesso.
[LEDS] LED verde LIGADO.
```

### 3.2. Conexão e rede

```log
[WIFI] Tentando conectar à rede...
[WIFI] Conectado! IP do Baloone: 192.168.X.X
[WEBSOCKET] Servidor iniciado na porta 81. Aguardando cliente...
[WEBSOCKET] Controle (cliente) conectado com sucesso!
```

### 3.3. Operação e segurança

```log
[MOTOR] Comando recebido: MOVER FRENTE
[ALERTA] Conexão WebSocket perdida!
[SEGURANÇA] Parando motores imediatamente.
[LEDS] LED amarelo LIGADO (Sem conexão).
[SISTEMA] Switch desligado. Encerrando operações.
```

---

## 4. Pendências de integração

As decisões a seguir precisam ser alinhadas entre as equipes responsáveis. Marque cada item como concluído (`[x]`) após a definição e validação da decisão.

### 4.1. Hardware e Eletrônica

- [ ] **Mapeamento dos GPIOs:** definir os pinos do ESP32 utilizados pelos motores (ponte H), pelo LED verde, pelo LED amarelo e pelo switch. O ESP32-CAM possui limitações quanto à disponibilidade de pinos, portanto esse mapeamento deve ser realizado antecipadamente.
- [ ] **Funcionamento do switch:** definir se o switch interromperá fisicamente a alimentação da bateria ou se será conectado a um pino do ESP32 para que o software leia seu estado (ligado/desligado).
- [ ] **Controle de velocidade:** definir se os motores utilizarão sinal PWM para permitir velocidade variável ou apenas estados lógicos `HIGH`/`LOW`, mantendo velocidade máxima constante.

### 4.2. Frontend — Controle e aplicativo

- [ ] **Formato das mensagens (payload):** definir o formato das mensagens enviadas pelo WebSocket para controlar os movimentos. As opções levantadas são um caractere simples (por exemplo, `F` ou `T`) ou uma estrutura JSON (por exemplo, `{"acao": "frente"}`).
- [ ] **Transmissão de vídeo:** definir se o fluxo da câmera será enviado pelo próprio WebSocket, codificado em Base64, ou disponibilizado ao frontend por HTTP, utilizando MJPEG em uma porta separada.
- [ ] **Heartbeat e detecção de desconexão:** definir se o aplicativo enviará mensagens periódicas para indicar que permanece conectado. Esse mecanismo deve contribuir para detectar situações como o desligamento do celular ou o fechamento do navegador e acionar a parada dos motores em caso de perda de comunicação.

---

## 5. Requisito de segurança prioritário

**Em caso de perda da conexão WebSocket com o cliente de controle, o sistema deverá interromper imediatamente o acionamento dos motores.**

Esse comportamento deverá ser considerado durante a implementação e validado nos testes de integração.

---

*Documento de planejamento técnico — Projeto Baloone.*
