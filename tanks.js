const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 550;
canvas.height = 550;

//Load images
const bg_img = new Image();
bg_img.src = 'http://localhost:8000/bg.png';

const bullet = new Image();
bullet.src = 'http://localhost:8000/fireball_sml.png';

const tank_img = new Image();
tank_img.src = 'http://localhost:8000/tank_sml.png';

const turret_img = new Image();
turret_img.src = 'http://localhost:8000/turret_sml.png';

const enemy_img = new Image();
enemy_img.src = 'http://localhost:8000/enemy_sml.png';

let leftMousePressed = false;
let rightMousePressed = false;
let middleMousePressed = false;
let mousePos = { x: 0, y: 0 };
var youLose = false;
var kills = 0

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

// Mouse button events
canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) leftMousePressed = true;
    if (e.button === 2) rightMousePressed = true;
    if (e.button === 1) middleMousePressed = true;
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) leftMousePressed = false;
    if (e.button === 2) rightMousePressed = false;
    if (e.button === 1) middleMousePressed = false;
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        tank.fireProjectile();
    }
    if (e.key === 'Enter') {
        if (youLose) {
            gameRestarted = true;
            location.reload(); 
            return;
        }
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1) { 
        tank.fireProjectile();
    }
});

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 30;
        this.hp = 100;
        this.projectiles = [];
        this.image = enemy_img
    }

    fireProjectile() {
        const angle = Math.random() * Math.PI * 2;
        this.projectiles.push({
            x: this.x,
            y: this.y,
            angle: angle,
            distance: 0,
            speed: 3
        });
    }
    // Update enemy projectiles
    updateProjectiles() {
        this.projectiles = this.projectiles.filter(p => p.distance < 300);
        this.projectiles.forEach(p => {
            p.x += p.speed * Math.cos(p.angle);
            p.y += p.speed * Math.sin(p.angle);
            p.distance += p.speed;
        });
    }

    draw() {
        if (this.hp > 0) {
        // Draw enemy
            ctx.drawImage(this.image, this.x-25, this.y-25, 50, 50);
        //Draw health bar
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x - 30, this.y - 40, 60, 5); // Background
            ctx.fillStyle = 'lime';
            ctx.fillRect(this.x - 30, this.y - 40, (this.hp / 100) * 60, 5); // Health bar
        }
        // Draw projectiles
        ctx.fillStyle = 'orange';
        this.projectiles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

class Tank {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 50;
        this.angle = 0;
        this.hp = 100; 
        this.speed = 2;
        this.projectiles = []; 
        this.image = tank_img; 
        this.turretImage = turret_img; 
        this.projectileImage = bullet
    }

    fireProjectile() {
        const angleToMouse = Math.atan2(mousePos.y - this.y, mousePos.x - this.x);
        this.projectiles.push({
            x: this.x,
            y: this.y,
            angle: angleToMouse,
            distance: 0,
            speed: 4
        });
    }

    update() {
        // Handle movement
        if (leftMousePressed && rightMousePressed) {
            this.x += this.speed * Math.cos(this.angle);
            this.y += this.speed * Math.sin(this.angle);
        } else if (leftMousePressed) {
            this.angle -= 0.05;
        } else if (rightMousePressed) {
            this.angle += 0.05;
        }

        // Prevent the tank from moving outside the canvas
        const halfSize = this.size / 2;
        this.x = Math.max(halfSize, Math.min(canvas.width - halfSize, this.x));
        this.y = Math.max(halfSize, Math.min(canvas.height - halfSize, this.y));

        // Update projectiles
        this.projectiles = this.projectiles.filter(p => p.distance < 100);
        this.projectiles.forEach(p => {
            p.x += p.speed * Math.cos(p.angle);
            p.y += p.speed * Math.sin(p.angle);
            p.distance += p.speed;
        });
    }

    draw() {
        // Draw tank body
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, -this.size / 2, -this.size / 2, 75, 40);
        ctx.restore();

        // Draw turret
        const angleToMouse = Math.atan2(mousePos.y - this.y, mousePos.x - this.x);
        ctx.save();
        ctx.translate(this.x, this.y-2);
        ctx.rotate(angleToMouse);
        ctx.drawImage(this.turretImage, -15, -25, 50, 50);
        ctx.restore();

        // Draw health bar
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x - 30, this.y - 40, 60, 5);
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x - 30, this.y - 40, (this.hp / 100) * 60, 5); // Health bar
        // Draw projectiles
        ctx.fillStyle = 'red';
        this.projectiles.forEach(p => {
            p.x += p.speed * Math.cos(p.angle);
            p.y += p.speed * Math.sin(p.angle);
            ctx.drawImage(this.projectileImage, p.x, p.y-20,20, 20);
        });
    }
}

function isColliding(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.radius || 5) + (obj2.radius || 30);
}

const tank = new Tank(50, 275);
const enemies = [
    new Enemy(400, 150),
    new Enemy(400, 400),
];

function youLoseMessage() {
    ctx.font = "bold 60px impact";
    ctx.fillStyle = "red";
    var loseText = "GAME OVER!";
    ctx.fillText(loseText, 130, 200);

    ctx.fillStyle = "white";
    ctx.strokeStyle = "Red";
    ctx.lineWidth = 4;
    ctx.strokeRect(120, 250, 310, 70);
    ctx.fillRect(120, 250, 310, 70);

    ctx.font = "bold 30px courier";
    ctx.fillStyle = "black";
    ctx.fillText("Play Again?", 170, 280); 
    ctx.fillText("Hit ENTER key", 150, 310); 
}

function killCount() {
    
    ctx.font = "bold 30px impact";
    ctx.fillStyle = "white";
    ctx.fillText(kills, canvas.width/2, 50);
}

function update() {
    tank.update();

    enemies.forEach(enemy => {
        if (Math.random() < 0.02) {
            enemy.fireProjectile();
        }
        enemy.updateProjectiles();

        enemy.projectiles.forEach(p => {
            if (isColliding(p, tank)) {
                tank.hp -= 10;
                p.distance = 200; 
                enemy.projectiles.splice(p, 1);
            }
        });
    });

 
    tank.projectiles.forEach(p => {
        enemies.forEach(enemy => {
            if (isColliding(p, enemy)) {
                enemy.hp -= 10; 
                p.distance = 100;
            }
        });
    });

    // Remove dead enemies and respawn
    enemies.forEach((enemy, index) => {
        if (enemy.hp <= 0) {
            enemies[index] = new Enemy(Math.random() * canvas.width, Math.random() * canvas.height);
            kills += 1
        }
    });
    
}

function drawEnemies() {
    enemies.forEach(enemy => {
        enemy.draw();
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bg_img, 0, 0, canvas.width, canvas.height);
    tank.draw();
    drawEnemies();
    killCount();
    
}

function gameLoop() {
    if(!youLose) {
    requestAnimationFrame(gameLoop);    
    update();
    draw();
    if (tank.hp <= 0) {
        youLose = true
        youLoseMessage();
        
    }
    }
}

gameLoop();
