# Validación de Arquitectura: Weights vs Activations

**Fuente:** Jack Morris (Investigador IA) - Diciembre 2025 ["Understanding how memory works in large language models through the lens of weights and activations"](https://www.youtube.com/watch?v=Jty4s9-Jb78)

Este documento relaciona las conclusiones de la investigación de vanguardia sobre LLMs con las decisiones arquitectónicas de SOMA v5.0.

## 1. El Problema: "The Context Trap" y la Saturación por Ruido
*   **Investigación:** Meter todo en el prompt (Long Context) tiene un coste computacional cuadrático. Pasar de 1k a 128k tokens reduce la velocidad de generación de 10,000 t/s a 130 t/s. Además, provoca **"Context Rot"** y el fenómeno **"Lost in the Middle"**: el modelo no solo se vuelve más caro y lento, sino que se vuelve *literalmente más tonto*. Llenar 10 millones de tokens con ruido irrelevante asfixia la capacidad de atención (self-attention) de la red sobre lo que verdaderamente importa.
*   **Filosofía de "Attention Is All You Need":** El paper original que inventó los Transformers se basaba en la *Atención*: la capacidad de separar la señal del ruido. Si un orquestador inunda la ventana de contexto con logs inútiles, está forzando al Transformer a computar infinitas relaciones estúpidas, destruyendo el propósito mismo de la arquitectura.
*   **Solución SOMA (Fases 1-4):** SOMA nació precisamente de esta premisa: *"la memoria no es guardarlo todo, es saber qué borrar"*. La Capa L1 (Atención/Activations) se mantiene artificialmente diminuta mediante la paginación y el "Prune" soberano. El agente no lee el código fuente completo, sino que usa el *IDE Suite* (grep, abstract syntax trees) para meter en su L1 solo fragmentos vitales quirúrgicos, manteniendo la señal pura en un 100% y eliminando el ruido. Permitimos que el propio Transformer decida qué es ruido y lo elimine permanentemente de su L1.

## 2. El Fallo del RAG Tradicional y "The Long Tail Knowledge"
*   **Investigación:** Los modelos fallan catastróficamente en conocimiento de nicho (código privado de una empresa) porque no está en sus pesos. El RAG puro añade latencia inasumible si se hace en cada iteración.
*   **Solución SOMA (Fase 5 y 9):** SOMA utiliza RAG (L3) solo como paso intermedio. El objetivo final es la **Fase 9 (Consolidación Nocturna Auto-LoRA)**, donde el conocimiento de L3 y las experiencias de L2 se inyectan directamente en los *Pesos* del modelo, alineándose al 100% con la tesis de Morris de "Training things into weights".

## 3. El Retorno del Federated Learning
*   **Investigación:** Entrenar redes inmensas en red fracasó, pero entrenar pequeños adaptadores (millones de parámetros, no trillones) para conocimiento especializado es viable.
*   **Solución SOMA:** Encaja perfectamente con la visión de la "Mente Colmena" local. Cada "Nodo SOMA" en un equipo de desarrolladores genera su propia memoria (L2). Por la noche, se genera un LoRA local que se puede compartir fácilmente por la red de la empresa (pesa megabytes), logrando un modelo privado altamente especializado en el código de esa empresa, sin pagar fine-tuning corporativo masivo en la nube.

## 4. El "Middle Ground" (Karpathy vs Especialistas)
*   **Investigación:** Morris rechaza la idea de que un LLM deba ser solo un "motor de razonamiento en blanco" (visión de Karpathy) que lo busca todo con herramientas. Defiende **Modelos Especializados** que tienen el conocimiento fundacional en sus pesos, pero saben usar herramientas.
*   **Solución SOMA:** SOMA proporciona el framework. El orquestador es el sistema de herramientas (El Motor de Razonamiento), pero gracias a la Fase 9, el modelo base no se queda "en blanco"; muta en un **Especialista** en el repositorio del usuario a base de reentrenar sus pesos con la experiencia acumulada en la Capa L2.

---
**Conclusión:** La investigación de finales de 2025 convalida matemáticamente que el camino de "aumentar la ventana de contexto a 2 Millones de tokens" es un callejón sin salida técnico y económico. La arquitectura modular de SOMA de memoria dinámica (L1/L2/L3) culminando en la alteración de los pesos neuronales (LoRA) es, literalmente, el consenso hacia el que pivota la investigación académica para resolver la verdadera autonomía de la IA.
