# L1 como Scratchpad Mutable

**Estado**: visión / investigación de frontera  
**Alcance**: hipótesis sobre la evolución de la inferencia LLM y sobre cómo SOMA puede prepararse para ella  
**Importante**: este documento no describe una feature implementada hoy en SOMA. Describe una dirección técnica.

## 1. Tesis

La siguiente mejora importante en agentes no vendrá solo de ventanas de contexto más grandes, sino de una **memoria de trabajo editable durante la inferencia**.

Hoy, la mayoría de LLMs razonan de forma autorregresiva y lineal:

1. generan tokens;
2. se condicionan sobre esos mismos tokens;
3. arrastran errores, ramas fallidas y ruido hasta el final de la respuesta.

La hipótesis de este documento es que un modelo sería más eficiente si dispusiera de una zona de trabajo **mutable**, separada del output final, donde pudiera probar, borrar, reescribir y reevaluar hipótesis sin contaminar el canal externo.

## 2. El Problema Real

### 2.1 Pensamiento lineal con tinta imborrable

En un pipeline autorregresivo estándar, el modelo escribe secuencias como:

> "Hipótesis A... cálculo... A falla... pruebo B..."

Eso tiene tres costes:

1. **Polución de contexto**  
   El razonamiento fallido ocupa memoria de trabajo y compite con información útil.

2. **Arrastre probabilístico**  
   El modelo se condiciona sobre sus propios tokens previos. No queda "obligado" a mantener un error, pero sí sufre una fuerte inercia hacia la coherencia con lo ya escrito.

3. **Coste de inferencia**  
   Se consumen tokens, latencia y ancho de banda en pensamiento que el usuario no necesitaba ver.

### 2.2 El problema no es solo el tamaño de contexto

Aumentar la ventana de contexto ayuda a almacenar más cosas, pero no resuelve la cuestión de fondo:

- una memoria de trabajo más grande puede seguir llenándose de ruido;
- más tokens disponibles no implican mejor control interno;
- el modelo sigue sin disponer de una zona nativa para "deshacer" pasos de razonamiento.

## 3. La Metáfora Correcta: El Tablero Mental

Un gran maestro de ajedrez no verbaliza todas sus variantes antes de mover una pieza física.

Opera sobre un tablero mental:

1. prueba una variante;
2. evalúa la posición resultante;
3. descarta la línea fallida;
4. vuelve a un estado limpio;
5. solo externaliza la jugada final.

La idea central es esta:

**Un LLM útil necesita algo más parecido a un tablero mental editable que a un monólogo infinito de tokens.**

## 4. Qué Sería un "Mutable Scratchpad"

En términos de diseño de inferencia, un `Mutable Scratchpad` sería una zona interna de trabajo donde el modelo pudiera:

1. proyectar un borrador parcial;
2. releer ese borrador;
3. modificarlo o borrarlo;
4. ejecutar varios ciclos internos de evaluación;
5. emitir al exterior solo el resultado consolidado.

No estamos hablando simplemente de "Chain of Thought oculto". Estamos hablando de una **memoria de trabajo editable**, no meramente invisible.

### Posibles primitivas internas

En un diseño de proveedor, esto podría parecerse a operaciones como:

- `[WRITE_NODE]`
- `[ERASE_SPAN]`
- `[REWRITE_SPAN]`
- `[ROLLBACK_STATE]`
- `[COMMIT_OUTPUT]`

Estas primitivas no tendrían por qué exponerse al usuario. Podrían existir solo dentro del runtime de inferencia.

## 5. Qué Puede Hacer SOMA Hoy

SOMA no puede modificar el mecanismo interno del Transformer ni la KV-cache de un proveedor. Pero sí puede **emular externamente parte del efecto deseado**.

### 5.1 Reconstrucción curada de L1

SOMA ya apunta a una idea correcta: `L1` no debe ser un acta notarial inmutable. Debe ser una mesa de trabajo reconstruible.

Eso permite:

- podar ruido operativo;
- dejar fuera ramas fallidas;
- reinyectar solo contexto relevante;
- mantener separados `L2` bruto y `L3` curado.

### 5.2 Checkpoints y budgeting

El sistema también puede aproximar una forma externa de disciplina cognitiva:

- detectar presión de memoria;
- consolidar cuando el coste marginal sube;
- limitar el razonamiento visible;
- empujar al agente a entregar una solución suficiente en lugar de una exploración infinita.

### 5.3 Scratchpad externo, no nativo

Lo importante es ser honestos:

**SOMA hoy no implementa un scratchpad mutable interno. Implementa una reestructuración externa del contexto activo.**

Eso ya es valioso, pero no es lo mismo.

## 6. Qué No Puede Hacer SOMA por Sí Solo

Para evitar confusiones, estas capacidades requerirían soporte del proveedor o una arquitectura de inferencia distinta:

1. mutar el estado interno del modelo durante la generación;
2. borrar o reescribir razonamiento sin reiniciar o reconstruir contexto externamente;
3. ejecutar bucles de evaluación internos a latencia cero de red;
4. inyectar señales dinámicas dentro del flujo de inferencia mientras el modelo sigue computando.

En otras palabras:

**SOMA puede preparar el ecosistema. No puede, por sí mismo, hackear el runtime interno del modelo base.**

## 7. El Segundo Componente Clave: Conciencia de Recursos

Además del scratchpad mutable, hay otra pieza especialmente interesante: que el modelo sea sensible al tiempo y al presupuesto mientras piensa.

Hoy, muchos pipelines dejan al modelo expandir razonamiento sin una noción activa de coste o tiempo transcurrido.

Un diseño mejor expondría señales como:

- `[TOKENS_REMAINING: 852]`
- `[INFERENCE_TIME_MS: 4500]`
- `[SLA_TARGET_MS: 6000]`

La idea no es que el modelo "sienta" el tiempo. La idea es que pueda **usar restricciones dinámicas como parte de su política de decisión**:

- profundizar cuando compensa;
- recortar exploración cuando el presupuesto se agota;
- entregar una heurística suficientemente buena antes de incumplir latencia o coste.

## 8. Qué Parte de Esta Visión Sí Es Accionable Ya

Aunque el scratchpad mutable interno no exista aún en SOMA, sí hay líneas de trabajo útiles ahora mismo:

### 8.1 Prompting con presupuesto explícito

Inyectar en `L1` variables como:

- presupuesto estimado;
- tiempo máximo permitido;
- presión de memoria;
- umbral para consolidar.

Esto no crea edición interna real, pero sí mejora la autorregulación externa.

### 8.2 Modos de razonamiento acotado

Se pueden definir políticas como:

- planificar primero;
- limitar longitud del razonamiento visible;
- checkpoint si el reasoning se vuelve ruido;
- exigir conclusión operativa tras cierto coste.

### 8.3 Comparativas experimentales

SOMA puede servir como banco de pruebas para medir:

- CoT lineal sin poda;
- CoT con poda externa;
- planificación acotada por presupuesto;
- reasoning visible frente a scratchpad externo consolidado.

## 9. Riesgos y Objeciones

Esta visión es potente, pero tiene riesgos claros:

1. **Menos ruido visible no implica más verdad**  
   Un scratchpad editable puede ocultar errores, no eliminarlos.

2. **Menor coste no implica mejor razonamiento**  
   Podar antes puede abaratar inferencia pero empeorar soluciones.

3. **Menos trazabilidad**  
   Si el modelo reescribe demasiado internamente, auditar decisiones se vuelve más difícil.

4. **Riesgo de vender magia**  
   "Mutable scratchpad" no debe usarse como sinónimo de conciencia, comprensión o fiabilidad total.

## 10. Implicación para SOMA

La conclusión útil para SOMA es esta:

### SOMA no debe definirse solo como memoria persistente

También puede definirse como una arquitectura preparada para tres niveles de trabajo:

1. **Nivel actual**  
   Gestión externa del contexto, checkpoints, budgeting, poda y consolidación.

2. **Nivel intermedio**  
   Políticas activas de razonamiento bajo coste y presión de memoria.

3. **Nivel futuro**  
   Integración con proveedores o runtimes que permitan scratchpads mutables y señales dinámicas de recursos.

## 11. Conclusión

El camino no parece ser "más y más tokens visibles", sino una memoria de trabajo mejor gobernada.

La propuesta de este documento no es que SOMA ya tenga un `Mutable Scratchpad`.  
La propuesta es que **SOMA está conceptualmente alineado con esa dirección** porque:

- separa memoria de trabajo, registro y conocimiento;
- acepta que el contexto activo debe poder reconstruirse;
- trata el ruido como problema arquitectónico, no solo como coste;
- y abre la puerta a políticas de razonamiento guiadas por presupuesto.

Si el ecosistema de proveedores evoluciona hacia inferencia con zonas editables de trabajo, SOMA no quedará obsoleto. Al contrario:

**SOMA sería una de las arquitecturas más preparadas para integrarlo con sentido.**
