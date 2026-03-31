
# SOMA v9.0 - Plan de Implementación del Kernel Soberano

**Estado**: Propuesta Técnica (Revisión Arquitectónica Avanzada)  
**Fecha**: 2026-03-10  
**Basado en**: `research-soma-v9-sovereign-kernel.md` y *Análisis de Viabilidad RadixAttention*  
**Autor**: Análisis técnico de viabilidad conjunta SOMA/USER

---

## 1. Resumen Ejecutivo

SOMA v9.0 propone transformar el orquestador de un "wrapper externo" a un **Kernel Cognitivo** que opera sobre el motor de inferencia en tiempo real. Este documento analiza la viabilidad técnica y propone un roadmap de implementación medido en **turnos de agente**.

### Cambio de Paradigma

```
SOMA v8.1 (Actual):
Modelo genera → Orquestador parsea → Ejecuta tool → Reinicia inferencia (Recalcula KV-Cache)
Latencia: ~500ms por tool call + Penalización de Prefill

SOMA v9.0 (Propuesto - RadixAttention):
Modelo genera → Runtime detecta → Hace "Fork" del árbol → Ejecuta tool → "Drop" de la rama inútil → Continúa
Latencia: ~50ms por hot tool (10x más rápido, CERO recálculo posicional)
```

---

## 2. Aclaración Crítica: No Requiere Fine-Tuning

**Insight clave**: Los modelos actuales ya saben usar tools como `think`, `remember`, `forget`. El cambio no es en el modelo, sino en **cómo el runtime procesa la salida**.

**Formato v9.0 Recomendado (Streaming con Detección)**
```json
{"tool":"think","args":{"content":"..."}}
```
- Runtime detecta tool call en streaming
- Pausa ANTES del cierre `}`
- Ejecuta tool (en una rama paralela de la KV-Cache)
- Inyecta resultado destilado
- Continúa generando

---

## 3. Análisis de Runtimes Candidatos: La Victoria de SGLang

Para lograr la "Cirugía de Contexto" sin destruir los *Rotary Position Embeddings* (RoPE), **SGLang** es el único candidato viable a corto plazo gracias a su arquitectura **RadixAttention**.

*   **¿Por qué descartamos vLLM/llama.cpp para esto?** Modificar el medio de una KV-Cache lineal obliga a recalcular los embeddings posicionales (RoPE) de todos los tokens subsecuentes. Es una pesadilla de CUDA.
*   **La magia de SGLang (RadixAttention):** Trata la KV-Cache como un árbol de prefijos. Podemos hacer un *fork* (rama), dejar que el modelo "piense" ahí, destilar el resultado, y hacer un *drop* (abandonar) la rama sucia. El *Garbage Collector* de SGLang limpia la VRAM y volvemos al nodo principal sin recalcular un solo embedding.

---

## 4. Arquitectura Propuesta (v9.0 MVP)

### 4.1 Componentes Nuevos

```
┌─────────────────────────────────────────────────────────────┐
│                    SOMA v9.0 Runtime                        │
├─────────────────────────────────────────────────────────────┤
│  StreamingInterceptor                                       │
│  ├─ Detecta tool calls en tiempo real                       │
│  ├─ Pausa generación en el nodo actual                      │
│  └─ Dispara HotToolExecutor                                 │
├─────────────────────────────────────────────────────────────┤
│  HotToolExecutor                                            │
│  ├─ Ejecuta metacognición (think, remember, forget)         │
│  └─ Inyecta resultado como nodo destilado                   │
├─────────────────────────────────────────────────────────────┤
│  RadixBranchManager (Reemplaza a KVCacheSurgeon)            │
│  ├─ fork_generation_node() -> Crea rama de "pensamiento"    │
│  ├─ drop_dirty_branch() -> GC limpia rama fallida           │
│  └─ commit_distilled_node() -> Inyecta conclusión limpia    │
├─────────────────────────────────────────────────────────────┤
│  SomaticClock (Interruptor de Cabeza)                       │
│  ├─ Inyecta señales [SYS_ALERT] en la *cabeza* de generación│
│  ├─ Presión de memoria ($P_m$)                              │
│  └─ Evita mutar prefijos para no invalidar la KV-Cache      │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Roadmap de Implementación (Medido en Turnos)

### Definición de "Turno de Agente"
```
1 turno = 1 ciclo completo de: Leer contexto -> Razonar -> Ejecutar -> Validar
Estimación: ~5-10 minutos de tiempo real por turno
```

---

## Fase 1: Proof of Concept con SGLang
**Objetivo**: Validar que la detección de tool calls en streaming funciona.

### Turno 1-20: Setup y Exploración
- [Turno 1-5] Clonar SGLang, analizar estructura de `src/sglang/srt/`.
- [Turno 6-10] Identificar dónde ocurre el streaming de tokens.
- [Turno 11-20] Crear branch `soma-v9-poc` y setup de tests.

### Turno 21-60: StreamingInterceptor
- [Turno 21-40] Implementar detector de tool calls en buffer de streaming.
- [Turno 41-50] Añadir lógica de pausa (halt) en el nodo exacto.
- [Turno 51-60] Tests con Qwen 2.5 4B o Llama-3 8B.

### Turno 61-100: HotToolExecutor Básico
- [Turno 61-80] Implementar ejecución de `think` básica.
- [Turno 81-100] Benchmark: latencia vs pipeline autorregresivo clásico (v8.1).

**Estimación total Fase 1**: 100-120 turnos.

---

## Fase 2: "Fork & Drop" con RadixAttention (La verdadera Magia)
**Objetivo**: Implementar el Scratchpad Mutable aprovechando los árboles de SGLang. *(Estimación reducida drásticamente al no tener que tocar kernels CUDA)*.

### Turno 101-140: Dominando la API de Radix
- [Turno 101-120] Mapear las funciones internas de creación y destrucción de nodos en `sglang/srt/managers/`.
- [Turno 121-140] Implementar `fork_generation_node()`: Desviar la salida del modelo a una rama temporal.

### Turno 141-180: Implementación del Mutable Scratchpad
- [Turno 141-160] Implementar `drop_dirty_branch()`: Liberar la VRAM del razonamiento ruidoso/fallido.
- [Turno 161-180] Implementar `commit_distilled_node()`: Empalmar la conclusión limpia al tronco principal.

### Turno 181-200: Integración
- [Turno 181-200] Tests end-to-end simulando fallos de razonamiento y verificando que el "arrastre probabilístico" desaparece.

**Estimación total Fase 2**: 80-100 turnos. *(Bajada desde 250 gracias al enfoque de árboles)*.

---

## Fase 3: Somatic Clock (Inyección en la Cabeza)
**Objetivo**: Inyectar señales de recursos en tiempo real **sin invalidar el L1 original**.

### Turno 201-240: Implementación del Motor de Señales
- [Turno 201-220] Implementar cálculo asíncrono de Tokens Restantes y $P_m$ (Presión de Memoria).
- [Turno 221-240] Definir formato de "System Interrupt Tokens" (ej. `<|soma_interrupt: pm=85%|>`).

### Turno 241-280: Inyección dinámica
- [Turno 241-260] Crear hook para inyectar la señal **como el próximo token a evaluar**, no modificando el historial previo.
- [Turno 261-280] Prompt engineering en la identidad del modelo para que sepa obedecer estas interrupciones sobre la marcha.

**Estimación total Fase 3**: 70-80 turnos.

---

## Fase 4: L3 Ultra-Rápido (RAG Dinámico)
**Objetivo**: Inyección de memoria a largo plazo a latencia sub-10ms.

### Turno 281-350: Integración Faiss -> Radix
*Nota: Retrasamos el Tensor Swapping directo en VRAM a favor de un RAG ultra optimizado en RAM inyectado dinámicamente.*
- [Turno 281-310] Mantener base vectorial HNSW en RAM.
- [Turno 311-330] Al detectar tool de `remember`, usar *Fork & Drop* para inyectar el contexto recuperado directamente en la atención activa.
- [Turno 331-350] Benchmark vs RAG tradicional.

**Estimación total Fase 4**: 60-70 turnos.

---

## 6. Resumen de Estimaciones Actualizado

| Fase | Objetivo | Turnos | Tiempo Real* |
|------|----------|--------|--------------|
| **Fase 1** | POC con streaming | 100-120 | 8-20 horas |
| **Fase 2** | Fork & Drop (Radix) | 80-100 | 7-16 horas |
| **Fase 3** | Somatic Clock (Cabeza) | 70-80 | 6-14 horas |
| **Fase 4** | L3 RAG Ultra-rápido | 60-70 | 5-12 horas |
| **TOTAL MVP** | Fases 1-3 | **250-300** | **21-50 horas** |
| **TOTAL Completo** | Fases 1-4 | **310-370** | **26-62 horas** |

*Tiempo real asume 5-10 min/turno con agente autónomo SOMA trabajando sobre el código.*

---

## 7. Requisitos Técnicos

### Hardware Mínimo
```
GPU: RTX 3090 / 4090 / Mac M2/M3 Max (24GB+ VRAM/RAM unificada)
CPU: 8+ cores
RAM: 32GB+
```

### Software
```
- Python 3.10+
- SGLang (fork propio, manipulando src/sglang/srt)
- faiss-cpu (para Fase 4)
- Modelos recomendados: Qwen 2.5 Coder (7B/14B) o Llama-3.1 8B (Tienen un CoT orgánico excelente para manipular)
```

---

## 8. Riesgos y Mitigaciones Actualizados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Fugas de memoria en RadixTree | Media | Alto | Forzar limpieza profunda del Garbage Collector de SGLang tras cada `drop`. |
| Modelo ignora interrupciones (Fase 3) | Alta | Medio | Reforzar el System Prompt (`<identity>`) con ejemplos *Few-Shot* de cómo reaccionar a un `[SYS_ALERT]`. |
| SGLang cambia su API interna | Alta | Medio | Fijar (pin) el commit exacto de SGLang en el que se basa el fork de SOMA. |

---

## 9. Próximos Pasos Inmediatos (El Arranque)

**Para el Agente SOMA Actual (Turnos 1-5):**
1. Ejecutar: `git clone https://github.com/sgl-project/sglang.git` en L4.
2. Explorar: Hacer un `grep` o `read_file` intensivo sobre `sglang/srt/managers/radix_cache.py` (o equivalente) para entender cómo el autor (LMSYS) gestiona la liberación de nodos.
3. El objetivo del turno 5 es tener un documento conceptual de cómo SGLang añade y borra tokens de su árbol.

---

**Documento generado**: 2026-03-10  
**Estrategia Arquitectónica**: SOMA v9 "White-box System 2"  
**Responsable**: Agente SOMA / Arquitecto Core