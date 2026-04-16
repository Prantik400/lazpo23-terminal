const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "log_system",
});

// TEST
app.get("/", (req, res) => {
  res.send("Server running");
});

// COMMAND ENGINE
app.get("/command", (req, res) => {
  const cmd = req.query.cmd;
  let query = "";

  if (cmd === "scan errors") {
    query = "SELECT COUNT(*) AS total_errors FROM Logs WHERE log_level='ERROR'";
  } else if (cmd === "anomaly scan") {
    query = `
      SELECT service_name, COUNT(*) AS error_count
      FROM Logs
      WHERE log_level='ERROR'
      GROUP BY service_name
      ORDER BY error_count DESC
    `;
  } else if (cmd === "check warnings") {
    query =
      "SELECT COUNT(*) AS total_warnings FROM Logs WHERE log_level='WARNING'";
  } else {
    return res.json({ message: "Unknown command" });
  }

  db.query(query, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// SYSTEM STATS
app.get("/stats", (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_logs,
      SUM(CASE WHEN log_level='ERROR' THEN 1 ELSE 0 END) as total_errors
    FROM Logs
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
