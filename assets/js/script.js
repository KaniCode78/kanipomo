// script.js completo actualizado



// Elementos principales del Pomodoro
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const timerDisplay = document.getElementById("timer");
const statusDisplay = document.getElementById("status");
const progress = document.getElementById("progress");
const activityInput = document.getElementById("activity");

// Export modal
const exportBtn = document.getElementById("export");
const exportModal = document.getElementById("export-modal");
const exportMd = document.getElementById("export-md");
const exportPdf = document.getElementById("export-pdf");
const closeModal = document.getElementById("close-modal");

// Registro diario
const historyBody = document.getElementById("history-body");

// Tareas
const taskList = document.getElementById("task-list");
const gratitude = document.getElementById("gratitude");
const gratitudeCount = document.getElementById("gratitude-count");

// Chill decision section
const toggleDecision = document.getElementById("toggle-decision");
const decisionSection = document.getElementById("decisiones");

let timer;

let isRunning = false;
let pomodoroCount = 0;
let currentStart;


let timeLeft = 25 * 60;
let phaseTotal = 25 * 60; // 👈 total de la fase actual


function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;

  const percentage = ((phaseTotal - timeLeft) / phaseTotal) * 100;
  progress.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
}

////

if (pomodoroCount % 4 === 0) {
  // descanso largo
  timeLeft = 25 * 60;
  phaseTotal = 25 * 60;   // 👈 importante
  statusDisplay.textContent = "Descanso largo";
} else {
  // descanso corto
  timeLeft = 5 * 60;
  phaseTotal = 5 * 60;    // 👈 importante
  statusDisplay.textContent = "Descanso";
}
updateDisplay();

///




function startTimer() {
  if (!isRunning) {
    currentStart = new Date();
    isRunning = true;
    statusDisplay.textContent = "Pomodoro en curso...";
    timer = setInterval(() => {
      timeLeft--;
      updateDisplay();
      if (timeLeft <= 0) {
        clearInterval(timer);
        isRunning = false;
        pomodoroCount++;
        registerPomodoro();
        if (pomodoroCount % 4 === 0) {
          alert("¡Tómate un descanso largo de 20-30 minutos!");
          timeLeft = 30 * 60;
        } else {
          alert("Tómate un descanso corto de 5 minutos");
          timeLeft = 5 * 60;
        }
        updateDisplay();
        statusDisplay.textContent = "Descanso";
      }
    }, 1000);
  }
}

function pauseTimer() {
  if (isRunning) {
    clearInterval(timer);
    isRunning = false;
    statusDisplay.textContent = "Pausado";
  }
}

function resetTimer() {
  clearInterval(timer);
  timeLeft = 25 * 60;
  isRunning = false;
  updateDisplay();
  statusDisplay.textContent = "Listo para iniciar";
}

function registerPomodoro() {
  const end = new Date();
  const activity = activityInput.value || "Sin nombre";
  const duration = ((end - currentStart) / 60000).toFixed(0);
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${activity}</td>
    <td>${currentStart.toLocaleTimeString()}</td>
    <td>${end.toLocaleTimeString()}</td>
    <td>${duration} min</td>
  `;
  historyBody.appendChild(row);
  activityInput.value = "";
}

function generateMarkdown() {
  const gratitudeText = gratitude.value;
  const logros = Array.from(document.querySelectorAll("#logros-list input"))
    .map((el) => el.value)
    .filter(Boolean)
    .map((l) => `- ${l}`)
    .join("\n");

  let markdown = `# Resumen del Día\n\n## Logros\n${logros}\n\n## Agradecimientos\n${gratitudeText}\n\n## Registro Pomodoro\n`;

  historyBody.querySelectorAll("tr").forEach((row) => {
    const cols = row.querySelectorAll("td");
    markdown += `- ${cols[0].textContent}: ${cols[1].textContent} - ${cols[2].textContent} (${cols[3].textContent})\n`;
  });

  return markdown;
}

function download(content, filename, type) {
  const a = document.createElement("a");
  const file = new Blob([content], { type });
  a.href = URL.createObjectURL(file);
  a.download = filename;
  a.click();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
exportBtn.addEventListener("click", () => {
  exportModal.style.display = "flex";
});
closeModal.addEventListener("click", () => {
  exportModal.style.display = "none";
});

exportMd.addEventListener("click", () => {
  const md = generateMarkdown();
  download(md, "resumen.md", "text/markdown");
  exportModal.style.display = "none";
});

exportPdf.addEventListener("click", () => {
  const md = generateMarkdown();
  const win = window.open("", "", "width=800,height=600");
  win.document.write(`<pre>${md}</pre>`);
  win.document.close();
  win.print();
  exportModal.style.display = "none";
});

// Actualiza conteo de caracteres
if (gratitude && gratitudeCount) {
  gratitude.addEventListener("input", () => {
    gratitudeCount.textContent = `${gratitude.value.length}/500`;
  });
}

// Lista de tareas automática
const tareas = [
  "Planificar el día",
  "Responder emails",
  "Llamadas pendientes",
  "Reuniones",
  "Revisar pendientes",
  "Desarrollo personal",
  "Actualizar CRM",
  "Seguimiento a clientes",
  "Redes sociales",
  "Evaluar progreso"
];

tareas.forEach((tarea) => {
  const li = document.createElement("li");
  const input = document.createElement("input");
  input.type = "checkbox";
  li.appendChild(input);
  li.appendChild(document.createTextNode(" " + tarea));
  taskList.appendChild(li);
});

// Mostrar/ocultar sección modo chill
if (toggleDecision && decisionSection) {
  toggleDecision.addEventListener("click", () => {
    const visible = decisionSection.style.display === "block";
    decisionSection.style.display = visible ? "none" : "block";
  });
}

// Inicializa display
updateDisplay();
