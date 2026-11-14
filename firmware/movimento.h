#pragma once

struct Movimento {
    int vertical;
    int horizontal;
};

enum EstadoComando {
    COMANDO_VALIDO,
    PARAR,
    COMANDO_INVALIDO,
    CONTROLE_BLOQUEADO
};

struct Decisao {
    EstadoComando estado;
    int intensidadeVertical;
    int intensidadeHorizontal;
};

bool comandoValido(Movimento recebido);
bool joystickCentralizado(Movimento recebido);
int normalizarEixo(int valorEixo);
Decisao interpretarMovimento(Movimento recebido, bool &bloqueado);