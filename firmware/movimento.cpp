#include "movimento.h"

bool comandoValido(Movimento recebido) {
    return recebido.vertical >= -100 && recebido.vertical <= 100 &&
           recebido.horizontal >= -100 && recebido.horizontal <= 100;
}

bool joystickCentralizado(Movimento recebido) {
    return recebido.vertical >= -5 && recebido.vertical <= 5 &&
           recebido.horizontal >= -5 && recebido.horizontal <= 5;
}

int normalizarEixo(int valorEixo) {
    const int limiteZonaMorta = 5;
    const int valorMaximoEixo = 100;
    const int alcanceUtil = valorMaximoEixo - limiteZonaMorta;

    if (valorEixo >= -limiteZonaMorta &&
        valorEixo <= limiteZonaMorta) {
        return 0;
    }

    int sinal = 1;
    int valorAbsoluto = valorEixo;

    if (valorEixo < 0) {
        sinal = -1;
        valorAbsoluto = -valorEixo;
    }

    int distanciaAlemDaZonaMorta = valorAbsoluto - limiteZonaMorta;
    int intensidadePositiva =
        distanciaAlemDaZonaMorta * 100 / alcanceUtil;

    return intensidadePositiva * sinal;
}

Decisao interpretarMovimento(Movimento recebido, bool &bloqueado) {
    Decisao resultado = {COMANDO_VALIDO, 0, 0};

    if (!comandoValido(recebido)) {
        resultado.estado = COMANDO_INVALIDO;
        return resultado;
    }

    if (bloqueado) {
        if (!joystickCentralizado(recebido)) {
            resultado.estado = CONTROLE_BLOQUEADO;
            return resultado;
        }

        bloqueado = false;
    }

    if (joystickCentralizado(recebido)) {
        resultado.estado = PARAR;
        return resultado;
    }

    resultado.intensidadeVertical = normalizarEixo(recebido.vertical);
    resultado.intensidadeHorizontal = normalizarEixo(recebido.horizontal);
    return resultado;
}