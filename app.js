// 요소 선택
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const bodyBg = document.getElementById('body-bg');
const taskTag = document.getElementById('task-tag');
const totalTimeDisplay = document.getElementById('total-time');
const statsList = document.getElementById('stats-list');
const yearBar = document.getElementById('year-bar');
const yearPercentText = document.getElementById('year-percent');

// 상태 및 데이터
let timeLeft = 25 * 60;
let timerId = null;
let isFocusMode = true;
let stats = JSON.parse(localStorage.getItem('pomoStats_2026')) || { totalMinutes: 0, tagData: {} };

// 페이지 전환 함수
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

// 통계 렌더링 함수
function renderStats() {
    statsList.innerHTML = '';
    const tags = Object.keys(stats.tagData);
    
    if (tags.length === 0) {
        statsList.innerHTML = '<div class="text-center text-gray-400 mt-10 text-sm italic">아직 기록된 활동이 없어요. 🍅</div>';
        return;
    }

    tags.forEach(tag => {
        const data = stats.tagData[tag];
        const item = document.createElement('div');
        item.className = 'bg-white/60 p-4 rounded-2xl shadow-sm border border-white/40 flex justify-between items-center transition-all hover:bg-white/80';
        item.innerHTML = `
            <div>
                <div class="text-xs font-bold text-gray-400 mb-1">#${tag}</div>
                <div class="text-lg font-black text-gray-800">${'🍅'.repeat(data.sessions)}</div>
            </div>
            <div class="text-right">
                <div class="text-sm font-black text-rose-500">${data.minutes} min</div>
            </div>
        `;
        statsList.appendChild(item);
    });
    totalTimeDisplay.innerText = stats.totalMinutes;
}

// 데이터 저장
function saveStats() {
    const currentTag = taskTag.value.trim() || "기타";
    const minutes = 25; // 기본 집중 시간

    stats.totalMinutes += minutes;
    
    if (!stats.tagData[currentTag]) {
        stats.tagData[currentTag] = { minutes: 0, sessions: 0 };
    }
    stats.tagData[currentTag].minutes += minutes;
    stats.tagData[currentTag].sessions += 1;

    localStorage.setItem('pomoStats_2026', JSON.stringify(stats));
}

// 기존 타이머 로직 통합
function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    timerDisplay.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateYearProgress() {
    const now = new Date();
    const start = new Date(2026, 0, 1);
    const end = new Date(2027, 0, 1);
    const progress = (now - start) / (end - start) * 100;
    yearBar.style.width = progress + '%';
    yearPercentText.innerText = progress.toFixed(4) + '%';
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
                if (isFocusMode) saveStats();
                isFocusMode = !isFocusMode;
                timeLeft = isFocusMode ? 25 * 60 : 5 * 60;
                bodyBg.style.backgroundColor = isFocusMode ? '#fff1f2' : '#ecfdf5';
                updateDisplay();
                alert(isFocusMode ? "휴식 끝! 다시 집중해요." : "완료! 🍅 하나를 수확했습니다.");
            }
        }, 1000);
    }
});

// 초기화
setInterval(updateYearProgress, 1000);
updateYearProgress();
updateDisplay();
renderStats();
