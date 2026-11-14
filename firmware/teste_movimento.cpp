#include <cstdio>

struct Movimento {
    int vertical;
    int horizontal;
};

enum Movimentos {
    PARAR,
    AVANCAR,
    RE,
    GIRAR_DIREITA,
    GIRAR_ESQUERDA,
    CURVA_FRENTE_DIREITA,
    CURVA_FRENTE_ESQUERDA,
    CURVA_TRAS_DIREITA,
    CURVA_TRAS_ESQUERDA,
    COMANDO_INVALIDO,
    CONTROLE_BLOQUEADO
};

struct Decisao {
    Movimentos tipo;
    int intensidadeVertical;
    int intensidadeHorizontal;
};

bool validade(Movimento ditocujo) {
    if (ditocujo.vertical >= -100 and ditocujo.vertical <= 100) {
        if (ditocujo.horizontal >= -100 and ditocujo.horizontal <= 100) {
            return true;
        }
    }
    return false;
}

bool repouso(Movimento ditocujo) {
    if (ditocujo.vertical >= -5 and ditocujo.vertical <= 5) {
        if (ditocujo.horizontal >= -5 and ditocujo.horizontal <= 5) {
            return true;
        }
    }
    return false;
}

int intensidade(int eixo) {
    int eixosemsinal = eixo;

    if (eixo < 0) {
        eixosemsinal = -eixo;
    }

    if (eixosemsinal <= 5) return 0;

    return (eixosemsinal - 5) * 100 / 95;
}


Decisao interpretarMovimento(Movimento recebido, bool &bloqueado) {
    Decisao resultado = {PARAR, 0, 0};

    if (!validade(recebido)) {
        resultado.tipo = COMANDO_INVALIDO;
    }
    else if (bloqueado) {
        if (repouso(recebido)) {
            bloqueado = false;
        } else {
            resultado.tipo = CONTROLE_BLOQUEADO;
        }
    }
    else {
        if (repouso(recebido)) {
            resultado.tipo = PARAR;
        }
        // Movimentos simples
        else if (recebido.vertical > 5 &&
                 recebido.horizontal >= -5 && recebido.horizontal <= 5) {
            resultado.tipo = AVANCAR;
            resultado.intensidadeVertical = intensidade(recebido.vertical);
        }
        else if (recebido.vertical < -5 &&
                 recebido.horizontal >= -5 && recebido.horizontal <= 5) {
            resultado.tipo = RE;
            resultado.intensidadeVertical = intensidade(recebido.vertical);
        }
        else if (recebido.horizontal > 5 &&
                 recebido.vertical >= -5 && recebido.vertical <= 5) {
            resultado.tipo = GIRAR_DIREITA;
            resultado.intensidadeHorizontal = intensidade(recebido.horizontal);
        }
        else if (recebido.horizontal < -5 &&
                 recebido.vertical >= -5 && recebido.vertical <= 5) {
            resultado.tipo = GIRAR_ESQUERDA;
            resultado.intensidadeHorizontal = intensidade(recebido.horizontal);
        }
        // Diagonais
        else if (recebido.vertical > 5 && recebido.horizontal > 5) {
            resultado.tipo = CURVA_FRENTE_DIREITA;
            resultado.intensidadeVertical = intensidade(recebido.vertical);
            resultado.intensidadeHorizontal = intensidade(recebido.horizontal);
        }
        else if (recebido.vertical > 5 && recebido.horizontal < -5) {
            resultado.tipo = CURVA_FRENTE_ESQUERDA;
            resultado.intensidadeVertical = intensidade(recebido.vertical);
            resultado.intensidadeHorizontal = intensidade(recebido.horizontal);
        }
        else if (recebido.vertical < -5 && recebido.horizontal > 5) {
            resultado.tipo = CURVA_TRAS_DIREITA;
            resultado.intensidadeVertical = intensidade(recebido.vertical);
            resultado.intensidadeHorizontal = intensidade(recebido.horizontal);
        }
        else if (recebido.vertical < -5 && recebido.horizontal < -5) {
            resultado.tipo = CURVA_TRAS_ESQUERDA;
            resultado.intensidadeVertical = intensidade(recebido.vertical);
            resultado.intensidadeHorizontal = intensidade(recebido.horizontal);
        }
    }

    return resultado;
}

void testarMovimento(Movimento recebido, bool &bloqueado) {
    Decisao resultado = interpretarMovimento(recebido, bloqueado);

    std::printf(
        "Entrada: V=%d H=%d | Tipo=%d | Intensidade V=%d%% H=%d%% | Bloqueado=%d\n",
        recebido.vertical,
        recebido.horizontal,
        resultado.tipo,
        resultado.intensidadeVertical,
        resultado.intensidadeHorizontal,
        bloqueado
    );
}

int main() {
    bool bloqueado = true;

    testarMovimento({50, 0}, bloqueado);
    testarMovimento({0, 0}, bloqueado);

    testarMovimento({50, 0}, bloqueado);
    testarMovimento({-50, 0}, bloqueado);
    testarMovimento({0, 70}, bloqueado);
    testarMovimento({50, -30}, bloqueado);
    testarMovimento({-50, 30}, bloqueado);

    testarMovimento({101, 0}, bloqueado);

    return 0;
}
