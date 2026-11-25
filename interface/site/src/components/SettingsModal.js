import { useState } from 'react';

export default function SettingsModal({ cfg, onSalvar, onFechar }) {
  const [form, setForm] = useState(cfg);
  const campo = (nome) => ({
    value: form[nome],
    onChange: (e) => setForm({ ...form, [nome]: e.target.value }),
  });

  return (
    <div className="cr-modal" onClick={onFechar}>
      <div className="cr-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Configurações</h3>
        <label>URL da API (status do servidor)</label>
        <input {...campo('api')} />
        <label>URL do WebSocket de comando (ex.: ws://localhost:3001/ws)</label>
        <input {...campo('ws')} />
        <label>IP/host da ESP (ex.: 192.168.0.50)</label>
        <input {...campo('esp')} />
        <label>URL do stream da câmera (ex.: http://192.168.0.50:81/stream)</label>
        <input {...campo('cam')} />
        <div className="cr-row">
          <button onClick={() => onSalvar(form)}>Salvar</button>
        </div>
      </div>
    </div>
  );
}