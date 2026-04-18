// ================= TIME + DATE =================
setInterval(() => {
  const now = new Date();
  document.getElementById("time").innerText = now.toLocaleTimeString();
  document.getElementById("date").innerText = now.toLocaleDateString();
}, 1000);

// ================= GRAPH =================
const ctx = document.getElementById("errorChart");

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Errors Count",
        data: [],
        borderColor: "#00f0ff",
        borderWidth: 2,
        pointRadius: 2,
      },
    ],
  },
  options: {
    animation: false,
    scales: {
      x: {
        ticks: { color: "#00f0ff" },
        grid: { color: "rgba(0,240,255,0.1)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#00f0ff" },
        grid: { color: "rgba(0,240,255,0.1)" },
      },
    },
    plugins: {
      legend: {
        labels: { color: "#00f0ff" },
      },
    },
  },
});

function updateGraph(value) {
  const time = new Date().toLocaleTimeString();

  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(value);

  // keep only last 10 points (like real monitoring)
  if (chart.data.labels.length > 10) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();
}
// ================= ELEMENTS =================
const errBtn = document.getElementById("errBtn");
const onSound = document.getElementById("onSound");
const onBtn = document.getElementById("onBtn");
const reconnectBtn = document.getElementById("reconnectBtn");
const closeBtn = document.getElementById("closeBtn");
const terminal = document.getElementById("terminal");
const input = document.getElementById("cmdInput");
const errorSound = document.getElementById("errorSound");

// ================= STATES =================
let connected = false;
let errorActive = false;

// ================= TERMINAL =================

//COMMAND HISTORY
let commandHistory = [];
let historyIndex = -1;

// click anywhere → focus input
terminal.addEventListener("click", () => input.focus());

// smooth scroll
function scrollToBottom() {
  terminal.scrollTo({
    top: terminal.scrollHeight,
    behavior: "smooth",
  });
}

// normal print
function printLine(text) {
  const line = document.createElement("div");
  line.classList.add("output");
  line.textContent = text;

  terminal.insertBefore(line, document.querySelector(".input-line"));
  scrollToBottom();
}

// typing animation
function typeLine(text, speed = 15) {
  const line = document.createElement("div");
  line.classList.add("output");

  terminal.insertBefore(line, document.querySelector(".input-line"));

  let i = 0;

  function typing() {
    if (i < text.length) {
      line.textContent += text.charAt(i);
      i++;
      scrollToBottom();
      setTimeout(typing, speed);
    }
  }

  typing();
}

// ================= BUTTON LOGIC =================

onBtn.addEventListener("click", () => {
  if (connected) return;
  connected = true;
  onBtn.classList.add("active");
  typeLine("> INITIALIZING CORE...");

  onSound.currentTime = 0;
  onSound.play().catch(() => {});

  typeLine("> CONNECTING TO DATABASE...");
  setTimeout(() => {
    typeLine("> CONNECTION SUCCESSFUL");
  }, 600);
});

closeBtn.addEventListener("click", () => {
  connected = false;
  onBtn.classList.remove("active");

  typeLine("> CONNECTION CLOSED");
  flashButton(closeBtn);
  clearError();
});

reconnectBtn.addEventListener("click", () => {
  connected = true;
  onBtn.classList.add("active");

  typeLine("> RECONNECTING...");

  setTimeout(() => {
    typeLine("> SYSTEM READY");
  }, 600);

  flashButton(reconnectBtn);

  onBtn.classList.add("flash-on");
  setTimeout(() => {
    onBtn.classList.remove("flash-on");
  }, 300);

  clearError();
});

// ================= COMMAND SYSTEM =================

const commands = [
  "help",
  "scan errors",
  "anomalyscan",
  "check warnings",
  "clear",
];

input.addEventListener("keydown", (e) => {
  // ENTER
  if (e.key === "Enter") {
    const cmd = input.value.trim();

    if (!cmd) return;

    typeLine("> " + cmd);
    handleCommand(cmd);

    // store command
    commandHistory.push(cmd);
    historyIndex = commandHistory.length;

    input.value = "";
  }

  // UP ARROW
  if (e.key === "ArrowUp") {
    if (historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[historyIndex];
    }
  }

  // DOWN ARROW
  if (e.key === "ArrowDown") {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[historyIndex];
    } else {
      input.value = "";
    }
  }

  // TAB autocomplete
  if (e.key === "Tab") {
    e.preventDefault();

    const value = input.value.toLowerCase();
    const match = commands.find((c) => c.startsWith(value));

    if (match) input.value = match;
  }
});

// ================= LOADER =================
// ================= SYSTEM SEQUENCE =================
function systemSequence(lines, delay = 400) {
  return new Promise((resolve) => {
    lines.forEach((line, i) => {
      setTimeout(() => {
        typeLine("> " + line, 10);

        // resolve after last line
        if (i === lines.length - 1) {
          setTimeout(resolve, delay);
        }
      }, i * delay);
    });
  });
}

async function handleCommand(cmd) {
  cmd = cmd.toLowerCase();

  if (!connected) {
    typeLine("System not connected. Use ON.");
    triggerError();
    return;
  }

  // LOCAL COMMANDS
  if (cmd === "help") {
    typeLine("Available Commands:");
    typeLine("scan errors");
    typeLine("anomaly scan");
    typeLine("check warnings");
    typeLine("clear");
    return;
  }

  if (cmd === "clear") {
    clearTerminal();
    return;
  }

  try {
    // SCI-FI LOADING
    // SCI-FI LOADING (WAIT FOR IT)
    await systemSequence([
      "INITIALIZING QUERY ENGINE...",
      "ESTABLISHING SECURE LINK...",
      "DECRYPTING DATA STREAM...",
      "ANALYZING PATTERNS...",
    ]);

    const res = await fetch(
      `http://localhost:3000/command?cmd=${encodeURIComponent(cmd)}`,
    );

    const data = await res.json();

    // Unknown command
    if (data.message) {
      typeLine("> COMMAND NOT RECOGNIZED");
      typeLine("> TYPE 'help' TO VIEW AVAILABLE PROTOCOLS");
      triggerError();
      return;
    }

    // SHOW RESULT
    if (Array.isArray(data)) {
      data.forEach((row) => {
        Object.entries(row).forEach(([key, value]) => {
          typeLine(`> ${key}: ${value}`);
        });
        typeLine(" ");
      });

      if (data[0]?.total_errors) {
        updateGraph(data[0].total_errors);
      }
    }
  } catch (err) {
    // SCI-FI ERROR MESSAGE
    typeLine("> CORE LINK FAILURE");
    typeLine("> Data stream unreachable");
    triggerError();
  }
}

function clearTerminal() {
  document.querySelectorAll(".output").forEach((el) => el.remove());
}

// ================= ERROR SYSTEM =================

function triggerError() {
  if (errorActive) return;

  errorActive = true;

  errBtn.classList.add("error-active");
  document.body.classList.add("error-glow");

  errorSound.loop = true;
  errorSound.play().catch(() => {});

  typeLine("> ERROR: SYSTEM ANOMALY DETECTED");

  updateGraph(1); // 🔥 graph spike
}

function clearError() {
  errorActive = false;

  errBtn.classList.remove("error-active");
  document.body.classList.remove("error-glow");

  errorSound.pause();
  errorSound.currentTime = 0;
}

// ================= UTIL =================

function flashButton(btn) {
  btn.classList.add("flash");
  setTimeout(() => btn.classList.remove("flash"), 300);
}

// ================= REAL ERROR MONITOR =================

async function checkSystemErrors() {
  if (!connected) return; //STOP if system is OFF

  try {
    const res = await fetch("http://localhost:3000/stats");
    const data = await res.json();

    const errorCount = data.total_errors;

    updateGraph(errorCount);

    if (errorCount > 0 && !errorActive) {
      typeLine("> ⚠ CORE INSTABILITY DETECTED");
      typeLine(`> ${errorCount} CRITICAL ERRORS FOUND`);
      triggerError();
    }

    if (errorCount === 0 && errorActive) {
      typeLine("> SYSTEM STABILIZED");
      clearError();
    }
  } catch (err) {
    console.log("Status fetch failed");
  }
}

// run every 5 sec
setInterval(checkSystemErrors, 5000);
