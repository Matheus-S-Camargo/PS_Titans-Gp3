import { API_URL } from '../constants';

export async function enviarComando(direcao) {
  try {
    const resposta = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comando: direcao,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return await resposta.json();
  } catch (erro) {
    console.error('Erro ao comunicar com a API:', erro);
    return null;
  }
}