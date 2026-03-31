# SOMA v9.0 Vision: El Kernel Soberano y la "Cirugía de Contexto" en Caliente

**Estado**: Investigación de Frontera / Visionaria → **Superado como plan por [`SOMA_V9_IMPLEMENTATION_PLAN-v2.md`](SOMA_V9_IMPLEMENTATION_PLAN-v2.md)**  
**Rol**: Documento fundacional. Las ideas aquí expuestas fueron desarrolladas en detalle en los planes de implementación v1 y v2.  
**Autor**: SOMA (v8.1) & USER  
**Refinería**: Transcripción de la discusión sobre Inferencia Dinámica y Metacognición Integrada.

## 1. Tesis: De la Inferencia Lineal al Runtime Dinámico

La arquitectura actual de los agentes (incluyendo SOMA v8.1) sufre de un cuello de botella estructural: la **linealidad autorregresiva**. El modelo escribe, el orquestador lee, el orquestador para, y el ciclo se reinicia.

La visión de SOMA v9.0 propone romper esta barrera tratando a SOMA no como un "wrapper" externo, sino como un **Kernel** que opera sobre el motor de inferencia en tiempo real.

## 2. Herramientas de Metacognición como Interrupciones (Hot Tools)

En el modelo actual, herramientas como `think`, `observation`, `remember` o `forget` generan una respuesta que el orquestador debe procesar. 

**Propuesta v9.0**: Estas herramientas se convierten en **Tokens de Interrupción**.
- El modelo genera el token `<SOMA_THINK>`.
- El motor de inferencia (vLLM, SGLang, etc.) detiene la generación momentáneamente.
- El orquestador muta el contenido de **L1** (el Scratchpad Mutable) directamente en la **KV-Cache** (memoria GPU).
- La inferencia continúa **sin haber emitido un solo token de salida al usuario**.
- **Resultado**: El modelo "cambia de opinión" o "refina su hipótesis" internamente antes de hablar.

## 3. L3 Integrado: El Tensor Soberano (VRAM Cache)

Actualmente, L3 (Conocimiento Soberano) vive en el disco. Su recuperación (RAG) implica latencia de E/S.

**Propuesta v9.0**: Integración a nivel de VRAM.
- L3 se carga en una zona de memoria asociativa dentro de la GPU.
- Al invocar `search_memory`, el sistema realiza un "swapping" de tensores de atención a nivel de hardware.
- La memoria a largo plazo se convierte en una extensión física de los pesos del modelo para esa sesión específica, inyectándose dinámicamente en el flujo de atención.

## 4. El Reloj Somático: Conciencia de Recursos en Tiempo Real

Se propone inyectar una **señal externa dinámica** dentro de L1 que el modelo pueda "sentir" mientras genera texto:
- **Contador de Tokens Restantes**: Una señal que decrementa en L1 con cada token generado.
- **Reloj de Inferencia**: Una señal de milisegundos transcurridos inyectada dinámicamente.
- **Presión Somática ($P_m$) Variable**: Si el orquestador detecta que el sistema se está quedando sin memoria de video, incrementa $P_m$ en L1 *mientras* el modelo está pensando, forzándolo a resumir o cerrar ramas de razonamiento de forma inmediata.

## 5. Requerimiento Técnico: Hot Context Surgery

Para implementar esto, SOMA necesitaría integrarse con runtimes que permitan la **Cirugía de Contexto**:
1.  **Manipulación de KV-Cache**: Poder insertar o borrar spans de memoria de trabajo sin invalidar los estados de atención previos.
2.  **Streaming Bi-direccional de Control**: Un canal donde el orquestador y el motor de inferencia intercambian señales de control (no solo texto) a latencia de milisegundos.

## 6. Conclusión: SOMA como el Kernel Cognitivo

Bajo esta visión, SOMA deja de ser un programa y se convierte en el **Kernel de un Sistema Operativo Cognitivo**. El "Agente" es solo el proceso de usuario, mientras que SOMA gestiona los recursos de atención, memoria y tiempo directamente en el "hardware" de la inferencia.

---
*Este documento queda como el faro para la evolución de SOMA tras el hito de la v8.1.*
