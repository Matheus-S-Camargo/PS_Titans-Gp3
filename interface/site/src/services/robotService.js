import { CONFIG_PADRAO } from '../constants';

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

/**
 * Cliente WebSocket com reconexão automática.
 * Cada mensagem leva um id; o servidor devolve o mesmo id e o tempo é medido.
 */
export function criarRobotSocket(url) {
  let ws = null;
  let fechado = false;
  let tentativa = 0;
  let seq = 0;
  let timerReconexao = null;
  const pendentes = new Map(); // id -> { t0, resolve, reject, timer }

  const conectar = () => {
    if (fechado) return;
    ws = new WebSocket(url);

    ws.onopen = () => {
      tentativa = 0;
    };

    ws.onmessage = (e) => {
      let m;
      try {
        m = JSON.parse(e.data);
      } catch {
        return;
      }
      const p = pendentes.get(m.id);
      if (!p) return;
      clearTimeout(p.timer);
      pendentes.delete(m.id);
      if (m.ok === false) p.reject(new Error('comando rejeitado'));
      else p.resolve(Math.round(performance.now() - p.t0));
    };

    ws.onclose = () => {
      pendentes.forEach((p) => {
        clearTimeout(p.timer);
        p.reject(new Error('desconectado'));
      });
      pendentes.clear();
      if (fechado) return;
      // backoff de 1 s até 5 s
      timerReconexao = setTimeout(conectar, Math.min(1000 * 2 ** tentativa++, 5000));
    };

    ws.onerror = () => ws.close();
  };

  conectar();

  return {
    /** Envia um comando e devolve o tempo de ida e volta em ms. */
    enviar(comando, eixoX, eixoY) {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        return Promise.reject(new Error('websocket fechado'));
      }
      const id = ++seq;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pendentes.delete(id);
          reject(new Error('timeout'));
        }, 3000);
        pendentes.set(id, { t0: performance.now(), resolve, reject, timer });
        ws.send(JSON.stringify({ id, Comando: comando, EixoX: eixoX, EixoY: eixoY }));
      });
    },
    fechar() {
      fechado = true;
      clearTimeout(timerReconexao);
      ws?.close();
    },
  };
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