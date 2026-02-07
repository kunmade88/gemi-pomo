const focusInput = document.getElementById('focus-input');
const breakInput = document.getElementById('break-input');
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

let timeLeft = focusInput.value * 60;
let timerId = null;
let isFocusMode = true;

// 월별 데이터까지 지원하는 새로운 데이터 구조
let stats = JSON.parse(localStorage.getItem('pomoStats_2026_Analysis')) || { 
    totalMinutes: 0, 
    tagData: {}, 
    monthlyData: new Array(12).fill(0) 
};

// 차트 변수
let monthlyChart = null;
let tagChart = null;

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

function renderStats() {
    statsList.innerHTML = '';
    const tags = Object.keys(stats.tagData);
    if (tags.length === 0) {
        statsList.innerHTML = '<div class="text-center text-gray-400 mt-10 italic text-sm">기록된 활동이 없어요 🍅</div>';
    } else {
        tags.forEach(tag => {
            const data = stats.tagData[tag];
            const div = document.createElement('div');
            div.className = 'bg-white/60 p-3 rounded-xl flex justify-between items-center shadow-sm text-sm';
            div.innerHTML = `<div><p class="text-[9px] text-gray-400 font-bold">#${tag}</p><p class="text-base">${'🍅'.repeat(Math.min(data.sessions, 5))}${data.sessions > 5 ? '..' : ''}</p></div><p class="font-black text-rose-500">${data.minutes}m</p>`;
            statsList.appendChild(div);
        });
    }
    totalTimeDisplay.innerText = stats.totalMinutes;
}

function renderCharts() {
    const ctxMonthly = document.getElementById('monthlyChart').getContext('2d');
    const ctxTag = document.getElementById('tagChart').getContext('2d');

    if (monthlyChart) monthlyChart.destroy();
    if (tagChart) tagChart.destroy();

    monthlyChart = new Chart(ctxMonthly, {
        type: 'bar',
        data: {
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            datasets: [{
                label: '분(min)',
                data: stats.monthlyData,
                backgroundColor: '#fb7185',
                borderRadius: 4
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }
    });

    const tagLabels = Object.keys(stats.tagData);
    const tagValues = tagLabels.map(tag => stats.tagData[tag].minutes);
    const colors = ['#fb7185', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa', '#f472b6'];

    tagChart = new Chart(ctxTag, {
        type: 'doughnut',
        data: {
            labels: tagLabels,
            datasets: [{
                data: tagValues,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: { plugins: { legend: { display: false } }, cutout: '75%' }
    });

    // 범례 퍼센트 계산
    const legend = document.getElementById('tag-legend');
    const total = stats.totalMinutes || 1;
    legend.innerHTML = tagLabels.map((label, i) => {
        const percent = ((tagValues[i] / total) * 100).toFixed(1);
        return `<div class="flex justify-between items-center"><span class="truncate mr-2"><i style="color:${colors[i%colors.length]}">●</i> ${label}</span><b>${percent}%</b></div>`;
    }).join('');
}

function updateDisplay() {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    timerDisplay.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    if (!isFocusMode) skipBtn.classList.remove('hidden');
    else skipBtn.classList.add('hidden');
}

function toggleMode() {
    if (isFocusMode) {
        const tag = taskTag.value.trim() || "기본";
        const sessionMins = parseInt(focusInput.value) || 25;
        const currentMonth = new Date().getMonth();

        stats.totalMinutes += sessionMins;
        if (!stats.tagData[tag]) stats.tagData[tag] = { minutes: 0, sessions: 0 };
        stats.tagData[tag].minutes += sessionMins;
        stats.tagData[tag].sessions += 1;
        stats.monthlyData[currentMonth] += sessionMins;

        localStorage.setItem('pomoStats_2026_Analysis', JSON.stringify(stats));
        alarmSound.play().catch(() => {});
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }

    isFocusMode = !isFocusMode;
    timeLeft = (isFocusMode ? focusInput.value : breakInput.value) * 60;
    bodyBg.style.backgroundColor = isFocusMode ? '#fff1f2' : '#ecfdf5';
    updateDisplay();
}

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
                const msg = isFocusMode ? "완료! 휴식할까요?" : "휴식 끝! 다시 고고!";
                toggleMode();
                setTimeout(() => alert(msg), 100);
            }
        }, 1000);
    }
});

resetBtn.addEventListener('click', () => {
    if(confirm("리셋하시겠어요?")) {
        clearInterval(timerId);
        timerId = null;
        isFocusMode = true;
        timeLeft = focusInput.value * 60;
        bodyBg.style.backgroundColor = '#fff1f2';
        startBtn.innerText = '▶';
        updateDisplay();
    }
});

skipBtn.addEventListener('click', () => {
    if (confirm("휴식을 건너뛸까요?")) {
        clearInterval(timerId);
        timerId = null;
        isFocusMode = true;
        timeLeft = focusInput.value * 60;
        bodyBg.style.backgroundColor = '#fff1f2';
        startBtn.innerText = '▶';
        updateDisplay();
    }
});

[focusInput, breakInput].forEach(input => {
    input.addEventListener('change', () => {
        if (!timerId) {
            timeLeft = (isFocusMode ? focusInput.value : breakInput.value) * 60;
            updateDisplay();
        }
    });
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
