export function tokenize(txt){
  const tokens = [];
  let i=0;
  const isSpace = c => /\s/.test(c);
  while(i < txt.length){
    const c = txt[i];
    if(isSpace(c)){ i++; continue; }
    if(c==='{' || c==='}' || c==='='){ tokens.push({type:c}); i++; continue; }
    if(c==='"'){
      let j=i+1, s=''; while(j<txt.length && txt[j] !== '"'){ s += txt[j++]; }
      tokens.push({type:'string', value:s}); i=j+1; continue;
    }
    if(/[0-9]/.test(c)){
      let j=i, s=''; while(j<txt.length && /[0-9.]/.test(txt[j])) s += txt[j++];
      tokens.push({type:'number', value:s}); i=j; continue;
    }
    if(/[A-Za-z_\-]/.test(c)){
      let j=i, s=''; while(j<txt.length && /[A-Za-z0-9_\-]/.test(txt[j])) s += txt[j++];
      tokens.push({type:'id', value:s}); i=j; continue;
    }
    // otherwise skip
    i++;
  }
  return tokens;
}
