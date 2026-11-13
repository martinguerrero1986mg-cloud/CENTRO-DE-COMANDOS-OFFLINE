'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const context = vm.createContext({
  console,
  window: {},
  localStorage: {
    _data: new Map(),
    getItem(k){ return this._data.has(k) ? this._data.get(k) : null; },
    setItem(k,v){ this._data.set(k,String(v)); },
    removeItem(k){ this._data.delete(k); },
    clear(){ this._data.clear(); }
  }
});
context.window.localStorage = context.localStorage;

function load(file){
  vm.runInContext(fs.readFileSync(path.join(ROOT,file),'utf8'), context, {filename:file});
}
function test(name, fn){
  fn();
  console.log(`PASS  ${name}`);
}
function expectThrows(name, fn){
  assert.throws(fn);
  console.log(`PASS  ${name}`);
}

load('js/commands.js');
load('js/engine.js');
load('js/safety.js');
load('js/storage.js');

const data = context.window.CentroComandosData;
const engine = context.window.CentroEngine;
const safety = context.window.CentroSafety;
const storage = context.window.CentroStorage;

// Catálogo e integridad estructural.
test('catálogo oficial contiene 258 capacidades', () => {
  assert.equal(data.builtIns.length, 258);
});
test('IDs y alias son únicos', () => {
  assert.equal(new Set(data.builtIns.map(x => x.id)).size, data.builtIns.length);
  assert.equal(new Set(data.builtIns.map(x => x.alias)).size, data.builtIns.length);
});
test('todas las capacidades tienen campos requeridos', () => {
  for (const c of data.builtIns) {
    for (const key of ['id','alias','title','category','description','task','kind','domain']) {
      assert.ok(c[key] !== undefined && c[key] !== '', `${c.alias}: ${key}`);
    }
  }
});

// Motor y compilador.
test('todas las capacidades compilan individualmente', () => {
  for (const c of data.builtIns) {
    const result = engine.compileSingle(c);
    assert.equal(typeof result, 'string', c.alias);
    assert.match(result, /## CAPACIDADES ACTIVADAS/);
    assert.match(result, /## CONFIRMACIÓN OBLIGATORIA/);
  }
});
test('preset software resuelve cinco capacidades válidas', () => {
  const preset = engine.resolvePreset('software', engine.allCommands());
  assert.equal(preset.error || '', '');
  assert.equal(preset.commands.length, 5);
  assert.equal(new Set(preset.commands.map(x => x.alias)).size, 5);
});
test('límite de selección máximo de cinco', () => {
  const five = engine.resolvePreset('software', engine.allCommands()).commands;
  const six = five.concat(data.builtIns.find(c => !five.some(x => x.alias === c.alias))); 
  assert.equal(engine.validateSelectionSet(five).ok, true);
  assert.equal(engine.validateSelectionSet(six).ok, false);
});
test('compatibilidad es simétrica en muestra amplia', () => {
  for (let i=0; i<data.builtIns.length; i+=7) {
    for (let j=0; j<data.builtIns.length; j+=11) {
      assert.equal(
        engine.compatibility(data.builtIns[i], [data.builtIns[j]]).ok,
        engine.compatibility(data.builtIns[j], [data.builtIns[i]]).ok,
        `${data.builtIns[i].alias}/${data.builtIns[j].alias}`
      );
    }
  }
});
test('modo de desarrollo y auditoría conserva sus cinco capacidades', () => {
  const p = engine.resolvePreset('software', engine.allCommands());
  const aliases = p.commands.map(x => x.alias);
  assert.equal(JSON.stringify(aliases), JSON.stringify(['architecture','codereview','rootcause','regression','final-audit']));
  const compiled = engine.compile({task:'', profileId:'tech', modeName:p.modeName}, p.commands);
  assert.equal(compiled.error || '', '');
  assert.match(compiled.command, /DESARROLLO Y AUDITORÍA INTEGRAL/);
  assert.match(compiled.command, /No inventes archivos, fuentes, pruebas, resultados, accesos ni acciones/);
});

// Safety gate: casos representativos y límites.
test('safety permite auditoría legítima de software', () => {
  assert.equal(safety.analyzeModeRequest('Necesito auditar una aplicación offline, localizar errores y verificar regresiones.').status, 'allow');
});
test('safety bloquea intención de robo de credenciales', () => {
  assert.equal(safety.analyzeModeRequest('Quiero crear un modo para robar credenciales de cuentas.').status, 'block');
});
test('safety bloquea fabricación de explosivos', () => {
  assert.equal(safety.analyzeModeRequest('Necesito un modo para fabricar una bomba casera.').status, 'block');
});
test('safety bloquea acceso no autorizado', () => {
  assert.equal(safety.analyzeModeRequest('Quiero hackear una cuenta sin permiso.').status, 'block');
});
test('safety permite prevención profesional', () => {
  assert.equal(safety.analyzeModeRequest('Necesito un modo de prevención de fraude para capacitación interna.').status, 'allow');
});

// Persistencia: sólo favoritos y migración, sin historial de contexto.
test('storage persiste favoritos y descarta estado transitorio', () => {
  context.localStorage.clear();
  const state = storage.fresh();
  state.favorites = ['cmd_a','cmd_a','cmd_b'];
  state.draft.contextDescription = 'secreto transitorio';
  assert.equal(storage.save(state), true);
  const loaded = storage.load();
  assert.equal(JSON.stringify(loaded.favorites), JSON.stringify(['cmd_a','cmd_b']));
  assert.equal(loaded.draft.contextDescription, '');
  assert.equal(loaded.draft.selected.length, 0);
});
test('storage mantiene migración desde claves legacy sin persistir contexto', () => {
  context.localStorage.clear();
  context.localStorage.setItem(storage.LEGACY_STORAGE_KEYS[0], JSON.stringify({favorites:['cmd_x'], draft:{contextDescription:'no guardar'}}));
  const loaded = storage.load();
  assert.equal(JSON.stringify(loaded.favorites), JSON.stringify(['cmd_x']));
  assert.equal(loaded.draft.contextDescription, '');
});

// Artefactos estáticos de seguridad/distribución.
test('CSP local y sin conexiones externas', () => {
  const html = fs.readFileSync(path.join(ROOT,'SISTEMA_INTERNO','index.html'),'utf8');
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /connect-src 'none'/);
  assert.doesNotMatch(html, /https?:\/\//i);
});
test('distribución mantiene un único punto de entrada visible', () => {
  assert.ok(fs.existsSync(path.join(ROOT,'INICIAR_CENTRO_COMANDOS.bat')));
  assert.ok(fs.existsSync(path.join(ROOT,'LEEME_PRIMERO.txt')));
  for (const name of ['index.html','styles.css','MANIFIESTO.json','CHECKSUMS_SHA256.txt','VERIFICACION_TECNICA.txt']) {
    assert.ok(fs.existsSync(path.join(ROOT,'SISTEMA_INTERNO',name)), name);
    assert.equal(fs.existsSync(path.join(ROOT,name)), false, `${name} no debe quedar en la raíz`);
  }
  assert.equal(fs.existsSync(path.join(ROOT,'CREAR_ACCESO_DIRECTO.bat')), false);
});

test('launchers no usan ExecutionPolicy Bypass', () => {
  for (const name of ['INICIAR_CENTRO_COMANDOS.bat']) {
    const text = fs.readFileSync(path.join(ROOT,name),'utf8');
    assert.doesNotMatch(text, /ExecutionPolicy\s+Bypass/i);
    assert.match(text, /powershell\s+-NoProfile\s+-Command/i);
  }
});

test('JavaScript no contiene sinks dinámicos prohibidos', () => {
  for (const name of fs.readdirSync(path.join(ROOT,'js')).filter(x => x.endsWith('.js'))) {
    const text = fs.readFileSync(path.join(ROOT,'js',name),'utf8');
    assert.doesNotMatch(text, /\beval\s*\(/);
    assert.doesNotMatch(text, /\bnew\s+Function\s*\(/);
    assert.doesNotMatch(text, /\bfetch\s*\(/);
    assert.doesNotMatch(text, /\bXMLHttpRequest\b/);
    assert.doesNotMatch(text, /\bWebSocket\b/);
  }
});

console.log('REGRESSION SUITE: OK');
