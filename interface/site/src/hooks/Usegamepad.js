import { useEffect } from 'react';
import { LIMITE_ANALOGICO } from '../constants';

const DIAGONAIS = {
  'norte|oeste': 'noroeste',
  'norte|leste': 'nordeste',
  'sul|oeste': 'sudoeste',
  'sul|leste': 'sudeste',
};

// Zona morta + reescala: LIMITE_ANALOGICO vira 0 e o extremo (1) vira ±100
const escalar = (v) => {
  const abs = Math.abs(v);
  if (abs <= LIMITE_ANALOGICO) return 0;
  const pct = ((abs - LIMITE_ANALOGICO) / (1 - LIMITE_ANALOGICO)) * 100;
  return Math.round(Math.min(pct, 100)) * Math.sign(v);
};

/** Lê o gamepad e devolve { comando, eixoX, eixoY } ou null se estiver parado/neutro. */
const ler = (gp) => {
  const [ax = 0, ay = 0] = gp.axes;
  const btn = (i) => (gp.buttons[i]?.pressed ? gp.buttons[i]?.value : 0);

  // Analógico com zona morta; o direcional digital sobrescreve com ±100.
  // Internamente segue o Gamepad API: cima = Y negativo.
  let x = escalar(ax);
  let y = escalar(ay);
  if (btn(14)) x = -100;
  else if (btn(15)) x = 100;
  if (btn(12)) y = -100;
  else if (btn(13)) y = 100;

  const v = y < 0 ? 'norte' : y > 0 ? 'sul' : '';
  const h = x < 0 ? 'oeste' : x > 0 ? 'leste' : '';
  const p = btn(0) ? 'parado' : '';

  const comando = DIAGONAIS[`${v}|${h}`] ?? (v || h || p || null);
  if (!comando) return null;

  // Convenção do robô: norte = +Y (o Gamepad API usa norte = -Y)
  return { comando, eixoX: x, eixoY: -y };
};

const igual = (a, b) =>
  a?.comando === b?.comando && a?.eixoX === b?.eixoX && a?.eixoY === b?.eixoY;

export default function useGamepad(pressionar, soltar, soltarAtivo) {
  useEffect(() => {
    let atual = null;
    let estavaConectado = false;
    let frameId;

    const atualizar = (nova) => {
      if (igual(nova, atual)) return;
      // Só solta se o comando mudou; se mudaram apenas os eixos, reenvia
      if (atual && atual.comando !== nova?.comando) soltar(atual.comando);
      if (nova) pressionar(nova.comando, nova.eixoX, nova.eixoY);
      atual = nova;
    };

    const loop = () => {
      const gamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
      const gp = gamepads.find((g) => g && g.connected);

      if (gp) {
        estavaConectado = true;
        atualizar(ler(gp));
      } else if (estavaConectado) {
        estavaConectado = false;
        atual = null;
        soltarAtivo?.();
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameId);
  }, [pressionar, soltar, soltarAtivo]);
}