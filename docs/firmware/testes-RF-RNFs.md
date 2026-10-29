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

**Status:** todos planejados, ainda não executados.

**Pendências para execução:** confirmar os sinais de frenagem, o formato e tamanho máximo das mensagens, o método de medição dos tempos e a quantidade e frequência dos envios no CT-FC-13. Os valores de tempo são provisórios.
### Condições para execução

- Confirmar com Eletrônica os sinais que comandam a frenagem e a ligação dos motores.
- Acordar com Interface e Vídeo o formato e o tamanho máximo das mensagens.
- Definir o método de medição dos tempos e registrar sua precisão.
- Definir a quantidade e a frequência dos envios repetidos no CT-FC-13.
- Registrar o resultado obtido, as versões utilizadas e se cada teste passou ou falhou.

Os testes complementam o documento de requisitos. Quando um teste cobre mais de uma regra, o requisito principal indicado identifica seu foco, sem limitar as verificações adicionais.
