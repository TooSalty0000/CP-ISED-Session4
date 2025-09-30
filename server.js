const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Store student mean values (studentId -> mean)
const studentMeans = new Map();

// Generate a deterministic mean for each studentId
function getStudentMean(studentId) {
  if (!studentMeans.has(studentId)) {
    // Use studentId as seed for consistent mean value
    const seed = studentId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mean = 50 + (seed % 51); // Mean between 50 and 100
    studentMeans.set(studentId, mean);
  }
  return studentMeans.get(studentId);
}

// Generate random number from normal distribution using Box-Muller transform
function generateNormalRandom(mean, stdDev = 3) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.round(mean + z0 * stdDev);
}

// Generate 500 numbers with the distribution
function generateDistribution(mean) {
  const numbers = [];
  for (let i = 0; i < 500; i++) {
    numbers.push(generateNormalRandom(mean));
  }
  return numbers;
}

// Endpoint 1: GET /[studentId]
app.get("/:studentId", (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ error: "Student ID is required" });
  }

  const mean = getStudentMean(studentId);
  const distribution = generateDistribution(mean);

  res.json({
    studentId,
    count: distribution.length,
    numbers: distribution,
  });
});

// Endpoint 2: GET /[studentId]/[number]
app.get("/:studentId/:number", (req, res) => {
  const { studentId, number } = req.params;

  if (!studentId || !number) {
    return res
      .status(400)
      .json({ error: "Student ID and number are required" });
  }

  const numValue = parseInt(number);
  if (isNaN(numValue)) {
    return res.status(400).json({ error: "Invalid number format" });
  }

  const mean = getStudentMean(studentId);

  // Check if number is within acceptable range of the mean (within 3 standard deviations)

  if (numValue == mean) {
    res.json({
      status: "OK",
      message: "Correct number",
    });
  } else {
    res.status(400).json({
      error: "Wrong number",
      received: numValue,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Endpoints:");
  console.log(`  GET /:studentId - Get 500 random numbers for student`);
  console.log(
    `  GET /:studentId/:number - Validate if number matches student distribution`
  );
});
