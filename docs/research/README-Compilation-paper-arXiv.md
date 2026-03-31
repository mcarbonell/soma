# Instrucciones de Compilación: SOMA Research Paper

Este documento contiene las instrucciones necesarias para compilar el paper de investigación de **SOMA** a partir del archivo fuente LaTeX (`SOMA-Paper.tex`).

## Requisitos Previos

Ya hemos instalado **MiKTeX** en tu sistema. El ejecutable principal se encuentra en:
`C:\Users\mrcm_\AppData\Local\Programs\MiKTeX\miktex\bin\x64\pdflatex.exe`

## Cómo Compilar (Línea de Comandos)

Para generar el PDF actualizado, abre una terminal (PowerShell o Bash) en la raíz del proyecto y ejecuta el siguiente comando:

```bash
# Comando para compilar el PDF
"C:\Users\mrcm_\AppData\Local\Programs\MiKTeX\miktex\bin\x64\pdflatex.exe" -interaction=nonstopmode -output-directory=docs/research docs/research/SOMA-Paper.tex
```

> [!TIP]
> **Importante:** LaTeX requiere a veces **dos pasadas** de compilación para que las referencias cruzadas (\ref, \cite) y el índice de contenidos aparezcan correctamente. Si ves signos de interrogación `??` en el PDF, simplemente ejecuta el comando una segunda vez.

## Archivos Generados

Tras la compilación, encontrarás los siguientes archivos en `docs/research/`:

*   `SOMA-Paper.pdf`: El documento final listo para leer o subir a arXiv.
*   `SOMA-Paper.log`: Registro detallado de la compilación (útil para depurar errores).
*   `SOMA-Paper.aux`: Archivo auxiliar de LaTeX para referencias.
*   `SOMA-Paper.out`: Archivo auxiliar para hipervínculos del PDF.

## Edición de Resultados Experimentales

Cuando realices las **pruebas reales (Stunts)**, abre el archivo `SOMA-Paper.tex` y busca la sección:
`\section{Experiment: The Bootstrapping Chain}`

Puedes actualizar los datos de:
*   Número de turnos (`1,350 turns`).
*   Duración (`21 hours`).
*   Resultados específicos de las Fases 1, 2 y 3.

## Visualización Recomendada

Para una experiencia de edición profesional, te recomiendo:
1.  **Overleaf:** Puedes subir el `.tex` a [Overleaf.com](https://www.overleaf.com) para editarlo en la nube.
2.  **VS Code + LaTeX Workshop:** Instala la extensión "LaTeX Workshop" en VS Code para tener previsualización en tiempo real.

---
**Autor:** Mario Raúl Carbonell Martínez  
**Proyecto:** SOMA (Sovereign Operative Memory Architecture)
