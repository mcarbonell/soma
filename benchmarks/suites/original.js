const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

module.exports = [
    // ===== BENCHMARKS ORIGINALES =====
    {
        id: "create_python_cli",
        name: "Crear CLI Python",
        task: "Crea un script python 'gestor_tareas.py' que acepte comandos 'add', 'list'. Almacena los tags (que deben ser parámetros opcionales) de forma persistente en 'tareas.json'. Muestra que funciona. Guarda notas y usa finish_task.",
        template: null,
        maxTurns: 10,
        evaluate: (runDir) => {
            const cliPath = path.join(runDir, 'gestor_tareas.py');
            if (!fs.existsSync(cliPath)) return { pass: false, error: 'gestor_tareas.py no fue creado' };
            try {
                const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
                spawnSync('python', ['gestor_tareas.py', 'add', 'Prueba benchmark'], { cwd: runDir, env });
                const res = spawnSync('python', ['gestor_tareas.py', 'list'], { cwd: runDir, env });
                const output = res.stdout;
                if (output && output.toString().includes('Prueba benchmark')) return { pass: true };
                return { pass: false, error: 'La tarea no se listó correctamente tras añadirla.' };
            } catch (e) {
                return { pass: false, error: 'Error ejecutando python:\n' + e.message };
            }
        }
    },
    {
        id: "bugfix_js",
        name: "Caza de Bugs (JS)",
        task: "En tu entorno de workspace actual hay un archivo 'calculadora.js' con un bug intencionado (da error en una resta específica) que provoca que falle 'test_calculadora.js'. Ejecuta el test, encuentra el bug en el código fuente usando comandos, arréglalo para que el test pase de forma limpia (status 0) y finaliza la tarea con finish_task.",
        template: "bugfix_js",
        maxTurns: 8,
        evaluate: (runDir) => {
            try {
                const res = spawnSync('node', ['test_calculadora.js'], { cwd: runDir });
                if (res.status === 0) return { pass: true };
                return { pass: false, error: 'El test sigue fallando tras la ejecución del agente.' };
            } catch (e) {
                return { pass: false, error: 'Error ejecutando node:\n' + e.message };
            }
        }
    },

    // ===== BENCHMARK NIVEL EASY: Tareas Cortas y Atómicas =====
    {
        id: "organize_files_by_extension",
        name: "Organizar Archivos por Extensión",
        task: "En el directorio actual hay archivos con diferentes extensiones (.txt, .png, .pdf, .py, .json). Organízalos en carpetas separadas por tipo: 'textos/', 'imagenes/', 'documentos/', 'scripts/', 'datos/'. No borres los archivos, solo muévelos a las carpetas correspondientes. Usa finish_task cuando termines.",
        template: "organize_files",
        maxTurns: 6,
        evaluate: (runDir) => {
            const requiredDirs = ['textos', 'imagenes', 'documentos', 'scripts', 'datos'];
            for (const dir of requiredDirs) {
                const dirPath = path.join(runDir, dir);
                if (!fs.existsSync(dirPath)) {
                    return { pass: false, error: `Directorio '${dir}/' no existe` };
                }
            }
            // Verificar que los archivos fueron movidos
            const textosDir = path.join(runDir, 'textos');
            const archivosEnTextos = fs.readdirSync(textosDir);
            if (!archivosEnTextos.some(f => f.endsWith('.txt'))) {
                return { pass: false, error: 'No se movieron archivos .txt a textos/' };
            }
            return { pass: true };
        }
    },
    {
        id: "create_readme_file",
        name: "Crear Archivo README",
        task: "Crea un archivo 'README.md' en el directorio actual con: 1) Título del proyecto, 2) Una descripción de 2-3 oraciones, 3) Una lista de instalación, 4) Una lista de uso. Usa finish_task cuando termines.",
        template: null,
        maxTurns: 5,
        evaluate: (runDir) => {
            const readmePath = path.join(runDir, 'README.md');
            if (!fs.existsSync(readmePath)) return { pass: false, error: 'README.md no fue creado' };
            const content = fs.readFileSync(readmePath, 'utf8');
            if (content.length < 100) return { pass: false, error: 'README.md tiene muy poco contenido' };
            if (!content.includes('#')) return { pass: false, error: 'README.md no tiene título' };
            return { pass: true };
        }
    },
    {
        id: "simple_json_parser",
        name: "Parser JSON Simple",
        task: "Crea un script Python 'parser.py' que lea un archivo JSON llamado 'entrada.json', extraiga el campo 'nombre' y lo imprima. Luego crea 'entrada.json' con {\"nombre\": \"SOMA Benchmark\", \"valor\": 42}. Ejecuta el script y muestra el resultado. Usa finish_task.",
        template: null,
        maxTurns: 6,
        evaluate: (runDir) => {
            const parserPath = path.join(runDir, 'parser.py');
            const entradaPath = path.join(runDir, 'entrada.json');
            if (!fs.existsSync(parserPath) || !fs.existsSync(entradaPath)) {
                return { pass: false, error: 'No se crearon los archivos necesarios' };
            }
            try {
                const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
                const res = spawnSync('python', ['parser.py'], { cwd: runDir, env });
                const output = res.stdout ? res.stdout.toString() : '';
                if (output.includes('SOMA Benchmark')) return { pass: true };
                return { pass: false, error: 'El script no imprimió el nombre correcto' };
            } catch (e) {
                return { pass: false, error: 'Error ejecutando parser.py' };
            }
        }
    },

    // ===== BENCHMARK NIVEL MEDIUM: Razonamiento y Modificación =====
    {
        id: "analyze_performance_bottleneck",
        name: "Análisis de Rendimiento Python",
        task: "En el archivo 'app.py' hay funciones con problemas de rendimiento. Analiza el código, identifica la función más ineficiente (buscar_duplicados tiene O(n²)), añade logs de tiempo al inicio y fin de cada función usando el módulo 'time' de Python (sin librerías externas), ejecuta el script y muestra los resultados. No modifiques la lógica de las funciones. Usa finish_task.",
        template: "analyze_performance",
        maxTurns: 10,
        evaluate: (runDir) => {
            const appPath = path.join(runDir, 'app.py');
            if (!fs.existsSync(appPath)) return { pass: false, error: 'app.py no existe' };
            const content = fs.readFileSync(appPath, 'utf8');
            // Verificar que se añadieron logs de tiempo
            if (!content.includes('time.time()') && !content.includes('start = time.time')) {
                return { pass: false, error: 'No se encontraron logs de tiempo en el código' };
            }
            try {
                const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
                const res = spawnSync('python', ['app.py'], { cwd: runDir, env, timeout: 10000 });
                const output = res.stdout ? res.stdout.toString() : '';
                if (output.length > 0 && (output.includes('Tiempo') || output.includes('time') || output.includes('0.'))) {
                    return { pass: true };
                }
                return { pass: false, error: 'El script no mostró timing de ejecución' };
            } catch (e) {
                return { pass: false, error: 'Error ejecutando app.py' };
            }
        }
    },
    {
        id: "regex_data_extraction",
        name: "Extracción de Datos con Regex",
        task: "Crea un script Python 'extractor.py' que reciba un texto con emails y teléfonos, use regex para extraer TODOS los emails y teléfonos, y guarde los resultados en 'resultados.json' con keys 'emails' y 'telefonos'. El texto de prueba: 'Contacta a juan@email.com o maria@test.org. Tel: 612345678, 911-222-333'. Ejecuta y verifica. Usa finish_task.",
        template: null,
        maxTurns: 8,
        evaluate: (runDir) => {
            const extractorPath = path.join(runDir, 'extractor.py');
            const resultadosPath = path.join(runDir, 'resultados.json');
            if (!fs.existsSync(extractorPath)) return { pass: false, error: 'extractor.py no fue creado' };
            try {
                const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
                spawnSync('python', ['extractor.py'], { cwd: runDir, env });
                if (!fs.existsSync(resultadosPath)) return { pass: false, error: 'resultados.json no fue creado' };
                const data = JSON.parse(fs.readFileSync(resultadosPath, 'utf8'));
                if (!data.emails || data.emails.length < 2) return { pass: false, error: 'No se extrajeron los emails correctamente' };
                if (!data.telefonos || data.telefonos.length < 2) return { pass: false, error: 'No se extrajeron los teléfonos correctamente' };
                return { pass: true };
            } catch (e) {
                return { pass: false, error: 'Error en la ejecución: ' + e.message };
            }
        }
    },
    {
        id: "modify_api_middleware",
        name: "Modificar Middleware Express",
        task: "En el archivo 'routes.js' hay un middleware que registra requests. Añade un nuevo endpoint GET /api/health que devuelva {status: 'ok', timestamp: <fecha_actual>}. No uses librerías externas para la fecha. Ejecuta 'node -c routes.js' para verificar sintaxis. Usa finish_task.",
        template: "api_express",
        maxTurns: 8,
        evaluate: (runDir) => {
            const routesPath = path.join(runDir, 'routes.js');
            if (!fs.existsSync(routesPath)) return { pass: false, error: 'routes.js no existe' };
            const content = fs.readFileSync(routesPath, 'utf8');
            // Verificar que existe el endpoint health
            if (!content.includes('/api/health') && !content.includes("/health")) {
                return { pass: false, error: 'No se encontró el endpoint /api/health' };
            }
            // Verificar sintaxis
            try {
                const res = spawnSync('node', ['-c', 'routes.js'], { cwd: runDir });
                if (res.status !== 0) return { pass: false, error: 'Syntax error en routes.js' };
                return { pass: true };
            } catch (e) {
                return { pass: false, error: 'Error verificando sintaxis' };
            }
        }
    },

    // ===== BENCHMARK NIVEL HARD: Contexto Largo y Complejo =====
    {
        id: "generate_api_documentation",
        name: "Generar Documentación API Express",
        task: "Analiza los archivos del proyecto Express en el directorio actual. Hay un archivo 'routes.js' con endpoints de usuarios, productos y pedidos. Genera un archivo 'README_API.md' que documente: 1) Todos los endpoints disponibles (ruta, método, descripción), 2) Los schemas de validación para cada entidad, 3) Ejemplos de request/response para cada endpoint. Usa finish_task.",
        template: "api_express",
        maxTurns: 12,
        evaluate: (runDir) => {
            const readmePath = path.join(runDir, 'README_API.md');
            if (!fs.existsSync(readmePath)) return { pass: false, error: 'README_API.md no fue creado' };
            const content = fs.readFileSync(readmePath, 'utf8');
            // Verificar contenido mínimo
            if (content.length < 500) return { pass: false, error: 'README_API.md tiene muy poco contenido' };
            // Verificar que menciona los endpoints principales
            const requiredTerms = ['/users', '/products', '/orders', 'GET', 'POST'];
            const missingTerms = requiredTerms.filter(t => !content.includes(t));
            if (missingTerms.length > 2) {
                return { pass: false, error: `Faltan términos importantes: ${missingTerms.join(', ')}` };
            }
            return { pass: true };
        }
    },
    {
        id: "migrate_csv_to_json",
        name: "Migración de CSV a JSON",
        task: "El archivo 'datos_viejos.csv' contiene datos de usuarios. Crea un script Python 'migracion.py' que: 1) Lea el CSV, 2) Transforme los datos a formato JSON con estructura {usuarios: [{id, nombre, email, edad, ciudad}]}, 3) Guarde el resultado en 'usuarios.json'. Ejecuta el script y verifica que 'usuarios.json' tenga 5 usuarios. Usa finish_task.",
        template: "data_migration",
        maxTurns: 10,
        evaluate: (runDir) => {
            const migracionPath = path.join(runDir, 'migracion.py');
            const csvPath = path.join(runDir, 'datos_viejos.csv');
            const jsonPath = path.join(runDir, 'usuarios.json');
            if (!fs.existsSync(csvPath)) return { pass: false, error: 'datos_viejos.csv no existe' };
            try {
                const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
                const res = spawnSync('python', ['migracion.py'], { cwd: runDir, env });
                if (!fs.existsSync(jsonPath)) return { pass: false, error: 'usuarios.json no fue creado' };
                const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                if (!data.usuarios || data.usuarios.length !== 5) {
                    return { pass: false, error: `Se esperaban 5 usuarios, encontrados: ${data.usuarios?.length || 0}` };
                }
                return { pass: true };
            } catch (e) {
                return { pass: false, error: 'Error en migración: ' + e.message };
            }
        }
    },
    {
        id: "security_vulnerability_scan",
        name: "Auditoría de Seguridad",
        task: "El archivo 'app.js' tiene vulnerabilidades de seguridad intencionadas. Analiza el código e identifica: 1) SQL Injection, 2) XSS, 3) Command Injection, 4) Path Traversal, 5) Secrets hardcodeados. Crea un archivo 'INFORME_SEGURIDAD.md' que liste cada vulnerabilidad con: descripción, línea affected (aproximada), y recomendación de fix. Usa finish_task.",
        template: "security_audit",
        maxTurns: 12,
        evaluate: (runDir) => {
            const informePath = path.join(runDir, 'INFORME_SEGURIDAD.md');
            if (!fs.existsSync(informePath)) return { pass: false, error: 'INFORME_SEGURIDAD.md no fue creado' };
            const content = fs.readFileSync(informePath, 'utf8');
            // Verificar que menciona las vulnerabilidades principales
            const vulnTerms = ['SQL', 'XSS', 'Injection', 'Path', 'Traversal', 'hardcoded', 'secret'];
            const foundTerms = vulnTerms.filter(t => content.toLowerCase().includes(t.toLowerCase()));
            if (foundTerms.length < 4) {
                return { pass: false, error: `El informe no menciona suficientes vulnerabilidades. Encontradas: ${foundTerms.length}` };
            }
            return { pass: true };
        }
    },

    // ===== BENCHMARK NIVEL EXTREME: Optimización de Acciones =====
    {
        id: "factory_pattern_refactor",
        name: "Refactorización a Patrón Factory",
        task: "El archivo 'shapes.js' tiene clases (Circle, Rectangle, Triangle, Square). Refactoriza el código para usar un patrón Factory: crea una función 'ShapeFactory.create(type, params)' que retorne la instancia correcta. Los tests existentes deben seguir funcionando (ejecuta 'node shapes.js' para verificar). Actualiza el código y usa finish_task.",
        template: "factory_pattern",
        maxTurns: 15,
        evaluate: (runDir) => {
            const shapesPath = path.join(runDir, 'shapes.js');
            if (!fs.existsSync(shapesPath)) return { pass: false, error: 'shapes.js no existe' };
            const content = fs.readFileSync(shapesPath, 'utf8');
            // Verificar que existe el factory
            if (!content.includes('ShapeFactory') && !content.includes('create')) {
                return { pass: false, error: 'No se encontró el patrón Factory en el código' };
            }
            try {
                const res = spawnSync('node', ['shapes.js'], { cwd: runDir, timeout: 5000 });
                if (res.status !== 0) return { pass: false, error: 'Los tests fallan tras la refactorización' };
                const output = res.stdout ? res.stdout.toString() : '';
                if (!output.includes('tests pasaron')) {
                    return { pass: false, error: 'La salida no confirma que los tests pasaron' };
                }
                return { pass: true };
            } catch (e) {
                return { pass: false, error: 'Error ejecutando shapes.js: ' + e.message };
            }
        }
    },
    {
        id: "multi_step_data_pipeline",
        name: "Pipeline de Datos Multi-Paso",
        task: "Crea un pipeline de procesamiento de datos en Python: 1) 'descargar.py' que genere datos.json con 100 registros {id, valor, categoria}, 2) 'transformar.py' que lea datos.json, filtre registros con valor > 50, y guarde en 'filtrados.json', 3) 'resumir.py' que lea filtrados.json y genere 'resumen.txt' con estadísticas. Ejecuta los 3 scripts en orden y verifica los resultados. Usa finish_task.",
        template: null,
        maxTurns: 18,
        evaluate: (runDir) => {
            const files = ['descargar.py', 'transformar.py', 'resumir.py', 'datos.json', 'filtrados.json', 'resumen.txt'];
            const missingFiles = files.filter(f => !fs.existsSync(path.join(runDir, f)));
            if (missingFiles.length > 0) {
                return { pass: false, error: `Faltan archivos: ${missingFiles.join(', ')}` };
            }
            try {
                const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
                // Ejecutar pipeline completo
                spawnSync('python', ['descargar.py'], { cwd: runDir, env });
                spawnSync('python', ['transformar.py'], { cwd: runDir, env });
                spawnSync('python', ['resumir.py'], { cwd: runDir, env });

                // Verificar contenido de resumen.txt
                const resumenPath = path.join(runDir, 'resumen.txt');
                const resumen = fs.readFileSync(resumenPath, 'utf8');
                if (resumen.length < 10) return { pass: false, error: 'resumen.txt está vacío o casi vacío' };

                // Verificar que filtrados.json tiene menos registros que datos.json
                const datos = JSON.parse(fs.readFileSync(path.join(runDir, 'datos.json'), 'utf8'));
                const filtrados = JSON.parse(fs.readFileSync(path.join(runDir, 'filtrados.json'), 'utf8'));
                if (filtrados.length >= datos.length) {
                    return { pass: false, error: 'El filtro no redujo los registros' };
                }
                return { pass: true };
            } catch (e) {
                return { pass: false, error: 'Error en el pipeline: ' + e.message };
            }
        }
    },

    // ===== BENCHMARKS ADICIONALES - LOTE 2 =====

    // EASY: Tests adicionales de tareas simples
    {
        id: "create_gitignore",
        name: "Crear .gitignore",
        task: "Crea un archivo '.gitignore' con entradas típicas para un proyecto Python/Node: node_modules/, __pycache__/, *.pyc, .env, *.log, dist/, build/. Verifica que se creó correctamente. Usa finish_task.",
        template: null,
        maxTurns: 4,
        evaluate: (runDir) => {
            const gitignorePath = path.join(runDir, '.gitignore');
            if (!fs.existsSync(gitignorePath)) return { pass: false, error: '.gitignore no fue creado' };
            const content = fs.readFileSync(gitignorePath, 'utf8');
            const required = ['node_modules', '__pycache__', '.env'];
            const missing = required.filter(r => !content.includes(r));
            if (missing.length > 1) return { pass: false, error: 'Faltan entradas típicas en .gitignore' };
            return { pass: true };
        }
    },
    {
        id: "file_line_count",
        name: "Contar Líneas de Archivo",
        task: "Crea un script Python 'contador.py' que lea cualquier archivo de texto pasado como argumento y muestre el número de líneas. Pruébalo con 'README.md' o cualquier archivo existente. Usa finish_task.",
        template: null,
        maxTurns: 5,
        evaluate: (runDir) => {
            const scriptPath = path.join(runDir, 'contador.py');
            if (!fs.existsSync(scriptPath)) return { pass: false, error: 'contador.py no fue creado' };
            // Crear archivo de prueba
            fs.writeFileSync(path.join(runDir, 'test.txt'), 'línea1\nlínea2\nlínea3');
            try {
                const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
                const res = spawnSync('python', ['contador.py', 'test.txt'], { cwd: runDir, env });
                const output = res.stdout ? res.stdout.toString() : '';
                if (output.includes('3')) return { pass: true };
                return { pass: false, error: 'No contó correctamente las líneas' };
            } catch (e) {
                return { pass: false, error: 'Error ejecutando script' };
            }
        }
    },
    {
        id: "merge_json_files",
        name: "Combinar Archivos JSON",
        task: "Crea dos archivos JSON: 'datos1.json' con {a: 1, b: 2} y 'datos2.json' con {b: 3, c: 4}. Luego crea 'fusionar.py' que los combine en uno solo con los valores de datos2 sobrescribiendo datos1. El resultado debe ser {a:1, b:3, c:4}. Muestra el resultado. Usa finish_task.",
        template: null,
        maxTurns: 7,
        evaluate: (runDir) => {
            const fusionarPath = path.join(runDir, 'fusionar.py');
            const resultadoPath = path.join(runDir, 'resultado.json');
            if (!fs.existsSync(fusionarPath)) return { pass: false, error: 'fusionar.py no fue creado' };
            try {
                const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
                spawnSync('python', ['fusionar.py'], { cwd: runDir, env });
                if (!fs.existsSync(resultadoPath)) return { pass: false, error: 'resultado.json no fue creado' };
                const data = JSON.parse(fs.readFileSync(resultadoPath, 'utf8'));
                if (data.a === 1 && data.b === 3 && data.c === 4) return { pass: true };
                return { pass: false, error: 'La fusión no fue correcta' };
            } catch (e) {
                return { pass: false, error: 'Error: ' + e.message };
            }
        }
    },

    // MEDIUM: Tests de lógica y razonamiento
    {
        id: "find_prime_numbers",
        name: "Encontrar Números Primos",
        task: "Crea un script Python 'primos.py' que encuentre todos los primos entre 1 y 100 usando el método de Sieve of Eratosthenes (sin librerías externas). Guarda los primos en 'primos.json'. Verifica el resultado (debe haber 25 primos). Usa finish_task.",
        template: null,
        maxTurns: 8,
        evaluate: (runDir) => {
            const primosPath = path.join(runDir, 'primos.py');
            const jsonPath = path.join(runDir, 'primos.json');
            if (!fs.existsSync(primosPath)) return { pass: false, error: 'primos.py no fue creado' };
            try {
                const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
                spawnSync('python', ['primos.py'], { cwd: runDir, env });
                if (!fs.existsSync(jsonPath)) return { pass: false, error: 'primos.json no fue creado' };
                const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                if (data.primos && data.primos.length === 25) return { pass: true };
                return { pass: false, error: 'Número incorrecto de primos: ' + (data.primos?.length || 0) };
            } catch (e) {
                return { pass: false, error: 'Error: ' + e.message };
            }
        }
    },
    {
        id: "code_review_suggestions",
        name: "Revisión de Código",
        task: "El archivo 'app.js' tiene código con posibles mejoras. Analízalo y crea un archivo 'REVIEW.md' con: 1) Lista de posibles bugs, 2) Sugerencias de mejora, 3) Código refactorizado si es necesario. Nobmodifiques app.js original. Usa finish_task.",
        template: "security_audit",
        maxTurns: 10,
        evaluate: (runDir) => {
            const reviewPath = path.join(runDir, 'REVIEW.md');
            if (!fs.existsSync(reviewPath)) return { pass: false, error: 'REVIEW.md no fue creado' };
            const content = fs.readFileSync(reviewPath, 'utf8');
            if (content.length < 100) return { pass: false, error: 'REVIEW.md muy corto' };
            return { pass: true };
        }
    },
    {
        id: "calculate_statistics",
        name: "Estadísticas de Datos",
        task: "Crea un script Python 'estadisticas.py' que lea 'datos.csv' (o géneralo si no existe con 10 números), calcule y muestre: media, mediana, desviación estándar, min y max. Guarda resultados en 'stats.json'. Usa finish_task.",
        template: "data_migration",
        maxTurns: 8,
        evaluate: (runDir) => {
            const statsPath = path.join(runDir, 'estadisticas.py');
            const jsonPath = path.join(runDir, 'stats.json');
            if (!fs.existsSync(statsPath)) return { pass: false, error: 'estadisticas.py no fue creado' };
            try {
                const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
                spawnSync('python', ['estadisticas.py'], { cwd: runDir, env });
                if (!fs.existsSync(jsonPath)) return { pass: false, error: 'stats.json no fue creado' };
                const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                if (data.media !== undefined && data.mediana !== undefined) return { pass: true };
                return { pass: false, error: 'Faltan campos en stats.json' };
            } catch (e) {
                return { pass: false, error: 'Error: ' + e.message };
            }
        }
    },

    // HARD: Tests complejos de navegación de código
    {
        id: "analyze_codebase_structure",
        name: "Análisis de Estructura de Proyecto",
        task: "Analiza el proyecto Express en el directorio actual (routes.js). Crea un archivo 'ESTRUCTURA.md' que document: 1) Estructura de archivos, 2) Dependencias entre módulos, 3) Lista de funciones exportadas, 4) Flujo de datos. Usa finish_task.",
        template: "api_express",
        maxTurns: 12,
        evaluate: (runDir) => {
            const estructuraPath = path.join(runDir, 'ESTRUCTURA.md');
            if (!fs.existsSync(estructuraPath)) return { pass: false, error: 'ESTRUCTURA.md no fue creado' };
            const content = fs.readFileSync(estructuraPath, 'utf8');
            if (content.length < 200) return { pass: false, error: 'Documentación muy corta' };
            return { pass: true };
        }
    },
    {
        id: "create_unit_tests",
        name: "Crear Tests Unitarios",
        task: "Crea tests unitarios con Jest o unittest (Python) para las funciones en 'shapes.js'. Crea 'shapes.test.js' con al menos 3 tests: uno para Circle.area(), uno para Rectangle.area(), uno para perimeter. Ejecuta los tests. Usa finish_task.",
        template: "factory_pattern",
        maxTurns: 15,
        evaluate: (runDir) => {
            const testPath = path.join(runDir, 'shapes.test.js');
            if (!fs.existsSync(testPath)) return { pass: false, error: 'shapes.test.js no fue creado' };
            try {
                // Intentar detectar si usa Jest vía package.json
                const pkgPath = path.join(runDir, 'package.json');
                let useJest = false;
                if (fs.existsSync(pkgPath)) {
                    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                    if (pkg.devDependencies?.jest || pkg.dependencies?.jest || pkg.scripts?.test?.includes('jest')) {
                        useJest = true;
                    }
                }

                const cmd = useJest ? 'npx' : 'node';
                const args = useJest ? ['jest', 'shapes.test.js', '--ci'] : ['shapes.test.js'];

                const res = spawnSync(cmd, args, { cwd: runDir, timeout: 10000 });
                if (res.status === 0) return { pass: true };
                return { pass: false, error: `Los tests fallaron (Exit code: ${res.status}). Output: ${res.stderr?.toString()}` };
            } catch (e) {
                return { pass: false, error: 'Error ejecutando tests: ' + e.message };
            }
        }
    },
    {
        id: "error_handling_improvement",
        name: "Mejorar Manejo de Errores",
        task: "El archivo 'app.py' no tiene manejo de errores. Añádelo: envuelve las llamadas a funciones en try/catch, agrega mensajes de error descriptivos, y crea un archivo 'errores.log' cuando ocurran excepciones. Ejecuta el script para verificar. Usa finish_task.",
        template: "analyze_performance",
        maxTurns: 12,
        evaluate: (runDir) => {
            const appPath = path.join(runDir, 'app.py');
            const content = fs.readFileSync(appPath, 'utf8');
            if (!content.includes('try:') && !content.includes('except')) {
                return { pass: false, error: 'No se añadió manejo de errores' };
            }
            try {
                const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
                const res = spawnSync('python', ['app.py'], { cwd: runDir, env, timeout: 10000 });
                if (res.status === 0) return { pass: true };
                return { pass: false, error: 'El script falla tras añadir errores' };
            } catch (e) {
                return { pass: false, error: 'Error ejecutando' };
            }
        }
    },

    // EXTREME: Tests de optimización y coordinación
    {
        id: "microservice_docker_setup",
        name: "Configurar Docker Compose",
        task: "Crea un archivo 'docker-compose.yml' con dos servicios: una API (Node/Express) y una DB (PostgreSQL o MongoDB). Configura volúmenes, puertos y variables de entorno. No necesitas ejecutar Docker, solo crear los archivos de configuración válidos. Usa finish_task.",
        template: null,
        maxTurns: 10,
        evaluate: (runDir) => {
            const composePath = path.join(runDir, 'docker-compose.yml');
            if (!fs.existsSync(composePath)) return { pass: false, error: 'docker-compose.yml no fue creado' };
            const content = fs.readFileSync(composePath, 'utf8');
            const hasServices = content.includes('services:') || content.includes('version:');
            const hasDb = content.includes('postgres') || content.includes('mongo');
            if (!hasServices || !hasDb) return { pass: false, error: 'Faltan servicios o DB' };
            return { pass: true };
        }
    },
    {
        id: "end_to_end_test_setup",
        name: "Setup Tests E2E Completos",
        task: "Crea una suite de tests E2E completa para la API Express: 1) Instala jest y supertest (o pytest y requests), 2) Crea 'e2e.test.js' con tests para GET /users, POST /users, GET /products. 3) Ejecuta los tests. Usa finish_task.",
        template: "api_express",
        maxTurns: 18,
        evaluate: (runDir) => {
            const testPath = path.join(runDir, 'e2e.test.js');
            const packagePath = path.join(runDir, 'package.json');
            if (!fs.existsSync(testPath)) return { pass: false, error: 'e2e.test.js no fue creado' };
            if (!fs.existsSync(packagePath)) return { pass: false, error: 'package.json no existe' };
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            const hasJest = pkg.devDependencies && pkg.devDependencies.jest;
            if (!hasJest) return { pass: false, error: 'Jest no está en devDependencies' };
            return { pass: true };
        }
    },
    {
        id: "ci_cd_pipeline_creation",
        name: "Crear Pipeline CI/CD",
        task: "Crea un pipeline de CI/CD completo en '.github/workflows/ci.yml': 1) Instalar dependencias, 2) Run tests (pytest o jest), 3) Build, 4) Deploy a producción (simulado). Incluye configuración de Node y Python. Usa finish_task.",
        template: null,
        maxTurns: 12,
        evaluate: (runDir) => {
            const workflowPath = path.join(runDir, '.github/workflows/ci.yml');
            if (!fs.existsSync(workflowPath)) return { pass: false, error: 'ci.yml no fue creado' };
            const content = fs.readFileSync(workflowPath, 'utf8');
            const hasSteps = content.includes('steps:') && content.includes('run:');
            const hasTest = content.includes('test') || content.includes('pytest');
            if (!hasSteps || !hasTest) return { pass: false, error: 'Pipeline incompleto' };
            return { pass: true };
        }
    },

    // ===== BENCHMARKS LOTE 3: Tests Especiales SOMA =====

    // EASY: Tests de uso eficiente de herramientas
    {
        id: "minimal_file_operations",
        name: "Operaciones Mínimas de Archivo",
        task: "Crea un archivo 'resultado.txt' con el texto 'Hola SOMA' usando la MENOR cantidad de operaciones posible (idealmente una sola). Muestra el contenido creado. Usa finish_task.",
        template: null,
        maxTurns: 3,
        evaluate: (runDir) => {
            const resultPath = path.join(runDir, 'resultado.txt');
            if (!fs.existsSync(resultPath)) return { pass: false, error: 'resultado.txt no fue creado' };
            const content = fs.readFileSync(resultPath, 'utf8');
            if (content.includes('Hola SOMA')) return { pass: true };
            return { pass: false, error: 'Contenido incorrecto' };
        }
    },
    {
        id: "memory_efficient_search",
        name: "Búsqueda Eficiente en Memoria",
        task: "Busca recursively en el directorio actual todos los archivos .js que contengan la palabra 'export'. Muestra solo la lista de archivos encontrados, NO el contenido completo. Guarda la lista en 'exports_found.txt'. Usa finish_task.",
        template: "factory_pattern",
        maxTurns: 5,
        evaluate: (runDir) => {
            const resultPath = path.join(runDir, 'exports_found.txt');
            if (!fs.existsSync(resultPath)) return { pass: false, error: 'exports_found.txt no fue creado' };
            const content = fs.readFileSync(resultPath, 'utf8');
            if (content.includes('.js')) return { pass: true };
            return { pass: false, error: 'No se encontraron archivos JS' };
        }
    },
    {
        id: "context_switch_test",
        name: "Cambio de Contexto Mínimo",
        task: "Hay dos archivos: 'entradaA.txt' (escribe 'Contenido A') y 'entradaB.txt' (escribe 'Contenido B'). Crea ambos archivos en una sola sesión de trabajo, sin cambiar de directorio. Usa finish_task.",
        template: null,
        maxTurns: 4,
        evaluate: (runDir) => {
            const pathA = path.join(runDir, 'entradaA.txt');
            const pathB = path.join(runDir, 'entradaB.txt');
            if (!fs.existsSync(pathA) || !fs.existsSync(pathB)) {
                return { pass: false, error: 'Faltan archivos' };
            }
            const contentA = fs.readFileSync(pathA, 'utf8');
            const contentB = fs.readFileSync(pathB, 'utf8');
            if (contentA.includes('Contenido A') && contentB.includes('Contenido B')) {
                return { pass: true };
            }
            return { pass: false, error: 'Contenidos incorrectos' };
        }
    },

    // MEDIUM: Tests de planificación y reasoning
    {
        id: "dependency_analysis",
        name: "Análisis de Dependencias",
        task: "Analiza el código en el directorio actual (múltiples archivos .js si existen). Crea un archivo 'DEPENDENCIAS.md' que muestre: 1) Qué archivos importan a cuáles, 2) Posibles ciclos, 3) Archivos huérfanos (sin imports/exports). Usa finish_task.",
        template: "api_express",
        maxTurns: 10,
        evaluate: (runDir) => {
            const depsPath = path.join(runDir, 'DEPENDENCIAS.md');
            if (!fs.existsSync(depsPath)) return { pass: false, error: 'DEPENDENCIAS.md no fue creado' };
            const content = fs.readFileSync(depsPath, 'utf8');
            if (content.length > 50) return { pass: true };
            return { pass: false, error: 'Documentación muy corta' };
        }
    },
    {
        id: "algorithm_selection",
        name: "Selección de Algoritmo",
        task: "Crea un script 'ordenamiento.py' que implemente 3 algoritmos de ordenamiento diferentes (bubble, quick, merge). Cada uno debe ser una función separada. El script debe aceptar un argumento (algoritmo) y ordenar una lista de 100 números aleatorios. Ejecútalo con cada algoritmo y muestra los tiempos. Usa finish_task.",
        template: null,
        maxTurns: 12,
        evaluate: (runDir) => {
            const scriptPath = path.join(runDir, 'ordenamiento.py');
            if (!fs.existsSync(scriptPath)) return { pass: false, error: 'ordenamiento.py no fue creado' };
            const content = fs.readFileSync(scriptPath, 'utf8');
            const has3Algos = content.includes('bubble') && content.includes('quick') && content.includes('merge');
            if (!has3Algos) return { pass: false, error: 'Faltan algoritmos' };
            try {
                const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
                const res = spawnSync('python', ['ordenamiento.py', 'bubble'], { cwd: runDir, env, timeout: 10000 });
                if (res.status === 0) return { pass: true };
                return { pass: false, error: 'El script falla' };
            } catch (e) {
                return { pass: false, error: 'Error: ' + e.message };
            }
        }
    },
    {
        id: "incremental_development",
        name: "Desarrollo Incremental",
        task: "Crea un script 'contador.py' que starting con solo imprimir '0'. Ejecútalo. Luego modifícalo para imprimir 1-10. Ejecútalo de nuevo. Finalmente haz que imprima 1-100 con un loop. Muestra las 3 ejecuciones. Usa finish_task.",
        template: null,
        maxTurns: 10,
        evaluate: (runDir) => {
            const scriptPath = path.join(runDir, 'contador.py');
            if (!fs.existsSync(scriptPath)) return { pass: false, error: 'contador.py no fue creado' };
            const content = fs.readFileSync(scriptPath, 'utf8');
            // Verificar que tiene loop
            if (!content.includes('for') && !content.includes('while')) {
                return { pass: false, error: 'No tiene loop para 1-100' };
            }
            return { pass: true };
        }
    },

    // HARD: Tests de navegación de codebase complejo
    {
        id: "api_documentation_from_code",
        name: "Documentar API desde Código",
        task: "Examina todos los archivos .js en el directorio actual. Genera 'API.md' con: 1) Lista de todos los endpoints HTTP encontrados, 2) Métodos de cada uno, 3) Parámetros esperados, 4) Códigos de respuesta típicos. No inventes documentación. Usa finish_task.",
        template: "api_express",
        maxTurns: 15,
        evaluate: (runDir) => {
            const apiPath = path.join(runDir, 'API.md');
            if (!fs.existsSync(apiPath)) return { pass: false, error: 'API.md no fue creado' };
            const content = fs.readFileSync(apiPath, 'utf8');
            if (content.length > 200 && (content.includes('GET') || content.includes('POST'))) {
                return { pass: true };
            }
            return { pass: false, error: 'Documentación insuficiente' };
        }
    },
    {
        id: "find_and_fix_all_bugs",
        name: "Encontrar y Corregir Todos los Bugs",
        task: "El proyecto tiene múltiples archivos con bugs intencionales. Examina TODOS los archivos .js del directorio actual, identifica bugs, corrígelos todos, y verifica que el código funciona. Busca específicamente en 'calculadora.js' (si existe) y cualquier otro archivo. Usa finish_task.",
        template: "bugfix_js",
        maxTurns: 15,
        evaluate: (runDir) => {
            // Si existe calculadora.js, debe estar corregida
            const calcPath = path.join(runDir, 'calculadora.js');
            if (fs.existsSync(calcPath)) {
                const content = fs.readFileSync(calcPath, 'utf8');
                // Verificar que la resta ya no suma
                const lines = content.split('\n');
                const restarFn = lines.find(l => l.includes('function restar') || l.includes('restar'));
                if (restarFn && restarFn.includes('a + b')) {
                    return { pass: false, error: 'Bug de resta no corregido' };
                }
            }
            return { pass: true };
        }
    },
    {
        id: "comprehensive_test_coverage",
        name: "Cobertura de Tests Completa",
        task: "Crea una suite de tests completa para el proyecto Express: 1) Instala jest, 2) Crea 'tests/api.test.js' con tests para TODOS los endpoints (users, products, orders - GET, POST, PUT, DELETE), 3) Ejecuta los tests. Logra al menos 80% de cobertura. Usa finish_task.",
        template: "api_express",
        maxTurns: 20,
        evaluate: (runDir) => {
            const testPath = path.join(runDir, 'tests/api.test.js');
            const pkgPath = path.join(runDir, 'package.json');
            if (!fs.existsSync(pkgPath)) return { pass: false, error: 'No hay package.json' };
            if (!fs.existsSync(testPath)) return { pass: false, error: 'tests/api.test.js no creado' };
            const content = fs.readFileSync(testPath, 'utf8');
            const hasMultipleTests = (content.match(/test\(/g) || []).length >= 5;
            if (!hasMultipleTests) return { pass: false, error: 'Pocos tests' };
            return { pass: true };
        }
    },

    // EXTREME: Tests de coordinación multi-archivo
    {
        id: "full_stack_prototype",
        name: "Prototipo Full Stack",
        task: "Crea un mini proyecto full stack: 1) 'server.js' - API Express con /api/usuarios (GET/POST), 2) 'index.html' - Frontend que muestre usuarios en una tabla, 3) 'package.json' con dependencias, 4) 'README.md' con instrucciones. Ejecuta el servidor. Usa finish_task.",
        template: null,
        maxTurns: 20,
        evaluate: (runDir) => {
            const files = ['server.js', 'index.html', 'package.json', 'README.md'];
            const missing = files.filter(f => !fs.existsSync(path.join(runDir, f)));
            if (missing.length > 0) return { pass: false, error: `Faltan: ${missing.join(', ')}` };
            const serverContent = fs.readFileSync(path.join(runDir, 'server.js'), 'utf8');
            if (!serverContent.includes('express')) return { pass: false, error: 'No usa Express' };
            return { pass: true };
        }
    },
    {
        id: "database_schema_migration",
        name: "Migración de Esquema de DB",
        task: "Crea: 1) 'schema_v1.sql' con tabla 'usuarios(id, nombre, email)', 2) 'schema_v2.sql' que altere la tabla añadiendo 'edad' y 'ciudad', 3) 'migrate.js' que ejecute la migración, 4) 'verify.js' que verifique que las columnas existen. Ejecuta y verifica. Usa finish_task.",
        template: null,
        maxTurns: 15,
        evaluate: (runDir) => {
            const files = ['schema_v1.sql', 'schema_v2.sql', 'migrate.js', 'verify.js'];
            const missing = files.filter(f => !fs.existsSync(path.join(runDir, f)));
            if (missing.length > 0) return { pass: false, error: `Faltan: ${missing.join(', ')}` };
            const v2 = fs.readFileSync(path.join(runDir, 'schema_v2.sql'), 'utf8');
            if (!v2.includes('edad') && !v2.includes('ciudad')) {
                return { pass: false, error: 'Schema v2 no añade columnas' };
            }
            return { pass: true };
        }
    },
    {
        id: "distributed_system_simulation",
        name: "Simulación de Sistema Distribuido",
        task: "Crea una simulación de sistema distribuido: 1) 'node.js' - cliente que envía mensajes, 2) 'server.js' - recibe y procesa, 3) 'message_queue.js' - cola de mensajes asíncrona, 4) 'coordinator.js' - coordina nodos. Usa eventos o callbacks. Ejecuta el sistema. Usa finish_task.",
        template: null,
        maxTurns: 18,
        evaluate: (runDir) => {
            const files = ['node.js', 'server.js', 'message_queue.js', 'coordinator.js'];
            const missing = files.filter(f => !fs.existsSync(path.join(runDir, f)));
            if (missing.length > 2) return { pass: false, error: `Faltan muchos archivos: ${missing.join(', ')}` };
            return { pass: true };
        }
    }
];
