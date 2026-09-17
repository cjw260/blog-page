import fs from 'node:fs'
import path from 'node:path'
const root='dist'
function walk(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])
}
const paths=walk(root).filter(p=>p.endsWith('/index.html')).map(p=>'/blog/'+path.relative(root,p).replace(/index\.html$/,'')).sort()
fs.mkdirSync('.generated',{recursive:true})
fs.writeFileSync('.generated/stats-paths.json',JSON.stringify(paths))
