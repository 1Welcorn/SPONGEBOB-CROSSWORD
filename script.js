// =================================================================
// 1. DADOS E CONFIGURAÇÃO
// =================================================================
const GAME_WORDS = [
    { id: 0, word: "SWIM", clue: "Ação de nadar ou se mover na água.", image: "swim.png", sound: "swim.mp3" },
    { id: 1, word: "DIVE", clue: "Ação de mergulhar, ir fundo na água.", image: "dive.png", sound: "dive.mp3" },
    { id: 2, word: "EAT", clue: "Ação de comer.", image: "eat.png", sound: "eat.mp3" },
    { id: 3, word: "CATCH", clue: "Ação de pegar, caçar.", image: "catch.png", sound: "catch.mp3" },
    { id: 4, word: "CHASE", clue: "Ação de perseguir ou ir atrás de algo.", image: "chase.png", sound: "chase.mp3" },
    { id: 5, word: "DIG", clue: "Ação de cavar na areia.", image: "dig.png", sound: "dig.mp3" },
    { id: 6, word: "DRIFT", clue: "Ação de ser levado pela correnteza.", image: "drift.png", sound: "drift.mp3" }
];

const GRID_SIZE = 7;
let currentWordIndex = 0;
let carouselTimer = null;
let completedWords = new Set(); // Rastreia palavras já completadas
let isCarouselPaused = false;

// Configuração do Sintetizador de Voz (Web Speech API)
let availableVoices = [];
function loadVoices() {
    if ('speechSynthesis' in window) {
        // Tenta pegar as vozes disponíveis no navegador, filtrando por inglês
        availableVoices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
    }
}
// Alguns navegadores carregam vozes assincronamente
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
}

function speakWord(word) {
    if (!('speechSynthesis' in window)) return;
    
    // Cancela qualquer fala anterior para não encavalar
    window.speechSynthesis.cancel();
    
    // Converte para minúsculo para evitar que o navegador soletre como sigla (ex: S-W-I-M)
    const utterance = new SpeechSynthesisUtterance(word.toLowerCase());
    
    if (availableVoices.length === 0) {
        loadVoices();
    }
    
    if (availableVoices.length > 0) {
        // Escolhe uma voz aleatória entre as disponíveis no sistema
        const randomVoice = availableVoices[Math.floor(Math.random() * availableVoices.length)];
        utterance.voice = randomVoice;
    }
    
    // Pequenas variações para soar menos robótico
    utterance.pitch = Math.random() * 0.4 + 0.9; // Varia entre 0.9 e 1.3
    utterance.rate = Math.random() * 0.2 + 0.9;  // Varia velocidade entre 0.9 e 1.1
    
    window.speechSynthesis.speak(utterance);
}

// =================================================================
// 2. FUNÇÕES DE NAVEGAÇÃO
// =================================================================
function navigateTo(pageId) {
    document.querySelectorAll('.app-page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// =================================================================
// 3. LÓGICA DO CAROUSEL (PAGE 2)
// =================================================================

function createCarousel() {
    const container = document.getElementById('carousel-container');
    container.innerHTML = '';
    
    container.style.display = 'flex'; 

    GAME_WORDS.forEach((data, index) => {
        const slide = document.createElement('div');
        slide.classList.add('carousel-slide');
        slide.style.transform = `translateX(-${index * 100}%)`; 
        slide.dataset.index = index;

        slide.innerHTML = `
            <img src="images/${data.image}" alt="${data.word} action" class="slide-image">
            <div class="slide-controls">
                <span>${data.word.toUpperCase()}</span>
            </div>
        `;
        
        const img = slide.querySelector('.slide-image');
        img.addEventListener('mouseenter', () => {
            if (isCarouselPaused) {
                speakWord(data.word);
            }
        });

        container.appendChild(slide);
    });

}

function startCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    let currentSlide = 0;
    let time = 3;

    // Reseta estado e interface
    isCarouselPaused = false;
    document.getElementById('pause-carousel-button').textContent = 'PAUSAR';
    document.getElementById('pause-carousel-button').style.display = 'inline-block';
    document.getElementById('restart-carousel-button').style.display = 'none';
    document.getElementById('start-game-button').style.display = 'none';
    document.getElementById('start-game-button').disabled = true;
    document.getElementById('carousel-message').style.visibility = 'visible';
    document.getElementById('carousel-message').innerHTML = 'Preste atenção nos nomes e sons! Próximo slide em <span id="carousel-timer">3</span>s...';
    
    const timerElement = document.getElementById('carousel-timer');

    function nextSlide() {
        currentSlide = (currentSlide + 1);
        if (currentSlide < totalSlides) {
            slides.forEach((slide) => {
                slide.style.transform = `translateX(-${currentSlide * 100}%)`;
            });
            time = 3;
            timerElement.textContent = time;
            
            // Toca o áudio dinamicamente para o slide atual
            const currentSlideData = GAME_WORDS[currentSlide];
            if (currentSlideData) {
                speakWord(currentSlideData.word);
            }
        } else {
            if (carouselTimer) clearInterval(carouselTimer);
            document.getElementById('carousel-message').style.visibility = 'hidden';
            document.getElementById('start-game-button').disabled = false;
            document.getElementById('start-game-button').style.display = 'inline-block';
            document.getElementById('restart-carousel-button').style.display = 'inline-block';
            document.getElementById('pause-carousel-button').style.display = 'none';
        }
    }

    function updateTimer() {
        if (isCarouselPaused) return;
        if (currentSlide < totalSlides) {
            time--;
            timerElement.textContent = time;
            if (time <= 0) {
                nextSlide();
            }
        }
    }

    // Reseta o carousel para o primeiro slide
    slides.forEach((slide) => {
        slide.style.transform = `translateX(0%)`;
    });
    
    // Toca o áudio do primeiro slide
    const firstSlideData = GAME_WORDS[0];
    if (firstSlideData) {
        speakWord(firstSlideData.word);
    }
    
    // Inicia o timer para a primeira transição
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = setInterval(updateTimer, 1000);
}


// =================================================================
// 4. LÓGICA DA GRELHA E INPUTS (PAGE 3)
// =================================================================

function generateCrosswordGrid() {
    const grid = document.getElementById('crossword-grid');
    grid.innerHTML = '';

    GAME_WORDS.forEach((wordData, rowIndex) => {
        const word = wordData.word.toUpperCase();
        for (let colIndex = 0; colIndex < GRID_SIZE; colIndex++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.word = rowIndex; // Adiciona o índice da palavra para as cores
            
            let input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.dataset.rowIndex = rowIndex;
            input.dataset.colIndex = colIndex;

            // Define se a célula pertence à palavra
            if (colIndex < word.length) {
                input.dataset.correctLetter = word[colIndex];
                cell.dataset.hasWord = 'true';
                
                // Adiciona número da linha na primeira célula de cada palavra
                if (colIndex === 0) {
                    const rowNumber = document.createElement('div');
                    rowNumber.classList.add('row-number');
                    rowNumber.textContent = rowIndex + 1;
                    cell.appendChild(rowNumber);
                }
            } else {
                // Células vazias que não fazem parte da palavra (pretas/bloqueadas)
                cell.classList.add('unused'); 
                input.disabled = true;
            }

            cell.appendChild(input);
            grid.appendChild(cell);
        }
    });

    // Adiciona a lógica de navegação de input
    const gridContainer = document.getElementById('crossword-grid');
    gridContainer.addEventListener('input', handleInput);
    gridContainer.addEventListener('keydown', handleKeyDown);
    gridContainer.addEventListener('click', handleCellClick);
}

function handleInput(e) {
    const input = e.target;
    if (input.tagName !== 'INPUT' || input.value === '') return;
    
    input.value = input.value.toUpperCase();

    const rowIndex = parseInt(input.dataset.rowIndex);
    let colIndex = parseInt(input.dataset.colIndex);

    // Navega para o próximo campo à direita
    colIndex++;
    
    // Encontra o próximo input não desabilitado na mesma linha
    let nextInput = null;
    while(colIndex < GRID_SIZE) {
        nextInput = document.querySelector(`input[data-row-index="${rowIndex}"][data-col-index="${colIndex}"]`);
        if (nextInput && !nextInput.disabled) {
            nextInput.focus();
            return;
        }
        colIndex++;
    }

    // Se chegou ao fim da palavra, para aqui (não avança para próxima linha)
    // O usuário deve clicar manualmente na próxima palavra ou usar as setas
}

function handleKeyDown(e) {
    const input = e.target;
    if (input.tagName !== 'INPUT') return;

    let rowIndex = parseInt(input.dataset.rowIndex);
    let colIndex = parseInt(input.dataset.colIndex);

    if (e.key === 'Backspace' && input.value === '') {
        e.preventDefault();
        colIndex--;
    } else if (e.key === 'ArrowLeft') {
        colIndex--;
    } else if (e.key === 'ArrowRight') {
        colIndex++;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Bloqueia navegação entre palavras (setas para cima/baixo)
        e.preventDefault();
        return;
    } else {
        return;
    }

    // Só permite navegação dentro da mesma linha (mesma palavra)
    const targetInput = document.querySelector(`input[data-row-index="${rowIndex}"][data-col-index="${colIndex}"]`);
    if (targetInput && !targetInput.disabled) {
        targetInput.focus();
        if (e.key === 'Backspace') {
            targetInput.value = '';
        }
        e.preventDefault(); // Previne o comportamento padrão do navegador
    }
}

function handleCellClick(e) {
    // Verifica se o clique foi em uma célula (não no input)
    const cell = e.target.closest('.cell');
    if (!cell) return;
    
    // Encontra o input dentro da célula
    const input = cell.querySelector('input');
    if (!input || input.disabled) return;
    
    const rowIndex = parseInt(input.dataset.rowIndex);
    
    // Verifica se a palavra já tem feedback (cores)
    const inputs = Array.from(document.querySelectorAll(`input[data-row-index="${rowIndex}"]`)).filter(i => !i.disabled);
    const hasExistingFeedback = inputs.some(input => {
        const cell = input.parentNode;
        return cell.classList.contains('correct') || cell.classList.contains('present') || cell.classList.contains('absent');
    });
    
    if (hasExistingFeedback) {
        // Limpa a palavra se já tem feedback
        inputs.forEach(input => {
            input.value = '';
            const cell = input.parentNode;
            cell.classList.remove('correct', 'present', 'absent');
        });
        
        // Foca no primeiro input da palavra limpa
        const firstInput = inputs[0];
        if (firstInput) {
            firstInput.focus();
        }
    } else {
        // Se não tem feedback, apenas foca no input clicado
        input.focus();
    }
    
    // Atualiza as dicas (imagem e palavra) para a palavra clicada
    selectWord(rowIndex);
}


// =================================================================
// 5. LÓGICA TERMO (FEEDBACK DE CORES)
// =================================================================

function checkLetters() {
    let allWordsCorrect = true;
    let solvedWordsCount = 0;

    GAME_WORDS.forEach((wordData, rowIndex) => {
        const inputs = Array.from(document.querySelectorAll(`input[data-row-index="${rowIndex}"]`)).filter(i => !i.disabled);
        const word = wordData.word.toUpperCase();
        let correctGuesses = 0;

        // Verifica se a palavra já tem feedback (cores) - se sim, limpa os inputs
        const hasExistingFeedback = inputs.some(input => {
            const cell = input.parentNode;
            return cell.classList.contains('correct') || cell.classList.contains('present') || cell.classList.contains('absent');
        });

        if (hasExistingFeedback) {
            // Limpa os inputs se já tem feedback
            inputs.forEach(input => {
                input.value = '';
                const cell = input.parentNode;
                // Remove todas as classes de feedback e força o reset visual
                cell.classList.remove('correct', 'present', 'absent');
                // Força o reset do estilo inline se existir
                cell.style.background = '';
                cell.style.color = '';
                cell.style.transform = '';
                cell.style.boxShadow = '';
                cell.style.borderColor = '';
            });
            return; // Sai da iteração para esta palavra
        }

        // 1. Array de Frequência da Palavra Correta
        const wordFreq = {};
        for (const letter of word) {
            wordFreq[letter] = (wordFreq[letter] || 0) + 1;
        }

        // 2. Primeira Passagem: Identificar Verdes (Correct)
        const feedback = new Array(word.length).fill(null);

        inputs.forEach((input, colIndex) => {
            const guessLetter = input.value;
            const correctLetter = word[colIndex];
            const cell = input.parentNode;

            // Remove classes anteriores e força reset visual
            cell.classList.remove('correct', 'present', 'absent');
            cell.style.background = '';
            cell.style.color = '';
            cell.style.transform = '';
            cell.style.boxShadow = '';
            cell.style.borderColor = '';

            if (guessLetter === correctLetter && guessLetter !== '') {
                feedback[colIndex] = 'correct';
                wordFreq[correctLetter]--;
                correctGuesses++;
                // Aplica a classe 'correct' imediatamente
                cell.classList.add('correct');
            }
        });

        // 3. Segunda Passagem: Identificar Amarelos (Present) e Cinzas (Absent)
        inputs.forEach((input, colIndex) => {
            if (feedback[colIndex] === 'correct') return; // Ignora as já marcadas como verdes

            const guessLetter = input.value;
            const cell = input.parentNode;

            if (guessLetter === '') {
                // Não marca células vazias com cores Termo, mantém o fundo padrão (branco)
                feedback[colIndex] = null;
            } else if (wordFreq[guessLetter] > 0) {
                feedback[colIndex] = 'present';
                wordFreq[guessLetter]--;
            } else {
                feedback[colIndex] = 'absent';
            }

            // Aplica a classe Termo (se não for nulo/vazio)
            if (feedback[colIndex] !== null && feedback[colIndex] !== undefined) {
                cell.classList.add(feedback[colIndex]);
            }
        });

        // 4. Se a palavra estiver correta, desabilita os inputs
        if (correctGuesses === word.length) {
            inputs.forEach(input => input.disabled = true);
            allWordsCorrect = allWordsCorrect && true;
            solvedWordsCount++;
            
            // Mostra o banner de recompensa apenas se a palavra não foi completada antes
            if (!completedWords.has(rowIndex)) {
                completedWords.add(rowIndex); // Marca a palavra como completada
                showRewardBanner(wordData);
            }
        } else {
            // Não limpa os inputs - mantém as letras para mostrar o feedback Termo
            allWordsCorrect = false;
        }

        // Garante que o input da palavra atual mantenha o foco na linha, se não estiver resolvida
        if (rowIndex === currentWordIndex && correctGuesses !== word.length) {
            selectWord(rowIndex);
        }
    });

    // Feedback Final
    const messageElement = document.getElementById('game-message');
    if (allWordsCorrect) {
        messageElement.innerHTML = `🎉 **PARABÉNS!** Você completou todo o desafio! (${solvedWordsCount}/${GAME_WORDS.length})`;
        messageElement.style.color = 'green';
        document.getElementById('check-letters-button').disabled = true;
    } else {
        messageElement.innerHTML = `Acertos: **${solvedWordsCount}/${GAME_WORDS.length}** Palavras completas. Continue tentando!`;
        messageElement.style.color = 'orange';
    }
}


// =================================================================
// 6. LÓGICA DE DICAS E IMAGENS
// =================================================================

function generateClues() {
    const cluesContainer = document.getElementById('clues');
    cluesContainer.innerHTML = '';

    GAME_WORDS.forEach((wordData, index) => {
        const item = document.createElement('div');
        item.classList.add('clue-item');
        item.dataset.wordIndex = index;
        item.innerHTML = `<p>${index + 1}. ${wordData.clue}</p>`;
        
        item.addEventListener('click', () => selectWord(index));
        cluesContainer.appendChild(item);
    });

    // Seleciona a primeira palavra por padrão para iniciar o jogo
    selectWord(currentWordIndex);
}

function selectWord(index) {
    currentWordIndex = index;
    const wordData = GAME_WORDS[index];
    const imageElement = document.getElementById('spongebob-action-image');
    const hintTextElement = document.getElementById('hint-text');

    // Atualiza Imagem
    imageElement.src = `images/${wordData.image}`;
    imageElement.alt = `Imagem para a ação: ${wordData.word}`;
    hintTextElement.textContent = `Dica para: ${wordData.word.toUpperCase()}`;

    // Atualiza o estado ativo das dicas
    document.querySelectorAll('.clue-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.wordIndex) === index) {
            item.classList.add('active');
        }
    });

    // Foca no primeiro input da linha selecionada se a palavra não estiver resolvida
    const firstInput = document.querySelector(`input[data-row-index="${index}"][data-col-index="0"]`);
    if (firstInput && !firstInput.disabled) {
        firstInput.focus();
    }
}

// =================================================================
// 7. LÓGICA DO BANNER DE RECOMPENSA
// =================================================================

function showRewardBanner(wordData) {
    const banner = document.getElementById('reward-banner');
    const rewardImage = document.getElementById('reward-image');
    const rewardTitle = document.getElementById('reward-title');
    const rewardMessage = document.getElementById('reward-message');
    
    // Atualiza a imagem
    rewardImage.src = `images/${wordData.image}`;
    rewardImage.alt = `SpongeBob fazendo: ${wordData.word}`;
    
    // Atualiza as mensagens de congratulação
    const congratulations = [
        "🎉 Excelente trabalho! 🎉",
        "🌟 Fantástico! 🌟", 
        "🚀 Você é incrível! 🚀",
        "⭐ Parabéns! ⭐",
        "🎯 Perfeito! 🎯",
        "🏆 Magnífico! 🏆",
        "✨ Sensacional! ✨"
    ];
    
    const randomCongrat = congratulations[Math.floor(Math.random() * congratulations.length)];
    rewardTitle.textContent = randomCongrat;
    rewardMessage.textContent = `Você acertou "${wordData.word.toUpperCase()}"! Continue assim!`;
    
    // Mostra o banner
    banner.classList.remove('hidden');
    
    // Lê a palavra em voz alta
    speakWord(wordData.word);
}

function hideRewardBanner() {
    const banner = document.getElementById('reward-banner');
    banner.classList.add('hidden');
}


// =================================================================
// 8. INICIALIZAÇÃO
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Configura a navegação inicial
    document.getElementById('start-learning-button').addEventListener('click', () => {
        navigateTo('page-carousel');
        createCarousel();
        startCarousel();
    });

    document.getElementById('pause-carousel-button').addEventListener('click', function() {
        isCarouselPaused = !isCarouselPaused;
        this.textContent = isCarouselPaused ? 'CONTINUAR' : 'PAUSAR';
    });

    document.getElementById('restart-carousel-button').addEventListener('click', () => {
        startCarousel();
    });

    document.getElementById('start-game-button').addEventListener('click', () => {
        navigateTo('page-game');
        completedWords.clear(); // Limpa palavras completadas ao iniciar novo jogo
        generateCrosswordGrid();
        generateClues();
    });

    // 2. Configura o botão de checagem do jogo
    document.getElementById('check-letters-button').addEventListener('click', checkLetters);

    // 3. Configura o botão de fechar o banner de recompensa
    document.getElementById('close-reward').addEventListener('click', hideRewardBanner);

    // Inicia na página de instruções
    navigateTo('page-instructions'); 
});
