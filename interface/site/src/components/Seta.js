import { ROTACOES } from '../constants';

export default function Seta({ direcao, ativa, onPressionar, onSoltar }) {
  if (!direcao) return <div className="seta-vazia" />;

  return (
    <button
      type="button"
      className={`seta ${ativa ? 'seta--ativa' : ''}`}
      title={direcao}
      onPointerDown={() => onPressionar(direcao)}
      onPointerUp={onSoltar}
      onPointerLeave={onSoltar}
      onPointerCancel={onSoltar}
    >
      <img
        src="/img/seta.png"
        alt={`Seta para ${direcao}`}
        draggable={false}
        style={{ transform: `rotate(${ROTACOES[direcao]}deg)` }}
      />
    </button>
  );
}