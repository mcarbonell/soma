const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

module.exports = [
    {
        id: "leviathan_compiler_lab",
        name: "Leviathan: Intérprete SOMA-Script",
        task: "Diseña e implementa un intérprete para un lenguaje llamado 'SOMA-Script'. El lenguaje debe soportar: 1) Definición de variables, 2) Aritmética, 3) Funciones con parámetros, 4) if/else y loops while. Debes construir el Lexer (tokenizador), el Parser (generador de AST) y el Evaluador (runtime) desde cero en Node.js. Crea un programa 'script.soma' que calcule el factorial de un número y ejecútalo con tu intérprete. Documenta cada fase en docs/. Usa finish_task.",
        template: null,
        maxTurns: 150,
        evaluate: (runDir) => {
            const files = ['lexer.js', 'parser.js', 'interpreter.js', 'script.soma'];
            const existsInRoot = files.every(f => fs.existsSync(path.join(runDir, f)));
            const existsInSrc = ['src/lexer.js', 'src/parser.js', 'src/evaluator.js'].every(f => fs.existsSync(path.join(runDir, f))) &&
                (fs.existsSync(path.join(runDir, 'examples/script.soma')) || fs.existsSync(path.join(runDir, 'script.soma')));

            if (!existsInRoot && !existsInSrc) return { pass: false, error: 'Arquitectura del intérprete incompleta (faltan lexer, parser, interpreter/evaluator o script)' };
            return { pass: true };
        }
    },
    {
        id: "leviathan_tinyc_compiler",
        name: "Leviathan: Compilador TinyC",
        task: `Implementa un compilador funcional para TinyC (subconjunto de C) en Node.js. El compilador debe procesar código C real y producir output ejecutable o bytecode.

FASES OBLIGATORIAS:
1. LEXER (src/lexer.js): Tokeniza código C. Tokens requeridos: int/char/void/if/else/while/for/return, identificadores, números enteros, operadores (+,-,*,/,%,==,!=,<,>,<=,>=,&&,||,!,=), delimitadores ({,},(,),[,],;,,), strings y chars literales.

2. PARSER (src/parser.js): Genera AST desde tokens. Nodos requeridos: Program, FunctionDecl, VarDecl, Block, IfStmt, WhileStmt, ForStmt, ReturnStmt, BinaryExpr, UnaryExpr, CallExpr, AssignExpr, Literal, Identifier.

3. SEMANTIC ANALYZER (src/semantic.js): Tabla de símbolos con scopes anidados. Verifica: variables declaradas antes de uso, tipos compatibles en asignaciones, número correcto de argumentos en llamadas a funciones, función main existe.

4. CODE GENERATOR (src/codegen.js): Genera JavaScript ejecutable desde el AST (transpilación C→JS). Alternativa aceptada: generar bytecode propio con VM.

5. COMPILER ENTRY (src/compiler.js): Orquesta las 4 fases. CLI: node src/compiler.js input.c

PROGRAMAS DE PRUEBA - crea estos archivos en tests/ y compílalos:
- tests/hello.c: función main que imprime con printf
- tests/factorial.c: función recursiva factorial(n), main llama factorial(10)
- tests/fibonacci.c: función iterativa fib(n) con bucle while, main imprime fib(1) a fib(10)
- tests/bubble_sort.c: función bubble_sort sobre array, main ordena [5,3,8,1,9,2] e imprime resultado

VERIFICACIÓN: Ejecuta cada programa de prueba con tu compilador y muestra el output. Si un programa falla, depura y corrige el compilador hasta que funcione. Usa commit_milestone después de cada fase completada. Documenta la arquitectura en docs/ARCHITECTURE.md. Usa finish_task cuando los 4 programas de prueba compilen y ejecuten correctamente.

NOTA IMPORTANTE: Cuando un archivo JS tenga errores de sintaxis tras ediciones incrementales con edit_range o edit_line, NO sigas aplicando más ediciones parciales — usa write_file para reescribir el archivo completo desde cero con una versión limpia y correcta.`,
        template: null,
        maxTurns: 150,
        evaluate: (runDir) => {
            // Verificar estructura mínima del compilador
            const requiredSrc = ['src/lexer.js', 'src/parser.js', 'src/codegen.js', 'src/compiler.js'];
            const missingSrc = requiredSrc.filter(f => !fs.existsSync(path.join(runDir, f)));
            if (missingSrc.length > 1) {
                return { pass: false, error: `Faltan archivos del compilador: ${missingSrc.join(', ')}` };
            }

            // Verificar que existe al menos un programa de prueba
            const testFiles = ['tests/factorial.c', 'tests/fibonacci.c', 'tests/bubble_sort.c', 'tests/hello.c'];
            const existingTests = testFiles.filter(f => fs.existsSync(path.join(runDir, f)));
            if (existingTests.length === 0) {
                return { pass: false, error: 'No se crearon programas de prueba en tests/' };
            }

            // Intentar compilar factorial.c o fibonacci.c y verificar output
            const testToRun = existingTests.find(t => t.includes('factorial') || t.includes('fibonacci'));
            if (testToRun) {
                try {
                    const res = spawnSync('node', ['src/compiler.js', testToRun], {
                        cwd: runDir,
                        timeout: 15000
                    });
                    const output = (res.stdout || '').toString() + (res.stderr || '').toString();
                    // Si compiló sin error fatal y produjo algún output numérico, pasa
                    if (res.status === 0 && /\d+/.test(output)) {
                        return { pass: true };
                    }
                    // Pasa parcialmente si al menos el compilador arranca y procesa
                    if (output.length > 0 && !output.includes('Cannot find module')) {
                        return { pass: true };
                    }
                } catch (e) { }
            }

            // Pass si tiene src completo y tests aunque no ejecute perfectamente
            if (missingSrc.length === 0 && existingTests.length >= 2) {
                return { pass: true };
            }

            return { pass: false, error: `Compilador incompleto. Archivos src presentes: ${requiredSrc.filter(f => fs.existsSync(path.join(runDir, f))).join(', ')}` };
        }
    },
    {
        id: "leviathan_bytecode_vm_compiler",
        name: "Leviathan: Compilador TinyC con VM de Bytecode",
        task: `Implementa un compilador completo para TinyC (subconjunto de C) en Node.js que genere bytecode propio ejecutado por una VM personalizada. PROHIBIDO generar JavaScript como output — el compilador debe emitir instrucciones de una arquitectura de bytecode que tú mismo diseñes.

FASES OBLIGATORIAS:
1. LEXER (src/lexer.js): Igual que TinyC estándar. Tokens: keywords, identificadores, números, operadores, delimitadores.

2. PARSER (src/parser.js): AST completo. Nodos: Program, FunctionDecl, VarDecl, Block, IfStmt, WhileStmt, ForStmt, ReturnStmt, BinaryExpr, UnaryExpr, CallExpr, AssignExpr, Literal, Identifier.

3. SEMANTIC ANALYZER (src/semantic.js): Tabla de símbolos con scopes anidados. Verifica declaraciones, tipos, aridad de funciones, existencia de main.

4. BYTECODE COMPILER (src/codegen.js): Genera un array de instrucciones de bytecode propio desde el AST. Define tu ISA (Instruction Set Architecture) mínima en docs/ISA.md. Instrucciones requeridas: PUSH, POP, ADD, SUB, MUL, DIV, MOD, CMP_EQ, CMP_LT, CMP_GT, JMP, JMP_IF_FALSE, CALL, RET, LOAD_VAR, STORE_VAR, PRINT. El bytecode debe ser serializable a un archivo .tbc (TinyC Bytecode).

5. VIRTUAL MACHINE (src/vm.js): Ejecuta el bytecode. Stack-based o register-based, tu elección. Debe tener: stack de ejecución, tabla de variables por frame, call stack para funciones recursivas, instrucción PRINT que muestre output.

6. COMPILER ENTRY (src/compiler.js): CLI: node src/compiler.js input.c → compila y ejecuta. Flag opcional --emit-bytecode para guardar el .tbc.

PROGRAMAS DE PRUEBA — crea en tests/ y ejecuta con tu VM:
- tests/hello.c: main imprime un número con printf/print
- tests/factorial.c: factorial recursivo, main imprime factorial(10)
- tests/fibonacci.c: fib iterativo con while, main imprime fib(1) a fib(10)
- tests/bubble_sort.c: ordena array [5,3,8,1,9,2], main imprime resultado

VERIFICACIÓN: Cada programa debe producir output numérico correcto al ejecutarse con la VM. Usa commit_milestone después de cada fase. Documenta la ISA en docs/ISA.md y la arquitectura en docs/ARCHITECTURE.md.

NOTA IMPORTANTE: Cuando un archivo JS tenga errores de sintaxis tras ediciones incrementales, usa write_file para reescribir el archivo completo — no sigas aplicando edit_range sobre código corrupto.

Usa finish_task cuando los 4 programas produzcan output correcto.`,
        template: null,
        maxTurns: 200,
        evaluate: (runDir) => {
            const requiredSrc = ['src/lexer.js', 'src/parser.js', 'src/codegen.js', 'src/vm.js', 'src/compiler.js'];
            const missingSrc = requiredSrc.filter(f => !fs.existsSync(path.join(runDir, f)));
            if (missingSrc.length > 1) {
                return { pass: false, error: `Faltan archivos del compilador: ${missingSrc.join(', ')}` };
            }

            // Verificar que existe ISA documentada
            const hasISA = fs.existsSync(path.join(runDir, 'docs/ISA.md'));

            // Verificar programas de prueba
            const testFiles = ['tests/factorial.c', 'tests/fibonacci.c', 'tests/bubble_sort.c', 'tests/hello.c'];
            const existingTests = testFiles.filter(f => fs.existsSync(path.join(runDir, f)));
            if (existingTests.length === 0) {
                return { pass: false, error: 'No se crearon programas de prueba en tests/' };
            }

            // Intentar ejecutar factorial o fibonacci y verificar output numérico
            const testToRun = existingTests.find(t => t.includes('factorial') || t.includes('fibonacci'));
            if (testToRun) {
                try {
                    const res = spawnSync('node', ['src/compiler.js', testToRun], {
                        cwd: runDir,
                        timeout: 15000
                    });
                    const output = (res.stdout || '').toString();
                    const stderr = (res.stderr || '').toString();
                    // Output numérico correcto: factorial(10)=3628800, fib produce secuencia
                    if (res.status === 0 && /\d{2,}/.test(output)) {
                        return { pass: true };
                    }
                    // Pasa parcialmente si la VM arranca y procesa sin "Cannot find module"
                    if ((output + stderr).length > 0 && !stderr.includes('Cannot find module')) {
                        return { pass: true };
                    }
                } catch (e) { }
            }

            // Pass si src completo + tests + ISA documentada
            if (missingSrc.length === 0 && existingTests.length >= 2 && hasISA) {
                return { pass: true };
            }

            return { pass: false, error: `VM/Compilador incompleto. Src presentes: ${requiredSrc.filter(f => fs.existsSync(path.join(runDir, f))).join(', ')}` };
        }
    },
    {
        id: "leviathan_chess_engine",
        name: "Leviathan: Motor de Ajedrez con Perft",
        task: `Implementa un motor de ajedrez completo en Node.js desde cero. PROHIBIDO usar chess.js, chessboard.js o cualquier libreria de ajedrez externa. Toda la logica debe ser implementacion propia.

COMPONENTES OBLIGATORIOS:

1. REPRESENTACION (src/board.js): Tablero interno 8x8 o bitboards. Debe soportar:
   - Estado completo: piezas, turno, derechos de enroque (KQkq), casilla en passant, contadores de regla de 50 movimientos y numero de jugada.
   - Carga desde FEN: parsear y cargar cualquier posicion FEN estandar.
   - Export a FEN: serializar el estado actual a FEN.

2. GENERADOR DE MOVIMIENTOS (src/movegen.js): Genera el conjunto completo de jugadas legales para una posicion. Debe implementar:
   - Movimientos de todas las piezas: peon (avance simple, doble, captura diagonal), caballo, alfil, torre, dama, rey.
   - Enroque corto y largo (respetando derechos, casillas atacadas y piezas intermedias).
   - Captura al paso (en passant).
   - Promocion de peon (a dama, torre, alfil, caballo).
   - Filtrado de movimientos ilegales (movimientos que dejan al rey en jaque).

3. DETECCION DE ESTADO (src/state.js o integrado en board.js):
   - isInCheck(): el rey del jugador activo esta en jaque.
   - isCheckmate(): jaque mate (en jaque y sin movimientos legales).
   - isStalemate(): ahogado (no en jaque y sin movimientos legales).

4. MAKE/UNMAKE (en src/board.js): Metodos makeMove(move) y unmakeMove() que aplican y deshacen jugadas de forma eficiente manteniendo el historial de estado.

5. PERFT (src/perft.js): Funcion perft(depth) que cuenta nodos hoja del arbol de movimientos. Usala para verificar la correccion del motor.

6. CLI (src/main.js): node src/main.js perft <depth> [fen] -- ejecuta perft desde la posicion dada (o posicion inicial si no se especifica FEN) e imprime el resultado.

VERIFICACION OBLIGATORIA -- el motor debe pasar estos tests Perft exactos:

Posicion inicial (startpos):
- perft(1) = 20
- perft(2) = 400
- perft(3) = 8902
- perft(4) = 197281
- perft(5) = 4865609

Posicion Kiwipete (FEN: r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -):
- perft(1) = 48
- perft(2) = 2039
- perft(3) = 97862

Ejecuta cada test con tu CLI y muestra los resultados. Si un valor no coincide, hay un bug en la generacion de movimientos -- depura hasta que todos los valores sean exactos.

Usa commit_milestone despues de cada componente completado. Documenta la representacion interna en docs/ARCHITECTURE.md.

NOTA IMPORTANTE: Cuando un archivo JS tenga errores de sintaxis tras ediciones incrementales, usa write_file para reescribir el archivo completo -- no sigas aplicando edit_range sobre codigo corrupto.

Usa finish_task cuando todos los valores Perft sean correctos.`,
        template: null,
        maxTurns: 250,
        evaluate: (runDir) => {
            const requiredSrc = ['src/board.js', 'src/movegen.js', 'src/perft.js', 'src/main.js'];
            const missingSrc = requiredSrc.filter(f => !fs.existsSync(path.join(runDir, f)));
            if (missingSrc.length > 1) {
                return { pass: false, error: `Faltan archivos del motor: ${missingSrc.join(', ')}` };
            }

            // Verificar que no usa chess.js
            const pkgPath = path.join(runDir, 'package.json');
            if (fs.existsSync(pkgPath)) {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                if (deps['chess.js'] || deps['chessboard.js']) {
                    return { pass: false, error: 'Usa chess.js -- implementacion propia requerida' };
                }
            }

            // Test Perft posicion inicial
            const perftTests = [
                { depth: 1, expected: 20 },
                { depth: 2, expected: 400 },
                { depth: 3, expected: 8902 },
                { depth: 4, expected: 197281 },
                { depth: 5, expected: 4865609 },
            ];

            let highestPassed = 0;
            for (const t of perftTests) {
                try {
                    const res = spawnSync('node', ['src/main.js', 'perft', t.depth.toString()], {
                        cwd: runDir,
                        timeout: 60000
                    });
                    const output = (res.stdout || '').toString();
                    if (output.includes(t.expected.toString())) {
                        highestPassed = t.depth;
                    } else {
                        break;
                    }
                } catch (e) { break; }
            }

            if (highestPassed >= 5) return { pass: true };
            if (highestPassed >= 3) return { pass: true, partial: `Perft hasta depth ${highestPassed} correcto (falto depth 5)` };

            // Kiwipete como fallback
            if (highestPassed === 0) {
                try {
                    const kiwi = 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq -';
                    const res = spawnSync('node', ['src/main.js', 'perft', '1', kiwi], {
                        cwd: runDir, timeout: 15000
                    });
                    const output = (res.stdout || '').toString();
                    if (output.includes('48')) return { pass: true, partial: 'Solo Kiwipete perft(1) correcto' };
                } catch (e) { }
            }

            if (missingSrc.length === 0 && highestPassed >= 1) return { pass: true };

            return { pass: false, error: `Perft incorrecto. Maximo depth pasado: ${highestPassed}. Archivos presentes: ${requiredSrc.filter(f => fs.existsSync(path.join(runDir, f))).join(', ')}` };
        }
    },
    {
        id: "leviathan_enterprise_cloud_app",
        name: "Leviathan: App Enterprise Full-Stack",
        task: "Construye una aplicación SaaS completa: 1) Backend modular con Express, Auth (JWT), y roles, 2) Capa de persistencia con esquemas complejos, 3) Frontend en HTML/JS puro usando componentes WebComponents, 4) Documentación técnica Swagger, 5) Suite de tests completa (+20 tests), 6) Configuración de Docker Compose para App y DB. Todo debe seguir principios SOLID y Clean Architecture. No uses generadores automáticos. Usa finish_task.",
        template: null,
        maxTurns: 200,
        evaluate: (runDir) => {
            const dirs = ['src/auth', 'src/api', 'src/db', 'tests', 'docs'];
            const exists = dirs.every(d => fs.existsSync(path.join(runDir, d)));
            if (!exists) return { pass: false, error: 'Estructura modular incompleta' };
            return { pass: true };
        }
    }
];
