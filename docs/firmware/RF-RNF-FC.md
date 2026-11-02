# Requisitos do Sistema — Firmware e Comunicação

**Versão: 0.1**

Este documento reúne os requisitos funcionais e não funcionais da parte de Firmware e Comunicação. Os valores de tempo são propostas iniciais para implementação e testes. Os pontos que dependem de outros subgrupos estão identificados nas seções de parâmetros e acordos de integração.

## Requisitos funcionais

| Código | Nome | Descrição |
| --- | --- | --- |
| RF-FC-01 | Inicializar sem movimento | Ao ligar ou reiniciar a placa, o firmware deve iniciar o controle dos motores no estado de parada e manter o movimento bloqueado. A liberação deve seguir o RF-FC-06. Um botão mantido pressionado durante a reinicialização não deve provocar a retomada automática do movimento. |
| RF-FC-02 | Disponibilizar rede Wi-Fi | Ao iniciar, o firmware deve criar automaticamente uma rede Wi-Fi própria para conectar o dispositivo de controle ao robô. Essa conexão deve funcionar sem internet e sem depender de outra rede. |
| RF-FC-03 | Estabelecer comunicação de controle | O firmware deve permitir a troca de mensagens de controle e de avisos por WebSocket. As conexões destinadas ao controle devem ser diferenciadas das conexões utilizadas apenas para vídeo. |
| RF-FC-04 | Garantir exclusividade do controlador | O firmware deve conceder o controle à primeira conexão de controle aceita e manter apenas um controlador ativo por vez, inclusive quando houver tentativas simultâneas. Conectar um dispositivo ao Wi-Fi ou acessar o vídeo não deve ser suficiente para assumir o controle. Enquanto houver um controlador ativo, mensagens de outras conexões não devem alterar o acionamento dos motores, renovar o tempo limite desse controlador ou desbloquear movimentos. |
| RF-FC-05 | Informar indisponibilidade do controle | Se outra conexão tentar assumir o controle enquanto já houver um controlador ativo, o firmware deve avisar à conexão solicitante que ela não é o controlador no momento, pois o controle está ocupado. |
| RF-FC-06 | Liberar o movimento em uma nova sessão | Ao aceitar uma nova sessão de controle, o firmware deve manter o movimento bloqueado até receber do controlador ativo uma mensagem válida confirmando que todos os controles de movimento estão soltos. Depois dessa confirmação, um comando válido decorrente de um novo acionamento poderá movimentar o robô. Essa regra também deve valer quando o mesmo dispositivo se reconectar. |
| RF-FC-07 | Informar bloqueio de movimento | Quando o movimento estiver bloqueado aguardando que os controles sejam soltos, o firmware deve informar essa condição ao controlador ativo, caso haja comunicação disponível. A mensagem deve indicar que é necessário soltar todos os controles de movimento antes de pressioná-los novamente. |
| RF-FC-08 | Indicar conexão com o controlador | O firmware deve manter o LED de conexão aceso enquanto houver um controlador ativo e apagado quando não houver. O LED deve apagar após a desconexão ou o encerramento da sessão por tempo limite. Se a sessão continuar ativa, mas o movimento estiver bloqueado aguardando que os controles sejam soltos, o LED deve permanecer aceso. |
| RF-FC-09 | Validar mensagens de controle | O firmware deve verificar se a mensagem pertence à sessão de controle ativa, segue o formato combinado entre os subgrupos, contém as informações obrigatórias e usa valores permitidos. Mensagens inválidas do controlador ativo devem ser tratadas conforme o RF-FC-18. Mensagens de outras conexões ou de sessões encerradas não devem interferir no controle, conforme os RF-FC-04 e RF-FC-20. |
| RF-FC-10 | Monitorar a continuidade da comunicação | O firmware deve iniciar a contagem do tempo limite ao aceitar uma sessão de controle e renová-la a cada mensagem válida de controle recebida do controlador ativo. Isso inclui mensagens de parada, de controles soltos e de direções opostas simultâneas. Mensagens inválidas, mensagens de outras conexões e tráfego de vídeo não devem renovar essa contagem. Ao atingir o limite definido no RNF-FC-02, o firmware deve executar o procedimento do RF-FC-19. |
| RF-FC-11 | Movimentar para frente | Quando receber do controlador ativo um comando válido apenas para frente, o firmware deve acionar os motores para que o robô avance, desde que o movimento esteja desbloqueado. |
| RF-FC-12 | Movimentar para trás | Quando receber do controlador ativo um comando válido apenas para trás, o firmware deve acionar os motores para que o robô recue, desde que o movimento esteja desbloqueado. |
| RF-FC-13 | Girar para a esquerda | Quando receber do controlador ativo um comando válido apenas para a esquerda, o firmware deve acionar os motores para que o robô gire à esquerda no próprio eixo, desde que o movimento esteja desbloqueado. |
| RF-FC-14 | Girar para a direita | Quando receber do controlador ativo um comando válido apenas para a direita, o firmware deve acionar os motores para que o robô gire à direita no próprio eixo, desde que o movimento esteja desbloqueado. |
| RF-FC-15 | Combinar deslocamento e giro | Quando o controlador ativo enviar um comando válido que combine frente ou trás com esquerda ou direita, o firmware deve comandar uma curva, desde que o movimento esteja desbloqueado. A combinação deve conter apenas uma direção de deslocamento e uma de giro. Ao avançar, a frente do robô deve seguir para o lado solicitado; ao recuar, a traseira deve seguir para esse lado. Direita e esquerda devem ser consideradas em relação ao próprio robô. Nas curvas, o acionamento destinado ao giro deve ser reduzido em relação ao giro isolado, conforme parâmetro definido pela equipe e ajustado nos testes. |
| RF-FC-16 | Atualizar o movimento conforme os controles pressionados | O firmware deve ajustar o movimento a cada atualização válida dos controles enviada pelo controlador ativo. Com o movimento desbloqueado, se ficar pressionado apenas frente ou trás, deve executar esse deslocamento; se ficar apenas esquerda ou direita, deve girar no próprio eixo com o acionamento definido para o giro isolado. As combinações de deslocamento e giro devem seguir o RF-FC-15. Se todos os controles de movimento forem soltos ou houver direções opostas simultâneas, deve acionar a frenagem conforme o RF-FC-17, mesmo que o movimento esteja bloqueado. |
| RF-FC-17 | Executar a frenagem | O firmware deve acionar a frenagem dos motores ao receber do controlador ativo uma mensagem válida de parada, de todos os controles de movimento soltos ou de direções opostas simultâneas: frente e trás, ou esquerda e direita. A frenagem deve prevalecer sobre os demais controles presentes na mesma mensagem, qualquer que seja o movimento em execução. Direções opostas devem renovar o tempo limite de comunicação, mas não devem contar como controles soltos para desbloquear o movimento. Um comando de parada, por si só, também não deve ser interpretado como confirmação de que todos os controles foram soltos. |
| RF-FC-18 | Tratar mensagens inválidas | Se receber uma mensagem de controle inválida do controlador ativo, o firmware deve descartá-la e acionar a frenagem dos motores, sem renovar o tempo limite de recebimento de comandos válidos. O próximo comando válido poderá movimentar o robô novamente, desde que a sessão continue ativa e não haja um bloqueio que exija soltar os controles e pressioná-los de novo. Mensagens de outras conexões não devem provocar essa frenagem, conforme o RF-FC-04. |
| RF-FC-19 | Encerrar e disponibilizar novamente o controle | Quando detectar que o controlador ativo se desconectou ou quando atingir o tempo limite sem receber mensagens válidas dele, o firmware deve acionar a frenagem, bloquear o movimento e encerrar a sessão de controle. O controle deve ficar disponível para uma nova conexão. A liberação do movimento na nova sessão deve seguir o RF-FC-06. |
| RF-FC-20 | Desconsiderar comandos de sessões encerradas | O firmware deve desconsiderar mensagens pertencentes a sessões de controle encerradas. Comandos anteriores à interrupção ou gerados durante ela não devem ser reaproveitados para movimentar o robô em uma nova sessão. A retomada deve exigir a confirmação de controles soltos e um novo acionamento, conforme o RF-FC-06. |

## Requisitos não funcionais

| Código | Nome | Categoria | Descrição |
| --- | --- | --- | --- |
| RNF-FC-01 | Tempo de resposta à parada por falha | Desempenho | Ao identificar uma mensagem inválida do controlador ativo ou detectar sua desconexão, o firmware deve atualizar as saídas para comandar a frenagem dentro do prazo definido em PAR-FC-03. No caso de timeout, esse prazo deve ser contado a partir do vencimento do limite, incluindo o tempo necessário para reconhecer esse vencimento. O prazo termina no comando elétrico de frenagem, não na parada física do robô. |
| RNF-FC-02 | Tempo limite sem comunicação | Desempenho | O firmware deve adotar o tempo limite definido em PAR-FC-02 para monitorar a ausência de mensagens válidas do controlador ativo, seguindo as regras de início e renovação da contagem do RF-FC-10. Ao atingir esse limite, deve executar o procedimento do RF-FC-19, respeitando o prazo de reação do RNF-FC-01. |
| RNF-FC-03 | Tempo de resposta com vídeo ativo | Desempenho | Com a transmissão de vídeo ativa, o tempo entre o envio de uma mensagem válida de controle pela interface e a atualização das saídas dos motores deve respeitar o limite definido em PAR-FC-04, nas condições de operação acordadas para os testes. O requisito se aplica aos comandos do controlador ativo cuja execução esteja permitida pelas regras dos RFs, incluindo a parada por comando. |
| RNF-FC-04 | Tolerância a mensagens inválidas | Confiabilidade | O firmware deve manter seu funcionamento ao receber mensagens de controle malformadas, incompletas, com valores não permitidos ou acima do tamanho máximo acordado para as mensagens. Essas entradas não devem causar travamentos ou reinicializações, nem impedir o tratamento e a frenagem previstos no RF-FC-18 para mensagens do controlador ativo. Mensagens de outras conexões devem respeitar a regra de não interferência do RF-FC-04. |
| RNF-FC-05 | Tempo de atualização do LED | Desempenho | O firmware deve atualizar o acionamento do LED de conexão dentro do prazo definido em PAR-FC-05 após aceitar ou encerrar uma sessão de controle, conforme o RF-FC-08. A atualização do LED não deve atrasar o comando de frenagem. |
| RNF-FC-06 | Facilidade de ajuste dos motores | Suportabilidade | Os parâmetros de acionamento dos motores e de redução do giro nas curvas devem ficar centralizados e identificados, permitindo sua alteração sem modificar a lógica de comunicação, validação e controle de movimento. Esse ajuste pode exigir recompilar e gravar o firmware novamente; não é exigida uma interface de calibração durante a operação. |

### Requisito compartilhado com Interface e Vídeo

O requisito abaixo depende de implementação e acordo com o subgrupo de Interface e Vídeo.

| Código | Nome | Categoria | Descrição |
| --- | --- | --- | --- |
| RNF-FC-07 | Periodicidade das mensagens de controle | Desempenho | Enquanto houver uma sessão de controle ativa, a interface deve enviar o estado atual dos controles com intervalo máximo definido em PAR-FC-01, inclusive quando todos estiverem soltos. Ao mudar o estado de um controle, deve enviar uma atualização sem aguardar o próximo envio periódico. |

<a id="parametros-provisorios"></a>

## Parâmetros provisórios

Os valores abaixo são metas da primeira versão. Ainda precisam ser validados no robô montado, com vídeo e controle funcionando juntos. Não representam resultados já obtidos nos testes.

| Código | Parâmetro | Valor inicial | Validação e acordos necessários |
| --- | --- | --- | --- |
| PAR-FC-01 | Intervalo máximo entre envios periódicos do estado dos controles | 100 ms | **A acordar com Interface e Vídeo.** Confirmar a implementação dos envios periódicos e das atualizações quando os controles mudarem. |
| PAR-FC-02 | Tempo limite sem receber mensagens válidas do controlador ativo | 300 ms | **A validar por Firmware e Comunicação e alinhar com Interface e Vídeo.** Verificar o comportamento com a periodicidade escolhida e com os atrasos observados nos testes. |
| PAR-FC-03 | Prazo máximo para comandar a frenagem após falha | 50 ms | **A validar por Firmware e Comunicação.** Confirmar com Eletrônica quais sinais comandam a frenagem. Para timeout, contar desde o vencimento do limite; para desconexão ou mensagem inválida, desde sua detecção ou identificação. |
| PAR-FC-04 | Tempo máximo entre o envio de um comando pela interface e a atualização das saídas dos motores, com vídeo ativo | 150 ms | **A acordar e testar com Interface e Vídeo.** Definir as configurações de vídeo, as condições de operação e o método de medição. |
| PAR-FC-05 | Prazo máximo para atualizar o LED após aceitar ou encerrar uma sessão | 100 ms | **A validar por Firmware e Comunicação, com apoio de Eletrônica.** Confirmar o LED e o pino utilizados. |

### Como os tempos se relacionam

- A interface deve enviar o estado dos controles pelo menos a cada 100 ms, mesmo sem mudanças. Quando houver uma mudança, deve enviar uma atualização sem esperar o próximo envio periódico.
- Se nenhuma nova mensagem válida chegar, o tempo limite vence 300 ms depois da última mensagem válida recebida. Se ainda não houver uma primeira mensagem válida, a contagem começa quando a sessão é aceita.
- Depois do vencimento, o firmware tem até 50 ms para atualizar as saídas e comandar a frenagem. Portanto, nesse caso, o prazo total é de até 350 ms desde a última mensagem válida recebida, ou desde a aceitação da sessão quando nenhuma mensagem válida tiver chegado.
- Se a desconexão for detectada antes do timeout, o firmware deve iniciar o procedimento de encerramento e comandar a frenagem dentro dos 50 ms previstos, sem esperar completar os 300 ms.
- Para uma mensagem inválida do controlador ativo, o prazo de 50 ms começa quando ela é identificada como inválida.
- Uma parada solicitada normalmente pela interface segue o limite de 150 ms entre o envio e a atualização das saídas, com vídeo ativo. Os 50 ms de reação à falha não são somados a esse prazo.
- O prazo de 100 ms do LED começa quando a sessão é aceita ou encerrada, e não necessariamente no instante em que o sinal de rede é perdido.
- Esses tempos terminam na atualização das saídas do firmware. O robô ainda pode levar um tempo adicional para parar fisicamente, dependendo da velocidade, do piso, da carga e do circuito dos motores.

Os valores são limites de resposta, não pausas que devem ser inseridas no programa. O firmware deve reagir assim que puder.

### Revisão dos valores

Os parâmetros poderão ser alterados após os testes. Cada alteração deve registrar o valor anterior, o novo valor e o motivo da mudança.

Quando a alteração afetar a comunicação ou a integração, ela deve ser alinhada com os subgrupos envolvidos. Antes de aumentar um limite por causa de falhas nos testes, a equipe deve investigar a origem dos atrasos e avaliar o efeito da mudança no controle do robô.

## Definições e integração

### Controlador ativo

É a conexão à qual o firmware concedeu a sessão de controle. Estar conectado à rede Wi-Fi ou assistir ao vídeo não torna um dispositivo o controlador ativo.

Uma sessão pode estar ativa enquanto o movimento permanece bloqueado, aguardando a liberação dos controles. Nesse caso, o LED de conexão permanece aceso.

### Frenagem e inicialização

Neste documento, comandar a frenagem significa atualizar as saídas para o estado elétrico de frenagem acordado com Eletrônica. Isso não significa que o robô ficará fisicamente imóvel no mesmo instante.

O comportamento dos motores antes de o firmware configurar os pinos também precisa ser tratado com Eletrônica. O circuito deve impedir o acionamento involuntário durante a energização e a reinicialização da placa, até que o firmware estabeleça o estado de parada.

### Movimentos e curvas

Esquerda e direita são consideradas em relação ao próprio robô. Ao avançar em curva, a frente segue para o lado solicitado. Ao recuar em curva, a traseira segue para esse lado.

A redução de giro nas curvas será um parâmetro de acionamento dos motores. Seu valor será definido durante a calibração. Uma redução no parâmetro não representa, necessariamente, a mesma redução na velocidade física de giro.

## Pendências e acordos entre subgrupos

| Assunto | O que precisa ser definido ou confirmado | Envolvidos |
| --- | --- | --- |
| Formato das mensagens | Campos obrigatórios, valores permitidos, tamanho máximo das mensagens e identificação da sessão de controle. | Firmware e Comunicação; Interface e Vídeo |
| Periodicidade e timeout | Confirmar PAR-FC-01 e PAR-FC-02, incluindo o envio quando os controles mudarem e quando estiverem soltos. | Firmware e Comunicação; Interface e Vídeo |
| Comandos de sessões encerradas | Definir como impedir o reaproveitamento de comandos anteriores ou gerados durante uma interrupção, conforme o RF-FC-20. | Firmware e Comunicação; Interface e Vídeo |
| Comandos atrasados na mesma sessão | Definir como reconhecer comandos que ficaram antigos durante um atraso, qual atraso será aceitável e como tratá-los sem descartar informações necessárias à liberação dos controles. | Firmware e Comunicação; Interface e Vídeo |
| Vídeo durante os testes | Definir resolução, taxa de quadros, condições da rede e método de medição para validar PAR-FC-04. | Firmware e Comunicação; Interface e Vídeo |
| Inicialização elétrica | Confirmar como o circuito impedirá o acionamento involuntário dos motores antes de o firmware configurar as saídas no estado de parada. | Firmware e Comunicação; Eletrônica |
| Comando elétrico de frenagem | Confirmar o driver utilizado e os sinais necessários para executar a frenagem, diferenciando-a do simples desligamento do acionamento. | Firmware e Comunicação; Eletrônica |
| Parada física do robô | Medir tempo e distância de parada com velocidade, carga e piso definidos. Os limites aceitáveis ainda precisam ser acordados. | Firmware e Comunicação; Eletrônica; Mecânica |
| Calibração dos motores | Definir os parâmetros de deslocamento, giro isolado e redução de giro nas curvas. | Firmware e Comunicação; Eletrônica; Mecânica |
| LED de conexão | Confirmar LED, pino, montagem e visibilidade externa, além da diferenciação em relação ao LED de alimentação prevista no edital. | Firmware e Comunicação; Eletrônica |
| Interpretação do indicador de conexão | Confirmar se indicar uma sessão de controle ativa atende à interpretação esperada para o LED de conexão exigido no edital. | Equipe; organização |
| Interpretação dos giros | Confirmar se o giro no próprio eixo atende ao movimento para esquerda e direita esperado no edital. | Equipe; organização |


