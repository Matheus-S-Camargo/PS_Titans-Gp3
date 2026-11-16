import { CONFIG_PADRAO } from './constants';

const CHAVE = 'cfg-robo';

export function lerConfig() {
  try {
    return { ...CONFIG_PADRAO, ...JSON.parse(localStorage.getItem(CHAVE) || '{}') };
  } catch {
    return CONFIG_PADRAO;
  }
}

export function salvarConfig(cfg) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(cfg));
  } catch {}
}

async function fetchComTimeout(url, opcoes = {}, ms = 2000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opcoes, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

/** Envia um comando e devolve o tempo de ida e volta em ms. */
export async function enviarComando(api, comando) {
  const t0 = performance.now();
  const r = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Comando: comando }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return Math.round(performance.now() - t0);
}

/** Consulta o último comando do servidor: { ms, comando }. */
export async function consultarServidor(api) {
  const t0 = performance.now();
  const r = await fetchComTimeout(api);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  return { ms: Math.round(performance.now() - t0), comando: j.Comando };
}

/** Mede se a ESP responde na rede: { ms }. */
export async function pingEsp(host) {
  const t0 = performance.now();
  await fetchComTimeout('http://' + host.replace(/^https?:\/\//, ''), {
    mode: 'no-cors',
    cache: 'no-store',
  });
  return { ms: Math.round(performance.now() - t0) };
}
