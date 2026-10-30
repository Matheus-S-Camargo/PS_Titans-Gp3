## Linguagem e framework

A proposta é utilizar C++ com o framework Arduino core para ESP32, mantendo o PlatformIO como ambiente de desenvolvimento. Ainda precisamos alinhar essa escolha com Interface e Vídeo, já que os códigos dos dois subgrupos vão funcionar na mesma placa.

Escolhemos C++ porque podemos aproveitar a base que já temos em C, como funções, condições, laços e estruturas, e utilizar as bibliotecas do ambiente Arduino para ESP32. Nenhum de nós programou em C++ ainda, então haverá um aprendizado inicial. A ideia é começar com código simples e usar outros recursos da linguagem conforme forem necessários, sem criar uma estrutura difícil de manter.

O Arduino core foi escolhido por simplificar tarefas comuns, como configurar a rede Wi-Fi e controlar os pinos da placa. Isso permite dedicar mais tempo às regras do robô: receber e validar mensagens, gerenciar o controlador ativo, decidir os movimentos e comandar a frenagem. Usar esse framework não exige utilizar a Arduino IDE; continuaremos trabalhando no PlatformIO.

Consideramos o ESP-IDF, framework da Espressif que também serve de base para o Arduino core do ESP32. Ele oferece acesso mais direto às configurações do sistema e seria interessante caso precisássemos de ajustes específicos. Para nós, porém, exigiria aprender mais sobre esse ambiente junto com a implementação do robô. Como somos dois iniciantes em programação embarcada e temos pouco tempo, preferimos começar pelo Arduino core.

Essa escolha não garante, por si só, o desempenho esperado. Ainda precisamos conferir a compatibilidade das versões e bibliotecas de WebSocket e câmera, além de testar os tempos de resposta com o vídeo funcionando. A proposta poderá ser revista se o alinhamento com Interface e Vídeo mostrar uma necessidade diferente.

### Referências

- [Documentação oficial do Arduino core para ESP32](https://docs.espressif.com/projects/arduino-esp32/en/latest/)
- [Documentação oficial do ESP-IDF](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/index.html)
- [Suporte a ESP32 e frameworks no PlatformIO](https://docs.platformio.org/en/latest/platforms/espressif32.html)
