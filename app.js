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
// 데이터 키값을 Final로 통일하여 관리합니다.
let stats = JSON.parse(localStorage.getItem('pomoStats_2026_Final')) || { 
    totalMinutes: 0, 
    tagData: {}, 
    monthlyData: new Array(12).fill(0) 
};

function getSetTime() {
    const min = isFocusMode ? parseInt(focusMin.value) : parseInt(breakMin.value);
    const sec = isFocusMode ? parseInt(focusSec.value) : parseInt(breakSec.value);
    return (min * 60) + (sec || 0);
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
        const totalSecs = (parseInt(focusMin.value) * 60) + (parseInt(focusSec.value) || 0);
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
                    <button onclick="
