// 배포용 설정 파일
const CONFIG = {
    // Claude API 키 - 실제 배포시에는 여기에 실제 API 키를 입력하세요
    CLAUDE_API_KEY: 'sk-ant-api-your-key-here',
    
    // API 엔드포인트
    CLAUDE_API_URL: 'https://api.anthropic.com/v1/messages',
    
    // 모델 설정
    CLAUDE_MODEL: 'claude-3-haiku-20240307',
    
    // 최대 토큰 수
    MAX_TOKENS: 1000,
    
    // API 버전
    ANTHROPIC_VERSION: '2023-06-01'
};

// 개발환경 확인 함수
function isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '';
}

// API 키 검증 함수
function isValidApiKey(key) {
    return key && 
           typeof key === 'string' && 
           key.startsWith('sk-ant-api') && 
           key.length > 20;
}

// 실제 사용할 API 키 반환 함수
function getApiKey() {
    if (isDevelopment()) {
        // 개발환경에서는 프롬프트로 입력받기
        const devKey = prompt('개발환경입니다. Claude API 키를 입력하세요:');
        return devKey || CONFIG.CLAUDE_API_KEY;
    }
    
    return CONFIG.CLAUDE_API_KEY;
}