# Estrutura Analítica do Projeto — Eletrônica

A EAP organiza as entregas do sistema eletrônico do Balloone.

Esta versão parcial contempla os ramos 1.1 — Alimentação e
1.5 — Documentação técnica. Os ramos 1.2, 1.3 e 1.4 serão
incorporados após a conclusão da outra parte.

## Representação visual

![EAP parcial de Eletrônica](imagem-que-ainda-nao-ta-prontapng)

## Entregas

| Código | Entrega | Descrição |
| --- | --- | --- |
| 1.1 | Alimentação | Conjunto responsável pelo fornecimento, regulação e monitoramento da energia. |
| 1.1.1 | Conjunto de baterias e suporte | Duas células 18650 em série e suporte apropriado. |
| 1.1.2 | Circuito liga/desliga | Chave física para acionamento e interrupção da alimentação principal. |
| 1.1.3 | Regulação e distribuição de energia | Regulador LM2596 e distribuição da alimentação com tensões compatíveis com os componentes. |
| 1.1.4 | Circuito de medição da tensão da bateria | Circuito de medição compatível com os limites elétricos da ESP32-CAM. |
| 1.1.5 | Solução de recarga das baterias | Carregador compatível com as células e com a forma de recarga adotada. |
| 1.5 | Documentação técnica | Documentos e registros técnicos da área de Eletrônica. |
| 1.5.1 | Requisitos eletrônicos | Especificação dos requisitos funcionais e não funcionais. |
| 1.5.2 | BOM e referências técnicas | Lista de componentes, quantidades, especificações, justificativas e datasheets disponíveis. |
| 1.5.3 | Diagrama de blocos | Representação dos principais módulos eletrônicos e suas conexões. |
| 1.5.4 | Esquemático elétrico e mapa de pinos | Ligações elétricas do circuito e identificação dos GPIOs utilizados. |
| 1.5.5 | Projeto da PCB e arquivos de fabricação | Layout e arquivos necessários ao processo de fabricação escolhido. |
| 1.5.6 | Registros de testes e resultados | Evidências das verificações elétricas, medições e limitações encontradas. |

A PCB física fabricada e montada será contemplada no ramo
1.4 — Montagem e interligações.