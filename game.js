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
            dragon: [8,50,15,8,50,GB.d,0,false,0,true],
            hawk: [4,18,7,2,14,GB.m,0.8,false,50,false,true],
            spider: [5,24,9,3,18,GB.d,0.6,true,45],
            scorpion: [6,28,11,5,22,GB.m,0.5,false,40],
            gargoyle: [7,35,13,6,28,GB.d,1.0,false,60,false,true],
            demon: [9,60,18,10,60,GB.d,0,false,0,true]
        };
        const s = stats[type];
        [this.level, this.maxHp, this.attack, this.defense, this.xpReward, this.color, this.speed, this.canJump, this.moveRange, this.isBoss, this.isFlying] = s;
        this.hp = this.maxHp; this.w = this.isBoss ? 16 : 10; this.h = this.isBoss ? 16 : 10;
        this.vx = this.speed; this.vy = 0; this.gravity = this.isFlying ? 0 : 0.3; this.onGround = false;
        this.jumpTimer = 0; this.jumpCooldown = 120 + Math.random() * 60;
        this.flyTimer = 0; this.flyAmplitude = 15;
    }
    update(platforms) {
        if (!this.alive || this.isBoss) return;
        
        // Enemigos voladores
        if (this.isFlying) {
            this.flyTimer++;
            this.x += this.vx;
            if (Math.abs(this.x - this.initialX) > this.moveRange) {
                this.vx = -this.vx;
            }
            this.y = this.initialY + Math.sin(this.flyTimer * 0.05) * this.flyAmplitude;
            return;
        }
        
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
        
        // Colisión con plataformas y detección de bordes
        this.onGround = false;
        let currentPlatform = null;
        
        for (let platform of platforms) {
            if (this.x < platform.x + platform.w && this.x + this.w > platform.x &&
                this.y < platform.y + platform.h && this.y + this.h > platform.y) {
                if (this.vy > 0 && this.y + this.h <= platform.y + 10) {
                    this.y = platform.y - this.h;
                    this.vy = 0;
                    this.onGround = true;
                    currentPlatform = platform;
                }
            }
        }
        
        // Detectar borde de plataforma y cambiar dirección (solo para enemigos que no saltan)
        if (this.onGround && currentPlatform && !this.canJump) {
            const edgeMargin = 3;
            // Borde derecho
            if (this.vx > 0 && this.x + this.w >= currentPlatform.x + currentPlatform.w - edgeMargin) {
                this.vx = -this.vx;
            }
            // Borde izquierdo
            if (this.vx < 0 && this.x <= currentPlatform.x + edgeMargin) {
                this.vx = -this.vx;
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
        // Indicador de vuelo
        if (this.isFlying) {
            ctx.fillStyle = GB.ll;
            ctx.fillRect(this.x-cx-2, this.y+this.h/2, 2, 1);
            ctx.fillRect(this.x-cx+this.w, this.y+this.h/2, 2, 1);
        }
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
        ctx.fillStyle = GB.d; ctx.fillRect(50, 116, 40, 4); ctx.fillStyle = GB.l; ctx.fillRect(50, 116, 40*pep, 4);
        ctx.fillStyle = GB.m; ctx.fillRect(5, 130, 150, 12);
        ctx.fillStyle = GB.ll; ctx.font = '6px monospace'; ctx.fillText(this.message, 8, 138);
        if (this.turn === 'player' && this.messageTimer === 0) {
            ctx.fillStyle = GB.d; this.actions.forEach((a,i) => ctx.fillText(`${i+1}.${a}`, 100, 85+i*8));
        }
    }
}

// Clase para los nodos del mapa del mundo
class LevelNode {
    constructor(x, y, levelIndex, name) {
        this.x = x; this.y = y; this.levelIndex = levelIndex; this.name = name;
        this.completed = false; this.unlocked = levelIndex === 0;
        this.w = 12; this.h = 12; this.animFrame = 0;
    }
    update() { this.animFrame = (this.animFrame + 1) % 120; }
    draw() {
        // Fondo del nodo
        ctx.fillStyle = this.completed ? GB.l : this.unlocked ? GB.ll : GB.m;
        ctx.fillRect(this.x - this.w/2, this.y - this.h/2, this.w, this.h);
        
        // Borde
        ctx.fillStyle = GB.d;
        ctx.fillRect(this.x - this.w/2, this.y - this.h/2, this.w, 1);
        ctx.fillRect(this.x - this.w/2, this.y + this.h/2 - 1, this.w, 1);
        ctx.fillRect(this.x - this.w/2, this.y - this.h/2, 1, this.h);
        ctx.fillRect(this.x + this.w/2 - 1, this.y - this.h/2, 1, this.h);
        
        // Número del nivel
        ctx.fillStyle = GB.d;
        ctx.font = '8px monospace';
        ctx.fillText((this.levelIndex + 1).toString(), this.x - 3, this.y + 3);
        
        // Indicador de completado
        if (this.completed) {
            ctx.fillStyle = GB.d;
            ctx.fillRect(this.x + 3, this.y - 5, 2, 4);
            ctx.fillRect(this.x + 5, this.y - 3, 2, 2);
        }
        
        // Animación si está desbloqueado pero no completado
        if (this.unlocked && !this.completed && this.animFrame < 60) {
            ctx.fillStyle = GB.d;
            ctx.fillRect(this.x - this.w/2 - 1, this.y - this.h/2 - 1, this.w + 2, 1);
            ctx.fillRect(this.x - this.w/2 - 1, this.y + this.h/2, this.w + 2, 1);
            ctx.fillRect(this.x - this.w/2 - 1, this.y - this.h/2 - 1, 1, this.h + 2);
            ctx.fillRect(this.x + this.w/2, this.y - this.h/2 - 1, 1, this.h + 2);
        }
    }
}

// Clase para el mapa del mundo
class WorldMap {
    constructor() {
        this.nodes = [
            // Mundo 1
            new LevelNode(30, 100, 0, 'Bosque'),
            new LevelNode(70, 80, 1, 'Costa'),
            new LevelNode(110, 90, 2, 'Mazmorra'),
            // Mundo 2
            new LevelNode(30, 50, 3, 'Cañón'),
            new LevelNode(80, 35, 4, 'Tormenta'),
            new LevelNode(130, 45, 5, 'Fortaleza')
        ];
        this.currentNodeIndex = 0;
        this.paths = [[0,1], [1,2], [2,3], [3,4], [4,5]]; // Conexiones entre niveles
    }
    
    update(keys) {
        const node = this.nodes[this.currentNodeIndex];
        
        // Navegar entre nodos
        if (keys.ArrowRight || keys.KeyD) {
            if (this.currentNodeIndex < this.nodes.length - 1 && 
                this.nodes[this.currentNodeIndex + 1].unlocked) {
                this.currentNodeIndex++;
                keys.ArrowRight = false;
                keys.KeyD = false;
            }
        }
        if (keys.ArrowLeft || keys.KeyA) {
            if (this.currentNodeIndex > 0) {
                this.currentNodeIndex--;
                keys.ArrowLeft = false;
                keys.KeyA = false;
            }
        }
        
        this.nodes.forEach(n => n.update());
        
        // Devolver el nivel seleccionado si se presiona Enter o Space
        if (keys.Space || keys.Enter) {
            if (node.unlocked) {
                keys.Space = false;
                keys.Enter = false;
                return node.levelIndex;
            }
        }
        return null;
    }
    
    draw() {
        ctx.fillStyle = GB.ll;
        ctx.fillRect(0, 0, 160, 144);
        
        // Dibujar título
        ctx.fillStyle = GB.d;
        ctx.font = '8px monospace';
        ctx.fillText('MAPA DEL MUNDO', 40, 12);
        
        // Dibujar caminos
        ctx.fillStyle = GB.m;
        this.paths.forEach(([from, to]) => {
            const n1 = this.nodes[from];
            const n2 = this.nodes[to];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const len = Math.sqrt(dx*dx + dy*dy);
            const steps = Math.floor(len / 3);
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const x = n1.x + dx * t;
                const y = n1.y + dy * t;
                ctx.fillRect(x - 1, y - 1, 2, 2);
            }
        });
        
        // Dibujar nodos
        this.nodes.forEach(node => node.draw());
        
        // Dibujar jugador en el nodo actual
        const currentNode = this.nodes[this.currentNodeIndex];
        ctx.fillStyle = GB.d;
        ctx.fillRect(currentNode.x - 3, currentNode.y + 10, 6, 8);
        ctx.fillStyle = GB.ll;
        ctx.fillRect(currentNode.x - 2, currentNode.y + 12, 1, 1);
        ctx.fillRect(currentNode.x + 1, currentNode.y + 12, 1, 1);
        
        // Instrucciones
        ctx.fillStyle = GB.d;
        ctx.font = '6px monospace';
        ctx.fillText('< >: Navegar', 5, 135);
        ctx.fillText('SPACE: Entrar', 90, 135);
        
        // Info del nivel actual
        ctx.fillStyle = GB.m;
        ctx.fillRect(5, 18, 150, 12);
        ctx.fillStyle = GB.ll;
        ctx.font = '6px monospace';
        const levelName = LEVELS[currentNode.levelIndex].name;
        ctx.fillText(`Nivel ${currentNode.levelIndex + 1}: ${levelName}`, 8, 26);
    }
    
    completeLevel(levelIndex) {
        this.nodes[levelIndex].completed = true;
        if (levelIndex < this.nodes.length - 1) {
            this.nodes[levelIndex + 1].unlocked = true;
        }
    }
}

const LEVELS = [
    // Mundo 1: Terrestre
    { name: 'Bosque Terrestre', bg: GB.ll, world: 1,
      platforms: [[0,135,400,10], [50,110,40,5], [120,95,50,5], [200,80,40,5], [280,65,50,5]],
      enemies: [[80,125,'slime'], [140,85,'beetle'], [220,70,'goblin'], [300,55,'beetle']], goal: 380 },
    { name: 'Costa Marina', bg: GB.l, world: 1,
      platforms: [[0,135,400,10], [40,115,35,5], [100,100,40,5], [170,85,45,5], [240,70,40,5], [310,55,50,5]],
      enemies: [[70,105,'jellyfish'], [150,75,'crab'], [260,60,'seahorse'], [330,45,'jellyfish']], goal: 380 },
    { name: 'Mazmorra Oscura', bg: GB.m, world: 1,
      platforms: [[0,135,450,10], [60,115,40,5], [130,100,45,5], [205,85,40,5], [280,70,50,5], [360,85,50,5]],
      enemies: [[90,105,'bat'], [160,90,'skeleton'], [300,60,'bat'], [380,75,'dragon']], goal: 440 },
    
    // Mundo 2: Avanzado (mapas más largos, precipicios, enemigos voladores)
    { name: 'Cañón Peligroso', bg: GB.ll, world: 2,
      platforms: [[0,135,80,10], [120,135,60,10], [220,120,50,5], [310,105,55,5], [405,90,60,5], [505,105,50,5], [595,120,70,10]],
      enemies: [[140,125,'spider'], [250,110,'hawk',45], [350,95,'scorpion'], [450,50,'hawk',60], [550,95,'spider'], [615,110,'goblin']], 
      goal: 650 },
    { name: 'Tormenta Aérea', bg: GB.l, world: 2,
      platforms: [[0,135,70,10], [100,120,45,5], [175,105,50,5], [255,90,45,5], [330,75,50,5], [410,90,55,5], [495,105,50,5], [575,120,45,5], [650,135,70,10]],
      enemies: [[120,110,'gargoyle',70], [200,95,'hawk',55], [280,80,'scorpion'], [380,60,'gargoyle',75], [450,85,'spider'], [520,95,'hawk',60], [600,110,'seahorse']], 
      goal: 705 },
    { name: 'Fortaleza Infernal', bg: GB.m, world: 2,
      platforms: [[0,135,90,10], [130,120,55,5], [220,105,50,5], [305,90,55,5], [395,75,50,5], [480,60,55,5], [570,75,50,5], [655,90,60,5], [750,105,70,10]],
      enemies: [[150,110,'bat'], [240,95,'gargoyle',65], [330,80,'skeleton'], [420,65,'hawk',70], [510,50,'scorpion'], [600,65,'bat'], [690,80,'gargoyle',75], [770,95,'demon']], 
      goal: 805 }
];

class Game {
    constructor() {
        this.player = new Player(20, 100); this.currentLevel = 0; this.platforms = []; this.enemies = [];
        this.combat = null; this.keys = {}; this.cameraX = 0; this.gameStarted = false;
        this.levelUpMessage = 0; this.levelCompleteMessage = 0; this.goalFlag = null;
        this.worldMap = new WorldMap(); this.inWorldMap = false; this.inLevel = false;
        this.levelCompleting = false;
        this.setupInput();
    }
    loadLevel(lvl) {
        this.currentLevel = lvl; const level = LEVELS[lvl];
        const isDark = level.world === 1 && lvl === 2 || level.world === 2 && lvl === 5;
        this.platforms = level.platforms.map(p => new Platform(...p, isDark));
        
        // Verificar si el nivel ya fue completado
        const levelCompleted = this.worldMap.nodes[lvl].completed;
        
        this.enemies = level.enemies.map(e => {
            const enemy = new Enemy(...e);
            if (enemy.isFlying) {
                enemy.initialY = enemy.y;
            }
            // Reducir XP a la mitad si el nivel ya fue completado
            if (levelCompleted) {
                enemy.xpReward = Math.floor(enemy.xpReward / 2);
            }
            return enemy;
        });
        this.goalFlag = new GoalFlag(level.goal, 115);
        this.player.x = 20; this.player.y = 100; this.player.energy = this.player.maxEnergy; this.cameraX = 0;
    }
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (!this.gameStarted && e.code === 'Space') { 
                this.gameStarted = true; 
                startScreen.style.display = 'none'; 
                this.inWorldMap = true;
            }
            if (this.combat && this.combat.active) this.combat.handleInput(e.code);
            // Salir del nivel con ESC
            if (e.code === 'Escape' && this.inLevel && !this.combat) {
                this.exitLevel();
            }
        });
        document.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    }
    
    exitLevel() {
        this.inLevel = false;
        this.inWorldMap = true;
        this.player.hp = this.player.maxHp;
        this.player.energy = this.player.maxEnergy;
    }
    update() {
        if (!this.gameStarted) return;
        
        // Actualizar mapa del mundo
        if (this.inWorldMap) {
            const selectedLevel = this.worldMap.update(this.keys);
            if (selectedLevel !== null) {
                this.currentLevel = selectedLevel;
                this.loadLevel(selectedLevel);
                this.inWorldMap = false;
                this.inLevel = true;
            }
            return;
        }
        
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
            // No actualizar jugador si está completando nivel
            if (!this.levelCompleting) {
                this.player.update(this.keys, this.platforms);
            }
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
            // Verificar si el jugador llega a la meta
            if (this.player.x >= LEVELS[this.currentLevel].goal && !this.levelCompleting) {
                // En niveles con boss (nivel 3 y 6), verificar que el boss esté derrotado
                if (this.currentLevel === 2 || this.currentLevel === 5) {
                    const boss = this.enemies.find(e => e.isBoss);
                    if (boss && boss.alive) {
                        // Empujar al jugador hacia atrás si intenta pasar sin derrotar al boss
                        this.player.x = LEVELS[this.currentLevel].goal - 5;
                        this.player.vx = 0;
                        return;
                    }
                }
                
                // Marcar nivel como completado y activar flag de completando
                this.levelCompleting = true;
                this.worldMap.completeLevel(this.currentLevel);
                this.levelCompleteMessage = 180;
                
                if (this.currentLevel === LEVELS.length - 1) {
                    // Último nivel completado - Victoria
                    this.levelCompleting = false;
                    this.gameStarted = false;
                    startScreen.innerHTML = '<h1>VICTORIA!</h1><p>¡Completaste los 6 niveles!</p><p>¡Venciste 2 mundos!</p><p class="blink">PRESIONA ESPACIO</p>';
                    startScreen.style.display = 'flex';
                    this.player = new Player(20, 100);
                    this.worldMap = new WorldMap();
                    this.inLevel = false;
                    this.inWorldMap = false;
                } else {
                    // Volver al mapa del mundo
                    setTimeout(() => {
                        this.levelCompleting = false;
                        this.inLevel = false;
                        this.inWorldMap = true;
                        this.worldMap.currentNodeIndex = Math.min(this.currentLevel + 1, LEVELS.length - 1);
                        this.player.hp = this.player.maxHp;
                        this.player.energy = this.player.maxEnergy;
                    }, 2000);
                }
            }
            if (this.goalFlag) this.goalFlag.update();
            if (this.levelUpMessage > 0) this.levelUpMessage--;
            if (this.levelCompleteMessage > 0) this.levelCompleteMessage--;
        }
    }
    draw() {
        // Dibujar mapa del mundo
        if (this.inWorldMap) {
            this.worldMap.draw();
            return;
        }
        
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
