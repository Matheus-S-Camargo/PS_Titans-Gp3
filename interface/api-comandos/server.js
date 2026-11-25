const http = require('http');
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3001;
const ORIGEM_PERMITIDA = process.env.CORS_ORIGIN || 'http://localhost:3000';
const ROTA = '/endpoint-de-comando';
const ROTA_WS = '/ws';
const TEMPO_LIMITE_MS = Number(process.env.TEMPO_LIMITE_MS) || 1000;

const PARADO = 'parado';
const FORCA_MAX = 100;

const DIRECOES_VALIDAS = new Set([
  'norte',
  'sul',
  'oeste',
  'leste',
  'nordeste',
  'noroeste',
  'sudeste',
  'sudoeste',
  PARADO,
]);

const app = express();

app.use(cors({ origin: ORIGEM_PERMITIDA }));
app.use(express.json({ limit: '1kb' }));

let estado = { comando: PARADO, eixoX: 0, eixoY: 0 };
let watchdog = null;

function enviarParaDispositivo({ comando, eixoX, eixoY }) {
  // TODO: aqui entra o envio do comando e das forças para o dispositivo/robô
}

// Converte para inteiro em -100..100. Ausente vira 0; valor inválido vira null.
function normalizarEixo(v) {
  if (v === undefined || v === null || v === '') return 0;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(-FORCA_MAX, Math.min(FORCA_MAX, Math.round(n)));
}

function aplicarComando(comando, eixoX = 0, eixoY = 0) {
  // Parado nunca carrega força
  estado =
    comando === PARADO
      ? { comando: PARADO, eixoX: 0, eixoY: 0 }
      : { comando, eixoX, eixoY };

  enviarParaDispositivo(estado);

  // Recarrega o watchdog a cada comando recebido
  clearTimeout(watchdog);
  watchdog = null;
  if (comando !== PARADO) {
    watchdog = setTimeout(() => aplicarComando(PARADO), TEMPO_LIMITE_MS);
  }
}

// Valida e aplica (usado por HTTP e WebSocket). Retorna true se foi aceito.
function processar(body = {}) {
  const comando = body.Comando ?? body.comando;
  const eixoX = normalizarEixo(body.EixoX ?? body.eixoX);
  const eixoY = normalizarEixo(body.EixoY ?? body.eixoY);

  if (comando === undefined || comando === null || comando === '') {
    aplicarComando(PARADO);
    return true;
  }

  if (!DIRECOES_VALIDAS.has(comando) || eixoX === null || eixoY === null) {
    aplicarComando(PARADO);
    return false;
  }

  aplicarComando(comando, eixoX, eixoY);
  console.log(`Comando recebido: ${comando} (X=${eixoX}, Y=${eixoY})`);
  return true;
}

const resposta = () => ({
  Comando: estado.comando,
  EixoX: estado.eixoX,
  EixoY: estado.eixoY,
});

function responder(res, status = 200) {
  return res.status(status).json(resposta());
}

// ---------- HTTP ----------
app.get(ROTA, (req, res) => {
  responder(res);
});

app.post(ROTA, (req, res) => {
  const ok = processar(req.body);
  responder(res, ok ? 200 : 400);
});

app.use((req, res) => {
  res.sendStatus(404);
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    aplicarComando(PARADO);
    return responder(res, 400);
  }
  console.error('Erro:', err);
  res.sendStatus(500);
});

// ---------- WebSocket ----------
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: ROTA_WS });

wss.on('connection', (ws) => {
  ws.send(JSON.stringify(resposta())); // estado atual ao conectar

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      aplicarComando(PARADO);
      return ws.send(JSON.stringify({ erro: 'json inválido' }));
    }
    const ok = processar(msg);
    // devolve o id para o cliente medir a latência
    ws.send(JSON.stringify({ id: msg.id, ok, ...resposta() }));
  });

  // Sem ninguém conectado, o robô para
  ws.on('close', () => {
    if (wss.clients.size === 0) aplicarComando(PARADO);
  });
});

server.listen(PORT, () => {
  console.log(`API em http://localhost:${PORT}${ROTA} | WS em ws://localhost:${PORT}${ROTA_WS}`);
});