import { GRADE_DIRECOES } from '../constants';
import Seta from './Seta';

export default function PainelSetas({ direcaoAtiva, onPressionar, onSoltar }) {
  return (
    <div className="painel-setas">
      {GRADE_DIRECOES.flat().map((direcao, i) => (
        <Seta
          key={direcao ?? `vazio-${i}`}
          direcao={direcao}
          ativa={direcao !== null && direcao === direcaoAtiva}
          onPressionar={onPressionar}
          onSoltar={onSoltar}
        />
      ))}
    </div>
  );
}