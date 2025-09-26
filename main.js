const canvas = document.getElementById('universe');
const ctx = canvas.getContext('2d');
const pauseBtn = document.getElementById('pauseBtn');
const gravitySlider = document.getElementById('gravitySlider');
const gravityValue = document.getElementById('gravityValue');
const massSlider = document.getElementById('massSlider');
const massValue = document.getElementById('massValue');

// Core simulation variables
let G = parseFloat(gravitySlider.value);
let newPlanetMass = parseFloat(massSlider.value);
let planets = [];
let paused = false;

// Update UI values
gravityValue.textContent = G;
massValue.textContent = newPlanetMass;

// Listen for changes
gravitySlider.addEventListener('input', () => {
  G = parseFloat(gravitySlider.value);
  gravityValue.textContent = G;
});
massSlider.addEventListener('input', () => {
  newPlanetMass = parseFloat(massSlider.value);
  massValue.textContent = newPlanetMass;
});

function randomColor() {
  return `hsl(${Math.random() * 360}, 70%, 60%)`;
}

class Planet {
  constructor(x, y, mass, radius, color = randomColor()) {
    this.x = x;
    this.y = y;
    this.mass = mass;
    this.radius = radius;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#fff2";
    ctx.stroke();

    // Draw mass label
    ctx.font = "12px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(this.mass.toFixed(0), this.x - 8, this.y + 4);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
}

function attract(p1, p2) {
  let dx = p2.x - p1.x;
  let dy = p2.y - p1.y;
  let dist = Math.max(Math.hypot(dx, dy), p1.radius + p2.radius);
  if (dist === 0) return;
  let force = (G * p1.mass * p2.mass) / (dist * dist);
  let angle = Math.atan2(dy, dx);
  let fx = Math.cos(angle) * force;
  let fy = Math.sin(angle) * force;
  p1.vx += fx / p1.mass;
  p1.vy += fy / p1.mass;
}

// Check for collisions and merge planets
function handleCollisions() {
  let survivors = [];
  let merged = new Array(planets.length).fill(false);

  for (let i = 0; i < planets.length; i++) {
    if (merged[i]) continue;
    let p1 = planets[i];

    for (let j = i + 1; j < planets.length; j++) {
      if (merged[j]) continue;
      let p2 = planets[j];
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      let dist = Math.hypot(dx, dy);

      if (dist < p1.radius + p2.radius) {
        // Merge planets
        let totalMass = p1.mass + p2.mass;
        let newX = (p1.x * p1.mass + p2.x * p2.mass) / totalMass;
        let newY = (p1.y * p1.mass + p2.y * p2.mass) / totalMass;
        let newVx = (p1.vx * p1.mass + p2.vx * p2.mass) / totalMass;
        let newVy = (p1.vy * p1.mass + p2.vy * p2.mass) / totalMass;
        let newColor = p1.color;
        let newRadius = Math.max(8, Math.sqrt(p1.radius * p1.radius + p2.radius * p2.radius));
        let mergedPlanet = new Planet(newX, newY, totalMass, newRadius, newColor);
        mergedPlanet.vx = newVx;
        mergedPlanet.vy = newVy;
        survivors.push(mergedPlanet);
        merged[i] = true;
        merged[j] = true;
        break;
      }
    }
    if (!merged[i]) {
      survivors.push(p1);
    }
  }
  planets = survivors;
}

function updateUniverse() {
  // Gravity
  for (let i = 0; i < planets.length; i++) {
    for (let j = 0; j < planets.length; j++) {
      if (i !== j) {
        attract(planets[i], planets[j]);
      }
    }
  }
  planets.forEach(p => p.update());
  handleCollisions();
}

function drawUniverse() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  planets.forEach(p => p.draw());
}

function animate() {
  if (!paused) {
    updateUniverse();
  }
  drawUniverse();
  requestAnimationFrame(animate);
}

// Add planet on click
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  let mass = newPlanetMass;
  let radius = Math.max(8, Math.sqrt(mass));
  planets.push(new Planet(x, y, mass, radius));
});

// Pause/unpause
pauseBtn.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
});

// Add a planet to start with
planets.push(new Planet(canvas.width / 2, canvas.height / 2, 70, 16, "#ffd700"));

animate();