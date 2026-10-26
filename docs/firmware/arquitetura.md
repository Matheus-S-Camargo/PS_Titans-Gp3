# Arquitetura do Firmware

## Organização e responsabilidades

| Parte | Responsabilidade |
| **Comunicação** | ESP32-CAM deve ser um ponto de acesso Wi-fi para conexão e as mensagens enviadas deve ser transmitidas via websocket. |
| **Validação das mensagens** | Verificar o formato, as informações e valores permitidos na mensagem. Quando válido, interpretar o estado dos controles informado, caso contrário, indicar invalidez da mensagem. |
| **Gerenciamento do controle** | Definir qual conexão pode controlar o robô, controlar o bloqueio e a liberação dos movimentos e encerrar a sessão quando houver desconexão ou ausência de mensagens válidas dentro do tempo limite. |
| **Lógica de movimento** | Decidir entre deslocamento, giro, curva e frenagem, respeitando as permissões, os controles recebidos e as condições de falha informadas pelas outras partes. |
| **Acionamento dos motores** | Transformar a mensagem deita pela lógica de movimento em sinais, feita pela ESP32-CAM, para a ponte H, que acionará os motores. |
