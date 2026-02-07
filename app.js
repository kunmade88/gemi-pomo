const focusInput = document.getElementById('focus-input');
const breakInput = document.getElementById('break-input');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const bodyBg = document.getElementById('body-bg');
const taskTag = document.getElementById('task-tag');
const totalTimeDisplay = document.getElementById('total-time');
const statsList = document.getElementById('stats-list');
const yearBar = document.getElementById('year-bar');
const yearPercentText = document.getElementById('year-percent');

const alarmSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

let timeLeft = focusInput.value * 60;
let timerId = null;
let isFocusMode = true;
let stats = JSON.parse(localStorage.getItem('pomoStats_2026')) || { totalMinutes: 0, tagData: {} };

function switchPage(to) {
    const pTimer = document.getElementById('page-timer');
    const pStats = document.getElementById('page-stats');
    if (to === 'stats') {
        pTimer.style.transform = 'translateX(-100%)';
        pStats.style.transform = 'translateX(0)';
        renderStats();
    } else {
        pTimer.style.transform = 'translateX(0)';
        pStats.style.transform = 'translateX(100%)';
    }
}

function renderStats() {
    statsList.innerHTML = '';
    const tags = Object.keys(stats.tagData);
    if (tags.length === 0) {
        statsList.innerHTML = '<div class="text-center text-gray-400 mt-10 italic">기록된 활동이 없어요 🍅</div>';
    } else {
        tags.forEach(tag => {
            const data = stats.tagData[tag];
            const div = document.createElement('div');
            div.className = 'bg-white/60 p-4 rounded-2xl flex justify-between items-center shadow-sm';
            div.innerHTML = `<div><p class="text-[10px] text-gray-400 font-bold">#${tag}</p><p class="text-lg">${'🍅'.repeat(data.sessions)}</p></div><p class="font-black text-rose-500">${data.minutes}m</p>`;
            statsList.appendChild(div);
        });
    }
    totalTimeDisplay.innerText = stats.totalMinutes;
}

function updateDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    timerDisplay.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// 입력값 변경 시 즉시 타이머 반영
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
                
                if (isFocusMode) {
                    const tag = taskTag.value.trim() || "기본";
                    const sessionMins = parseInt(focusInput.value);
                    stats.totalMinutes += sessionMins;
                    if (!stats.tagData[tag]) stats.tagData[tag] = { minutes: 0, sessions: 0 };
                    stats.tagData[tag].minutes += sessionMins;
                    stats.tagData[tag].sessions += 1;
                    localStorage.setItem('pomoStats_2026', JSON.stringify(stats));
                    alarmSound.play().catch(() => {});
                }

                isFocusMode = !isFocusMode;
                timeLeft = (isFocusMode ? focusInput.value : breakInput.value) * 60;
                bodyBg.style.backgroundColor = isFocusMode ? '#fff1f2' : '#ecfdf5';
                updateDisplay();
                alert(isFocusMode ? "휴식 끝! 다시 집중해요." : "완료! 고생하셨어요.");
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

function updateYear() {
    const now = new Date();
    const progress = (now - new Date(2026,0,1)) / (new Date(2027,0,1) - new Date(2026,0,1)) * 100;
    yearBar.style.width = progress + '%';
    yearPercentText.innerText = progress.toFixed(4) + '%';
}

setInterval(updateYear, 1000);
updateYear();
updateDisplay();
renderStats();
