'use strict';
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm'), assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'); const c=vm.createContext({window:{}});
for(const f of ['js/commands.js','js/engine.js']) vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),c,{filename:f});
const cmds=c.window.CentroEngine.allCommands(); let pairs=0, asym=0;
for(let i=0;i<cmds.length;i++) for(let j=i+1;j<cmds.length;j++){
 const a=c.window.CentroEngine.compatibility(cmds[i],[cmds[j]]).ok;
 const b=c.window.CentroEngine.compatibility(cmds[j],[cmds[i]]).ok;
 pairs++; if(a!==b) asym++;
}
assert.equal(pairs,33153); assert.equal(asym,0);
console.log(`COMPATIBILITY AUDIT: OK — ${pairs} pairs, ${asym} asymmetries`);
