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



int main(){
    Movimento tras = {-100, 0};
    Movimento direita = {0, 100};
    Movimento descanso = {0, 0};
    Movimento horizontalInvalido = {0, 101};
    Movimento verticalInvalido = {-101, 0};
    Movimento limiteRepouso = {5, -5};
    Movimento foraRepouso = {6, 0};
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
    std::printf("descanso: %d\n", bloqueado);
        if (validade(descanso) and repouso(descanso)){
        bloqueado = false;
    }
    std::printf("tras: %d\n", bloqueado);
    std::printf("Vertical: %d, Horizontal: %d\n", direita.vertical, direita.horizontal);
    std::printf("direita: %d\n", validade(direita));
    std::printf("Vertical: %d, Horizontal: %d\n", descanso.vertical, descanso.horizontal);
    std::printf("descanso: %d\n", validade(descanso));
    std::printf("HorizontalInválido: %d\n", validade(horizontalInvalido));
    std::printf("VerticalInválido: %d\n", validade(verticalInvalido));
    std::printf("No limite: %d\n", repouso(limiteRepouso));
    std::printf("Fora do limite: %d\n", repouso(foraRepouso));

    return 0;

}