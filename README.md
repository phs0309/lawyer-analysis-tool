# 악플 법적 책임 분석기

악플이나 사이버 괴롭힘을 당했을 때 법적 대응 방안을 AI로 분석하는 웹사이트입니다.

## 주요 기능

- 📝 텍스트 직접 입력 분석
- 📷 스크린샷 이미지 업로드 및 OCR 분석  
- 🎚️ 상황별 토글 옵션 (실제 인물 대상 여부, 허위사실 유포 여부)
- 🤖 Claude AI를 활용한 정확한 한국 법령 분석
- ⚖️ 모욕죄, 협박죄, 명예훼손죄, 성적 괴롭힘 등 법적 위반사항 분석
- 💡 구체적인 대응방안 제시 (경찰신고, 민사소송, 법률상담)

## 배포 방법

### 1. Claude API 키 설정

`config.js` 파일에서 API 키를 설정하세요:

```javascript
const CONFIG = {
    CLAUDE_API_KEY: 'sk-ant-api-your-actual-key-here', // 여기에 실제 API 키 입력
    // ...
};
```

### 2. API 키 발급

1. [Anthropic Console](https://console.anthropic.com/)에 접속
2. API Keys 메뉴에서 새 키 생성
3. `config.js`의 `CLAUDE_API_KEY`에 붙여넣기

### 3. 배포

정적 호스팅 서비스에 다음 파일들을 업로드:

- `index.html`
- `styles.css` 
- `script.js`
- `config.js`

**지원 플랫폼:**
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- AWS S3 + CloudFront

## 파일 구조

```
lawyer/
├── index.html      # 메인 페이지
├── styles.css      # 스타일시트
├── script.js       # 메인 JavaScript
├── config.js       # 설정 파일 (API 키 포함)
└── README.md       # 문서
```

## 개발환경 vs 배포환경

- **개발환경**: localhost에서 실행시 API 키를 프롬프트로 입력
- **배포환경**: `config.js`에 설정된 API 키 자동 사용

## 보안 주의사항

⚠️ **중요**: API 키는 클라이언트 사이드에 노출됩니다.
- 프로덕션 환경에서는 백엔드 프록시 서버 구축을 권장
- 또는 Anthropic API 키에 사용량 제한 설정

## 법적 고지

이 서비스는 일반적인 법적 정보만을 제공하며, 구체적인 법률 상담을 대체할 수 없습니다. 
실제 법적 분쟁 시에는 전문 변호사와 상담하시기 바랍니다.