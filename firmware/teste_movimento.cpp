#include <cstdio>

struct Movimento {
    int vertical;
    int horizontal;
};

bool validade(Movimento ditocujo){
    if (ditocujo.vertical >= -100 and ditocujo.vertical <= 100){
        if (ditocujo.horizontal >= -100 and ditocujo.horizontal <= 100){
            return true;
        }
    }
    return false;
}

bool repouso(Movimento ditocujo){
    if (ditocujo.vertical >= -5 and ditocujo.vertical <= 5){
        if (ditocujo.horizontal >= -5 and ditocujo.horizontal <= 5){
            return true;
        }
    }
    return false;
}

int intensidade (int eixo){
    int eixosemsinal = eixo;
    if (eixo < 0) {
        eixosemsinal = -eixo;
    }
    if (eixosemsinal <= 5) return 0;
    return (eixosemsinal - 5) * 100 / 95;
}

int main(){
    Movimento tras = {-100, 0};
    Movimento direita = {0, 100};
    Movimento descanso = {0, 0};
    Movimento horizontalInvalido = {0, 101};/*
    Movimento verticalInvalido = {-101, 0};
    Movimento limiteRepouso = {5, -5};
    Movimento foraRepouso = {6, 0};*/
    Movimento recebido = tras;
    bool bloqueado = true;

    if (validade(tras) and repouso(tras)){
        bloqueado = false;
    }
    std::printf("tras: %d\n", bloqueado);
    if (validade(direita) and repouso(direita)){
        bloqueado = false;
    }
    std::printf("direita: %d\n", bloqueado);
    if(validade(horizontalInvalido) and repouso(horizontalInvalido)){
        bloqueado = false;
    }
    std::printf("horizontalinválido: %d\n", bloqueado);
    if (validade(descanso) and repouso(descanso)){
        bloqueado = false;
    }
    if (validade(recebido) and recebido.vertical < -5 and recebido.horizontal <= 5 and recebido.horizontal >= -5 and bloqueado == 0){
        std::printf("RECUAR: %d%%\n", intensidade(recebido.vertical));
    } else if (validade(recebido) and recebido.vertical > 5 and recebido.horizontal <= 5 and recebido.horizontal >= -5 and !bloqueado){
        std::printf("AVANÇAR: %d%%\n", intensidade(recebido.vertical));
    } else if (validade(recebido) and recebido.vertical <= 5 and recebido.vertical >= -5 and recebido.horizontal > 5 and !bloqueado){
        std::printf("GIRAR DIREITA: %d%%\n", intensidade(recebido.horizontal));
    } else if (validade(recebido) and recebido.vertical <= 5 and recebido.vertical >= -5 and recebido.horizontal < -5 and !bloqueado){
        std::printf("GIRAR ESQUERDA: %d%%\n", intensidade(recebido.horizontal));
    } else if(validade(recebido) and repouso(recebido)){
        std::printf("FREAR\n");
    } else if(validade(recebido) and recebido.vertical > 5 and recebido.horizontal > 5 and !bloqueado){
        std::printf("CURVA FRENTE: %d%% DIREITA: %d%%\n", intensidade(recebido.vertical), intensidade(recebido.horizontal));
    } else if(validade(recebido) and recebido.vertical < -5 and recebido.horizontal > 5 and !bloqueado){
        std::printf("CURVA FRENTE: %d%% ESQUERDA: %d%%\n", intensidade(recebido.vertical), intensidade(recebido.horizontal));
    } else if(validade(recebido) and recebido.vertical > 5 and recebido.horizontal < -5 and !bloqueado){
        std::printf("CURVA TRAS: %d%% DIREITA: %d%%\n", intensidade(recebido.vertical), intensidade(recebido.horizontal));
    } else if(validade(recebido) and recebido.vertical < -5 and recebido.horizontal < -5 and !bloqueado){
        std::printf("CURVA TRAS: %d%% ESQUERDA: %d%%\n", intensidade(recebido.vertical), intensidade(recebido.horizontal));
    }

    /*
    std::printf("descanso: %d\n", bloqueado);
    std::printf("tras: %d\n", bloqueado);
    std::printf("Vertical: %d, Horizontal: %d\n", direita.vertical, direita.horizontal);
    std::printf("direita: %d\n", validade(direita));
    std::printf("Vertical: %d, Horizontal: %d\n", descanso.vertical, descanso.horizontal);
    std::printf("descanso: %d\n", validade(descanso));
    std::printf("HorizontalInválido: %d\n", validade(horizontalInvalido));
    std::printf("VerticalInválido: %d\n", validade(verticalInvalido));
    std::printf("No limite: %d\n", repouso(limiteRepouso));
    std::printf("Fora do limite: %d\n", repouso(foraRepouso));*/
    recebido = {50, 3};
    if (validade(recebido) and recebido.vertical < -5 and recebido.horizontal <= 5 and recebido.horizontal >= -5 and bloqueado == 0){
        std::printf("RECUAR\n");
    } else if (validade(recebido) and recebido.vertical > 5 and recebido.horizontal <= 5 and recebido.horizontal >= -5 and !bloqueado){
        std:printf("AVANCAR\n");
    }
    return 0;

}