import { useCallback, useState } from 'react';
import './App.css';
import Display from './components/Display';
import PainelSetas from './components/PainelSetas';
import { useGamepad } from './hooks/Usegamepad';
import { enviarComando } from './services/api';

export default function App() {
  const [direcaoAtiva, setDirecaoAtiva] = useState(null);

  // Usado pelo mouse/toque e pelo controle
  const definirDirecao = useCallback((direcao) => {
    setDirecaoAtiva(direcao);
    if (direcao) enviarComando(direcao);
  }, []);

  const soltar = useCallback(() => setDirecaoAtiva(null), []);

  useGamepad(definirDirecao);

  return (
    <div className="App">
      <Display />
      <PainelSetas
        direcaoAtiva={direcaoAtiva}
        onPressionar={definirDirecao}
        onSoltar={soltar}
      />
    </div>
  );
}