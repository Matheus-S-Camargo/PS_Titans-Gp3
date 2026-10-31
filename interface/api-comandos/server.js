const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3001;
const ORIGEM_PERMITIDA = process.env.CORS_ORIGIN || 'http://localhost:3000';
const ROTA = '/endpoint-de-comando';

const DIRECOES_VALIDAS = new Set([
  'norte',
  'sul',
  'oeste',
  'leste',
  'nordeste',
  'noroeste',
  'sudeste',
  'sudoeste',
]);

const app = express();

app.use(cors({ origin: ORIGEM_PERMITIDA }));
app.use(express.json({ limit: '1kb' }));

// Guarda o último comando recebido
let ultimoComando = null;

// Consulta o último comando
app.get(ROTA, (req, res) => {
  if (!ultimoComando) {
    return res.json({
      comando: 'parado',
      timestamp: null,
      mensagem: 'Nenhum comando recebido ainda',
    });
  }

  res.json(ultimoComando);
});

// Recebe um novo comando
app.post(ROTA, (req, res) => {
  const { comando, timestamp } = req.body ?? {};

  if (!DIRECOES_VALIDAS.has(comando)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: `Comando inválido. Use um destes: ${[...DIRECOES_VALIDAS].join(', ')}`,
    });
  }

  ultimoComando = {
    comando,
    timestamp: timestamp ?? null,
    recebidoEm: new Date().toISOString(),
  };

  console.log(`➡️ Comando recebido: ${comando} (em ${timestamp ?? 'sem timestamp'})`);

  // TODO: aqui entra o envio do comando para o dispositivo/robô

  res.status(200).json({
    sucesso: true,
    mensagem: `Comando '${comando}' recebido`,
  });
});

// Rota inexistente
app.use((req, res) => {
  res.status(404).json({ sucesso: false, mensagem: 'Rota não encontrada' });
});

// Erros gerais (inclui JSON malformado)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ sucesso: false, mensagem: 'JSON inválido' });
  }
  console.error('❌ Erro:', err);
  res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}${ROTA}`);
});