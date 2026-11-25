import { useCallback, useState } from 'react';
import './App.css';
import { PING_ESP_MS, PING_SERVIDOR_MS } from './constants';
import { consultarServidor, pingEsp } from './services/robotService';
import useConfig from './hooks/useConfig';
import usePing from './hooks/usePing';
import useRobotControl from './hooks/useRobotControl';
import useKeyboard from './hooks/useKeyboard';
import useGamepad from './hooks/useGamepad';
import StatusBar from './components/StatusBar';
import CameraView from './components/CameraView';
import DirectionPad from './components/DirectionPad';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const { cfg, salvar } = useConfig();
  const [configAberta, setConfigAberta] = useState(false);

  const { ativo, comandoAtual, delayCmd, pressionar, soltar, soltarAtivo, sincronizar } =
    useRobotControl(cfg.ws);
  useKeyboard(pressionar, soltar, soltarAtivo);
  useGamepad(pressionar, soltar, soltarAtivo);

  const checarServidor = useCallback(() => consultarServidor(cfg.api), [cfg.api]);
  const checarEsp = useCallback(() => pingEsp(cfg.esp), [cfg.esp]);

  const servidor = usePing(checarServidor, PING_SERVIDOR_MS, (r) => sincronizar(r.comando));
  const esp = usePing(cfg.esp ? checarEsp : null, PING_ESP_MS);

  return (
    <div className="cr">
      <StatusBar
        servidor={servidor}
        esp={esp}
        delayCmd={delayCmd}
        onConfig={() => setConfigAberta(true)}
      />
      <CameraView url={cfg.cam} comando={comandoAtual} />
      <DirectionPad ativo={ativo} pressionar={pressionar} soltar={soltar} />

      {configAberta && (
        <SettingsModal
          cfg={cfg}
          onSalvar={(nova) => {
            salvar(nova);
            setConfigAberta(false);
          }}
          onFechar={() => setConfigAberta(false)}
        />
      )}
    </div>
  );
}