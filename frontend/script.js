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
