const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const GB = { d: '#0f380f', m: '#306230', l: '#8bac0f', ll: '#9bbc0f' };

class Player {
    constructor(x, y) {
        Object.assign(this, {x, y, w: 8, h: 12, vx: 0, vy: 0, speed: 1.5, jumpPower: -4, gravity: 0.3,
            onGround: false, jumping: false, level: 1, maxHp: 20, hp: 20, maxEnergy: 10, energy: 10,
            xp: 0, xpToNextLevel: 10, attack: 5, defense: 2});
    }
    update(keys, platforms) {
        this.vx = (keys.ArrowLeft||keys.KeyA) ? -this.speed : (keys.ArrowRight||keys.KeyD) ? this.speed : 0;
        if ((keys.Space||keys.ArrowUp||keys.KeyW) && this.onGround && !this.jumping) {
            this.vy = this.jumpPower; this.onGround = false; this.jumping = true;
        }
        this.vy += this.gravity; this.x += this.vx; this.y += this.vy; this.onGround = false;
        platforms.forEach(p => {
            if (this.x < p.x+p.w && this.x+this.w > p.x && this.y < p.y+p.h && this.y+this.h > p.y) {
                if (this.vy > 0 && this.y+this.h <= p.y+10) {
                    this.y = p.y-this.h; this.vy = 0; this.onGround = true; this.jumping = false;
                }
            }
        });
        if (this.x < 0) this.x = 0;
        if (this.y > 144) { this.y = 0; this.takeDamage(5); }
    }
    collides(e) { return this.x < e.x+e.w && this.x+this.w > e.x && this.y < e.y+e.h && this.y+this.h > e.y; }
    collidesFromAbove(e) { return this.vy > 0 && this.y+this.h <= e.y+e.h/2 && this.collides(e); }
    gainXP(amt) {
        this.xp += amt;
        if (this.xp >= this.xpToNextLevel) {
            this.level++; this.xp = 0; this.xpToNextLevel = Math.floor(this.xpToNextLevel*1.5);
            this.maxHp += 5; this.hp = this.maxHp; this.maxEnergy += 2; this.energy = this.maxEnergy;
            this.attack += 2; this.defense += 1;
        }
    }
    takeDamage(amt) { const dmg = Math.max(1, amt - this.defense); this.hp -= dmg; return dmg; }
    draw(cx) {
        ctx.fillStyle = GB.d; ctx.fillRect(this.x-cx, this.y, this.w, this.h);
        ctx.fillStyle = GB.ll; ctx.fillRect(this.x-cx+2, this.y+3, 2, 2); ctx.fillRect(this.x-cx+5, this.y+3, 2, 2);
    }
}

class Enemy {
    constructor(x, y, type) {
        this.x = x; this.y = y; this.initialX = x; this.type = type; this.alive = true; this.defeated = false;
        const stats = {
            slime: [1,8,3,1,5,GB.l,0.3,false,30], 
            beetle: [2,12,4,2,8,GB.m,0.5,false,40], 
            goblin: [3,18,6,3,15,GB.d,0.7,true,50],
            jellyfish: [3,15,5,2,12,GB.l,0.4,false,35], 
            crab: [4,20,7,4,18,GB.m,0.6,false,45], 
            seahorse: [5,25,9,4,25,GB.d,0.8,true,55],
            bat: [5,22,8,3,20,GB.d,1.0,true,40], 
            skeleton: [6,30,11,5,30,GB.m,0.5,false,50], 
            dragon: [8,50,15,8,50,GB.d,0,false,0,true]
        };
        const s = stats[type];
        [this.level, this.maxHp, this.attack, this.defense, this.xpReward, this.color, this.speed, this.canJump, this.moveRange, this.isBoss] = s;
        this.hp = this.maxHp; this.w = this.isBoss ? 16 : 10; this.h = this.isBoss ? 16 : 10;
        this.vx = this.speed; this.vy = 0; this.gravity = 0.3; this.onGround = false;
        this.jumpTimer = 0; this.jumpCooldown = 120 + Math.random() * 60;
    }
    update(platforms) {
        if (!this.alive || this.isBoss) return;
        
        // Movimiento horizontal patrulla
        if (this.speed > 0) {
            this.x += this.vx;
            if (Math.abs(this.x - this.initialX) > this.moveRange) {
                this.vx = -this.vx;
            }
        }
        
        // Gravedad
        this.vy += this.gravity;
        this.y += this.vy;
        
        // Colisión con plataformas
        this.onGround = false;
        for (let platform of platforms) {
            if (this.x < platform.x + platform.w && this.x + this.w > platform.x &&
                this.y < platform.y + platform.h && this.y + this.h > platform.y) {
                if (this.vy > 0 && this.y + this.h <= platform.y + 10) {
                    this.y = platform.y - this.h;
                    this.vy = 0;
                    this.onGround = true;
                }
            }
        }
        
        // Salto aleatorio para enemigos que pueden saltar
        if (this.canJump && this.onGround) {
            this.jumpTimer++;
            if (this.jumpTimer >= this.jumpCooldown) {
                this.vy = -3.5;
                this.jumpTimer = 0;
                this.jumpCooldown = 120 + Math.random() * 60;
            }
        }
    }
    takeDamage(amt) {
        const dmg = Math.max(1, amt - this.defense); this.hp -= dmg;
        if (this.hp <= 0) { this.defeated = true; this.alive = false; }
        return dmg;
    }
    draw(cx) {
        if (!this.alive) return;
        ctx.fillStyle = this.color; ctx.fillRect(this.x-cx, this.y, this.w, this.h);
        ctx.fillStyle = GB.ll;
        const es = this.isBoss ? 3 : 2, eo = this.isBoss ? 4 : 2;
        ctx.fillRect(this.x-cx+eo, this.y+3, es, es); ctx.fillRect(this.x-cx+this.w-eo-es, this.y+3, es, es);
        ctx.fillStyle = GB.d; ctx.font = '6px monospace'; ctx.fillText(`L${this.level}`, this.x-cx, this.y-2);
        if (this.isBoss) ctx.fillText('BOSS', this.x-cx, this.y-10);
    }
}

class Platform {
    constructor(x, y, w, h, isDark = false) { Object.assign(this, {x, y, w, h, isDark}); }
    draw(cx) { 
        // Usar color más claro para nivel oscuro
        ctx.fillStyle = this.isDark ? GB.l : GB.m; 
        ctx.fillRect(this.x-cx, this.y, this.w, this.h);
        // Añadir borde para mayor contraste
        if (this.isDark) {
            ctx.fillStyle = GB.ll;
            ctx.fillRect(this.x-cx, this.y, this.w, 1);
        }
    }
}

class GoalFlag {
    constructor(x, y) { this.x = x; this.y = y; this.w = 8; this.h = 20; this.animFrame = 0; }
    update() { this.animFrame = (this.animFrame + 1) % 60; }
    draw(cx) {
        // Poste
        ctx.fillStyle = GB.d;
        ctx.fillRect(this.x-cx, this.y, 2, this.h);
        // Bandera animada
        const wave = Math.sin(this.animFrame * 0.1) * 2;
        ctx.fillStyle = GB.l;
        ctx.fillRect(this.x-cx+2, this.y+wave, 6, 8);
        ctx.fillStyle = GB.ll;
        ctx.fillRect(this.x-cx+2, this.y+wave, 6, 4);
        // Texto META
        ctx.fillStyle = GB.d;
        ctx.font = '6px monospace';
        ctx.fillText('META', this.x-cx-5, this.y-3);
    }
}

class CombatSystem {
    constructor(player, enemy) {
        this.player = player; this.enemy = enemy; this.turn = 'player';
        this.message = 'Tu turno! Elige acción:'; this.actions = ['ATACAR','HABILIDAD','DEFENDER','HUIR'];
        this.defending = false; this.active = true; this.result = null; this.messageTimer = 0;
    }
    handleInput(key) {
        if (this.turn !== 'player' || this.messageTimer > 0) return;
        const idx = ['Digit1','Digit2','Digit3','Digit4'].indexOf(key);
        if (idx >= 0) this.executePlayerAction(idx);
    }
    executePlayerAction(action) {
        this.defending = false;
        if (action === 0) {
            const dealt = this.enemy.takeDamage(Math.floor(this.player.attack * (0.8 + Math.random()*0.4)));
            this.message = `Atacaste! Daño: ${dealt}`;
        } else if (action === 1) {
            if (this.player.energy >= 3) {
                const dealt = this.enemy.takeDamage(Math.floor(this.player.attack * 1.5));
                this.player.energy -= 3; this.message = `Habilidad! Daño: ${dealt}`;
            } else { this.message = 'No tienes energía!'; return; }
        } else if (action === 2) {
            this.defending = true; this.message = 'Te defiendes...';
        } else if (action === 3) {
            if (Math.random() > 0.5) { this.message = 'Huiste!'; this.result = 'flee'; this.active = false; return; }
            else { this.message = 'No pudiste huir!'; }
        }
        this.messageTimer = 60;
        if (this.enemy.defeated) { this.result = 'win'; this.active = false; return; }
        this.turn = 'enemy';
    }
    update() {
        if (this.messageTimer > 0) {
            this.messageTimer--;
            if (this.messageTimer === 0 && this.turn === 'enemy') {
                const dmg = Math.floor(this.enemy.attack * (0.8 + Math.random()*0.4));
                const rec = this.defending ? Math.floor(dmg*0.5) : this.player.takeDamage(dmg);
                this.message = `${this.enemy.type} ataca! Daño: ${rec}`; this.messageTimer = 60;
                if (this.player.hp <= 0) { this.result = 'lose'; this.active = false; return; }
                this.turn = 'player';
                setTimeout(() => { this.message = 'Tu turno! Elige acción:'; }, 1000);
            }
        }
    }
    draw() {
        ctx.fillStyle = GB.ll; ctx.fillRect(0, 0, 160, 144);
        ctx.fillStyle = GB.d; ctx.font = '8px monospace'; ctx.fillText('COMBATE!', 60, 10);
        ctx.fillStyle = this.enemy.color; ctx.fillRect(110, 30, this.enemy.w, this.enemy.h);
        ctx.fillStyle = GB.ll; ctx.fillRect(114, 36, 4, 4); ctx.fillRect(122, 36, 4, 4);
        ctx.fillStyle = GB.d; ctx.font = '6px monospace';
        ctx.fillText(`${this.enemy.type} Lv${this.enemy.level}`, 90, 60);
        ctx.fillText(`HP: ${this.enemy.hp}/${this.enemy.maxHp}`, 90, 68);
        const ehp = this.enemy.hp / this.enemy.maxHp;
        ctx.fillStyle = GB.m; ctx.fillRect(90, 70, 60, 4); ctx.fillStyle = GB.l; ctx.fillRect(90, 70, 60*ehp, 4);
        ctx.fillStyle = GB.d; ctx.fillRect(20, 80, 16, 24);
        ctx.fillStyle = GB.ll; ctx.fillRect(24, 86, 4, 4); ctx.fillRect(30, 86, 4, 4);
        ctx.fillStyle = GB.d;
        ctx.fillText(`TU Lv${this.player.level}`, 10, 110);
        ctx.fillText(`HP: ${this.player.hp}/${this.player.maxHp}`, 10, 118);
        ctx.fillText(`EN: ${this.player.energy}/${this.player.maxEnergy}`, 10, 126);
        const php = this.player.hp / this.player.maxHp;
        ctx.fillStyle = GB.m; ctx.fillRect(50, 108, 40, 4); ctx.fillStyle = GB.l; ctx.fillRect(50, 108, 40*php, 4);
        const pep = this.player.energy / this.player.maxEnergy;
        ctx.fillStyle = GB.m; ctx.fillRect(50, 116, 40, 4); ctx.fillStyle = GB.ll; ctx.fillRect(50, 116, 40*pep, 4);
        ctx.fillStyle = GB.m; ctx.fillRect(5, 130, 150, 12);
        ctx.fillStyle = GB.ll; ctx.font = '6px monospace'; ctx.fillText(this.message, 8, 138);
        if (this.turn === 'player' && this.messageTimer === 0) {
            ctx.fillStyle = GB.d; this.actions.forEach((a,i) => ctx.fillText(`${i+1}.${a}`, 100, 85+i*8));
        }
    }
}

const LEVELS = [
    { name: 'Bosque Terrestre', bg: GB.ll,
      platforms: [[0,135,400,10], [50,110,40,5], [120,95,50,5], [200,80,40,5], [280,65,50,5]],
      enemies: [[80,125,'slime'], [140,85,'beetle'], [220,70,'goblin'], [300,55,'beetle']], goal: 380 },
    { name: 'Costa Marina', bg: GB.l,
      platforms: [[0,135,400,10], [40,115,35,5], [100,100,40,5], [170,85,45,5], [240,70,40,5], [310,55,50,5]],
      enemies: [[70,105,'jellyfish'], [150,75,'crab'], [260,60,'seahorse'], [330,45,'jellyfish']], goal: 380 },
    { name: 'Mazmorra Oscura', bg: GB.m,
      platforms: [[0,135,450,10], [60,110,40,5], [140,90,45,5], [220,70,40,5], [300,50,50,5], [380,70,50,5]],
      enemies: [[90,100,'bat'], [180,60,'skeleton'], [320,40,'bat'], [410,60,'dragon']], goal: 440 }
];

class Game {
    constructor() {
        this.player = new Player(20, 100); this.currentLevel = 0; this.platforms = []; this.enemies = [];
        this.combat = null; this.keys = {}; this.cameraX = 0; this.gameStarted = false;
        this.levelUpMessage = 0; this.levelCompleteMessage = 0; this.goalFlag = null;
        this.loadLevel(0); this.setupInput();
    }
    loadLevel(lvl) {
        this.currentLevel = lvl; const level = LEVELS[lvl];
        const isDark = lvl === 2; // Nivel 3 (Mazmorra) es oscuro
        this.platforms = level.platforms.map(p => new Platform(...p, isDark));
        this.enemies = level.enemies.map(e => new Enemy(...e));
        this.goalFlag = new GoalFlag(level.goal, 115);
        this.player.x = 20; this.player.y = 100; this.player.energy = this.player.maxEnergy; this.cameraX = 0;
    }
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (!this.gameStarted && e.code === 'Space') { this.gameStarted = true; startScreen.style.display = 'none'; }
            if (this.combat && this.combat.active) this.combat.handleInput(e.code);
        });
        document.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    }
    update() {
        if (!this.gameStarted) return;
        if (this.combat) {
            this.combat.update();
            if (!this.combat.active) {
                if (this.combat.result === 'win') { 
                    this.player.gainXP(this.combat.enemy.xpReward); 
                    this.levelUpMessage = 120;
                } else if (this.combat.result === 'lose') {
                    this.gameStarted = false;
                    startScreen.innerHTML = '<h1>GAME OVER</h1><p class="blink">PRESIONA ESPACIO</p>';
                    startScreen.style.display = 'flex';
                    this.player = new Player(20, 100);
                    this.loadLevel(0);
                }
                this.combat = null;
            }
        } else {
            this.player.update(this.keys, this.platforms);
            this.cameraX = Math.max(0, Math.min(this.player.x - 80, LEVELS[this.currentLevel].goal - 160));
            for (let enemy of this.enemies) {
                if (!enemy.alive) continue;
                enemy.update(this.platforms);
                if (this.player.collides(enemy)) {
                    if (this.player.collidesFromAbove(enemy) && enemy.level < this.player.level) {
                        enemy.alive = false; enemy.defeated = true;
                        this.player.gainXP(enemy.xpReward);
                        this.player.vy = -3; this.levelUpMessage = 120;
                    } else {
                        this.combat = new CombatSystem(this.player, enemy);
                    }
                }
            }
            if (this.player.x >= LEVELS[this.currentLevel].goal) {
                if (this.currentLevel < LEVELS.length - 1) {
                    this.currentLevel++;
                    this.loadLevel(this.currentLevel);
                    this.levelCompleteMessage = 180;
                } else {
                    this.gameStarted = false;
                    startScreen.innerHTML = '<h1>VICTORIA!</h1><p>Completaste los 3 niveles!</p><p class="blink">PRESIONA ESPACIO</p>';
                    startScreen.style.display = 'flex';
                    this.player = new Player(20, 100);
                    this.loadLevel(0);
                }
            }
            if (this.goalFlag) this.goalFlag.update();
            if (this.levelUpMessage > 0) this.levelUpMessage--;
            if (this.levelCompleteMessage > 0) this.levelCompleteMessage--;
        }
    }
    draw() {
        ctx.fillStyle = LEVELS[this.currentLevel].bg;
        ctx.fillRect(0, 0, 160, 144);
        if (this.combat) {
            this.combat.draw();
        } else {
            for (let platform of this.platforms) platform.draw(this.cameraX);
            if (this.goalFlag) this.goalFlag.draw(this.cameraX);
            for (let enemy of this.enemies) enemy.draw(this.cameraX);
            this.player.draw(this.cameraX);
            ctx.fillStyle = GB.d; ctx.fillRect(0, 0, 160, 12);
            ctx.fillStyle = GB.ll; ctx.font = '6px monospace';
            ctx.fillText(`Lv${this.player.level}`, 2, 8);
            ctx.fillText(`HP:${this.player.hp}/${this.player.maxHp}`, 20, 8);
            ctx.fillText(`EN:${this.player.energy}/${this.player.maxEnergy}`, 60, 8);
            const xpPercent = this.player.xp / this.player.xpToNextLevel;
            ctx.fillStyle = GB.darkest; ctx.fillRect(100, 4, 58, 4);
            ctx.fillStyle = GB.light; ctx.fillRect(100, 4, 58 * xpPercent, 4);
            ctx.fillStyle = GB.ll; ctx.font = '5px monospace'; ctx.fillText('XP', 100, 3);
            ctx.font = '6px monospace';
            ctx.fillText(`Nivel ${this.currentLevel + 1}: ${LEVELS[this.currentLevel].name}`, 2, 20);
            if (this.levelUpMessage > 0) {
                ctx.fillStyle = GB.d; ctx.font = '8px monospace';
                ctx.fillText('LEVEL UP!', 55, 70);
            }
            if (this.levelCompleteMessage > 0) {
                ctx.fillStyle = GB.d; ctx.font = '8px monospace';
                ctx.fillText('NIVEL COMPLETO!', 35, 70);
            }
        }
    }
}

const game = new Game();
function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
