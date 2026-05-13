const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src');
const hookNames = new Set(['useEffect','useMemo','useCallback','useLayoutEffect','useDeferredValue','useTransition','useSyncExternalStore']);
function walk(dir){
  for(const entry of fs.readdirSync(dir, {withFileTypes:true})){ 
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()) walk(full);
    else if(/\.(ts|tsx)$/.test(entry.name)) scan(full);
  }
}
function scan(file){
  const src = fs.readFileSync(file,'utf8');
  const sourceFile = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  function visit(node){
    if(ts.isCallExpression(node)){
      const expr = node.expression;
      let name = null;
      if(ts.isIdentifier(expr)) name = expr.text;
      else if(ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.name)) name = expr.name.text;
      if(name && hookNames.has(name) && node.arguments.length >= 2){
        const dep = node.arguments[1];
        if(!ts.isArrayLiteralExpression(dep)){
          const {line, character} = sourceFile.getLineAndCharacterOfPosition(dep.getStart(sourceFile));
          const text = dep.getText(sourceFile).replace(/\n/g,' ');
          console.log(`${file}:${line+1}:${character+1} ${name} second arg not array literal -> ${text}`);
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
}
walk(root);
