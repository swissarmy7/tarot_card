<?php
session_start();
require_once 'config.php';
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 타로카드 점보기</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet">
</head>
<body>
    <div class="container-fluid min-vh-100 d-flex flex-column">
        <!-- Header -->
        <header class="text-center py-4">
            <h1 class="mystical-title">
                <i class="fas fa-moon"></i>
                AI 타로카드 점보기
                <i class="fas fa-star"></i>
            </h1>
            <p class="subtitle">당신의 마음을 들여다보는 신비로운 여행</p>
        </header>

        <!-- Main Content -->
        <main class="flex-grow-1">
            <!-- Step 1: Question Input -->
            <div id="question-step" class="step-container active">
                <div class="row justify-content-center">
                    <div class="col-lg-6 col-md-8">
                        <div class="card mystical-card">
                            <div class="card-body text-center p-5">
                                <h3 class="card-title mb-4">
                                    <i class="fas fa-heart"></i> 어떤 고민이 있으신가요?
                                </h3>
                                <p class="text-muted mb-4">타로카드가 당신의 고민에 대한 답을 찾아드릴게요</p>
                                <div class="form-group">
                                    <textarea id="user-question" class="form-control mystical-input"
                                              rows="4" placeholder="예: 새로운 직장으로의 이직이 고민됩니다..."></textarea>
                                </div>
                                <button id="start-reading" class="btn mystical-btn mt-4">
                                    <i class="fas fa-magic"></i> 타로 점보기 시작
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 2: Shuffle Cards -->
            <div id="shuffle-step" class="step-container">
                <div class="text-center">
                    <h3 class="mb-4">
                        <i class="fas fa-sync-alt"></i> 카드를 섞어주세요
                    </h3>
                    <p class="text-muted mb-5">마음이 편안해질 때까지 충분히 섞어주세요</p>

                    <div class="shuffle-area">
                        <div class="card-deck" id="card-deck">
                            <!-- Cards will be generated here -->
                        </div>
                        <div class="shuffle-controls mt-4">
                            <button id="shuffle-btn" class="btn mystical-btn me-3">
                                <i class="fas fa-shuffle"></i> 카드 섞기
                            </button>
                            <button id="finish-shuffle" class="btn mystical-btn-secondary" disabled>
                                <i class="fas fa-check"></i> 섞기 완료
                            </button>
                        </div>
                        <div class="shuffle-counter mt-3">
                            <small class="text-muted">섞은 횟수: <span id="shuffle-count">0</span>회</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 3: Card Spread -->
            <div id="spread-step" class="step-container">
                <div class="text-center">
                    <h3 class="mb-4">
                        <i class="fas fa-hand-pointer"></i> 카드를 선택해주세요
                    </h3>
                    <p class="text-muted mb-4">직감을 믿고 2-3장의 카드를 선택하세요</p>

                    <!-- Selected cards preview area -->
                    <div class="selected-cards-preview" id="selected-cards-preview">
                        <!-- Selected cards will be shown here -->
                    </div>

                    <div class="card-spread" id="card-spread">
                        <!-- Spread cards will be generated here -->
                    </div>

                    <div class="selection-info mt-4">
                        <div class="selected-count">
                            선택된 카드: <span id="selected-count">0</span> / 3장
                        </div>
                        <button id="complete-selection" class="btn mystical-btn mt-3" disabled>
                            <i class="fas fa-arrow-right"></i> 선택 완료
                        </button>
                    </div>
                </div>
            </div>

            <!-- Step 4: Card Reveal -->
            <div id="reveal-step" class="step-container">
                <div class="text-center">
                    <h3 class="mb-4">
                        <i class="fas fa-eye"></i> 선택한 카드를 확인해보세요
                    </h3>
                    <p class="text-muted mb-4">각 카드를 클릭하여 해석을 확인하세요</p>

                    <div class="selected-cards" id="selected-cards">
                        <!-- Selected cards will be displayed here -->
                    </div>

                    <div class="interpretation-area mt-5" id="interpretation-area">
                        <!-- Individual card interpretations will appear here -->
                    </div>

                    <button id="final-reading" class="btn mystical-btn mt-4" style="display: none;">
                        <i class="fas fa-scroll"></i> 종합 해석 보기
                    </button>
                </div>
            </div>

            <!-- Step 5: Final Reading -->
            <div id="final-step" class="step-container">
                <div class="row justify-content-center">
                    <div class="col-lg-8 col-md-10">
                        <div class="card mystical-card">
                            <div class="card-body p-5">
                                <h3 class="card-title text-center mb-4">
                                    <i class="fas fa-crystal-ball"></i> 종합 해석
                                </h3>
                                <div id="final-interpretation" class="final-reading">
                                    <!-- Final interpretation will be loaded here -->
                                </div>
                                <div class="text-center mt-4">
                                    <button id="new-reading" class="btn mystical-btn">
                                        <i class="fas fa-redo"></i> 새로운 점보기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Loading Overlay -->
        <div id="loading-overlay" class="loading-overlay">
            <div class="spinner">
                <i class="fas fa-magic fa-spin"></i>
                <p class="mt-3">타로카드가 답을 찾고 있습니다...</p>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="script.js"></script>
</body>
</html>
