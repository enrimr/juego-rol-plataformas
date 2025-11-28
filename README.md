# MONSTER JUMP - Game Boy Classic Demo

Un juego híbrido de plataformas y RPG con estética Game Boy Classic, inspirado en Pokémon y Super Mario.

## 🎮 Concepto del Juego

**MONSTER JUMP** es una demo jugable que combina:
- **Plataformas 2D** estilo Super Mario Land
- **Combate por turnos** tipo Pokémon
- **Estética Game Boy Classic** (paleta verde monocromática, resolución 160x144)

### Mecánica Innovadora

La forma en que interactúas con los enemigos determina el resultado:

- **Saltar sobre enemigos débiles** (nivel menor que el tuyo) → Muerte instantánea del enemigo
- **Saltar sobre enemigos fuertes** (nivel igual o mayor) → Inicia combate por turnos
- **Colisión lateral** con cualquier enemigo → Inicia combate automático
- **Esquivar enemigos** → Sin combate

## 🕹️ Controles

### Modo Plataformas
- **← / A**: Mover a la izquierda
- **→ / D**: Mover a la derecha
- **ESPACIO / ↑ / W**: Saltar

### Modo Combate
- **1**: Atacar (ataque básico)
- **2**: Habilidad (ataque especial, consume 3 de energía)
- **3**: Defender (reduce daño recibido a la mitad)
- **4**: Huir (50% de probabilidad)

## 📊 Sistema de Progresión

### Estadísticas del Jugador
- **HP (Vida)**: Aumenta +5 por nivel
- **Energía**: Aumenta +2 por nivel (usada para habilidades)
- **Ataque**: Aumenta +2 por nivel
- **Defensa**: Aumenta +1 por nivel
- **Experiencia**: Gana XP al derrotar enemigos

### Tipos de Enemigos

#### Slime (Nivel 1)
- HP: 8
- Ataque: 3
- Defensa: 1
- XP: 5

#### Beetle (Nivel 3)
- HP: 15
- Ataque: 6
- Defensa: 3
- XP: 12

#### Warlord (Nivel 5)
- HP: 25
- Ataque: 10
- Defensa: 5
- XP: 25

## 🎯 Cómo Jugar

1. **Abre el archivo** `index.html` en tu navegador web
2. **Presiona ESPACIO** para comenzar
3. **Explora el nivel** saltando entre plataformas
4. **Derrota enemigos débiles** saltando sobre ellos para ganar XP rápida
5. **Enfrenta enemigos fuertes** en combate por turnos para ganar más XP
6. **Sube de nivel** para aumentar tus estadísticas
7. **Objetivo**: Derrotar a todos los enemigos y alcanzar el nivel máximo

## 🎨 Características Técnicas

- **Motor**: JavaScript vanilla (sin frameworks)
- **Resolución**: 160x144 (auténtica resolución Game Boy)
- **Paleta de colores**: 4 tonos de verde (#0f380f, #306230, #8bac0f, #9bbc0f)
- **Arquitectura modular**: Clases separadas para Player, Enemy, Platform, CombatSystem, Game
- **Física**: Gravedad, colisiones, detección de salto desde arriba
- **Sistema de cámara**: Sigue al jugador horizontalmente

## 📝 Arquitectura del Código

```
├── Player.js (Clase del jugador)
│   ├── Movimiento y física
│   ├── Sistema de stats
│   ├── Colisiones
│   └── Progresión (XP, nivel)
│
├── Enemy.js (Clase de enemigos)
│   ├── Tipos: Slime, Beetle, Warlord
│   ├── Stats por tipo
│   └── Sistema de vida
│
├── Platform.js (Plataformas)
│   └── Colisiones sólidas
│
├── CombatSystem.js (Sistema de combate)
│   ├── Turnos jugador/enemigo
│   ├── Acciones: Atacar, Habilidad, Defender, Huir
│   ├── Cálculo de daño
│   └── Interfaz de combate
│
└── Game.js (Motor principal)
    ├── Game loop
    ├── Gestión de estados
    ├── Renderizado
    └── HUD
```

## 🎮 Estrategias de Juego

1. **Al inicio**: Derrota slimes (nivel 1) saltando sobre ellos para ganar XP rápida
2. **Nivel 2-3**: Ya puedes derrotar beetles (nivel 3) con combate
3. **Nivel 4+**: Enfréntate al Warlord (nivel 5) para el desafío final
4. **En combate**: Usa defensa cuando tengas poca vida, habilidades para derrotar rápido
5. **Gestión de energía**: La energía se recupera al subir de nivel

## 🔧 Requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- No requiere instalación ni dependencias externas

## 🚀 Instalación

1. Descarga el archivo `index.html`
2. Abre el archivo en tu navegador web favorito
3. ¡Juega!

## 📜 Créditos

Desarrollado siguiendo las especificaciones de **MONSTER JUMP**:
- Inspirado en Pokémon Rojo/Azul (Game Boy)
- Inspirado en Super Mario Land
- Estética Game Boy Classic auténtica

## 🎓 Aspectos Educativos

Este proyecto demuestra:
- ✅ Programación orientada a objetos en JavaScript
- ✅ Canvas API para gráficos 2D
- ✅ Sistema de física simple (gravedad, colisiones)
- ✅ Máquinas de estado (plataformas vs combate)
- ✅ Sistema de turnos
- ✅ Gestión de entrada de teclado
- ✅ Game loop con requestAnimationFrame
- ✅ Sistema de progresión RPG

---

**¡Disfruta del juego!** 🎮👾
