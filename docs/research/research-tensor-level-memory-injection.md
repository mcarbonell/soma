# 🧠 VRAM & Tensor-Level Memory Injection (L3)

**Estado**: Investigación de Frontera (Deep Research)  
**Relacionado**: [CONTEXTUAL_MEMORY_INJECTION.md](../proposals/CONTEXTUAL_MEMORY_INJECTION.md) (Propuesta implementable MVP)  
**Prerequisitos**: RadixAttention (SGLang/vLLM), Cross-Attention, Faiss en VRAM.

*"La memoria que no se lee, se siente a nivel de tensor."*

---

## 1. El Salto Evolutivo: Del Texto a la Activación Neuronal

La propuesta actual de [Inyección de Memoria Contextual](../proposals/CONTEXTUAL_MEMORY_INJECTION.md) (MVP) resuelve de forma brillante el problema de la automatización: el orquestador busca recuerdos relevantes (L3) y los inyecta dinámicamente en el prompt (L1) como texto XML, ahorrándole al Agente las consultas manuales estáticas.

Sin embargo, a nivel de la conectividad GPU-CPU matemática, este proceso "clásico" sufre de un cuello de botella estructural importante: **El Cuello de Botella del Texto**.
1. Se recupera el recuerdo en texto de la base de datos o sistema de archivos.
2. Se inyecta en el Prompt.
3. El LLM **vuelve a tokenizar** y calcular los embeddings tridimensionales desde cero, de recuerdos que ya fueron procesados y entendidos en el pasado.
4. Conclusión: Se gasta coste computacional, ancho de banda, milisegundos vitales, y cientos de tokens en el *prefill* (lectura) por cada inyección.

**La Visión a Largo Plazo**: Inyectar los recuerdos dinámicamente de forma directa en las capas numéricas (tensores) del motor de inferencia mientras funciona. La VRAM de la gráfica actúa como un auténtico Hipocampo, logrando inyección de contexto con **latencia cero y coste de tokens nulo**.

---

## 2. Enfoque A: Inyección Directa vía KV-Cache (Swapping de Tensores)

*Aprovecha la mecánica subyacente de runtimes modernos que tratan la memoria de trabajo como un árbol (ej. RadixTree).*

La memoria real de un modelo generativo durante la inferencia es la **KV-Cache** (Key-Value Cache). Representa el estado interno "compilado y digerido" de todo el texto que acaba de leer.

### Mecánica de Integración y Recuperación (RadixTree):
1. **Consolidación Tensorial**: Cuando el Hipocampo SOMA destila en inactividad un conocimiento útil (Ej. "*En auth.js siempre falla el token expirado de esta manera*"), somete este registro crudo L2 a inferencia profunda.
2. SOMA congela y extrae la matriz de estados resultante (los tensores generados en el KV-Cache asociado a ese recuerdo) y lo **persiste en VRAM/NVMe directamente como `.safetensors`**, en lugar de como archivo JSON de texto.
3. **Inyección Inmediata**: El usuario abre `auth.js` o se topa con el TypeError conocido. El orquestador rastrea la semántica del entorno, y en lugar de pegar 250 palabras de recuperación de contexto temporal... **envía el puntero binario** al Runtime de inferencia modificado (SGLang/vLLM).
4. El Runtime asimila este "nodo precongelado" inyectando los tensores en la cabeza de las rutas de atención como prefijo activo.
5. **Efecto**: Latencia de milisegundos. El árbol carga los tensores, el modelo se condiciona sobre ellos, y su distribución de probabilidad incorpora el contexto histórico sin haber procesado un solo token de texto. El orquestador inyectó representaciones abstractas precalculadas directamente en el flujo de atención.

---

## 3. Enfoque B: Intercepción en Embebidos (Arquitectura RETRO / kNN-LM)

*Más avanzado estructuralmente: no se reengancha al árbol de prefijos, sino que invoca contexto de forma reactiva durante la inferencia.*

Consiste en combinar las capas activas de la red neuronal con bases vectoriales de recuerdos (Faiss) alojadas en la VRAM, enlazadas mediante puentes de atención cruzada. Inspirado en modelos como *Retrieval-Enhanced Transformer (RETRO)* de DeepMind y *kNN-LM* de Khandelwal et al. (2020).

### La Mecánica de Recuperación Reactiva:
1. El modelo empieza a generar sus tokens autorregresivos normalmente.
2. Al llegar a sus capas intermedias de profundidad (Ej. Capa de decodificación 16/32), donde se concentran los significados abstractos latentes pero el token aún no está decodificado, el estado latente se desvía temporalmente.
3. El estado de la Red Neuronal, durante la propagación, hace un matching ultrarrápido ($<1ms$, de vecinos cercanos K-NN Faiss) puramente numérico apuntando a la partición L3 en VRAM.
4. Identifica los vectores neuronales residuales relevantes (ej. el error al configurar el puerto hace 2 semanas).
5. El Runtime ejecuta una **atención cruzada (Cross-Attention)** forzada, hibridando el rescate histórico localizado con el estado activo de la red.
6. **Efecto**: La distribución de probabilidad del siguiente token se modifica significativamente, redirigiendo el output basándose en experiencia previa sin que hubiera pista textual explícita en el prompt.

---

## 4. Requerimientos Hardware y Ecosistema Runtime

*   **Motor de Inferencia Caja Blanca (Whitebox API)**: Para operar a este nivel se necesitan runtimes experimentales y permeables. No valen endpoints ni inferencias monolíticas. Obliga a modificaciones en kernels de **SGLang**, aprovechando las facilidades del Radix Tree, o modificaciones de `llama.cpp` a nivel de memoria.
*   **Segmentación Lógica de la VRAM**: Dividimos la GPU en "Órganos Físicos":
    *   *Pool Central Genérico (P-Gen)*: Para Pesos Fijos de lectura, modelos de sistema.
    *   *Pool Dinámico Superficial (P-L1)*: La caché normal lineal autorregresiva a vaciar.
    *   *Pool Cortical / Hipocámpico (P-L3)*: Segmento perennemente alocado al Hipocampo, pre-cargado con índices Faiss crudos persistentes de tensores latentes precongelados o tensores `.safetensors`.
*   **Manejo Híbrido C/C++ & Python**: Esta fase elimina capas asíncronas lentas. Los saltos deben programarse usando C++/CUDA directos a la capa del Engine para evadir latencias del Global Interpreter Lock de Python.

---

## 5. Limitaciones y Riesgos

| Riesgo | Descripción | Mitigación |
|--------|-------------|------------|
| **Incompatibilidad de representaciones** | Los tensores KV-Cache son específicos al modelo, tokenizer, y versión. Cambiar de modelo invalida todos los `.safetensors` almacenados. | Versionado de tensores asociado a modelo+commit. Regeneración automática en migración. |
| **Corrupción de estado** | Inyectar tensores incorrectos o corruptos puede causar generación incoherente o alucinaciones potenciadas. | Validación checksummed de tensores antes de inyección. Señal de confianza ($C_t$) por tensor. |
| **Coste de VRAM** | El Pool Hipocámpico (P-L3) compite por VRAM con el modelo y la KV-Cache activa, especialmente en GPUs de 24GB. | Swapping inteligente (NVMe ↔ VRAM), LRU cache, presupuesto configurable. |
| **Falsa intuición** | El modelo podría "recordar" cosas que ya no son válidas (código refactorizado, dependencias actualizadas). | Decay temporal obligatorio. Invalidación de tensores al detectar cambios en archivos asociados (L4). |
| **Complejidad de implementación** | El Enfoque B (RETRO/kNN-LM) requiere modificar la arquitectura interna del transformer, no solo su periferia. | Priorizar Enfoque A (KV-Cache swap) como MVP. Enfoque B es investigación a más largo plazo. |

---

## 6. El Horizonte Final de SOMA

Si el documento fundacional de **Memory Injection MVP** logra modelar la inteligencia por comportamientos, este avance representa el salto hacia la integración directa a nivel de silicio.

Supera el paradigma actual de "el agente le pide recuerdos con delay al script orquestador". Funde el tejido lógico del orquestador L1, L2 y L3 **directamente al motor de inferencia**, generando una arquitectura simbiótica.

La memoria persistente aquí no se busca, y mucho menos se lee. Simplemente... *se es*.

---

## 7. Referencias

- Borgeaud, S. et al. (2022). *Improving Language Models by Retrieving from Trillions of Tokens (RETRO)*. DeepMind. arXiv:2112.04426.
- Khandelwal, U. et al. (2020). *Generalization through Memorization: Nearest Neighbor Language Models (kNN-LM)*. ICLR 2020. arXiv:1911.00172.
- Zheng, L. et al. (2023). *Efficiently Programming Large Language Models using SGLang*. arXiv:2312.07104.
