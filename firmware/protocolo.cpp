#include <cstdio>
#include "protocolo.h"

bool lerEixosDaMensagem(const char *mensagem, Movimento &movimento) {
    int vertical;
    int horizontal;
    char caractereExtra;

    int camposLidos = std::sscanf(
        mensagem,
        "D:%4d,%4d%c",
        &vertical,
        &horizontal,
        &caractereExtra
    );

    if (camposLidos != 2) {
        return false;
    }

    movimento.vertical = vertical;
    movimento.horizontal = horizontal;
    return true;
}