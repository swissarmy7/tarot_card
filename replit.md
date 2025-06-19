AI Tarot Card Reader Application
Overview
This is a web-based AI-powered tarot card reading application that provides mystical insights through interactive card selection and interpretation. The application combines a PHP backend with a modern JavaScript frontend to deliver an engaging tarot reading experience with AI-generated interpretations.

System Architecture
Frontend Architecture
Technology Stack: HTML5, CSS3 (Bootstrap 5), JavaScript (ES6+)
UI Framework: Bootstrap 5.3.0 with custom mystical styling
Icons: Font Awesome 6.4.0
Design Pattern: Single Page Application (SPA) with step-based workflow
State Management: Client-side JavaScript object for application state
Backend Architecture
Primary Backend: PHP with session management
Alternative Backend: Python Flask (configured but not actively used)
API Design: RESTful JSON API endpoints
Session Management: PHP sessions for user state persistence
CORS Support: Enabled for cross-origin requests
Key Design Decisions
Hybrid Architecture: The application is configured for both PHP and Python deployment, with PHP being the active implementation
Client-Heavy Design: Most UI logic handled on the frontend with backend providing data and AI integration
Session-Based State: User progress maintained through PHP sessions
Key Components
Frontend Components
Step Manager: Handles the multi-step tarot reading process
Card System: Manages tarot card data and visual presentation
Animation Engine: Provides mystical UI effects and transitions
API Client: Handles communication with PHP backend
Backend Components
API Router (api.php): Central endpoint dispatcher
Configuration Manager (config.php): Environment and API settings
Card Interpreter: AI integration for tarot interpretations
Session Handler: User state management
Data Components
Tarot Card Database (tarot_cards.json): Complete tarot deck with meanings
Card Metadata: Includes traditional meanings, reversed interpretations, and symbolic elements
Data Flow
User Journey Initiation: User enters question on main page
Card Loading: Application fetches tarot card data from JSON
Interactive Selection: User shuffles and selects cards through animated interface
AI Processing: Selected cards and user question sent to LLM API for interpretation
Results Display: AI-generated interpretation presented in mystical UI
State Persistence: User session maintained throughout reading process
API Endpoints
POST /api.php with action: get_cards - Retrieve tarot card data
POST /api.php with action: interpret_card - Get AI interpretation for single card
POST /api.php with action: final_interpretation - Generate comprehensive reading
External Dependencies
Frontend Libraries
Bootstrap 5.3.0: UI framework and responsive design
Font Awesome 6.4.0: Icon system for mystical theming
Backend Integrations
OpenAI GPT API: Primary LLM service for card interpretations
Alternative LLM Support: Configurable for other AI providers
Development Tools
Gunicorn: WSGI server for Python Flask deployment
PHP Built-in Server: Development server capability
UV Package Manager: Python dependency management
Deployment Strategy
Replit Configuration
Primary Runtime: Python 3.11 with Nix package management
Production Server: Gunicorn with autoscale deployment
Development Mode: Hot reload enabled for iterative development
Port Configuration: Application serves on port 5000
Environment Setup
Database: PostgreSQL configured (prepared for future data persistence)
SSL Support: OpenSSL included for secure connections
Process Management: Parallel workflow execution support
Deployment Targets
Autoscale: Configured for automatic scaling based on demand
Multi-Process: Gunicorn with worker process reuse for performance
Changelog
Changelog:
- June 19, 2025. Initial setup
- June 19, 2025. 78장 전체 카드 부채꼴 팬 레이아웃으로 개선
- June 19, 2025. 카드 선택 시스템 완전 재구성 - 직접 클릭 가능
- June 19, 2025. 선택된 카드 미리보기 영역 추가로 UX 개선
- June 19, 2025. 모든 타로카드 이미지를 실제 라이더-웨이트 타로카드로 교체 완료
User Preferences
Preferred communication style: Simple, everyday language.
Technical Notes
The application currently uses PHP as the primary backend despite Python Flask being configured
AI integration requires API key configuration in environment variables
The tarot card database includes complete Major and Minor Arcana with traditional interpretations
Session management enables users to maintain progress through multi-step readings
The mystical UI theme uses CSS custom properties for consistent theming
Error handling includes both client-side validation and server-side error responses