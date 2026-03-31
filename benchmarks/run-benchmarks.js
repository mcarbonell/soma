const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Importar suites de pruebas
const PREDEF_TESTS = require('./suites/original');
const SOMA_TOOL_TESTS = require('./suites/tools');
const LEVIATHAN_TESTS = require('./suites/leviathan');

const BENCHMARKS_DIR = __dirname;
const TEMPLATES_DIR = path.join(BENCHMARKS_DIR, 'templates');
const RUNS_DIR = path.join(BENCHMARKS_DIR, 'runs');

// Combinar todos los tests
const ALL_TESTS = [...PREDEF_TESTS, ...SOMA_TOOL_TESTS, ...LEVIATHAN_TESTS];

/**
 * Copia un directorio recursivamente
 */
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(item => {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        if (fs.lstatSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

/**
 * Ejecuta un benchmark individual
 */
function runBenchmark(testInfo, options = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const runId = `${testInfo.id}_${timestamp}`;
    const runDir = path.join(RUNS_DIR, runId);

    console.log(`\n======================================================`);
    console.log(`🧪 Iniciando Benchmark: ${testInfo.name} (${testInfo.id})`);
    console.log(`======================================================`);

    if (testInfo.template) {
        const templatePath = path.join(TEMPLATES_DIR, testInfo.template);
        if (!fs.existsSync(templatePath)) {
            console.error(`❌ Template ${testInfo.template} no encontrado`);
            return null;
        }
        copyDir(templatePath, runDir);
        console.log(`📁 Sandbox clonado desde template '${testInfo.template}' a '${runId}'`);
    } else {
        fs.mkdirSync(runDir, { recursive: true });
        console.log(`📁 Sandbox vacío creado en '${runId}'`);
    }

    console.log(`🤖 Lanzando Agente... (Max Turnos: ${testInfo.maxTurns})`);
    const agentScript = path.resolve(__dirname, '..', 'soma', 'run-agent.js');

    const startTime = Date.now();
    const args = [
        agentScript,
        '--task', testInfo.task,
        '--workspace', runDir,
        '--max-turns', (testInfo.maxTurns).toString(),
        '--debug'
    ];

    if (options.provider) { args.push('--provider', options.provider); }
    if (options.model) { args.push('--model', options.model); }

    const child = spawnSync('node', args, {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: { ...process.env, SOMA_HOME: path.join(runDir, '.soma_home') }
    });

    const endTime = Date.now();
    const elapsedTime = ((endTime - startTime) / 1000).toFixed(1);

    console.log(`\n秤 Evaluando Sandbox tras intervención de IA...`);
    const evaluation = testInfo.evaluate(runDir);

    let metrics = {
        turnsUsed: -1, maxPm: 0, avgPm: 0,
        totalPromptTokens: 0, totalResponseTokens: 0,
        totalTokensUsed: 0, totalActions: 0, apiRetries: 0,
        agentReport: "unknown", provider: "unknown", model: "unknown"
    };

    const somaHome = path.join(runDir, '.soma_home');
    const debugDirPrefix = path.join(somaHome, 'L2', 'sessions');
    if (fs.existsSync(debugDirPrefix)) {
        const debugSessions = fs.readdirSync(debugDirPrefix).filter(s => s.startsWith('session_'));
        if (debugSessions.length > 0) {
            // Ordenar sesiones por fecha (la más reciente primero)
            debugSessions.sort().reverse();
            const latestSession = path.join(debugDirPrefix, debugSessions[0], 'debug');
            const statsFile = path.join(latestSession, 'stats.json');
            if (fs.existsSync(statsFile)) {
                try {
                    const stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8'));
                    Object.assign(metrics, stats);
                } catch (e) { }
            }
        }
    }

    const report = {
        testId: testInfo.id,
        name: testInfo.name,
        passed: evaluation.pass,
        error: evaluation.error || null,
        durationSecs: elapsedTime,
        ...metrics,
        sandbox: runDir,
        agentExitCode: child.status,
        timestamp: new Date().toISOString()
    };

    console.log(`\n📊 RESULTADOS:`);
    console.log(`   - Éxito: ${report.passed ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   - Turnos usados: ${report.turnsUsed}`);
    console.log(`   - Costo Cognitivo: ${report.totalTokensUsed} tokens`);
    console.log(`   - Tiempo transcurrido: ${report.durationSecs} sec`);

    return report;
}

/**
 * Función principal
 */
function main() {
    const args = process.argv.slice(2);

    // Parsing manual de argumentos
    const getArg = (key) => {
        const idx = args.indexOf(key);
        return idx !== -1 ? args[idx + 1] : null;
    };

    const overrideProvider = getArg('--provider');
    const overrideModel = getArg('--model');
    const filters = args.filter(a => !a.startsWith('--')); // Recoger todos los argumentos que no sean flags
    const keepRuns = args.includes('--keep');

    let testsToRun = [];
    if (filters.length === 0 || filters.includes('all') || filters.includes(':all')) {
        testsToRun = ALL_TESTS;
    } else {
        testsToRun = ALL_TESTS.filter(t => filters.includes(t.id));
        if (testsToRun.length === 0) {
            console.error(`❌ No se encontraron tests con los IDs proporcionados: ${filters.join(', ')}`);
            console.log(`Tests disponibles: ${ALL_TESTS.map(t => t.id).join(', ')}`);
            process.exit(1);
        }
    }

    if (!keepRuns && fs.existsSync(RUNS_DIR)) {
        console.log(`🧹 Limpiando directorio de runs...`);
        fs.rmSync(RUNS_DIR, { recursive: true, force: true });
    }

    const results = [];
    let passedCount = 0;

    for (const test of testsToRun) {
        const res = runBenchmark(test, { provider: overrideProvider, model: overrideModel });
        if (res) {
            results.push(res);
            if (res.passed) passedCount++;
        }
    }

    // 1. Guardar JSON completo de resultados
    const resultsJsonPath = path.join(BENCHMARKS_DIR, 'results.json');
    fs.writeFileSync(resultsJsonPath, JSON.stringify(results, null, 2), 'utf-8');

    // 2. Generar Markdown Report
    const reportPath = path.join(BENCHMARKS_DIR, 'LATEST_REPORT.md');
    let md = `# SOMA Benchmarks Report\nFecha: ${new Date().toLocaleString()}\n\n`;

    results.forEach(run => {
        md += `## ${run.name}\n`;
        md += `- **ID:** \`${run.testId}\` | **Resultado:** ${run.passed ? '✅ PASS' : '❌ FAIL'}\n`;
        md += `- **LLM:** ${run.provider} / ${run.model} | **Reporte Agente:** \`${run.agentReport}\`\n`;
        md += `- **Turnos:** ${run.turnsUsed} | **Acciones:** ${run.totalActions}\n`;
        md += `- **Tokens:** ${run.totalTokensUsed} (IN: ${run.totalPromptTokens} / OUT: ${run.totalResponseTokens})\n`;
        md += `- **Uso L1 (Pm):** Pico ${run.maxPm}% | Medio ${run.avgPm}%\n`;
        md += `- **Duración:** ${run.durationSecs}s | **API Retries:** ${run.apiRetries}\n`;
        if (!run.passed) md += `- **Error:** \`\`\`text\n${run.error}\n\`\`\`\n`;
        md += `\n`;
    });

    md += `\n### Resumen Final: ${passedCount}/${testsToRun.length} superados.`;
    fs.writeFileSync(reportPath, md, 'utf-8');

    console.log(`\n======================================================`);
    console.log(`📝 Completado: ${passedCount}/${testsToRun.length}`);
    console.log(`📊 JSON: benchmarks/results.json`);
    console.log(`📘 MD: benchmarks/LATEST_REPORT.md`);
}

main();
