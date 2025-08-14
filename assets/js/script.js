let timerDisplay = document.getElementById('timer');
let startBtn = document.getElementById('start');
let pauseBtn = document.getElementById('pause');
let resetBtn = document.getElementById('reset');
let statusText = document.getElementById('status');
let cyclesDisplay = document.getElementById('cycles');
let historyTable = document.querySelector('#history tbody');
let alarm = document.getElementById('alarm-sound');
let activityInput = document.getElementById('activity');
let progressBar = document.querySelector('.progress');

let focusTime = 25 * 60;
let shortBreak = 5 * 60;
let longBreak = 20 * 60;

let isRunning = false;
let isFocus = true;
let timer;
let timeLeft = focusTime;
let cycles = 0;
let sessionStart = null;
let history = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];

function formatTime(seconds) {
  let min = String(Math.floor(seconds / 60)).padStart(2, '0');
  let sec = String(seconds % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
  statusText.textContent = isFocus ? 'Foco' : 'Descanso';
  cyclesDisplay.textContent = cycles;
  updateProgress();
}

function updateProgress() {
  let fullTime = isFocus
    ? focusTime
    : (cycles % 4 === 0 && cycles !== 0 ? longBreak : shortBreak);
  let percent = ((fullTime - timeLeft) / fullTime) * 100;
  progressBar.style.width = `${percent}%`;
}

function notifyUser(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

function playSound() {
  alarm.play();
}

function switchMode() {
  let sessionEnd = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (sessionStart) {
    logSession(sessionStart, sessionEnd, isFocus ? 'Foco' : 'Descanso', activityInput.value);
  }

  if (isFocus) {
    cycles++;
  }

  isFocus = !isFocus;
  if (isFocus) {
    timeLeft = focusTime;
  } else {
    timeLeft = (cycles % 4 === 0 && cycles !== 0) ? longBreak : shortBreak;
  }

  sessionStart = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  updateDisplay();
  playSound();

  notifyUser(
    isFocus ? '¡Hora de concentrarse!' : (cycles % 4 === 0 ? 'Descanso largo' : 'Descanso corto'),
    isFocus ? 'Nuevo ciclo iniciado.' : 'Relájate un poco.'
  );
}

function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    updateDisplay();
  } else {
    clearInterval(timer);
    switchMode();
    timer = setInterval(tick, 1000);
  }
}

startBtn.addEventListener('click', () => {
  if (!isRunning) {
    sessionStart = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    timer = setInterval(tick, 1000);
    isRunning = true;
  }
});

pauseBtn.addEventListener('click', () => {
  clearInterval(timer);
  isRunning = false;
});

resetBtn.addEventListener('click', () => {
  clearInterval(timer);
  isRunning = false;
  isFocus = true;
  timeLeft = focusTime;
  updateDisplay();
});

function logSession(start, end, mode, activity) {
  history.push({ start, end, mode, activity });
  localStorage.setItem('pomodoroHistory', JSON.stringify(history));
  addHistoryRow(start, end, mode, activity);
}

function addHistoryRow(start, end, mode, activity) {
  let row = document.createElement('tr');
  row.innerHTML = `<td>${start}</td><td>${end}</td><td>${mode}</td><td>${activity || '-'}</td>`;
  historyTable.appendChild(row);
}

function clearHistory() {
  history = [];
  localStorage.removeItem('pomodoroHistory');
  historyTable.innerHTML = '';
}

history.forEach(entry => addHistoryRow(entry.start, entry.end, entry.mode, entry.activity));
updateDisplay();
Notification.requestPermission();