import { useEffect, useRef, useState } from 'react';
import './App.css';

function Display() {
  const estiloDisplay = {
    width: '640px',
    height: '360px',
    backgroundColor: '#f0f0f0',
    border: '5px solid #d0830F',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    margin: '0 auto 20px auto'
  };

  return (
    <div style={estiloDisplay}>
      <video width="640" height="360" controls>
        <source type="video/mp4" />
        Seu navegador não suporta a tag de vídeo.
      </video>
    </div>
  );
}


function Seta({ direcao, onClick, estaAtiva }) {
  if (!direcao) {
    return <div style={{ width: '60px', height: '60px' }} />;
  }

  const rotacoes = {
    cima: '0deg',
    baixo: '180deg',
    esquerda: '-90deg',
    direita: '90deg',
    nordeste: '45deg',
    noroeste: '-45deg',
    sudeste: '135deg',
    sudoeste: '-135deg'
  };

  const estiloBotao = {
    width: '60px',
    height: '60px',
    // Se o controle ou mouse ativar a seta, muda para rosa, caso contrário mantém transparente
    backgroundColor: estaAtiva ? '#c72612' : 'transparent',
    border: estaAtiva ? '2px solid #e616a0' : 'NULL',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.1s ease',
    padding: '0',
    transform: estaAtiva ? 'scale(0.92)' : 'scale(1)',
    boxShadow: estaAtiva ? 'inset 0px 2px 5px rgba(0,0,0,0.2)' : 'none'
  };

  const estiloSeta = {
    width: '35px',
    height: '35px',
    transform: `rotate(${rotacoes[direcao] || '0deg'})`,
    transition: 'transform 0.2s ease',
    // Inverte a cor do ícone para branco se o fundo ficar rosa
    filter: 'invert(1)'
  };

  return (
    <button 
      style={estiloBotao} 
      onClick={onClick}
      title={`Clicou em ${direcao}`}
    >
      <img src="/img/seta.png" alt={`Seta para ${direcao}`} style={estiloSeta} />
    </button>
  );
}

function LinhaSetas({ itens = [], direcaoAtiva }) {
  const estiloLinha = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    margin: '10px auto',
    width: 'fit-content'
  };

  return (
    <div style={estiloLinha}>
      {itens.map((item, index) => (
        <Seta 
          key={index} 
          direcao={item.direcao} 
          onClick={item.onClick} 
          estaAtiva={direcaoAtiva === item.direcao}
        />
      ))}
    </div>
  );
}

function App() {
  const gamepadIndexRef = useRef(null);
  const botaoPressionadoRef = useRef(false);
  
  const [direcaoAtiva, setDirecaoAtiva] = useState(null);

  const lidarComClique = (direcao) => {
    console.log(`Ação disparada para a direção: ${direcao}`);
  };

  useEffect(() => {
    const handleConnect = (event) => {
      console.log("Controle Xbox conectado:", event.gamepad.id);
      gamepadIndexRef.current = event.gamepad.index;
    };

    const handleDisconnect = () => {
      console.log("Controle desconectado");
      gamepadIndexRef.current = null;
      setDirecaoAtiva(null);
    };

    window.addEventListener("gamepadconnected", handleConnect);
    window.addEventListener("gamepaddisconnected", handleDisconnect);

    let idLoop;

    const lerControle = () => {
      if (gamepadIndexRef.current !== null) {
        const gamepads = navigator.getGamepads();
        const gp = gamepads[gamepadIndexRef.current];

        if (gp) {
          const x = gp.axes[0]; 
          const y = gp.axes[1]; 
          
          const dPadCima = gp.buttons[12]?.pressed;
          const dPadBaixo = gp.buttons[13]?.pressed;
          const dPadEsquerda = gp.buttons[14]?.pressed;
          const dPadDireita = gp.buttons[15]?.pressed;

          const limite = 0.5; 
          
          const irCima = dPadCima || y < -limite;
          const irBaixo = dPadBaixo || y > limite;
          const irEsquerda = dPadEsquerda || x < -limite;
          const irDireita = dPadDireita || x > limite;

          let direcaoDetectada = null;

          if (irCima && irEsquerda) direcaoDetectada = 'noroeste';
          else if (irCima && irDireita) direcaoDetectada = 'nordeste';
          else if (irBaixo && irEsquerda) direcaoDetectada = 'sudoeste';
          else if (irBaixo && irDireita) direcaoDetectada = 'sudeste';
          else if (irCima) direcaoDetectada = 'cima';
          else if (irBaixo) direcaoDetectada = 'baixo';
          else if (irEsquerda) direcaoDetectada = 'esquerda';
          else if (irDireita) direcaoDetectada = 'direita';

          setDirecaoAtiva(direcaoDetectada);

          if (direcaoDetectada) {
            if (!botaoPressionadoRef.current) {
              lidarComClique(direcaoDetectada);
              botaoPressionadoRef.current = true;
            }
          } else {
            botaoPressionadoRef.current = false;
          }
        }
      }
      idLoop = requestAnimationFrame(lerControle);
    };

    idLoop = requestAnimationFrame(lerControle);

    return () => {
      window.removeEventListener("gamepadconnected", handleConnect);
      window.removeEventListener("gamepaddisconnected", handleDisconnect);
      cancelAnimationFrame(idLoop);
    };
  }, []);

  return (
    <div className="App" style={{ textAlign: 'center', padding: '20px' }}>
      <Display />

      <div className="painel-setas">
        <LinhaSetas direcaoAtiva={direcaoAtiva} itens={[
          { direcao: 'noroeste', onClick: () => lidarComClique('noroeste') },
          { direcao: 'cima', onClick: () => lidarComClique('cima') },         
          { direcao: 'nordeste', onClick: () => lidarComClique('nordeste') }
        ]} />
        
        <LinhaSetas direcaoAtiva={direcaoAtiva} itens={[
          { direcao: 'esquerda', onClick: () => lidarComClique('esquerda') },
          { direcao: null }, 
          { direcao: 'direita', onClick: () => lidarComClique('direita') }
        ]} />
        
        <LinhaSetas direcaoAtiva={direcaoAtiva} itens={[
          { direcao: 'sudoeste', onClick: () => lidarComClique('sudoeste') },
          { direcao: 'baixo', onClick: () => lidarComClique('baixo') },
          { direcao: 'sudeste', onClick: () => lidarComClique('sudeste') }
        ]} />
      </div>
    </div>
  );
}

export default App;