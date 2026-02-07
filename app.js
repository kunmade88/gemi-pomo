// 1. 설정 및 요소 불러오기
const focusInput = document.getElementById('focus-input');
const breakInput = document.getElementById('break-input');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const bodyBg = document.getElementById('body-bg');
const modeText = document.getElementById('mode-text');

// 알람 소리 설정 (구글 공식 알람 사운드)
const alarmSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
alarmSound.load(); 

let timeLeft = focusInput.value * 60;
let timerId = null;
let isFocusMode = true;
let todaySessions = 0; // 오늘 완료한 세션 기록용

// 2. 시간 표시 업데이트 함수
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timerDisplay.innerText = timeString;
    document.title = `${timeString} - ${isFocusMode ? '집중' : '휴식'}`;
}

// 3. 모드 전환 및 알림 함수
function toggleMode() {
    // 진동 알림 (모바일)
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    
    // 소리 알림
    alarmSound.play().catch(e => console.log("소리 재생을 위해 페이지를 클릭해주세요."));

    // 집중 모드가 끝났을 때만 세션 카운트 증가
    if (isFocusMode) {
        todaySessions++;
        console.log(`오늘의 집중 완료: ${todaySessions}회`);
        // 여기에 🍅 표시를 추가하는 로직을 넣을 수 있습니다.
    }

    isFocusMode = !isFocusMode;
    timeLeft = (isFocusMode ? focusInput.value : breakInput.value) * 60;
    
    // 배경색 및 텍스트 변경
    bodyBg.className = isFocusMode 
        ? 'bg-rose-50 min-h-screen flex items-center justify-center transition-colors duration-500' 
        : 'bg-emerald-50 min-h-screen flex items-center justify-center transition-colors duration-500';
    
    modeText.innerText = isFocusMode ? 'Focus' : 'Break';
    modeText.className = isFocusMode 
        ? 'px-6 py-2 bg-white rounded-full shadow-sm text-rose-600 font-bold transition-all' 
        : 'px-6 py-2 bg-white rounded-full shadow-sm text-emerald-600 font-bold transition-all';
    
    updateDisplay();
}

// 4. 이벤트 리스너 (버튼 클릭 등)
startBtn.addEventListener('click', () => {
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
        startBtn.innerText = '▶';
    } else {
        startBtn.innerText = 'II';
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerId);
                timerId = null;
                startBtn.innerText = '▶';
                toggleMode();
                // 브라우저 팝업 알림 (선택사항)
                setTimeout(() => alert(isFocusMode ? "휴식이 끝났습니다!" : "집중 세션이 완료되었습니다!"), 100);
            }
        }, 1000);
    }
});

resetBtn.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    timeLeft = (isFocusMode ? focusInput.value : breakInput.value) * 60;
    startBtn.innerText = '▶';
    updateDisplay();
});

[focusInput, breakInput].forEach(input => {
    input.addEventListener('change', () => {
        if (!timerId) {
            timeLeft = (isFocusMode ? focusInput.value : breakInput.value) * 60;
            updateDisplay();
        }
    });
});

// 초기화
updateDisplay();
