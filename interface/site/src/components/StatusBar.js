function Chip({ rotulo, nivel = '', valor }) {
  return (
    <div className="cr-chip">
      <i className={`cr-dot ${nivel}`} />
      {rotulo} <b>{valor}</b>
    </div>
  );
}

export default function StatusBar({ servidor, esp, delayCmd, onConfig }) {
  return (
    <header className="cr-header">
      <h1>
        Controle <span>do Robô</span>
      </h1>
      <div className="cr-chips">
        <Chip rotulo="Servidor" nivel={servidor.nivel} valor={servidor.texto} />
        <Chip rotulo="ESP" nivel={esp.nivel} valor={esp.texto} />
        <div className="cr-chip">
          Delay comando <b>{delayCmd}</b>
        </div>
        <button className="cr-gear" title="Configurações" onClick={onConfig}>
          ⚙
        </button>
      </div>
    </header>
  );
}
