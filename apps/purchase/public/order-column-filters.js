import {categories} from './classification.mjs';
import {filterValues,orderCarrierValues} from './order-query.mjs';

const tracking=[['','全部'],['yes','有运单号'],['no','无运单号']];
const notes=[['','全部'],['yes','有备注'],['no','无备注']];
const spend=[['','全部'],['excluded','手动不计入'],['normal','按状态正常计入'],['effective','实际计入支出']];
const filters={
 platform:{label:'平台',multiple:true},
 account:{label:'采购账号',multiple:true},
 supplier:{label:'供应商',multiple:true},
 classificationValue:{label:'采购类别',key:'category',multiple:true},
 carrierText:{label:'物流公司',key:'carrier',multiple:true},
 status:{label:'订单状态',multiple:true},
 trackingText:{label:'运单号',fields:[['trackingQuery','运单号','search'],['tracking','运单状态',tracking]]},
 purchaseDate:{label:'采购日期',fields:[['basis','日期口径',[['paid','付款日期'],['created','下单日期']]],['month','月份','month'],['from','开始日期','date'],['to','结束日期','date']]},
 amountCents:{label:'实付金额',fields:[['minAmount','最低实付','number'],['maxAmount','最高实付','number']]},
 note:{label:'订单备注',fields:[['note','备注状态',notes]]},
 excludedFromSpend:{label:'支出统计',fields:[['spend','支出统计',spend]]}
};
const funnel='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 4h14l-5.5 6.5v5L8.5 17v-6.5z" stroke-linejoin="round"/></svg>';

export function createOrderColumnFilters({state,chipBar,onChange,escape}){
 const buttons=new Map();
 const lifecycle=new AbortController();
 let popup=null,anchor=null;
 const keyOf=(field,config)=>config.key||field;
 const keysFor=(field,config)=>config.multiple?[keyOf(field,config)]:config.fields.map(([key])=>key).filter(key=>key!=='basis');

 function valuesFor(key){
  if(key==='category')return Object.entries(categories);
  const values=new Set(state.orders.flatMap(order=>key==='carrier'?orderCarrierValues(order):[order[key]??'']));
  for(const selected of filterValues(state.filter[key]))values.add(selected);
  return [...values].sort((a,b)=>a.localeCompare(b,'zh-CN')).map(value=>[value,value||'未填写']);
 }

 function describe(field,config){
  if(config.multiple){
   const key=keyOf(field,config);
   return filterValues(state.filter[key]).map(value=>key==='category'?categories[value]||value:value||'未填写').join('、');
  }
  return config.fields.flatMap(([key,label,type])=>{
   const value=state.filter[key];
   return value?[Array.isArray(type)?type.find(([v])=>v===value)?.[1]||value:key==='trackingQuery'?value:label+' '+value]:[];
  }).join(' · ');
 }

 function sync(){
  const chips=[];
  for(const [field,config] of Object.entries(filters)){
   const description=describe(field,config);
   buttons.get(field)?.classList.toggle('is-filtered',Boolean(description));
   if(description)chips.push('<button type="button" class="order-filter-chip" data-clear-column="'+field+'" title="'+escape(description)+'" aria-label="清除'+config.label+'筛选">'+config.label+'：'+escape(description)+' <span aria-hidden="true">×</span></button>');
  }
  if(state.filter.preset&&state.filter.preset!=='all'){
   const label=[...document.querySelectorAll('[data-order-preset]')].find(button=>button.dataset.orderPreset===state.filter.preset)?.dataset.label;
   if(label)chips.push('<button type="button" class="order-filter-chip" data-clear-column="preset" aria-label="清除订单范围">'+escape(label)+' <span aria-hidden="true">×</span></button>');
  }
  if(state.filter.q)chips.push('<button type="button" class="order-filter-chip" data-clear-column="q" aria-label="清除订单搜索">搜索：'+escape(state.filter.q)+' <span aria-hidden="true">×</span></button>');
  chipBar.hidden=!chips.length;
  chipBar.innerHTML=chips.length?chips.join('')+'<button type="button" class="text-button" data-clear-column="all">清除全部</button>':'';
 }

 function close(restoreFocus=false){
  popup?.remove();
  popup=null;
  if(anchor){
   anchor.setAttribute('aria-expanded','false');
   if(restoreFocus)anchor.focus();
  }
  anchor=null;
 }

 function fieldInput([key,label,type]){
  const value=key==='basis'?state.basis:state.filter[key]||'';
  if(Array.isArray(type))return '<label>'+label+'<select name="'+key+'">'+type.map(([option,text])=>'<option value="'+option+'"'+(value===option?' selected':'')+'>'+text+'</option>').join('')+'</select></label>';
  return '<label>'+label+'<input name="'+key+'" type="'+type+'" value="'+escape(value)+'"'+(type==='number'?' min="0" step="0.01"':type==='search'?' placeholder="输入完整或部分运单号"':'')+'></label>';
 }

 function open(button,field,config){
  if(anchor===button){close(true);return;}
  close();
  anchor=button;
  anchor.setAttribute('aria-expanded','true');
  popup=document.createElement('form');
  popup.className='order-column-filter-popover';
  popup.setAttribute('role','dialog');
  popup.setAttribute('aria-label',config.label+'筛选');
  const key=keyOf(field,config);
  const options=config.multiple?valuesFor(key):[];
  const selected=new Set(filterValues(state.filter[key]));
  popup.innerHTML='<strong>'+config.label+'筛选</strong>'+
   (config.multiple?'<input type="search" aria-label="搜索'+config.label+'选项" placeholder="搜索'+config.label+'"><div class="order-column-filter-options">'+options.map(([value,label])=>'<label><input name="option" type="checkbox" value="'+escape(value)+'"'+(selected.has(value)?' checked':'')+'><span>'+escape(label)+'</span></label>').join('')+'<p hidden>没有匹配选项</p></div>':config.fields.map(fieldInput).join(''))+
   '<div class="order-column-filter-actions"><button type="button" class="btn ghost">清空</button><button type="submit" class="btn primary">应用</button></div>';
  document.body.append(popup);
  const rect=button.getBoundingClientRect();
  const panel=popup;
  const bound=panel.getBoundingClientRect();
  panel.style.left=Math.max(8,Math.min(rect.right-bound.width,window.innerWidth-bound.width-8))+'px';
  panel.style.top=Math.max(8,rect.bottom+5+bound.height<=window.innerHeight?rect.bottom+5:Math.min(rect.top-bound.height-5,window.innerHeight-bound.height-8))+'px';
  const search=config.multiple?panel.querySelector('input[type=search]'):null;
  search?.addEventListener('input',()=>{
   const term=search.value.trim().toLocaleLowerCase();
   const labels=[...panel.querySelectorAll('.order-column-filter-options label')];
   for(const label of labels)label.hidden=!label.textContent.toLocaleLowerCase().includes(term);
   panel.querySelector('.order-column-filter-options p').hidden=labels.some(label=>!label.hidden);
  });
  panel.querySelector('.order-column-filter-actions button').addEventListener('click',()=>{
   for(const key of keysFor(field,config))state.filter[key]='';
   close(true);
   onChange();
  });
  panel.addEventListener('submit',event=>{
   event.preventDefault();
   const data=new FormData(panel);
   if(config.multiple){
    const choices=data.getAll('option');
    state.filter[key]=choices.length?choices:'';
   }else{
    for(const [fieldKey] of config.fields){
     const value=String(data.get(fieldKey)??'').trim();
     if(fieldKey==='basis')state.basis=value;
     else state.filter[fieldKey]=value;
    }
   }
   close(true);
   onChange();
  });
  (search||panel.querySelector('input,select')).focus();
 }

 chipBar.addEventListener('click',event=>{
  const field=event.target.closest('[data-clear-column]')?.dataset.clearColumn;
  if(!field)return;
  if(field==='all')for(const key of Object.keys(state.filter))state.filter[key]=key==='preset'?'all':'';
  else if(field==='preset')state.filter.preset='all';
  else if(field==='q')state.filter.q='';
  else for(const key of keysFor(field,filters[field]))state.filter[key]='';
  onChange();
 },{signal:lifecycle.signal});
 document.addEventListener('pointerdown',event=>{
  if(popup&&!popup.contains(event.target)&&!anchor.contains(event.target))close();
 },{signal:lifecycle.signal});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&popup){event.preventDefault();close(true);}
 },{signal:lifecycle.signal});
 window.addEventListener('resize',()=>close(),{signal:lifecycle.signal});
 window.addEventListener('scroll',event=>{if(popup&&!popup.contains(event.target))close();},{capture:true,signal:lifecycle.signal});

 return {
  decorate(columns){
   for(const column of columns){
    const config=filters[column.field];
    if(!config)continue;
    column.titleFormatter=()=>{
     const holder=document.createElement('span');
     holder.className='order-column-title';
     const title=document.createElement('button');
     title.type='button';
     title.className='order-column-sort';
     title.textContent=column.title;
     title.title=column.title+' · 点击排序';
     const button=document.createElement('button');
     button.type='button';
     button.className='order-column-filter';
     button.setAttribute('aria-label','筛选'+config.label);
     button.setAttribute('aria-haspopup','dialog');
     button.setAttribute('aria-expanded','false');
     button.title='筛选'+config.label;
     button.innerHTML=funnel;
     button.classList.toggle('is-filtered',Boolean(describe(column.field,config)));
     button.addEventListener('keydown',event=>event.stopPropagation());
     button.addEventListener('click',event=>{event.stopPropagation();open(button,column.field,config);});
     buttons.set(column.field,button);
     holder.append(title,button);
     return holder;
    };
   }
  },
  sync,
  close,
  dispose(){close();lifecycle.abort();}
 };
}
