# 📦 Configuración del Repo Público SOMA

**Fecha:** 31 de marzo de 2026  
**Objetivo:** Crear repositorio público `mcarbonell/soma` para el paper de arXiv  
**Estado:** Pendiente de creación

---

## 🎯 Estrategia de Repositorios

### Arquitectura de 3 Niveles

```
┌────────────────────────────────────────────────────────────┐
│  mcarbonell/soma (PÚBLICO - Nuevo)                         │
│  ├─ Paper de arXiv + documentación académica               │
│  ├─ Research docs (diseños, propuestas, visiones)          │
│  ├─ Benchmarks Leviathan (especificaciones)                │
│  └─ Enlace a soma-lite como "reference implementation"     │
└────────────────────────────────────────────────────────────┘
                              ↓ enlaza a
┌────────────────────────────────────────────────────────────┐
│  mcarbonell/soma-lite (PÚBLICO - Ya existe)                │
│  ├─ Implementación minimalista (~700 LOC)                  │
│  ├─ Zero dependencies                                      │
│  ├─ Publicado en npm                                       │
│  └─ Benchmarks ejecutables                                 │
└────────────────────────────────────────────────────────────┘
                              ↓ NO incluye
┌────────────────────────────────────────────────────────────┐
│  Workspace Privado (TU ORDENADOR)                          │
│  ├─ SOMA completo v11.0+                                   │
│  ├─ IDE suite, browser tools, git panel                    │
│  ├─ Features avanzados (v9, v10, v11)                      │
│  └─ Código propietario no público                          │
└────────────────────────────────────────────────────────────┘
```

---

## 📋 Paso a Paso: Creación del Repo Público

### Paso 1: Crear Repositorio en GitHub

1. Ir a https://github.com/new
2. **Repository name:** `soma`
3. **Description:** 
   ```
   SOMA: Sovereign Operative Memory Architecture — A Cognitive Operating System for Long-Horizon Autonomous Agents
   ```
4. **Visibility:** ✅ Public
5. **Initialize with:**
   - [x] Add a README file
   - [ ] Add .gitignore (déjalo vacío inicialmente)
   - [ ] Choose a license (MIT recomendado)
6. Click **"Create repository"**

---

### Paso 2: Estructura de Archivos del Repo

El repo público contendrá:

```
soma/
├── README.md                      ← Landing page del proyecto
├── LICENSE                        ← MIT License
├── CITATION.cff                   ← Citación académica
├── docs/
│   ├── research/                  ← TODOS los research docs
│   │   ├── SOMA-Paper.tex         ← Paper fuente
│   │   ├── SOMA-Paper.pdf         ← PDF compilado
│   │   ├── research-*.md          ← Todos los docs de investigación
│   │   ├── chess/                 ← Chess research docs
│   │   └── *.md                   │  (todos los demás docs)
│   ├── strategy/                  ← Docs estratégicos (opcionales)
│   │   ├── soma_strategic_analysis.md
│   │   ├── soma_strategic_pivot.md
│   │   └── SOMA_PRODUCT_SPECS.md
│   └── proposals/                 ← Propuestas implementables
│       └── CONTEXTUAL_MEMORY_INJECTION.md
├── benchmarks/
│   ├── run-benchmarks.js          ← Benchmark runner
│   ├── suites/
│   │   ├── leviathan.js           ← Definición Leviathan benchmarks
│   │   └── ...
│   └── templates/
│       └── ...
└── soma-lite/                     ← Submodule o enlace
    └── README.md                  ← Explica que está en repo separado
```

---

### Paso 3: Contenido del README Principal

```markdown
# SOMA: Sovereign Operative Memory Architecture

[![arXiv](https://img.shields.io/badge/arXiv-XXXX.XXXXX-brightgreen.svg)](https://arxiv.org/abs/XXXX.XXXXX)
[![npm](https://img.shields.io/npm/v/soma-lite.svg)](https://www.npmjs.com/package/soma-lite)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A cognitive operating system for long-horizon autonomous agents**

---

## 📖 Overview

SOMA (Sovereign Operative Memory Architecture) is a four-layer cognitive architecture 
for autonomous agents that enables long-horizon task completion through:

- **L1**: Bounded working attention with explicit context management
- **L2**: Immutable episodic record (audit trail)
- **L3**: Sovereign persistent knowledge (cross-session memory)
- **L4**: Environment grounding (IDE, browser, terminal, git)

Key innovation: **Somatic Pressure ($P_m$)**, an explicit prompt-occupancy signal 
that allows the agent to self-regulate context saturation.

## 🏆 Benchmarks

Leviathan benchmarks demonstrate SOMA's capabilities on extreme long-horizon tasks:

| Task | Turns | Peak $P_m$ | Result |
|------|-------|------------|--------|
| TinyC Compiler (from scratch) | 132 | <20% | ✅ Pass |
| Chess Engine (Perft verified) | 99 | <20% | ✅ Pass |

Both completed on **free-tier LLM** (Gemini Flash Lite) with **zero monetary cost**.

## 🚀 Quick Start

### Try soma-lite (Reference Implementation)

The minimal reference implementation (~700 LOC, zero dependencies):

```bash
npm install soma-lite
```

Or clone directly:
```bash
git clone https://github.com/mcarbonell/soma-lite.git
cd soma-lite
node run-agent-lite.js
```

👉 **Documentation:** [soma-lite README](https://github.com/mcarbonell/soma-lite)

## 📚 Documentation

### Academic Paper
- **Paper:** [`docs/research/SOMA-Paper.pdf`](docs/research/SOMA-Paper.pdf)
- **Source:** [`docs/research/SOMA-Paper.tex`](docs/research/SOMA-Paper.tex)
- **Citation:** See [`CITATION.cff`](CITATION.cff)

### Research Notes
Deep dives into specific research directions:

- **Mutable Working Memory:** `docs/research/research-mutable-scratchpad-l1.md`
- **Synthetic Hippocampus:** `docs/research/SOMA_SYNTHETIC_HIPPOCAMPUS_DESIGN.md`
- **Auto-LoRA Consolidation:** `docs/research/research-auto-lora-consolidation.md`
- **Sovereign Kernel v9:** `docs/research/research-soma-v9-sovereign-kernel.md`
- **Tensor-Level Injection:** `docs/research/research-tensor-level-memory-injection.md`

### Benchmarks
- **Leviathan Suite:** `benchmarks/run-benchmarks.js`
- **TinyC Compiler:** Full specification and evaluator
- **Chess Engine:** Perft verification (depth 1-5)

## 🧠 Architecture

```
┌─────────────────────────────────────────┐
│  L1: Bounded Working Attention          │
│  ├─ Structured prompt (task + panels)   │
│  ├─ Pm dashboard (context pressure)     │
│  └─ Agent-controlled reconstruction     │
└─────────────────────────────────────────┘
              ↕ checkpoint/distill
┌─────────────────────────────────────────┐
│  L2: Immutable Episodic Record          │
│  ├─ JSONL action ledger                 │
│  ├─ Milestone history                   │
│  └─ Session-scoped audit trail          │
└─────────────────────────────────────────┘
              ↕ retrieve/promote
┌─────────────────────────────────────────┐
│  L3: Sovereign Knowledge                │
│  ├─ Identity template                   │
│  ├─ Semantic memory (embeddings)        │
│  ├─ File annotations                    │
│  └─ Knowledge tree                      │
└─────────────────────────────────────────┘
              ↕ observe/act
┌─────────────────────────────────────────┐
│  L4: Environment (IDE Suite)            │
│  ├─ File tree + editor                  │
│  ├─ Terminal panel                      │
│  ├─ Browser panel                       │
│  └─ Git panel                           │
└─────────────────────────────────────────┘
```

## 🔬 Research Directions

SOMA extends beyond the current implementation with six forward-looking directions:

1. **Mutable Working Memory** — Editable scratchpad during inference
2. **Synthetic Hippocampus** — System 1 network for sub-millisecond intuition
3. **Autonomous LoRA Consolidation** — Overnight fine-tuning from experience
4. **Sovereign Inference Kernel** — Tensor-level memory injection
5. **The Genesis Chain** — Self-bootstrapped engineering feat (8 stages)
6. **Self-Authored Identity** — Agent chooses its own frame of reference

See `docs/research/` for detailed specifications.

## 🎯 Philosophy

> *"More context is not equivalent to better cognition."*

SOMA is inspired by Sutton's **Bitter Lesson**: leveraging computation and 
learning at scale consistently outperforms methods that encode human knowledge.

Applied to agent orchestration:
- ❌ Hard-coded heuristics in orchestrator = ceiling
- ✅ Model's own reasoning with right substrates = scales with compute

## 🤝 Contributing

This is primarily a **research project**. Contributions welcome in:

- Bug reports and fixes
- Benchmark improvements
- Research discussions
- Extension implementations

Please open an issue before starting a PR to discuss scope and design.

## 📄 License

- **SOMA documentation & paper:** CC BY 4.0
- **soma-lite implementation:** MIT License
- **Research notes:** Open for discussion

## 👨‍💻 Author

**Mario Raúl Carbonell Martínez**  
- GitHub: [@mcarbonell](https://github.com/mcarbonell)
- LinkedIn: [Profile](YOUR_LINKEDIN_HERE)
- Email: YOUR_EMAIL_HERE

## 🙏 Acknowledgments

Thanks to the open-source community and the AI research ecosystem for inspiration 
and feedback. Special thanks to early users who tested SOMA on real-world tasks.

## 📬 Citation

If you use SOMA in your research, please cite:

```bibtex
@article{carbonell2026soma,
  title={SOMA: Sovereign Operative Memory Architecture},
  author={Carbonell Mart{\'i}nez, Mario Ra{\'u}l},
  journal={arXiv preprint arXiv:XXXX.XXXXX},
  year={2026}
}
```

See [`CITATION.cff`](CITATION.cff) for full citation metadata.
```

---

### Paso 4: Crear CITATION.cff

```yaml
cff-version: 1.2.0
message: "If you use this software, please cite it as below."
title: "SOMA: Sovereign Operative Memory Architecture"
abstract: >
  A cognitive operating system for long-horizon autonomous agents.
  This paper introduces SOMA, a four-layer cognitive architecture that 
  separates bounded working attention, immutable episodic traces, 
  sovereign persistent knowledge, and environment grounding.
authors:
  - family-names: "Carbonell Martínez"
    given-names: "Mario Raúl"
    orcid: "YOUR_ORCID_HERE"
    email: "YOUR_EMAIL_HERE"
version: 11.0.0
doi: "10.XXXX/zenodo.XXXXXXX"  # Añadir tras subir a Zenodo
date-released: 2026-04-01
url: "https://github.com/mcarbonell/soma"
license: MIT
keywords:
  - "AI agents"
  - "cognitive architecture"
  - "memory management"
  - "long-horizon tasks"
  - "autonomous agents"
  - "context management"
repository-code: "https://github.com/mcarbonell/soma"
references:
  - type: article
    title: "MemGPT: Towards LLMs as Operating Systems"
    authors:
      - family-names: "Packer"
        given-names: "Charles"
      - et-al: true
    journal: "arXiv preprint arXiv:2310.08560"
    year: 2023
```

---

### Paso 5: Actualizar el Paper (Acknowledgments)

Una vez creado el repo público, actualizar `docs/research/SOMA-Paper.tex`:

```latex
\section*{Acknowledgments}

The \soma\ architecture is documented at
\url{https://github.com/mcarbonell/soma}, including the full research notes,
implementation plans, and benchmark specifications.
A minimal reference implementation (\texttt{soma-lite}, $\sim$700 LOC, zero dependencies)
is available at \url{https://github.com/mcarbonell/soma-lite} and published on npm,
providing a reproducible starting point for community experimentation.
The complete feature set described in this paper requires additional environment
adapters and tooling beyond the scope of the reference implementation.
```

---

### Paso 6: Subir Archivos al Repo

```bash
# Clonar el nuevo repo
git clone https://github.com/mcarbonell/soma.git
cd soma

# Copiar archivos desde tu workspace
cp /path/to/workspace/docs/research/*.tex docs/research/
cp /path/to/workspace/docs/research/*.pdf docs/research/
cp -r /path/to/workspace/docs/research/chess/ docs/research/chess/
cp -r /path/to/workspace/docs/research/research-*.md docs/research/
cp -r /path/to/workspace/benchmarks/ benchmarks/

# Añadir README y CITATION
# (ya creados en pasos anteriores)

# Commit inicial
git add .
git commit -m "Initial release: SOMA architecture documentation and research"
git push origin main
```

---

### Paso 7: Configurar Zenodo (DOI para Citación)

1. Ir a https://zenodo.org/
2. Login con GitHub
3. Click "New upload"
4. Seleccionar repo `mcarbonell/soma`
5. Rellenar metadata:
   - **Publication type:** Software
   - **Title:** SOMA: Sovereign Operative Memory Architecture
   - **Authors:** Mario Raúl Carbonell Martínez
   - **Abstract:** (copiar del README)
   - **Keywords:** AI agents, cognitive architecture, etc.
   - **License:** MIT
6. Click "Save" → "Submit"
7. Zenodo asignará DOI: `10.5281/zenodo.XXXXXXX`
8. Actualizar `CITATION.cff` con el DOI

---

### Paso 8: Actualizar Paper con DOI

Tras obtener DOI de Zenodo, actualizar línea 1026 del paper:

```latex
\section*{Acknowledgments}

The \soma\ architecture is documented at
\url{https://github.com/mcarbonell/soma} (DOI: \href{https://doi.org/10.XXXX/zenodo.XXXXXXX}{10.XXXX/zenodo.XXXXXXX}),
including the full research notes, implementation plans, and benchmark specifications.
A minimal reference implementation (\texttt{soma-lite}, $\sim$700 LOC, zero dependencies)
is available at \url{https://github.com/mcarbonell/soma-lite} and published on npm,
providing a reproducible starting point for community experimentation.
The complete feature set described in this paper requires additional environment
adapters and tooling beyond the scope of the reference implementation.
```

---

## 📊 Timeline Recomendado

| Día | Tarea | Estado |
|-----|-------|--------|
| **31 mar** | Crear repo `soma` en GitHub | ⏳ Pendiente |
| **31 mar** | Preparar estructura de archivos | ⏳ Pendiente |
| **31 mar** | Redactar README y CITATION.cff | ⏳ Pendiente |
| **31 mar** | Subir research docs + benchmarks | ⏳ Pendiente |
| **1 abr** | Actualizar paper (Acknowledgments) | ⏳ Pendiente |
| **1 abr** | Compilar PDF final | ⏳ Pendiente |
| **1 abr** | Subir a arXiv | ⏳ Pendiente |
| **2-3 abr** | Esperar aprobación arXiv | ⏳ Pendiente |
| **3-4 abr** | Configurar Zenodo + DOI | ⏳ Pendiente |
| **5 abr** | Lanzamiento público + marketing | ⏳ Pendiente |

---

## ✅ Checklist de Verificación

Antes de subir a arXiv, verificar:

- [ ] Repo `mcarbonell/soma` creado y público
- [ ] README.md completo con arquitectura y benchmarks
- [ ] CITATION.cff configurado
- [ ] Research docs copiados al repo
- [ ] Benchmarks copiados al repo
- [ ] Paper actualizado con enlace a repo público
- [ ] Paper actualizado con enlace a soma-lite
- [ ] PDF compilado sin errores
- [ ] DOI de Zenodo obtenido (opcional pero recomendado)

---

## 🎯 Beneficios de Esta Estrategia

| Beneficio | Explicación |
|-----------|-------------|
| **Transparencia académica** | Reviewers pueden acceder a todo el material |
| **Reproducibilidad** | soma-lite es descargable y ejecutable |
| **Claridad conceptual** | `soma` = arquitectura/paper, `soma-lite` = implementación |
| **Protección de IP** | Código avanzado permanece privado |
| **Flexibilidad futura** | Puedes abrir más features gradualmente |
| **Coherencia con marketing** | Alineado con plan de lanzamiento público |

---

## 🚀 Próximos Pasos Inmediatos

1. **HOY:** Crear repo `mcarbonell/soma` en GitHub
2. **HOY:** Preparar README y estructura
3. **HOY:** Copiar research docs + benchmarks
4. **MAÑANA:** Actualizar paper y compilar PDF final
5. **MAÑANA:** Subir a arXiv

---

**Documento generado:** 2026-03-31  
**Responsable:** Agente SOMA  
**Estado:** Listo para ejecución
