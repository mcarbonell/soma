# 🧠 SOMA + Neural Tablebases: El Hipocampo Sintético

## 1. Visión: De la Memoria "Base de Datos" a la Memoria "Sináptica"

Este documento propone un puente arquitectural entre el sistema de memoria soberana de **SOMA** y la tecnología de compresión funcional de las **Neural Tablebases**. 

La tesis central es que un Agente Inteligente no debería "consultar una base de datos" para recordar su pasado, sino que debería poseer una **función interna (red neuronal)** que codifique su experiencia. Al igual que el cerebro biológico, los recuerdos no son archivos en un disco, sino **pesos en una red**.

---

## 2. L2: Memoria Episódica como Tablebase

En la arquitectura SOMA actual, L2 es un registro inmutable (JSONL) de pares Entrada/Salida.
- **Limitación actual:** Crecimiento lineal. Con el tiempo, buscar en L2 se vuelve lento y consume muchos tokens (RAG).
- **Propuesta Tablebase:** El historial de acciones del agente se convierte en el dataset de entrenamiento para una red **SIREN** o **KAN** (el "Hipocampo Sintético").

**Mapeo de Funciones L2:**
$$f(\text{Contexto\_L1}_{t}) \rightarrow \text{Acción}_{t}$$

La red "memoriza" (overfitting perfecto) miles de turnos de experiencia. Para el agente, "recordar" una acción pasada es simplemente **disparar una inferencia** en esta red compacta de ~10MB.

---

## 3. L3: El Mapa Neuronal de Conocimiento (NKM)

L3 (Conocimiento Consolidado) deja de ser una colección de archivos Markdown para convertirse en un **Neural Knowledge Map**.

| Tipo de Conocimiento | Formato SOMA Tradicional | Formato Neural Tablebase |
|----------------------|--------------------------|--------------------------|
| Arquitectura del Proyecto | `project.md` (Texto) | Función de mapeo estructural |
| Reglas de Código | `identity.md` (Reglas) | Pesos de red (Heurísticas) |
| Historial de Bugs | `bugs.json` (Lista) | Funciones de "excepción/verdad" |

**Ventaja:** El agente puede "cargar" una red específica para un proyecto y obtener **precisión del 100%** sobre dónde está cada componente y cómo interactúan, eliminando alucinaciones típicas del RAG.

---

## 4. Inyección Contextual por Activación Neuronal

Integrando la propuesta de **Contextual Memory Injection**, el proceso deja de ser una "búsqueda semántica" para ser una **activación reactiva**:

1.  **Input de Contexto:** El orquestador extrae el contexto actual (Archivo abierto, Error en consola, Tarea).
2.  **Disparo Sináptico:** Este contexto se inyecta como entrada a la Neural Tablebase del agente.
3.  **Descarga en L1:** La red "descarga" instantáneamente en L1 los recuerdos pertinentes con una confianza del 100%.

Este proceso es **biomimético**: el entorno activa el recuerdo automáticamente, sin que el agente tenga que "querer" recordar.

---

## 5. Escala y Densidad de Información

Aplicando el **Teorema de Compresión de Kolmogorov**, la experiencia de un agente tiene una estructura lógica que permite una densidad de información masiva:

- **Dataset**: 1 millón de turnos de diálogo/acción (~10GB de JSONL).
- **Compresión Neural**: Red de 10MB (Int8).
- **Factor de Generalización ($\Gamma$):** Un solo patrón de "corregir bug de importación" explica miles de entradas de L2.
- **Resultado:** El agente posee **memoria infinita** en un espacio de memoria constante.

---

## 6. Roadmap SOMA v7.0: "The Synthetic Brain"

1.  **Fase 1 (Proof of Concept):** Entrenar una red SIREN para memorizar 1,000 turnos de un log de SOMA (L2) con 100% de precisión.
2.  **Fase 2 (Integration):** Implementar la herramienta `soma.neural_recall()` que sustituya o complemente a `search_memory()`.
3.  **Fase 3 (Project Maps):** Generar "Neural Tablebases" de repositorios completos para que el agente tenga conocimiento perfecto del código (L4) inyectado en su mente (L3).

---
*"No es que el agente tenga una base de datos en su disco; es que el agente ES la función de verdad de su propia historia."*

**Documento Puente v1.0**
**Fecha**: 2026-03-10
**Relación**: SOMA + Neural Tablebases + Contextual Injection
