<?php
// LLM API Configuration
// TODO: Add your LLM API credentials here

// For OpenAI GPT API
define('LLM_API_KEY', getenv('OPENAI_API_KEY') ?: 'YOUR_OPENAI_API_KEY_HERE');
define('LLM_API_URL', 'https://api.openai.com/v1/chat/completions');

// Alternative: For other LLM providers (uncomment and modify as needed)
// define('LLM_API_KEY', getenv('YOUR_LLM_API_KEY') ?: 'YOUR_API_KEY_HERE');
// define('LLM_API_URL', 'YOUR_LLM_API_ENDPOINT_HERE');

// Application Configuration
define('APP_NAME', 'AI 타로카드 점보기');
define('APP_VERSION', '1.0.0');

// Session Configuration
ini_set('session.cookie_lifetime', 3600); // 1 hour
ini_set('session.gc_maxlifetime', 3600);

// Error Reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start PHP built-in server on port 5000 if running directly
if (php_sapi_name() === 'cli-server') {
    $host = '0.0.0.0';
    $port = 5000;
    echo "Starting PHP server on {$host}:{$port}\n";
    echo "Visit: http://localhost:{$port}\n";
}
?>
