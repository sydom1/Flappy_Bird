function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

//Função para cria o tubos

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')

    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}


function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])

    this.setX = x => this.elemento.style.left = `${x}px`

    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}


function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3

    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando o elemento sair da área do jogo
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if (cruzouOMeio) notificarPonto()
        })
    }
}

//Função para criar o Passaro

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imagens/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 6 : -4)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)


}

//Função para cria a pontuação

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')

    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

// Função para verificar se dois elementos estão sobrepostos

function estaoSobrePostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

//Função para sinalizar a colizão com os tubos

function colidiu(passaro, barreiras) {
    let colidiu = false

    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {

            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento

            colidiu = estaoSobrePostos(passaro.elemento, superior)
                   || estaoSobrePostos(passaro.elemento, inferior)
        }
    })

    return colidiu
}

// musica do do jogo
const musica = new Audio('/Jogo Flappy Bird/audio/NemesisFreeFlyer.mp3'); // Música de fundo
musica.loop = true; // Faz a música tocar em loop

// musica do Game Over
const musicaGameOver = new Audio('/Jogo Flappy Bird/audio/GameOverSound.mp3'); // Caminho da música de Game Over
musicaGameOver.loop = false; // Não repetir a música

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[tp-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizarPontos(++pontos))

    const passaro = new Passaro(altura)

    /*adicionando os elementos*/
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)

    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {

        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)

                // Exibe a tela de Game Over com a pontuação

                musica.pause(); // Para a música de fundo
                musica.currentTime = 0; // Reseta a música de fundo
                musicaGameOver.play(); // Toca a música de Game Over

                // Exibe a tela de Game Over com a pontuação
                document.getElementById('gameOver').style.display = 'flex'
                document.getElementById('pontuacao').innerHTML = `${pontos} Pontos`
                document.querySelector('main[tp-flappy]').style.display = 'none' // Esconde o jogo
            }

        }, 20)
    }

}

// verificação do estado do ícone de áudio seja feita antes do inicio do jogo
window.addEventListener('load', () => {
    verificarEstadoMusica();  // Verifica o estado do ícone de áudio e inicia ou não a música
});

// comando para controlar o audio no jogo
// Função para iniciar a música
function iniciarMusica(){
        musica.play(); // Toca a música
    
    document.getElementById('btnMusic').innerHTML = '<i class="bi bi-volume-up-fill" style="font-size: 30px; color: #fff;"></i>';
}

// Função para parar a música
function pararMusica() {
    musica.pause(); // Pausa a música
    document.getElementById('btnMusic').innerHTML = '<i class="bi bi-volume-mute-fill" style="font-size: 30px; color: #fff;"></i>';
}

// Verificar o estado do ícone de música no início do jogo
function verificarEstadoMusica() {
    // Se o ícone de som estiver mudo, não toca a música, apenas deixa ela pausada
    const iconeMusica = document.getElementById('btnMusic').innerHTML;
    if (iconeMusica.includes('bi-volume-mute-fill')) {
        musica.pause();
    } else {
        musica.play();
    }
}

// Iniciar o jogo
document.getElementById('btnStart').addEventListener('click', () => {
    document.getElementById('menu').style.display = 'none' // Esconde o menu de início
    document.querySelector('main[tp-flappy]').style.display = 'block' // Mostra a área do jogo
    verificarEstadoMusica();  // Verifica o estado do ícone de áudio e inicia ou não a música
    new FlappyBird().start() // Inicia o jogo
});

// Alternar o estado da música ao clicar no ícone
document.getElementById('btnMusic').addEventListener('click', () => {
    if (musica.paused) {
        iniciarMusica(); // Se a música estiver pausada, inicie
    } else {
        pararMusica(); // Se a música estiver tocando, pause
    }
});

// Reinicia o jogo ao clicar no botão "Reiniciar"
document.getElementById('btnRestart').addEventListener('click', () => {

    // Esconde a tela de Game Over
    document.getElementById('gameOver').style.display = 'none'

    // Limpa a área do jogo
    document.querySelector('main[tp-flappy]').innerHTML = ''
    document.querySelector('main[tp-flappy]').style.display = 'block' // Mostra a área do jogo

    musicaGameOver.pause(); // Para a música de Game Over
    musicaGameOver.currentTime = 0; // Reseta a música para o início
    
    // Verifica o estado do ícone de música antes de iniciar novamente
    verificarEstadoMusica(); // Verifica o estado do ícone de áudio e retoma a música se necessário


    new FlappyBird().start()// Reinicia o jogo
});