// ======================
// ELEMENTOS DEL DOM
// ======================
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');
const resetBtn = document.getElementById('reset');
const statusText = document.getElementById('status');
const cyclesDisplay = document.getElementById('cycles');
const historyTable = document.querySelector('#history tbody');
const alarm = document.getElementById('alarm-sound');
const activityInput = document.getElementById('activity');
const progressBar = document.querySelector('.progress');
const gratitudeTextarea = document.getElementById('gratitude');
const gratitudeCount = document.getElementById('gratitude-count');
const taskList = document.getElementById('task-list');
const exportModal = document.getElementById('export-modal');

// ======================
// CONSTANTES DE TIEMPO
// ======================
const focusTime = 25 * 60;
const shortBreak = 5 * 60;
const longBreak = 20 * 60;

// ======================
// VARIABLES DE ESTADO
// ======================
let isRunning = false;
let isFocus = true;
let timer;
let timeLeft = focusTime;
let cycles = 0;
let sessionStart = null;

let history = JSON.parse(localStorage.getItem('pomodoroHistory')) || [];
let savedTasks = JSON.parse(localStorage.getItem('pomodoroTasks')) || [];

// ======================
// FUNCIONES PRINCIPALES
// ======================
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
  const totalTime = isFocus ? focusTime : (cycles % 4 === 0 && cycles !== 0 ? longBreak : shortBreak);
  const percent = ((totalTime - timeLeft) / totalTime) * 100;
  progressBar.style.width = `${percent}%`;
}

function notifyUser(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

function playSound() {
  alarm.play();
}

function switchMode() {
  const sessionEnd = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (sessionStart) {
    logSession(sessionStart, sessionEnd, isFocus ? 'Foco' : 'Descanso', activityInput.value);
  }

  if (isFocus) cycles++;

  isFocus = !isFocus;
  timeLeft = isFocus ? focusTime : (cycles % 4 === 0 ? longBreak : shortBreak);
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

// ======================
// EVENTOS DE BOTONES
// ======================
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

// ======================
// HISTORIAL
// ======================
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

// ======================
// TAREAS DIARIAS
// ======================
for (let i = 1; i <= 10; i++) {
  const saved = savedTasks[i - 1] || { desc: '', done: false };
  let li = document.createElement('li');
  li.innerHTML = `
    <input type="checkbox" id="task-${i}" ${saved.done ? 'checked' : ''} />
    <input type="text" placeholder="Tarea ${i}" id="task-desc-${i}" class="task-desc ${saved.done ? 'task-completed' : ''}" value="${saved.desc}" />
  `;
  taskList.appendChild(li);
}

function saveTasks() {
  const tasks = [];
  for (let i = 1; i <= 10; i++) {
    const desc = document.getElementById(`task-desc-${i}`).value;
    const done = document.getElementById(`task-${i}`).checked;
    tasks.push({ desc, done });
  }
  localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
}

taskList.addEventListener('input', saveTasks);
taskList.addEventListener('change', (e) => {
  if (e.target && e.target.type === 'checkbox') {
    const index = e.target.id.split('-')[1];
    const input = document.getElementById(`task-desc-${index}`);
    input.classList.toggle('task-completed', e.target.checked);
    saveTasks();
  }
});

// ======================
// AGRADECIMIENTOS
// ======================
gratitudeTextarea.addEventListener('input', () => {
  gratitudeCount.textContent = `${gratitudeTextarea.value.length}/500`;
});

// ======================
// MODAL DE EXPORTACIÓN
// ======================
function openExportModal() {
  exportModal.style.display = 'flex';
}

function closeExportModal() {
  exportModal.style.display = 'none';
}

// ======================
// EXPORTAR RESUMEN
// ======================
function exportResumen(type = 'md') {
  const actividad = activityInput.value;
  const gratitude = gratitudeTextarea.value;
  const date = new Date().toLocaleDateString();
  let content = `# Resumen del Día - ${date}\n\n`;

  content += `## Actividad principal\n${actividad || '-'}\n\n`;
  content += `## Ciclos completados\n${cycles}\n\n`;

  content += `## Historial de Pomodoros\n`;
  history.forEach((h, i) => {
    content += `- ${i + 1}. ${h.mode} | ${h.start} - ${h.end} | Actividad: ${h.activity || '-'}\n`;
  });

  content += `\n## Tareas del día\n`;
  for (let i = 1; i <= 10; i++) {
    const desc = document.getElementById(`task-desc-${i}`).value;
    const done = document.getElementById(`task-${i}`).checked;
    content += `- [${done ? 'x' : ' '}] ${desc || 'Tarea sin nombre'}\n`;
  }

  content += `\n## Agradecimientos del día\n${gratitude || 'Sin contenido'}\n`;

  if (type === 'md') {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resumen_Pomodoro_${date.replace(/\//g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  } else if (type === 'pdf') {
    const win = window.open('', '_blank');
    win.document.write(`<pre style='font-family:monospace;'>${content}</pre>`);
    win.document.close();
    win.focus();
    win.print();
  }

  closeExportModal();
}

// ======================
// INICIALIZACIÓN FINAL
// ======================
Notification.requestPermission();
updateDisplay();