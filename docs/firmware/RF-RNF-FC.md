# Requisitos do Sistema — Firmware e Comunicação

**Versão: 0.1**

Este documento reúne os requisitos funcionais e não funcionais da parte de Firmware e Comunicação. Os valores de tempo são propostas iniciais para implementação e testes. Os pontos que dependem de outros subgrupos estão identificados nas seções de parâmetros e acordos de integração.

## Requisitos funcionais

| Código | Nome | Descrição |
| --- | --- | --- |
| RF-FC-01 | Inicializar sem movimento | Ao ligar ou reiniciar a placa, o firmware deve iniciar o controle dos motores no estado de parada e manter o movimento bloqueado. A liberação deve seguir o RF-FC-06. Um joystick mantido fora da região de descanso durante a reinicialização não deve provocar a retomada automática do movimento. |
| RF-FC-02 | Disponibilizar rede Wi-Fi | Ao iniciar, o firmware deve criar automaticamente uma rede Wi-Fi própria para conectar o dispositivo de controle ao robô. Essa conexão deve funcionar sem internet e sem depender de outra rede. |
| RF-FC-03 | Estabelecer comunicação de controle | O firmware deve permitir a troca de mensagens de controle e de avisos por WebSocket. As conexões destinadas ao controle devem ser diferenciadas das conexões utilizadas apenas para vídeo. |
| RF-FC-04 | Garantir exclusividade do controlador | O firmware deve conceder o controle à primeira conexão de controle aceita e manter apenas um controlador ativo por vez, inclusive quando houver tentativas simultâneas. Conectar um dispositivo ao Wi-Fi ou acessar o vídeo não deve ser suficiente para assumir o controle. Enquanto houver um controlador ativo, mensagens de outras conexões não devem alterar o acionamento dos motores, renovar o tempo limite desse controlador ou desbloquear movimentos. |
| RF-FC-05 | Informar indisponibilidade do controle | Se outra conexão tentar assumir o controle enquanto já houver um controlador ativo, o firmware deve avisar à conexão solicitante que ela não é o controlador no momento, pois o controle está ocupado. |
| RF-FC-06 | Liberar o movimento em uma nova sessão | Ao aceitar uma nova sessão de controle, o firmware deve manter o movimento bloqueado até receber do controlador ativo uma mensagem válida indicando que os dois eixos do joystick estão dentro da região de descanso definida nos parâmetros. Depois dessa confirmação, uma nova mensagem válida indicando o joystick fora dessa região poderá movimentar o robô. Essa regra também deve valer quando o mesmo dispositivo se reconectar. |
| RF-FC-07 | Informar bloqueio de movimento | Quando o movimento estiver bloqueado aguardando o retorno do joystick à região de descanso, o firmware deve informar essa condição ao controlador ativo, caso haja comunicação disponível. A mensagem deve orientar o operador a retornar o joystick ao centro antes de movimentá-lo novamente. |
| RF-FC-08 | Indicar conexão com o controlador | O firmware deve manter o LED de conexão aceso enquanto houver um controlador ativo e apagado quando não houver. O LED deve apagar após a desconexão ou o encerramento da sessão por tempo limite. Se a sessão continuar ativa, mas o movimento estiver bloqueado aguardando o retorno do joystick à região de descanso, o LED deve permanecer aceso. |
| RF-FC-09 | Validar mensagens de controle | O firmware deve verificar se a mensagem pertence à sessão de controle ativa, segue o formato combinado entre os subgrupos, contém as informações obrigatórias e usa valores permitidos. Nas mensagens que informam a posição do joystick, os valores dos eixos vertical e horizontal devem ser numéricos e estar dentro dos limites definidos nos parâmetros. Mensagens inválidas do controlador ativo devem ser tratadas conforme o RF-FC-18. Mensagens de outras conexões ou de sessões encerradas não devem interferir no controle, conforme os RF-FC-04 e RF-FC-20. |
| RF-FC-10 | Monitorar a continuidade da comunicação | O firmware deve iniciar a contagem do tempo limite ao aceitar uma sessão de controle e renová-la a cada mensagem válida de controle recebida do controlador ativo. Isso inclui mensagens de parada e mensagens com a posição atual do joystick, mesmo quando ele permanecer na região de descanso ou em uma posição sem alterações. Mensagens inválidas, mensagens de outras conexões e tráfego de vídeo não devem renovar essa contagem. Ao atingir o limite definido no RNF-FC-02, o firmware deve executar o procedimento do RF-FC-19. |
| RF-FC-11 | Movimentar para frente | Quando receber do controlador ativo uma mensagem válida com o eixo vertical acima do limite positivo da zona morta e o eixo horizontal dentro da zona morta, o firmware deve comandar o avanço do robô, desde que o movimento esteja desbloqueado. A intensidade solicitada deve aumentar proporcionalmente ao afastamento do eixo vertical em relação à zona morta, até o limite máximo de acionamento configurado. |
| RF-FC-12 | Movimentar para trás | Quando receber do controlador ativo uma mensagem válida com o eixo vertical abaixo do limite negativo da zona morta e o eixo horizontal dentro da zona morta, o firmware deve comandar o recuo do robô, desde que o movimento esteja desbloqueado. A intensidade solicitada deve aumentar proporcionalmente ao afastamento do eixo vertical em relação à zona morta, até o limite máximo de acionamento configurado. |
| RF-FC-13 | Girar para a esquerda | Quando receber do controlador ativo uma mensagem válida com o eixo horizontal abaixo do limite negativo da zona morta e o eixo vertical dentro da zona morta, o firmware deve comandar o giro do robô à esquerda no próprio eixo, desde que o movimento esteja desbloqueado. A intensidade solicitada de giro deve aumentar proporcionalmente ao afastamento do eixo horizontal em relação à zona morta, até o limite máximo de acionamento configurado para o giro. |
| RF-FC-14 | Girar para a direita | Quando receber do controlador ativo uma mensagem válida com o eixo horizontal acima do limite positivo da zona morta e o eixo vertical dentro da zona morta, o firmware deve comandar o giro do robô à direita no próprio eixo, desde que o movimento esteja desbloqueado. A intensidade solicitada de giro deve aumentar proporcionalmente ao afastamento do eixo horizontal em relação à zona morta, até o limite máximo de acionamento configurado para o giro. |
| RF-FC-15 | Combinar deslocamento e giro | Quando receber do controlador ativo uma mensagem válida com os dois eixos do joystick fora de suas respectivas zonas mortas, o firmware deve combinar deslocamento e giro para comandar uma curva, desde que o movimento esteja desbloqueado. O eixo vertical deve definir o sentido e a intensidade solicitada de deslocamento, e o horizontal, o lado e a intensidade solicitada de giro. Ao avançar, a frente do robô deve seguir para o lado solicitado; ao recuar, a traseira deve seguir para esse lado, considerando direita e esquerda em relação ao próprio robô. As intensidades solicitadas devem aumentar proporcionalmente ao afastamento de cada eixo em relação à sua zona morta. Nas curvas, a intensidade de giro deve receber um fator de redução configurável em relação ao giro isolado para o mesmo valor horizontal, respeitando os limites de acionamento dos motores. Durante as curvas, o firmware não deve comandar nenhuma roda no sentido contrário ao deslocamento solicitado, podendo parar uma delas para executar uma curva mais fechada. |
| RF-FC-16 | Atualizar o movimento conforme a posição do joystick. | O firmware deve ajustar o movimento a cada mensagem válida de posição do joystick recebida do controlador ativo. Com o movimento desbloqueado, deve atualizar a direção e a intensidade solicitadas conforme os RF-FC-11 a RF-FC-15, tratando cada eixo dentro de sua zona morta como zero. Quando os dois eixos estiverem na região de descanso, deve acionar a frenagem conforme o RF-FC-17, mesmo que o movimento esteja bloqueado. |
| RF-FC-17 | Executar a frenagem | O firmware deve acionar a frenagem dos motores ao receber do controlador ativo uma mensagem válida de parada ou uma mensagem válida indicando os dois eixos do joystick dentro da região de descanso. A parada deve prevalecer sobre qualquer solicitação de movimento presente na mesma mensagem, independentemente do movimento em execução ou do estado de bloqueio. Um comando de parada, por si só, não deve ser interpretado como confirmação de que o joystick está na região de descanso para liberar o movimento conforme o RF-FC-06. |
| RF-FC-18 | Tratar mensagens inválidas | Se receber uma mensagem de controle inválida do controlador ativo, o firmware deve descartá-la e acionar a frenagem dos motores, sem renovar o tempo limite de recebimento de comandos válidos. O próximo comando válido poderá movimentar o robô novamente, desde que a sessão continue ativa e não haja um bloqueio que exija retornar o joystick à região de descanso antes de deslocá-lo novamente. Mensagens de outras conexões não devem provocar essa frenagem, conforme o RF-FC-04. |
| RF-FC-19 | Encerrar e disponibilizar novamente o controle | Quando detectar que o controlador ativo se desconectou ou quando atingir o tempo limite sem receber mensagens válidas dele, o firmware deve acionar a frenagem, bloquear o movimento e encerrar a sessão de controle. O controle deve ficar disponível para uma nova conexão. A liberação do movimento na nova sessão deve seguir o RF-FC-06. |
| RF-FC-20 | Desconsiderar comandos de sessões encerradas | O firmware deve desconsiderar mensagens pertencentes a sessões de controle encerradas. Comandos anteriores à interrupção ou gerados durante ela não devem ser reaproveitados para movimentar o robô em uma nova sessão. A retomada deve exigir uma mensagem válida confirmando o joystick na região de descanso e, depois, uma nova mensagem válida indicando seu deslocamento para fora dessa região, conforme o RF-FC-06. |

## Requisitos não funcionais

| Código | Nome | Categoria | Descrição |
| --- | --- | --- | --- |
| RNF-FC-01 | Tempo de resposta à parada por falha | Desempenho | Ao identificar uma mensagem inválida do controlador ativo ou detectar sua desconexão, o firmware deve atualizar as saídas para comandar a frenagem dentro do prazo definido em PAR-FC-03. No caso de timeout, esse prazo deve ser contado a partir do vencimento do limite, incluindo o tempo necessário para reconhecer esse vencimento. O prazo termina no comando elétrico de frenagem, não na parada física do robô. |
| RNF-FC-02 | Tempo limite sem comunicação | Desempenho | O firmware deve adotar o tempo limite definido em PAR-FC-02 para monitorar a ausência de mensagens válidas do controlador ativo, seguindo as regras de início e renovação da contagem do RF-FC-10. Ao atingir esse limite, deve executar o procedimento do RF-FC-19, respeitando o prazo de reação do RNF-FC-01. |
| RNF-FC-03 | Tempo de resposta com vídeo ativo | Desempenho | Com a transmissão de vídeo ativa, o tempo entre o envio de uma mensagem válida de controle pela interface e a atualização das saídas dos motores deve respeitar o limite definido em PAR-FC-04, nas condições de operação acordadas para os testes. O requisito se aplica aos comandos do controlador ativo cuja execução esteja permitida pelas regras dos RFs, incluindo a parada por comando. |
| RNF-FC-04 | Tolerância a mensagens inválidas | Confiabilidade | O firmware deve manter seu funcionamento ao receber mensagens de controle malformadas, incompletas, com valores não permitidos ou acima do tamanho máximo acordado para as mensagens. Essas entradas não devem causar travamentos ou reinicializações, nem impedir o tratamento e a frenagem previstos no RF-FC-18 para mensagens do controlador ativo. Mensagens de outras conexões devem respeitar a regra de não interferência do RF-FC-04. |
| RNF-FC-05 | Tempo de atualização do LED | Desempenho | O firmware deve atualizar o acionamento do LED de conexão dentro do prazo definido em PAR-FC-05 após aceitar ou encerrar uma sessão de controle, conforme o RF-FC-08. A atualização do LED não deve atrasar o comando de frenagem. |
| RNF-FC-06 | Facilidade de ajuste dos motores | Suportabilidade | Os parâmetros de acionamento dos motores, de redução do giro nas curvas e dos limites da zona morta do joystick devem ficar centralizados e identificados, permitindo seu ajuste sem reescrever as regras de comunicação, validação e controle de movimento. Esse ajuste pode exigir recompilar e gravar o firmware novamente; não é exigida uma interface de calibração durante a operação. |

### Requisito compartilhado com Interface e Vídeo

O requisito abaixo depende de implementação e acordo com o subgrupo de Interface e Vídeo.

| Código | Nome | Categoria | Descrição |
| --- | --- | --- | --- |
| RNF-FC-07 | Periodicidade das mensagens de controle | Desempenho | Enquanto houver uma sessão de controle ativa, a interface deve enviar os valores atuais dos dois eixos do joystick com intervalo máximo definido em PAR-FC-01, inclusive quando ele estiver na região de descanso ou permanecer em uma posição sem alterações. Quando os valores enviados dos eixos mudarem, a interface deve enviar uma atualização sem aguardar o próximo envio periódico. |

<a id="parametros-provisorios"></a>

## Parâmetros provisórios

Os valores abaixo são propostas da primeira versão, ainda não validadas nos testes. Alterações devem registrar o valor anterior, o novo e o motivo, com alinhamento entre os subgrupos afetados.

| Código | Parâmetro | Valor inicial | Validação necessária |
| --- | --- | --- | --- |
| PAR-FC-01 | Intervalo máximo entre envios periódicos da posição do joystick | 100 ms | Acordar com Interface e Vídeo. Mudanças de posição devem gerar uma atualização sem esperar o próximo envio periódico. |
| PAR-FC-02 | Tempo limite sem mensagens válidas do controlador ativo | 300 ms | Validar com Firmware e Comunicação e Interface e Vídeo. |
| PAR-FC-03 | Prazo máximo para comandar a frenagem após falha | 50 ms | Contar desde a identificação de mensagem inválida, a detecção da desconexão ou o vencimento do timeout. Confirmar os sinais de frenagem com Eletrônica. |
| PAR-FC-04 | Tempo máximo entre o envio de um comando e a atualização das saídas dos motores, com vídeo ativo | 150 ms | Acordar as condições de vídeo e o método de medição com Interface e Vídeo. |
| PAR-FC-05 | Prazo máximo para atualizar o LED após aceitar ou encerrar uma sessão | 100 ms | Validar no firmware e confirmar o LED e o pino com Eletrônica. |
| PAR-FC-06 | Escala dos eixos do joystick | −100 a 100 por eixo | Acordar com Interface e Vídeo. Vertical positivo indica frente; horizontal positivo indica direita. |
| PAR-FC-07 | Zona morta do joystick | −5 a 5 por eixo, incluindo os limites | Validar nos testes e alinhar com Interface e Vídeo. |
| PAR-FC-08 | Fator de redução do giro nas curvas | A definir | Calibrar com Firmware e Comunicação. Deve reduzir o giro em relação ao giro isolado para o mesmo valor horizontal, respeitando o RF-FC-15. |

## Definições e integração

- **Controlador ativo:** conexão que recebeu a permissão de controle. Conectar ao Wi-Fi ou assistir ao vídeo não concede essa permissão.
- **Zona morta e descanso:** cada eixo dentro da zona morta é tratado como zero. O joystick está em descanso quando os dois eixos estão nessa condição.
- **Intensidade:** representa o acionamento solicitado, não uma garantia de velocidade física. Os limites dos motores precisam ser calibrados.
- **Frenagem:** os prazos terminam na atualização das saídas elétricas; a parada física depende dos motores, do circuito e das condições do robô. No timeout, o limite total é de 350 ms desde a última mensagem válida, ou desde a aceitação da sessão se nenhuma tiver chegado. Esses prazos não são pausas a inserir no código.
- **Inicialização:** Eletrônica deve garantir que os motores não sejam acionados involuntariamente antes de o firmware configurar os pinos.
- **Integração:** o formato das mensagens e a representação dos eixos devem ser acordados com Interface e Vídeo. Na interface, soltar o joystick deve fazê-lo retornar ao centro e enviar essa atualização.

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


