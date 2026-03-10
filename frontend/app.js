/* ScanLab v2 — embedded, injected into #scanlab-app-root */
(function(){
const ROOT=document.getElementById('scanlab-app-root');
if(!ROOT)return;

// Fonts
if(!document.querySelector('link[href*="JetBrains"]')){
  const lk=document.createElement('link');lk.rel='stylesheet';
  lk.href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
  document.head.appendChild(lk);
}

// Chart.js
function loadChart(cb){
  if(window.Chart){cb();return;}
  const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';s.onload=cb;document.head.appendChild(s);
}

// Styles
const ST=document.createElement('style');
ST.textContent=`
#sl{
  --bg:#f5f5f6;--bg0:#fff;--sur:#fff;--sur2:#efefef;--sur3:#e2e2e5;
  --bdr:#d5d5d9;--bdr2:#aaaaaf;--tx:#0a0a0e;--tx2:#3d3d47;--tx3:#6b6b7a;
  --ac:#5457cd;--acd:rgba(84,87,205,.1);
  --gn:#166534;--gnd:rgba(22,101,52,.09);
  --rd:#991b1b;--rdd:rgba(153,27,27,.09);
  --f:'Inter',system-ui,sans-serif;--m:'JetBrains Mono',monospace;
  font-family:var(--f);font-size:14px;color:var(--tx);background:var(--bg);
  border-top:3px solid var(--ac);display:flex;flex-direction:column;
  transition:background .25s,color .25s,border-color .25s;
}
body[data-ui-theme="dark"] #sl{
  --bg:#0d0d12;--bg0:#13131a;--sur:#17171f;--sur2:#1e1e28;--sur3:#252530;
  --bdr:#2a2a38;--bdr2:#3d3d52;--tx:#f0f0f8;--tx2:#9898b8;--tx3:#5e5e78;
  --ac:#7c7ff5;--acd:rgba(124,127,245,.11);
  --gn:#22c55e;--gnd:rgba(34,197,94,.1);
  --rd:#f87171;--rdd:rgba(248,113,113,.1);
}

/* shell */
#sl-shell{display:flex;flex:1;min-height:72vh}
#sl-sidenav{width:168px;flex-shrink:0;background:var(--sur);border-right:1px solid var(--bdr);display:flex;flex-direction:column;padding:4px 0;overflow-y:auto}
#sl-topbar{display:none;background:var(--sur);border-bottom:1px solid var(--bdr);overflow-x:auto;scrollbar-width:none;white-space:nowrap}
#sl-topbar::-webkit-scrollbar{display:none}
@media(max-width:660px){#sl-sidenav{display:none}#sl-topbar{display:block}}

.sni{display:flex;align-items:center;gap:8px;padding:9px 14px;cursor:pointer;font-size:12px;font-weight:500;color:var(--tx3);transition:color .1s,background .1s;border-left:2px solid transparent;user-select:none}
.sni:hover{color:var(--tx2);background:var(--sur2)}
.sni.on{color:var(--ac);border-left-color:var(--ac);background:var(--acd)}
.sni-ic{width:18px;text-align:center;font-size:14px;flex-shrink:0}

.sti{display:inline-flex;align-items:center;gap:5px;padding:10px 13px;font-size:12px;font-weight:500;color:var(--tx3);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:color .1s;vertical-align:top}
.sti:hover{color:var(--tx2)}
.sti.on{color:var(--ac);border-bottom-color:var(--ac)}

/* content */
#sl-ct{flex:1;overflow-y:auto;overscroll-behavior:contain;min-width:0}
#sl-ct::-webkit-scrollbar{width:4px}
#sl-ct::-webkit-scrollbar-thumb{background:var(--bdr2)}

.pg{display:none;padding:18px;flex-direction:column;gap:13px;max-width:680px}
.pg.on{display:flex}

/* section box */
.bx{background:var(--sur);border:1px solid var(--bdr)}
.bx-hd{padding:10px 13px;border-bottom:1px solid var(--bdr);display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.bx-tt{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:var(--tx2)}
.bx-ds{font-size:10px;color:var(--tx3);margin-top:3px;line-height:1.5}

/* hierarchy */
.grp{border-bottom:1px solid var(--bdr)}
.grp:last-child{border-bottom:none}
.grp-hd{display:flex;align-items:center;gap:9px;padding:11px 13px;cursor:pointer;user-select:none;transition:background .1s}
.grp-hd:hover{background:var(--sur2)}
.grp-ic{font-size:15px;width:22px;text-align:center;flex-shrink:0}
.grp-lbl{font-size:13px;font-weight:600;color:var(--tx)}
.grp-sub{font-size:10px;color:var(--tx3);margin-top:1px}
.grp-r{display:flex;align-items:center;gap:6px;margin-left:auto;flex-shrink:0}
.grp-cnt{font-size:10px;font-weight:700;background:var(--sur3);color:var(--tx3);padding:1px 7px}
.grp-cnt.sel{background:var(--acd);color:var(--ac)}
.grp-chv{font-size:9px;color:var(--tx3);transition:transform .18s}
.grp-hd.op .grp-chv{transform:rotate(90deg)}
.grp-bd{display:none;border-top:1px solid var(--bdr)}
.grp-bd.op{display:block}

.sa-row{display:flex;align-items:center;gap:7px;padding:6px 13px 6px 22px;cursor:pointer;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--tx3);border-bottom:1px solid var(--bdr);background:var(--sur2);transition:background .1s}
.sa-row:hover{background:var(--sur3);color:var(--tx2)}

.dr{display:flex;align-items:flex-start;gap:9px;padding:10px 13px 10px 22px;cursor:pointer;border-bottom:1px solid var(--bdr);transition:background .1s}
.dr:last-child{border-bottom:none}
.dr:hover{background:var(--sur2)}
.dr.on{background:var(--acd)}
.dck{width:14px;height:14px;border:1.5px solid var(--bdr2);flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center;font-size:9px;color:transparent;background:var(--sur);transition:all .12s}
.dr.on .dck{background:var(--ac);border-color:var(--ac);color:#fff}
.di{flex:1;min-width:0}
.dn{font-size:12px;font-weight:600;color:var(--tx);margin-bottom:2px}
.dcl{font-size:10px;color:var(--tx3);font-family:var(--m);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dd{font-size:10px;color:var(--tx3);margin-top:3px;line-height:1.45}
.dm{display:flex;flex-direction:column;align-items:flex-end;flex-shrink:0;gap:2px}
.dauc{font-size:12px;font-weight:700;color:var(--gn);font-family:var(--m)}
.dbb{font-size:9px;color:var(--tx3)}

/* pills */
.psum{padding:8px 13px;border-top:1px solid var(--bdr);background:var(--sur2);display:flex;flex-wrap:wrap;gap:5px;align-items:center;min-height:36px}
.pill{display:flex;align-items:center;gap:3px;background:var(--acd);border:1px solid rgba(84,87,205,.2);padding:2px 7px 2px 9px;font-size:11px;font-weight:500;color:var(--ac)}
.pill-x{cursor:pointer;font-size:13px;line-height:1;margin-left:2px}
.pill-x:hover{color:var(--rd)}
.nsel{font-size:11px;color:var(--tx3);font-style:italic}

/* drop zone */
.dz{border:2px dashed var(--bdr2);padding:26px 14px;text-align:center;cursor:pointer;background:var(--sur);transition:border-color .18s,background .18s}
.dz:hover,.dz.ov{border-color:var(--ac);background:var(--acd)}
.dz-icon{font-size:26px;margin-bottom:7px}
.dz-t{font-size:13px;font-weight:600;color:var(--tx);margin-bottom:3px}
.dz-s{font-size:11px;color:var(--tx3);margin-bottom:10px}
#sl-prev{max-width:100%;max-height:130px;margin-top:10px;border:1px solid var(--bdr);display:none;object-fit:contain}
.ch-btn{display:inline-flex;align-items:center;gap:5px;background:var(--ac);color:#fff;border:none;cursor:pointer;font-family:var(--f);font-size:12px;font-weight:600;padding:6px 14px}
.ch-btn:hover{opacity:.87}

/* run */
.run{width:100%;padding:12px;background:var(--ac);color:#fff;font-family:var(--f);font-size:13px;font-weight:600;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:opacity .15s}
.run:hover:not(:disabled){opacity:.87}
.run:disabled{background:var(--sur3);color:var(--tx3);cursor:not-allowed}

/* loading */
.ld{display:none;text-align:center;padding:38px 0}
.ld.on{display:block}
.sp{width:32px;height:32px;border:2.5px solid var(--bdr2);border-top-color:var(--ac);border-radius:50%;animation:spin .65s linear infinite;margin:0 auto}
@keyframes spin{to{transform:rotate(360deg)}}
.ld-lbl{font-size:13px;font-weight:500;margin-top:10px;color:var(--tx2)}
.ld-mdl{font-size:10px;color:var(--tx3);margin-top:4px;font-family:var(--m)}

/* verdict */
.vd{padding:12px 14px;display:flex;align-items:center;gap:11px;border:1px solid}
.vd.pos{background:var(--rdd);border-color:rgba(153,27,27,.2)}
.vd.neg{background:var(--gnd);border-color:rgba(22,101,52,.2)}
.vd-ic{font-size:20px;flex-shrink:0}
.vd-pr{font-size:15px;font-weight:700}
.vd-sub{font-size:11px;color:var(--tx2);margin-top:2px}

/* canvas */
.cv-wrap{background:#000;line-height:0;position:relative;border:1px solid var(--bdr)}
#sl-cv{width:100%;display:block;aspect-ratio:1}
.cv-bar{display:flex;align-items:flex-start;gap:9px;padding:8px 11px;background:var(--sur);border:1px solid var(--bdr);border-top:none}
.cv-ex{font-size:10px;color:var(--tx3);flex:1;line-height:1.5}
.cv-ex strong{color:var(--tx2)}
.tbtn{background:var(--sur2);border:1px solid var(--bdr);color:var(--tx2);font-size:10px;padding:3px 9px;cursor:pointer;font-family:var(--f);flex-shrink:0}
.tbtn:hover{border-color:var(--bdr2)}

/* layers */
.ly-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:9px 13px;border-bottom:1px solid var(--bdr)}
.ly-meta{flex:1}
.ly-tt{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:var(--tx2)}
.ly-ex{font-size:10px;color:var(--tx3);margin-top:3px;line-height:1.5}
.ly-rst{font-size:10px;color:var(--tx3);cursor:pointer;background:none;border:none;font-family:var(--f);flex-shrink:0;padding:0}
.ly-rst:hover{color:var(--ac)}
.lr{display:flex;align-items:center;gap:9px;padding:9px 13px;border-bottom:1px solid var(--bdr)}
.lr:last-child{border-bottom:none}
.sw{width:8px;height:8px;flex-shrink:0}
.li{flex:1;min-width:0}
.ln{font-size:12px;font-weight:600;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lp{font-size:10px;color:var(--tx3);font-family:var(--m);margin-top:1px}
.sr{display:flex;align-items:center;gap:5px;margin-top:4px}
.sl{flex:1;-webkit-appearance:none;height:3px;outline:none;cursor:pointer;background:linear-gradient(to right,var(--ac) 0%,var(--ac) var(--p,50%),var(--bdr2) var(--p,50%))}
.sl::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;background:var(--tx);border-radius:50%;cursor:pointer;border:2px solid var(--sur)}
.sl::-moz-range-thumb{width:12px;height:12px;background:var(--tx);border-radius:50%;border:none}
.sp2{font-size:10px;color:var(--tx3);min-width:26px;text-align:right;font-family:var(--m)}
.vs{font-size:13px;cursor:pointer;user-select:none;flex-shrink:0;transition:opacity .15s}
.vs.off{opacity:.2}

/* result tabs */
.rt-bar{display:flex;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid var(--bdr);background:var(--sur)}
.rt-bar::-webkit-scrollbar{display:none}
.rt{flex:0 0 auto;padding:9px 13px;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;border-right:1px solid var(--bdr);transition:background .1s;text-align:center}
.rt:hover{background:var(--sur2)}
.rt.on{border-bottom-color:var(--ac)}
.rt-mdl{display:block;font-size:9px;color:var(--tx3);margin-bottom:2px;white-space:nowrap}
.rt-pr{display:block;font-size:11px;font-weight:600;color:var(--tx);white-space:nowrap}

/* detail */
.det{background:var(--sur);border:1px solid var(--bdr);animation:fd .2s}
@keyframes fd{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.cr{padding:13px;display:flex;align-items:center;gap:13px;border-bottom:1px solid var(--bdr)}
.cm{flex:1}
.cp{font-size:15px;font-weight:700;margin-bottom:3px}
.cx{font-size:10px;color:var(--tx3);line-height:1.55;margin-top:5px;max-width:300px}
.icd{display:inline-block;margin-top:4px;background:var(--sur2);border:1px solid var(--bdr);padding:2px 7px;font-size:10px;font-family:var(--m);color:var(--ac)}
.tr{display:flex;flex-wrap:wrap;gap:5px;padding:9px 13px;border-bottom:1px solid var(--bdr);background:var(--sur2)}
.tm{padding:3px 8px;background:var(--sur);border:1px solid var(--bdr);font-size:10px}
.tm strong{color:var(--ac);font-family:var(--m)}
.tm span{color:var(--tx3)}
.cl{padding:11px 13px;background:var(--sur2);border-bottom:1px solid var(--bdr);font-size:12px;line-height:1.7;color:var(--tx2)}
.cl strong{color:var(--tx)}
.fr{padding:9px 13px;border-bottom:1px solid var(--bdr);display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.fl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--tx3);margin-right:3px}
.fc{background:var(--sur2);border:1px solid var(--bdr);font-size:10px;padding:2px 7px;color:var(--tx2)}
.ps{padding:11px 13px}
.pt{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:var(--tx3);margin-bottom:3px}
.pe{font-size:10px;color:var(--tx3);margin-bottom:8px;line-height:1.5}

/* action bar */
.ab{display:flex;gap:7px}
.abtn{flex:1;padding:10px;border:none;cursor:pointer;font-family:var(--f);font-size:12px;font-weight:600;transition:opacity .15s}
.abtn-ghost{background:var(--sur);border:1px solid var(--bdr);color:var(--tx2)}
.abtn-ghost:hover{border-color:var(--bdr2);color:var(--tx)}
.abtn-acc{background:var(--ac);color:#fff}
.abtn-acc:hover{opacity:.87}

/* catalogue */
.mc{background:var(--sur);border:1px solid var(--bdr);margin-bottom:9px}
.mc-hd{padding:11px 13px;border-bottom:1px solid var(--bdr);display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.mc-nm{font-size:13px;font-weight:700;color:var(--tx)}
.mc-vr{font-size:10px;color:var(--tx3);font-family:var(--m);margin-top:1px}
.mc-bd{padding:12px 13px}
.mc-dc{font-size:12px;color:var(--tx2);margin-bottom:9px;line-height:1.6}
.mc-ex{font-size:11px;color:var(--tx3);line-height:1.6;padding:7px 10px;background:var(--sur2);border-left:2px solid var(--ac);margin-bottom:9px}
.mets{display:flex;gap:0;border:1px solid var(--bdr);margin-bottom:8px}
.met{flex:1;padding:8px 9px;text-align:center;border-right:1px solid var(--bdr);position:relative}
.met:last-child{border-right:none}
.met-v{font-size:15px;font-weight:700;color:var(--gn);font-family:var(--m)}
.met-n{font-size:9px;color:var(--tx3);text-transform:uppercase;letter-spacing:.7px;margin-top:1px}
.met-tip{display:none;position:absolute;bottom:100%;left:50%;transform:translateX(-50%);background:var(--tx);color:var(--sur);font-size:10px;padding:5px 8px;white-space:nowrap;z-index:10;margin-bottom:4px;font-family:var(--f);font-weight:normal;max-width:220px;white-space:normal;text-align:center;line-height:1.4}
.met:hover .met-tip{display:block}
.mc-cls{font-size:10px;color:var(--tx3);font-family:var(--m);margin-bottom:8px;line-height:1.6}
.use-btn{background:var(--ac);color:#fff;border:none;font-family:var(--f);font-size:11px;font-weight:600;padding:5px 12px;cursor:pointer}
.use-btn:hover{opacity:.87}

/* batch */
.bz{border:2px dashed var(--bdr2);padding:24px;text-align:center;cursor:pointer;background:var(--sur);transition:border-color .18s,background .18s}
.bz:hover{border-color:var(--ac);background:var(--acd)}
.pbr{background:var(--sur3);height:4px;margin:10px 0;overflow:hidden}
.pf{height:100%;background:var(--ac);transition:width .3s}
.tbl{width:100%;border-collapse:collapse;font-size:12px}
.tbl th{background:var(--sur2);color:var(--tx2);padding:6px 9px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid var(--bdr)}
.tbl td{padding:7px 9px;border-bottom:1px solid var(--bdr);color:var(--tx2)}
.tbl tr:last-child td{border-bottom:none}
.tbl tr:hover td{background:var(--sur2)}
.exp-btn{background:var(--sur2);border:1px solid var(--bdr);color:var(--tx2);font-family:var(--f);font-size:11px;font-weight:600;padding:6px 12px;cursor:pointer;margin-top:8px}

/* analytics */
.sg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border:1px solid var(--bdr)}
.st{background:var(--sur);padding:13px;text-align:center;border-right:1px solid var(--bdr)}
.st:last-child{border-right:none}
.st-n{font-size:22px;font-weight:700;font-family:var(--m);color:var(--ac)}
.st-l{font-size:10px;color:var(--tx3);text-transform:uppercase;letter-spacing:.8px;margin-top:2px}
.ch{background:var(--sur);border:1px solid var(--bdr);padding:13px;margin-top:1px}
.ch-t{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:var(--tx2);margin-bottom:3px}
.ch-d{font-size:10px;color:var(--tx3);margin-bottom:9px;line-height:1.5}

/* about */
.ab2{font-size:13px;line-height:1.75;color:var(--tx2)}
.ab2 h3{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:var(--tx);margin:16px 0 6px;border-bottom:1px solid var(--bdr);padding-bottom:4px}
.ab2 p{margin-bottom:8px}
.ab2 ul{margin-left:16px;margin-bottom:8px}
.ab2 li{margin:4px 0}
.ab2 a{color:var(--ac)}
.disc{background:var(--sur2);border-left:3px solid var(--rd);padding:9px 11px;font-size:11px;color:var(--tx3);margin-top:12px;line-height:1.6}
.gl{border:1px solid var(--bdr);margin-top:10px}
.gt{display:flex;gap:9px;padding:8px 11px;border-bottom:1px solid var(--bdr)}
.gt:last-child{border-bottom:none}
.gt dt{font-size:11px;font-weight:700;color:var(--ac);font-family:var(--m);width:100px;flex-shrink:0;padding-top:1px}
.gt dd{font-size:11px;color:var(--tx2);line-height:1.55}

/* note box */
.nb{font-size:11px;color:var(--tx3);line-height:1.6;padding:7px 0}
`;
document.head.appendChild(ST);

// ── Constants ─────────────────────────────────────────────────
const API='/scanlab-api/v2';
const TINTS=[[84,87,205],[6,182,212],[34,197,94],[245,158,11],[236,72,153]];

const DI={
  resnet18_pneumonia:{name:'Pneumonia',desc:'Detects bacterial/viral pneumonia from chest X-rays. Binary: Normal vs Pneumonia. Trained on 5,856 CXRs (Kaggle Chest X-Ray Images dataset).'},
  resnet18_covid19:{name:'COVID-19 / Pneumonia',desc:'3-class chest X-ray classifier: Normal, COVID-19, Bacterial Pneumonia. Trained on combined public COVID-CXR datasets.'},
  efficientnet_chest:{name:'14 Chest Pathologies',desc:'Multi-label: detects up to 14 conditions simultaneously — atelectasis, cardiomegaly, effusion, infiltration, mass, nodule, and more. Based on NIH CXR14 methodology.'},
  resnet18_brain_tumor:{name:'Brain Tumour',desc:'Binary: No Tumour vs Tumour Present from MRI. Trained on Brain Tumour MRI Dataset (Kaggle). Covers glioma, meningioma, pituitary adenoma.'},
  resnet18_skin_lesion:{name:'Melanoma / Skin Lesion',desc:'Binary: Benign vs Malignant dermoscopy image. Based on ISIC 2020 methodology. Identifies dermoscopic features of malignancy.'}
};

const GROUPS=[
  {id:'cxr',icon:'🫁',label:'Chest X-Ray',sub:'PA/AP radiograph — pulmonary & cardiac',models:['resnet18_pneumonia','resnet18_covid19','efficientnet_chest']},
  {id:'mri',icon:'🧠',label:'Brain MRI',sub:'MRI scan — intracranial lesions',models:['resnet18_brain_tumor']},
  {id:'derm',icon:'🔬',label:'Dermoscopy',sub:'Skin photography — melanocytic lesions',models:['resnet18_skin_lesion']}
];

const MTIPS={
  auc:'AUC — Area Under the ROC Curve. Measures how well the model separates classes. 1.0 = perfect, 0.5 = no better than random. Above 0.85 is considered clinically useful for screening.',
  mean_auc:'Mean AUC — average AUC across all detected classes in a multi-label model.',
  sensitivity:'Sensitivity — True Positive Rate. % of actual diseased cases correctly detected. High sensitivity = fewer missed diagnoses (false negatives).',
  specificity:'Specificity — True Negative Rate. % of healthy cases correctly identified. High specificity = fewer false alarms (false positives).',
  f1:'F1 Score — harmonic mean of precision and recall. Balanced metric that works well on imbalanced class distributions.',
  accuracy:'Accuracy — % of all predictions that are correct. Can be misleading when classes are imbalanced (e.g., 90% normal scans).'
};

// ── State ─────────────────────────────────────────────────────
let mdata={},sel=new Set(),file=null,res={},layers={},origImg=null,actMk=null,probCh=null,bdata=[],chMdl=null,chTime=null;

// ── Shell HTML ────────────────────────────────────────────────
ROOT.id='sl';
ROOT.innerHTML=`
<div id="sl-topbar">
  <span class="sti on" data-t="dx">Diagnose</span>
  <span class="sti" data-t="md">Models</span>
  <span class="sti" data-t="bt">Batch</span>
  <span class="sti" data-t="an">Analytics</span>
  <span class="sti" data-t="tt">Tattoo ID</span>
  <span class="sti" data-t="ab">Info</span>
</div>
<div id="sl-shell">
  <nav id="sl-sidenav">
    <div class="sni on" data-t="dx"><span class="sni-ic">Dx</span>Diagnose</div>
    <div class="sni" data-t="md"><span class="sni-ic">Md</span>Models</div>
    <div class="sni" data-t="bt"><span class="sni-ic">Bt</span>Batch</div>
    <div class="sni" data-t="an"><span class="sni-ic">An</span>Analytics</div>
    <div class="sni" data-t="tt" style="border-top:1px solid var(--bdr);margin-top:4px;padding-top:8px"><span class="sni-ic" style="font-size:8px;font-weight:700;background:var(--tx);color:var(--bg0);padding:2px 3px">ID</span>Tattoo ID</div>
    <div class="sni" data-t="ab"><span class="sni-ic">Inf</span>Info</div>
  </nav>
  <div id="sl-ct">

    <div class="pg on" id="pg-dx">
      <div class="bx">
        <div class="bx-hd">
          <div><div class="bx-tt">Step 1 — Study Type &amp; Finding</div><div class="bx-ds">Choose the imaging modality, then select which pathologies to screen for. Multiple models run in parallel.</div></div>
          <span id="sl-cnt" style="font-size:11px;color:var(--tx3);flex-shrink:0;padding-top:2px">None selected</span>
        </div>
        <div id="sl-hier"></div>
        <div class="psum" id="sl-psum"><span class="nsel">No findings selected — expand a group above</span></div>
      </div>

      <div class="bx">
        <div class="bx-hd"><div><div class="bx-tt">Step 2 — Upload Scan Image</div><div class="bx-ds">Chest X-ray: PA/AP view JPEG. Brain MRI: axial T1/T2 slice. Dermoscopy: standardised dermoscopic photo.</div></div></div>
        <div class="dz" id="sl-dz">
          <div class="dz-icon">🩻</div>
          <div class="dz-t">Drop image here or click Browse</div>
          <div class="dz-s">JPEG · PNG · max 10 MB</div>
          <button class="ch-btn" onclick="document.getElementById('sl-fi').click()">📂 Browse</button>
          <input id="sl-fi" type="file" accept="image/*" hidden>
          <img id="sl-prev" alt="preview">
        </div>
      </div>


      <div class="bx" id="sl-scard" style="display:none">
        <div class="bx-hd"><div><div class="bx-tt">Load Sample Image</div></div></div>
        <div id="sl-sbtns" style="padding:8px 13px;display:flex;flex-wrap:wrap;gap:5px"></div>
      </div>

      <button class="run" id="sl-run" disabled>⚡ Run Analysis</button>
      <div class="ld" id="sl-ld"><div class="sp"></div><div class="ld-lbl">Running inference…</div><div class="ld-mdl" id="sl-ldm"></div></div>

      <div id="sl-res" style="display:none;flex-direction:column;gap:13px">
        <div class="vd" id="sl-vd"><div class="vd-ic" id="sl-vic"></div><div><div class="vd-pr" id="sl-vpr"></div><div class="vd-sub" id="sl-vsb"></div></div></div>

        <div>
          <div class="cv-wrap"><canvas id="sl-cv"></canvas></div>
          <div class="cv-bar">
            <div class="cv-ex"><strong>Grad-CAM Activation Map</strong> — colour heatmap showing which image regions most influenced each model's prediction. Warmer = higher activation. Each model is a separate composited layer.</div>
            <button class="tbtn" id="sl-rst1">↺ Reset</button>
          </div>
        </div>

        <div class="bx">
          <div class="ly-hd">
            <div class="ly-meta"><div class="ly-tt">Activation Layers</div><div class="ly-ex">Each slider controls one model's heatmap opacity. Default opacity = model confidence × 80%. Toggle 👁 to hide/show. Layers composite in real-time on the canvas above.</div></div>
            <button class="ly-rst" id="sl-rst2">Reset to confidence</button>
          </div>
          <div id="sl-lyrs"></div>
        </div>

        <div class="bx">
          <div class="rt-bar" id="sl-rtabs"></div>
          <div id="sl-det"></div>
        </div>

        <div class="ab">
          <button class="abtn abtn-ghost" id="sl-dlbtn">⬇ Download Report</button>
          <button class="abtn abtn-ghost" id="sl-prbtn">🖨 Print</button>
          <button class="abtn abtn-acc" id="sl-newbtn">New scan →</button>
        </div>
      </div>
    </div>

    <div class="pg" id="pg-md">
      <div class="nb">All models are research-grade neural networks trained on publicly available datasets. <strong>AUC</strong> (Area Under ROC Curve) is the primary quality metric — 1.0 = perfect. <strong>Sensitivity</strong> = ability to detect true disease. <strong>Specificity</strong> = ability to rule it out. Hover any metric box for a full definition.</div>
      <div id="sl-cat"></div>
    </div>

    <div class="pg" id="pg-bt">
      <div class="nb">Upload multiple scans at once. All are processed using the first model selected in the Diagnose tab. Results export as CSV for spreadsheet analysis or further processing.</div>
      <div class="bz" id="sl-bz"><div style="font-size:22px;margin-bottom:5px">📁</div><div style="font-size:13px;font-weight:600;color:var(--tx);margin-bottom:3px">Select multiple images</div><div style="font-size:11px;color:var(--tx3)">Uses first selected model from Diagnose tab</div><input id="sl-bfi" type="file" accept="image/*" multiple hidden></div>
      <div id="sl-bprog" style="display:none"><div class="pbr"><div class="pf" id="sl-bf"></div></div><div id="sl-bst" style="font-size:11px;color:var(--tx3)"></div></div>
      <div id="sl-bres" style="display:none"><div style="overflow-x:auto;border:1px solid var(--bdr)"><table class="tbl"><thead><tr><th>File</th><th>Prediction</th><th>Confidence</th><th>ICD-10</th></tr></thead><tbody id="sl-btb"></tbody></table></div><button class="exp-btn" id="sl-expbtn">Export CSV</button></div>
    </div>

    <div class="pg" id="pg-an">
      <div class="nb">Aggregate statistics from the API. Processing time is measured server-side from image decode to final output, including Grad-CAM generation.</div>
      <div class="sg" id="sl-sts"></div>
      <div class="ch"><div class="ch-t">Predictions by Model</div><div class="ch-d">How many scans each model has processed. Helps identify which study types are most frequently used.</div><canvas id="sl-chm" height="140"></canvas></div>
      <div class="ch"><div class="ch-t">Average Processing Time (ms)</div><div class="ch-d">Server-side inference time. Includes Grad-CAM generation. Current models run on CPU — GPU would reduce by ~10×.</div><canvas id="sl-cht" height="100"></canvas></div>
    </div>


    <div class="pg" id="pg-tt">
      <style>.sl-tgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}@media(max-width:700px){.sl-tgrid{grid-template-columns:1fr}}.sl-tswatch{width:32px;height:32px;border:1px solid var(--bdr);display:inline-block}.sl-tbadge{display:inline-block;background:var(--tx);color:var(--bg0);font-size:9px;padding:1px 6px;font-weight:600}.sl-ttable{width:100%;border-collapse:collapse;font-size:11px}.sl-ttable td,.sl-ttable th{border:1px solid var(--bdr);padding:4px 6px;text-align:left}.sl-ttable th{background:var(--sur2);font-weight:600}.sl-tmcard{border:1px solid var(--bdr);padding:10px;margin-bottom:6px}.sl-tsimbar{background:var(--bg0);border:1px solid var(--bdr);height:8px;width:100%;margin:4px 0}.sl-tsimfill{background:var(--tx);height:100%}.sl-tconf{font-size:11px;font-weight:600;padding:5px 8px;border:1px solid var(--tx);margin-top:8px;text-align:center}.sl-tregcard{border:1px solid var(--bdr);padding:8px;margin-bottom:5px}.sl-tlinked{display:inline-block;background:var(--tx);color:var(--bg0);font-size:8px;padding:1px 5px;margin-left:4px}.sl-tfp{font-family:var(--m);font-size:10px;color:var(--tx);background:var(--sur2);border:1px solid var(--bdr);padding:3px 6px;display:inline-block}</style>
      <div class="bx">
        <div class="bx-hd"><div><div class="bx-tt">Tattoo-Based Patient Identification</div>
        <div class="bx-ds">Emergency patient identification via distinctive body markings. Upload a photo to search the Stabilarity voluntary registry.</div></div></div>
      </div>

      <div class="sl-tgrid">
        <div>
          <div class="bx">
            <div class="bx-hd"><div><div class="bx-tt">Upload &amp; Controls</div></div></div>
            <div class="dz" id="sl-tdz">
              <div class="dz-icon">ID</div>
              <div class="dz-t">Upload tattoo or body marking</div>
              <div class="dz-s">Photo of tattoo, scar, or distinguishing mark</div>
              <button class="ch-btn" onclick="document.getElementById('sl-tfi').click()">Browse</button>
              <input id="sl-tfi" type="file" accept="image/*" hidden>
            </div>
            <div style="padding:8px 13px;border-top:1px solid var(--bdr)"><button class="tbtn" id="sl-tsample" style="width:100%;text-align:center;padding:6px">Load sample image</button></div>
            <div style="padding:6px 13px"><label style="font-size:10px;color:var(--tx2)">Min similarity: <strong id="sl-tthresh-lbl">0.55</strong></label><input type="range" id="sl-tthresh" min="0.5" max="1.0" step="0.05" value="0.55" style="width:100%;accent-color:var(--tx)" oninput="this.previousElementSibling.querySelector('strong').textContent=parseFloat(this.value).toFixed(2)"></div>
            <button class="run" id="sl-trun" disabled style="margin-top:0">Analyze Marking</button>
            <div id="sl-timgstats" style="display:none;padding:10px 13px">
              <img id="sl-tprev" style="max-width:100%;max-height:160px;border:1px solid var(--bdr);display:none;object-fit:contain" alt="preview">
              <div id="sl-toverstats" style="margin-top:6px"></div>
            </div>
          </div>
        </div>
        <div>
          <div class="bx"><div class="bx-hd"><div><div class="bx-tt">Feature Report</div></div></div><div id="sl-tfeat" style="padding:10px 13px;font-size:11px;color:var(--tx3)">Upload and analyze an image to view features.</div></div>
        </div>
        <div>
          <div class="bx"><div class="bx-hd"><div><div class="bx-tt">Registry Search Results</div></div></div><div id="sl-tmatches" style="padding:10px 13px;font-size:11px;color:var(--tx3)">Results will appear after analysis.</div></div>
        </div>
      </div>

      <div class="ld" id="sl-tld"><div class="sp"></div><div class="ld-lbl">Analyzing marking...</div></div>

      <div id="sl-tres" style="display:none"></div>
      <div id="sl-treportwrap" style="display:none;padding:8px 0"><button class="run" id="sl-treport" style="width:100%;margin:0">Download Report</button></div>

      <div class="bx">
        <div class="bx-hd"><div><div class="bx-tt">Browse Registry</div></div></div>
        <div style="padding:10px 13px;display:flex;flex-wrap:wrap;gap:5px;border-bottom:1px solid var(--bdr)">
          <select id="sl-tcat" style="font-size:10px;padding:4px 6px;background:var(--sur2);border:1px solid var(--bdr);color:var(--tx2)"><option value="">All categories</option><option value="Texts">Texts</option><option value="Portraits">Portraits</option><option value="Military symbols">Military symbols</option><option value="Other">Other</option></select>
          <select id="sl-tloc" style="font-size:10px;padding:4px 6px;background:var(--sur2);border:1px solid var(--bdr);color:var(--tx2)"><option value="">All body locations</option><option value="Head">Head</option><option value="Upper body">Upper body</option><option value="Lower body">Lower body</option><option value="Upper extremity">Upper extremity</option><option value="Lower extremity">Lower extremity</option></select>
          <input id="sl-tsearch" placeholder="Search description..." style="font-size:10px;padding:4px 6px;background:var(--sur2);border:1px solid var(--bdr);color:var(--tx);flex:1;min-width:80px">
          <button class="tbtn" id="sl-tbrowse">Search</button>
        </div>
        <div id="sl-tbresults" style="padding:10px 13px;font-size:11px;color:var(--tx3)">Registry contains records. Upload a photo to search by visual similarity.</div>
      </div>

      <div style="font-size:10px;color:var(--tx3);line-height:1.5;padding:7px 0">Privacy notice: All submissions are voluntary. Images are not stored after analysis. The registry contains only consented records. For emergency identification purposes only. Not for surveillance. Compliant with GDPR Article 9 -- explicit consent required. Emergency vital interests exception: Article 9(2)(c).</div>
    </div>

    <div class="pg" id="pg-ab">
      <div class="bx"><div style="padding:14px">
      <div class="ab2">
        <h3>ScanLab v2</h3>
        <p>Multi-model medical imaging AI research platform by <strong style="color:var(--tx)">Oleh Ivchenko</strong>, PhD Candidate, ONPU. Part of the <a href="/category/medical-ml-diagnosis/">Medical ML Diagnosis</a> research series.</p>
        <h3>How it works</h3>
        <p>Upload a scan → select one or more AI models → all run in parallel → results are overlaid as independent Grad-CAM heatmap layers. Adjust opacity per layer to visually compare model focus areas.</p>
        <h3>Available Models</h3>
        <ul><li><strong>ResNet-18 Pneumonia</strong> — Chest X-ray binary, AUC 0.961</li><li><strong>ResNet-18 COVID-19</strong> — Chest X-ray 3-class, AUC 0.944</li><li><strong>EfficientNet-B0 Multi-Label</strong> — 14 chest pathologies, mAUC 0.823</li><li><strong>ResNet-18 Brain Tumour</strong> — MRI binary, AUC 0.974</li><li><strong>ResNet-18 Skin Lesion</strong> — Dermoscopy binary, AUC 0.887</li></ul>
        <h3>Metric Glossary</h3>
        <dl class="gl">
          <div class="gt"><dt>AUC</dt><dd>Area Under ROC Curve. 1.0 = perfect separation of classes. 0.5 = random chance. Values above 0.85 are considered clinically useful for screening.</dd></div>
          <div class="gt"><dt>Sensitivity</dt><dd>True positive rate. Proportion of actual diseased cases the model correctly identifies. High sensitivity = fewer missed diagnoses.</dd></div>
          <div class="gt"><dt>Specificity</dt><dd>True negative rate. Proportion of healthy cases correctly identified. High specificity = fewer unnecessary follow-ups from false alarms.</dd></div>
          <div class="gt"><dt>Confidence</dt><dd>Softmax probability of the top predicted class. 92% means the model gives 92% of its probability mass to that class. Not equivalent to diagnostic accuracy.</dd></div>
          <div class="gt"><dt>Uncertainty</dt><dd>Estimated via Monte Carlo Dropout — standard deviation across 20 stochastic forward passes. High uncertainty means the model is less consistent and the result should be treated with more caution.</dd></div>
          <div class="gt"><dt>Grad-CAM</dt><dd>Gradient-weighted Class Activation Mapping. Backpropagates the class score gradient through the final convolutional layer to produce a spatial heatmap of influential regions.</dd></div>
          <div class="gt"><dt>ICD-10</dt><dd>International Classification of Diseases, 10th revision. Standard diagnostic codes used globally in healthcare records.</dd></div>
        </dl>
        <div class="disc">⚠️ Research tool only. Not validated for clinical use. Do not make diagnostic or treatment decisions without qualified medical professional review.</div>
      </div></div></div>
    </div>

  </div>
</div>
`;

// ── Nav ───────────────────────────────────────────────────────
function goTab(t){
  ROOT.querySelectorAll('.sni,.sti').forEach(x=>x.classList.toggle('on',x.dataset.t===t));
  ROOT.querySelectorAll('.pg').forEach(x=>x.classList.toggle('on',x.id==='pg-'+t));
  if(t==='md')renderCat();
  if(t==='an')loadAn();
}
ROOT.querySelectorAll('.sni,.sti').forEach(n=>n.addEventListener('click',()=>goTab(n.dataset.t)));

// ── Load models ───────────────────────────────────────────────
async function init(){
  try{
    mdata=await fetch(API+'/models').then(r=>r.json());
    renderHier();
  }catch(e){
    ROOT.querySelector('#sl-hier').innerHTML=`<div style="padding:14px;font-size:12px;color:var(--rd)">API unavailable: ${e.message}</div>`;
  }
}

// ── Hierarchy ─────────────────────────────────────────────────
function renderHier(){
  const root=ROOT.querySelector('#sl-hier');root.innerHTML='';
  GROUPS.forEach(g=>{
    const keys=g.models.filter(k=>mdata[k]);if(!keys.length)return;
    const nsel=keys.filter(k=>sel.has(k)).length;
    const grp=document.createElement('div');grp.className='grp';

    const hd=document.createElement('div');
    hd.className='grp-hd'+(nsel?' op':'');
    hd.innerHTML=`<span class="grp-ic">${g.icon}</span>
      <div><div class="grp-lbl">${g.label}</div><div class="grp-sub">${g.sub}</div></div>
      <div class="grp-r">
        <span class="grp-cnt${nsel?' sel':''}" id="gc-${g.id}">${nsel?nsel+' selected':keys.length+' model'+(keys.length>1?'s':'')}</span>
        <span class="grp-chv">▶</span>
      </div>`;

    const bd=document.createElement('div');
    bd.className='grp-bd'+(nsel?' op':'');
    bd.id='gb-'+g.id;

    // select-all row
    const sar=document.createElement('div');sar.className='sa-row';
    sar.innerHTML='<span>☐</span><span>Select all</span>';
    sar.addEventListener('click',e=>{e.stopPropagation();toggleAll(g.id,keys);});
    bd.appendChild(sar);

    keys.forEach(k=>{
      const m=mdata[k],di=DI[k]||{};
      const auc=((m.metrics.auc||m.metrics.mean_auc||0)*100).toFixed(0);
      const diseases=m.classes.filter(c=>!['Normal','No Tumor','Benign','Negative'].includes(c));
      const row=document.createElement('div');
      row.className='dr'+(sel.has(k)?' on':'');row.id='dr-'+k;
      row.innerHTML=`<div class="dck">${sel.has(k)?'✓':''}</div>
        <div class="di">
          <div class="dn">${di.name||diseases.join(' / ')||m.name}</div>
          <div class="dcl">${m.classes.join(' · ')}</div>
          ${di.desc?`<div class="dd">${di.desc}</div>`:''}
        </div>
        <div class="dm"><div class="dauc">${auc}%</div><div class="dbb">${m.backbone}</div></div>`;
      row.addEventListener('click',()=>toggleMdl(k,g.id,keys));
      bd.appendChild(row);
    });

    hd.addEventListener('click',()=>{hd.classList.toggle('op');bd.classList.toggle('op');});
    grp.appendChild(hd);grp.appendChild(bd);root.appendChild(grp);
  });
}

function toggleMdl(k,gid,gkeys){
  sel.has(k)?sel.delete(k):sel.add(k);
  const row=ROOT.querySelector('#dr-'+k),s=sel.has(k);
  if(row){row.classList.toggle('on',s);row.querySelector('.dck').textContent=s?'✓':'';}
  updateGrpCnt(gid,gkeys);updateCnt();updateRun();renderPsum();
}
function toggleAll(gid,keys){
  const all=keys.every(k=>sel.has(k));
  keys.forEach(k=>{
    if(all)sel.delete(k);else sel.add(k);
    const row=ROOT.querySelector('#dr-'+k),s=sel.has(k);
    if(row){row.classList.toggle('on',s);row.querySelector('.dck').textContent=s?'✓':'';}
  });
  updateGrpCnt(gid,keys);updateCnt();updateRun();renderPsum();
}
function updateGrpCnt(gid,keys){
  const el=ROOT.querySelector('#gc-'+gid);if(!el)return;
  const n=keys.filter(k=>sel.has(k)).length;
  el.textContent=n?n+' selected':keys.length+' model'+(keys.length>1?'s':'');
  el.classList.toggle('sel',n>0);
}
function renderPsum(){
  const el=ROOT.querySelector('#sl-psum');if(!el)return;
  if(!sel.size){el.innerHTML='<span class="nsel">No findings selected — expand a group above</span>';return;}
  el.innerHTML=[...sel].map(k=>{
    const label=DI[k]?.name||mdata[k]?.name||k;
    return `<span class="pill"><span>${label}</span><span class="pill-x" data-k="${k}">×</span></span>`;
  }).join('');
  el.querySelectorAll('.pill-x').forEach(x=>x.addEventListener('click',e=>{e.stopPropagation();removeMdl(x.dataset.k);}));
}
function removeMdl(k){
  sel.delete(k);
  const row=ROOT.querySelector('#dr-'+k);
  if(row){row.classList.remove('on');row.querySelector('.dck').textContent='';}
  GROUPS.forEach(g=>{if(g.models.includes(k))updateGrpCnt(g.id,g.models);});
  updateCnt();updateRun();renderPsum();
}
function updateCnt(){const n=sel.size;ROOT.querySelector('#sl-cnt').textContent=n===0?'None':n+' selected';}
function updateRun(){ROOT.querySelector('#sl-run').disabled=!(sel.size>0&&file);}

// ── File ──────────────────────────────────────────────────────
const dz=ROOT.querySelector('#sl-dz');
dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('ov');});
dz.addEventListener('dragleave',()=>dz.classList.remove('ov'));
dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('ov');if(e.dataTransfer.files[0])setFile(e.dataTransfer.files[0]);});
ROOT.querySelector('#sl-fi').addEventListener('change',e=>{if(e.target.files[0])setFile(e.target.files[0]);});
function setFile(f){file=f;const img=ROOT.querySelector('#sl-prev');img.src=URL.createObjectURL(f);img.style.display='block';updateRun();}

// ── Run ───────────────────────────────────────────────────────
ROOT.querySelector('#sl-run').addEventListener('click',runAnalysis);
async function runAnalysis(){
  if(!file||!sel.size)return;
  ROOT.querySelector('#sl-run').disabled=true;
  ROOT.querySelector('#sl-res').style.display='none';
  ROOT.querySelector('#sl-ld').classList.add('on');
  res={};layers={};origImg=null;
  const models=[...sel];
  for(let i=0;i<models.length;i++){
    const k=models[i];
    ROOT.querySelector('#sl-ldm').textContent=`${DI[k]?.name||mdata[k]?.name||k} (${i+1}/${models.length})`;
    try{
      const fd=new FormData();fd.append('file',file);fd.append('model_name',k);
      const r=await fetch(API+'/predict',{method:'POST',body:fd});
      res[k]=r.ok?await r.json():{error:await r.text()};
    }catch(e){res[k]={error:e.message};}
  }
  ROOT.querySelector('#sl-ld').classList.remove('on');
  ROOT.querySelector('#sl-run').disabled=false;
  await showResults();
}

async function showResults(){
  const el=ROOT.querySelector('#sl-res');el.style.display='flex';
  const keys=Object.keys(res),first=res[keys[0]];
  const pos=first&&!first.error&&isPos(first.prediction);
  const vd=ROOT.querySelector('#sl-vd');vd.className='vd '+(pos?'pos':'neg');
  ROOT.querySelector('#sl-vic').textContent=pos?'⚠️':'✅';
  const vpr=ROOT.querySelector('#sl-vpr');vpr.textContent=first?.prediction||'Analysis complete';vpr.style.color=pos?'var(--rd)':'var(--gn)';
  ROOT.querySelector('#sl-vsb').textContent=keys.length>1?`${keys.length} models — see activation layers below`:`Confidence: ${first&&!first.error?Math.round(first.confidence*100)+'%':'—'}`;
  const good=keys.filter(k=>!res[k].error);
  await buildLayers(good);renderLayers(good);drawCanvas();
  renderRTabs(keys);actMk=keys[0];renderDetail(keys[0]);
}

async function buildLayers(list){
  for(let i=0;i<list.length;i++){
    const k=list[i],r=res[k];
    const img=new Image();
    await new Promise(rv=>{img.onload=rv;img.onerror=rv;img.src='data:image/png;base64,'+(r.heatmap_b64||r.gradcam_b64);});
    if(i===0&&r.original_b64){origImg=new Image();await new Promise(rv=>{origImg.onload=rv;origImg.src='data:image/jpeg;base64,'+r.original_b64;});}
    layers[k]={op:Math.round((r.confidence||0)*80),vis:true,color:TINTS[i%TINTS.length],img};
  }
  if(!origImg&&file){origImg=new Image();await new Promise(rv=>{origImg.onload=rv;origImg.src=URL.createObjectURL(file);});}
}

function renderLayers(list){
  const c=ROOT.querySelector('#sl-lyrs');c.innerHTML='';
  list.forEach(k=>{
    const r=res[k],l=layers[k],[rv,g,b]=l.color,conf=Math.round((r.confidence||0)*100);
    const row=document.createElement('div');row.className='lr';
    row.innerHTML=`<div class="sw" style="background:rgb(${rv},${g},${b})"></div>
      <div class="li">
        <div class="ln">${DI[k]?.name||mdata[k]?.name||k}</div>
        <div class="lp">${r.prediction||'—'} · ${conf}% confidence</div>
        <div class="sr"><input type="range" class="sl" id="lsl-${k}" min="0" max="100" value="${l.op}" style="--p:${l.op}%"><span class="sp2" id="lpc-${k}">${l.op}%</span></div>
      </div>
      <span class="vs" id="lv-${k}">👁</span>`;
    row.querySelector('.sl').addEventListener('input',function(){setOp(k,this.value);});
    row.querySelector('.vs').addEventListener('click',()=>toggleVis(k));
    c.appendChild(row);
  });
}
function setOp(k,v){layers[k].op=parseInt(v);ROOT.querySelector(`#lpc-${k}`).textContent=v+'%';ROOT.querySelector(`#lsl-${k}`).style.setProperty('--p',v+'%');drawCanvas();}
function toggleVis(k){layers[k].vis=!layers[k].vis;ROOT.querySelector(`#lv-${k}`).classList.toggle('off',!layers[k].vis);drawCanvas();}
function resetOp(){Object.keys(layers).forEach(k=>{const op=Math.round((res[k]?.confidence||0)*80);layers[k].op=op;const s=ROOT.querySelector(`#lsl-${k}`);if(s){s.value=op;s.style.setProperty('--p',op+'%');}const p=ROOT.querySelector(`#lpc-${k}`);if(p)p.textContent=op+'%';});drawCanvas();}

ROOT.querySelector('#sl-rst1').addEventListener('click',resetOp);
ROOT.querySelector('#sl-rst2').addEventListener('click',resetOp);

function drawCanvas(){
  const cv=ROOT.querySelector('#sl-cv'),ctx=cv.getContext('2d'),W=400,H=400;
  cv.width=W;cv.height=H;
  if(origImg&&origImg.complete&&origImg.naturalWidth){ctx.filter='grayscale(1) brightness(.85)';ctx.drawImage(origImg,0,0,W,H);ctx.filter='none';}
  else{ctx.fillStyle='#111';ctx.fillRect(0,0,W,H);}
  Object.entries(layers).forEach(([k,l])=>{
    if(!l.vis||l.op===0||!l.img.complete||!l.img.naturalWidth)return;
    const [rv,g,b]=l.color,off=document.createElement('canvas');off.width=W;off.height=H;
    const oc=off.getContext('2d');oc.drawImage(l.img,0,0,W,H);
    oc.globalCompositeOperation='multiply';oc.fillStyle=`rgb(${rv},${g},${b})`;oc.fillRect(0,0,W,H);
    ctx.globalAlpha=l.op/100;ctx.globalCompositeOperation='screen';ctx.drawImage(off,0,0);
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  });
}

function renderRTabs(keys){
  const bar=ROOT.querySelector('#sl-rtabs');bar.innerHTML='';
  keys.forEach((k,i)=>{
    const r=res[k],t=document.createElement('div');t.className='rt'+(i===0?' on':'');
    t.innerHTML=`<span class="rt-mdl">${DI[k]?.name||mdata[k]?.name||k}</span><span class="rt-pr">${r?.prediction||'Error'}</span>`;
    t.addEventListener('click',()=>{ROOT.querySelectorAll('.rt').forEach(x=>x.classList.remove('on'));t.classList.add('on');actMk=k;renderDetail(k);});
    bar.appendChild(t);
  });
}

function renderDetail(k){
  const r=res[k],c=ROOT.querySelector('#sl-det');
  if(!r||r.error){c.innerHTML=`<div style="padding:18px;font-size:12px;color:var(--tx3)">${r?.error||'No result'}</div>`;return;}
  const conf=Math.round(r.confidence*100),unc=(r.uncertainty*100).toFixed(1),mc=r.mc_samples||20;
  const pos=isPos(r.prediction),col=pos?'var(--rd)':'var(--gn)';
  c.innerHTML=`<div class="det">
    <div class="cr">
      ${ring(conf,pos)}
      <div class="cm">
        <div class="cp" style="color:${col}">${r.prediction}</div>
        ${r.icd10_code?`<div class="icd">${r.icd10_code}${r.icd10_desc?' — '+r.icd10_desc:''}</div>`:''}
        <div class="cx">
          <strong>Confidence ${conf}%</strong> — softmax probability for this class.<br>
          <strong>Uncertainty ±${unc}%</strong> — std dev over ${mc} Monte Carlo dropout passes. Lower = more consistent prediction.
        </div>
      </div>
    </div>
    <div class="tr">
      <span class="tm"><strong>${conf}%</strong> <span>confidence</span></span>
      <span class="tm"><strong>±${unc}%</strong> <span>uncertainty (MC×${mc})</span></span>
      ${r.icd10_code?`<span class="tm"><strong>${r.icd10_code}</strong> <span>ICD-10</span></span>`:''}
      ${mdata[k]?.backbone?`<span class="tm"><strong>${mdata[k].backbone}</strong> <span>backbone</span></span>`:''}
      <span class="tm"><strong>${mdata[k]?.task?.replace('_',' ')||'—'}</strong> <span>task type</span></span>
    </div>
    <div class="cl">${clinical(r)}</div>
    ${r.top_features?.length?`<div class="fr"><span class="fl">Key features:</span>${r.top_features.map(f=>`<span class="fc">${f}</span>`).join('')}</div>`:''}
    <div class="ps">
      <div class="pt">Class Probability Distribution</div>
      <div class="pe">Softmax output across all classes — bars sum to 100%. The tallest bar is the predicted class. For multi-label models, each bar is an independent sigmoid probability (bars may not sum to 100%).</div>
      <canvas id="pc-${k}" height="90"></canvas>
    </div>
  </div>`;
  if(r.probabilities){
    loadChart(()=>{
      if(probCh){try{probCh.destroy();}catch(e){}}
      const el=ROOT.querySelector(`#pc-${k}`);if(!el)return;
      const labels=Object.keys(r.probabilities),vals=Object.values(r.probabilities).map(v=>+(v*100).toFixed(1));
      probCh=new Chart(el,{type:'bar',data:{labels,datasets:[{data:vals,borderWidth:0,backgroundColor:vals.map(v=>v>50?'rgba(84,87,205,.85)':v>20?'rgba(84,87,205,.4)':'rgba(84,87,205,.18)')}]},options:{indexAxis:'y',responsive:true,plugins:{legend:{display:false}},scales:{x:{max:100,grid:{color:'rgba(128,128,128,.07)'},ticks:{color:'#888',callback:v=>v+'%'}},y:{grid:{display:false},ticks:{color:'#666',font:{family:'Inter',size:11}}}}}});
    });
  }
}

function ring(pct,pos){
  const r=34,cx=44,cy=44,c=2*Math.PI*r,dash=c*pct/100,col=pos?'var(--rd)':'var(--gn)';
  return `<svg width="88" height="88" viewBox="0 0 88 88" style="flex-shrink:0">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(128,128,128,.1)" stroke-width="5"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="5" stroke-dasharray="${dash} ${c-dash}" stroke-dashoffset="${c*.25}" stroke-linecap="butt"/>
    <text x="${cx}" y="${cy+1}" text-anchor="middle" dominant-baseline="middle" fill="${col}" font-size="14" font-weight="700" font-family="JetBrains Mono,monospace">${pct}%</text>
  </svg>`;
}
function isPos(p){return p&&!['Normal','No Tumor','Benign','Negative'].some(n=>p.includes(n));}
function clinical(r){
  const conf=Math.round(r.confidence*100),unc=(r.uncertainty*100).toFixed(1);
  return isPos(r.prediction)
    ?`Imaging features are consistent with <strong>${r.prediction}</strong> at <strong>${conf}%</strong> confidence (epistemic uncertainty ±${unc}%). The Grad-CAM overlay highlights image regions that most influenced this classification. <em>Specialist review and clinical correlation required before any diagnostic conclusions.</em>`
    :`No significant pathological features detected in the screened categories. Classification: <strong>${r.prediction}</strong> at <strong>${conf}%</strong> confidence (±${unc}%). A negative result does not exclude all pathology — additional views or specialist review may be indicated.`;
}

// ── Reset ─────────────────────────────────────────────────────
ROOT.querySelector('#sl-newbtn').addEventListener('click',()=>{
  file=null;res={};layers={};origImg=null;
  ROOT.querySelector('#sl-prev').style.display='none';
  ROOT.querySelector('#sl-fi').value='';
  ROOT.querySelector('#sl-res').style.display='none';
  ROOT.querySelector('#sl-run').disabled=true;
});

// ── Download report ───────────────────────────────────────────
function buildReportHTML(){
  const cv=ROOT.querySelector('#sl-cv');
  const cvImg=cv?cv.toDataURL('image/jpeg',.9):'';
  const ts=new Date().toLocaleString();
  const rows=Object.entries(res).map(([k,r])=>{
    if(r.error)return`<tr><td>${DI[k]?.name||k}</td><td colspan="4" style="color:#991b1b">${r.error}</td></tr>`;
    const col=isPos(r.prediction)?'#991b1b':'#166534';
    return`<tr><td>${DI[k]?.name||k}</td><td style="font-weight:700;color:${col}">${r.prediction}</td><td style="font-family:monospace">${Math.round(r.confidence*100)}%</td><td style="font-family:monospace">±${(r.uncertainty*100).toFixed(1)}%</td><td style="font-family:monospace">${r.icd10_code||'—'}</td></tr>`;
  }).join('');
  const probs=Object.entries(res).filter(([,r])=>!r.error&&r.probabilities).map(([k,r])=>{
    const bars=Object.entries(r.probabilities).map(([cls,p])=>{
      const pct=Math.round(p*100);
      return`<div style="display:flex;align-items:center;gap:8px;margin:3px 0"><div style="width:130px;font-size:11px;color:#3d3d47;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${cls}</div><div style="flex:1;background:#e2e2e5;height:11px"><div style="width:${pct}%;height:100%;background:${pct>50?'#5457cd':pct>20?'#8486e0':'#c5c6f0'}"></div></div><div style="width:32px;font-size:11px;font-family:monospace;text-align:right">${pct}%</div></div>`;
    }).join('');
    return`<h3 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#3d3d47;border-bottom:1px solid #d5d5d9;padding-bottom:4px;margin:16px 0 7px">${DI[k]?.name||k}</h3>${bars}`;
  }).join('');
  return`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ScanLab Report</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
<style>body{font-family:'Inter',sans-serif;padding:40px;max-width:780px;margin:0 auto;color:#0a0a0e;font-size:13px;line-height:1.6}h1{font-size:18px;font-weight:700;margin:0 0 4px}h2{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:#3d3d47;border-bottom:2px solid #d5d5d9;padding-bottom:4px;margin:20px 0 9px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#efefef;color:#3d3d47;padding:7px 9px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;border:1px solid #d5d5d9}td{padding:7px 9px;border:1px solid #d5d5d9}.hdr{display:flex;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:3px solid #5457cd}.meta{font-size:11px;color:#6b6b7a;margin-top:4px}.disc{background:#fef2f2;border-left:3px solid #991b1b;padding:9px 11px;font-size:11px;color:#6b6b7a;margin-top:18px;line-height:1.6}.img-w{margin:12px 0;text-align:center}.img-w img{max-width:100%;max-height:360px;border:1px solid #d5d5d9}tr:nth-child(even) td{background:#fafafa}@media print{body{padding:20px}}</style>
</head><body>
<div class="hdr"><div><h1>🩻 ScanLab v2 — Imaging Analysis Report</h1><div class="meta">Generated: ${ts} · hub.stabilarity.com/scanlab/ · Research use only</div></div></div>
<h2>Results — All Models</h2>
<table><thead><tr><th>Model / Finding</th><th>Prediction</th><th>Confidence</th><th>Uncertainty</th><th>ICD-10</th></tr></thead><tbody>${rows}</tbody></table>
${cvImg?`<h2>Composite Grad-CAM Activation Map</h2><div class="img-w"><img src="${cvImg}" alt="Grad-CAM"><p style="font-size:10px;color:#6b6b7a;text-align:center;margin-top:5px">Composite heatmap — each model layer composited with screen blend. Warmer = higher activation.</p></div>`:''}
${probs?`<h2>Class Probability Distributions</h2>${probs}`:''}
<h2>Metric Definitions</h2>
<table><tr><td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#5457cd;width:110px">Confidence</td><td>Softmax probability of the predicted class. Indicates model certainty, not diagnostic certainty.</td></tr><tr><td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#5457cd">Uncertainty</td><td>Estimated via Monte Carlo Dropout — std dev across 20 stochastic forward passes. Higher = less consistent.</td></tr><tr><td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#5457cd">Grad-CAM</td><td>Gradient-weighted Class Activation Mapping — highlights image regions most relevant to the model decision.</td></tr><tr><td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#5457cd">ICD-10</td><td>International Classification of Diseases 10th revision diagnostic code.</td></tr></table>
<div class="disc">⚠️ <strong>Research Tool — Not for Clinical Use.</strong> Results must not be used to make diagnostic or treatment decisions without review by a qualified medical professional.</div>
</body></html>`;
}

ROOT.querySelector('#sl-dlbtn').addEventListener('click',()=>{
  if(!Object.keys(res).length)return;
  const blob=new Blob([buildReportHTML()],{type:'text/html'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`scanlab-report-${Date.now()}.html`;a.click();
});
ROOT.querySelector('#sl-prbtn').addEventListener('click',()=>{
  if(!Object.keys(res).length)return;
  const w=window.open('','_blank');w.document.write(buildReportHTML());w.document.close();setTimeout(()=>w.print(),700);
});

// ── Catalogue ─────────────────────────────────────────────────
function renderCat(){
  const g=ROOT.querySelector('#sl-cat');g.innerHTML='';
  Object.entries(mdata).forEach(([k,m])=>{
    const di=DI[k]||{},d=document.createElement('div');d.className='mc';
    const metrics=Object.entries(m.metrics).filter(([key])=>['auc','mean_auc','sensitivity','specificity','f1','accuracy'].includes(key));
    d.innerHTML=`<div class="mc-hd">
      <div><div class="mc-nm">${m.name}</div><div class="mc-vr">v${m.version} · ${m.backbone} · ${m.task.replace(/_/g,' ')}</div></div>
      <button class="use-btn" data-k="${k}">Use →</button>
    </div>
    <div class="mc-bd">
      <div class="mc-dc">${m.description}</div>
      ${di.desc?`<div class="mc-ex">${di.desc}</div>`:''}
      <div class="mets">
        ${metrics.map(([key,val])=>`<div class="met"><div class="met-v">${(val*100).toFixed(1)}%</div><div class="met-n">${key==='mean_auc'?'mAUC':key.toUpperCase()}</div><div class="met-tip">${MTIPS[key]||key}</div></div>`).join('')}
      </div>
      <div style="font-size:9px;color:var(--tx3);margin-bottom:8px">Hover a metric for its definition · Validation-set results</div>
      <div class="mc-cls"><strong style="color:var(--tx2)">Classes:</strong> ${m.classes.join(' · ')}</div>
    </div>`;
    d.querySelector('.use-btn').addEventListener('click',()=>activate(k));
    g.appendChild(d);
  });
}
function activate(k){sel.clear();sel.add(k);renderHier();updateCnt();renderPsum();goTab('dx');}

// ── Batch ─────────────────────────────────────────────────────
ROOT.querySelector('#sl-bz').addEventListener('click',()=>ROOT.querySelector('#sl-bfi').click());
ROOT.querySelector('#sl-bfi').addEventListener('change',e=>{if(e.target.files.length)runBatch(e.target.files);});
async function runBatch(files){
  const k=[...sel][0]||Object.keys(mdata)[0];if(!k)return;
  const fd=new FormData();for(const f of files)fd.append('files',f);fd.append('model_name',k);
  ROOT.querySelector('#sl-bprog').style.display='block';ROOT.querySelector('#sl-bres').style.display='none';ROOT.querySelector('#sl-bf').style.width='0%';
  try{const d=await fetch(API+'/predict/batch',{method:'POST',body:fd}).then(r=>r.json());pollBatch(d.job_id);}catch(e){alert(e.message);}
}
function pollBatch(id){const iv=setInterval(async()=>{try{const d=await fetch(API+'/batch/'+id).then(r=>r.json());ROOT.querySelector('#sl-bf').style.width=Math.round(d.done/d.total*100)+'%';ROOT.querySelector('#sl-bst').textContent=`${d.done}/${d.total} processed`;if(d.status==='complete'){clearInterval(iv);showBatch(d.results);}}catch(e){clearInterval(iv);}},2000);}
function showBatch(r){bdata=r;ROOT.querySelector('#sl-bres').style.display='block';ROOT.querySelector('#sl-btb').innerHTML=r.map(x=>`<tr><td>${x.filename||'—'}</td><td style="color:${isPos(x.prediction)?'var(--rd)':'var(--gn)'};font-weight:600">${x.prediction||x.error||'—'}</td><td style="font-family:var(--m)">${x.confidence?(x.confidence*100).toFixed(1)+'%':'—'}</td><td style="font-family:var(--m);font-size:10px">${x.icd10_code||'—'}</td></tr>`).join('');}
ROOT.querySelector('#sl-expbtn').addEventListener('click',()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['Filename,Prediction,Confidence,ICD-10\n'+bdata.map(r=>`"${r.filename}","${r.prediction}",${r.confidence},"${r.icd10_code||''}"`).join('\n')],{type:'text/csv'}));a.download='scanlab-batch.csv';a.click();});

// ── Analytics ─────────────────────────────────────────────────
async function loadAn(){
  loadChart(async()=>{
    try{
      const d=await fetch(API+'/analytics').then(r=>r.json());
      ROOT.querySelector('#sl-sts').innerHTML=`<div class="st"><div class="st-n">${d.total_predictions||0}</div><div class="st-l">Total Scans</div></div><div class="st"><div class="st-n">${d.estimated_hours_saved||0}h</div><div class="st-l">Hours Saved</div></div><div class="st"><div class="st-n">${Object.keys(d.by_model||{}).length}</div><div class="st-l">Models Active</div></div>`;
      const mk=Object.keys(d.by_model||{});
      const ac=['rgba(84,87,205,.8)','rgba(6,182,212,.8)','rgba(34,197,94,.8)','rgba(245,158,11,.8)','rgba(236,72,153,.8)'];
      if(chMdl){try{chMdl.destroy();}catch(e){}}
      chMdl=new Chart(ROOT.querySelector('#sl-chm'),{type:'doughnut',data:{labels:mk.map(k=>DI[k]?.name||k),datasets:[{data:mk.map(m=>d.by_model[m].count),backgroundColor:ac,borderWidth:0}]},options:{plugins:{legend:{labels:{color:'#888',font:{family:'Inter',size:11}}}}}});
      if(chTime){try{chTime.destroy();}catch(e){}}
      chTime=new Chart(ROOT.querySelector('#sl-cht'),{type:'bar',data:{labels:mk.map(k=>DI[k]?.name||k),datasets:[{data:mk.map(m=>d.by_model[m].avg_processing_ms),backgroundColor:ac,borderWidth:0}]},options:{plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(128,128,128,.07)'},ticks:{color:'#888'}},x:{grid:{display:false},ticks:{color:'#888',maxRotation:15,font:{size:10}}}}}});
    }catch(e){console.error(e);}
  });
}


// ── Sample Images ─────────────────────────────────────────────
let sampleData={};
async function loadSamples(){
  try{sampleData=await fetch(API+'/samples').then(r=>r.json());}catch(e){}
}
function updateSampleBtns(){
  const card=ROOT.querySelector('#sl-scard'),c=ROOT.querySelector('#sl-sbtns');
  if(!card)return;
  if(!sel.size){card.style.display='none';return;}
  card.style.display='block';c.innerHTML='';
  [...sel].forEach(mk=>{
    (sampleData[mk]||[]).forEach(s=>{
      const b=document.createElement('button');b.className='tbtn';b.textContent=s.label;
      b.addEventListener('click',()=>loadSampleUrl(s.url));
      c.appendChild(b);
    });
  });
  if(!c.children.length)card.style.display='none';
}
async function loadSampleUrl(url){
  try{const r=await fetch(url);const b=await r.blob();const f=new File([b],'sample.jpg',{type:b.type||'image/jpeg'});setFile(f);}catch(e){alert('Failed: '+e.message);}
}
const _origUpdateRun=updateRun;
updateRun=function(){_origUpdateRun();updateSampleBtns();};

// ── Tattoo Tab Logic ──────────────────────────────────────────
let tfile=null;
const tdz2=ROOT.querySelector('#sl-tdz');
if(tdz2){
  tdz2.addEventListener('dragover',e=>{e.preventDefault();tdz2.classList.add('ov');});
  tdz2.addEventListener('dragleave',()=>tdz2.classList.remove('ov'));
  tdz2.addEventListener('drop',e=>{e.preventDefault();tdz2.classList.remove('ov');if(e.dataTransfer.files[0])setTFile(e.dataTransfer.files[0]);});
  ROOT.querySelector('#sl-tfi').addEventListener('change',e=>{if(e.target.files[0])setTFile(e.target.files[0]);});
}
function setTFile(f){tfile=f;const img=ROOT.querySelector('#sl-tprev');img.src=URL.createObjectURL(f);img.style.display='block';ROOT.querySelector('#sl-timgstats').style.display='block';ROOT.querySelector('#sl-toverstats').innerHTML='';ROOT.querySelector('#sl-trun').disabled=false;}
ROOT.querySelector('#sl-trun')?.addEventListener('click',async()=>{
  if(!tfile)return;
  ROOT.querySelector('#sl-trun').disabled=true;
  ROOT.querySelector('#sl-tld').classList.add('on');
  ROOT.querySelector('#sl-tres').style.display='none';
  try{
    const fd=new FormData();fd.append('file',tfile);
    const r=await fetch(API+'/tattoo/analyze',{method:'POST',body:fd}).then(r=>r.json());
    showTRes(r);
  }catch(e){alert(e.message);}
  ROOT.querySelector('#sl-tld').classList.remove('on');
  ROOT.querySelector('#sl-trun').disabled=false;
});
let _slTRes=null;
function showTRes(r){
  _slTRes=r;
  const threshold=parseFloat(ROOT.querySelector('#sl-tthresh').value)||0.55;
  ROOT.querySelector('#sl-tres').style.display='block';
  ROOT.querySelector('#sl-treportwrap').style.display='block';

  // Col 1: overlay stats
  const imgS=ROOT.querySelector('#sl-timgstats');imgS.style.display='block';
  const style=(r.features.estimated_style||r.features.style||'unknown');
  const edgePct=(r.features.edge_density*100).toFixed(1);
  const texture=r.features.texture_complexity;
  ROOT.querySelector('#sl-toverstats').innerHTML=
    '<span class="sl-tbadge">'+style+'</span>'+
    '<div style="margin-top:4px;font-size:10px"><strong>Edge:</strong><div style="background:var(--bg0);border:1px solid var(--bdr);height:10px;margin-top:2px"><div style="background:var(--tx);height:100%;width:'+edgePct+'%"></div></div>'+edgePct+'%</div>'+
    '<div style="margin-top:3px;font-size:10px"><strong>Texture:</strong><div style="background:var(--bg0);border:1px solid var(--bdr);height:10px;margin-top:2px"><div style="background:var(--tx);height:100%;width:'+Math.min(texture,100)+'%"></div></div>'+texture+'</div>';

  // Col 2: features
  const fb=ROOT.querySelector('#sl-tfeat');
  const swatches=r.hex_colors.map(c=>'<div style="text-align:center"><div class="sl-tswatch" style="background:'+c+'"></div><div style="font-size:8px;font-family:var(--m);margin-top:1px">'+c+'</div></div>').join('');
  const region=(r.features.estimated_body_region||r.features.body_region_estimate||'Unknown');
  const colorDiv=r.features.color_diversity!=null?(r.features.color_diversity*100).toFixed(0)+'%':'N/A';
  let confidence='Low confidence';
  if(r.features.edge_density>0.3&&r.features.texture_complexity>30) confidence='High confidence';
  else if(r.features.edge_density>0.15) confidence='Medium confidence';

  fb.innerHTML=
    '<div style="margin-bottom:8px"><strong style="font-size:11px">Color Palette</strong><div style="display:flex;gap:6px;margin-top:4px">'+swatches+'</div></div>'+
    '<strong style="font-size:11px">Style Analysis</strong>'+
    '<table class="sl-ttable" style="margin-top:4px"><tr><th>Property</th><th>Value</th></tr>'+
    '<tr><td>Style</td><td>'+style+'</td></tr>'+
    '<tr><td>Edge Density</td><td>'+edgePct+'%</td></tr>'+
    '<tr><td>Texture</td><td>'+texture+'</td></tr>'+
    '<tr><td>Color Diversity</td><td>'+colorDiv+'</td></tr>'+
    '<tr><td>Est. Region</td><td>'+region+'</td></tr></table>'+
    '<div style="margin-top:8px"><strong style="font-size:11px">Fingerprint</strong><div style="margin-top:3px"><span class="sl-tfp">'+r.fingerprint.substring(0,16)+'</span> <button class="tbtn" style="font-size:9px;padding:2px 6px" onclick="navigator.clipboard.writeText(\''+r.fingerprint+'\')">Copy</button></div></div>'+
    '<div class="sl-tconf">'+confidence+'</div>';

  // Col 3: matches
  const mb=ROOT.querySelector('#sl-tmatches');
  const filtered=(r.matches||[]).filter(m=>m.similarity>=threshold).sort((a,b)=>b.similarity-a.similarity);
  if(filtered.length){
    mb.innerHTML=filtered.map(m=>{
      const pct=Math.round(m.similarity*100);
      return '<div class="sl-tmcard">'+
        '<div style="display:flex;justify-content:space-between"><span class="sl-tbadge">SKETCH '+m.sketch_number+'</span><span style="font-size:13px;font-weight:700">'+pct+'%</span></div>'+
        '<div class="sl-tsimbar"><div class="sl-tsimfill" style="width:'+pct+'%"></div></div>'+
        '<div style="font-size:10px;line-height:1.6">'+
        '<div>Category: '+m.category+'</div><div>Body part: '+m.body_part+'</div><div>'+m.description+'</div>'+
        (m.linked_sketches&&m.linked_sketches.length?'<div>Linked: '+m.linked_sketches.join(', ')+'</div>':'')+
        '</div></div>';
    }).join('')+'<div style="font-size:10px;color:var(--tx3);margin-top:6px">Registry searched: '+r.registry_total+' records</div>';
  } else {
    mb.innerHTML='<div style="font-size:11px;color:var(--tx3)">No matches found. This person may not be in the voluntary registry.<div style="margin-top:4px">Registry searched: '+r.registry_total+' records</div></div>';
  }
}
ROOT.querySelector('#sl-tsample')?.addEventListener('click',async()=>{
  const s=(sampleData.tattoo||[])[0];if(!s)return;
  try{const r=await fetch(s.url);const b=await r.blob();setTFile(new File([b],'sample.jpg',{type:b.type||'image/jpeg'}));}catch(e){alert(e.message);}
});
ROOT.querySelector('#sl-tbrowse')?.addEventListener('click',async()=>{
  const cat=ROOT.querySelector('#sl-tcat').value;
  const loc=ROOT.querySelector('#sl-tloc').value;
  const search=ROOT.querySelector('#sl-tsearch').value;
  let url=API+'/tattoo/registry/browse?';
  if(cat)url+='category='+encodeURIComponent(cat)+'&';
  if(loc)url+='body_location='+encodeURIComponent(loc)+'&';
  if(search)url+='search='+encodeURIComponent(search)+'&';
  try{
    const d=await fetch(url).then(r=>r.json());
    const el=ROOT.querySelector('#sl-tbresults');
    if(!d.results.length){el.innerHTML='<div style="color:var(--tx3)">No records found.</div>';return;}
    el.innerHTML='<div style="font-size:10px;color:var(--tx3);margin-bottom:6px">'+d.total+' record(s)</div>'+
      d.results.map(r=>'<div class="sl-tregcard">'+
        '<div style="display:flex;justify-content:space-between"><span style="font-size:11px;font-weight:600;color:var(--tx)">'+r.sketch_number+'</span><span style="font-size:9px;color:var(--tx3)">'+r.date_added+'</span></div>'+
        '<div style="font-size:10px;color:var(--tx);margin-top:2px">'+r.category+(r.type?' / '+r.type:'')+'</div>'+
        '<div style="font-size:10px;color:var(--tx2);margin-top:1px">'+r.body_location+' | '+r.body_part+'</div>'+
        '<div style="font-size:10px;color:var(--tx3);margin-top:1px">'+r.description+'</div>'+
        (r.linked_sketches&&r.linked_sketches.length?'<div style="margin-top:3px"><span class="sl-tlinked">Linked</span> '+r.linked_sketches.join(', ')+'</div>':'')+
        '</div>').join('');
  }catch(e){ROOT.querySelector('#sl-tbresults').innerHTML='Error: '+e.message;}
});

ROOT.querySelector('#sl-treport')?.addEventListener('click',()=>{
  const r=_slTRes;if(!r)return;
  const threshold=parseFloat(ROOT.querySelector('#sl-tthresh').value)||0.55;
  const now=new Date();
  const ts=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0')+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  const style=(r.features.estimated_style||r.features.style||'unknown');
  const region=(r.features.estimated_body_region||r.features.body_region_estimate||'Unknown');
  const edgePct=(r.features.edge_density*100).toFixed(1);
  const colorDiv=r.features.color_diversity!=null?(r.features.color_diversity*100).toFixed(0)+'%':'N/A';
  const filtered=(r.matches||[]).filter(m=>m.similarity>=threshold).sort((a,b)=>b.similarity-a.similarity);
  let txt='STABILARITY SCANLAB -- TATTOO IDENTIFICATION REPORT\nGenerated: '+ts+'\nFingerprint: '+r.fingerprint+'\n\nFEATURES DETECTED:\n  Style: '+style+'\n  Edge Density: '+edgePct+'%\n  Texture: '+r.features.texture_complexity+'\n  Color Diversity: '+colorDiv+'\n  Est. Region: '+region+'\n  Colors: '+r.hex_colors.join(', ')+'\n\nREGISTRY SEARCH RESULTS:\n  Threshold: '+threshold+' | Records searched: '+r.registry_total+'\n';
  if(filtered.length){filtered.forEach(function(m,i){txt+='  Match '+(i+1)+': '+m.sketch_number+' ('+Math.round(m.similarity*100)+'% similarity)\n    Category: '+m.category+'\n    Body part: '+m.body_part+'\n    Description: '+m.description+'\n';if(m.linked_sketches&&m.linked_sketches.length)txt+='    Linked records: '+m.linked_sketches.join(', ')+'\n';});}else{txt+='  No matches above threshold.\n';}
  txt+='\nDISCLAIMER: Candidate matches only. Final identification requires human verification.\nContact: contact@stabilarity.com\n';
  const blob=new Blob([txt],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='scanlab-tattoo-report.txt';a.click();
});
loadSamples();
init();
})();
