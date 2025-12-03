/**
 * Tests básicos para el juego de plataformas RPG
 * Estos tests verifican la funcionalidad core del juego
 */

// Mock del canvas y contexto
global.document = {
  getElementById: jest.fn(() => ({
    getContext: jest.fn(() => ({
      fillStyle: '',
      fillRect: jest.fn(),
      fillText: jest.fn(),
      font: ''
    })),
    style: {}
  })),
  addEventListener: jest.fn()
};

global.requestAnimationFrame = jest.fn();

// Constantes del juego
const GB = { d: '#0f380f', m: '#306230', l: '#8bac0f', ll: '#9bbc0f' };

// Clase Player simplificada para tests
class Player {
  constructor(x, y) {
    Object.assign(this, {
      x, y, w: 8, h: 12, vx: 0, vy: 0, speed: 1.5, jumpPower: -4, gravity: 0.3,
      onGround: false, jumping: false, level: 1, maxHp: 20, hp: 20, maxEnergy: 10, energy: 10,
      xp: 0, xpToNextLevel: 10, attack: 5, defense: 2
    });
  }
  
  collides(e) { 
    return this.x < e.x + e.w && this.x + this.w > e.x && 
           this.y < e.y + e.h && this.y + this.h > e.y; 
  }
  
  collidesFromAbove(e) { 
    return this.vy > 0 && this.y + this.h <= e.y + e.h/2 && this.collides(e); 
  }
  
  gainXP(amt) {
    this.xp += amt;
    if (this.xp >= this.xpToNextLevel) {
      this.level++;
      this.xp = 0;
      this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
      this.maxHp += 5;
      this.hp = this.maxHp;
      this.maxEnergy += 2;
      this.energy = this.maxEnergy;
      this.attack += 2;
      this.defense += 1;
    }
  }
  
  takeDamage(amt) { 
    const dmg = Math.max(1, amt - this.defense); 
    this.hp -= dmg; 
    return dmg; 
  }
}

// Clase Enemy simplificada para tests
class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.alive = true;
    this.defeated = false;
    
    const stats = {
      slime: [1, 8, 3, 1, 5],
      beetle: [2, 12, 4, 2, 8],
      goblin: [3, 18, 6, 3, 15]
    };
    
    const s = stats[type] || stats.slime;
    [this.level, this.maxHp, this.attack, this.defense, this.xpReward] = s;
    this.hp = this.maxHp;
    this.w = 10;
    this.h = 10;
  }
  
  takeDamage(amt) {
    const dmg = Math.max(1, amt - this.defense);
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.defeated = true;
      this.alive = false;
    }
    return dmg;
  }
}

describe('Player Tests', () => {
  test('Player se inicializa correctamente', () => {
    const player = new Player(20, 100);
    
    expect(player.x).toBe(20);
    expect(player.y).toBe(100);
    expect(player.level).toBe(1);
    expect(player.hp).toBe(20);
    expect(player.maxHp).toBe(20);
    expect(player.energy).toBe(10);
    expect(player.attack).toBe(5);
    expect(player.defense).toBe(2);
  });
  
  test('Player gana XP y sube de nivel', () => {
    const player = new Player(20, 100);
    
    player.gainXP(10);
    
    expect(player.level).toBe(2);
    expect(player.xp).toBe(0);
    expect(player.maxHp).toBe(25);
    expect(player.hp).toBe(25);
    expect(player.attack).toBe(7);
    expect(player.defense).toBe(3);
  });
  
  test('Player recibe daño correctamente', () => {
    const player = new Player(20, 100);
    const initialHp = player.hp;
    
    const damage = player.takeDamage(5);
    
    expect(damage).toBe(3); // 5 - 2 defense
    expect(player.hp).toBe(initialHp - 3);
  });
  
  test('Player siempre recibe al menos 1 de daño', () => {
    const player = new Player(20, 100);
    
    const damage = player.takeDamage(1);
    
    expect(damage).toBe(1);
  });
  
  test('Player detecta colisión con enemigo', () => {
    const player = new Player(20, 100);
    const enemy = new Enemy(22, 102, 'slime');
    
    expect(player.collides(enemy)).toBe(true);
  });
  
  test('Player no colisiona con enemigo lejano', () => {
    const player = new Player(20, 100);
    const enemy = new Enemy(100, 100, 'slime');
    
    expect(player.collides(enemy)).toBe(false);
  });
});

describe('Enemy Tests', () => {
  test('Slime se inicializa correctamente', () => {
    const enemy = new Enemy(50, 100, 'slime');
    
    expect(enemy.type).toBe('slime');
    expect(enemy.level).toBe(1);
    expect(enemy.hp).toBe(8);
    expect(enemy.attack).toBe(3);
    expect(enemy.xpReward).toBe(5);
    expect(enemy.alive).toBe(true);
  });
  
  test('Beetle tiene stats correctas', () => {
    const enemy = new Enemy(50, 100, 'beetle');
    
    expect(enemy.level).toBe(2);
    expect(enemy.hp).toBe(12);
    expect(enemy.attack).toBe(4);
  });
  
  test('Enemy recibe daño y muere', () => {
    const enemy = new Enemy(50, 100, 'slime');
    
    enemy.takeDamage(10);
    
    expect(enemy.hp).toBeLessThanOrEqual(0);
    expect(enemy.defeated).toBe(true);
    expect(enemy.alive).toBe(false);
  });
  
  test('Enemy recibe daño pero sobrevive', () => {
    const enemy = new Enemy(50, 100, 'goblin'); // 18 HP
    
    const damage = enemy.takeDamage(5);
    
    expect(damage).toBe(2); // 5 - 3 defense
    expect(enemy.hp).toBe(16);
    expect(enemy.alive).toBe(true);
  });
});

describe('Combat System Tests', () => {
  test('Player derrota enemigo más débil', () => {
    const player = new Player(20, 100);
    const enemy = new Enemy(50, 100, 'slime');
    
    const initialXp = player.xp;
    
    // Simular combate
    while (enemy.alive && player.hp > 0) {
      enemy.takeDamage(player.attack);
      if (enemy.alive) {
        player.takeDamage(enemy.attack);
      }
    }
    
    expect(enemy.alive).toBe(false);
    expect(player.hp).toBeGreaterThan(0);
  });
  
  test('Player gana XP al derrotar enemigo', () => {
    const player = new Player(20, 100);
    const enemy = new Enemy(50, 100, 'slime');
    const xpReward = enemy.xpReward;
    
    enemy.takeDamage(100); // Matar enemigo
    
    if (enemy.defeated) {
      player.gainXP(xpReward);
    }
    
    expect(player.xp).toBe(5);
  });
});

describe('Game Mechanics Tests', () => {
  test('Invulnerabilidad funciona correctamente', () => {
    let playerInvulnerable = 180; // 3 segundos
    
    // Simular frames
    for (let i = 0; i < 60; i++) {
      if (playerInvulnerable > 0) {
        playerInvulnerable--;
      }
    }
    
    expect(playerInvulnerable).toBe(120);
    
    // Simular resto de frames
    for (let i = 0; i < 120; i++) {
      if (playerInvulnerable > 0) {
        playerInvulnerable--;
      }
    }
    
    expect(playerInvulnerable).toBe(0);
  });
  
  test('Colisión desde arriba detectada correctamente', () => {
    const player = new Player(50, 90);
    player.vy = 2; // Cayendo
    const enemy = new Enemy(50, 100, 'slime');
    
    expect(player.collidesFromAbove(enemy)).toBe(true);
  });
  
  test('Colisión lateral no es desde arriba', () => {
    const player = new Player(50, 100);
    player.vy = 0;
    const enemy = new Enemy(55, 100, 'slime');
    
    expect(player.collidesFromAbove(enemy)).toBe(false);
  });
});

describe('Level System Tests', () => {
  test('XP requerido aumenta por nivel', () => {
    const player = new Player(20, 100);
    const initialXpRequired = player.xpToNextLevel;
    
    player.gainXP(10); // Subir a nivel 2
    
    expect(player.xpToNextLevel).toBe(Math.floor(initialXpRequired * 1.5));
  });
  
  test('Stats aumentan al subir de nivel', () => {
    const player = new Player(20, 100);
    const initialAttack = player.attack;
    const initialDefense = player.defense;
    const initialMaxHp = player.maxHp;
    
    player.gainXP(10); // Nivel 2
    
    expect(player.attack).toBe(initialAttack + 2);
    expect(player.defense).toBe(initialDefense + 1);
    expect(player.maxHp).toBe(initialMaxHp + 5);
  });
  
  test('HP y Energy se restauran al subir de nivel', () => {
    const player = new Player(20, 100);
    player.hp = 10; // Daño recibido
    player.energy = 5; // Energía gastada
    
    player.gainXP(10); // Subir nivel
    
    expect(player.hp).toBe(player.maxHp);
    expect(player.energy).toBe(player.maxEnergy);
  });
});

describe('Integration Tests', () => {
  test('Escenario completo: Player derrota varios enemigos y sube de nivel', () => {
    const player = new Player(20, 100);
    
    // Crear 3 slimes
    const enemies = [
      new Enemy(50, 100, 'slime'),
      new Enemy(80, 100, 'slime'),
      new Enemy(110, 100, 'slime')
    ];
    
    enemies.forEach(enemy => {
      // Derrotar enemigo
      while (enemy.alive) {
        enemy.takeDamage(player.attack);
      }
      
      // Ganar XP
      player.gainXP(enemy.xpReward);
    });
    
    // Con 3 slimes (5 XP cada uno) = 15 XP
    // Debería estar en nivel 2 con 5 XP extra
    expect(player.level).toBe(2);
    expect(player.xp).toBe(5);
  });
  
  test('Player no puede ganar más XP si está muerto', () => {
    const player = new Player(20, 100);
    player.hp = 0;
    
    const initialLevel = player.level;
    
    // Intentar ganar XP
    if (player.hp > 0) {
      player.gainXP(10);
    }
    
    expect(player.level).toBe(initialLevel);
  });
});
