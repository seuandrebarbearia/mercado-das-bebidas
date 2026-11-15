// Verificação das interações em DOM simulado; não substitui a inspeção visual.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html','utf8');
const source = fs.readFileSync('script.js','utf8');
class Element {
  constructor(tag, attrs={}) {
    this.tag=tag; this.attrs=attrs; this.children=[]; this.listeners={}; this.hidden=false;
    this.dataset=Object.fromEntries(Object.entries(attrs).filter(([key])=>key.startsWith('data-')).map(([key,value])=>[key.slice(5),value]));
    const classes=new Set((attrs.class||'').split(' '));
    this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle:(x,on)=>{const value=on??!classes.has(x); value?classes.add(x):classes.delete(x);return value;}};
    this.src=attrs.src; this.alt=attrs.alt;
  }
  get textContent(){return this.text??this.children.map(child=>typeof child==='string'?child:child.textContent).join('');}
  set textContent(value){this.text=String(value);}
  setAttribute(k,v){this.attrs[k]=v;} getAttribute(k){return this.attrs[k];} removeAttribute(k){delete this.attrs[k];}
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
  fire(type, props={}){const event={target:this,preventDefault(){this.prevented=true;},...props};(this.listeners[type]||[]).forEach(fn=>fn(event));return event;}
  matches(selector){
    if(selector.startsWith('.'))return this.classList.contains(selector.slice(1));
    if(selector.startsWith('#'))return this.attrs.id===selector.slice(1);
    if(selector.startsWith('[')){const match=selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);return match&&Object.hasOwn(this.attrs,match[1])&&(match[2]===undefined||this.attrs[match[1]]===match[2]);}
    return this.tag===selector;
  }
  querySelectorAll(selector){const selectors=selector.split(',').map(x=>x.trim()),out=[];const walk=node=>node.children.forEach(child=>{if(typeof child==='string')return;if(selectors.some(s=>child.matches(s)))out.push(child);walk(child);});walk(this);return out;}
  querySelector(s){return this.querySelectorAll(s)[0]||null;}
  contains(el){return el===this||this.children.some(x=>typeof x!=='string'&&x.contains(el));}
  closest(s){return this.matches(s)?this:this.parent?.closest(s);}
  focus(){document.activeElement=this;}
  showModal(){this.open=true;this.focus();}
  close(){this.open=false;this.fire('close');}
  getBoundingClientRect(){return {left:0,top:0,right:100,bottom:100};}
  replaceChildren(...children){this.children=children;}
}
let document;
function boot(code=source){
  document=new Element('document');const stack=[document];
  for(const token of html.match(/<[^>]+>|[^<]+/g)){
    if(token.startsWith('</')){if(stack.length>1)stack.pop();continue;}
    if(token.startsWith('<!'))continue;
    if(token.startsWith('<')){
      const tag=token.match(/^<([\w-]+)/)?.[1];if(!tag)continue;
      const attrs={};for(const match of token.matchAll(/([\w-]+)(?:="([^"]*)")?/g)){if(match[1]!==tag)attrs[match[1]]=match[2]||'';}
      const el=new Element(tag,attrs);el.parent=stack.at(-1);el.parent.children.push(el);
      if(!['meta','link','img','br','input','use','path','circle'].includes(tag)&&!token.endsWith('/>'))stack.push(el);
    }else stack.at(-1).children.push(token);
  }
  document.body=document.querySelector('body');document.createElement=tag=>new Element(tag);
  const window={scrollY:0,matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(){}};
  vm.runInNewContext(code,{document,window,Date,console});
  return document;
}
boot(source.replace(/whatsapp: "[^"]*"/, 'whatsapp: ""'));
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
assert.equal($$('.gallery-card').length,6);
for(const filter of $$('.filter')){
  filter.fire('click');
  assert.equal($$('.gallery-card').filter(x=>!x.hidden).length,filter.dataset.filter==='todas'?6:1);
  assert.equal($$('.filter').filter(x=>x.getAttribute('aria-pressed')==='true').length,1);
}
$('.filter').fire('click');
$('.menu-toggle').fire('click');assert.equal($('.menu-toggle').getAttribute('aria-expanded'),'true');
document.fire('keydown',{key:'Escape'});assert.equal($('.menu-toggle').getAttribute('aria-expanded'),'false');
$('.menu-toggle').fire('click');$('#main-nav').querySelector('a').fire('click');assert.equal($('.menu-toggle').getAttribute('aria-expanded'),'false');
const opener=$('[data-gallery]');opener.fire('click');assert.equal($('#lightbox').open,true);assert.equal($('#lightbox-count').textContent,'1 / 6');
$('.lightbox-next').fire('click');assert.equal($('#lightbox-count').textContent,'2 / 6');
$('#lightbox').fire('keydown',{key:'ArrowLeft'});assert.equal($('#lightbox-count').textContent,'1 / 6');
$('.lightbox-prev').fire('click');assert.equal($('#lightbox-count').textContent,'6 / 6');
$('.lightbox-close').fire('click');assert.equal($('#lightbox').open,false);assert.equal(document.activeElement,opener);
$('[data-filter="vinhos"]').fire('click');$('[data-category="vinhos"]').querySelector('button').fire('click');assert.equal($('#lightbox-count').textContent,'1 / 1');assert.equal($('.lightbox-next').disabled,true);$('.lightbox-close').fire('click');
for(const button of $$('[data-whatsapp]')){assert.equal(button.fire('click').prevented,true);assert.equal($('#contact-dialog').open,true);$('.contact-close').fire('click');assert.equal($('#contact-dialog').open,false);}
assert($$('[data-maps]').every(x=>x.href==='https://maps.app.goo.gl/B8hvU9M4s6fxE9q47'));
boot();
assert($$('[data-whatsapp]').every(x=>x.href.startsWith('https://wa.me/5548992233863?text=')&&x.target==='_blank'&&x.rel.includes('noopener')));
assert.equal($('[data-phone]').querySelector('a').href,'tel:+5548992233863');
assert.equal($('[data-phone]').textContent,'(48) 99223-3863');
for(const match of html.matchAll(/(?:src|href)="((?:assets\/)[^"]+)"/g))assert(fs.existsSync(match[1]),'Arquivo ausente: '+match[1]);
assert.equal($$('h1').length,1);
console.log('PASS: 7 filtros; menu mobile e Escape; galeria, setas e ciclo; foco ao fechar; 7 contatos sem número; contatos configurados; Maps; arquivos locais.');
console.log('Limite: teste em DOM simulado; layout responsivo e comportamento nativo de dialog ainda requerem navegador real.');
