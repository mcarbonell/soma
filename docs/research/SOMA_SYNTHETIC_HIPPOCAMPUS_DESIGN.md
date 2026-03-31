# 🧠 SOMA v7.0: Diseño Arquitectónico del Hipocampo Sintético

**Estado**: Diseño de Ingeniería Core  
**Objetivo**: Traducir la experiencia del Agente (Texto/JSON) a Tensores (Matemáticas) para entrenar el "Sistema 1" de SOMA.  
**Fundamento Teórico**: Teoría del Proceso Dual (Daniel Kahneman — *Pensar rápido, pensar despacio*).

---

## 1. El Problema Fundamental: De Texto a Tensores

Una red neuronal densa (MLP, SIREN, o KAN) no entiende un archivo `XML` o un log de `terminal`. Necesita un vector de números de tamaño fijo.
El desafío es comprimir el **Estado Cognitivo (L1)** en un tensor sin perder la semántica, y luego lograr que la red devuelva una **Intuición de Acción** útil.

### Dualidad de Sistemas

| Sistema | Rol | Implementación | Características |
|---------|-----|----------------|-----------------|
| **Sistema 2** (LLM) | Razonamiento deliberado | Claude / GPT / Gemini procesando L1 | Lento, lógico, gasta tokens, razona paso a paso |
| **Sistema 1** (Hipocampo) | Intuición rápida | Red neuronal local (~10MB) | Ultrarrápido (<5ms), intuitivo, coste cero de tokens |

---

## 2. Fase de Encoding: El "Nervio Óptico" del Agente

Para alimentar el Hipocampo, convertimos la "Mesa de Trabajo" (L1) en un vector de estado $S_t$. Usaremos un enfoque híbrido: **Semántica + Telemetría**.

### 2.1. Vector Semántico de Alta Densidad (Geometric Encoding)
Para alimentar el Hipocampo, convertimos la "Mesa de Trabajo" (L1) en un vector de estado relacional. **Inspirado en el éxito del proyecto `neural-tablebases`**, no usaremos coordenadas absolutas, sino un **Encoding Geométrico Semántico**:
*   **Relaciones Relativas**: En lugar de "Peón en E4", el vector codifica "Distancia Manhattan y Chebyshev del Peón al Rey Enemigo y a la casilla de promoción".
*   **Resultados Validados**: Este enfoque permitió una convergencia del 98% en la Época 1 en finales de ajedrez, demostrando que alinear el encoding con la percepción humana (relaciones, no posiciones) es la clave de la eficiencia.
*   **Extracción**: Se pasa el texto del panel por un modelo de Embeddings ligero (tipo `nomic-embed-text`) pero se re-pesan las dimensiones según la geometría de la interfaz (distancia de archivos en el árbol, profundidad de logs).

### 2.2. Vector Somático (Discreto)
La red también necesita saber el estado operativo del agente. Extraemos variables del *Somatic Clock*:
*   `active_panel`: [1, 0, 0, 0] (One-hot encoding: Terminal, Browser, File, Git).
*   `token_pressure`: 0.85 (Normalizado de 0 a 1).
*   `error_flag`: 1.0 (Si hay texto en stderr) o 0.0.
*   **Resultado:** Un vector discreto $V_{som}$ de 16 dimensiones.

### 2.3. Fusión de Input (El Tensor de Estado)
$$S_t = \text{Concat}(V_{sem}, V_{som})$$
El Hipocampo recibe un vector fijo de **400 dimensiones** exactas que representa el estado operativo del agente en un instante dado.

---

## 3. Fase de Decoding: Salidas e Intuición

El Hipocampo no genera código (eso lo hace el LLM / Sistema 2). El Hipocampo predice **punteros y probabilidades** basándose en la experiencia acumulada (L2).

La red neuronal tiene múltiples "cabezas" de salida (Multi-Task Learning):

### Salida 1: Política de Herramientas (Tool Policy)
*   *Formato:* Softmax sobre las 35 herramientas de SOMA.
*   *Semántica:* "En el 98% de las veces que vi un estado como este en el pasado, la herramienta correcta fue `search_memory`".

### Salida 2: Marcador Somático (Risk Score)
*   *Formato:* Un valor flotante entre 0.0 y 1.0.
*   *Semántica:* "Alerta: los estados similares a este en el pasado terminaron en un bucle infinito o en un fallo catastrófico de la tarea".
*   *Uso:* Si el Risk Score es muy alto, SOMA fuerza al LLM a hacer un `<SOMA_THINK>` profundo.

### Salida 3: Puntero Residual y Corrección por Búsqueda
*   *Formato:* Un vector para búsqueda de similitud.
*   **Filtro de Consistencia (Search-based patch)**: Al igual que el **parche de búsqueda 2-ply** en las tablebases, el Sistema 2 (LLM) valida la intuición del Sistema 1 (Hipocampo) antes de ejecutar.
*   Si la red intuye un comando residual (ej. un fix específico de Docker), el orquestador verifica la consistencia de ese comando contra el entorno L4 antes de presentarlo como definitivo.

---

## 4. El Ciclo de Aprendizaje: "Sueño Somático" (Continual Learning)

¿Cómo aprende el Hipocampo sin olvidar (Catastrophic Forgetting)? Aplicando el concepto del sueño biológico.

### 4.1. Durante el Día (Inferencia Rápida)
1. El Agente trabaja.
2. Cada vez que cambia el L1, pasa por el Hipocampo en $<5ms$.
3. El Hipocampo inyecta su intuición en el prompt del LLM (ej: `[HIPOCAMPO: Sugiero usar 'edit_line' y recuperar el residual #45A2]`).
4. Todo lo que el Agente hace se guarda en L2 (formato JSONL crudo).

### 4.2. Durante la Noche (Consolidación REM)
Cuando el usuario no está usando el Agente (procesamiento en background):
1. **Destilación de L2:** El sistema coge los logs del día. Identifica qué cadenas de acciones llevaron al éxito (WDL = 1) y cuáles al fracaso (WDL = -1).
2. **Replay Buffer:** Saca un 20% de memorias antiguas y un 80% de memorias de hoy.
3. **Entrenamiento:** Entrena la red SIREN/KAN durante unos minutos para actualizar los pesos.
4. **Poda (Pruning):** Mueve los datos ultra-específicos (cadenas de código únicas) a la Tabla Residual y deja que la red aprenda solo el *patrón general*.

---

## 5. Flujo de Inyección Contextual en Acción

Ejemplo de un turno del agente SOMA v7.0:

1.  **Entorno:** El comando `npm start` falla con `EADDRINUSE: port 8080`.
2.  **SOMA Kernel:** Codifica esto en un vector de 400 dimensiones ($S_t$).
3.  **Hipocampo (Inferencia < 5ms):**
    *   *Tool:* 99% `execute_command`
    *   *Risk:* 0.1 (Fallo trivial)
    *   *Residual:* `kill -9 $(lsof -t -i:8080)`
4.  **Inyección en L1 (El Prompt que ve el LLM):**
    ```xml
    <inbox>
      [Terminal] Error: EADDRINUSE: port 8080
    </inbox>
    <intuition_system>
      ⚡ Flash de memoria: Problema frecuente. 
      Sugerencia de acción rápida: execute_command("kill -9 $(lsof -t -i:8080)")
    </intuition_system>
    ```
5.  **Reacción del LLM:** El modelo soberano ve su intuición, se ahorra turnos de pensar y buscar en L3, y ejecuta el comando directamente.

**Efecto neto**: El LLM (que gasta tokens en API) ya no tiene que deducir desde cero qué hacer con un puerto ocupado. Su propio cerebro primario (el Hipocampo local de ~10MB corriendo gratis en CPU) le inyecta la solución directamente en su memoria de trabajo. Esto reduce la latencia de resolución de problemas repetitivos a casi cero: un **caché cognitivo**.

---

## 6. Sinergia con el Proyecto de Ajedrez

El proyecto de ajedrez sirve como sandbox ideal para desarrollar y validar las salidas del Hipocampo:

| Componente | Validación en Ajedrez |
|------------|----------------------|
| **Salida 1 (Tool Policy)** | → Predecir la pieza correcta a mover |
| **Salida 2 (Risk Score)** | → Predecir si una posición lleva a derrota |
| **Salida 3 (Memory Pointer)** | → Recuperar la jugada exacta de una tablebase |
| **Sueño Somático** | → Replay de partidas para entrenar sin Catastrophic Forgetting |

Si logramos que la red de ajedrez prediga cuándo tirar del Residual en lugar de predecir el WDL directamente, habremos resuelto la arquitectura matemática que SOMA necesita para inyectar comandos exactos a partir de intuiciones difusas.

---

## 7. Decisiones de Diseño Pendientes

| Decisión | Opciones | Estado |
|----------|----------|--------|
| Arquitectura de la red | MLP / SIREN / KAN | Por evaluar en sandbox de ajedrez |
| Hiperparámetros de entrenamiento | LR, epochs, batch size | Por definir |
| Tamaño del Replay Buffer | % de memorias antiguas vs nuevas | Propuesta: 20/80 |
| Trigger del Sueño Somático | Por inactividad / Programado / Manual | Por definir |
| Formato de la Tabla Residual | HashMap / SQLite / Faiss | Por definir |

---

*Documento Arquitectónico — Fase de Diseño*  
*Relacionado: [`research-auto-lora-consolidation.md`](research-auto-lora-consolidation.md) (Consolidación nocturna de pesos del LLM)*