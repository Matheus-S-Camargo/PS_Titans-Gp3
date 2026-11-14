#include <cstdio>
#include <cassert>
#include "movimento.h"
#include "protocolo.h"

void testarMovimento(Movimento recebido, bool &bloqueado) {
    Decisao resultado = interpretarMovimento(recebido, bloqueado);

    std::printf(
        "Entrada: V=%d H=%d | Tipo=%d | Intensidade V=%d%% H=%d%% | Bloqueado=%d\n",
        recebido.vertical,
        recebido.horizontal,
        resultado.estado,
        resultado.intensidadeVertical,
        resultado.intensidadeHorizontal,
        bloqueado
    );
}

int main() {
    bool bloqueado = true;
    Movimento eixos;

    assert(lerEixosDaMensagem("D:50,-30", eixos));
    assert(eixos.vertical == 50);
    assert(eixos.horizontal == -30);

    assert(lerEixosDaMensagem("D:101,0", eixos));
    Decisao decisao = interpretarMovimento(eixos, bloqueado);
    assert(decisao.estado == COMANDO_INVALIDO);

    assert(!lerEixosDaMensagem("PING", eixos));
    assert(!lerEixosDaMensagem("D:50,-30abc", eixos));

    // testarMovimento({50, 0}, bloqueado);
    // testarMovimento({0, 0}, bloqueado);

    // testarMovimento({50, 0}, bloqueado);
    // testarMovimento({-50, 0}, bloqueado);
    // testarMovimento({0, 70}, bloqueado);
    // testarMovimento({50, -30}, bloqueado);
    // testarMovimento({-50, 30}, bloqueado);

    // testarMovimento({101, 0}, bloqueado);

    return 0;
}
