const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const player = { x: canvas.width / 2 - 20, y: canvas.height - 60, w: 40, h: 40, speed: 5 };
let bullets = [];
let enemies = [];
let keys = {};
let lastEnemy = 0;
let score = 0;
let bombCooldown = 0; // milliseconds

function spawnEnemy() {
  const x = Math.random() * (canvas.width - 40);
  enemies.push({ x, y: -40, w: 40, h: 40, speed: 2 });
}

function update(dt) {
  // Move player
  if (keys['ArrowLeft']) player.x -= player.speed;
  if (keys['ArrowRight']) player.x += player.speed;
  player.x = Math.max(0, Math.min(canvas.width - player.w, player.x));

  // Fire bullets
  if (keys['Space'] && bullets.length < 5) {
    bullets.push({ x: player.x + player.w / 2 - 5, y: player.y, w: 10, h: 20, speed: 7 });
    keys['Space'] = false; // single shot
  }

  // Mega bomb gimmick
  if (keys['KeyZ'] && bombCooldown <= 0) {
    enemies = []; // clear all enemies
    bombCooldown = 6000; // 6 second cooldown
    keys['KeyZ'] = false;
  }
  if (bombCooldown > 0) bombCooldown -= dt;

  // Update bullets
  bullets.forEach(b => b.y -= b.speed);
  bullets = bullets.filter(b => b.y + b.h > 0);

  // Update enemies
  enemies.forEach(e => e.y += e.speed);
  enemies = enemies.filter(e => e.y - e.h < canvas.height);

  // Collision detection
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        score += 10;
      }
    });
  });

  // Spawn enemies
  lastEnemy += dt;
  if (lastEnemy > 1000) {
    spawnEnemy();
    lastEnemy = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw player
  ctx.fillStyle = 'white';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Draw bullets
  ctx.fillStyle = 'red';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

  // Draw enemies
  ctx.fillStyle = 'green';
  enemies.forEach(e => ctx.fillRect(e.x, e.y, e.w, e.h));

  // Draw score and bomb cooldown
  ctx.fillStyle = 'white';
  ctx.font = '20px sans-serif';
  ctx.fillText(`Score: ${score}`, 10, 30);
  if (bombCooldown > 0) {
    ctx.fillText(`Bomb CD: ${(bombCooldown / 1000).toFixed(1)}s`, 10, 55);
  }
}

let lastTime = 0;
function loop(timestamp) {
  const dt = timestamp - lastTime;
  lastTime = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

document.addEventListener('keydown', (e) => keys[e.code] = true);
document.addEventListener('keyup', (e) => keys[e.code] = false);
