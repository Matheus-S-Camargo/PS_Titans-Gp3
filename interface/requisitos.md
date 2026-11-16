# Requisitos do Projeto: Painel de Controle Remoto

## 1. Visão geral

Aplicação web para enviar comandos de direção a um dispositivo remoto, usando botões na tela (mouse ou toque) ou um controle de videogame (gamepad). A página também tem uma área de vídeo para acompanhar o dispositivo. Os comandos passam por uma API que recebe e registra cada direção enviada.

O projeto tem duas partes:

| Parte | Pasta | Tecnologia |
|---|---|---|
| Site (front-end) | raiz do projeto / `src` | React (Create React App) |
| API de comandos | `api-comandos` | Node.js + Express |

## 2. Requisitos funcionais

### Site

| ID | Requisito |
|---|---|
| RF01 | O sistema deve exibir um painel com 8 setas: cima, baixo, esquerda, direita, nordeste, noroeste, sudeste e sudoeste. |
| RF02 | Ao pressionar uma seta (mouse ou toque), o sistema deve enviar o comando correspondente à API. |
| RF03 | A seta pressionada deve ficar destacada visualmente enquanto estiver ativa. |
| RF04 | O sistema deve detectar um controle conectado e aceitar o direcional (D-pad) e o analógico esquerdo como entrada. |
| RF05 | O sistema deve identificar diagonais quando duas direções são acionadas ao mesmo tempo. |
| RF06 | O comando do controle só deve ser enviado quando a direção mudar, sem repetir a cada leitura. |
| RF07 | Ao desconectar o controle, o destaque da seta deve ser removido. |
| RF08 | O sistema deve exibir uma área de vídeo com controles de reprodução. |

### API

| ID | Requisito |
|---|---|
| RF09 | `POST /endpoint-de-comando` deve receber `comando` e `timestamp` em JSON e registrar o comando. |
| RF10 | A API deve aceitar apenas os 8 comandos válidos e responder `400` para qualquer outro valor. |
| RF11 | `GET /endpoint-de-comando` deve devolver o último comando recebido. |
| RF12 | A API deve responder `404` para rotas inexistentes e `400` para JSON malformado. |

## 3. Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF01 | O envio de comandos não deve travar a interface: falhas de rede são tratadas e registradas no console. |
| RNF02 | Os botões devem funcionar tanto com mouse quanto com toque, sem enviar o comando duas vezes. |
| RNF03 | O painel deve ser acessível pelo teclado, com foco visível nos botões. |
| RNF04 | O display do vídeo deve se adaptar a telas menores (`max-width: 100%`). |
| RNF05 | A API deve restringir o CORS à origem do site, configurável por variável de ambiente. |
| RNF06 | A porta da API e a URL usada pelo site devem ser configuráveis por variáveis de ambiente. |
| RNF07 | O código do site deve seguir a organização por responsabilidade: componentes, hooks, serviços e constantes. |

## 4. Contrato da API

**Base:** `http://localhost:3001/endpoint-de-comando`

### POST: enviar comando

Requisição:
```json
{
  "comando": "cima",
  "timestamp": "2026-10-31T15:42:10.123Z"
}
```

Resposta `200`:
```json
{
  "sucesso": true,
  "mensagem": "Comando 'cima' recebido"
}
```

Resposta `400` (comando inválido):
```json
{
  "sucesso": false,
  "mensagem": "Comando inválido. Use um destes: cima, baixo, esquerda, direita, nordeste, noroeste, sudeste, sudoeste"
}
```

### GET: último comando

Resposta `200`:
```json
{
  "comando": "cima",
  "timestamp": "2026-10-31T15:42:10.123Z",
  "recebidoEm": "2026-10-31T15:42:10.150Z"
}
```

Sem nenhum comando recebido ainda:
```json
{
  "comando": null,
  "timestamp": null,
  "mensagem": "Nenhum comando recebido ainda"
}
```

## 5. Comandos válidos

`cima` · `baixo` · `esquerda` · `direita` · `nordeste` · `noroeste` · `sudeste` · `sudoeste`

## 6. Mapeamento do controle

| Entrada | Direção |
|---|---|
| D-pad (botões 12, 13, 14, 15) | cima, baixo, esquerda, direita |
| Analógico esquerdo (eixos 0 e 1), limite de 0,5 | cima, baixo, esquerda, direita |
| Duas direções ao mesmo tempo | diagonais (nordeste, noroeste, sudeste, sudoeste) |

O mapeamento foi pensado para controle de Xbox. Outros controles podem ter numeração de botões diferente.

## 7. Requisitos de ambiente

- Node.js e npm instalados
- Navegador com suporte à Gamepad API (Chrome, Edge ou Firefox)
- Para o controle ser detectado, é preciso apertar um botão nele depois de abrir a página

## 8. Variáveis de ambiente

| Variável | Onde | Padrão | Uso |
|---|---|---|---|
| `REACT_APP_API_URL` | site (`.env` na raiz) | `http://localhost:3001/endpoint-de-comando` | endereço da API |
| `PORT` | API | `3001` | porta da API |
| `CORS_ORIGIN` | API | `http://localhost:3000` | origem permitida pelo CORS |

Alterações no `.env` só valem depois de reiniciar o servidor.

## 9. Como executar

**API**
```bash
cd api-comandos
npm install
node server.js
```

**Site**
```bash
npm install
npm start
```

O site abre em `http://localhost:3000` e a API responde em `http://localhost:3001`.

## 10. Estrutura do front-end

```
src/
├── App.js                  # estado e composição
├── App.css                 # estilos
├── constants.js            # URL da API, rotações, grade de direções
├── services/api.js         # envio de comandos
├── hooks/useGamepad.js     # leitura do controle
└── components/
    ├── Display.js          # área de vídeo
    ├── PainelSetas.js      # grade de setas
    └── Seta.js             # botão individual
```

## 11. Pendências e pontos em aberto

- Definir a fonte do vídeo (`src` do componente `Display`).
- Integrar a API ao dispositivo real (há um `TODO` no `server.js`).
- Avaliar um comando de "parar" ao soltar a seta ou o controle.
- Decidir se a API precisa guardar histórico de comandos, hoje só o último, em memória.
- Definir autenticação, caso a API seja exposta fora da rede local.