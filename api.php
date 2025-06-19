<?php
header('Content-Type: application/json');
require_once 'config.php';

// Enable CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

// Allow both GET and POST for API calls
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST'])) {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get input data - try multiple sources
$input = null;

// Try to get JSON from php://input
$raw_input = file_get_contents('php://input');
if (!empty($raw_input)) {
    $input = json_decode($raw_input, true);
}

// If no input from stdin, try $_POST
if (!$input && !empty($_POST)) {
    $input = $_POST;
}

// If still no input, try $_GET for testing
if (!$input && !empty($_GET)) {
    $input = $_GET;
}

$action = $input['action'] ?? '';

// Default to get_cards if no action specified but this is an API call
if (empty($action)) {
    $action = 'get_cards';
}

switch ($action) {
    case 'interpret_card':
        interpretCard($input);
        break;
    case 'final_interpretation':
        finalInterpretation($input);
        break;
    case 'get_cards':
        getCards();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}

function getCards() {
    $json_file = 'tarot_cards.json';

    if (!file_exists($json_file)) {
        echo json_encode(['error' => 'Tarot cards file not found']);
        return;
    }

    $json_content = file_get_contents($json_file);
    if ($json_content === false) {
        echo json_encode(['error' => 'Failed to read tarot cards file']);
        return;
    }

    $cards = json_decode($json_content, true);
    if ($cards === null) {
        echo json_encode(['error' => 'Invalid JSON in tarot cards file']);
        return;
    }

    // Make sure we return a proper JSON response
    header('Content-Type: application/json');
    echo json_encode(['cards' => $cards]);
}

function interpretCard($input) {
    $question = $input['question'] ?? '';
    $cardName = $input['card_name'] ?? '';
    $cardMeaning = $input['card_meaning'] ?? '';
    $isReversed = $input['is_reversed'] ?? false;
    $position = $input['position'] ?? 1;

    // Prepare the prompt for LLM
    $orientation = $isReversed ? '역방향(뒤집힌)' : '정방향';
    $prompt = "사용자의 고민: {$question}\n\n";
    $prompt .= "뽑힌 타로카드: {$cardName} ({$orientation})\n";
    $prompt .= "카드의 기본 의미: {$cardMeaning}\n";
    $prompt .= "카드 위치: {$position}번째 카드\n\n";
    $prompt .= "이 타로카드가 사용자의 고민에 대해 어떤 메시지를 전하는지 자세하고 따뜻하게 해석해주세요. ";
    $prompt .= "200-300자 정도로 작성해주세요.";

    try {
        $interpretation = callLLMAPI($prompt);
        echo json_encode([
            'success' => true,
            'interpretation' => $interpretation,
            'card_name' => $cardName,
            'orientation' => $orientation
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'LLM API 호출 중 오류가 발생했습니다: ' . $e->getMessage()
        ]);
    }
}

function finalInterpretation($input) {
    $question = $input['question'] ?? '';
    $cards = $input['cards'] ?? [];

    $prompt = "사용자의 고민: {$question}\n\n";
    $prompt .= "뽑힌 타로카드들:\n";

    foreach ($cards as $index => $card) {
        $orientation = $card['is_reversed'] ? '역방향' : '정방향';
        $prompt .= ($index + 1) . ". {$card['name']} ({$orientation}) - 개별 해석: {$card['interpretation']}\n";
    }

    $prompt .= "\n위의 " . count($cards) . "장의 카드를 종합하여, 사용자의 고민에 대한 전체적인 조언과 미래에 대한 통찰을 제공해주세요. ";
    $prompt .= "카드들 간의 상호작용과 전체적인 메시지를 고려하여 400-500자 정도로 따뜻하고 희망적인 톤으로 작성해주세요.";

    try {
        $interpretation = callLLMAPI($prompt);
        echo json_encode([
            'success' => true,
            'interpretation' => $interpretation
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'LLM API 호출 중 오류가 발생했습니다: ' . $e->getMessage()
        ]);
    }
}

function callLLMAPI($prompt) {
    // TODO: Replace with your actual LLM API configuration
    $apiKey = LLM_API_KEY;
    $apiUrl = LLM_API_URL;

    if (empty($apiKey) || empty($apiUrl)) {
        throw new Exception('LLM API 설정이 필요합니다. config.php에서 API 키와 URL을 설정해주세요.');
    }

    // Example for OpenAI GPT API - adjust according to your LLM provider
    $data = [
        'model' => 'gpt-3.5-turbo', // Adjust model name as needed
        'messages' => [
            [
                'role' => 'system',
                'content' => '당신은 경험이 풍부한 타로 리더입니다. 타로카드 해석을 할 때는 따뜻하고 희망적인 톤을 사용하며, 사용자에게 실질적인 조언을 제공합니다.'
            ],
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ],
        'max_tokens' => 1000,
        'temperature' => 0.7
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("API 호출 실패: HTTP {$httpCode}");
    }

    $responseData = json_decode($response, true);

    if (isset($responseData['choices'][0]['message']['content'])) {
        return trim($responseData['choices'][0]['message']['content']);
    } else {
        throw new Exception('API 응답 형식이 올바르지 않습니다.');
    }
}
?>
