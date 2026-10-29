# Protocolo de Comunicação via WebSocket - Robô Baloone

Este documento define o padrão de mensagens (em formato JSON) trocadas entre a Interface de Controle e o ESP32 do robô Balloone.

## 1. Mensagens da Interface para o Robô (Comandos)

A interface deve enviar estes comandos para controlar os motores ou manter a conexão ativa.

### 1.1. Controle de Movimento
Aciona os motores traseiros para mover o robô.

```json
{
  "acao": "mover",
  "direcao": "frente",
  "velocidade": 100
}
```
* **direcao**: Valores aceitos: `"frente"`, `"tras"`, `"esquerda"`, `"direita"`.
* **velocidade**: Valores de `0` a `100` (porcentagem do PWM).

### 1.2. Parada Manual
Comando para parar os motores imediatamente.

```json
{
  "acao": "parar"
}
```

### 1.3. Sinal de Vida (Ping)
Mensagem que a interface deve enviar a cada 1 segundo para informar ao robô que o controle continua ativo.

```json
{
  "acao": "ping"
}
```

---

## 2. Avisos do Robô para a Interface (Respostas)

O ESP32 enviará as mensagens abaixo para atualizar a interface sobre o estado do robô.

### 2.1. Confirmação de Conexão (Setup)
Enviado assim que o WebSocket conecta com sucesso e o LED Verde é aceso.

```json
{
  "aviso": "conectado",
  "led_verde": "ligado",
  "camera": "ok"
}
```

### 2.2. Resposta de Sinal de Vida (Pong)
O robô devolve essa mensagem a cada "ping" recebido. Serve para a interface saber que o robô não travou.

```json
{
  "aviso": "pong"
}
```

### 2.3. Avisos de Erro
Caso haja falha de hardware (como problema ao iniciar a câmera).

```json
{
  "aviso": "erro",
  "mensagem": "Falha na inicialização da câmera"
}
```

---

## 3. Comportamento em Caso de Perda de Conexão (Failsafe)

A perda de conexão não gera uma mensagem JSON, mas sim um comportamento de segurança no ESP32:

1. O ESP32 possui um temporizador (timeout) configurado para **300 milissegundos**.
2. Toda vez que recebe um comando `"mover"` ou `"ping"`, o temporizador é zerado.
3. Se o temporizador estourar (ficar 3 milissegundos sem receber nada), o robô assume que perdeu a conexão com a interface e executa o modo de segurança:
   * **Motores:** Desligados imediatamente.
   * **LED Verde:** Desligado.
   * **LED Amarelo:** Ligado (indicando falha de conexão).