import { useEffect } from 'react';
import { TECLAS } from './constants';

const direcao = (k) => TECLAS[k.length === 1 ? k.toLowerCase() : k];

export default function useKeyboard(pressionar, soltar, soltarAtivo) {
  useEffect(() => {
    const down = (e) => {
      const d = direcao(e.key);
      if (d && !e.repeat) {
        e.preventDefault();
        pressionar(d);
      }
    };
    const up = (e) => {
      const d = direcao(e.key);
      if (d) soltar(d);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', soltarAtivo);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', soltarAtivo);
    };
  }, [pressionar, soltar, soltarAtivo]);
}
