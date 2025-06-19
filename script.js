// Application State
let appState = {
    currentStep: 'question',
    userQuestion: '',
    shuffleCount: 0,
    selectedCards: [],
    cardInterpretations: [],
    allCards: null,
    finalInterpretation: ''
};

// DOM Elements
const steps = {
    question: document.getElementById('question-step'),
    shuffle: document.getElementById('shuffle-step'),
    spread: document.getElementById('spread-step'),
    reveal: document.getElementById('reveal-step'),
    final: document.getElementById('final-step')
};

const elements = {
    userQuestion: document.getElementById('user-question'),
    startReading: document.getElementById('start-reading'),
    shuffleBtn: document.getElementById('shuffle-btn'),
    finishShuffle: document.getElementById('finish-shuffle'),
    shuffleCount: document.getElementById('shuffle-count'),
    cardDeck: document.getElementById('card-deck'),
    cardSpread: document.getElementById('card-spread'),
    selectedCount: document.getElementById('selected-count'),
    completeSelection: document.getElementById('complete-selection'),
    selectedCards: document.getElementById('selected-cards'),
    interpretationArea: document.getElementById('interpretation-area'),
    finalReading: document.getElementById('final-reading'),
    finalInterpretation: document.getElementById('final-interpretation'),
    newReading: document.getElementById('new-reading'),
    loadingOverlay: document.getElementById('loading-overlay')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    bindEvents();
});

function initializeApp() {
    // Load tarot cards data
    loadTarotCards();

    // Show first step
    showStep('question');
}

function bindEvents() {
    // Step 1: Question Input
    elements.startReading.addEventListener('click', startTarotReading);

    // Step 2: Shuffle
    elements.shuffleBtn.addEventListener('click', shuffleCards);
    elements.finishShuffle.addEventListener('click', showCardSpread);

    // Step 3: Card Selection
    elements.completeSelection.addEventListener('click', showSelectedCards);

    // Step 4: Final Reading
    elements.finalReading.addEventListener('click', showFinalInterpretation);

    // New Reading
    elements.newReading.addEventListener('click', startNewReading);
}

async function loadTarotCards() {
    try {
        const response = await fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'get_cards' })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API response:', data);

        if (data.cards) {
            appState.allCards = data.cards;
            console.log('Tarot cards loaded successfully');
            console.log('Card structure:', {
                major_arcana: data.cards.major_arcana?.length || 0,
                minor_arcana: {
                    wands: data.cards.minor_arcana?.wands?.length || 0,
                    cups: data.cards.minor_arcana?.cups?.length || 0,
                    swords: data.cards.minor_arcana?.swords?.length || 0,
                    pentacles: data.cards.minor_arcana?.pentacles?.length || 0
                }
            });
        } else if (data.error) {
            throw new Error(data.error);
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error loading tarot cards:', error);
        showError('카드 데이터를 불러오는데 실패했습니다: ' + error.message);
    }
}

// Step Navigation
function showStep(stepName) {
    // Hide all steps
    Object.values(steps).forEach(step => {
        step.classList.remove('active');
    });

    // Show target step
    if (steps[stepName]) {
        steps[stepName].classList.add('active');
        appState.currentStep = stepName;
    }
}

// Step 1: Question Input
function startTarotReading() {
    const question = elements.userQuestion.value.trim();

    if (!question) {
        alert('고민을 입력해주세요.');
        elements.userQuestion.focus();
        return;
    }

    if (question.length < 10) {
        alert('더 자세한 고민을 입력해주세요. (최소 10자 이상)');
        elements.userQuestion.focus();
        return;
    }

    appState.userQuestion = question;

    // Create shuffle deck
    createShuffleDeck();

    // Move to shuffle step
    showStep('shuffle');
}

// Step 2: Shuffle Cards
function createShuffleDeck() {
    elements.cardDeck.innerHTML = '';

    // Create a stack of cards
    for (let i = 0; i < 10; i++) {
        const card = document.createElement('div');
        card.className = 'deck-card';
        card.innerHTML = '<i class="fas fa-star"></i>';
        card.style.transform = `translateX(${i * 2}px) translateY(${i * -2}px) rotateZ(${i * 2}deg)`;
        card.style.zIndex = 10 - i;
        elements.cardDeck.appendChild(card);
    }
}

function shuffleCards() {
    appState.shuffleCount++;
    elements.shuffleCount.textContent = appState.shuffleCount;

    // Add shuffle animation to all cards
    const cards = elements.cardDeck.querySelectorAll('.deck-card');
    cards.forEach((card, index) => {
        card.classList.add('shuffling');

        // Randomize positions during shuffle
        setTimeout(() => {
            const randomX = (Math.random() - 0.5) * 100;
            const randomY = (Math.random() - 0.5) * 50;
            const randomRotation = (Math.random() - 0.5) * 60;

            card.style.transform = `translateX(${randomX}px) translateY(${randomY}px) rotateZ(${randomRotation}deg)`;
        }, 100);

        // Remove animation class
        setTimeout(() => {
            card.classList.remove('shuffling');
        }, 800);
    });

    // Enable finish shuffle button after first shuffle
    if (appState.shuffleCount >= 1) {
        elements.finishShuffle.disabled = false;
    }
}

function showCardSpread() {
    // Generate random cards for spread
    generateCardSpread();
    showStep('spread');
}

// Step 3: Card Spread and Selection
function generateCardSpread() {
    if (!appState.allCards) {
        showError('카드 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    elements.cardSpread.innerHTML = '';

    // Combine all cards into one array - check data structure
    let allCardsArray = [];

    try {
        if (appState.allCards.major_arcana) {
            allCardsArray = [...allCardsArray, ...appState.allCards.major_arcana];
        }

        if (appState.allCards.minor_arcana) {
            if (appState.allCards.minor_arcana.wands) {
                allCardsArray = [...allCardsArray, ...appState.allCards.minor_arcana.wands];
            }
            if (appState.allCards.minor_arcana.cups) {
                allCardsArray = [...allCardsArray, ...appState.allCards.minor_arcana.cups];
            }
            if (appState.allCards.minor_arcana.swords) {
                allCardsArray = [...allCardsArray, ...appState.allCards.minor_arcana.swords];
            }
            if (appState.allCards.minor_arcana.pentacles) {
                allCardsArray = [...allCardsArray, ...appState.allCards.minor_arcana.pentacles];
            }
        }

        console.log('Total cards loaded:', allCardsArray.length);

        if (allCardsArray.length === 0) {
            showError('카드 데이터 구조에 문제가 있습니다.');
            return;
        }
    } catch (error) {
        console.error('Error accessing card data:', error);
        showError('카드 데이터를 처리하는 중 오류가 발생했습니다.');
        return;
    }

    // Use all 78 cards for fan spread
    const shuffledCards = shuffleArray([...allCardsArray]);
    const totalCards = shuffledCards.length;

    // Create fan layout (78 cards in a fan shape)
    shuffledCards.forEach((cardData, index) => {
        const card = document.createElement('div');
        card.className = 'fan-card';

        // Simple card back without emoji symbols
        card.innerHTML = `
            <div class="fan-card-back">
                <div class="card-back-pattern"></div>
            </div>
        `;

        card.dataset.cardId = cardData.id;
        card.dataset.cardIndex = index;

        // Calculate fan position and rotation
        const fanAngle = 120; // Total fan angle in degrees (reduced for better shape)
        const cardAngle = (fanAngle / (totalCards - 1)) * index - (fanAngle / 2);
        const radius = 350; // Distance from center

        // Position cards in fan formation with better curve
        const x = Math.sin((cardAngle * Math.PI) / 180) * radius;
        const y = Math.cos((cardAngle * Math.PI) / 180) * radius * 0.2; // Flatten the arc more

        card.style.transform = `translate(${x}px, ${y}px) rotate(${cardAngle}deg)`;
        card.style.zIndex = index;
        card.style.transformOrigin = 'center bottom';

        // Store original transform for selection animation
        card.dataset.originalTransform = `translate(${x}px, ${y}px) rotate(${cardAngle}deg)`;

        // Add animation delay
        card.style.animationDelay = `${index * 0.02}s`;
        card.classList.add('fan-animate-in');

        // Add click event for selection
        card.addEventListener('click', () => selectCard(card, cardData));

        elements.cardSpread.appendChild(card);
    });
}

function selectCard(cardElement, cardData) {
    if (cardElement.classList.contains('selected')) {
        // Deselect card
        cardElement.classList.remove('selected');
        const cardBack = cardElement.querySelector('.fan-card-back');
        cardBack.style.borderColor = 'var(--gold)';
        cardBack.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        cardBack.style.borderWidth = '1px';

        appState.selectedCards = appState.selectedCards.filter(card => card.id !== cardData.id);
    } else {
        // Check selection limit
        if (appState.selectedCards.length >= 3) {
            alert('최대 3장까지만 선택할 수 있습니다.');
            return;
        }

        // Select card with random orientation
        cardElement.classList.add('selected');
        const isReversed = Math.random() < 0.5; // 50% chance of being reversed

        // Add visual feedback to selected card in fan
        const cardBack = cardElement.querySelector('.fan-card-back');
        cardBack.style.borderColor = '#9b59b6';
        cardBack.style.boxShadow = '0 0 25px rgba(155, 89, 182, 0.8)';
        cardBack.style.borderWidth = '2px';

        appState.selectedCards.push({
            ...cardData,
            isReversed: isReversed,
            element: cardElement
        });
    }

    updateSelectedCardsPreview();
    updateSelectionUI();
}

function updateSelectedCardsPreview() {
    const previewArea = document.getElementById('selected-cards-preview');
    if (!previewArea) return;

    // Clear existing preview cards
    previewArea.innerHTML = '';

    if (appState.selectedCards.length === 0) {
        previewArea.classList.add('empty');
        return;
    }

    previewArea.classList.remove('empty');

    // Create preview cards for each selected card
    appState.selectedCards.forEach((cardData, index) => {
        const previewCard = document.createElement('div');
        previewCard.className = 'selected-preview-card';
        previewCard.innerHTML = `
            <div class="fan-card-back">
                <div class="card-back-pattern"></div>
            </div>
        `;

        // Add click handler to deselect
        previewCard.addEventListener('click', () => {
            // Find and deselect the original card in the fan
            const originalCard = cardData.element;
            selectCard(originalCard, cardData);
        });

        previewArea.appendChild(previewCard);
    });
}

function updateSelectionUI() {
    const count = appState.selectedCards.length;
    elements.selectedCount.textContent = count;

    // Enable complete button if 2 or more cards selected
    elements.completeSelection.disabled = count < 2;

    if (count === 1) {
        elements.selectedCount.parentElement.innerHTML =
            '선택된 카드: <span id="selected-count">1</span> / 3장<br><small class="text-warning">최소 2장을 선택해주세요</small>';
        elements.selectedCount = document.getElementById('selected-count');
    } else if (count >= 2) {
        elements.selectedCount.parentElement.innerHTML =
            '선택된 카드: <span id="selected-count">' + count + '</span> / 3장';
        elements.selectedCount = document.getElementById('selected-count');
    }
}

function showSelectedCards() {
    if (appState.selectedCards.length < 2) {
        alert('최소 2장의 카드를 선택해주세요.');
        return;
    }

    // Create reveal cards
    createRevealCards();
    showStep('reveal');
}

// Step 4: Card Reveal and Interpretation
function createRevealCards() {
    elements.selectedCards.innerHTML = '';

    appState.selectedCards.forEach((cardData, index) => {
        const revealCard = document.createElement('div');
        revealCard.className = 'reveal-card';
        revealCard.dataset.cardIndex = index;

        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';

        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        cardFront.innerHTML = '<i class="fas fa-eye"></i><br>클릭하여<br>확인';

        const cardBack = document.createElement('div');
        cardBack.className = `card-back ${cardData.isReversed ? 'reversed' : ''}`;

        // Card back content with proper tarot card design
        cardBack.innerHTML = `
            <div class="tarot-card-content">
                <div class="card-header">
                    <div class="card-name-ko">${cardData.name}</div>
                    <div class="card-name-en">${cardData.name_en || cardData.name}</div>
                </div>
                <div class="card-image-container">
                    <div class="tarot-card-image">
                        ${generateCardImage(cardData)}
                    </div>
                </div>
                <div class="card-footer">
                    <div class="card-orientation ${cardData.isReversed ? 'reversed' : 'upright'}">
                        ${cardData.isReversed ? '⥁ 역방향' : '⤴ 정방향'}
                    </div>
                </div>
            </div>
        `;

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        revealCard.appendChild(cardInner);

        // Add click event for reveal and interpretation
        revealCard.addEventListener('click', () => revealCard_Handler(revealCard, cardData, index));

        elements.selectedCards.appendChild(revealCard);
    });
}

// Generate card image based on card type and meaning
function generateCardImage(cardData) {
    return `
        <div class="real-tarot-image">
            <img src="${cardData.image_url}" alt="${cardData.name}"
                 onerror="this.parentElement.innerHTML='<div class=\\'fallback-card\\'>🔮<br>${cardData.name}</div>'"
                 onload="this.style.opacity='1'">
        </div>
    `;
}

function getCardSymbol(cardData) {
    // Major Arcana symbols
    if (cardData.id <= 21) {
        const majorSymbols = {
            0: '🎭', 1: '🎩', 2: '🌙', 3: '👑', 4: '🏛️', 5: '⛪', 6: '💕',
            7: '🏹', 8: '🦁', 9: '🕯️', 10: '☸️', 11: '⚖️', 12: '🔄', 13: '💀',
            14: '👼', 15: '😈', 16: '⚡', 17: '⭐', 18: '🌙', 19: '☀️', 20: '📯', 21: '🌍'
        };
        return majorSymbols[cardData.id] || '✨';
    }

    // Minor Arcana symbols by suit
    if (cardData.suit) {
        const suitSymbols = {
            '완드': '🔥',
            '컵': '💧',
            '소드': '⚔️',
            '펜타클': '💰'
        };
        return suitSymbols[cardData.suit] || '✨';
    }

    return '✨';
}

function getCardColor(cardData) {
    if (cardData.id <= 21) {
        // Major Arcana - gradient colors
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    // Minor Arcana - suit colors
    const suitColors = {
        '완드': 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        '컵': 'linear-gradient(135deg, #4834d4 0%, #686de0 100%)',
        '소드': 'linear-gradient(135deg, #535c68 0%, #40739e 100%)',
        '펜타클': 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
    };

    return suitColors[cardData.suit] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

function getCardNumber(cardData) {
    if (cardData.id <= 21) {
        return cardData.id.toString();
    }

    if (cardData.number) {
        const numberMap = {
            '에이스': 'A',
            '잭': 'J',
            '기사': 'Kn',
            '퀸': 'Q',
            '킹': 'K'
        };
        return numberMap[cardData.number] || cardData.number;
    }

    return '';
}

async function revealCard_Handler(cardElement, cardData, index) {
    if (cardElement.classList.contains('flipped')) {
        return; // Already revealed
    }

    // Flip card
    cardElement.classList.add('flipped');

    // Get interpretation
    showLoading();

    try {
        const interpretation = await getCardInterpretation(cardData, index + 1);
        hideLoading();

        // Show interpretation
        showCardInterpretation(cardData, interpretation, index);

        // Check if all cards are revealed
        checkAllCardsRevealed();

    } catch (error) {
        hideLoading();
        showError('카드 해석을 가져오는데 실패했습니다: ' + error.message);
    }
}

async function getCardInterpretation(cardData, position) {
    const response = await fetch('api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'interpret_card',
            question: appState.userQuestion,
            card_name: cardData.name,
            card_meaning: cardData.isReversed ? cardData.reversed_meaning : cardData.meaning,
            is_reversed: cardData.isReversed,
            position: position
        })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || 'API 호출 실패');
    }

    return data.interpretation;
}

function showCardInterpretation(cardData, interpretation, index) {
    const interpretationDiv = document.createElement('div');
    interpretationDiv.className = 'card-interpretation';

    interpretationDiv.innerHTML = `
        <div class="interpretation-header">
            <i class="fas fa-star"></i>
            <div class="card-title-display">
                <div class="card-title-ko">${cardData.name}</div>
                <div class="card-title-en">${cardData.name_en || cardData.name}</div>
                <div class="card-orientation-text">${cardData.isReversed ? '⥁ 역방향 (Reversed)' : '⤴ 정방향 (Upright)'}</div>
            </div>
        </div>
        <div class="interpretation-text">
            ${interpretation}
        </div>
    `;

    elements.interpretationArea.appendChild(interpretationDiv);

    // Add to state
    appState.cardInterpretations.push({
        name: cardData.name,
        is_reversed: cardData.isReversed,
        interpretation: interpretation
    });

    // Show with animation
    setTimeout(() => {
        interpretationDiv.classList.add('show');
    }, 100);
}

function checkAllCardsRevealed() {
    const revealedCards = document.querySelectorAll('.reveal-card.flipped');
    if (revealedCards.length === appState.selectedCards.length) {
        // All cards revealed, show final reading button
        elements.finalReading.style.display = 'inline-block';
        elements.finalReading.classList.add('pulse');
    }
}

// Step 5: Final Interpretation
async function showFinalInterpretation() {
    showLoading();

    try {
        const finalInterpretation = await getFinalInterpretation();
        hideLoading();

        // Display final interpretation
        elements.finalInterpretation.innerHTML = `
            <h4><i class="fas fa-crystal-ball"></i> 당신의 타로 메시지</h4>
            <p>${finalInterpretation}</p>
        `;

        showStep('final');

    } catch (error) {
        hideLoading();
        showError('종합 해석을 가져오는데 실패했습니다: ' + error.message);
    }
}

async function getFinalInterpretation() {
    const response = await fetch('api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'final_interpretation',
            question: appState.userQuestion,
            cards: appState.cardInterpretations
        })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || 'API 호출 실패');
    }

    return data.interpretation;
}

// Utility Functions
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function showLoading() {
    elements.loadingOverlay.classList.add('show');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('show');
}

function showError(message) {
    alert('오류: ' + message);
    console.error('Error:', message);
}

function startNewReading() {
    // Reset application state
    appState = {
        currentStep: 'question',
        userQuestion: '',
        shuffleCount: 0,
        selectedCards: [],
        cardInterpretations: [],
        allCards: appState.allCards, // Keep loaded cards
        finalInterpretation: ''
    };

    // Clear UI elements
    elements.userQuestion.value = '';
    elements.shuffleCount.textContent = '0';
    elements.finishShuffle.disabled = true;
    elements.selectedCount.textContent = '0';
    elements.completeSelection.disabled = true;
    elements.cardDeck.innerHTML = '';
    elements.cardSpread.innerHTML = '';
    elements.selectedCards.innerHTML = '';
    elements.interpretationArea.innerHTML = '';
    elements.finalInterpretation.innerHTML = '';
    elements.finalReading.style.display = 'none';
    elements.finalReading.classList.remove('pulse');

    // Reset selection UI
    elements.selectedCount.parentElement.innerHTML =
        '선택된 카드: <span id="selected-count">0</span> / 3장';
    elements.selectedCount = document.getElementById('selected-count');

    // Go back to first step
    showStep('question');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    showError('애플리케이션 오류가 발생했습니다. 페이지를 새로고침해보세요.');
});

// Prevent form submission on Enter key in textarea
elements.userQuestion.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        elements.startReading.click();
    }
});
