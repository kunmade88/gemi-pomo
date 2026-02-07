// 설정값 불러오기
const focusInput = document.getElementById('focus-input');
const breakInput = document.getElementById('break-input');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const bodyBg = document.getElementById('body-bg');
const modeText = document.getElementById('mode-text');

let timeLeft = focusInput.value * 60;
let timerId = null;
let isFocusMode = true;

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    // 브라우저 탭 제목에도 시간 표시
    document.title = `${timerDisplay.innerText} - Pomodoro`;
}

// 설정값이 바뀔 때 즉시 반영 (타이머가 멈춰있을 때만)
[focusInput, breakInput].forEach(input => {
    input.addEventListener('change', () => {
        if (!timerId) {
            timeLeft = (isFocusMode ? focusInput.value : breakInput.value) * 60;
            updateDisplay();
        }
    });
});

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
                alert(isFocusMode ? "집중할 시간입니다!" : "휴식 시간입니다!");
            }
        }, 1000);
    }
});

function toggleMode() {
    isFocusMode = !isFocusMode;
    timeLeft = (isFocusMode ? focusInput.value : breakInput.value) * 60;
    
    // UI 업데이트
    bodyBg.className = isFocusMode 
        ? 'bg-rose-50 min-h-screen flex items-center justify-center transition-colors duration-500' 
        : 'bg-emerald-50 min-h-screen flex items-center justify-center transition-colors duration-500';
    
    modeText.innerText = isFocusMode ? 'Focus' : 'Break';
    modeText.className = isFocusMode 
        ? 'px-6 py-2 bg-white rounded-full shadow-sm text-rose-600 font-bold transition-all' 
        : 'px-6 py-2 bg-white rounded-full shadow-sm text-emerald-600 font-bold transition-all';
    
    updateDisplay();
}

resetBtn.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    timeLeft = (isFocusMode ? focusInput.value : breakInput.value) * 60;
    startBtn.innerText = '▶';
    updateDisplay();
});

// 초기 실행
updateDisplay();
