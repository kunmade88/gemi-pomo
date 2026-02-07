// 1. 요소 불러오기 및 초기 변수 설정
const focusInput = document.getElementById('focus-input');
const breakInput = document.getElementById('break-input');
const taskTag = document.getElementById('task-tag');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const bodyBg = document.getElementById('body-bg');
const stackContainer = document.getElementById('stack-container');
const totalTimeDisplay = document.getElementById('total-time');
const yearBar = document.getElementById('year-bar');
const yearPercentText = document.getElementById('year-percent');

// 알람 소리 설정
const alarmSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
alarmSound.load();

let timeLeft = focusInput.value * 60;
let timerId = null;
let isFocusMode = true;

// 로컬 스토리지 데이터 불러오기
let stats = JSON.parse(localStorage.getItem('pomoStats')) || { totalMinutes: 0, sessions: 0 };

// 2. UI 업데이트 함수들
function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    timerDisplay.innerText = timeString;
    document.title = `${timeString} - ${isFocusMode ? '집중' : '휴식'}`;
}

function updateStatsUI() {
    totalTimeDisplay.innerText = stats.totalMinutes;
    stackContainer.innerHTML = '🍅'.repeat(stats.sessions);
}

function updateYearProgress() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear() + 1, 0, 1);
    const progress = (now - start) / (end - start) * 100;
    
    if (yearBar) yearBar.style.width = progress + '%';
    if (yearPercentText) yearPercentText.innerText = progress.toFixed(4) + '%';
}

// 3. 핵심 로직 함수들
function saveStats(minutes) {
    stats.totalMinutes += parseInt(minutes);
    stats.sessions += 1;
    localStorage.setItem('pomoStats', JSON.stringify(stats));
    updateStatsUI();
}

function toggleMode() {
    // 알림 (진동 및 소리)
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    alarmSound.play().catch(e => console.log("소리 재생 권한 필요"));

    // 집중 모드 완료 시 통계 저장
    if (isFocusMode) {
        saveStats(focusInput.value);
    }

    // 모드 전환
    isFocusMode = !isFocusMode;
    timeLeft = (isFocusMode ? focusInput.value : breakInput.value) * 60;
    
    // 배경색 전환
    bodyBg.className = isFocusMode 
        ? 'bg-rose-50 min-h-screen flex items-center justify-center p-4 transition-colors duration-500' 
        : 'bg-emerald-50 min-h-screen flex items-center justify-center p-4 transition-colors duration-500';
    
    updateDisplay();
}

// 4. 이벤트 리스너
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
                const message = isFocusMode ? `${taskTag.value || '작업'} 완료! 휴식 시작!` : "다시 집중해볼까요?";
                toggleMode();
                setTimeout(() => alert(message), 100);
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

// 5. 초기 실행
setInterval(updateYearProgress, 1000);
updateYearProgress();
updateStatsUI();
updateDisplay();
