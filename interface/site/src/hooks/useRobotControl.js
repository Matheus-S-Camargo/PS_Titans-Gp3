import { useCallback, useEffect, useRef, useState } from 'react';
import { PARADO, REENVIO_MS } from './constants';
import { enviarComando } from '../services/robotService';

export default function useRobotControl(api) {
  const [ativo, setAtivo] = useState(null);
  const [comandoAtual, setComandoAtual] = useState(PARADO);
  const [delayCmd, setDelayCmd] = useState('--');
  const ativoRef = useRef(null);
  const timerRef = useRef(null);

  const enviar = useCallback(
    async (cmd) => {
      setComandoAtual(cmd);
      try {
        const ms = await enviarComando(api, cmd);
        setDelayCmd(`${ms} ms`);
      } catch {
        setDelayCmd('falhou');
      }
    },
    [api]
  );

  const pressionar = useCallback(
    (dir) => {
      if (ativoRef.current === dir) return;
      clearInterval(timerRef.current);
      ativoRef.current = dir;
      setAtivo(dir);
      enviar(dir);
      if (dir !== PARADO) timerRef.current = setInterval(() => enviar(dir), REENVIO_MS);
    },
    [enviar]
  );

  const soltar = useCallback(
    (dir) => {
      if (ativoRef.current !== dir) return;
      clearInterval(timerRef.current);
      ativoRef.current = null;
      setAtivo(null);
      if (dir !== PARADO) enviar(PARADO);
    },
    [enviar]
  );

  const soltarAtivo = useCallback(() => {
    if (ativoRef.current) soltar(ativoRef.current);
  }, [soltar]);

  // Atualiza o comando mostrado com o do servidor, só se nenhum botão estiver ativo
  const sincronizar = useCallback((comando) => {
    if (ativoRef.current === null) setComandoAtual(comando ?? PARADO);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  return { ativo, comandoAtual, delayCmd, pressionar, soltar, soltarAtivo, sincronizar };
}
