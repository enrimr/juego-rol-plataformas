# Guía de Testing - Juego de Plataformas RPG

## 📋 Descripción

Este proyecto incluye tests básicos para asegurar que el juego funciona correctamente cuando se añaden cambios. Los tests verifican la funcionalidad core del juego incluyendo mecánicas de combate, sistema de niveles, colisiones y características especiales como la invulnerabilidad.

## 🚀 Instalación

Las dependencias de testing ya están instaladas. Si necesitas reinstalarlas:

```bash
npm install
```

## ▶️ Ejecutar Tests

### Ejecutar todos los tests una vez
```bash
npm test
```

### Ejecutar tests en modo watch (re-ejecuta automáticamente al guardar cambios)
```bash
npm run test:watch
```

### Ejecutar tests con cobertura de código
```bash
npm run test:coverage
```

## 📊 Tests Implementados

### 1. **Player Tests**
- ✅ Inicialización correcta del jugador
- ✅ Sistema de XP y subida de nivel
- ✅ Sistema de daño y defensa
- ✅ Detección de colisiones

### 2. **Enemy Tests**
- ✅ Inicialización de diferentes tipos de enemigos (slime, beetle, goblin)
- ✅ Sistema de stats por tipo de enemigo
- ✅ Sistema de daño y muerte de enemigos
- ✅ Recompensas de XP

### 3. **Combat System Tests**
- ✅ Combate entre jugador y enemigo
- ✅ Sistema de victoria y recompensas
- ✅ Cálculo de daño con ataque y defensa

### 4. **Game Mechanics Tests**
- ✅ Sistema de invulnerabilidad temporal (180 frames / 3 segundos)
- ✅ Detección de colisión desde arriba
- ✅ Diferenciación entre colisiones laterales y verticales

### 5. **Level System Tests**
- ✅ Escalado de XP requerido por nivel
- ✅ Incremento de stats al subir de nivel
- ✅ Restauración de HP y Energy al subir de nivel

### 6. **Integration Tests**
- ✅ Escenario completo de múltiples combates
- ✅ Progresión de nivel a través de varios enemigos
- ✅ Validación de estados del juego

## 📈 Cobertura de Código

Los tests cubren las funcionalidades principales:
- Sistema de combate
- Mecánicas de colisión
- Sistema de progresión (XP/niveles)
- Sistema de invulnerabilidad
- Lógica de stats y daño

## 🧪 Ejemplo de Salida

```
PASS  __tests__/game.test.js
  Player Tests
    ✓ Player se inicializa correctamente (3 ms)
    ✓ Player gana XP y sube de nivel (1 ms)
    ✓ Player recibe daño correctamente (1 ms)
    ✓ Player siempre recibe al menos 1 de daño
    ✓ Player detecta colisión con enemigo
    ✓ Player no colisiona con enemigo lejano (1 ms)
  Enemy Tests
    ✓ Slime se inicializa correctamente
    ✓ Beetle tiene stats correctas (1 ms)
    ✓ Enemy recibe daño y muere
    ✓ Enemy recibe daño pero sobrevive
  Combat System Tests
    ✓ Player derrota enemigo más débil (1 ms)
    ✓ Player gana XP al derrotar enemigo
  Game Mechanics Tests
    ✓ Invulnerabilidad funciona correctamente (1 ms)
    ✓ Colisión desde arriba detectada correctamente
    ✓ Colisión lateral no es desde arriba
  Level System Tests
    ✓ XP requerido aumenta por nivel
    ✓ Stats aumentan al subir de nivel (1 ms)
    ✓ HP y Energy se restauran al subir de nivel
  Integration Tests
    ✓ Escenario completo: Player derrota varios enemigos y sube de nivel (1 ms)
    ✓ Player no puede ganar más XP si está muerto

Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
```

## 🔧 Añadir Nuevos Tests

Para añadir nuevos tests, edita el archivo `__tests__/game.test.js`:

```javascript
describe('Nueva Funcionalidad Tests', () => {
  test('Descripción del test', () => {
    // Arrange (preparar)
    const player = new Player(20, 100);
    
    // Act (actuar)
    player.gainXP(5);
    
    // Assert (verificar)
    expect(player.xp).toBe(5);
  });
});
```

## 🐛 Debugging

Si un test falla:

1. Lee el mensaje de error cuidadosamente
2. Verifica que la lógica del juego no haya cambiado
3. Si el cambio es intencional, actualiza el test
4. Ejecuta `npm test` nuevamente

## 📝 Notas Importantes

- Los tests usan versiones simplificadas de las clases para enfocarse en la lógica
- No requieren un navegador real (usan mocks de DOM)
- Son rápidos de ejecutar (menos de 1 segundo total)
- Se pueden ejecutar en CI/CD para validación automática

## ✅ Recomendaciones

1. **Ejecuta los tests antes de hacer commit**: Asegúrate de que todos pasen
2. **Añade tests para nuevas features**: Mantén la cobertura alta
3. **Usa `test:watch` durante desarrollo**: Te avisa inmediatamente si algo se rompe
4. **Revisa la cobertura**: `npm run test:coverage` te muestra qué falta testear

## 🎯 Beneficios

- ✨ Detecta bugs antes de que lleguen al juego
- 🔒 Previene regresiones al añadir features
- 📚 Documenta el comportamiento esperado
- 🚀 Facilita refactorización segura
- ⚡ Acelera el desarrollo a largo plazo
