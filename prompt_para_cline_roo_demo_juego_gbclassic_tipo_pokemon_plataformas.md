# Prompt para Cline / Roo

## Rol
Eres un **desarrollador senior de videojuegos retro** especializado en recrear experiencias estilo **Game Boy Classic**, con fuertes conocimientos en:
- Motores 2D sencillos
- Juegos de plataformas
- Combate por turnos tipo JRPG
- Diseño de mecánicas originales y balanceo

Debes diseñar y construir una **demo jugable** de un videojuego original inspirado en Pokémon Rojo/Azul, pero con una mecánica híbrida única.

---

## Concepto del juego

Título provisional: **MONSTER JUMP**

Género híbrido:
- 🎮 Plataformas 2D lateral (estilo Mario clásico)
- ⚔️ Combate por turnos tipo Pokémon
- 🎨 Estética Game Boy Classic (pantalla verde, pixel art, 160x144)

### Premisa original
El jugador controla a un "Domador" que viaja por distintos biomas llenos de criaturas.
La diferencia clave con Pokémon:

➡️ La forma de interactuar con los enemigos afecta al resultado.

---

## Mecánica principal (núcleo de innovación)

Cuando el jugador se encuentra con un rival en el modo plataformas:

1. Si el jugador SALTA sobre un enemigo:
   - Si el enemigo tiene nivel MENOR que el jugador → el enemigo muere instantáneamente.
   - Si el enemigo tiene nivel IGUAL o MAYOR → se activa un combate por turnos.

2. Si el jugador toca al enemigo lateralmente → combate automático.

3. Si esquiva al enemigo → no hay combate.

Esto crea una capa estratégica:
- ¿Arriesgar saltar o evitar?
- ¿Farmear enemigos débiles o enfrentarse a fuertes?

---

## Sistema de combate

Combate por turnos basado en Pokémon pero simplificado:

Características:
- 1 vs 1
- Barra de vida
- Ataque básico
- Ataque especial (consume energía)
- Defensa
- Habilidad única

Sistema de experiencia:
- Cada victoria otorga XP
- Subida de nivel automática
- Mejora de stats + desbloqueo de ataques

Ejemplo:
- Nivel 1: Golpe
- Nivel 3: Llama rápida
- Nivel 5: Salto perforador

---

## Demo solicitada

Construye una DEMO que contenga:

### 1. Nivel de plataformas
- Scroll lateral
- 3 tipos de enemigos:
  - Slime (nivel bajo)
  - Beetle (nivel medio)
  - Warlord (nivel alto)
- Plataforma elevada y obstáculos

### 2. Sistema de colisiones
- Distinguir colisión por salto o lateral
- Detectar si el jugador cae sobre la cabeza del enemigo
- Evaluar diferencia de nivel

### 3. Sistema de combate
- Interfaz por turnos estilo Game Boy:
  - Pantalla de combate
  - Caja de texto
  - Opciones:
    - Atacar
    - Habilidad
    - Defender
    - Huir

### 4. HUD
- Vida
- Nivel
- Energía
- Barra de experiencia

---

## Requisitos técnicos

- Usar HTML + CSS + JavaScript (sin frameworks pesados)
- Estética Game Boy:
  - Resolución: 160x144
  - Paleta monocromo verde
  - Fuente pixel
- Código bien organizado y comentado
- Arquitectura modular:
  - Player.js
  - Enemy.js
  - CombatSystem.js
  - GameEngine.js

---

## Estilo visual

Referencia visual:
- Pokémon Red/Blue (Game Boy)
- Super Mario Land

Pantalla con:
- Filtro CRT opcional
- Animaciones simples pero claras

---

## Comportamiento esperado

1. El jugador se mueve con WASD o flechas
2. Salta con espacio
3. Al saltar enemigos:
   - Si lvl enemigo < lvl jugador → enemigo desaparece con animación
   - Si lvl enemigo >= lvl jugador → transición a combate

Tras el combate:
- Si gana → vuelve al mapa, XP ganada
- Si pierde → Game Over básico

---

## Objetivo final

Generar una demo funcional donde se pueda:
- Mover al personaje
- Saltar enemigos
- Activar batallas
- Subir de nivel
- Visualizar progreso

---

## Entregables

1. Código completo listo para ejecutar en navegador
2. Instrucciones de uso
3. Comentarios en el código explicando la lógica

---

## Nivel de detalle esperado

✅ Código funcional
✅ Comentarios explicativos
✅ Arquitectura clara
✅ Demo interactiva


## Extra (si puedes)
- Sonido retro
- Pantalla de inicio
- Sistema simple de guardado (localStorage)
- Selector de criatura inicial


---

### Instrucción final para Cline/Roo

Construye esta demo paso a paso, priorizando jugabilidad, claridad del código y fidelidad estética a Game Boy Classic, manteniendo la mecánica innovadora de salto inteligente y combate condicionado por nivel.

