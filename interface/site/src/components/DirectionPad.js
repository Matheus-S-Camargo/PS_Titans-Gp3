import { LAYOUT, PARADO, SETAS } from '../constants';

export default function DirectionPad({ ativo, pressionar, soltar }) {
  return (
    <div className="cr-pad">
      {LAYOUT.map((dir) => {
        const parar = dir === PARADO;
        return (
          <button
            key={dir}
            title={dir}
            className={`cr-btn${parar ? ' cr-stop' : ''}${ativo === dir ? ' on' : ''}`}
            onPointerDown={(e) => {
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              pressionar(dir);
            }}
            onPointerUp={() => soltar(dir)}
            onPointerCancel={() => soltar(dir)}
            onLostPointerCapture={() => soltar(dir)}
          >
            {parar ? (
              'PARAR'
            ) : (
              <svg viewBox="0 0 24 24">
                <path d={SETAS[dir]} />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
