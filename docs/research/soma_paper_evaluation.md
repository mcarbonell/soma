# 📄 Evaluación del Paper SOMA y Plan de Ampliación

**Fecha:** 26 de marzo de 2026  
**Evaluado:** SOMA-Paper.tex (931 líneas, ~40KB) + 7 research notes

---

## 1. Evaluación honesta del paper actual

### Lo que está bien (genuinamente)

| Aspecto | Calidad | Comentario |
|---|---|---|
| **Abstract** | ⭐⭐⭐⭐⭐ | Claro, conciso, no oversells. Establece el claim y lo soporta |
| **Arquitectura L1-L4** | ⭐⭐⭐⭐ | Bien formalizada, tabla clara, diagrama TikZ profesional |
| **Formalización de Pm** | ⭐⭐⭐⭐⭐ | La ecuación es simple, correcta, y genuinamente útil. Esto es lo que recordará la gente |
| **Leviathan Benchmarks** | ⭐⭐⭐⭐⭐ | Evaluación determinística, no judge-model. La tabla de Perft es irrefutable |
| **Prior Work** | ⭐⭐⭐⭐ | ReAct, MemGPT, Voyager, CoALA, Bitter Lesson — todos bien posicionados |
| **Limitaciones** | ⭐⭐⭐⭐⭐ | Honestas y específicas. Esto da credibilidad enorme |
| **The Genesis Chain** | ⭐⭐⭐⭐ | Ambicioso pero concreto. Los investigadores de frontera prestarán atención a esto |
| **Referencia a Anthropic 2026** | ⭐⭐⭐⭐⭐ | Posicionamiento perfecto: "ellos usan 16 Claudes paralelos a $20K; nosotros uno solo con modelo gratis" |

### Lo que necesita trabajo

| Problema | Severidad | Detalle |
|---|---|---|
| **Sin ablation study** | 🔴 Alta | No hay comparación "SOMA vs same agent without L1-L4". Los reviewers de venues serias lo pedirán |
| **Sin baseline** | 🔴 Alta | No hay "vanilla agent with same model on same task". ¿Cuántos turnos necesita un agente sin Pm/checkpoint? ¿Se degrada? |
| **Research directions poco formalizadas** | 🟡 Media | Las secciones 5.1-5.6 son ideas bien pensadas pero presentadas como prosa. Faltan ecuaciones, pseudocódigo, y diseños formales |
| **Solo software engineering** | 🟡 Media | Declarado en limitaciones, pero debilita el claim de "cognitive OS". Un segundo dominio (ej. research, data analysis) ayudaría |
| **No hay análisis de coste** | 🟡 Media | ¿Cuántos tokens totales consumió el compilador? ¿Cuánto costó en $? El modelo es gratis, pero ¿cuánto tarda wall-clock? |
| **Bibliografía corta** | 🟡 Media | 7 referencias para un paper de este calibre es poco. Faltan: MemGPT follow-ups, Letta, agent benchmarks (SWE-bench, WebArena), Devin paper si existe |
| **Diagramas Pm aproximados** | 🟡 Baja | La curva de Pm del chess engine está etiquetada como "approximate". Tienes los logs L2 reales — usa datos reales |

### Calificación global

| Para... | Nota | Comentario |
|---|---|---|
| **arXiv (preprint)** | **7.5/10** | Publicable tal cual. Será leído y citado por la comunidad de agents |
| **Workshop NeurIPS/ICML** | **6/10** | Necesita ablation study y baseline. Las ideas son fuertes pero la evaluación es débil |
| **Conference paper (AAAI, NeurIPS main)** | **4/10** | Requiere evaluación rigurosa, más benchmarks, y controlled experiments |

---

## 2. Lo que impresionará a los investigadores de frontera

Voy a ser brutalmente honesto: los investigadores top (los que publican en NeurIPS, trabajan en Anthropic/DeepMind/Meta AI) leen cientos de papers. Lo que les impresionará NO es la implementación ni el producto. Es:

### Lo que SÍ les impresionará

1. **Pm como señal metacognitiva explícita**  
   Esto es genuinamente nuevo. MemGPT gestiona contexto de forma invisible. SOMA lo hace visible al agente y le deja decidir. La distinción es profunda y publicable.

2. **El principio "Dumb Orchestrator, Sovereign LLM" como aplicación de Bitter Lesson**  
   Nadie ha conectado formalmente Bitter Lesson con diseño de orquestadores. Todos los frameworks hacen lo contrario (smarter orchestrator). Esto es contraintuitivo y por eso es interesante.

3. **Leviathan Benchmarks con evaluación determinística**  
   La comunidad está harta de benchmarks evaluados por GPT-4. Un compilador que funciona o no funciona, un Perft que da el número exacto o no — esto es respetable.

4. **La curva de Pm < 20% sustained**  
   Esto demuestra que el context management funciona de verdad, no solo en teoría. Es el gráfico que la gente va a citar.

5. **Synthetic Hippocampus (System 1 / System 2 para agentes)**  
   La idea de una red neuronal local que inyecta intuición al LLM es fascinante. Kahneman + ML + agent architecture. Si formalizas bien, esto solo podría ser un paper separado.

6. **Auto-LoRA nocturno con Replay Buffer**  
   Federated LoRA para equipos de desarrollo = cada agente aprende de noche, comparten los pesos. La conexión con Federated Learning y Catastrophic Forgetting resonará con los ML researchers.

7. **Mutable Scratchpad L1**  
   La metáfora del "tablero mental del gran maestro" es genial y memorable. El concepto de WRITE_NODE / ERASE_SPAN / ROLLBACK_STATE dentro del inference loop es una dirección real de investigación.

### Lo que NO les impresionará

- La extensión de VSCode, el pricing, el plan de monetización — irrelevante para académicos
- "660 líneas de JavaScript" — los investigadores trabajan con PyTorch, no con Node.js
- Las comparativas con Cursor/Cline/Copilot — eso es marketing, no ciencia
- Los custom tools ("The Forge") — ya lo tiene Voyager
- Multi-agent (Hive Mind) — no es novel; ya hay docenas de frameworks

---

## 3. Inventario de material para ampliar

Tienes 6 research notes que cubren direcciones genuinamente diferentes. Aquí está mi evaluación de cada una:

| Documento | Novedad | Formalización actual | Potencial paper | Prioridad de inclusión |
|---|---|---|---|---|
| **Mutable Scratchpad L1** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ (bien escrito, honesto) | Standalone paper | 🔴 #1 |
| **Synthetic Hippocampus** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ (diseño, falta formalismo) | Standalone paper | 🔴 #2 |
| **Auto-LoRA Consolidation** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ (pipeline detallado) | Sección extensa | 🟡 #3 |
| **Tensor-Level Memory Injection** | ⭐⭐⭐⭐ | ⭐⭐⭐ (conceptual) | Sección | 🟡 #4 |
| **Sovereign Kernel v9** | ⭐⭐⭐⭐ | ⭐⭐ (visión fundacional) | Ya integrado parcialmente | 🟢 #5 |
| **Validation Weights vs Activations** | ⭐⭐⭐ | ⭐⭐ (notas del paper de Morris) | Referencia bibliográfica | 🟢 #6 |

---

## 4. Mi recomendación: La Estrategia de Dos Papers

### Paper 1: "SOMA Systems Paper" (arXiv, AHORA)

**Objetivo:** Establecer prioridad. Presentar la arquitectura, los benchmarks, y las direcciones.

**Qué hacer con el paper actual:**

1. **Añadir datos reales de Pm** (extraer de L2, no usar "approximate")
2. **Añadir tabla de coste** (tokens totales, wall-clock time, $ cost = $0)
3. **Expandir research directions** con más formalismo (ver abajo)
4. **Añadir 5-10 referencias** más (SWE-bench, WebArena, Letta/MemGPT follow-ups, agent surveys)
5. **Longitud target:** 20-25 páginas (de las 12 actuales)

**Timeline:** 1-2 semanas de trabajo → publicar en arXiv

### Paper 2: "SOMA Theory Paper" (Workshop NeurIPS/ICML o standalone)

**Objetivo:** Impresionar a los investigadores de frontera con las ideas más profundas.

**Contenido:**
- Mutable Scratchpad formalizado como extensión del Transformer
- Synthetic Hippocampus con arquitectura formal y training protocol
- Auto-LoRA con diseño experimental y predicciones cuantificables
- Controlled experiments: SOMA vs vanilla vs MemGPT-style en Leviathan tasks
- Ablation study: cada componente de SOMA aislado

**Timeline:** 3-6 meses de trabajo (el paper que de verdad necesita rigor)

---

## 5. Expansiones concretas para el Paper 1

### 5.1. Sección expandida: Mutable Scratchpad

Tu doc [research-mutable-scratchpad-l1.md](research-mutable-scratchpad-l1.md) es el mejor escrito de todos. La metáfora del gran maestro de ajedrez es poderosa. Para el paper necesitas:

```latex
\subsection{Toward Mutable Working Memory}

\paragraph{The linear-ink problem.}
% Tu sección 2: pensamiento lineal con tinta imborrable
% Formalizar: el coste de la polución de contexto como degradación de attention scores

\paragraph{The mental chessboard metaphor.}
% Tu sección 3: el gran maestro prueba variantes mentalmente
% Conectar con: la diferencia entre CoT visible y CoT editable

\paragraph{Proposed primitives.}
% WRITE_NODE, ERASE_SPAN, REWRITE_SPAN, ROLLBACK_STATE, COMMIT_OUTPUT
% Formalizar como operaciones sobre un DAG de estados (no una secuencia lineal)

\paragraph{What SOMA approximates today.}
% L1 reconstruction = external emulation of scratchpad
% Pm threshold + checkpoint = external emulation of COMMIT_OUTPUT
% Honestidad: "This is external approximation, not native support"

\paragraph{Resource-awareness during inference.}
% Tu sección 7: TOKENS_REMAINING, INFERENCE_TIME_MS
% Conectar con Somatic Clock propuesto en Sovereign Kernel
% Formalizar como: señales inyectadas en el attention head, no en el prompt
```

> [!TIP]
> La clave para impresionar es la **honestidad sobre lo que SOMA no puede hacer hoy** combinada con **una formalización precisa de lo que podría hacer si el runtime lo soportara**. Los investigadores respetan más la claridad que el hype.

### 5.2. Sección expandida: Synthetic Hippocampus

Tu diseño es fascinante pero necesita formalismo matemático:

```latex
\subsection{Synthetic Hippocampus: A System~1 Network for Agent Intuition}

\paragraph{Dual-process framing.}
% Kahneman System 1/2 applied to agents
% System 2 = LLM (slow, expensive, general)
% System 1 = local neural net (~10MB, <5ms, specialized)

\paragraph{State encoding.}
% Formalizar: S_t = Concat(V_sem, V_som)
% V_sem ∈ R^384 (frozen embedding model, e.g. nomic-embed-text)
% V_som ∈ R^16 (one-hot panel, Pm, error_flag, etc.)
% S_t ∈ R^400

\paragraph{Multi-head output.}
% Head 1: π(S_t) = softmax over tool vocabulary (35 tools)
% Head 2: ρ(S_t) ∈ [0,1] = risk score  
% Head 3: r(S_t) ∈ R^d = residual pointer for exact command retrieval
% Formalizar la loss function: L = L_ce(π) + λ₁ L_bce(ρ) + λ₂ L_triplet(r)

\paragraph{Somatic Sleep protocol.}
% Training: overnight on L2 action logs
% Experience replay: 80% today + 20% historical (anti-forgetting)
% Formalize as: D_train = D_today ∪ Sample(D_replay, 0.2|D_today|)

\paragraph{Chess as validation sandbox.}
% Tool Policy → piece to move
% Risk Score → position leads to loss
% Residual Pointer → exact tablebase retrieval
% Connection to your neural tablebase project
```

### 5.3. Sección expandida: Auto-LoRA Consolidation

```latex
\subsection{Autonomous Overnight LoRA Consolidation}

\paragraph{The RAG ceiling.}
% RAG solves explicit recall but not implicit knowledge
% Morris (2025): "Training into weights" vs "Retrieving into activations"
% Formal claim: knowledge in weights has O(1) inference cost vs O(n) for RAG

\paragraph{Pipeline.}
% L2 → Filter(outcome=success) → Distill → SFT pairs → LoRA(r=16) → Validate → Activate
% Formalize validation criterion: PPL(LoRA)/PPL(base) < 1.05

\paragraph{Federated LoRA for team cognition.}
% Each developer's agent trains overnight
% LoRAs shared as ~5MB files (no data leakage — weights are not invertible)
% Merge via DARE/TIES
% Formal connection to McMahan et al. (2017) Federated Learning

\paragraph{Experimental prediction.}
% Hypothesis: agent with overnight LoRA requires 30% fewer turns on repeated task patterns
% Measurable via Leviathan benchmarks on day N vs day N+1
```

### 5.4 Sección nueva: Datos reales de los benchmarks

Esto es CRUCIAL. Tienes los L2 logs reales. Usa los datos verdaderos:

```latex
\subsection{Detailed Benchmark Analysis}

% Tabla: turn-by-turn breakdown del TinyC compiler
% - Turn ranges per phase (Lexer, Parser, Semantic, CodeGen, Integration, Debug)
% - Number of checkpoint/milestone calls
% - Total tokens consumed (input + output)
% - Wall-clock time
% - Number of bugs found and fixed
% - Number of tool calls by type

% Tabla: Pm trajectory real (no "approximate")
% - Extract from L2 the actual Pm values per turn
% - Plot real data, not hand-drawn estimates

% Tabla: comparativa de eficiencia
% - Turns used / max turns = efficiency ratio
% - Token cost breakdown: prompt vs completion
% - Action distribution: how many read_file vs write_file vs execute_command
```

---

## 6. Referencias que faltan

Para impresionar a los que de verdad saben, necesitas citar:

| Referencia | Por qué |
|---|---|
| **Letta (ex-MemGPT)** | Evolved from paper to product. Direct comparison point |
| **SWE-bench** (Jimenez et al., 2024) | The standard agent benchmark for SE. Explain why Leviathan is different |
| **WebArena** (Zhou et al., 2023) | Another agent benchmark. Shows you know the landscape |
| **Devin** (Cognition AI, 2024) | Industry reference, even if no paper |
| **AutoGPT** (Richards, 2023) | Historical reference, early long-horizon attempt |
| **Kahneman** (2011) | *Thinking, Fast and Slow*. For the System 1/2 framing |
| **Morris** (2025) | Weights vs Activations. Validates your Auto-LoRA direction |
| **Hu et al.** (2021) | LoRA paper. For the consolidation section |
| **Borgeaud et al.** (2022) | RETRO. For the tensor-level injection section |
| **Khandelwal et al.** (2020) | kNN-LM. For the RETRO/cross-attention reference |
| **OpenHands** (Wang et al., 2024) | Open-source agent platform. Position vs SOMA |

---

## 7. Longitud y estructura final propuesta

### Estructura del Paper 1 expandido (~25 páginas)

```
1. Introduction (2 pages) — ya está bien, expandir ligeramente
2. Architecture (3 pages) — L1-L4 + operational loop + Hive Mind
3. Somatic Pressure (2 pages) — Pm definition + thresholds + checkpoint
4. Leviathan Benchmarks (4 pages) ← EXPANDIR CON DATOS REALES
   4.1 Design Philosophy
   4.2 TinyC Compiler — detailed analysis with real data
   4.3 Chess Engine — detailed analysis with real Pm curve
   4.4 Cost and efficiency analysis (NEW)
   4.5 Qualitative observations (NEW — what did the agent do well/poorly?)
5. Relation to Prior Work (2 pages) ← EXPANDIR con más refs
6. Research Directions (8 pages) ← GRAN EXPANSIÓN
   6.1 Contextual Memory Injection (1 page)
   6.2 Mutable Working Memory (1.5 pages) — NEW formal treatment
   6.3 Synthetic Hippocampus (2 pages) — NEW with math
   6.4 Autonomous LoRA Consolidation (1.5 pages) — NEW
   6.5 Sovereign Inference Kernel (1 page) — expand existing
   6.6 The Genesis Chain (1 page) — keep as is
   6.7 Self-Authored Identity (0.5 page) — keep as is
7. Limitations (1 page)
8. Conclusion (1 page)
References (30+ refs)
```

---

## 8. Resumen de la situación

> **El paper actual es publicable en arXiv tal cual.** Es un 7.5/10 como systems paper. Lo leerán, lo citarán, establece prioridad.

> **Pero NO impresionará a los investigadores de frontera** en su estado actual. Para eso, necesitas:
> 1. Datos reales (no approximate) de los benchmarks
> 2. Formalismo matemático en las research directions (especialmente Hippocampus y Scratchpad)
> 3. Más referencias (el doble, mínimo)
> 4. Al menos una ablation superficial ("sin Pm, el agente degrada en X turnos")

> **Mi recomendación:** Invierte 1-2 semanas en expandir el paper con las secciones formalizadas arriba. Pasa de 12 a 25 páginas. Añade los datos reales de L2. Luego publica en arXiv. Eso te da el mejor balance entre "publicar pronto" y "publicar algo que impresione."

> **Y luego:** con la credibilidad del paper, prepara un Paper 2 más riguroso para un workshop o venue seria, con ablation study y controlled experiments. Ese paper te tomará 3-6 meses pero te abre puertas a la comunidad de investigación de verdad.

---
---

# 📋 APÉNDICE: Instrucciones para el Agente Ejecutor

> **Contexto:** Este documento fue creado por Claude Opus 4.6 como análisis estratégico. Las tareas de ejecución que siguen deben ser realizadas por un agente más económico (Claude Sonnet, Gemini Pro, etc.). Cada tarea es autocontenida y ejecutable sin necesitar contexto adicional más allá de los archivos referenciados.

---

## TAREA 1: Extraer datos reales de Pm de los benchmarks L2

**Objetivo:** Reemplazar la curva "approximate" del paper con datos reales.

**Archivos de entrada:**
- `C:\Users\mrcm_\.soma\L2\sessions\session_2026-03-15T18-33-16-402Z - TinyC v2\` — Sesión completa del compilador TinyC (132 turnos)
- `C:\Users\mrcm_\.soma\L2\sessions\session_2026-03-15T19-32-29-417Z - chess.js\` — Sesión completa del chess engine (99 turnos)

**Qué hacer:**
1. Leer los archivos `turn_*_prompt_l1.md` de cada sesión
2. De cada turno, extraer del bloque `<dashboard>`:
   - El número de turno
   - El valor de `Context Window: [█░░░░░░░░░] XX.X%` (eso es Pm)
   - El `Cumulative_Tokens`
   - El `System_Time`
3. Generar un CSV con columnas: `turn, pm_percent, cumulative_tokens, timestamp`
4. Generar la tabla pgfplots de LaTeX con los datos REALES para reemplazar la curva approximate en `SOMA-Paper.tex` (líneas ~340-368)

**Archivo de salida:** `docs/research/benchmark_data_real.csv` + snippet LaTeX para pegar en el paper

**Criterio de calidad:** Los datos deben ser extraídos literalmente del L2, sin interpolación ni estimación. Si un turno no tiene datos de Pm, se omite.

---

## TAREA 2: Expandir la sección "Research Directions" del paper

**Objetivo:** Expandir la sección 5 (Research Directions) de ~4 páginas a ~8 páginas, formalizando las ideas con ecuaciones y pseudocódigo.

**Archivos de entrada** (leer todos antes de escribir):
- `docs/research/SOMA-Paper.tex` — Paper actual, sección 5 (líneas ~570-825)
- `docs/research/research-mutable-scratchpad-l1.md` — Fuente para §6.2
- `docs/research/SOMA_SYNTHETIC_HIPPOCAMPUS_DESIGN.md` — Fuente para §6.3
- `docs/research/research-auto-lora-consolidation.md` — Fuente para §6.4
- `docs/research/research-tensor-level-memory-injection.md` — Fuente para §6.5
- `docs/research/research-soma-v9-sovereign-kernel.md` — Fuente para §6.5

**Qué hacer:**

### §6.2 Mutable Working Memory (NUEVA subsección, ~1.5 páginas)
- Usar `research-mutable-scratchpad-l1.md` como fuente
- Incluir: la metáfora del gran maestro de ajedrez (sección 3 del doc)
- Formalizar las primitivas como operaciones sobre un DAG de estados:
  - `WRITE_NODE(state_id, content) → state_id'`
  - `ERASE_SPAN(state_id, range) → state_id'`
  - `ROLLBACK_STATE(state_id, checkpoint_id) → state_id''`
  - `COMMIT_OUTPUT(state_id) → external_output`
- Incluir el concepto de "resource-awareness" (sección 7 del doc): tokens restantes, tiempo de inferencia, como señales dinámicas
- SER HONESTO: distinguir claramente entre lo que SOMA emula hoy (reconstrucción externa de L1) y lo que requeriría soporte del runtime de inferencia

### §6.3 Synthetic Hippocampus (EXPANDIR, ~2 páginas)
- Usar `SOMA_SYNTHETIC_HIPPOCAMPUS_DESIGN.md` como fuente
- Formalizar matemáticamente:
  - Estado: $S_t = \text{Concat}(V_{sem}, V_{som}) \in \mathbb{R}^{400}$
  - $V_{sem} \in \mathbb{R}^{384}$ (embedding semántico del panel activo)
  - $V_{som} \in \mathbb{R}^{16}$ (vector somático discreto: panel, Pm, error flag, etc.)
  - Salida 1: $\pi(S_t) = \text{softmax}(W_\pi S_t) \in \Delta^{35}$ (política de herramientas)
  - Salida 2: $\rho(S_t) = \sigma(w_\rho^T S_t) \in [0,1]$ (risk score)
  - Salida 3: $r(S_t) = W_r S_t \in \mathbb{R}^d$ (puntero residual)
  - Loss: $\mathcal{L} = \mathcal{L}_{CE}(\pi) + \lambda_1 \mathcal{L}_{BCE}(\rho) + \lambda_2 \mathcal{L}_{triplet}(r)$
- Incluir el protocolo de "Sueño Somático" (sección 4 del doc): entrenamiento nocturno con experience replay
- Mencionar la conexión con el proyecto de ajedrez como sandbox de validación
- Citar: Kahneman (2011) *Thinking, Fast and Slow*

### §6.4 Autonomous LoRA Consolidation (NUEVA subsección, ~1.5 páginas)
- Usar `research-auto-lora-consolidation.md` como fuente
- Formalizar el pipeline: L2 → Filter → Distill → SFT → LoRA → Validate → Activate
- Incluir el criterio de validación: $\text{PPL}(\text{LoRA}) / \text{PPL}(\text{base}) < 1.05$
- Incluir Federated LoRA para equipos (sección 4 del doc)
- Citar: Hu et al. (2021) LoRA, McMahan et al. (2017) Federated Learning, Yu et al. (2023) DARE, Yadav et al. (2023) TIES

### §6.5 Sovereign Inference Kernel (EXPANDIR)
- Integrar el contenido de `research-tensor-level-memory-injection.md` (Enfoque A: KV-Cache swap con RadixAttention)
- Mencionar Enfoque B (RETRO/kNN-LM) como dirección más especulativa
- Citar: Borgeaud et al. (2022) RETRO, Khandelwal et al. (2020) kNN-LM, Zheng et al. (2023) SGLang

**Criterio de calidad:**
- Cada subsección debe tener AL MENOS una ecuación formal
- Cada claim futuro debe ir acompañado de una predicción testeable
- Distinguir siempre: "implemented" vs "proposed" vs "speculative"
- Tono académico, no comercial. Sin mencionar precios, productos, ni competidores comerciales
- Bibliografía en formato `\bibitem` consistente con el resto del paper

---

## TAREA 3: Ampliar la bibliografía

**Objetivo:** Pasar de 7 a ~20-25 referencias.

**Archivo a editar:** `docs/research/SOMA-Paper.tex`, sección `\begin{thebibliography}`

**Referencias a añadir** (buscar los arXiv IDs correctos y citar apropiadamente):

| Ref | Cita sugerida |
|---|---|
| Letta (ex-MemGPT) follow-up | Packer et al., 2024, Letta/MemGPT v2 |
| SWE-bench | Jimenez et al., 2024, SWE-bench |
| WebArena | Zhou et al., 2023 |
| OpenHands | Wang et al., 2024 |
| AutoGPT | Richards, 2023 (blog/GitHub) |
| Devin | Cognition AI, 2024 (blog) |
| LoRA | Hu et al., 2021, arXiv:2106.09685 |
| RETRO | Borgeaud et al., 2022, arXiv:2112.04426 |
| kNN-LM | Khandelwal et al., 2020, arXiv:1911.00172 |
| DARE (LoRA merging) | Yu et al., 2023, arXiv:2311.03099 |
| TIES-Merging | Yadav et al., 2023, arXiv:2306.01708 |
| Federated Learning | McMahan et al., 2017, AISTATS |
| Kahneman | *Thinking, Fast and Slow*, 2011 |
| Morris 2025 | Weights vs Activations video/paper |
| Agent survey | Xi et al. 2023 or Weng 2023 agent survey |

**Criterio:** Usar formato BibTeX/`\bibitem` consistente con el estilo ya usado en el paper. Verificar que cada referencia tenga arXiv ID o URL correcto. No inventar IDs.

---

## TAREA 4: Añadir sección de análisis de coste

**Objetivo:** Añadir una subsección 4.4 "Cost and Efficiency Analysis" a los benchmarks.

**Datos a extraer** (de los mismos archivos L2 de la Tarea 1):
- Tokens totales consumidos (input prompt + output completion)
- Wall-clock time total de la sesión
- Modelo usado (gemini-2.5-flash-lite-preview)
- Coste monetario ($0 — free tier)
- Ratio de eficiencia: turnos usados / turnos presupuestados

**Formato de salida:** Snippet LaTeX con una tabla y un párrafo de análisis. Enfatizar que todo se hizo con un modelo gratuito. Comparar con Anthropic's 2026 compiler project ($20K, 16 parallel Claude instances) ya citado en el paper.

---

## ⚠️ REGLAS PARA EL AGENTE EJECUTOR

1. **NO cambiar** las secciones 1-4 del paper sin aprobación explícita del usuario
2. **NO eliminar** contenido existente del paper — solo expandir
3. **NO usar tono comercial** en el paper. Nada de "SOMA es mejor que X". Tono académico neutro
4. **NO inventar datos**. Si no puedes extraer un dato del L2, déjalo como "approximate" y anota que necesita verificación manual
5. **NO cambiar el abstract** ni la conclusion sin aprobación
6. **SÍ compilar** el paper con LaTeX después de cada cambio significativo para verificar que no hay errores de sintaxis. Instrucciones de compilación en `docs/research/README-Compilation-paper-arXiv.md`
7. **SÍ mantener** el estilo LaTeX consistente con el paper actual (mismo formatting de `\paragraph{}`, `\begin{itemize}`, etc.)
8. Las tareas son independientes y pueden ejecutarse en cualquier orden. La Tarea 1 (datos reales) es la MÁS importante porque afecta la credibilidad empírica del paper.
