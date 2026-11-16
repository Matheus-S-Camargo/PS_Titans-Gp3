import { useEffect, useState } from 'react';
import { RECONEXAO_CAMERA_MS } from '../constants';

export default function CameraView({ url, comando }) {
  const [semSinal, setSemSinal] = useState(true);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => setSemSinal(true), [url]);

  // Se o stream cair, tenta reconectar
  useEffect(() => {
    if (!url || !semSinal) return;
    const id = setTimeout(() => setTentativa((t) => t + 1), RECONEXAO_CAMERA_MS);
    return () => clearTimeout(id);
  }, [url, semSinal, tentativa]);

  const src = url ? `${url}${url.includes('?') ? '&' : '?'}t=${tentativa}` : undefined;

  return (
    <div className="cr-frame">
      {src && (
        <img
          key={tentativa}
          src={src}
          alt="Câmera do robô"
          onLoad={() => setSemSinal(false)}
          onError={() => setSemSinal(true)}
        />
      )}
      {semSinal && (
        <div className="cr-nosig">
          <div>Sem sinal da câmera</div>
        </div>
      )}
      <div className="cr-badge">{comando}</div>
    </div>
  );
}
