export const PARADO = 'parado';
export const REENVIO_MS = 250; 
export const PING_SERVIDOR_MS = 2000;
export const PING_ESP_MS = 3000;
export const RECONEXAO_CAMERA_MS = 3000;
export const LIMITE_ANALOGICO = 0.5;

export const CONFIG_PADRAO = {
  api: 'http://localhost:3001/endpoint-de-comando',
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
