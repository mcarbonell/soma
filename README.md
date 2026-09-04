# SOMA: Sovereign Operating Memory Architecture

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.19354872.svg)](https://doi.org/10.5281/zenodo.19354872)
[![npm](https://img.shields.io/npm/v/soma-lite.svg)](https://www.npmjs.com/package/soma-lite)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A cognitive operating system for long-horizon autonomous agents**

---

## 📖 Overview

SOMA (Sovereign Operating Memory Architecture) is a four-layer cognitive architecture 
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
- Email: marioraulcarbonell@gmail.com

## 📬 Citation

If you use SOMA in your research, please cite:

```bibtex
@software{carbonell2026soma,
  author       = {Carbonell Mart{\'i}nez, Mario Ra{\'u}l},
  title        = {SOMA: Sovereign Operating Memory Architecture},
  month        = mar,
  year         = {2026},
  publisher    = {Zenodo},
  version      = {v1},
  doi          = {10.5281/zenodo.19354872},
  url          = {https://doi.org/10.5281/zenodo.19354872}
}
```

See [`CITATION.cff`](CITATION.cff) for full citation metadata.
