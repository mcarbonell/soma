> ⚠️ **DEPRECATED** — Este documento ha sido superado por [`SOMA_V9_IMPLEMENTATION_PLAN-v2.md`](SOMA_V9_IMPLEMENTATION_PLAN-v2.md), que introduce el enfoque RadixAttention (Fork & Drop) reduciendo las estimaciones de 500-610 a 310-370 turnos. Se conserva como referencia histórica del análisis inicial.

# SOMA v9.0 - Plan de Implementación del Kernel Soberano (v1 — Superado)

**Estado**: ~~Propuesta Técnica~~ → **Superado por v2**  
**Fecha**: 2026-03-10  
**Basado en**: `research-soma-v9-sovereign-kernel.md`  
**Autor**: Análisis técnico de viabilidad

---

## 1. Resumen Ejecutivo

SOMA v9.0 propone transformar el orquestador de un "wrapper externo" a un **Kernel Cognitivo** que opera sobre el motor de inferencia en tiempo real. Este documento analiza la viabilidad técnica y propone un roadmap de implementación medido en **turnos de agente**.

### Cambio de Paradigma

```
SOMA v8.1 (Actual):
Modelo genera → Orquestador parsea → Ejecuta tool → Reinicia inferencia
Latencia: ~500ms por tool call

SOMA v9.0 (Propuesto):
Modelo genera → Runtime detecta → Pausa → Muta KV-cache → Continúa
Latencia: ~50ms por hot tool (10x más rápido)
```

---

## 2. Aclaración Crítica: No Requiere Fine-Tuning

**Insight clave**: Los modelos actuales ya saben usar tools como `think`, `remember`, `forget`. El cambio no es en el modelo, sino en **cómo el runtime procesa la salida**.

### Formato Actual (v8.1)
```json
{
  "tool": "think",
  "args": {"content": "Necesito analizar el contexto antes de continuar..."}
}
```
→ Orquestador recibe, procesa, reinicia inferencia

### Formato v9.0 (dos opciones)

#### Opción A: Tokens Especiales
```
"<SOMA_THINK>Voy a analizar el contexto y luego continuar...</SOMA_THINK>"
```
- Runtime detecta token especial en streaming
- Pausa generación
- Muta KV-cache
- Continúa desde donde pausó

#### Opción B: Streaming con Detección (RECOMENDADA)
```json
{"tool":"think","args":{"content":"..."}}
```
- Runtime detecta tool call en streaming
- Pausa ANTES del cierre `}`
- Ejecuta tool
- Inyecta resultado en siguiente chunk
- Continúa generando

**Opción B es más pragmática** porque:
- No requiere tokens especiales nuevos
- Los modelos ya generan este formato
- Solo necesitas interceptar el streaming

---

## 3. Análisis de Runtimes Candidatos

### 3.1 vLLM
```
Complejidad: 🔴🔴🔴 Alta
Líneas de código: ~50,000 (C++/CUDA)
Pros:
  - Más usado en producción
  - Optimizaciones agresivas
Contras:
  - KV-cache management muy complejo
  - Difícil de modificar sin romper optimizaciones
  - Requiere expertise profundo en CUDA

Estimación: 800-1200 turnos de agente
```

### 3.2 SGLang (RECOMENDADO)
```
Complejidad: 🟡🟡 Media
Líneas de código: ~15,000 (Python-first)
Pros:
  - Diseñado para control de flujo
  - Ya tiene primitivas de "programación"
  - Python-first (más accesible para agentes)
  - Comunidad receptiva a PRs
Contras:
  - Menos maduro que vLLM
  - Documentación en desarrollo

Estimación: 400-600 turnos de agente
```

### 3.3 llama.cpp
```
Complejidad: 🟢🟡 Media-Baja
Líneas de código: ~30,000 (C++ puro)
Pros:
  - Sin dependencias pesadas
  - Comunidad activa de forks
  - KV-cache relativamente simple
  - Bien documentado
Contras:
  - Menos features que vLLM/SGLang
  - Optimizaciones menos agresivas

Estimación: 500-700 turnos de agente
```

---

## 4. Arquitectura Propuesta (v9.0 MVP)

### 4.1 Componentes Nuevos

```
┌─────────────────────────────────────────────────────────────┐
│                    SOMA v9.0 Runtime                        │
├─────────────────────────────────────────────────────────────┤
│  StreamingInterceptor                                       │
│  ├─ Detecta tool calls en tiempo real                       │
│  ├─ Pausa generación                                        │
│  └─ Dispara HotToolExecutor                                 │
├─────────────────────────────────────────────────────────────┤
│  HotToolExecutor                                            │
│  ├─ Ejecuta metacognición (think, remember, forget)         │
│  ├─ Muta L1 en memoria                                      │
│  └─ Inyecta resultado en KV-cache                           │
├─────────────────────────────────────────────────────────────┤
│  KVCacheSurgeon                                             │
│  ├─ inject_at_position(pos, tokens)                         │
│  ├─ remove_range(start, end)                                │
│  └─ recalculate_attention_masks()                           │
├─────────────────────────────────────────────────────────────┤
│  SomaticClock                                               │
│  ├─ Inyecta señales de recursos en L1                       │
│  ├─ Tokens restantes (decrementa en tiempo real)            │
│  ├─ Tiempo transcurrido                                     │
│  └─ Presión de memoria ($P_m$)                              │
├─────────────────────────────────────────────────────────────┤
│  L3_VRAM_Manager (Fase 2)                                   │
│  ├─ Carga embeddings de L3 en GPU                           │
│  ├─ Swapping dinámico de tensores                           │
│  └─ Gestión de memoria GPU                                  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Flujo de Ejecución

```
1. Modelo genera tokens en streaming
   ↓
2. StreamingInterceptor detecta: {"tool":"think",...
   ↓
3. Pausa generación (guarda estado KV-cache)
   ↓
4. HotToolExecutor ejecuta tool
   ↓
5. KVCacheSurgeon inyecta resultado en posición actual
   ↓
6. SomaticClock actualiza métricas en L1
   ↓
7. Continúa generación desde donde pausó
```

---

## 5. Roadmap de Implementación (Medido en Turnos)

### Definición de "Turno de Agente"
```
1 turno = 1 ciclo completo de:
  - Leer contexto
  - Razonar
  - Ejecutar 1-3 acciones
  - Validar resultado

Estimación: ~5-10 minutos de tiempo real por turno
```

---

## Fase 1: Proof of Concept con SGLang
**Objetivo**: Validar que la detección de tool calls en streaming funciona

### Turno 1-20: Setup y Exploración
- [Turno 1-5] Clonar SGLang, analizar estructura del proyecto
- [Turno 6-10] Identificar dónde ocurre el streaming de tokens
- [Turno 11-15] Localizar el módulo de tool calling actual
- [Turno 16-20] Crear branch `soma-v9-poc` y setup de tests

### Turno 21-60: StreamingInterceptor
- [Turno 21-30] Implementar detector de tool calls en streaming
- [Turno 31-40] Añadir lógica de pausa de generación
- [Turno 41-50] Implementar buffer de tokens para parsing
- [Turno 51-60] Tests con Qwen 2.5 4B

### Turno 61-100: HotToolExecutor Básico
- [Turno 61-70] Implementar ejecución de `think` sin mutar KV-cache
- [Turno 71-80] Añadir `remember` y `forget`
- [Turno 81-90] Integrar con L1 actual de SOMA
- [Turno 91-100] Benchmark: latencia vs v8.1

**Entregable Fase 1**: POC funcional que detecta tools en streaming y las ejecuta (sin cirugía de KV-cache aún)

**Estimación total**: 100-120 turnos

---

## Fase 2: KV-Cache Surgery
**Objetivo**: Implementar inyección de tokens en KV-cache sin invalidar estados

### Turno 101-150: Análisis de KV-Cache
- [Turno 101-120] Estudiar implementación de KV-cache en SGLang
- [Turno 121-135] Identificar estructuras de datos relevantes
- [Turno 136-150] Documentar cómo se calculan attention masks

### Turno 151-250: Implementación de KVCacheSurgeon
- [Turno 151-180] Implementar `inject_at_position()`
- [Turno 181-210] Implementar `remove_range()`
- [Turno 211-240] Recalcular attention masks correctamente
- [Turno 241-250] Tests unitarios de cada operación

### Turno 251-300: Integración con HotToolExecutor
- [Turno 251-270] Conectar HotToolExecutor con KVCacheSurgeon
- [Turno 271-290] Validar coherencia de generación post-inyección
- [Turno 291-300] Tests end-to-end con casos complejos

**Entregable Fase 2**: Hot tools funcionando con cirugía de KV-cache real

**Estimación total**: 200-250 turnos

---

## Fase 3: Somatic Clock
**Objetivo**: Inyectar señales de recursos en tiempo real

### Turno 301-350: Implementación de SomaticClock
- [Turno 301-320] Implementar contador de tokens restantes
- [Turno 321-340] Añadir reloj de inferencia (milisegundos)
- [Turno 341-350] Implementar señal de presión de memoria ($P_m$)

### Turno 351-400: Inyección Dinámica en L1
- [Turno 351-370] Modificar L1 para incluir señales somáticas
- [Turno 371-390] Actualizar señales en cada token generado
- [Turno 391-400] Tests de comportamiento del modelo con señales

**Entregable Fase 3**: Modelo "siente" sus recursos en tiempo real

**Estimación total**: 100-120 turnos

---

## Fase 4: L3 en VRAM (Opcional - Avanzado)
**Objetivo**: Cargar memoria a largo plazo en GPU

### Turno 401-500: L3_VRAM_Manager
- [Turno 401-430] Implementar carga de embeddings en GPU
- [Turno 431-460] Swapping dinámico de tensores
- [Turno 461-490] Gestión de memoria GPU (evitar OOM)
- [Turno 491-500] Benchmark de latencia vs RAG tradicional

**Entregable Fase 4**: L3 como "tensor soberano" en VRAM

**Estimación total**: 100-120 turnos

---

## 6. Resumen de Estimaciones

| Fase | Objetivo | Turnos | Tiempo Real* |
|------|----------|--------|--------------|
| **Fase 1** | POC con streaming | 100-120 | 8-20 horas |
| **Fase 2** | KV-Cache Surgery | 200-250 | 16-40 horas |
| **Fase 3** | Somatic Clock | 100-120 | 8-20 horas |
| **Fase 4** | L3 en VRAM | 100-120 | 8-20 horas |
| **TOTAL MVP** | Fases 1-3 | 400-490 | 32-80 horas |
| **TOTAL Completo** | Fases 1-4 | 500-610 | 40-100 horas |

*Tiempo real asume 5-10 min/turno con agente autónomo

---

## 7. Requisitos Técnicos

### Hardware Mínimo
```
GPU: RTX 3090 / 4090 (24GB VRAM)
  - Modelo 4B: ~8GB
  - KV-cache: ~4GB
  - L3 embeddings: ~8GB (Fase 4)
  - Margen: ~4GB

CPU: 8+ cores (para compilación)
RAM: 32GB+
Disco: 100GB+ (para checkpoints y logs)
```

### Software
```
- Python 3.10+
- CUDA 12.0+
- PyTorch 2.0+
- SGLang (fork propio)
- Modelos de prueba: Qwen 2.5 4B, Phi-3.5 Mini, Gemma 2 2B
```

---

## 8. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| KV-cache corruption | Media | Alto | Tests exhaustivos, rollback automático |
| Latencia mayor a esperada | Media | Medio | Benchmark continuo, optimizaciones |
| Incompatibilidad con modelos | Baja | Alto | Validar con 3+ modelos diferentes |
| OOM en GPU (Fase 4) | Alta | Medio | Swapping inteligente, límites configurables |

---

## 9. Criterios de Éxito

### Fase 1 (POC)
- ✅ Detecta tool calls en streaming con 99%+ precisión
- ✅ Latencia < 100ms para detección
- ✅ No rompe generación normal

### Fase 2 (KV-Cache Surgery)
- ✅ Inyección de tokens sin corrupción de estado
- ✅ Generación post-inyección coherente (validación humana)
- ✅ Latencia de hot tools < 50ms

### Fase 3 (Somatic Clock)
- ✅ Señales actualizadas en tiempo real
- ✅ Modelo responde a señales (ej: resume cuando $P_m$ > 80%)
- ✅ Overhead < 5ms por token

### Fase 4 (L3 en VRAM)
- ✅ Latencia de búsqueda en L3 < 10ms
- ✅ No causa OOM en sesiones largas
- ✅ 10x más rápido que RAG tradicional

---

## 10. Próximos Pasos Inmediatos

### Para Iniciar (Turno 1)
1. Clonar SGLang: `git clone https://github.com/sgl-project/sglang.git`
2. Crear branch: `git checkout -b soma-v9-poc`
3. Analizar: `src/sglang/srt/` (runtime) y `src/sglang/lang/` (DSL)
4. Identificar: Dónde ocurre el streaming de tokens

### Preguntas a Resolver (Turno 1-10)
- ¿Dónde se genera el stream de tokens en SGLang?
- ¿Cómo se maneja actualmente el tool calling?
- ¿Qué estructura tiene la KV-cache?
- ¿Hay hooks o callbacks para interceptar generación?

---

## 11. Conclusión

SOMA v9.0 es **técnicamente viable** con las herramientas actuales. La clave es:

1. **No requiere fine-tuning** - Los modelos ya saben usar tools
2. **SGLang es el mejor candidato** - Python-first, diseñado para control de flujo
3. **Implementación incremental** - Cada fase entrega valor independiente
4. **Medición en turnos** - Permite planificación realista con agentes

**Recomendación**: Iniciar con Fase 1 (POC) usando SGLang y Qwen 2.5 4B. Si el POC demuestra viabilidad (100-120 turnos), continuar con Fase 2.

---

**Documento generado**: 2026-03-10  
**Próxima revisión**: Post Fase 1 (turno ~120)  
**Responsable**: Agente SOMA (con supervisión humana)
