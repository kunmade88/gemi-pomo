// [보완 완료] 모든 코드를 하나의 스코프로 감싸 안전하게 실행합니다.
document.addEventListener('DOMContentLoaded', () => {
    // 1. 요소 선택
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

    // 2. 상태 및 데이터 초기화
    let timerId = null;
    let isFocusMode = true;
    let stats = JSON.parse(localStorage.getItem('pomoStats_2026_Final')) || { 
        totalMinutes: 0, 
        tagData: {}, 
        monthlyData: new Array(12).fill(0) 
    };

    function getSetTime() {
        const min = isFocusMode ? (parseInt(focusMin.value) || 0) : (parseInt(breakMin.value) || 0);
        const sec = isFocusMode ? (parseInt(focusSec.value) || 0) : (parseInt(breakSec.value) || 0);
        return (min * 60) + sec;
    }

    let timeLeft = getSetTime();

    // 3. 핵심 타이머 기능
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
            // [수정] 입력창 값이 아닌, 실제 설정되었던 총 시간을 기준으로 기록합니다.
            const totalSecs = getSetTime(); 
            const sessionMins = parseFloat((totalSecs / 60).toFixed(2)); 

            stats.totalMinutes = parseFloat((stats.totalMinutes + sessionMins).toFixed(2));
            if (!stats.tagData[tag]) stats.tagData[tag] = { minutes: 0, sessions: 0 };
            stats.tagData[tag].minutes = parseFloat((stats.tagData[tag].minutes + sessionMins).toFixed(2));
            stats.tagData[tag].sessions += 1;
            
            const currentMonth = new Date().getMonth();
            stats.monthlyData[currentMonth] = parseFloat((stats.monthlyData[currentMonth] + sessionMins).toFixed(2));

            saveData();
            alarmSound.play().catch(() => {});
        }

        isFocusMode = !isFocusMode;
        timeLeft = getSetTime();
        bodyBg.style.backgroundColor = isFocusMode ? '#fff1f2' : '#ecfdf5';
        updateDisplay();
    }

    // 4. 수정 및 삭제 로직 (데이터 관리)
    window.editTagName = function(oldTag) {
        const newTag = prompt(`'${oldTag}' 태그의 이름을 무엇으로 바꿀까요?`, oldTag);
        if (newTag && newTag.trim() !== "" && newTag !== oldTag) {
            const trimmedTag = newTag.trim();
            if (stats.tagData[trimmedTag]) {
                stats.tagData[trimmedTag].minutes += stats.tagData[oldTag].minutes;
                stats.tagData[trimmedTag].sessions += stats.tagData[oldTag].sessions;
            } else {
                stats.tagData[trimmedTag] = stats.tagData[oldTag];
            }
            delete stats.tagData[oldTag];
            saveAndRefresh();
        }
    }

    window.deleteStat = function(tag) {
        if (confirm(`'${tag}' 기록을 영구 삭제할까요?\n총 시간에서도 차감됩니다.`)) {
            stats.totalMinutes = parseFloat((stats.totalMinutes - stats.tagData[tag].minutes).toFixed(2));
            delete stats.tagData[tag];
            saveAndRefresh();
        }
    }

    function saveData() {
        localStorage.setItem('pomoStats_2026_Final', JSON.stringify(stats));
    }

    function saveAndRefresh() {
        saveData();
        renderStats();
        renderCharts();
    }

    // 5. 페이지 전환 및 렌더링
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
            statsList.innerHTML = '<div class="text-center text-gray-400 mt-10 italic text-sm">기록이 없습니다 🍅</div>';
        } else {
            tags.forEach(tag => {
                const data = stats.tagData[tag];
                const div = document.createElement('div');
                div.className = 'stat-item bg-white/60 p-3 rounded-xl flex justify-between items-center shadow-sm mb-2 text-sm group';
                div.innerHTML = `
                    <div class="flex-1 cursor-pointer hover:bg-rose-50 rounded-lg p-1 transition-colors" onclick="editTagName('${tag}')">
                        <p class="text-[9px] text-gray-400 font-bold flex items-center gap-1">#${tag} <span class="text-[8px] text-rose-300 opacity-0 group-hover:opacity-100">(수정)</span></p>
                        <p class="text-base">${'🍅'.repeat(Math.min(data.sessions, 5))}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <p class="font-black text-rose-500">${data.minutes}m</p>
                        <button onclick="deleteStat('${tag}')" class="delete-btn text-gray-300 hover:text-rose-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                `;
                statsList.appendChild(div);
            });
        }
        totalTimeDisplay.innerText = stats.totalMinutes;
    }

    // 6. 차트 생성
    let monthlyChart, tagChart;
    function renderCharts() {
        const canvasMonthly = document.getElementById('monthlyChart');
        const canvasTag = document.getElementById('tagChart');
        if(!canvasMonthly || !canvasTag) return; // 요소가 없으면 실행 중단

        const ctxMonthly = canvasMonthly.getContext('2d');
        const ctxTag = canvasTag.getContext('2d');
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

    // 7. 이벤트 리스너 및 초기화
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
                }
            }, 1000);
        }
    });

    resetBtn.addEventListener('click', () => {
        if(confirm("초기화할까요?")) {
            clearInterval(timerId);
            timerId = null;
            timeLeft = getSetTime();
            startBtn.innerText = '▶';
            updateDisplay();
        }
    });

    skipBtn.addEventListener('click', () => {
        if (confirm("휴식을 건너뛸까요?")) {
            clearInterval(timerId);
            timerId = null;
            isFocusMode = true;
            timeLeft = getSetTime();
            bodyBg.style.backgroundColor = '#fff1f2';
            startBtn.innerText = '▶';
            updateDisplay();
        }
    });

    [focusMin, focusSec, breakMin, breakSec].forEach(input => {
        input.addEventListener('input', () => {
            if (input.id.includes('sec') && input.value > 59) input.value = 59;
            if (!timerId) {
                timeLeft = getSetTime();
                updateDisplay();
            }
        });
    });

    function updateYear() {
        const now = new Date();
        const progress = (now - new Date(2026,0,1)) / (new Date(2027,0,1) - new Date(2026,0,1)) * 100;
        yearBar.style.width = progress + '%';
        yearPercentText.innerText = progress.toFixed(7) + '%';
    }

    setInterval(updateYear, 50);
    updateYear();
    updateDisplay();
});
