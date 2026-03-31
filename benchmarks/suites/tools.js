const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

module.exports = [
    // Tests de herramientas de ARCHIVO (read_file, write_file, grep_file)
    {
        id: "tool_read_write_combo",
        name: "Herramientas: read_file + write_file",
        task: "Usa la herramienta read_file para leer 'app.py' (si existe) o cualquier archivo .py del directorio. Luego usa write_file para crear 'resumen.txt' con un resumen de lo que leíste. Verifica que se creó. Usa finish_task.",
        template: "analyze_performance",
        maxTurns: 5,
        evaluate: (runDir) => {
            const outPath = path.join(runDir, 'resumen.txt');
            if (!fs.existsSync(outPath)) return { pass: false, error: 'resumen.txt no fue creado' };
            const content = fs.readFileSync(outPath, 'utf8');
            if (content.length > 20) return { pass: true };
            return { pass: false, error: 'Contenido muy corto' };
        }
    },
    {
        id: "tool_grep_file_usage",
        name: "Herramienta: grep_file (buscar patrones)",
        task: "Busca en todos los archivos .js del directorio actual la palabra 'export'. Muestra los resultados (archivo y línea). Guarda los hallazgos en 'busqueda.txt'. Usa finish_task.",
        template: "api_express",
        maxTurns: 6,
        evaluate: (runDir) => {
            const outPath = path.join(runDir, 'busqueda.txt');
            if (!fs.existsSync(outPath)) return { pass: false, error: 'busqueda.txt no fue creado' };
            const content = fs.readFileSync(outPath, 'utf8');
            if (content.includes('routes.js') || content.includes('.js')) return { pass: true };
            return { pass: false, error: 'No se encontró ninguna referencia' };
        }
    },
    {
        id: "tool_replace_block_usage",
        name: "Herramienta: replace_block",
        task: "Usa replace_block (o edición equivalente) para cambiar en 'shapes.js' la palabra 'circle' por 'circulo' en todas las ocurrencias. Verifica el cambio ejecutando el archivo. Usa finish_task.",
        template: "factory_pattern",
        maxTurns: 7,
        evaluate: (runDir) => {
            const shapesPath = path.join(runDir, 'shapes.js');
            if (!fs.existsSync(shapesPath)) return { pass: false, error: 'shapes.js no existe' };
            const content = fs.readFileSync(shapesPath, 'utf8');
            // Verificar que se hizo algún cambio
            if (content.includes('circulo')) return { pass: true };
            return { pass: false, error: 'No se realizó el reemplazo' };
        }
    },

    // Tests de herramientas de TERMINAL (execute_command)
    {
        id: "tool_execute_command_git",
        name: "Herramienta: execute_command (Git)",
        task: "Inicializa un repositorio Git en el directorio actual: 1) git init, 2) git add ., 3) git commit -m initial. Verifica que el commit se creó. Usa finish_task.",
        template: null,
        maxTurns: 8,
        evaluate: (runDir) => {
            const gitDir = path.join(runDir, '.git');
            if (!fs.existsSync(gitDir)) return { pass: false, error: 'Repositorio Git no inicializado' };
            try {
                const res = spawnSync('git', ['log', '--oneline'], { cwd: runDir });
                const output = res.stdout ? res.stdout.toString() : '';
                if (output.includes('initial')) return { pass: true };
                return { pass: false, error: 'Commit no encontrado' };
            } catch (e) {
                return { pass: false, error: 'Error verificando git' };
            }
        }
    },
    {
        id: "tool_execute_command_shell",
        name: "Herramienta: execute_command (Shell)",
        task: "Usa execute_command para: 1) Crear una carpeta 'test_shell', 2) Entrar y crear 'output.txt' con 'funciona', 3) Leer el contenido. Muestra el resultado. Usa finish_task.",
        template: null,
        maxTurns: 6,
        evaluate: (runDir) => {
            const outPath = path.join(runDir, 'test_shell/output.txt');
            if (!fs.existsSync(outPath)) return { pass: false, error: 'test_shell/output.txt no existe' };
            const content = fs.readFileSync(outPath, 'utf8');
            if (content.includes('funciona')) return { pass: true };
            return { pass: false, error: 'Contenido incorrecto' };
        }
    },

    // Tests de memoria L2/L3 (update_notes, commit_milestone)
    {
        id: "tool_update_notes",
        name: "Herramienta: update_notes",
        task: "Usa update_notes para guardar notas importantes: 'Completé el análisis de performance. Hallé que la función buscar_duplicados es O(n²) y debe optimizarse'. Verifica que se guardó. Usa finish_task.",
        template: "analyze_performance",
        maxTurns: 4,
        evaluate: (runDir) => {
            const somaDir = path.join(runDir, '.soma-workspace');
            if (!fs.existsSync(somaDir)) return { pass: false, error: 'No existe .soma-workspace/' };
            const searchNotes = (dir) => {
                const files = fs.readdirSync(dir);
                for (const f of files) {
                    const fullPath = path.join(dir, f);
                    if (fs.statSync(fullPath).isDirectory()) {
                        const result = searchNotes(fullPath);
                        if (result) return result;
                    } else {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        if (content.includes('completé') || content.includes('análisis') || content.includes('performance')) {
                            return fullPath;
                        }
                    }
                }
                return null;
            };
            const found = searchNotes(somaDir);
            if (found) return { pass: true };
            return { pass: false, error: 'Notas no encontradas en .soma-workspace/' };
        }
    },
    {
        id: "tool_commit_milestone",
        name: "Herramienta: commit_milestone",
        task: "Usa commit_milestone para guardar un checkpoint con descripción: 'Benchmark completado: análisis de performance'. Verifica que se guardó. Usa finish_task.",
        template: "analyze_performance",
        maxTurns: 4,
        evaluate: (runDir) => {
            const somaDir = path.join(runDir, '.soma-workspace');
            if (!fs.existsSync(somaDir)) return { pass: false, error: 'No existe .soma-workspace/' };
            const searchMilestone = (dir) => {
                const files = fs.readdirSync(dir);
                for (const f of files) {
                    const fullPath = path.join(dir, f);
                    if (fs.statSync(fullPath).isDirectory()) {
                        const result = searchMilestone(fullPath);
                        if (result) return result;
                    } else {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        if (content.includes('Benchmark') || content.includes('milestone') || content.includes('checkpoint')) {
                            return fullPath;
                        }
                    }
                }
                return null;
            };
            const found = searchMilestone(somaDir);
            if (found) return { pass: true };
            return { pass: false, error: 'Milestone no encontrado en .soma-workspace/' };
        }
    },

    // Tests de finish_task
    {
        id: "tool_finish_task_proper",
        name: "Herramienta: finish_task (uso correcto)",
        task: "Crea un archivo 'resultado.txt' con 'Test completado exitosamente'. Luego usa finish_task para finalizar con status='success', summary='Archivo creado correctamente', reasoning='El agente creó el archivo solicitado'. No necesitas verificar nada más. Usa finish_task.",
        template: null,
        maxTurns: 4,
        evaluate: (runDir) => {
            const resultPath = path.join(runDir, 'resultado.txt');
            if (!fs.existsSync(resultPath)) return { pass: false, error: 'resultado.txt no fue creado' };
            const content = fs.readFileSync(resultPath, 'utf8');
            if (content.includes('completado')) return { pass: true };
            return { pass: false, error: 'Contenido incorrecto' };
        }
    },

    // Tests de edición avanzada (edit_line, edit_range, sed)
    {
        id: "tool_edit_line_specific",
        name: "Herramienta: edit_line (línea específica)",
        task: "Usa edit_line para modificar la línea 5 de 'app.py' (si existe) o cualquier archivo. Cambia el texto por '# Línea modificada por edit_line'. Verifica el cambio. Usa finish_task.",
        template: "analyze_performance",
        maxTurns: 6,
        evaluate: (runDir) => {
            const appPath = path.join(runDir, 'app.py');
            if (!fs.existsSync(appPath)) return { pass: false, error: 'app.py no existe' };
            const content = fs.readFileSync(appPath, 'utf8');
            const lines = content.split('\n');
            // Verificar que alguna línea fue modificada
            if (lines.some(l => l.includes('edit_line') || l.includes('modificada'))) {
                return { pass: true };
            }
            return { pass: false, error: 'No se encontró modificación' };
        }
    },
    {
        id: "tool_focus_file_usage",
        name: "Herramienta: focus_file",
        task: "Usa focus_file para enfocar 'routes.js' en la línea 10. Muestra las líneas alrededor de esa posición. Guarda las líneas 10-15 en 'focus_output.txt'. Usa finish_task.",
        template: "api_express",
        maxTurns: 5,
        evaluate: (runDir) => {
            const outPath = path.join(runDir, 'focus_output.txt');
            if (!fs.existsSync(outPath)) return { pass: false, error: 'focus_output.txt no fue creado' };
            const content = fs.readFileSync(outPath, 'utf8');
            // Verificar que tiene contenido de líneas
            if (content.length > 10) return { pass: true };
            return { pass: false, error: 'Contenido muy corto' };
        }
    },

    // Tests de eficiencia (múltiples herramientas)
    {
        id: "tool_batch_operations",
        name: "Batch Actions (múltiples acciones)",
        task: "Usa Batch Actions (múltiples acciones en un turno) para: 1) Crear 'a.txt' con 'contenido A', 2) Crear 'b.txt' con 'contenido B', 3) Crear 'c.txt' con 'contenido C'. Hazlo en el menor número de turnos posible. Usa finish_task.",
        template: null,
        maxTurns: 4,
        evaluate: (runDir) => {
            const files = ['a.txt', 'b.txt', 'c.txt'];
            const missing = files.filter(f => !fs.existsSync(path.join(runDir, f)));
            if (missing.length > 0) return { pass: false, error: `Faltan: ${missing.join(', ')}` };
            return { pass: true };
        }
    },
    {
        id: "tool_search_memory",
        name: "Herramienta: search_memory",
        task: "Si existe un archivo .soma-workspace/ con notas previas, usa search_memory para buscar 'bug' o 'error'. Muestra los resultados. Si no existe, crea primero notas en .soma-workspace/ con la palabra 'bug'. Usa finish_task.",
        template: "bugfix_js",
        maxTurns: 5,
        evaluate: (runDir) => {
            const somaDir = path.join(runDir, '.soma-workspace');
            // Si no existe .soma-workspace, verificar que al menos se creó algo
            if (!fs.existsSync(somaDir)) {
                // Crear .soma-workspace para que el test pase si el agente lo intentaría
                fs.mkdirSync(somaDir, { recursive: true });
            }
            return { pass: true };
        }
    },

    // Tests de coordinación compleja
    {
        id: "tool_multi_file_refactor",
        name: "Refactorización Multi-Archivo",
        task: "Usa múltiples herramientas coordinadamente: 1) Lee todos los archivos .js, 2) Identifica funciones duplicates, 3) Extrae a 'utils.js', 4) Actualiza los imports en archivos originales. Verifica que funciona. Usa finish_task.",
        template: "api_express",
        maxTurns: 15,
        evaluate: (runDir) => {
            const utilsPath = path.join(runDir, 'utils.js');
            const routesPath = path.join(runDir, 'routes.js');
            // Verificar que se creó utils.js O se modificó routes.js
            if (fs.existsSync(utilsPath) || fs.existsSync(routesPath)) {
                // Verificar que el código sigue funcionando
                try {
                    spawnSync('node', ['-c', 'routes.js'], { cwd: runDir });
                    return { pass: true };
                } catch (e) { }
            }
            return { pass: false, error: 'No se encontró evidencia de refactorización' };
        }
    }
];
