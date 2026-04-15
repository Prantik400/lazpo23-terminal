// TIME + DATE
setInterval(() => {
  const now = new Date();

  document.getElementById("time").innerText = now.toLocaleTimeString();

  document.getElementById("date").innerText = now.toLocaleDateString();
}, 1000);

// GRAPH
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

const errBtn = document.getElementById("errBtn");
const onBtn = document.getElementById("onBtn");
const reconnectBtn = document.getElementById("reconnectBtn");
const closeBtn = document.getElementById("closeBtn");
const terminal = document.querySelector(".cmd-terminal");

let connected = false;

/* ON BUTTON (PERSISTENT STATE) */
onBtn.addEventListener("click", () => {
  connected = true;

  onBtn.classList.add("active"); // stays blue

  terminal.innerHTML += "<br>> CONNECTING TO DATABASE...";
  setTimeout(() => {
    terminal.innerHTML += "<br>> CONNECTION SUCCESSFUL";
  }, 600);
});

/* CLOSE BUTTON */
closeBtn.addEventListener("click", () => {
  connected = false;

  onBtn.classList.remove("active"); // back to normal

  terminal.innerHTML += "<br>> CONNECTION CLOSED";

  flashButton(closeBtn);
});

/* RECONNECT BUTTON */
reconnectBtn.addEventListener("click", () => {
  terminal.innerHTML = "> RECONNECTING...";

  connected = true;

  // ON stays active
  onBtn.classList.add("active");

  setTimeout(() => {
    terminal.innerHTML += "<br>> SYSTEM READY";
  }, 600);

  // Flash reconnect button
  flashButton(reconnectBtn);

  // 🔥 FLASH ON BUTTON ONCE (IMPORTANT)
  onBtn.classList.add("flash-on");

  setTimeout(() => {
    onBtn.classList.remove("flash-on");
  }, 300);
});

/* FLASH FUNCTION */
function flashButton(btn) {
  btn.classList.add("flash");

  setTimeout(() => {
    btn.classList.remove("flash");
  }, 300);
}
