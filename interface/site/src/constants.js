export const PARADO = 'parado';
export const REENVIO_MS = 250;
export const PING_SERVIDOR_MS = 2000;
export const PING_ESP_MS = 3000;
export const RECONEXAO_CAMERA_MS = 3000;
export const LIMITE_ANALOGICO = 0.500;

export const CONFIG_PADRAO = {
  api: 'http://localhost:3001/endpoint-de-comando',
  ws: 'ws://localhost:3001/ws',
  esp: '',
  cam: '',
};

export const SETAS = {
  noroeste: 'M7 17V7h10M7 7l10 10',
  norte: 'M5 15l7-7 7 7',
  nordeste: 'M7 7h10v10M17 7L7 17',
  oeste: 'M15 5l-7 7 7 7',
  leste: 'M9 5l7 7-7 7',
  sudoeste: 'M7 7v10h10M7 17L17 7',
  sul: 'M5 9l7 7 7-7',
  sudeste: 'M17 7v10H7M17 17L7 7',
};

export const LAYOUT = [
  'noroeste', 'norte', 'nordeste',
  'oeste', PARADO, 'leste',
  'sudoeste', 'sul', 'sudeste',
];

export const TECLAS = {
  ArrowUp: 'norte', w: 'norte',
  ArrowDown: 'sul', s: 'sul',
  ArrowLeft: 'oeste', a: 'oeste',
  ArrowRight: 'leste', d: 'leste',
  q: 'noroeste', e: 'nordeste',
  z: 'sudoeste', c: 'sudeste',
  ' ': PARADO,
};

// Força [X, Y] enviada pelo teclado e pelos botões da tela (norte = +Y)
export const VETORES = {
  norte: [0, 100],
  sul: [0, -100],
  oeste: [-100, 0],
  leste: [100, 0],
  noroeste: [-100, 100],
  nordeste: [100, 100],
  sudoeste: [-100, -100],
  sudeste: [100, -100],
  [PARADO]: [0, 0],
};