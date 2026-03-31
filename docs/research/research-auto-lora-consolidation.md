# 🔧 Auto-LoRA: Consolidación Nocturna de Experiencia en Pesos Neuronales

**Estado**: Investigación de Frontera / Propuesta de Diseño  
**Fase SOMA**: Fase 9 (Consolidación Autónoma)  
**Prerequisitos**: L2 (Registro Episódico estable), L3 (Conocimiento Soberano con embeddings), GPU local con ≥24GB VRAM  
**Relacionado**:
- [`research-validation-weights-vs-activations.md`](research-validation-weights-vs-activations.md) — Validación del enfoque "Training into Weights"  
- [`SOMA_SYNTHETIC_HIPPOCAMPUS_DESIGN.md`](SOMA_SYNTHETIC_HIPPOCAMPUS_DESIGN.md) — "Sueño Somático" como precursor  
- [`research-tensor-level-memory-injection.md`](research-tensor-level-memory-injection.md) — Inyección directa en inferencia (enfoque complementario)

*"La memoria que no se entrena, se pierde. La memoria que se entrena en los pesos, se convierte en instinto."*

---

## 1. El Problema: El Límite del RAG

El enfoque actual de SOMA para conocimiento a largo plazo es **RAG sobre L3**: el agente busca recuerdos semánticamente relevantes y los inyecta en L1 como texto.

Esto funciona, pero tiene tres limitaciones estructurales:

1. **Latencia de recuperación**: Cada búsqueda semántica sobre L3 tarda milisegundos a decenas de milisegundos. No es catastrófico, pero escala mal con corpus grandes.
2. **Coste de tokens**: Cada recuerdo inyectado ocupa tokens de contexto en L1, contribuyendo a $P_m$.
3. **Superficie de conocimiento**: El RAG solo recupera lo que encuentra por similitud semántica. No puede integrar patrones distribuidos que requieren combinar múltiples fragmentos de experiencia.

**La tesis de Morris (2025)**: *Los modelos fallan en conocimiento de nicho porque no está en sus pesos. El RAG es un parche. La solución real es entrenar el conocimiento directamente en los pesos del modelo.*

---

## 2. La Propuesta: Consolidación Nocturna Auto-LoRA

### 2.1. Concepto

Cuando el agente no está activo (noche, fin de semana, periodo de inactividad configurable), SOMA ejecuta un proceso de consolidación autónoma:

1. **Recolecta** experiencias del día desde L2 (registro episódico inmutable).
2. **Filtra** y **destila** las experiencias exitosas vs. fallidas.
3. **Genera** un dataset de fine-tuning supervisado (SFT) específico al proyecto y usuario.
4. **Entrena** un adaptador LoRA ligero (~2-50MB) sobre el modelo base.
5. **Valida** el adaptador contra un conjunto de holdout antes de activarlo.
6. **Activa** el LoRA como adaptador por defecto para la siguiente sesión.

### 2.2. Diferencia con Fine-Tuning Tradicional

| Aspecto | Fine-Tuning Tradicional | Auto-LoRA SOMA |
|---------|------------------------|----------------|
| **Quién decide qué entrenar** | Humano | Agente (autónomo) |
| **Frecuencia** | Puntual (~1 vez) | Continua (cada noche) |
| **Datos de entrenamiento** | Dataset curado manualmente | L2 del agente, destilado automáticamente |
| **Tamaño del adaptador** | Modelo completo o LoRA ~GB | LoRA micro (~2-50MB) |
| **Validación** | Manual o benchmark | Automática contra holdout de L2 |
| **Acumulación** | Se pierde contexto previo | Replay Buffer previene Catastrophic Forgetting |

---

## 3. Pipeline de Consolidación Nocturna

### Fase 3.1: Extracción (L2 → Dataset Crudo)

```
L2/sessions/*.jsonl → Filtro de Calidad → dataset_raw.jsonl
```

Criterios de filtrado:
- **Éxito**: Cadenas de acción que terminaron en `finish_task` (WDL = W).
- **Fracaso documentado**: Cadenas que terminaron en error pero el agente identificó correctamente la causa.
- **Descubrimiento**: Momentos donde el agente usó `search_memory` y el resultado cambió su plan de acción.
- **Descarte**: Acciones repetitivas mecánicas (file open/close), chunks de output extenso sin valor semántico.

### Fase 3.2: Destilación (Dataset Crudo → Pares SFT)

Cada ejemplo de entrenamiento sigue el formato:

```json
{
  "instruction": "[Contexto resumido del estado L1 en ese turno]",
  "input": "[Prompt del sistema + estado del entorno]",
  "output": "[Acción que tomó el agente exitosamente]",
  "metadata": {
    "project": "ai-task-orchestrator",
    "session": "2026-03-17-session-04",
    "outcome": "success",
    "confidence": 0.92
  }
}
```

**Destilación por el propio LLM**: Opcionalmente, SOMA puede usar el mismo modelo base para resumir y limpiar los ejemplos de entrenamiento antes del fine-tuning, reduciendo ruido.

### Fase 3.3: Entrenamiento (Dataset SFT → LoRA)

Parámetros propuestos para LoRA micro:

| Parámetro | Valor | Justificación |
|-----------|-------|---------------|
| `rank` (r) | 8-16 | Suficiente para conocimiento de nicho sin overfitting |
| `alpha` | 16-32 | 2× rank como regla estándar |
| `target_modules` | `q_proj, v_proj` | Solo capas de atención (query, value) |
| `learning_rate` | 2e-5 | Conservador para evitar drift catastrófico |
| `epochs` | 1-3 | Una pasada por el dataset del día + replay |
| `batch_size` | 4-8 | Adaptado a VRAM disponible |

### Fase 3.4: Validación (LoRA → Test)

Antes de activar el adaptador, SOMA ejecuta una batería automática:

1. **Holdout test**: 20% del dataset del día se reserva para validar (no se entrena sobre él).
2. **Regression check**: Se ejecutan 5-10 prompts estándar (no del proyecto) para verificar que no hay degradación general.
3. **Perplexity delta**: Si la perplexity media sobre el holdout mejora respecto al modelo base, se aprueba. Si empeora en >5%, se descarta el LoRA.

### Fase 3.5: Replay Buffer (Anti-Catastrophic Forgetting)

Inspirado en el "Sueño Somático" del Hipocampo Sintético:

```
Dataset de entrenamiento = 80% memorias de hoy + 20% memorias antiguas (muestreo aleatorio)
```

El buffer de replay se mantiene como un archivo JSONL rotativo en L3:
- `~/.soma/L3/auto-lora/replay_buffer.jsonl`
- Tamaño máximo configurable (ej. 10,000 ejemplos)
- Política de evicción: LRU + decaimiento temporal

---

## 4. Federación: La "Mente Colmena" Corporativa

Un aspecto particularmente interesante documentado en [`research-validation-weights-vs-activations.md`](research-validation-weights-vs-activations.md):

### 4.1. Concepto

Si cada desarrollador de un equipo tiene su agente SOMA generando LoRAs nocturnos, estos adaptadores se pueden **compartir por la red de la empresa**:

```
Desarrollador A → LoRA_A (frontend, React patterns)      ~5MB
Desarrollador B → LoRA_B (backend, API design)           ~5MB
Desarrollador C → LoRA_C (infra, Docker/K8s)             ~5MB
                                                    ─────────
                  LoRA_merged (conocimiento colectivo)   ~15MB
```

### 4.2. Ventajas del Federated LoRA

- **Privacidad**: Los datos de L2 nunca salen de la máquina del desarrollador. Solo se comparte el adaptador (pesos matemáticos sin datos textuales recuperables).
- **Coste mínimo**: Compartir un LoRA de 5-50MB por red interna es trivial.
- **Sin vendor lock-in**: No hay fine-tuning corporativo en nube ($$$). Todo es local.
- **Composable**: Técnicas como LoRA merging (DARE, TIES) permiten combinar adaptadores sin reentrenar.

---

## 5. Integración con la Arquitectura SOMA

### 5.1. Flujo de Datos

```
┌──────────────────────────────────────────────────────────┐
│                    Ciclo Diurno (Operación)              │
│  L1 (Prompt) → LLM+LoRA → Acción → L2 (Log) → L4         │
└──────────────────────────────────────────┬───────────────┘
                                           │ noche
                                           ▼
┌──────────────────────────────────────────────────────────┐
│              Ciclo Nocturno (Consolidación)              │
│  L2 → Filtro → Destilación → SFT Dataset                 │
│  SFT + Replay Buffer → LoRA Training → Validación        │
│  Validación OK → Activar LoRA → ~/.soma/L3/lora/active/  │
└──────────────────────────────────────────────────────────┘
```

### 5.2. Almacenamiento en L3

```
~/.soma/L3/
├── auto-lora/
│   ├── active/
│   │   └── adapter_model.safetensors    # LoRA activo
│   ├── archive/
│   │   ├── 2026-03-15_adapter.safetensors
│   │   └── 2026-03-16_adapter.safetensors
│   ├── datasets/
│   │   ├── 2026-03-17_sft.jsonl
│   │   └── replay_buffer.jsonl
│   ├── validation/
│   │   └── regression_prompts.jsonl
│   └── config.json                      # Hiperparámetros, modelo base, schedule
```

### 5.3. Configuración (`config.json`)

```json
{
  "enabled": true,
  "schedule": "idle_30min",
  "base_model": "Qwen/Qwen2.5-Coder-7B",
  "lora_config": {
    "rank": 16,
    "alpha": 32,
    "target_modules": ["q_proj", "v_proj"],
    "learning_rate": 2e-5,
    "max_epochs": 2
  },
  "replay_buffer": {
    "max_examples": 10000,
    "old_ratio": 0.2
  },
  "validation": {
    "holdout_ratio": 0.2,
    "max_perplexity_increase": 0.05,
    "regression_prompts": "validation/regression_prompts.jsonl"
  },
  "federation": {
    "enabled": false,
    "share_path": null,
    "merge_strategy": "DARE"
  }
}
```

---

## 6. Limitaciones y Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Catastrophic Forgetting** | Media | Alto | Replay Buffer obligatorio. Validación de regresión pre-activación. |
| **Overfitting al proyecto** | Alta | Medio | Rank bajo (8-16), epochs limitados (1-3), holdout estricto. |
| **Datos tóxicos en L2** | Baja | Alto | Filtrado por outcome (solo éxitos). Revisión humana opcional del dataset. |
| **Coste GPU nocturno** | Baja | Bajo | LoRA es ligero (~minutos en RTX 3090). Schedule configurable. |
| **Drift del adaptador** | Media | Medio | Archivado diario. Si la validación falla, se revierte al LoRA del día anterior. |
| **Incompatibilidad al cambiar modelo base** | Alta | Alto | Regeneración automática del LoRA al detectar cambio de modelo. |

---

## 7. Relación con Otras Líneas de Investigación

| Documento | Relación con Auto-LoRA |
|-----------|----------------------|
| **Hipocampo Sintético** | El Sueño Somático entrena la red de intuición (Sistema 1). Auto-LoRA entrena el LLM (Sistema 2). Son complementarios. |
| **Tensor-Level Memory Injection** | Inyección en VRAM ofrece latencia cero pero es efímera (per-session). Auto-LoRA es permanente (persiste en pesos). |
| **Mutable Scratchpad L1** | L1 como scratchpad mutable optimiza el *razonamiento activo*. Auto-LoRA optimiza el *conocimiento base*. |
| **Sovereign Kernel v9** | El kernel soberano reduce la latencia de tool calls. Auto-LoRA reduce la *necesidad* de tool calls (el modelo ya sabe la respuesta). |

---

## 8. Criterios de Éxito

### MVP (Fase 9a)
- ✅ Pipeline automático de L2 → Dataset SFT → LoRA funcional
- ✅ Validación automática con holdout
- ✅ Mejora medible en tasks repetitivos del mismo proyecto (ej. -30% turnos medios)

### Completo (Fase 9b)
- ✅ Replay Buffer funcional con anti-forgetting verificado
- ✅ Federación de LoRAs entre agentes del mismo equipo
- ✅ Merge automático de LoRAs semanales (DARE/TIES)
- ✅ Dashboard de evolución del adaptador (perplexity, accuracy, tamaño)

---

## 9. Conclusión

Auto-LoRA cierra el bucle completo de la arquitectura de memoria de SOMA:

```
RAG (L3)                → Memoria explícita, buscable, con latencia
Auto-LoRA (Pesos)       → Memoria implícita, instantánea, sin tokens
Hipocampo Sintético     → Intuición, sin tokens, sin latencia de red
Tensor Injection (VRAM) → Latencia cero, per-session, experimental
```

El agente que trabaja más, literalmente se vuelve más inteligente al día siguiente. No porque recuerde más texto, sino porque **su red neuronal ha mutado** para incorporar los patrones que descubrió ayer.

Es la diferencia entre estudiar (RAG) y haber aprendido (LoRA).

---

## 10. Referencias

- Morris, J. (2025). *Understanding how memory works in large language models through the lens of weights and activations*. [Video](https://www.youtube.com/watch?v=Jty4s9-Jb78).
- Hu, E. et al. (2021). *LoRA: Low-Rank Adaptation of Large Language Models*. arXiv:2106.09685.
- Yu, L. et al. (2023). *Language Model Merging with DARE*. arXiv:2311.03099.
- Yadav, P. et al. (2023). *TIES-Merging: Resolving Interference When Merging Models*. arXiv:2306.01708.
- McMahan, B. et al. (2017). *Communication-Efficient Learning of Deep Networks from Decentralized Data (Federated Learning)*. AISTATS 2017.
