# Requisitos Funcionais — Firmware e Comunicação

Este documento reúne os requisitos funcionais de Firmware e Comunicação do Balloone. A organização segue o uso do robô: inicialização, conexão, liberação do controle, movimentação e tratamento de falhas.

Esta é a primeira versão dos requisitos. Os parâmetros e pontos de integração ainda pendentes estão registrados ao final.

## Requisitos funcionais

| Código | Nome | Descrição |
| --- | --- | --- |
| RF-FC-01 | Inicializar sem movimento | Ao ligar ou reiniciar a placa, o firmware deve iniciar o controle dos motores no estado de parada e manter o movimento bloqueado. A movimentação só poderá ser liberada pelo procedimento do RF-FC-06. Um botão mantido pressionado durante a inicialização ou reinicialização não deve fazer o robô começar a andar automaticamente. |
| RF-FC-02 | Disponibilizar rede Wi-Fi | Ao iniciar, o firmware deve criar automaticamente uma rede Wi-Fi própria para conectar o dispositivo de controle ao robô. Essa conexão deve funcionar sem internet e sem depender de outra rede. |
| RF-FC-03 | Estabelecer comunicação de controle | O firmware deve disponibilizar uma conexão por WebSocket para receber mensagens de controle e enviar os avisos previstos nestes requisitos. As conexões destinadas ao controle devem ser diferenciadas das conexões usadas apenas para transmissão de vídeo. |
| RF-FC-04 | Garantir exclusividade do controlador | O firmware deve conceder o controle à primeira conexão de controle aceita e manter apenas um controlador ativo por vez. Conectar um dispositivo ao Wi-Fi ou acessar o vídeo não deve ser suficiente para assumir o controle. Enquanto houver um controlador ativo, as mensagens de outras conexões não devem alterar o acionamento dos motores, renovar o tempo limite desse controlador ou desbloquear movimentos. |
| RF-FC-05 | Informar indisponibilidade do controle | Se outra conexão tentar assumir o controle enquanto já houver um controlador ativo, o firmware deve avisar à conexão solicitante que ela não é o controlador no momento, pois o controle está ocupado. |
| RF-FC-06 | Liberar o movimento em uma nova sessão | Sempre que uma nova sessão de controle for aceita, o firmware deve manter o movimento bloqueado até receber do controlador ativo uma mensagem válida confirmando que todos os controles de movimento estão soltos. Depois dessa confirmação, somente um comando válido decorrente de um novo acionamento poderá iniciar a movimentação. Essa regra também deve valer quando o mesmo dispositivo se reconectar. |
| RF-FC-07 | Informar bloqueio de movimento | Quando o movimento estiver bloqueado aguardando que os controles sejam soltos, o firmware deve informar essa condição ao controlador ativo, caso haja comunicação disponível. A mensagem deve indicar que é necessário soltar todos os controles de movimento antes de pressioná-los novamente. |
| RF-FC-08 | Indicar conexão com o controlador | O firmware deve manter o LED de conexão aceso enquanto houver uma sessão de controle ativa e apagado quando não houver. Se a sessão continuar ativa, mas o movimento estiver bloqueado aguardando que os controles sejam soltos, o LED deve permanecer aceso. Ao encerrar a sessão, o firmware deve apagar o LED. |
| RF-FC-09 | Validar mensagens de controle | Antes de usar uma mensagem de controle, o firmware deve verificar se ela pertence à sessão do controlador ativo, segue o formato combinado entre os subgrupos, contém as informações obrigatórias e usa valores permitidos. Mensagens da sessão ativa que não atendam ao formato, aos campos obrigatórios ou aos valores permitidos devem ser tratadas conforme o RF-FC-18. Mensagens de outras conexões ou de sessões encerradas não devem interferir no controle do robô. |
| RF-FC-10 | Monitorar a continuidade da comunicação | O firmware deve iniciar a contagem do tempo limite quando uma sessão de controle for aceita. A contagem deve ser reiniciada a cada mensagem válida de controle recebida do controlador ativo, inclusive quando ela indicar parada, todos os controles soltos ou uma combinação de direções opostas. Mensagens inválidas, mensagens de outras conexões e tráfego destinado apenas ao vídeo não devem renovar esse tempo. Ao atingir o limite definido, o firmware deve executar o procedimento do RF-FC-19. |
| RF-FC-11 | Movimentar para frente | Quando receber do controlador ativo um comando válido apenas para frente, o firmware deve acionar os motores para que o robô avance, desde que o movimento esteja desbloqueado. |
| RF-FC-12 | Movimentar para trás | Quando receber do controlador ativo um comando válido apenas para trás, o firmware deve acionar os motores para que o robô recue, desde que o movimento esteja desbloqueado. |
| RF-FC-13 | Girar para a esquerda | Quando receber do controlador ativo um comando válido apenas para a esquerda, o firmware deve acionar os motores para que o robô gire à esquerda no próprio eixo, desde que o movimento esteja desbloqueado. |
| RF-FC-14 | Girar para a direita | Quando receber do controlador ativo um comando válido apenas para a direita, o firmware deve acionar os motores para que o robô gire à direita no próprio eixo, desde que o movimento esteja desbloqueado. |
| RF-FC-15 | Combinar deslocamento e giro | Quando receber do controlador ativo um comando válido que indique exatamente uma direção de deslocamento, frente ou trás, e exatamente uma direção de giro, esquerda ou direita, sem direções opostas simultâneas, o firmware deve fazer o robô executar uma curva, desde que o movimento esteja desbloqueado. Ao avançar, a frente do robô deve seguir para o lado solicitado; ao recuar, a traseira deve seguir para esse lado. Direita e esquerda devem ser consideradas em relação ao próprio robô. O firmware deve usar um parâmetro de acionamento para o giro nas curvas menor que o utilizado no giro isolado. Os valores desse parâmetro devem ser definidos e ajustados nos testes. |
| RF-FC-16 | Atualizar o movimento conforme os controles pressionados | Durante o controle normal, o firmware deve interpretar cada atualização válida dos controles enviada pelo controlador ativo. Se o movimento estiver desbloqueado, deve executar o deslocamento, o giro ou a curva correspondente aos controles que permanecerem pressionados. Quando restar apenas esquerda ou direita, deve usar o acionamento definido para o giro isolado. As curvas devem seguir o RF-FC-15. Se todos os controles de movimento forem soltos ou houver direções opostas pressionadas, deve acionar a frenagem conforme o RF-FC-17, mesmo que o movimento esteja bloqueado. |
| RF-FC-17 | Executar frenagem por comando | O firmware deve acionar a frenagem dos motores de locomoção quando receber do controlador ativo uma mensagem válida que indique parada, todos os controles de movimento soltos, frente e trás simultaneamente ou esquerda e direita simultaneamente. A frenagem deve ter prioridade sobre os demais movimentos solicitados na mesma mensagem. Direções opostas pressionadas devem ser tratadas como uma combinação válida de frenagem, mas não devem contar como controles soltos para liberar o movimento pelo RF-FC-06. Um comando de parada, por si só, também não substitui a confirmação de que todos os controles estão soltos. |
| RF-FC-18 | Tratar mensagens inválidas | Se receber uma mensagem de controle inválida do controlador ativo, o firmware deve descartá-la e acionar a frenagem dos motores, sem renovar o tempo limite de comunicação. O próximo comando válido poderá movimentar o robô novamente, desde que a sessão continue ativa e não haja um bloqueio que exija soltar os controles e pressioná-los de novo. |
| RF-FC-19 | Parar e encerrar o controle após perda de comunicação | Ao detectar a desconexão do controlador ativo ou atingir o tempo limite definido no RF-FC-10, o firmware deve acionar a frenagem, bloquear o movimento e encerrar a sessão de controle. O controle deve ficar disponível para uma nova conexão, que deverá seguir o procedimento do RF-FC-06 antes de movimentar o robô. |
| RF-FC-20 | Desconsiderar comandos anteriores à retomada | Depois que uma sessão de controle for encerrada, o firmware deve desconsiderar as mensagens pertencentes a ela. Comandos anteriores à interrupção ou gerados durante a queda de comunicação não devem ser reaproveitados para movimentar o robô na nova sessão. A retomada deve depender da confirmação de controles soltos e de um novo acionamento, conforme o RF-FC-06. |

## Definições e pontos de integração

### Controlador ativo

O controlador ativo é a conexão que recebeu a permissão exclusiva para controlar o robô. Ter uma sessão ativa não significa que o movimento já está desbloqueado.

### Comunicação com a interface

A interface deve enviar periodicamente o estado dos controles, inclusive quando todos estiverem soltos. Também deve informar mudanças nesse estado e descartar comandos acumulados durante uma interrupção.

O formato das mensagens, a identificação das sessões, a frequência de envio e o tempo limite devem ser definidos em conjunto com Interface e Vídeo.

### Frenagem e inicialização

A frenagem significa comandar o comportamento de frenagem previsto para o circuito dos motores, sem prometer que o robô pare instantaneamente.

O acionamento correspondente e a condição dos motores enquanto a placa liga ou reinicia devem ser alinhados com Eletrônica. O RF-FC-01 descreve a atuação do firmware a partir de sua inicialização; a ausência de acionamentos indesejados antes desse momento depende também do circuito.

### Ajuste dos movimentos

Os parâmetros dos motores devem ser ajustados no robô montado. A redução do parâmetro de giro nas curvas não representa, por si só, uma redução proporcional da velocidade real de giro. Os testes devem incluir as mudanças entre curva em ré e giro no próprio eixo.

O giro no próprio eixo foi escolhido para os comandos isolados de esquerda e direita. Essa interpretação dos movimentos pedidos no edital deve ser confirmada com a organização.

### LEDs de indicação

O LED do RF-FC-08 indica a existência de uma sessão de controle. Essa interpretação da indicação de conexão deve ser confirmada com a organização.

Eletrônica deve garantir que o LED de conexão e o de alimentação tenham cores diferentes e sejam visíveis externamente, conforme o edital.

### Escolhas da equipe e integração com vídeo

Wi-Fi próprio, WebSocket, curvas, frenagem e exclusividade do controlador são decisões da equipe para este projeto.

A transmissão de vídeo pertence ao outro subgrupo, mas o controle e o vídeo devem ser integrados e testados funcionando ao mesmo tempo na ESP32-CAM.
