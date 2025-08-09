let uploadedImage = null;

function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab');
    const inputs = document.querySelectorAll('.input-method');
    
    tabs.forEach(t => t.classList.remove('active'));
    inputs.forEach(i => i.classList.remove('active'));
    
    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    document.getElementById(`${tab}-input`).classList.add('active');
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        uploadedImage = file;
        const uploadArea = document.querySelector('.upload-area');
        uploadArea.innerHTML = `<p>✅ ${file.name} 업로드 완료</p>`;
        document.getElementById('analyzeImageBtn').disabled = false;
    }
}

async function analyzeText() {
    const text = document.getElementById('maliciousText').value.trim();
    if (!text) {
        alert('분석할 텍스트를 입력해주세요.');
        return;
    }
    
    const targetRealPerson = document.getElementById('targetRealPerson').checked;
    const containsFalseInfo = document.getElementById('containsFalseInfo').checked;
    
    const apiKey = getApiKey();
    if (!isValidApiKey(apiKey)) {
        alert('Claude API 키가 설정되지 않았거나 올바르지 않습니다. config.js 파일에서 CLAUDE_API_KEY를 설정해주세요.');
        return;
    }
    
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '분석 중...';
    button.disabled = true;
    
    try {
        const analysis = await analyzeWithClaudeAPI(text, targetRealPerson, containsFalseInfo);
        displayResults(analysis);
    } catch (error) {
        console.error('분석 오류:', error);
        alert('분석 중 오류가 발생했습니다: ' + error.message);
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

async function analyzeImage() {
    if (!uploadedImage) {
        alert('분석할 이미지를 업로드해주세요.');
        return;
    }
    
    const targetRealPerson = document.getElementById('targetRealPersonImg').checked;
    const containsFalseInfo = document.getElementById('containsFalseInfoImg').checked;
    
    const apiKey = getApiKey();
    if (!isValidApiKey(apiKey)) {
        alert('Claude API 키가 설정되지 않았거나 올바르지 않습니다. config.js 파일에서 CLAUDE_API_KEY를 설정해주세요.');
        return;
    }
    
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '분석 중...';
    button.disabled = true;
    
    try {
        const base64Image = await fileToBase64(uploadedImage);
        const analysis = await analyzeImageWithClaudeAPI(base64Image, targetRealPerson, containsFalseInfo);
        displayResults(analysis);
    } catch (error) {
        console.error('분석 오류:', error);
        alert('분석 중 오류가 발생했습니다: ' + error.message);
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

function analyzeMaliciousContent(content) {
    const analysis = {
        severity: 'low',
        violations: [],
        content: content,
        recommendations: [],
        explanation: ''
    };
    
    // 욕설 및 비속어 검사
    const profanityPatterns = [
        /\b(씨발|시발|개새끼|병신|미친|바보|멍청|죽어|꺼져)\b/gi,
        /\b(년|놈|개|똥|더러운|역겨운)\b/gi
    ];
    
    // 협박성 표현 검사
    const threatPatterns = [
        /\b(죽이|때리|해치|복수|보복|찾아가|신상|주소)\b/gi,
        /\b(가만두지|각오해|후회하게)\b/gi
    ];
    
    // 성적 괴롭힘 검사
    const sexualHarassmentPatterns = [
        /\b(몸|가슴|엉덩이|성관계|섹스)\b/gi
    ];
    
    let hasProfanity = false;
    let hasThreat = false;
    let hasSexualContent = false;
    
    profanityPatterns.forEach(pattern => {
        if (pattern.test(content)) hasProfanity = true;
    });
    
    threatPatterns.forEach(pattern => {
        if (pattern.test(content)) hasThreat = true;
    });
    
    sexualHarassmentPatterns.forEach(pattern => {
        if (pattern.test(content)) hasSexualContent = true;
    });
    
    // 법적 위반사항 분석
    if (hasProfanity) {
        analysis.violations.push('모욕죄');
        analysis.severity = 'medium';
    }
    
    if (hasThreat) {
        analysis.violations.push('협박죄');
        analysis.violations.push('명예훼손죄');
        analysis.severity = 'high';
    }
    
    if (hasSexualContent) {
        analysis.violations.push('성적 괴롭힘');
        analysis.severity = 'high';
    }
    
    // 명예훼손 여부 (특정인 지칭)
    const defamationPatterns = [
        /\b(이름|직업|회사|학교|지역)\b.*\b(거짓말|사기|범죄)\b/gi
    ];
    
    defamationPatterns.forEach(pattern => {
        if (pattern.test(content)) {
            analysis.violations.push('명예훼손죄');
            if (analysis.severity === 'low') analysis.severity = 'medium';
        }
    });
    
    // 권장사항 생성
    if (analysis.violations.length > 0) {
        if (analysis.severity === 'high') {
            analysis.recommendations.push('즉시 경찰서 신고');
            analysis.recommendations.push('형사고발 검토');
            analysis.recommendations.push('민사소송 준비');
        } else if (analysis.severity === 'medium') {
            analysis.recommendations.push('경찰서 신고 검토');
            analysis.recommendations.push('증거자료 보전');
            analysis.recommendations.push('법률상담 받기');
        } else {
            analysis.recommendations.push('증거자료 보전');
            analysis.recommendations.push('추가 피해 시 신고');
        }
    }
    
    return analysis;
}

function displayResults(analysis) {
    const resultsSection = document.getElementById('results');
    const analysisContent = document.getElementById('analysis-content');
    
    let severityColor = '';
    let severityText = '';
    
    switch(analysis.severity) {
        case 'high':
            severityColor = '#dc3545';
            severityText = '높음 (즉시 대응 필요)';
            break;
        case 'medium':
            severityColor = '#fd7e14';
            severityText = '보통 (법적 대응 검토)';
            break;
        default:
            severityColor = '#28a745';
            severityText = '낮음 (모니터링 필요)';
    }
    
    let violationsHtml = '';
    if (analysis.violations && analysis.violations.length > 0) {
        violationsHtml = `
            <div class="violation-item">
                <h4>🚨 적용 가능한 법령</h4>
                <ul>
                    ${analysis.violations.map(v => `<li>${v} - ${getLegalExplanation(v)}</li>`).join('')}
                </ul>
            </div>
        `;
    } else {
        violationsHtml = `
            <div class="violation-item">
                <h4>✅ 법적 위반사항</h4>
                <p>명확한 법적 위반사항이 발견되지 않았습니다.</p>
            </div>
        `;
    }
    
    let recommendationsHtml = '';
    if (analysis.recommendations && analysis.recommendations.length > 0) {
        recommendationsHtml = `
            <div class="recommendations">
                <h4>💡 권장 대응방안</h4>
                <ul>
                    ${analysis.recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    let aiExplanationHtml = '';
    if (analysis.explanation) {
        aiExplanationHtml = `
            <div class="ai-explanation">
                <h4>🤖 AI 상세 분석</h4>
                <p class="explanation-text">${analysis.explanation}</p>
            </div>
        `;
    }
    
    analysisContent.innerHTML = `
        <div class="severity-indicator" style="border-left-color: ${severityColor}">
            <h3>위험도: <span style="color: ${severityColor}">${severityText}</span></h3>
            <p class="ai-powered">🤖 Claude AI로 분석됨</p>
        </div>
        
        <div class="analysis-details">
            <div class="content-preview">
                <h4>📝 분석된 내용</h4>
                <p class="content-text">"${analysis.content.substring(0, 150)}${analysis.content.length > 150 ? '...' : ''}"</p>
            </div>
            
            ${aiExplanationHtml}
            
            ${violationsHtml}
            
            ${recommendationsHtml}
            
            <div class="legal-info">
                <h4>⚖️ 참고 정보</h4>
                <p><strong>신고 방법:</strong> 사이버범죄신고센터 (cyberbureau.police.go.kr) 또는 국번없이 112</p>
                <p><strong>증거 보전:</strong> 스크린샷, URL, 작성 시간 등을 기록해두세요</p>
                <p><strong>법률상담:</strong> 대한법무사협회 (1577-0001), 대한변호사협회 (1600-0012)</p>
            </div>
        </div>
    `;
    
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function getLegalExplanation(violation) {
    const explanations = {
        '모욕죄': '형법 제311조, 공연히 사람을 모욕 시 1년 이하 징역 또는 200만원 이하 벌금',
        '협박죄': '형법 제283조, 사람을 협박 시 3년 이하 징역 또는 500만원 이하 벌금',
        '명예훼손죄': '형법 제307조, 공연히 사실을 적시하여 명예훼손 시 2년 이하 징역 또는 500만원 이하 벌금',
        '성적 괴롭힘': '성폭력범죄의 처벌 등에 관한 특례법, 통신매체를 이용한 음란행위'
    };
    
    return explanations[violation] || '관련 법령 검토 필요';
}

async function analyzeWithClaudeAPI(text, targetRealPerson, containsFalseInfo) {
    const prompt = `
다음 텍스트에 대한 한국 법적 위반사항을 분석해주세요:

분석 대상 텍스트: "${text}"

추가 정보:
- 실제 인물을 향한 게시물: ${targetRealPerson ? '예' : '아니오'}
- 허위사실 유포 가능성: ${containsFalseInfo ? '예' : '아니오'}

다음 JSON 형식으로 응답해주세요:
{
    "severity": "low|medium|high",
    "violations": ["법령명1", "법령명2", ...],
    "content": "분석된 텍스트",
    "recommendations": ["권장사항1", "권장사항2", ...],
    "explanation": "상세한 법적 분석 설명"
}

고려할 법적 위반사항:
1. 모욕죄 (형법 제311조) - 공연히 사람을 모욕
2. 명예훼손죄 (형법 제307조) - 공연히 사실을 적시하여 명예훼손
3. 협박죄 (형법 제283조) - 사람을 협박
4. 성적 괴롭힘 관련 법령
5. 정보통신망법 위반 (온라인 명예훼손, 모독)

허위사실 유포가 체크된 경우 명예훼손죄의 성립 가능성이 높아집니다.
실제 인물 대상이 체크된 경우 모욕죄, 명예훼손죄의 성립 가능성이 높아집니다.
`;

    const apiKey = getApiKey();
    const response = await fetch(CONFIG.CLAUDE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': CONFIG.ANTHROPIC_VERSION
        },
        body: JSON.stringify({
            model: CONFIG.CLAUDE_MODEL,
            max_tokens: CONFIG.MAX_TOKENS,
            messages: [{
                role: 'user',
                content: prompt
            }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API 요청 실패: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.content[0].text;
    
    try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('JSON 형식을 찾을 수 없음');
        }
    } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        throw new Error('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.');
    }
}

async function analyzeImageWithClaudeAPI(base64Image, targetRealPerson, containsFalseInfo) {
    const prompt = `
이 이미지의 텍스트를 읽고 한국 법적 위반사항을 분석해주세요:

추가 정보:
- 실제 인물을 향한 게시물: ${targetRealPerson ? '예' : '아니오'}
- 허위사실 유포 가능성: ${containsFalseInfo ? '예' : '아니오'}

다음 JSON 형식으로 응답해주세요:
{
    "severity": "low|medium|high",
    "violations": ["법령명1", "법령명2", ...],
    "content": "이미지에서 추출된 텍스트",
    "recommendations": ["권장사항1", "권장사항2", ...],
    "explanation": "상세한 법적 분석 설명"
}

고려할 법적 위반사항:
1. 모욕죄 (형법 제311조)
2. 명예훼손죄 (형법 제307조)
3. 협박죄 (형법 제283조)
4. 성적 괴롭힘 관련 법령
5. 정보통신망법 위반

허위사실과 실제 인물 대상 여부를 고려하여 분석해주세요.
`;

    const apiKey = getApiKey();
    const response = await fetch(CONFIG.CLAUDE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': CONFIG.ANTHROPIC_VERSION
        },
        body: JSON.stringify({
            model: CONFIG.CLAUDE_MODEL,
            max_tokens: CONFIG.MAX_TOKENS,
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: uploadedImage.type,
                            data: base64Image
                        }
                    },
                    {
                        type: 'text',
                        text: prompt
                    }
                ]
            }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API 요청 실패: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.content[0].text;
    
    try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('JSON 형식을 찾을 수 없음');
        }
    } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        throw new Error('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.');
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}