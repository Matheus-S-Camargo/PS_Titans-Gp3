const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3001;
const ORIGEM_PERMITIDA = process.env.CORS_ORIGIN || 'http://localhost:3000';
const ROTA = '/endpoint-de-comando';
const TEMPO_LIMITE_MS = Number(process.env.TEMPO_LIMITE_MS) || 1000;

const PARADO = 'parado';

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

let ultimoComando = PARADO;
let watchdog = null;

function enviarParaDispositivo(comando) {
  // TODO: aqui entra o envio do comando para o dispositivo/robô
}

function aplicarComando(comando) {
  ultimoComando = comando;

  enviarParaDispositivo(comando);

  clearTimeout(watchdog);
  if (comando !== PARADO) {
    watchdog = setTimeout(() => {
      aplicarComando(PARADO);
    }, TEMPO_LIMITE_MS);
  }
}

function responder(res, status = 200) {
  return res.status(status).json({ Comando: ultimoComando });
}

app.get(ROTA, (req, res) => {
  responder(res);
});

app.post(ROTA, (req, res) => {
  const body = req.body ?? {};
  const comando = body.Comando ?? body.comando;

  if (comando === undefined || comando === null || comando === '') {
    aplicarComando(PARADO);
    return responder(res);
  }

  if (!DIRECOES_VALIDAS.has(comando)) {
    aplicarComando(PARADO);
    return responder(res, 400);
  }

  aplicarComando(comando);
  console.log(`Comando recebido: ${comando}`);
  responder(res);
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

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}${ROTA}`);
});