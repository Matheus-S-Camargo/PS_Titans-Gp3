import { useState } from 'react';
import { CONFIG_PADRAO } from '../constants';
import { lerConfig, salvarConfig } from '../services/robotService';

export default function useConfig() {
  const [cfg, setCfg] = useState(lerConfig);

  const salvar = (nova) => {
    const limpa = {
      api: nova.api.trim() || CONFIG_PADRAO.api,
      ws: nova.ws.trim() || CONFIG_PADRAO.ws,
      esp: nova.esp.trim(),
      cam: nova.cam.trim(),
    };
    salvarConfig(limpa);
    setCfg(limpa);
  };

  return { cfg, salvar };
}