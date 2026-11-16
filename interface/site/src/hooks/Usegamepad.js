import { useEffect } from 'react';
import { LIMITE_ANALOGICO } from './constants';

const DIAGONAIS = {
  'norte|oeste': 'noroeste',
  'norte|leste': 'nordeste',
  'sul|oeste': 'sudoeste',
  'sul|leste': 'sudeste',
};

const direcao = (gp) => {
  const [x = 0, y = 0] = gp.axes;
  const btn = (i) => gp.buttons[i]?.pressed;

  const v = (btn(12) || y < -LIMITE_ANALOGICO) ? 'norte' : (btn(13) || y > LIMITE_ANALOGICO) ? 'sul' : '';
  const h = (btn(14) || x < -LIMITE_ANALOGICO) ? 'oeste' : (btn(15) || x > LIMITE_ANALOGICO) ? 'leste' : '';

  return DIAGONAIS[`${v}|${h}`] ?? (v || h || null);
};

export default function useGamepad(pressionar, soltar, soltarAtivo) {
  useEffect(() => {
    let atual = null;
    let estavaConectado = false;
    let frameId;

    const atualizar = (nova) => {
      if (nova === atual) return;
      if (atual) soltar(atual);
      if (nova) pressionar(nova);
      atual = nova;
    };

    const loop = () => {
      const gamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
      const gp = gamepads.find((g) => g && g.connected);

      if (gp) {
        estavaConectado = true;
        atualizar(direcao(gp));
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