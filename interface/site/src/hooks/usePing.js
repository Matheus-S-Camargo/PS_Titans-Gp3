import { useEffect, useRef, useState } from 'react';

const nivelDoPing = (ms) => (ms < 100 ? 'ok' : ms < 300 ? 'warn' : '');

export default function usePing(check, intervalo, onData) {
  const [estado, setEstado] = useState({ nivel: '', texto: '--' });
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    if (!check) {
      setEstado({ nivel: '', texto: 'não configurada' });
      return;
    }
    let vivo = true;
    const rodar = async () => {
      try {
        const r = await check();
        if (!vivo) return;
        setEstado({ nivel: nivelDoPing(r.ms), texto: `${r.ms} ms` });
        onDataRef.current?.(r);
      } catch {
        if (vivo) setEstado({ nivel: '', texto: 'offline' });
      }
    };
    rodar();
    const id = setInterval(rodar, intervalo);
    return () => {
      vivo = false;
      clearInterval(id);
    };
  }, [check, intervalo]);

  return estado;
}
