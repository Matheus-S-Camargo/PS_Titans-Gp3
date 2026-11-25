import { useCallback, useEffect, useRef, useState } from 'react';
import { PARADO, REENVIO_MS, VETORES } from '../constants';
import { criarRobotSocket } from '../services/robotService';

export default function useRobotControl(wsUrl) {
  const [ativo, setAtivo] = useState(null);
  const [comandoAtual, setComandoAtual] = useState(PARADO);
  const [delayCmd, setDelayCmd] = useState('--');
  const ativoRef = useRef(null);
  const forcaRef = useRef({ x: 0, y: 0 });
  const timerRef = useRef(null);
  const socketRef = useRef(null);

  // Abre o WebSocket e fecha ao desmontar ou quando a URL mudar
  useEffect(() => {
    const s = criarRobotSocket(wsUrl);
    socketRef.current = s;
    return () => {
      s.fechar();
      if (socketRef.current === s) socketRef.current = null;
    };
  }, [wsUrl]);

  const enviar = useCallback(async (cmd, eixoX = 0, eixoY = 0) => {
    setComandoAtual(cmd);
    const s = socketRef.current;
    if (!s) {
      setDelayCmd('falhou');
      return;
    }
    try {
      const ms = await s.enviar(cmd, eixoX, eixoY);
      setDelayCmd(`${ms} ms`);
    } catch {
      setDelayCmd('falhou');
    }
  }, []);

  // eixoX/eixoY são opcionais: sem eles (teclado, botões), usa o vetor da direção
  const pressionar = useCallback(
    (dir, eixoX, eixoY) => {
      const [vx, vy] = VETORES[dir] ?? [0, 0];
      const x = eixoX ?? vx;
      const y = eixoY ?? vy;

      // Mesma direção: só reenvia se a força mudou (analógico)
      if (ativoRef.current === dir) {
        const f = forcaRef.current;
        if (f.x === x && f.y === y) return;
        forcaRef.current = { x, y };
        enviar(dir, x, y);
        return;
      }

      clearInterval(timerRef.current);
      ativoRef.current = dir;
      forcaRef.current = { x, y };
      setAtivo(dir);
      enviar(dir, x, y);
      if (dir !== PARADO) {
        // O reenvio lê a força mais recente, não a do momento do clique
        timerRef.current = setInterval(
          () => enviar(dir, forcaRef.current.x, forcaRef.current.y),
          REENVIO_MS
        );
      }
    },
    [enviar]
  );

  const soltar = useCallback(
    (dir) => {
      if (ativoRef.current !== dir) return;
      clearInterval(timerRef.current);
      ativoRef.current = null;
      forcaRef.current = { x: 0, y: 0 };
      setAtivo(null);
      if (dir !== PARADO) enviar(PARADO, 0, 0);
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