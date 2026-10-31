export const API_URL = 'http://localhost:3001/endpoint-de-comando';

// Limite do analógico para considerar que houve movimento
export const LIMITE_ANALOGICO = 0.5;

// Layout do painel (null = espaço vazio no centro)
export const GRADE_DIRECOES = [
  ['noroeste', 'norte', 'nordeste'],
  ['oeste', null, 'leste'],
  ['sudoeste', 'sul', 'sudeste'],
];

export const ROTACOES = {
  norte: 0,
  nordeste: 45,
  leste: 90,
  sudeste: 135,
  sul: 180,
  sudoeste: -135,
  oeste: -90,
  noroeste: -45,
};