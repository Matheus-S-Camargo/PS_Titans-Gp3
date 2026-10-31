import { useEffect, useRef } from 'react';
import { LIMITE_ANALOGICO } from '../constants';

function detectarDirecao(gp) {
  const [x = 0, y = 0] = gp.axes;
  const botao = (i) => gp.buttons[i]?.pressed;

  const norte = botao(12) || y < -LIMITE_ANALOGICO;
  const sul = botao(13) || y > LIMITE_ANALOGICO;
  const oeste = botao(14) || x < -LIMITE_ANALOGICO;
  const leste = botao(15) || x > LIMITE_ANALOGICO;

  const vertical = norte ? 'norte' : sul ? 'sul' : '';
  const horizontal = oeste ? 'oeste' : leste ? 'leste' : '';

  const diagonais = {
    'norte|oeste': 'noroeste',
    'norte|leste': 'nordeste',
    'sul|oeste': 'sudoeste',
    'sul|leste': 'sudeste',
  };

  return diagonais[`${vertical}|${horizontal}`] ?? (vertical || horizontal || null);
}

/**
 * Lê o controle e chama onMudanca(direcao | null)
 * apenas quando a direção muda.
 */
export function useGamepad(onMudanca) {
  const callbackRef = useRef(onMudanca);
  callbackRef.current = onMudanca;

  useEffect(() => {
    let indice = null;
    let ultima = null;
    let idLoop;

    const emitir = (direcao) => {
      if (direcao === ultima) return;
      ultima = direcao;
      callbackRef.current(direcao);
    };

    const aoConectar = (e) => {
      console.log('Controle conectado:', e.gamepad.id);
      indice = e.gamepad.index;
    };

    const aoDesconectar = () => {
      console.log('Controle desconectado');
      indice = null;
      emitir(null);
    };

    const ler = () => {
      const gp = indice !== null ? navigator.getGamepads()[indice] : null;
      if (gp) emitir(detectarDirecao(gp));
      idLoop = requestAnimationFrame(ler);
    };

    window.addEventListener('gamepadconnected', aoConectar);
    window.addEventListener('gamepaddisconnected', aoDesconectar);
    idLoop = requestAnimationFrame(ler);

    return () => {
      window.removeEventListener('gamepadconnected', aoConectar);
      window.removeEventListener('gamepaddisconnected', aoDesconectar);
      cancelAnimationFrame(idLoop);
    };
  }, []);
}