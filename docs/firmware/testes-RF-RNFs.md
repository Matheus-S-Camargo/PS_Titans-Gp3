## Testes planejados — Firmware e Comunicação

Nos testes de movimento, considerar o controlador ativo e o controle liberado, salvo quando indicada outra condição inicial. As mensagens devem seguir o formato acordado com Interface e Vídeo.

## Testes planejados

| Teste | Requisito | Procedimento | Resultado esperado |
| --- | --- | --- | --- |
| CT-FC-01 | RF-FC-01 | Ligar a placa sem controlador. Depois, iniciar um movimento e reiniciar a placa mantendo o botão pressionado. | O firmware inicia no estado de parada, com movimento bloqueado. Após reiniciar, não retoma o movimento automaticamente. |
| CT-FC-02 | RF-FC-06 | Conectar mantendo “frente” pressionado. Soltar todos os controles e pressionar “frente” novamente. Repetir após reconectar. | O movimento permanece bloqueado até receber a confirmação válida de controles soltos. Só começa após o novo acionamento. |
| CT-FC-03 | RF-FC-11 | Com controle liberado, enviar apenas “frente”. | O robô avança. |
| CT-FC-04 | RF-FC-12 | Com controle liberado, enviar apenas “trás”. | O robô recua. |
| CT-FC-05 | RF-FC-13 | Com controle liberado, enviar apenas “esquerda”. | O robô gira à esquerda no próprio eixo. |
| CT-FC-06 | RF-FC-14 | Com controle liberado, enviar apenas “direita”. | O robô gira à direita no próprio eixo. |
| CT-FC-07 | RF-FC-15 | Com controle liberado, testar as quatro combinações de deslocamento e giro. | Ao avançar, a frente segue para o lado solicitado; ao recuar, a traseira segue para esse lado. O acionamento do giro utiliza a redução configurada. |
| CT-FC-08 | RF-FC-16 | Durante frente + direita, soltar apenas “direita”. Repetir e soltar apenas “frente”. Depois, soltar todos os controles. | O robô executa, respectivamente, avanço reto, giro isolado à direita e frenagem, mantendo o controle liberado. |
| CT-FC-09 | RF-FC-17 | Durante o movimento, testar separadamente: parada, controles soltos, frente + trás e esquerda + direita. Adicionar um terceiro botão às combinações opostas. Em uma sessão bloqueada, enviar direções opostas e um comando de parada sem confirmação de controles soltos. | Todas as situações comandam a frenagem. As combinações opostas prevalecem sobre o terceiro botão e renovam o timeout. Na sessão bloqueada, direções opostas e parada sem confirmação de controles soltos não desbloqueiam o movimento. |
| CT-FC-10 | RF-FC-18 | Durante o avanço, enviar uma mensagem inválida do controlador ativo. Antes do timeout, enviar uma mensagem válida de frente. Depois, enviar uma mensagem inválida de outra conexão. | A primeira mensagem provoca frenagem sem renovar o timeout ou criar novo bloqueio. A mensagem válida permite retomar o avanço. A mensagem da outra conexão não interfere no movimento. |
| CT-FC-11 | RNF-FC-01 | Medir o tempo até o comando elétrico de frenagem após identificar uma mensagem inválida do controlador ativo, detectar sua desconexão e vencer o timeout. | Em cada caso, as saídas são atualizadas em até 50 ms. Para timeout, contar desde seu vencimento; nos demais casos, desde a identificação ou detecção. |
| CT-FC-12 | RNF-FC-02 | Interromper as mensagens válidas do controlador ativo. Repetir aceitando uma sessão sem receber nenhuma mensagem de controle. | O timeout vence após 300 ms desde a última mensagem válida ou desde a aceitação da sessão, respectivamente. A sessão é encerrada, o movimento é bloqueado e a frenagem é comandada em até mais 50 ms. |
| CT-FC-13 | RNF-FC-04 | Enviar repetidamente mensagens malformadas, incompletas, com valores não permitidos e acima do tamanho máximo acordado, pelo controlador ativo e por outra conexão. | O firmware não trava nem reinicia. Mensagens inválidas do controlador ativo provocam frenagem; as da outra conexão não interferem no controle. |
| CT-FC-14 | RNF-FC-06 | Alterar os parâmetros de acionamento e redução do giro no local de configuração. Recompilar, gravar e verificar o acionamento. | Os novos valores são aplicados sem modificar a lógica de comunicação, validação ou controle de movimento. |
| CT-FC-15 | RF-FC-02 | Ligar o robô em um ambiente sem acesso à internet ou outras redes. Utilizar um dispositivo para buscar redes disponíveis e conectar. | O firmware cria automaticamente a sua própria rede Wi-Fi e permite a conexão do dispositivo com sucesso, sem depender de internet. |
| CT-FC-16 | RF-FC-03 | Conectar à rede Wi-Fi do robô. Estabelecer conexões WebSocket separadas: uma para o endpoint de controle e outra para o vídeo. Enviar mensagens de controle. | A comunicação via WebSocket é estabelecida com sucesso. O firmware troca mensagens de controle adequadamente e diferencia a conexão de controle da conexão de vídeo. |
| CT-FC-17 | RF-FC-04 | Com um controlador já ativo movimentando o robô, tentar estabelecer uma segunda conexão de controle por outro dispositivo e enviar comandos. | Apenas a primeira conexão controla o robô. Comandos da segunda conexão, acesso ao vídeo ou ao Wi-Fi não alteram o movimento, não renovam o timeout nem desbloqueiam movimentos. |
| CT-FC-18 | RF-FC-05 | Com um controlador já conectado e ativo, utilizar uma segunda conexão para tentar assumir o controle do robô. | O firmware envia uma mensagem de aviso para a segunda conexão informando que o controle está ocupado e ela não é o controlador no momento. |
| CT-FC-19 | RF-FC-07 | Iniciar uma nova sessão de controle com um dos botões de movimento já pressionado, de forma a provocar o bloqueio (conforme RF-FC-06). | O firmware envia uma mensagem ao controlador ativo informando sobre o bloqueio e indicando a necessidade de soltar todos os controles para liberar o movimento. |
| CT-FC-20 | RF-FC-08 | Conectar o controlador (observar o LED). Manter o movimento bloqueado (observar o LED). Desconectar o controlador ou aguardar o timeout (observar o LED). | O LED acende ao aceitar a sessão e permanece aceso inclusive no estado bloqueado. O LED apaga apenas após a desconexão ou o encerramento da sessão por tempo limite. |
| CT-FC-21 | RF-FC-09 | Enviar do controlador ativo: 1) mensagem com formato correto; 2) mensagem sem campos obrigatórios; 3) mensagem com valores não permitidos. | 1) A mensagem movimenta o robô; 2 e 3) O firmware trata como mensagem inválida (frenagem conforme RF-FC-18). Mensagens não interferem se vierem de conexões de terceiros. |
| CT-FC-22 | RF-FC-10 | Enviar repetidamente do controlador ativo: comandos de parada, controles soltos e direções opostas. Depois, intercalar com mensagens inválidas e tráfego de vídeo. | As mensagens válidas (mesmo parada ou direções opostas) renovam o tempo limite. As mensagens inválidas, mensagens de vídeo ou de terceiros não renovam a contagem. |
| CT-FC-23 | RF-FC-19 | Deixar o controlador ativo se desconectar ou estourar o timeout. Em seguida, usar um novo dispositivo para tentar iniciar uma nova sessão de controle. | A sessão anterior é encerrada, os motores são frenados e bloqueados. O controle fica disponível para o novo dispositivo, cuja liberação de movimento exigirá controles soltos (RF-FC-06). |
| CT-FC-24 | RF-FC-20 | Desconectar o controlador durante um comando. Reconectar. Tentar enviar comandos que gerados durante a desconexão ou usar o estado anterior, sem soltar os botões. | Mensagens de sessões anteriores são descartadas. O robô não retoma o movimento; é exigida uma nova confirmação de controles soltos e acionamento inédito na nova sessão. |
| CT-FC-25 | RNF-FC-03 | Com o robô conectado e o tráfego de vídeo ativado consumindo banda, enviar comandos válidos de movimento e parada pela interface. Medir o tempo de resposta. | O tempo entre o envio da mensagem válida e a atualização das saídas dos motores respeita o limite (PAR-FC-04), garantindo o controle mesmo com o vídeo em operação. |
| CT-FC-26 | RNF-FC-05 | Estabelecer conexão com o controlador e, posteriormente, provocar o encerramento da sessão. Medir o tempo de atualização do LED. | O LED é atualizado (aceso ao aceitar, apagado ao encerrar) dentro do prazo limite (PAR-FC-05), sem provocar nenhum atraso nos comandos elétricos de frenagem. |
| CT-FC-27 | RNF-FC-07 | Com a sessão ativa, manter os controles soltos e registrar as mensagens recebidas. Em seguida, pressionar um botão de direção imediatamente após uma mensagem. | O firmware recebe mensagens periódicas com intervalo máximo (PAR-FC-01) informando o estado. Ao alterar um comando, a nova mensagem chega imediatamente, sem aguardar o ciclo. |

**Status:** todos planejados, ainda não executados.

**Pendências para execução:** confirmar os sinais de frenagem, o formato e tamanho máximo das mensagens, o método de medição dos tempos e a quantidade e frequência dos envios no CT-FC-13. Os valores de tempo são provisórios.
### Condições para execução

- Confirmar com Eletrônica os sinais que comandam a frenagem e a ligação dos motores.
- Acordar com Interface e Vídeo o formato e o tamanho máximo das mensagens.
- Definir o método de medição dos tempos e registrar sua precisão.
- Definir a quantidade e a frequência dos envios repetidos no CT-FC-13.
- Registrar o resultado obtido, as versões utilizadas e se cada teste passou ou falhou.

Os testes complementam o documento de requisitos. Quando um teste cobre mais de uma regra, o requisito principal indicado identifica seu foco, sem limitar as verificações adicionais.
