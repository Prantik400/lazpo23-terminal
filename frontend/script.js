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
        label: "Errors",
        data: [],
        borderColor: "#00f0ff",
        borderWidth: 2,
      },
    ],
  },
});

function updateGraph(value) {
  chart.data.labels.push("");
  chart.data.datasets[0].data.push(value);
  chart.update();
}

// ================= ELEMENTS =================
const errBtn = document.getElementById("errBtn");
const onBtn = document.getElementById("onBtn");
const reconnectBtn = document.getElementById("reconnectBtn");
const closeBtn = document.getElementById("closeBtn");
const terminal = document.querySelector(".cmd-terminal");
const errorSound = document.getElementById("errorSound");

// ================= STATES =================
let connected = false;
let errorActive = false;

// ================= BUTTON LOGIC =================

/* ON BUTTON */
onBtn.addEventListener("click", () => {
  connected = true;

  onBtn.classList.add("active");

  terminal.innerHTML += "<br>> CONNECTING TO DATABASE...";

  setTimeout(() => {
    terminal.innerHTML += "<br>> CONNECTION SUCCESSFUL";
  }, 600);
});

/* CLOSE BUTTON */
closeBtn.addEventListener("click", () => {
  connected = false;

  onBtn.classList.remove("active");

  terminal.innerHTML += "<br>> CONNECTION CLOSED";

  flashButton(closeBtn);

  clearError(); // stop error if active
});

/* RECONNECT BUTTON */
reconnectBtn.addEventListener("click", () => {
  terminal.innerHTML = "> RECONNECTING...";

  connected = true;
  onBtn.classList.add("active");

  setTimeout(() => {
    terminal.innerHTML += "<br>> SYSTEM READY";
  }, 600);

  flashButton(reconnectBtn);

  // ON button blink once
  onBtn.classList.add("flash-on");
  setTimeout(() => {
    onBtn.classList.remove("flash-on");
  }, 300);

  clearError(); // stop error if active
});

// ================= ERROR SYSTEM =================

function triggerError() {
  if (errorActive) return;

  errorActive = true;

  // start blinking
  errBtn.classList.add("error-active");

  // start sound
  errorSound.loop = true;
  document.body.classList.add("error-glow");

  errorSound.play().catch(() => {
    console.log("User interaction needed for sound");
  });

  terminal.innerHTML += "<br>> ERROR: SYSTEM ANOMALY DETECTED";
}

function clearError() {
  errorActive = false;

  errBtn.classList.remove("error-active");
  document.body.classList.remove("error-glow");

  // stop sound
  errorSound.pause();
  errorSound.currentTime = 0;
}

// ================= UTIL =================

function flashButton(btn) {
  btn.classList.add("flash");

  setTimeout(() => {
    btn.classList.remove("flash");
  }, 300);
}

/* ================================
   🔥 HARDCODED TEST SECTION (DELETE LATER)
   ================================= */

// Trigger error after 2 seconds
setTimeout(() => {
  triggerError();
}, 2000);
