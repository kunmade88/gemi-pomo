// 요소 선택
const focusMin = document.getElementById('focus-min');
const focusSec = document.getElementById('focus-sec');
const breakMin = document.getElementById('break-min');
const breakSec = document.getElementById('break-sec');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const skipBtn = document.getElementById('skip-btn');
const bodyBg = document.getElementById('body-bg');
const taskTag = document.getElementById('task-tag');
const totalTimeDisplay = document.getElementById('total-time');
const statsList = document.getElementById('stats-list');
const yearBar = document.getElementById('year-bar');
const yearPercentText = document.getElementById('year-percent');

const alarmSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

// 상태 변수
let timerId = null;
let isFocusMode = true;
let stats = JSON.parse(localStorage.getItem('pomoStats_2026_Final')) || { 
    totalMinutes: 0, 
    tagData: {}, 
    monthlyData: new Array(12).fill(0) 
};

// 현재 설정값에 따른 초 계산 함수
function getSetTime() {
    const min = isFocusMode ? parseInt(focusMin.value) : parseInt(breakMin.value);
    const sec = isFocusMode ? parseInt(focusSec.value) : parseInt(breakSec.value);
    return (min * 60) + (sec || 0);
}

let timeLeft = getSetTime();

// 화면 업데이트 (타이머 & 건너뛰기 버튼)
function updateDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    timerDisplay.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    
    if (!isFocusMode) skipBtn.classList.remove('hidden');
    else skipBtn.classList.add('hidden');
}

// 모드 전환 및 데이터 저장
function toggleMode() {
    if (isFocusMode) {
        const tag = taskTag.value.trim() || "기본";
        const totalSecs = (parseInt(focusMin.value) * 60) + (parseInt(focusSec.value) || 0);
        const sessionMins = parseFloat((totalSecs / 60).toFixed(2)); 

        stats.totalMinutes = parseFloat((stats.totalMinutes + sessionMins).toFixed(2));
        if (!stats.tagData[tag]) stats.tagData[tag] = { minutes: 0, sessions: 0 };
        stats.tagData[tag].minutes = parseFloat((stats.tagData[tag].minutes + sessionMins).toFixed(2));
        stats.tagData[tag].sessions += 1;
        
        const currentMonth = new Date().getMonth();
        stats.monthlyData[currentMonth] = parseFloat((stats.monthlyData[currentMonth] + sessionMins).toFixed(2));

        localStorage.setItem('pomoStats_2026_Final', JSON.stringify(stats));
        alarmSound.play().catch(() => {});
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }

    isFocusMode = !isFocusMode;
    timeLeft = getSetTime();
    bodyBg.style.backgroundColor = isFocusMode ? '#fff1f2' : '#ecfdf5';
    updateDisplay();
}

// 버튼 이벤트 리스너
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
                const msg = isFocusMode ? "집중 끝! 휴식할까요?" : "휴식 끝! 다시 시작해요.";
                toggleMode();
                setTimeout(() => alert(msg), 100);
            }
        }, 1000);
    }
});

resetBtn.addEventListener('click', () => {
    if(confirm("타이머를 초기화할까요?")) {
        clearInterval(timerId);
        timerId = null;
        timeLeft = getSetTime();
        startBtn.innerText = '▶';
        updateDisplay();
    }
});

skipBtn.addEventListener('click', () => {
    if (confirm("휴식을 건너뛰고 집중 모드로 갈까요?")) {
        clearInterval(timerId);
        timerId = null;
        isFocusMode = true;
        timeLeft = getSetTime();
        bodyBg.style.backgroundColor = '#fff1f2';
        startBtn.innerText = '▶';
        updateDisplay();
    }
});

// 입력값 변경 시 실시간 반영
[focusMin, focusSec, breakMin, breakSec].forEach(input => {
    input.addEventListener('input', () => {
        if (input.id.includes('sec') && input.value > 59) input.value = 59;
        if (!timerId) {
            timeLeft = getSetTime();
            updateDisplay();
        }
    });
});

// 2026년 진행도 (초정밀 업데이트)
function updateYear() {
    const now = new Date();
    const progress = (now - new Date(2026,0,1)) / (new Date(2027,0,1) - new Date(2026,0,1)) * 100;
    yearBar.style.width = progress + '%';
    yearPercentText.innerText = progress.toFixed(7) + '%';
}

// 차트 관련 변수 및 함수
let monthlyChart, tagChart;
window.switchPage = function(to) {
    const pTimer = document.getElementById('page-timer');
    const pStats = document.getElementById('page-stats');
    if (to === 'stats') {
        pTimer.style.transform = 'translateX(-100%)';
        pStats.style.transform = 'translateX(0)';
        renderStats();
        renderCharts();
    } else {
        pTimer.style.transform = 'translateX(0)';
        pStats.style.transform = 'translateX(100%)';
    }
}

function renderCharts() {
    const ctxMonthly = document.getElementById('monthlyChart').getContext('2d');
    const ctxTag = document.getElementById('tagChart').getContext('2d');
    if (monthlyChart) monthlyChart.destroy();
    if (tagChart) tagChart.destroy();

    monthlyChart = new Chart(ctxMonthly, {
        type: 'bar',
        data: {
            labels: ['1','2','3','4','5','6','7','8','9','10','11','12'],
            datasets: [{ label: 'Min', data: stats.monthlyData, backgroundColor: '#fb7185', borderRadius: 4 }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }
    });

    const tagLabels = Object.keys(stats.tagData);
    const tagValues = tagLabels.map(tag => stats.tagData[tag].minutes);
    const colors = ['#fb7185', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa'];

    tagChart = new Chart(ctxTag, {
        type: 'doughnut',
        data: {
            labels: tagLabels,
            datasets: [{ data: tagValues, backgroundColor: colors, borderWidth: 0 }]
        },
        options: { plugins: { legend: { display: false } }, cutout: '75%' }
    });

    const legend = document.getElementById('tag-legend');
    const total = stats.totalMinutes || 1;
    legend.innerHTML = tagLabels.map((label, i) => {
        const percent = ((tagValues[i] / total) * 100).toFixed(1);
        return `<div class="flex justify-between items-center text-[10px] font-medium"><span class="truncate pr-2">● ${label}</span><b>${percent}%</b></div>`;
    }).join('');
}

function renderStats() {
    statsList.innerHTML = '';
    const tags = Object.keys(stats.tagData);
    tags.forEach(tag => {
        const data = stats.tagData[tag];
        const div = document.createElement('div');
        div.className = 'bg-white/60 p-3 rounded-xl flex justify-between items-center shadow-sm mb-2 text-sm';
        div.innerHTML = `<div><p class="text-[9px] text-gray-400 font-bold">#${tag}</p><p>${'🍅'.repeat(Math.min(data.sessions, 5))}</p></div><p class="font-black text-rose-500">${data.minutes}m</p>`;
        statsList.appendChild(div);
    });
    totalTimeDisplay.innerText = stats.totalMinutes;
}

// 초기화
setInterval(updateYear, 50);
updateYear();
updateDisplay();
