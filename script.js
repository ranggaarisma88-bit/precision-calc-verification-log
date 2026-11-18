/* ==================== THEME SYSTEM ==================== */
function setTheme(themeName) {
    vibrate(15);
    try { localStorage.setItem('app_theme', themeName); } catch(e) {}
    document.documentElement.setAttribute('data-theme', themeName);

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const themeColors = {
        industrial: '#0d0d0d',
        oled: '#000000',
        light: '#f5f5f5',
        blue: '#0a0e1a'
    };
    if (metaTheme) metaTheme.content = themeColors[themeName] || '#0d0d0d';

    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
        const badge = btn.querySelector('.theme-badge');
        if (badge) badge.remove();
    });

    const activeBtn = document.querySelector(`[data-theme-btn="${themeName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        if (themeName === 'industrial') {
            activeBtn.innerHTML += '<span class="theme-badge">DEFAULT</span>';
        }
    }

    setTimeout(() => {
        const popup = document.getElementById('themePopup');
        if (popup) popup.classList.remove('show');
    }, 300);

    // Redraw chart so canvas picks up new theme colors immediately
    logDrawChart();
    showToast('Theme: ' + themeName);
}

function toggleThemeMenu() {
    vibrate(10);
    const popup = document.getElementById('themePopup');
    if (popup) popup.classList.toggle('show');
}

function loadTheme() {
    let saved = 'industrial';
    try { saved = localStorage.getItem('app_theme') || 'industrial'; } catch(e) {}
    document.documentElement.setAttribute('data-theme', saved);

    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
        const badge = btn.querySelector('.theme-badge');
        if (badge) badge.remove();
    });

    const activeBtn = document.querySelector(`[data-theme-btn="${saved}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        if (saved === 'industrial') {
            activeBtn.innerHTML += '<span class="theme-badge">DEFAULT</span>';
        }
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const themeColors = {
        industrial: '#0d0d0d',
        oled: '#000000',
        light: '#f5f5f5',
        blue: '#0a0e1a'
    };
    if (metaTheme) metaTheme.content = themeColors[saved] || '#0d0d0d';
}

function showToast(msg) {
    const existingToast = document.querySelector('.theme-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'theme-toast';
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--gold);
        color: #000;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: bold;
        z-index: 99999;
        animation: slideUp 0.3s ease;
        letter-spacing: 1px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    `;
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

/* ==================== VIBRATION ==================== */
function vibrate(ms){if(navigator.vibrate){try{navigator.vibrate(ms);}catch(e){}}}

/* ==================== TAB SWITCHING ==================== */
function switchTab(tab){
    vibrate(10);
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    if(tab==='calc'){
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('tab-calc').classList.add('active');
        calcScheduleUpdate();
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('tab-log').classList.add('active');
        setTimeout(()=>{logDrawChart();},60);
    }
    const popup = document.getElementById('themePopup');
    if (popup) popup.classList.remove('show');
}

/* ==================== MODAL ==================== */
function openSpecModal(){vibrate(15);document.getElementById('specModal').classList.add('active');}
function closeSpecModal(event){
    if(event&&event.target!==event.currentTarget)return;
    vibrate(15);
    document.getElementById('specModal').classList.remove('active');
}
document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
        document.getElementById('specModal').classList.remove('active');
        const popup = document.getElementById('themePopup');
        if (popup) popup.classList.remove('show');
    }
});
document.addEventListener('click', function(e) {
    const popup = document.getElementById('themePopup');
    const themeBtn = document.querySelector('.theme-divider-btn');
    if (popup && popup.classList.contains('show') &&
        !popup.contains(e.target) &&
        !themeBtn.contains(e.target)) {
        popup.classList.remove('show');
    }
});

/* ==================== PRESSURE CONVERTER ==================== */
const pressureToBar={
    bar:1,
    mbar:0.001,
    kPa:0.01,
    Pa:0.00001,
    MPa:10,
    psi:0.0689475729,
    mmHg:0.00133322387,
    mmH2O:0.0000980665,
    inH2O:0.0024908891,
    kgcm2:0.980665,
    atm:1.01325
};
function convertUnit(){
    const i=document.getElementById('convInput'),
          f=document.getElementById('convFrom'),
          t=document.getElementById('convTo'),
          r=document.getElementById('convResult'),
          u=document.getElementById('convToUnit'),
          box=document.getElementById('convResultBox');
    if(!i||!f||!t)return;
    let v=parseFloat(i.value.replace(',','.'));
    if(isNaN(v)){
        r.innerText='0.00';
        u.innerText=t.value;
        box.classList.remove('active');
        return;
    }
    const fu=f.value,tu=t.value;
    const inBar=v*(pressureToBar[fu]||1);
    const result=inBar/(pressureToBar[tu]||1);
    if(Math.abs(result)<0.0001&&result!==0)r.innerText=result.toExponential(4);
    else if(Math.abs(result)>=1000000)r.innerText=result.toExponential(4);
    else r.innerText=parseFloat(result.toFixed(4)).toString();
    u.innerText=tu;
    box.classList.add('active');
    calcSaveStateDebounced();
}
function swapConvUnit(){
    vibrate(15);
    const f=document.getElementById('convFrom'),
          t=document.getElementById('convTo');
    if(!f||!t)return;
    const tmp=f.value;
    f.value=t.value;
    t.value=tmp;
    convertUnit();
}

/* ==================== CALC ENGINE ==================== */
const CALC_MA_MIN=4,CALC_MA_MAX=20,CALC_MA_SPAN=16;
let CALC_TABLE_POINTS=[0,25,50,75,100],calcRefMode='custom',calibMode='target';
const CALC_SIEMENS_MAX=27648,CALC_AB_MAX=32767,CALC_MITSUBISHI_MAX=4000,CALC_AB_RAW_LOW=3277,CALC_AB_RAW_HIGH=16383;
const CALC_NAMUR={faultLow:3.6,low:3.8,high:20.5,faultHigh:21.0};
const CALC_PT100_A=3.9083e-3,CALC_PT100_B=-5.775e-7,CALC_PT100_C=-4.183e-12,CALC_PT100_R0=100;
const CALC_TC_S_LOW=[0,5.40313308631e-3,1.25934289740e-5,-2.32477968689e-8,3.22028823036e-11,-3.31465196389e-14,2.55744251786e-17,-1.25068871393e-20,2.71443176145e-24];
const CALC_TC_S_HIGH=[1.32900444085,3.34509311344e-3,6.54805192818e-6,-1.64856259209e-9,1.29989605174e-14];
const CALC_TC_K_LOW=[0.0,3.94501280250e-2,2.36223735980e-5,-3.28589067840e-7,-4.99048287770e-9,-6.75090591730e-11,-5.74103274280e-13,-3.10888728940e-15,-1.04516093650e-17,-1.98892668780e-20,-1.63226974860e-23];
const CALC_TC_K_HIGH=[-1.76004136860e-2,3.89212049750e-2,1.85587700320e-5,-9.94575928740e-8,3.18409457190e-10,-5.60728448890e-13,5.60750590590e-16,-3.20207200030e-19,9.71511471520e-23,-1.21047212750e-26];
const CALC_TC_K_HIGH_A=[1.18597600000e-1,-1.18343200000e-4,1.26968600000e2];
const CALC_TC_K_INV_LOW=[0.0,2.5173462e1,-1.1662878,-1.0833638,-8.9773540e-1,-3.7342377e-1,-8.6632643e-2,-1.0450598e-2,-5.1920577e-4];
const CALC_TC_K_INV_MID=[0.0,2.508355e1,7.860106e-2,-2.503131e-1,8.315270e-2,-1.228034e-2,9.804036e-4,-4.413030e-5,1.057734e-6,-1.052755e-8];
const CALC_TC_K_INV_HIGH=[-1.318058e2,4.830222e1,-1.646031,5.464731e-2,-9.650715e-4,8.802193e-6,-3.110810e-8];
const CALC_TC_J_LOW=[0,5.0381187815e-2,3.047583693e-5,-8.568106572e-8,1.3228195295e-10,-1.7052958337e-13,2.0948090697e-16,-1.2538395336e-19,1.5631725697e-23];
const CALC_TC_J_HIGH=[2.9645625681e2,-1.4976127786,3.1787103924e-3,-3.1847686701e-6,1.5720819004e-9,-3.0691369056e-13];

function calcTcK_TtoV(T){
    T=calcClamp(T,-270,1372);
    if(T<=0)return CALC_TC_K_LOW.reduce((s,c,i)=>s+c*Math.pow(T,i),0);
    const poly=CALC_TC_K_HIGH.reduce((s,c,i)=>s+c*Math.pow(T,i),0);
    const[a0,a1,a2]=CALC_TC_K_HIGH_A;
    return poly+a0*Math.exp(a1*(T-a2)*(T-a2));
}
function calcTcK_mVToTemp(mV){
    mV=calcClamp(mV,-6.458,54.886);
    let T;
    if(mV<0)T=CALC_TC_K_INV_LOW.reduce((s,c,i)=>s+c*Math.pow(mV,i),0);
    else if(mV<=20.644)T=CALC_TC_K_INV_MID.reduce((s,c,i)=>s+c*Math.pow(mV,i),0);
    else T=CALC_TC_K_INV_HIGH.reduce((s,c,i)=>s+c*Math.pow(mV,i),0);
    for(let i=0;i<6;i++){
        const Vc=calcTcK_TtoV(T),dV=(calcTcK_TtoV(T+0.01)-Vc)/0.01;
        if(!isFinite(dV)||Math.abs(dV)<1e-12)break;
        const delta=(Vc-mV)/dV;
        T-=delta;
        if(Math.abs(delta)<0.0001)break;
    }
    return calcClamp(T,-270,1372);
}
function calcTcS_TtoV(T){
    T=calcClamp(T,-50,1768);
    return T<=1064.18?
        CALC_TC_S_LOW.reduce((s,c,i)=>s+c*Math.pow(T,i),0):
        CALC_TC_S_HIGH.reduce((s,c,i)=>s+c*Math.pow(T-1064.18,i),0);
}
function calcTcS_VtoT(mV){
    mV=calcClamp(mV,-0.236,18.693);
    let T=mV<=0?-10:600;
    for(let i=0;i<50;i++){
        const Vc=calcTcS_TtoV(T),step=T>1767.5?-0.05:0.05;
        const dV=(calcTcS_TtoV(T+step)-Vc)/step;
        if(!isFinite(dV)||Math.abs(dV)<1e-12)break;
        const delta=(Vc-mV)/dV;
        T-=calcClamp(delta,-50,50);
        if(!isFinite(T))break;
        if(Math.abs(delta)<0.0001&&T>=-50&&T<=1768)return T;
    }
    let lo=-50,hi=1768;
    for(let i=0;i<60;i++){
        T=(lo+hi)/2;
        const Vc=calcTcS_TtoV(T);
        if(Math.abs(Vc-mV)<1e-6)return T;
        if(Vc<mV)lo=T;else hi=T;
    }
    return calcClamp(T,-50,1768);
}
function calcTcJ_TtoV(T){
    T=calcClamp(T,-210,1200);
    return T<=760?
        CALC_TC_J_LOW.reduce((s,c,i)=>s+c*Math.pow(T,i),0):
        CALC_TC_J_HIGH.reduce((s,c,i)=>s+c*Math.pow(T,i),0);
}
function calcTcJ_VtoT(mV){
    mV=calcClamp(mV,-8.095,69.553);
    let lo=-210,hi=1200,T=0;
    for(let i=0;i<60;i++){
        T=(lo+hi)/2;
        const Vc=calcTcJ_TtoV(T);
        if(Math.abs(Vc-mV)<1e-6)return T;
        if(Vc<mV)lo=T;else hi=T;
    }
    return calcClamp(T,-210,1200);
}
function calcPT100_RtoT(measuredR, leadOhm){
    const lead=isFinite(leadOhm)?leadOhm:0;
    const R=measuredR-lead;
    if(!isFinite(R)||R<=0)return NaN;
    if(R>=CALC_PT100_R0){
        const disc=CALC_PT100_A*CALC_PT100_A-4*CALC_PT100_B*(1-R/CALC_PT100_R0);
        if(disc<0)return NaN;
        return calcClamp((-CALC_PT100_A+Math.sqrt(disc))/(2*CALC_PT100_B),0,850);
    }
    let T=(R-CALC_PT100_R0)/(CALC_PT100_R0*CALC_PT100_A);
    for(let i=0;i<50;i++){
        const T100=T-100,
              Rt=CALC_PT100_R0*(1+CALC_PT100_A*T+CALC_PT100_B*T*T+CALC_PT100_C*T100*T*T*T),
              dRt=CALC_PT100_R0*(CALC_PT100_A+2*CALC_PT100_B*T+CALC_PT100_C*T*T*(4*T-300));
        if(!isFinite(dRt)||Math.abs(dRt)<1e-12)break;
        const delta=(Rt-R)/dRt;
        T-=calcClamp(delta,-50,50);
        if(!isFinite(T)||Math.abs(delta)<1e-6)break;
    }
    if(!isFinite(T)||T<-250||T>900)return NaN;
    return calcClamp(T,-200,850);
}
function calcPT100_TtoR(T, leadOhm){
    T=calcClamp(T,-200,850);
    const T100=T-100;
    const baseR=T>=0?
        CALC_PT100_R0*(1+CALC_PT100_A*T+CALC_PT100_B*T*T):
        CALC_PT100_R0*(1+CALC_PT100_A*T+CALC_PT100_B*T*T+CALC_PT100_C*T100*T*T*T);
    return baseR+(isFinite(leadOhm)?leadOhm:0);
}

const CALC_SENSOR_LIMITS={
    pt:{minT:-200,maxT:850,minRaw:18.52,maxRaw:390.48,unit:'Ω'},
    tk:{minT:-270,maxT:1372,minRaw:-6.458,maxRaw:54.886,unit:'mV'},
    ts:{minT:-50,maxT:1768,minRaw:-0.236,maxRaw:18.693,unit:'mV'},
    tj:{minT:-210,maxT:1200,minRaw:-8.095,maxRaw:69.553,unit:'mV'}
};
function calcClampSensorTemp(mode, tempC){
    const lim=CALC_SENSOR_LIMITS[mode];
    if(!lim||!isFinite(tempC))return tempC;
    return calcClamp(tempC,lim.minT,lim.maxT);
}
function calcSensorTempToRaw(mode, tempC, cjcC, leadOhm){
    if(!isFinite(tempC))return NaN;
    const cj=isFinite(cjcC)?cjcC:0;
    if(mode==='pt')return calcPT100_TtoR(tempC, leadOhm);
    if(mode==='tk')return calcTcK_TtoV(tempC)-calcTcK_TtoV(cj);
    if(mode==='ts')return calcTcS_TtoV(tempC)-calcTcS_TtoV(cj);
    if(mode==='tj')return calcTcJ_TtoV(tempC)-calcTcJ_TtoV(cj);
    return NaN;
}
function calcSensorRawToTemp(mode, raw, cjcC, leadOhm){
    if(!isFinite(raw))return NaN;
    const cj=isFinite(cjcC)?cjcC:0;
    if(mode==='pt')return calcPT100_RtoT(raw, leadOhm);
    if(mode==='tk')return calcTcK_mVToTemp(raw+calcTcK_TtoV(cj));
    if(mode==='ts')return calcTcS_VtoT(raw+calcTcS_TtoV(cj));
    if(mode==='tj')return calcTcJ_VtoT(raw+calcTcJ_TtoV(cj));
    return NaN;
}

let calcDampingTimer=null,calcDampedValue=CALC_MA_MIN,calcDampingActive=false,calcDampingLastTime=0,calcUpdatePending=false;
const calcState={locked1:false,lockVal1:CALC_MA_MIN,locked2:false,lockVal2:0};
function calc$(id){return document.getElementById(id);}
const calcEl={
    mi:calc$('mi'),pvVal:calc$('pv_val'),pvUnit:calc$('pv_unit'),tb:calc$('tb'),
    pr:calc$('pr'),pctDisplay:calc$('pct_display'),rangeError:calc$('rangeError'),
    dampedDisplay:calc$('dampedDisplay'),namurLed:calc$('namurLed'),
    actualPVbox:calc$('actualPVbox'),actualPV:calc$('actualPV'),actualUnitLbl:calc$('actualUnitLbl'),
    lockBtn1:calc$('lockBtn1'),lockBtn2:calc$('lockBtn2'),btnGrid:calc$('btnGrid'),thRaw:calc$('thRaw')
};
function calcClamp(val,min,max){return Math.max(min,Math.min(max,val));}
function calcToNum(s){
    if(typeof s!=='string')s=String(s);
    s=s.trim();
    if(s===''||s==='-'||s==='.'||s==='-.')return NaN;
    s=s.replace(/,/g,'.');
    const v=parseFloat(s);
    return isNaN(v)?NaN:v;
}
function calcSanitizeInput(el){
    let v=el.value;
    v=v.replace(/,/g,'.');
    v=v.replace(/[^0-9.\-]/g,'');
    if(v.includes('-')){
        v=(v[0]==='-'?'-':'')+v.replace(/-/g,'');
    }
    const parts=v.split('.');
    if(parts.length>2){
        v=parts[0]+'.'+parts.slice(1).join('');
    }
    el.value=v;
}

/* ============ SAVE & LOAD STATE ============ */
let calcSaveTimer=null;
function calcSaveState(){
    try{
        const refContent=document.getElementById('refTableContent');
        const data={
            sm:calc$('sm').value,
            cjcTemp:calc$('cjcTemp').value,
            leadOhm:calc$('leadOhm')?calc$('leadOhm').value:'0',
            lrv:calc$('lrv').value,
            urv:calc$('urv').value,
            unit:calc$('unit').value,
            mi:calc$('mi').value,
            actualPV:calc$('actualPV').value,
            damping:calc$('damping').value,
            dampingMode:calc$('dampingMode').value,
            fm:calc$('fm').value,
            td:calc$('td').value,
            ta:calc$('ta').value,
            pd:calc$('pd').value,
            pa:calc$('pa').value,
            oilBeta:calc$('oilBeta')?calc$('oilBeta').value:'0.00085',
            ffc:calc$('ffc').value,
            ffm:calc$('ffm').value,
            pb:calc$('pb').value,
            dpLrv:calc$('dpLrv').value,
            dpUrv:calc$('dpUrv').value,
            dpUnit:calc$('dpUnit').value,
            dpShowMode:calc$('dpShowMode').value,
            locked1:calcState.locked1,
            lockVal1:calcState.lockVal1,
            locked2:calcState.locked2,
            lockVal2:calcState.lockVal2,
            refMode:calcRefMode,
            refTableOpen:refContent?refContent.style.display!=='none':true,
            calibMode:calibMode,
            calibTarget:calc$('calibTarget')?calc$('calibTarget').value:'',
            calibSensorMv:calc$('calibSensorMv')?calc$('calibSensorMv').value:'',
            customPointCount:document.getElementById('customPointCount')?.value||'0',
            convInput:document.getElementById('convInput')?.value||'',
            convFrom:document.getElementById('convFrom')?.value||'mbar',
            convTo:document.getElementById('convTo')?.value||'kPa'
        };
        for(let i=1;i<=5;i++){
            const el=document.getElementById('customVal'+i);
            if(el)data['customVal'+i]=el.value;
        }
        localStorage.setItem('calc_state',JSON.stringify(data));
    }catch(e){}
}
function calcSaveStateDebounced(){
    clearTimeout(calcSaveTimer);
    calcSaveTimer=setTimeout(calcSaveState,300);
}
function calcLoadState(){
    let saved=null;
    try{saved=localStorage.getItem('calc_state');}catch(e){return false;}
    if(!saved)return false;
    try{
        const data=JSON.parse(saved);
        if(data.sm)calc$('sm').value=data.sm;
        if(data.cjcTemp!==undefined)calc$('cjcTemp').value=data.cjcTemp;
        if(data.leadOhm!==undefined&&calc$('leadOhm'))calc$('leadOhm').value=data.leadOhm;
        if(data.lrv!==undefined)calc$('lrv').value=data.lrv;
        if(data.urv!==undefined)calc$('urv').value=data.urv;
        if(data.unit!==undefined)calc$('unit').value=data.unit;
        if(data.mi!==undefined){
            calc$('mi').value=data.mi;
            const loadedMa=calcToNum(data.mi);
            if(!isNaN(loadedMa))calcDampedValue=loadedMa;
        }
        if(data.actualPV!==undefined)calc$('actualPV').value=data.actualPV;
        if(data.damping!==undefined)calc$('damping').value=data.damping;
        if(data.dampingMode)calc$('dampingMode').value=data.dampingMode;
        if(data.fm)calc$('fm').value=data.fm;
        if(data.td!==undefined)calc$('td').value=data.td;
        if(data.ta!==undefined)calc$('ta').value=data.ta;
        if(data.pd!==undefined)calc$('pd').value=data.pd;
        if(data.pa!==undefined)calc$('pa').value=data.pa;
        if(data.oilBeta!==undefined&&calc$('oilBeta'))calc$('oilBeta').value=data.oilBeta;
        if(data.ffc!==undefined)calc$('ffc').value=data.ffc;
        if(data.ffm)calc$('ffm').value=data.ffm;
        if(data.pb)calc$('pb').value=data.pb;
        if(data.dpLrv!==undefined)calc$('dpLrv').value=data.dpLrv;
        if(data.dpUrv!==undefined)calc$('dpUrv').value=data.dpUrv;
        if(data.dpUnit!==undefined)calc$('dpUnit').value=data.dpUnit;
        if(data.dpShowMode)calc$('dpShowMode').value=data.dpShowMode;
        if(data.calibMode)calibMode=data.calibMode;
        if(data.calibTarget!==undefined&&calc$('calibTarget'))calc$('calibTarget').value=data.calibTarget;
        if(data.calibSensorMv!==undefined&&calc$('calibSensorMv'))calc$('calibSensorMv').value=data.calibSensorMv;

        if(data.locked1){
            calcState.locked1=true;
            calcState.lockVal1=(typeof data.lockVal1==='number'&&!isNaN(data.lockVal1))?data.lockVal1:CALC_MA_MIN;
            calcEl.lockBtn1.textContent='🔒';
            calcEl.lockBtn1.classList.add('locked');
            calcEl.actualPV.disabled=true;
        }
        if(data.locked2){
            calcState.locked2=true;
            calcState.lockVal2=(typeof data.lockVal2==='number'&&!isNaN(data.lockVal2))?data.lockVal2:0;
            calcEl.lockBtn2.textContent='🔒';
            calcEl.lockBtn2.classList.add('locked');
            calcEl.actualPV.disabled=true;
        }
        if(data.refMode){
            calcRefMode=data.refMode;
            document.getElementById('refModeStandard').classList.toggle('active',data.refMode==='standard');
            document.getElementById('refModeCustom').classList.toggle('active',data.refMode==='custom');
            document.getElementById('customRefPanel').style.display=data.refMode==='custom'?'block':'none';
            document.getElementById('standardRefTable').style.display=data.refMode==='standard'?'block':'none';
        }
        if(data.refTableOpen===false){
            document.getElementById('refTableContent').style.display='none';
            calc$('refTableLabel').textContent='OFF';
            calc$('refTableToggle').classList.add('calc-toggle-off');
        }
        if(data.customPointCount!==undefined){
            document.getElementById('customPointCount').value=data.customPointCount;
        }
        calcBuildCustomInputs();
        for(let i=1;i<=5;i++){
            if(data['customVal'+i]!==undefined){
                const el=document.getElementById('customVal'+i);
                if(el)el.value=data['customVal'+i];
            }
        }
        if(data.convInput!==undefined&&calc$('convInput'))calc$('convInput').value=data.convInput;
        if(data.convFrom&&calc$('convFrom'))calc$('convFrom').value=data.convFrom;
        if(data.convTo&&calc$('convTo'))calc$('convTo').value=data.convTo;
        convertUnit();
        return true;
    }catch(e){
        return false;
    }
}

function calcResetDisplayColors(){
    calcEl.mi.style.borderColor='#1a3a4a';
    calcEl.mi.style.color='';
    calcEl.pvVal.style.color='var(--green)';
}
function calcResetNamurState(){
    calcResetDisplayColors();
    calcEl.mi.placeholder='4.000';
    calcSetLED('normal');
}
function calcScheduleUpdate(){
    if(calcUpdatePending)return;
    calcUpdatePending=true;
    requestAnimationFrame(()=>{
        calcUpdatePending=false;
        calcUpd();
    });
}
function calcNamurStatus(mA){
    if(isNaN(mA))return{status:'fault',color:'var(--red)'};
    if(mA<=CALC_NAMUR.faultLow)return{status:'fault',color:'var(--red)'};
    if(mA>CALC_NAMUR.faultLow&&mA<CALC_NAMUR.low)return{status:'low',color:'var(--yellow)'};
    if(mA>=CALC_NAMUR.low&&mA<=CALC_NAMUR.high)return{status:'normal',color:'var(--green)'};
    if(mA>CALC_NAMUR.high&&mA<CALC_NAMUR.faultHigh)return{status:'high',color:'var(--orange)'};
    return{status:'fault',color:'var(--red)'};
}
function calcSetLED(status){
    calcEl.namurLed.className='calc-sim-led '+status;
}
function calcClearPctButtons(){
    document.querySelectorAll('#tab-calc .calc-btn-pct').forEach(b=>b.classList.remove('active'));
}

function calcStartDampingLoop(){
    calcStopDampingLoop();
    const sm=calc$('sm').value;
    if(sm!=='ma'&&sm!=='ma-rev')return;
    const rawmA=calcState.locked1?calcState.lockVal1:calcToNum(calcEl.mi.value);
    const tau=calcToNum(calc$('damping').value);
    if(isNaN(rawmA)||isNaN(tau)||tau<=0){
        if(!isNaN(rawmA))calcDampedValue=rawmA;
        calcEl.dampedDisplay.textContent='';
        calcScheduleUpdate();
        return;
    }
    if(Math.abs(rawmA-calcDampedValue)<0.0005){
        calcDampedValue=rawmA;
        calcEl.dampedDisplay.textContent='';
        calcScheduleUpdate();
        return;
    }
    calcDampingActive=true;
    calcDampingLastTime=performance.now();
    function loop(now){
        if(!calcDampingActive)return;
        const curSm=calc$('sm').value;
        if(curSm!=='ma'&&curSm!=='ma-rev'){
            calcStopDampingLoop();
            return;
        }
        const target=calcState.locked1?calcState.lockVal1:calcToNum(calcEl.mi.value);
        const curTau=calcToNum(calc$('damping').value);
        if(isNaN(target)||isNaN(curTau)||curTau<=0){
            if(!isNaN(target))calcDampedValue=target;
            calcEl.dampedDisplay.textContent='';
            calcDampingActive=false;
            calcDampingTimer=null;
            calcScheduleUpdate();
            return;
        }
        const dt=Math.min((now-calcDampingLastTime)/1000,0.1);
        calcDampingLastTime=now;
        const alpha=1-Math.exp(-dt/curTau);
        calcDampedValue+=alpha*(target-calcDampedValue);
        if(Math.abs(target-calcDampedValue)<0.0005){
            calcDampedValue=target;
            calcEl.dampedDisplay.textContent='';
            calcDampingActive=false;
            calcDampingTimer=null;
            calcScheduleUpdate();
            return;
        }
        calcEl.dampedDisplay.textContent=`Damped: ${calcDampedValue.toFixed(3)} → ${target.toFixed(3)} mA`;
        calcScheduleUpdate();
        calcDampingTimer=requestAnimationFrame(loop);
    }
    calcDampingTimer=requestAnimationFrame(loop);
}
function calcStopDampingLoop(){
    calcDampingActive=false;
    if(calcDampingTimer){
        cancelAnimationFrame(calcDampingTimer);
        calcDampingTimer=null;
    }
}
function calcResetDamping(){
    const modeOn=calc$('dampingMode').value==='on';
    const rawmA=calcState.locked1?calcState.lockVal1:calcToNum(calcEl.mi.value);
    if(!modeOn){
        if(!isNaN(rawmA))calcDampedValue=rawmA;
        calcEl.dampedDisplay.textContent='';
        calcStopDampingLoop();
        calcScheduleUpdate();
    }else{
        if(isNaN(calcDampedValue))calcDampedValue=!isNaN(rawmA)?rawmA:CALC_MA_MIN;
        calcStartDampingLoop();
    }
}
function calcGetCurrentmA(){
    const sm=calc$('sm').value;
    const rawmA=calcState.locked1?calcState.lockVal1:calcToNum(calcEl.mi.value);
    if(isNaN(rawmA))return NaN;
    if(sm!=='ma'&&sm!=='ma-rev')return rawmA;
    const dampingOn=calc$('dampingMode').value==='on'&&calcToNum(calc$('damping').value)>0;
    if(!dampingOn){
        calcDampedValue=rawmA;
        return rawmA;
    }
    return calcDampedValue;
}
function calcToggleLock1(){
    vibrate(15);
    calcState.locked1=!calcState.locked1;
    const pb=document.querySelectorAll('#tab-calc .calc-btn-pct');
    if(calcState.locked1){
        const parsed=calcToNum(calcEl.mi.value);
        calcState.lockVal1=!isNaN(parsed)?parsed:CALC_MA_MIN;
        calcEl.mi.disabled=true;
        calcEl.actualPV.disabled=true;
        pb.forEach(b=>b.disabled=true);
        calcEl.lockBtn1.textContent='🔒';
        calcEl.lockBtn1.classList.add('locked');
    }else{
        calcEl.mi.disabled=(calc$('sm').value!=='ma'&&calc$('sm').value!=='ma-rev');
        calcEl.actualPV.disabled=calcState.locked2;
        pb.forEach(b=>b.disabled=(calc$('sm').value!=='ma'&&calc$('sm').value!=='ma-rev'));
        calcEl.lockBtn1.textContent='🔓';
        calcEl.lockBtn1.classList.remove('locked');
    }
    calcScheduleUpdate();
}
function calcToggleLock2(){
    vibrate(15);
    calcState.locked2=!calcState.locked2;
    if(calcState.locked2){
        const parsed=calcToNum(calcEl.actualPV.value);
        calcState.lockVal2=!isNaN(parsed)?parsed:0;
        calcEl.actualPV.disabled=true;
        calcEl.lockBtn2.textContent='🔒';
        calcEl.lockBtn2.classList.add('locked');
    }else{
        calcEl.actualPV.disabled=calcState.locked1;
        calcEl.lockBtn2.textContent='🔓';
        calcEl.lockBtn2.classList.remove('locked');
    }
    calcSaveStateDebounced();
}

/* ============ SENSOR MODE TOGGLE ============ */
function calcTglS(){
    vibrate(15);
    const mode=calc$('sm').value;
    const adcDacBox=document.getElementById('adcDacInfoBox');
    const calibModeSensorBtn=document.getElementById('calibModeSensor');
    const calibSensorLbl=document.getElementById('calibSensorInputLabel');
    const calibSensorInp=calc$('calibSensorMv');

    if(mode==='ma'||mode==='ma-rev'){
        calc$('cjcBox').style.display='none';
        if(calc$('leadOhmBox'))calc$('leadOhmBox').style.display='none';
        calcEl.actualPVbox.style.display='flex';
        calcEl.mi.disabled=calcState.locked1;
        calcEl.actualPV.disabled=calcState.locked1||calcState.locked2;
        calc$('calibBox').style.display='none';
        if(adcDacBox)adcDacBox.style.display='none';
        updateADCDisplay(NaN,NaN);
        updateSensorRangeDisplay('');
    }else{
        calc$('cjcBox').style.display=(mode==='tk'||mode==='ts'||mode==='tj')?'block':'none';
        if(calc$('leadOhmBox'))calc$('leadOhmBox').style.display=(mode==='pt')?'block':'none';
        calcEl.actualPVbox.style.display='none';
        calcEl.actualPV.value='';
        calcEl.mi.disabled=true;
        calc$('calibBox').style.display='block';
        if(adcDacBox)adcDacBox.style.display='block';
        calcUpdateCalibUnitLabel();

        if(calibModeSensorBtn){
            calibModeSensorBtn.style.display='block';
            calibModeSensorBtn.textContent=(mode==='pt')?'SENSOR Ω':'SENSOR mV';
        }
        if(calibSensorLbl){
            calibSensorLbl.textContent=(mode==='pt')?'Sensor (Ω)':'Sensor (mV)';
        }
        if(calibSensorInp){
            calibSensorInp.placeholder=(mode==='pt')?'Ω...':'mV...';
        }

        if(calibMode==='target'){calcCalibToRaw();}else{calcMvToTarget();}
    }
    calcBuildRegularButtons();
    calcResetNamurState();
    calcResetDamping();
    calcScheduleUpdate();
}

function calcBuildRegularButtons(){
    const isFlow=(calc$('fm').value==='dp'||calc$('fm').value==='ol'||calc$('fm').value==='gs');
    let html='';
    if(isFlow){
        html+='<button class="calc-btn-pct" onclick="calcSp(0,this)">F0%</button>';
        html+='<button class="calc-btn-pct" onclick="calcSp(6.25,this)">F25%</button>';
        html+='<button class="calc-btn-pct" onclick="calcSp(25,this)">F50%</button>';
        html+='<button class="calc-btn-pct" onclick="calcSp(56.25,this)">F75%</button>';
        html+='<button class="calc-btn-pct" onclick="calcSp(100,this)">F100%</button>';
    }else{
        html+='<button class="calc-btn-pct" onclick="calcSp(0,this)">0%</button>';
        html+='<button class="calc-btn-pct" onclick="calcSp(25,this)">25%</button>';
        html+='<button class="calc-btn-pct" onclick="calcSp(50,this)">50%</button>';
        html+='<button class="calc-btn-pct" onclick="calcSp(75,this)">75%</button>';
        html+='<button class="calc-btn-pct" onclick="calcSp(100,this)">100%</button>';
    }
    calcEl.btnGrid.innerHTML=html;
    if(calcState.locked1||(calc$('sm').value!=='ma'&&calc$('sm').value!=='ma-rev')){
        document.querySelectorAll('#tab-calc .calc-btn-pct').forEach(b=>b.disabled=true);
    }
}
function calcUpdateCalibUnitLabel(){
    const mode = calc$('sm').value;
    const lbl = calc$('calibUnitLabel');
    const rawLabel = document.querySelector('#calibTargetMode .calc-row .calc-col:nth-child(2) .calc-label');

    if (mode === 'pt') {
        if (lbl) lbl.textContent = 'PT100 (°C ↔ Ω)';
        if (rawLabel) rawLabel.textContent = 'Resistance (Ω)';
    } else if (mode === 'tk' || mode === 'ts' || mode === 'tj') {
        if (lbl) lbl.textContent = mode.toUpperCase() + ' (°C ↔ mV)';
        if (rawLabel) rawLabel.textContent = 'Voltage (mV)';
    } else {
        if (lbl) lbl.textContent = calc$('unit').value || 'Unit';
        if (rawLabel) rawLabel.textContent = 'Raw Output';
    }
}

/* ============ CALIBRATION MODE ============ */
function calcSetCalibMode(mode){
    vibrate(15);
    calibMode=mode;
    document.getElementById('calibModeTarget').classList.toggle('active',mode==='target');
    document.getElementById('calibModeSensor').classList.toggle('active',mode==='sensor');
    document.getElementById('calibTargetMode').style.display=mode==='target'?'block':'none';
    document.getElementById('calibSensorMode').style.display=mode==='sensor'?'block':'none';
    if(mode==='target'){
        calcCalibToRaw();
    }else{
        calcMvToTarget();
    }
    calcSaveStateDebounced();
}

/* ============ SENSOR RANGE DISPLAY ============ */
function updateSensorRangeDisplay(mode) {
    const el1 = document.getElementById('sensorRangeDisplay');
    const el2 = document.getElementById('sensorRangeDisplay2');

    const ranges = {
        pt: 'Range: 18.52 – 390.48 Ω (-200 to +850 °C)',
        tk: 'Range: -6.458 – 54.886 mV (-270 to +1372 °C)',
        ts: 'Range: -0.236 – 18.693 mV (-50 to +1768 °C)',
        tj: 'Range: -8.095 – 69.553 mV (-210 to +1200 °C)'
    };

    const text = ranges[mode] || '';
    if (el1) el1.innerText = text;
    if (el2) el2.innerText = text;
}

/* ============ ADC -> MCU -> DAC -> LOOP OUT DISPLAY ============ */
function updateADCDisplay(rawValue, targetValue) {
    const adcEl = document.getElementById('adcValueDisplay');
    const mcuEl = document.getElementById('mcuValueDisplay');
    const mcuSubEl = document.getElementById('mcuSubDisplay');
    const dacEl = document.getElementById('dacValueDisplay');
    const dacMaEl = document.getElementById('dacMaDisplay');

    if (!adcEl || !dacEl || !dacMaEl) return;

    const mode = calc$('sm').value;

    if (isNaN(rawValue) || !mode || mode === 'ma' || mode === 'ma-rev' || isNaN(targetValue)) {
        adcEl.innerText = '---';
        if (mcuEl) mcuEl.innerText = '---';
        if (mcuSubEl) mcuSubEl.innerText = 'Linear+Scale';
        dacEl.innerText = '---';
        dacMaEl.innerText = '---';
        return;
    }

    const lim = CALC_SENSOR_LIMITS[mode];
    const pct = Math.max(0, Math.min(1, (rawValue - lim.minRaw) / (lim.maxRaw - lim.minRaw)));
    const adcValue = Math.round(pct * 16777215);

    adcEl.innerText = adcValue.toLocaleString();
    if (mcuSubEl) mcuSubEl.innerText = targetValue.toFixed(1) + ' °C';

    const lrv = calcToNum(calc$('lrv').value);
    const urv = calcToNum(calc$('urv').value);
    if (!isNaN(lrv) && !isNaN(urv) && urv > lrv) {
        const fmMode = calc$('fm').value;
        const dacMa = calcInvertPVtoMA(targetValue, lrv, urv, fmMode);
        const spanPct = ((dacMa - CALC_MA_MIN) / CALC_MA_SPAN) * 100;
        const dacPctClamped = Math.max(0, Math.min(1, (dacMa - CALC_MA_MIN) / CALC_MA_SPAN));
        const dacValue = Math.round(dacPctClamped * 65535);

        if (mcuEl) mcuEl.innerText = isNaN(spanPct) ? '---' : spanPct.toFixed(1) + '%';
        dacEl.innerText = isNaN(dacValue) ? '---' : dacValue.toLocaleString();
        dacMaEl.innerText = isNaN(dacMa) ? '---' : dacMa.toFixed(3) + ' mA';
    } else {
        if (mcuEl) mcuEl.innerText = '---';
        dacEl.innerText = '---';
        dacMaEl.innerText = 'Set range';
    }
}

/* ============ MODE TARGET ============ */
function calcCalibToRaw(){
    const mode=calc$('sm').value,outEl=calc$('calibRawOut');
    calcUpdateCalibUnitLabel();

    if(mode==='ma'||mode==='ma-rev'){
        outEl.value='';
        updateADCDisplay(NaN,NaN);
        updateSensorRangeDisplay('');
        return;
    }
    updateSensorRangeDisplay(mode);
    const rawTarget=calcToNum(calc$('calibTarget').value);
    if(isNaN(rawTarget)){
        outEl.value='';
        updateADCDisplay(NaN,NaN);
        return;
    }

    const clampedTarget=calcClampSensorTemp(mode,rawTarget);
    const lim=CALC_SENSOR_LIMITS[mode];
    const isClamped=lim&&(rawTarget<lim.minT||rawTarget>lim.maxT);

    const cjcTemp=calcToNum(calc$('cjcTemp').value);
    const leadOhm=calc$('leadOhm')?calcToNum(calc$('leadOhm').value):0;
    const raw=calcSensorTempToRaw(mode, clampedTarget, isNaN(cjcTemp)?0:cjcTemp, isNaN(leadOhm)?0:leadOhm);
    const unitLabel=(mode==='pt')?'Ω':'mV';

    outEl.value=isNaN(raw)?'--':raw.toFixed(3)+' '+unitLabel+(isClamped?' (LIMIT)':'');
    outEl.style.color=isClamped?'var(--orange)':'var(--blue)';
    if(isClamped){
        const el1=document.getElementById('sensorRangeDisplay');
        if(el1)el1.innerText=`Out of range (${rawTarget}°C) → clamped to ${clampedTarget}°C`;
    }
    updateADCDisplay(raw, clampedTarget);
    calcSaveStateDebounced();
}

/* ============ MODE SENSOR (PT100 Ω / TC mV -> °C) ============ */
function calcMvToTarget(){
    const mode=calc$('sm').value;
    const outEl=calc$('calibTempOut');
    const mvEl=calc$('calibSensorMv');

    if(mode==='ma'||mode==='ma-rev'){
        if(outEl)outEl.value='';
        updateADCDisplay(NaN,NaN);
        updateSensorRangeDisplay('');
        return;
    }
    updateSensorRangeDisplay(mode);
    const raw=calcToNum(mvEl.value);
    if(isNaN(raw)){
        if(outEl)outEl.value='';
        updateADCDisplay(NaN,NaN);
        return;
    }

    const cjcTemp=calcToNum(calc$('cjcTemp').value);
    const leadOhm=calc$('leadOhm')?calcToNum(calc$('leadOhm').value):0;
    const cjcVal=isNaN(cjcTemp)?0:cjcTemp;
    const leadVal=isNaN(leadOhm)?0:leadOhm;
    const temp=calcSensorRawToTemp(mode, raw, cjcVal, leadVal);

    const lim=CALC_SENSOR_LIMITS[mode];
    let isClamped=false;
    if(lim){
        if(mode==='pt'){
            const effR=raw-leadVal;
            isClamped=effR<lim.minRaw||effR>lim.maxRaw;
        }else{
            const cjMv=mode==='tk'?calcTcK_TtoV(cjcVal):mode==='ts'?calcTcS_TtoV(cjcVal):calcTcJ_TtoV(cjcVal);
            const totMv=raw+cjMv;
            isClamped=totMv<lim.minRaw||totMv>lim.maxRaw;
        }
    }

    if(outEl){
        outEl.value=isNaN(temp)?'--':temp.toFixed(3)+' °C'+(isClamped?' (LIMIT)':'');
        outEl.style.color=isClamped?'var(--orange)':'var(--green)';
    }
    if(isClamped){
        const el2=document.getElementById('sensorRangeDisplay2');
        if(el2)el2.innerText=`Input outside physical limit → clamped to ${temp.toFixed(1)}°C`;
    }
    updateADCDisplay(raw, temp);
    calcSaveStateDebounced();
}

/* ============ CJC / LEAD R CHANGE ============ */
function calcOnCjcChange(){
    if(calibMode==='target'){
        calcCalibToRaw();
    }else{
        calcMvToTarget();
    }
    calcScheduleUpdate();
}

/* ============ APPLY CALIBRATION ============ */
function calcApplyCalib(){
    vibrate(20);
    const mode=calc$('sm').value;
    if(mode==='ma'||mode==='ma-rev')return;
    if(calcState.locked1){
        showToast('mA is locked!');
        return;
    }

    const cjcTemp=calcToNum(calc$('cjcTemp').value);
    const leadOhm=calc$('leadOhm')?calcToNum(calc$('leadOhm').value):0;
    const cjcVal=isNaN(cjcTemp)?0:cjcTemp;
    const leadVal=isNaN(leadOhm)?0:leadOhm;

    let target=NaN;
    let raw=NaN;

    if(calibMode==='target'){
        const rawTarget=calcToNum(calc$('calibTarget').value);
        if(isNaN(rawTarget))return;
        target=calcClampSensorTemp(mode, rawTarget);
        raw=calcSensorTempToRaw(mode, target, cjcVal, leadVal);
    }else{
        raw=calcToNum(calc$('calibSensorMv').value);
        if(isNaN(raw))return;
        target=calcSensorRawToTemp(mode, raw, cjcVal, leadVal);
    }

    if(isNaN(raw)||isNaN(target))return;

    const lrv=calcToNum(calc$('lrv').value),urv=calcToNum(calc$('urv').value);
    if(isNaN(lrv)||isNaN(urv))return;
    if(urv<=lrv){
        calcEl.rangeError.style.display='block';
        calcScheduleUpdate();
        return;
    }
    calcEl.rangeError.style.display='none';

    const fmMode=calc$('fm').value;
    const displayMA=calcInvertPVtoMA(target,lrv,urv,fmMode);
    if(isNaN(displayMA))return;
    calcEl.mi.value=displayMA.toFixed(3);
    calcState.lockVal1=displayMA;

    updateADCDisplay(raw, target);
    calcScheduleUpdate();
}

/* ============ UNIFIED FLOW COMPENSATION ENGINE ============ */
function calcGetFlowCompensation(fmMode){
    let cf=1;
    if(fmMode==='ol'){
        const tdR=calcToNum(calc$('td').value),
              taR=calcToNum(calc$('ta').value);
        if(!isNaN(tdR)&&!isNaN(taR)){
            const betaRaw=calc$('oilBeta')?calcToNum(calc$('oilBeta').value):NaN;
            const beta=(!isNaN(betaRaw)&&betaRaw>0)?betaRaw:0.00085;
            const denom=1+beta*(taR-tdR);
            if(denom<=0)return{cf:1,valid:false,reason:'Invalid Oil β·ΔT'};
            cf*=Math.sqrt(1/denom);
        }
    }else if(fmMode==='gs'){
        const tdR=calcToNum(calc$('td').value),
              taR=calcToNum(calc$('ta').value),
              pdR=calcToNum(calc$('pd').value),
              paR=calcToNum(calc$('pa').value);
        if(!isNaN(tdR)&&!isNaN(taR)){
            const Td=tdR+273.15,Ta=taR+273.15;
            if(Td<=0||Ta<=0)return{cf:1,valid:false,reason:'Temp must be > -273.15°C'};
            cf*=Math.sqrt(Td/Ta);
        }
        if(!isNaN(pdR)&&!isNaN(paR)){
            const Pd=pdR+1.01325,Pa=paR+1.01325;
            if(Pd<=0||Pa<=0)return{cf:1,valid:false,reason:'Abs pressure must be > 0'};
            cf*=Math.sqrt(Pa/Pd);
        }
    }

    if((fmMode==='dp'||fmMode==='ol'||fmMode==='gs')&&calc$('ffm').value==='on'){
        const ffcVal=calcToNum(calc$('ffc').value);
        const ff=(!isNaN(ffcVal)&&ffcVal>0)?ffcVal:100;
        cf*=(ff/100);
    }

    return{cf,valid:true,reason:''};
}

function calcComputePV(mA,lrv,urv,fmMode){
    const actionMode=(calc$('sm').value==='ma-rev')?'reverse':'direct';
    const dpPct=actionMode==='reverse'?(CALC_MA_MAX-mA)/CALC_MA_SPAN:(mA-CALC_MA_MIN)/CALC_MA_SPAN;
    const span=urv-lrv;

    if(fmMode==='ln'){
        return{result:lrv+dpPct*span,dpPct,flowPct:dpPct,cf:1,valid:true,reason:''};
    }

    const flowPct=Math.sqrt(Math.max(0,dpPct));
    const baseFlow=lrv+flowPct*span;
    const comp=calcGetFlowCompensation(fmMode);
    return{
        result:comp.valid?baseFlow*comp.cf:NaN,
        dpPct,
        flowPct,
        cf:comp.cf,
        valid:comp.valid,
        reason:comp.reason
    };
}

function calcInvertPVtoMA(pv,lrv,urv,fmMode){
    const span=urv-lrv;
    if(isNaN(pv)||span<=0)return NaN;
    const actionMode=(calc$('sm').value==='ma-rev')?'reverse':'direct';
    let rawPct;

    if(fmMode==='ln'){
        rawPct=(pv-lrv)/span;
    }else{
        const comp=calcGetFlowCompensation(fmMode);
        if(!comp.valid||comp.cf===0)return NaN;
        const baseFlow=pv/comp.cf;
        const flowRatio=(baseFlow-lrv)/span;
        const sign=flowRatio>=0?1:-1;
        rawPct=sign*flowRatio*flowRatio;
    }

    if(actionMode==='reverse')rawPct=1-rawPct;
    return calcClamp(CALC_MA_MIN+rawPct*CALC_MA_SPAN,2.5,22.5);
}

function calcSp(pct,btn){
    vibrate(15);
    const smVal=calc$('sm').value;
    if(calcState.locked1||(smVal!=='ma'&&smVal!=='ma-rev'))return;
    calcClearPctButtons();
    btn.classList.add('active');
    const isRev=(smVal==='ma-rev');
    const ma=isRev?(CALC_MA_MAX-(pct/100)*CALC_MA_SPAN):(CALC_MA_MIN+(pct/100)*CALC_MA_SPAN);
    calcEl.mi.value=ma.toFixed(3);
    calcState.lockVal1=ma;
    calcEl.actualPV.value='';
    if(calc$('dampingMode').value==='on')calcStartDampingLoop();
    else calcScheduleUpdate();
}
function calcOnMiInput(){
    const v=calcToNum(calcEl.mi.value);
    if(isNaN(v)){
        calcScheduleUpdate();
        return;
    }
    calcClearPctButtons();
    calcState.lockVal1=v;
    calcEl.actualPV.value='';
    if(calc$('dampingMode').value==='on')calcStartDampingLoop();
    else calcScheduleUpdate();
}
function calcActualToMA(){
    if(calcState.locked2||calcState.locked1){
        if(calcState.locked2)calcEl.actualPV.value=calcState.lockVal2.toFixed(2);
        return;
    }
    const pv=calcToNum(calcEl.actualPV.value.trim());
    if(isNaN(pv))return;
    const lrv=calcToNum(calc$('lrv').value),urv=calcToNum(calc$('urv').value);
    if(isNaN(lrv)||isNaN(urv)||urv<=lrv){
        calcScheduleUpdate();
        return;
    }
    const fmMode=calc$('fm').value;
    const maTarget=calcInvertPVtoMA(pv,lrv,urv,fmMode);
    if(isNaN(maTarget))return;

    calcEl.mi.value=maTarget.toFixed(3);
    calcState.lockVal1=maTarget;
    calcClearPctButtons();
    if(calc$('dampingMode').value==='on')calcStartDampingLoop();
    else{
        calcDampedValue=maTarget;
        calcScheduleUpdate();
    }
}
function calcTglF(){
    vibrate(15);
    const m=calc$('fm').value;
    const isFlow=(m==='dp'||m==='ol'||m==='gs');
    calc$('ca').style.display=isFlow?'block':'none';
    calc$('dpRangeBlock').style.display=isFlow?'block':'none';
    if(calc$('tempCompRow'))calc$('tempCompRow').style.display=(m==='ol'||m==='gs')?'flex':'none';
    if(calc$('oilBetaRow'))calc$('oilBetaRow').style.display=(m==='ol')?'flex':'none';
    calc$('go').style.display=(m==='gs')?'flex':'none';
    calc$('ff').style.display=isFlow?'flex':'none';
    calcBuildRegularButtons();
    calcScheduleUpdate();
}
function calcTglP(){
    vibrate(15);
    calc$('pp').style.display=calc$('pb').value==='hi'?'none':'block';
    calcScheduleUpdate();
}
function calcOnParamChange(){
    const unit=calc$('unit').value||'Unit';
    document.querySelectorAll('#customInputsContainer .custom-entry-unit').forEach(sp=>{
        sp.textContent=unit;
    });
    const rt=document.getElementById('customResultTable');
    if(rt&&rt.style.display!=='none'&&calcRefMode==='custom')calcApplyCustomPoints(true);
    const smVal=calc$('sm').value;
    if(smVal!=='ma'&&smVal!=='ma-rev'){
        if(calibMode==='target')calcCalibToRaw();
        else calcMvToTarget();
    }else{
        calcUpdateCalibUnitLabel();
    }
    if(calc$('dampingMode').value==='on')calcStartDampingLoop();
    else calcScheduleUpdate();
}
function calcToggleRefTable(){
    vibrate(15);
    const c=document.getElementById('refTableContent'),
          l=calc$('refTableLabel'),
          t=calc$('refTableToggle');
    if(c.style.display==='none'){
        c.style.display='';
        l.textContent='ON';
        t.classList.remove('calc-toggle-off');
    }else{
        c.style.display='none';
        l.textContent='OFF';
        t.classList.add('calc-toggle-off');
    }
    calcSaveStateDebounced();
}
function calcUpdateNamurUI(mA,namurResult){
    calcResetDisplayColors();
    calcSetLED(namurResult.status);
    if(namurResult.status==='fault'){
        calcEl.mi.style.borderColor='var(--red)';
        calcEl.mi.style.color='var(--red)';
        calcEl.pvVal.innerText=mA<=CALC_NAMUR.faultLow?'UNDER RANGE':'OVER RANGE';
        calcEl.pvVal.style.color='var(--red)';
        calcEl.pvUnit.innerText='';
        calcEl.pr.innerText='---';
        calcEl.tb.innerHTML='';
        calcEl.pctDisplay.innerText='Signal outside NAMUR NE43';
        if(calc$('dpInfoLine'))calc$('dpInfoLine').style.display='none';
        const pb=document.getElementById('progressBar');
        const dpb=document.getElementById('dpProgressBar');
        const flb=document.getElementById('flowProgressBar');
        if(pb)pb.style.width='0%';
        if(dpb)dpb.style.width='0%';
        if(flb)flb.style.width='0%';
        return true;
    }
    if(namurResult.status==='low'){
        calcEl.mi.style.borderColor='#ffcc00';
        calcEl.mi.style.color='#ffcc00';
        calcEl.pvVal.style.color='#ffcc00';
    }else if(namurResult.status==='high'){
        calcEl.mi.style.borderColor='#ff9500';
        calcEl.mi.style.color='#ff9500';
        calcEl.pvVal.style.color='#ff9500';
    }else{
        calcEl.pvVal.style.color='var(--green)';
    }
    return false;
}

/* ============ FINAL PV ============ */
function calcUpdateFinalPV(mA,lrv,urv,unit,fmMode){
    const pvData=calcComputePV(mA,lrv,urv,fmMode);
    if(!pvData.valid){
        calcEl.pvVal.innerText='COMP ERR';
        calcEl.pvVal.style.color='var(--red)';
        calcEl.pvUnit.innerText='';
        calcEl.pctDisplay.textContent=pvData.reason;
        return pvData.dpPct;
    }

    calcEl.pvVal.innerText=pvData.result.toFixed(2);
    calcEl.pvUnit.innerText=unit;

    const progressLinear=document.getElementById('progressLinear');
    const progressFlow=document.getElementById('progressFlow');
    const clampedPct=Math.max(0,Math.min(1,pvData.dpPct));
    const rawPct=pvData.dpPct;

    if(fmMode==='dp'||fmMode==='ol'||fmMode==='gs'){
        if(progressLinear)progressLinear.style.display='none';
        if(progressFlow)progressFlow.style.display='block';

        const flowPctVal=Math.min(1,pvData.flowPct);
        const dpBar=document.getElementById('dpProgressBar');
        const flowBar=document.getElementById('flowProgressBar');
        const dpPctEl=document.getElementById('dpPctDisplay');
        const flowPctEl=document.getElementById('flowPctDisplay');

        if(dpBar)dpBar.style.width=(clampedPct*100)+'%';
        if(flowBar)flowBar.style.width=(flowPctVal*100)+'%';
        if(dpPctEl)dpPctEl.textContent=(clampedPct*100).toFixed(0)+'%';
        if(flowPctEl)flowPctEl.textContent=(flowPctVal*100).toFixed(0)+'%';

        calcEl.pctDisplay.textContent='DP: '+(rawPct*100).toFixed(1)+'% | Flow: '+(flowPctVal*100).toFixed(1)+'%';
    }else{
        if(progressLinear)progressLinear.style.display='block';
        if(progressFlow)progressFlow.style.display='none';

        const bar=document.getElementById('progressBar');
        if(bar)bar.style.width=(clampedPct*100)+'%';
        calcEl.pctDisplay.textContent=(rawPct*100).toFixed(1)+'%';
    }

    const dpShowMode=calc$('dpShowMode')?calc$('dpShowMode').value:'off';
    if(fmMode!=='ln'&&dpShowMode==='on'){
        const dpLrvRaw=calc$('dpLrv')?calc$('dpLrv').value.trim():'';
        const dpUrvRaw=calc$('dpUrv')?calc$('dpUrv').value.trim():'';
        const dpLrvVal=dpLrvRaw===''?0:calcToNum(dpLrvRaw);
        const dpUrvVal=dpUrvRaw===''?100:calcToNum(dpUrvRaw);
        if(!isNaN(dpLrvVal)&&!isNaN(dpUrvVal)&&dpUrvVal>dpLrvVal){
            const dpActualInfo=dpLrvVal+pvData.dpPct*(dpUrvVal-dpLrvVal);
            const dpUnitVal=calc$('dpUnit')?calc$('dpUnit').value.trim():'';
            const dpUnit=dpUnitVal!==''?dpUnitVal:'mbar';
            if(calc$('dpInfoLine'))calc$('dpInfoLine').style.display='block';
            if(calc$('dpVal'))calc$('dpVal').innerText=dpActualInfo.toFixed(2);
            if(calc$('dpUnitDisplay'))calc$('dpUnitDisplay').innerText=dpUnit;
            if(calc$('cfInfoText'))calc$('cfInfoText').innerText='(CF: ×'+pvData.cf.toFixed(4)+')';
        }else{
            if(calc$('dpInfoLine'))calc$('dpInfoLine').style.display='none';
        }
    }else{
        if(calc$('dpInfoLine'))calc$('dpInfoLine').style.display='none';
    }

    return pvData.dpPct;
}

function calcUpdatePLCRegister(pctElecUncapped){
    const pbVal=calc$('pb').value;
    const plcRangeEl=document.getElementById('plcRangeDisplay');

    if(pbVal!=='hi'){
        let reg;
        let rangeText='';

        if(pbVal==='abraw'){
            reg=Math.round(CALC_AB_RAW_LOW+calcClamp(pctElecUncapped,0,1)*(CALC_AB_RAW_HIGH-CALC_AB_RAW_LOW));
            rangeText='Range: ' + CALC_AB_RAW_LOW.toLocaleString() + ' - ' + CALC_AB_RAW_HIGH.toLocaleString() + ' (AB Raw)';
        }else{
            const maxReg=pbVal==='27648'?CALC_SIEMENS_MAX:pbVal==='32767'?CALC_AB_MAX:CALC_MITSUBISHI_MAX;
            const plcName=pbVal==='27648'?'Siemens S7':pbVal==='32767'?'Allen Bradley':'Mitsubishi FX';
            reg=Math.round(calcClamp(pctElecUncapped,0,1)*maxReg);
            rangeText='Range: 0 - ' + maxReg.toLocaleString() + ' (' + plcName + ')';
        }

        calcEl.pr.innerText=reg.toLocaleString();
        if(plcRangeEl)plcRangeEl.innerText=rangeText;
    }
}
function calcUpdateTable(lrv,urv,unit,fmMode){
    const actionMode=(calc$('sm').value==='ma-rev')?'reverse':'direct';
    if(isNaN(lrv)||isNaN(urv)){
        calcEl.tb.innerHTML='';
        calcEl.thRaw.style.display='none';
        return;
    }
    const smR=calc$('sm').value;
    const cjcR=(smR==='tk'||smR==='ts'||smR==='tj')?calcToNum(calc$('cjcTemp').value):0;
    const leadR=(smR==='pt'&&calc$('leadOhm'))?calcToNum(calc$('leadOhm').value):0;
    const rawLabel=smR==='pt'?'Ω':(smR==='tk'||smR==='ts'||smR==='tj')?'mV':'';
    calcEl.thRaw.style.display=rawLabel?'':'none';
    calcEl.thRaw.textContent=rawLabel;

    const isFlow=(fmMode==='dp'||fmMode==='ol'||fmMode==='gs');
    let html='';
    CALC_TABLE_POINTS.forEach(p=>{
        const cp=isFlow?Math.pow(p/100,2):(p/100);
        const cm=actionMode==='reverse'?CALC_MA_MAX-cp*CALC_MA_SPAN:CALC_MA_MIN+cp*CALC_MA_SPAN;
        const pvData=calcComputePV(cm,lrv,urv,fmMode);
        const cr=pvData.result;

        let rawCell='';
        if(rawLabel){
            const rawVal=calcSensorTempToRaw(smR, cr, isNaN(cjcR)?0:cjcR, isNaN(leadR)?0:leadR);
            rawCell='<td class="calc-td">'+(isNaN(rawVal)?'--':rawVal.toFixed(3))+'</td>';
        }
        const pctLabel=isFlow?('F'+p+'%'):(p+'%');
        html+='<tr class="calc-tr"><td class="calc-td">'+pctLabel+'</td><td class="calc-td">'+cm.toFixed(2)+'</td><td class="calc-td">'+(isNaN(cr)?'ERR':cr.toFixed(2)+' '+unit)+'</td>'+rawCell+'</tr>';
    });
    calcEl.tb.innerHTML=html;
}
function calcUpd(){
    const mA=calcGetCurrentmA(),
          lrv=calcToNum(calc$('lrv').value),
          urv=calcToNum(calc$('urv').value),
          unit=calc$('unit').value||'Unit',
          fmMode=calc$('fm').value;
    calcEl.actualUnitLbl.textContent=unit;
    calcEl.rangeError.style.display=(!isNaN(lrv)&&!isNaN(urv)&&urv<=lrv)?'block':'none';

    if(isNaN(mA)){
        const pb=document.getElementById('progressBar');
        const dpb=document.getElementById('dpProgressBar');
        const flb=document.getElementById('flowProgressBar');
        if(pb)pb.style.width='0%';
        if(dpb)dpb.style.width='0%';
        if(flb)flb.style.width='0%';
        if(calc$('dpInfoLine'))calc$('dpInfoLine').style.display='none';

        calcEl.pvVal.innerText='---';
        calcEl.pvUnit.innerText='';
        calcEl.pctDisplay.innerText='0.0%';
        calcEl.tb.innerHTML='';
        calcEl.pr.innerText='0';
        calcSetLED('fault');
        return;
    }
    const namurResult=calcNamurStatus(mA);
    if(calcUpdateNamurUI(mA,namurResult))return;

    const elecPct=(mA-CALC_MA_MIN)/CALC_MA_SPAN;
    if(isNaN(lrv)||isNaN(urv)||urv<=lrv){
        const pb=document.getElementById('progressBar');
        const dpb=document.getElementById('dpProgressBar');
        const flb=document.getElementById('flowProgressBar');
        if(pb)pb.style.width='0%';
        if(dpb)dpb.style.width='0%';
        if(flb)flb.style.width='0%';
        if(calc$('dpPctDisplay'))calc$('dpPctDisplay').textContent='0%';
        if(calc$('flowPctDisplay'))calc$('flowPctDisplay').textContent='0%';
        if(calc$('dpInfoLine'))calc$('dpInfoLine').style.display='none';
        calcEl.pvVal.innerText='0.00';
        calcEl.pvUnit.innerText=unit;
        calcEl.pctDisplay.innerText='0.0%';
        calcEl.tb.innerHTML='';
        calcUpdatePLCRegister(elecPct);
        return;
    }
    calcUpdateFinalPV(mA,lrv,urv,unit,fmMode);
    calcUpdatePLCRegister(elecPct);
    if(calcRefMode==='standard')calcUpdateTable(lrv,urv,unit,fmMode);
    calcSaveStateDebounced();
}

/* ==================== REFERENCE TABLE ==================== */
function calcSetRefMode(mode){
    vibrate(15);
    calcRefMode=mode;
    document.getElementById('refModeStandard').classList.toggle('active',mode==='standard');
    document.getElementById('refModeCustom').classList.toggle('active',mode==='custom');
    document.getElementById('customRefPanel').style.display=mode==='custom'?'block':'none';
    document.getElementById('standardRefTable').style.display=mode==='standard'?'block':'none';
    if(mode==='custom'){
        calcBuildCustomInputs();
    }else{
        CALC_TABLE_POINTS=[0,25,50,75,100];
        calcScheduleUpdate();
    }
    calcSaveStateDebounced();
}
function calcBuildCustomInputs(){
    const count=parseInt(document.getElementById('customPointCount').value,10)||0;
    const container=document.getElementById('customInputsContainer');
    if(count===0){
        container.innerHTML='<div style="text-align:center;color:var(--text3);font-size:10px;padding:10px;">Select total points</div>';
        const rt=document.getElementById('customResultTable');
        if(rt)rt.style.display='none';
        return;
    }
    const unit=calc$('unit').value||'Unit';
    let html='';
    for(let i=1;i<=count;i++){
        const val=document.getElementById('customVal'+i)?.value||'';
        html+=`<div class="custom-entry-row"><span style="font-size:10px;color:var(--text3);min-width:48px;">Point ${i}</span><input type="text" id="customVal${i}" class="custom-entry-input" placeholder="0.00" value="${val}" oninput="calcSanitizeInput(this);calcSaveStateDebounced()" lang="en" inputmode="decimal"><span class="custom-entry-unit" style="font-size:10px;color:var(--text3);min-width:24px;">${unit}</span></div>`;
    }
    container.innerHTML=html;
}
function calcApplyCustomPoints(silent){
    if(!silent)vibrate(20);
    const count=parseInt(document.getElementById('customPointCount').value,10)||0;
    if(count===0){
        const rt=document.getElementById('customResultTable');
        if(rt)rt.style.display='none';
        return;
    }
    const lrv=calcToNum(calc$('lrv').value),
          urv=calcToNum(calc$('urv').value),
          unit=calc$('unit').value||'Unit',
          fmMode=calc$('fm').value,
          smR=calc$('sm').value;
    if(isNaN(lrv)||isNaN(urv)||urv<=lrv){
        const rt=document.getElementById('customResultTable');
        if(rt)rt.style.display='none';
        return;
    }
    const span=urv-lrv;
    const rawLabel=smR==='pt'?'Ω':(smR==='tk'||smR==='ts'||smR==='tj')?'mV':'';
    const cjcR=(smR==='tk'||smR==='ts'||smR==='tj')?calcToNum(calc$('cjcTemp').value):0;
    const leadR=(smR==='pt'&&calc$('leadOhm'))?calcToNum(calc$('leadOhm').value):0;
    const rawTh=rawLabel?`<th class="calc-th">${rawLabel}</th>`:'';
    let html=`<table class="calc-table"><thead><tr><th class="calc-th">INPUT</th><th class="calc-th">mA</th><th class="calc-th">% SPAN</th>${rawTh}</tr></thead><tbody>`;
    let hasData=false;
    for(let i=1;i<=count;i++){
        const el=document.getElementById('customVal'+i);
        if(!el)continue;
        const val=calcToNum(el.value);
        if(isNaN(val))continue;
        hasData=true;
        const mA=calcInvertPVtoMA(val,lrv,urv,fmMode);
        const pctSpan=((val-lrv)/span)*100;
        let rawTd='';
        if(rawLabel){
            const rawVal=calcSensorTempToRaw(smR, val, isNaN(cjcR)?0:cjcR, isNaN(leadR)?0:leadR);
            rawTd=`<td class="calc-td">${isNaN(rawVal)?'--':rawVal.toFixed(3)}</td>`;
        }
        html+=`<tr class="calc-tr"><td class="calc-td">${val.toFixed(2)} ${unit}</td><td class="calc-td">${isNaN(mA)?'--':mA.toFixed(3)}</td><td class="calc-td">${pctSpan.toFixed(1)}%</td>${rawTd}</tr>`;
    }
    html+='</tbody></table>';
    let rt=document.getElementById('customResultTable');
    if(!rt){
        rt=document.createElement('div');
        rt.id='customResultTable';
        rt.style.marginTop='10px';
        document.getElementById('customRefPanel').appendChild(rt);
    }
    if(hasData){
        rt.innerHTML=html;
        rt.style.display='block';
    }else{
        rt.style.display='none';
    }
    calcSaveStateDebounced();
}
function calcClr(){
    vibrate(50);
    ['lrv','urv','mi','cjcTemp','leadOhm','td','ta','pd','pa','actualPV','damping','ffc','calibTarget','calibSensorMv','dpLrv','dpUrv','dpUnit'].forEach(id=>{
        const e=calc$(id);
        if(e)e.value='';
    });
    calcState.lockVal1=CALC_MA_MIN;
    calcState.locked1=false;
    calcEl.lockBtn1.textContent='🔓';
    calcEl.lockBtn1.classList.remove('locked');
    calcState.lockVal2=0;
    calcState.locked2=false;
    calcEl.lockBtn2.textContent='🔓';
    calcEl.lockBtn2.classList.remove('locked');

    if(calc$('oilBeta'))calc$('oilBeta').value='0.00085';
    if(calc$('leadOhm'))calc$('leadOhm').value='0';
    calc$('cjcTemp').value='25';
    calc$('unit').value='';
    calc$('ffm').value='off';
    calc$('damping').value='0';
    calc$('dampingMode').value='off';
    calc$('dpShowMode').value='off';
    if(calc$('dpInfoLine'))calc$('dpInfoLine').style.display='none';
    calcDampingActive=false;
    calcDampedValue=CALC_MA_MIN;
    calcStopDampingLoop();
    calcEl.dampedDisplay.textContent='';
    calcClearPctButtons();
    calc$('pp').style.display='none';
    calc$('pb').value='hi';
    calc$('fm').value='ln';
    calcTglF();
    calc$('sm').value='ma';
    calcTglS();
    calcEl.mi.disabled=false;
    calcEl.actualPV.disabled=false;
    calcEl.pvVal.innerText='0.00';
    calcEl.pvUnit.innerText='';
    calcEl.pr.innerText='0';
    calcEl.pctDisplay.innerText='0.0%';
    calcEl.tb.innerHTML='';
    calcEl.rangeError.style.display='none';
    calc$('cjcBox').style.display='none';
    document.querySelectorAll('#tab-calc .calc-btn-pct').forEach(b=>b.disabled=false);
    calcEl.actualPVbox.style.display='flex';
    calcBuildRegularButtons();
    calcResetNamurState();
    calcResetDamping();

    if(document.getElementById('customPointCount')){
        document.getElementById('customPointCount').value='0';
    }
    calcBuildCustomInputs();
    const rt=document.getElementById('customResultTable');
    if(rt){rt.innerHTML='';rt.style.display='none';}

    const pb=document.getElementById('progressBar');
    const dpb=document.getElementById('dpProgressBar');
    const flb=document.getElementById('flowProgressBar');
    if(pb)pb.style.width='0%';
    if(dpb)dpb.style.width='0%';
    if(flb)flb.style.width='0%';

    updateADCDisplay(NaN,NaN);
    updateSensorRangeDisplay('');
    const plcRangeEl=document.getElementById('plcRangeDisplay');
    if(plcRangeEl)plcRangeEl.innerText='';
    calcSetCalibMode('target');
    const ci=document.getElementById('convInput'),
          cr=document.getElementById('convResult'),
          cu=document.getElementById('convToUnit'),
          cb=document.getElementById('convResultBox');
    if(ci)ci.value='';
    if(cr)cr.innerText='0.00';
    if(cu)cu.innerText='kPa';
    if(cb)cb.classList.remove('active');
    try{localStorage.removeItem('calc_state');}catch(e){}
    calcScheduleUpdate();
    showToast('Calculator data cleared');
}

/* ==================== LOG ENGINE ==================== */
function logGetCJ(){
    const m=log$('log-vMode').value;
    if(m!=='tk'&&m!=='ts'&&m!=='tj')return 0;
    const cjInput=log$('log-coldJunction');
    const cj=parseFloat(cjInput?.value);
    return isNaN(cj)?0:cj;
}
function logGetLead(){
    const m=log$('log-vMode').value;
    if(m!=='pt')return 0;
    const leadInput=log$('log-leadOhm');
    const l=parseFloat(leadInput?.value);
    return isNaN(l)?0:l;
}
const log$=id=>document.getElementById(id);
let logCurrentDir='up',logCurrentState='found',logTolMode='none',logData=[];
let logConfirmTimer=null,logConfirmState=null;
const logClampMap={
    ma:{min:3.6,max:21.0,unit:'mA'},
    'dp-flow':{min:3.6,max:21.0,unit:'mA'},
    pt:{min:18.52,max:390.48,unit:'Ω'},
    tk:{min:-6.458,max:54.886,unit:'mV'},
    ts:{min:-0.236,max:18.693,unit:'mV'},
    tj:{min:-8.095,max:69.553,unit:'mV'}
};

function logSetDir(d){
    vibrate(15);
    logCurrentDir=d;
    log$('log-dirUp').classList.toggle('active',d==='up');
    log$('log-dirDown').classList.toggle('active',d==='down');
}
function logSetState(s){
    vibrate(15);
    logCurrentState=s;
    log$('log-stateFound').classList.toggle('found-active',s==='found');
    log$('log-stateLeft').classList.toggle('active',s==='left');
}
function logSetTolMode(mode){
    vibrate(15);
    logTolMode=mode;
    log$('log-tolModeNone').classList.toggle('active',mode==='none');
    log$('log-tolModeActive').classList.toggle('active',mode==='active');
    log$('log-tolInputRow').style.display=mode==='active'?'flex':'none';
    log$('log-tolValue').disabled=mode==='none';
    logUpdateTolUnit();
    logRebuildTable();
    logDrawChart();
    logSaveSettings();
}
function logGetTolValue(){
    if(logTolMode==='none')return null;
    const v=parseFloat(log$('log-tolValue').value);
    return isNaN(v)||v<=0?null:v;
}
function logGetTolUnit(){
    return log$('log-unit').value||'UNIT';
}
function logUpdateTolUnit(){
    log$('log-tolUnitDisplay').innerText=logGetTolUnit();
}
function logGetDispUnit(){
    return log$('log-unit').value||'UNIT';
}
function logLsSet(k,v){
    try{localStorage.setItem('log_'+k,JSON.stringify(v));}catch(e){}
}
function logLsGet(k,fb){
    try{
        const r=localStorage.getItem('log_'+k);
        if(r===null||r===undefined)return fb;
        const p=JSON.parse(r);
        return(p!==null&&p!==undefined)?p:fb;
    }catch(e){return fb;}
}
function logSaveSettings(){
    logLsSet('settings',{
        lrv:log$('log-lrv').value,
        urv:log$('log-urv').value,
        unit:log$('log-unit').value,
        mode:log$('log-vMode').value,
        tech:log$('log-tech').value,
        tag:log$('log-tag').value,
        sn:log$('log-sn').value,
        area:log$('log-area').value,
        date:log$('log-date').value,
        cj:log$('log-coldJunction')?.value||'',
        leadOhm:log$('log-leadOhm')?.value||'0',
        tolMode:logTolMode,
        tolValue:log$('log-tolValue').value
    });
}
function logLoadSettings(){
    let s=logLsGet('settings',{});
    if(!s||typeof s!=='object')s={};
    log$('log-tech').value=s.tech||'';
    log$('log-tag').value=s.tag||'';
    log$('log-sn').value=s.sn||'';
    log$('log-area').value=s.area||'';
    log$('log-lrv').value=s.lrv!==undefined?s.lrv:'';
    log$('log-urv').value=s.urv!==undefined?s.urv:'';
    log$('log-unit').value=s.unit||'';
    log$('log-vMode').value=s.mode||'ma';
    if(log$('log-coldJunction'))log$('log-coldJunction').value=s.cj||'';
    if(log$('log-leadOhm'))log$('log-leadOhm').value=s.leadOhm||'0';
    if(s.date)log$('log-date').value=s.date;
    if(s.tolValue!==undefined)log$('log-tolValue').value=s.tolValue;
    logTolMode=s.tolMode||'none';
    logSetTolMode(logTolMode);
    logUpdateTolUnit();
}
function logSaveLogs(){
    logLsSet('logs',logData);
}
function logLoadLogs(){
    logData=logLsGet('logs',[]);
    logRebuildTable();
    logDrawChart();
}
function logResetConfirmButtons(){
    clearTimeout(logConfirmTimer);
    logConfirmState=null;
    const b1=log$('log-btnClear'),b2=log$('log-btnResetAll');
    if(b1)b1.textContent='RESET LOG ONLY';
    if(b2)b2.textContent='RESET ALL SETTINGS';
}
function logClearLogs(){
    vibrate(30);
    if(logConfirmState!=='clear'){
        logResetConfirmButtons();
        logConfirmState='clear';
        log$('log-btnClear').textContent='TAP AGAIN TO CONFIRM CLEAR LOG';
        logConfirmTimer=setTimeout(logResetConfirmButtons,3500);
        return;
    }
    logResetConfirmButtons();
    logData=[];
    logSaveLogs();
    logRebuildTable();
    log$('log-actIn').value='';
    log$('log-maMeasured').value='';
    log$('log-convOut').innerText='';
    log$('log-maIdeal').innerText='---';
    log$('log-unitIdeal').innerText='';
    if(log$('log-measWarn'))log$('log-measWarn').style.display='none';
    logAutoStepActive=false;
    logAutoStepIdx=-1;
    logResetAutoBtn();
    logDrawChart();
    showToast('Log measurement cleared');
}
function logResetAll(){
    vibrate(50);
    if(logConfirmState!=='all'){
        logResetConfirmButtons();
        logConfirmState='all';
        log$('log-btnResetAll').textContent='TAP AGAIN TO RESET ALL DATA';
        logConfirmTimer=setTimeout(logResetConfirmButtons,3500);
        return;
    }
    logResetConfirmButtons();
    try{localStorage.removeItem('log_settings');}catch(e){}
    try{localStorage.removeItem('log_logs');}catch(e){}
    ['log-tech','log-tag','log-sn','log-area','log-lrv','log-urv','log-unit','log-actIn','log-maMeasured'].forEach(id=>log$(id).value='');
    log$('log-vMode').value='ma';
    if(log$('log-coldJunction'))log$('log-coldJunction').value='';
    if(log$('log-leadOhm'))log$('log-leadOhm').value='0';
    log$('log-convOut').innerText='';
    log$('log-maIdeal').innerText='---';
    log$('log-unitIdeal').innerText='';
    if(log$('log-measWarn'))log$('log-measWarn').style.display='none';
    const today=new Date();
    log$('log-date').value=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    logCurrentDir='up';
    logCurrentState='found';
    logTolMode='none';
    log$('log-tolValue').value='';
    log$('log-dirUp').classList.add('active');
    log$('log-dirDown').classList.remove('active');
    log$('log-stateFound').classList.add('found-active');
    log$('log-stateLeft').classList.remove('active');
    logSetTolMode('none');
    logData=[];
    logRebuildTable();
    logAutoStepActive=false;
    logAutoStepIdx=-1;
    logResetAutoBtn();
    log$('log-validationMsg').style.display='none';
    logUpdateTolUnit();
    logChgMode();
    logDrawChart();
    showToast('All log data reset');
}
function logRebuildTable(){
    log$('log-logBody').innerHTML='';
    logData.forEach((l,idx)=>logAppendRow(l,idx));
    logUpdateLiveMetrics();
}

function logTolToPct(){
    const tolVal = logGetTolValue();
    if (tolVal === null) return null;
    const span = logGetSpan();
    if (isNaN(span) || span <= 0) return null;
    return (tolVal / span) * 100;
}

function logAppendRow(l,idx){
    const body=log$('log-logBody'),
          row=body.insertRow(-1);
    row.className='log-tr';
    const tolPct = logTolToPct();
    const errNum = parseFloat(l.err);
    let status='-',statusClass='';
    if (tolPct !== null) {
        const passed = Math.abs(errNum) <= tolPct;
        status = passed ? 'PASS' : 'FAIL';
        statusClass = passed ? 'pass' : 'fail';
    }
    const stateCode=(l.state==='AL')?'AL':'AF';
    const stateClass=(stateCode==='AL')?'al':'af';
    row.innerHTML=`<td class="log-td ${stateClass}">${stateCode}</td><td class="log-td">${l.dir}</td><td class="log-td">${l.act}</td><td class="log-td">${parseFloat(l.meas).toFixed(3)}</td><td class="log-td">${parseFloat(l.pv).toFixed(3)}</td><td class="log-td">${parseFloat(l.target).toFixed(3)}</td><td class="log-td" style="color:${tolPct!==null?(Math.abs(errNum)<=tolPct?'var(--green)':'var(--red)'):'var(--text3)'}">${l.err}%</td><td class="log-td ${statusClass}">${status}</td><td class="log-td log-no-print"><button class="log-btn-del-box" onclick="logDeleteRow(${idx})">x</button></td>`;
}
function logDeleteRow(idx){
    vibrate(20);
    logData.splice(idx,1);
    logSaveLogs();
    logRebuildTable();
    logDrawChart();
}
function logComputeSummaryMetrics(){
    const afRows=logData.filter(d=>(d.state||'AF')==='AF');
    const alRows=logData.filter(d=>d.state==='AL');
    const tolPct=logTolToPct();
    const maxAbsErr=logData.reduce((m,d)=>Math.max(m,Math.abs(parseFloat(d.err)||0)),0);

    let maxHyst=0,hasHyst=false;
    const ups=logData.filter(d=>d.dir==='▲');
    const downs=logData.filter(d=>d.dir==='▼');
    ups.forEach(u=>{
        downs.forEach(dw=>{
            if((u.state||'AF')===(dw.state||'AF')&&Math.abs(parseFloat(u.act)-parseFloat(dw.act))<1e-3){
                hasHyst=true;
                maxHyst=Math.max(maxHyst,Math.abs(parseFloat(u.err)-parseFloat(dw.err)));
            }
        });
    });

    const evalSet=(rows)=>{
        if(rows.length===0||tolPct===null)return null;
        const pass=rows.filter(r=>Math.abs(parseFloat(r.err))<=tolPct).length;
        return{pass,total:rows.length,allPass:pass===rows.length};
    };

    return{
        total:logData.length,
        tolPct,
        maxAbsErr,
        maxHyst,
        hasHyst,
        afEval:evalSet(afRows),
        alEval:evalSet(alRows),
        allEval:evalSet(logData)
    };
}
function logUpdateLiveMetrics(){
    const box=log$('log-liveMetrics');
    if(!box)return;
    if(logData.length===0){
        box.style.display='none';
        return;
    }
    const m=logComputeSummaryMetrics();
    box.style.display='flex';
    const afTxt=m.afEval?`${m.afEval.pass}/${m.afEval.total}`:'—';
    const alTxt=m.alEval?`${m.alEval.pass}/${m.alEval.total}`:'—';
    box.innerHTML=
        `<div><div style="font-size:8.5px;color:var(--text3);">MAX ERR</div><div style="font-weight:bold;">${m.maxAbsErr.toFixed(3)}%</div></div>`+
        `<div><div style="font-size:8.5px;color:var(--text3);">HYSTERESIS</div><div style="font-weight:bold;color:var(--blue);">${m.hasHyst?m.maxHyst.toFixed(3)+'%':'N/A'}</div></div>`+
        `<div><div style="font-size:8.5px;color:var(--text3);">AS FOUND</div><div style="font-weight:bold;color:${!m.afEval?'var(--text3)':m.afEval.allPass?'var(--green)':'var(--red)'};">${afTxt}</div></div>`+
        `<div><div style="font-size:8.5px;color:var(--text3);">AS LEFT</div><div style="font-weight:bold;color:${!m.alEval?'var(--text3)':m.alEval.allPass?'var(--green)':'var(--red)'};">${alTxt}</div></div>`;
}

function logValidateRange(){
    const lrv=parseFloat(log$('log-lrv').value),
          urv=parseFloat(log$('log-urv').value);
    if(isNaN(lrv)||isNaN(urv)||urv<=lrv){
        log$('log-validationMsg').style.display='block';
        return false;
    }
    log$('log-validationMsg').style.display='none';
    return true;
}
function logGetSpan(){
    const lrv=parseFloat(log$('log-lrv').value),
          urv=parseFloat(log$('log-urv').value);
    if(isNaN(lrv)||isNaN(urv))return NaN;
    return urv-lrv;
}
function logChgMode(){
    vibrate(15);
    const m=log$('log-vMode').value;
    log$('log-cjRow').style.display=(m==='tk'||m==='ts'||m==='tj')?'flex':'none';
    if(log$('log-leadRow'))log$('log-leadRow').style.display=(m==='pt')?'flex':'none';
    const unitInput=log$('log-unit');
    if(m==='ma'||m==='dp-flow'){
        unitInput.disabled=false;
        unitInput.style.background='var(--input)';
        unitInput.style.borderColor='var(--border2)';
        if(unitInput.value==='°C'||unitInput.value==='Ω'||unitInput.value==='mV'){
            unitInput.value='';
        }
    }else{
        unitInput.value='°C';
        unitInput.disabled=true;
        unitInput.style.background='var(--card)';
        unitInput.style.borderColor='var(--gold)';
    }
    log$('log-clampMsg').innerText=logGetClampMsg();
    logUpdateTolUnit();
    logUpd();
    logDrawChart();
    logSaveSettings();
}
function logGetClampMsg(){
    const m=log$('log-vMode').value,
          c=logClampMap[m];
    let msg=c?`Sensor range: ${c.min}–${c.max} ${c.unit}`:'';
    if(m==='tk'||m==='ts'||m==='tj'){
        const cjVal=logGetCJ();
        msg+=` | CJC: ${cjVal.toFixed(1)}°C`;
    }else if(m==='pt'){
        const lVal=logGetLead();
        if(lVal!==0)msg+=` | Lead: ${lVal.toFixed(2)}Ω`;
    }
    return msg;
}
function logGetTarget(act){
    const m=log$('log-vMode').value;
    const lrv=parseFloat(log$('log-lrv').value);
    const s=logGetSpan();
    if(isNaN(lrv)||isNaN(s)||s<=0)return NaN;
    if(m==='ma'){
        return((act-lrv)/s)*16+4;
    }
    if(m==='dp-flow'){
        const f=(act-lrv)/s;
        const sign=f>=0?1:-1;
        return 4+sign*f*f*16;
    }
    if(m==='pt')return calcPT100_TtoR(act,logGetLead());
    if(m==='tk'||m==='ts'||m==='tj')return calcSensorTempToRaw(m,act,logGetCJ(),0);
    return NaN;
}
function logGetPV(meas){
    const m=log$('log-vMode').value;
    const lrv=parseFloat(log$('log-lrv').value);
    const s=logGetSpan();
    if(isNaN(lrv)||isNaN(s)||s<=0)return NaN;
    if(m==='ma'){
        return((meas-4)/16)*s+lrv;
    }
    if(m==='dp-flow'){
        const frac=(meas-4)/16;
        const root=frac>=0?Math.sqrt(frac):-Math.sqrt(-frac);
        return lrv+root*s;
    }
    if(m==='pt')return calcPT100_RtoT(meas,logGetLead());
    if(m==='tk'||m==='ts'||m==='tj')return calcSensorRawToTemp(m,meas,logGetCJ(),0);
    return NaN;
}
function logUpd(){
    const m=log$('log-vMode').value,
          act=parseFloat(log$('log-actIn').value);
    const unit=logGetDispUnit(),
          uOut=((m==='ma'||m==='dp-flow')?'mA':m==='pt'?'Ω':'mV');
    log$('log-th-in').innerText=`INPUT (${unit})`;
    log$('log-th-meas').innerText=`MEAS (${uOut})`;
    log$('log-th-pv').innerText=`PV (${unit})`;
    log$('log-th-tar').innerText=`TARGET (${uOut})`;
    log$('log-clampMsg').innerText=logGetClampMsg();

    if(!logValidateRange()){
        log$('log-maIdeal').innerText="ERR";
        return;
    }
    if(isNaN(act)){
        log$('log-maIdeal').innerText="---";
        log$('log-unitIdeal').innerText=uOut;
        return;
    }
    const ideal=logGetTarget(act);
    if(isNaN(ideal)){
        log$('log-maIdeal').innerText="ERR";
        return;
    }
    log$('log-maIdeal').innerText=ideal.toFixed(4);
    log$('log-unitIdeal').innerText=uOut;
    logConvLive();
}
function logConvLive(){
    const meas=parseFloat(log$('log-maMeasured').value),
          unit=logGetDispUnit(),
          m=log$('log-vMode').value,
          warnEl=log$('log-measWarn');
    if(isNaN(meas)){
        log$('log-convOut').innerText="";
        if(warnEl)warnEl.style.display='none';
        return;
    }
    const c=logClampMap[m];
    if(warnEl&&c&&(meas<c.min||meas>c.max)){
        warnEl.textContent=`Warning: ${meas} ${c.unit} outside sensor/NAMUR limit (${c.min}–${c.max} ${c.unit})`;
        warnEl.style.display='block';
    }else if(warnEl){
        warnEl.style.display='none';
    }
    const pv=logGetPV(meas);
    log$('log-convOut').innerText=!isNaN(pv)?"≈ "+pv.toFixed(3)+" "+unit:"";
}
function logAddLog(){
    vibrate(25);
    if(!logValidateRange()){
        showToast("LRV & URV invalid (URV > LRV)");
        return;
    }
    const act=parseFloat(log$('log-actIn').value),
          meas=parseFloat(log$('log-maMeasured').value);
    if(isNaN(act)||isNaN(meas)){
        showToast("Fill Input Reference & Measured Output");
        return;
    }
    const ideal=logGetTarget(act),
          pv=logGetPV(meas);
    if(isNaN(ideal)||isNaN(pv))return;
    const s=logGetSpan();
    if(isNaN(s)||s<=0){
        showToast("Span must be > 0");
        return;
    }
    const err=((pv-act)/s)*100;
    logData.push({
        state:logCurrentState==='found'?'AF':'AL',
        dir:logCurrentDir==='up'?'▲':'▼',
        act:act,
        meas:meas.toFixed(4),
        pv:pv.toFixed(3),
        target:ideal.toFixed(4),
        err:err.toFixed(3)
    });
    logAppendRow(logData[logData.length-1],logData.length-1);
    logUpdateLiveMetrics();
    log$('log-actIn').value="";
    log$('log-maMeasured').value="";
    log$('log-convOut').innerText="";
    if(log$('log-measWarn'))log$('log-measWarn').style.display='none';
    logUpd();
    logSaveLogs();
    logDrawChart();
    if (logAutoStepActive) logAdvanceAutoStep();
}
const LOG_STEPS_UP=[0,25,50,75,100];
const LOG_STEPS_DOWN=[100,75,50,25,0];
let logAutoStepIdx=-1,logAutoStepActive=false,logActiveSteps=LOG_STEPS_UP;
function logResetAutoBtn(){
    const btn=log$('log-btnAuto');
    btn.innerText='AUTO STEP (0%–100%)';
    btn.classList.remove('running');
}
function logAutoStep(){
    vibrate(20);
    if(logAutoStepActive){
        logAutoStepActive=false;
        logAutoStepIdx=-1;
        log$('log-actIn').value='';
        log$('log-maMeasured').value='';
        log$('log-convOut').innerText='';
        logResetAutoBtn();
        logUpd();
        showToast('Auto Step cancelled');
        return;
    }
    if(!logValidateRange()){
        showToast("URV must be greater than LRV");
        return;
    }
    const lrv=parseFloat(log$('log-lrv').value),
          s=logGetSpan();
    if(isNaN(lrv)||isNaN(s)||s<=0){
        showToast("Span must be > 0");
        return;
    }
    logActiveSteps=(logCurrentDir==='down')?LOG_STEPS_DOWN:LOG_STEPS_UP;
    logAutoStepIdx=0;
    logAutoStepActive=true;
    logSetAutoRef(lrv,s,0);
}
function logSetAutoRef(lrv,s,i){
    const ref=Number((lrv+(s*logActiveSteps[i]/100)).toFixed(4));
    log$('log-actIn').value=ref;
    log$('log-maMeasured').value='';
    log$('log-convOut').innerText='';
    logUpd();
    const btn=log$('log-btnAuto');
    btn.innerText=`AUTO STEP ${logActiveSteps[i]}% (${i+1}/5) — TAP TO STOP`;
    btn.classList.add('running');
    log$('log-maMeasured').focus();
}
function logAdvanceAutoStep(){
    const lrv=parseFloat(log$('log-lrv').value),
          s=logGetSpan();
    logAutoStepIdx++;
    if(logAutoStepIdx>=logActiveSteps.length){
        logAutoStepActive=false;
        logAutoStepIdx=-1;
        logResetAutoBtn();
        showToast('Auto Step complete (5/5)');
        return;
    }
    logSetAutoRef(lrv,s,logAutoStepIdx);
}
let logChartRaf=null;
function logDrawChart(){
    if(logChartRaf)cancelAnimationFrame(logChartRaf);
    logChartRaf=requestAnimationFrame(log_drawChart);
}
function log_drawChart(){
    logChartRaf=null;
    const cvs=log$('log-errorChart');
    if(!cvs)return;
    const ctx=cvs.getContext('2d');
    const container=cvs.parentElement;
    const w=cvs.width=Math.max(280,(container.offsetWidth||360)-24);
    const h=cvs.height=Math.max(165,Math.round(w*0.42));
    const mrg={top:16,right:15,bottom:28,left:44},
          pw=w-mrg.left-mrg.right,
          ph=h-mrg.top-mrg.bottom;
    const isPrint=window._printing===true;

    const cs=getComputedStyle(document.documentElement);
    const colBg=isPrint?'#ffffff':(cs.getPropertyValue('--card').trim()||'#1a1a1a');
    const colBorder=isPrint?'#000000':(cs.getPropertyValue('--border2').trim()||'#333333');
    const colGrid=isPrint?'#dddddd':(cs.getPropertyValue('--border2').trim()||'#333333');
    const colText=isPrint?'#333333':(cs.getPropertyValue('--text3').trim()||'#9a9a9a');

    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=colBg;
    ctx.fillRect(0,0,w,h);
    ctx.strokeStyle=colBorder;
    ctx.lineWidth=isPrint?1.5:1;
    ctx.strokeRect(0.5,0.5,w-1,h-1);

    const midY=mrg.top+ph/2;
    const tolPct=logTolToPct();
    const maxDataErr=logData.reduce((m,d)=>Math.max(m,Math.abs(parseFloat(d.err)||0)),0);
    const maxNeeded=Math.max(maxDataErr*1.15,(tolPct||0)*1.25,2.0);
    const yHalfMax=maxNeeded<=2.5?2.5:maxNeeded<=5?5:maxNeeded<=10?10:Math.ceil(maxNeeded/5)*5;
    const yToPx=(errPct)=>midY-(errPct/yHalfMax)*(ph/2);

    ctx.font='600 9px sans-serif';
    ctx.textAlign='right';
    [-yHalfMax,-yHalfMax/2,0,yHalfMax/2,yHalfMax].forEach(v=>{
        const y=yToPx(v);
        ctx.strokeStyle=v===0?colText:colGrid;
        ctx.lineWidth=v===0?0.9:0.5;
        ctx.beginPath();
        ctx.moveTo(mrg.left,y);
        ctx.lineTo(w-mrg.right,y);
        ctx.stroke();

        ctx.fillStyle=colText;
        ctx.fillText((v>0?'+':'')+Number(v.toFixed(2))+'%',mrg.left-5,y+3);
    });

    if(tolPct!==null&&tolPct>0){
        const x1=mrg.left,x2=mrg.left+pw;
        const yTop=yToPx(tolPct),yBot=yToPx(-tolPct);
        ctx.strokeStyle='#ff9500';
        ctx.lineWidth=1.2;
        ctx.setLineDash([4,4]);
        ctx.beginPath();ctx.moveTo(x1,yTop);ctx.lineTo(x2,yTop);ctx.stroke();
        ctx.beginPath();ctx.moveTo(x1,yBot);ctx.lineTo(x2,yBot);ctx.stroke();
        ctx.setLineDash([]);
    }

    ctx.strokeStyle=isPrint?'#000000':colText;
    ctx.lineWidth=1.2;
    ctx.beginPath();
    ctx.moveTo(mrg.left,h-mrg.bottom);
    ctx.lineTo(w-mrg.right,h-mrg.bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mrg.left,mrg.top);
    ctx.lineTo(mrg.left,h-mrg.bottom);
    ctx.stroke();

    if(logData.length===0){
        ctx.fillStyle=colText;
        ctx.font='600 11px sans-serif';
        ctx.textAlign='center';
        ctx.fillText('No data points recorded',mrg.left+pw/2,midY-10);
        return;
    }

    const lrv=parseFloat(log$('log-lrv').value),urv=parseFloat(log$('log-urv').value);
    const hasRange=!isNaN(lrv)&&!isNaN(urv)&&urv>lrv;
    const minData=Math.min(...logData.map(d=>parseFloat(d.act)));
    const maxData=Math.max(...logData.map(d=>parseFloat(d.act)));
    const xMin=hasRange?Math.min(lrv,minData):minData;
    const xMax=hasRange?Math.max(urv,maxData):maxData;
    const xSpan=xMax-xMin;
    const xToPx=(actVal)=>xSpan>0?mrg.left+((actVal-xMin)/xSpan)*pw:mrg.left+pw/2;

    ctx.fillStyle=colText;
    ctx.font='600 8.5px sans-serif';
    ctx.textAlign='center';
    [0,0.25,0.5,0.75,1].forEach(frac=>{
        const ref=xMin+xSpan*frac;
        ctx.fillText(ref.toFixed(1),mrg.left+pw*frac,h-7);
    });

    const drawSeries=(dirChar,color)=>{
        const pts=logData.filter(d=>d.dir===dirChar).slice().sort((a,b)=>a.act-b.act);
        if(pts.length===0)return;
        if(pts.length>1){
            ctx.strokeStyle=color;
            ctx.lineWidth=1.4;
            ctx.beginPath();
            pts.forEach((d,i)=>{
                const x=xToPx(parseFloat(d.act));
                const y=Math.max(mrg.top,Math.min(h-mrg.bottom,yToPx(parseFloat(d.err))));
                if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
            });
            ctx.stroke();
        }
        pts.forEach(d=>{
            const x=xToPx(parseFloat(d.act));
            const y=Math.max(mrg.top,Math.min(h-mrg.bottom,yToPx(parseFloat(d.err))));
            ctx.beginPath();
            ctx.arc(x,y,4,0,Math.PI*2);
            ctx.fillStyle=color;
            ctx.fill();
            ctx.strokeStyle=isPrint?'#000000':'#ffffff';
            ctx.lineWidth=1;
            ctx.stroke();
        });
    };
    drawSeries('▲','#00d4ff');
    drawSeries('▼','#ff3b30');
}
function logSavePdf(){
    vibrate(30);
    const tech=log$('log-tech').value||"-";
    const tag=log$('log-tag').value||"-";
    const sn=log$('log-sn').value||"-";
    const area=log$('log-area').value||"-";
    const range=(log$('log-lrv').value||"0")+" to "+(log$('log-urv').value||"0")+" "+(log$('log-unit').value||"");
    const d=log$('log-date').value;
    let formattedDate="-";
    if(d){
        const[y,m,day]=d.split("-");
        formattedDate=`${day}-${m}-${y}`;
    }

    log$('log-p-tech').innerText=tech;
    log$('log-p-tag').innerText=tag;
    log$('log-p-sn').innerText=sn;
    log$('log-p-area').innerText=area;
    log$('log-p-range').innerText=range;
    log$('log-p-date').innerText=formattedDate;

    const tolVal=logGetTolValue(),
          tolUnit=logGetTolUnit();
    const sum=logComputeSummaryMetrics();
    const toleranceText=tolVal!==null
        ?`± ${tolVal} ${tolUnit}`+(sum.tolPct!==null?` (±${sum.tolPct.toFixed(2)}% Span)`:'')
        :'VERIFICATION ONLY';

    if(tolVal!==null){
        log$('log-p-tolerance').innerText=toleranceText;
        log$('log-p-tolerance').style.color='#000';
    }else{
        log$('log-p-tolerance').innerText='VERIFICATION ONLY';
        log$('log-p-tolerance').style.color='#666';
    }

    const extraStats=`Max Err: ${sum.maxAbsErr.toFixed(3)}%`+(sum.hasHyst?` | Hysteresis: ${sum.maxHyst.toFixed(3)}%`:'');
    let summaryResultText='NO DATA';
    let summaryOk=null;
    let summaryDetailText='No verification points recorded.';

    if(sum.total===0){
        log$('log-p-summary-result').innerHTML='<span style="color:#333;">NO DATA</span>';
        log$('log-p-summary-detail').innerText=summaryDetailText;
    }else if(sum.tolPct===null){
        summaryResultText='VERIFICATION ONLY';
        summaryDetailText=`${sum.total} points recorded | ${extraStats}`;
        log$('log-p-summary-result').innerHTML='<span style="color:#333;">VERIFICATION ONLY</span>';
        log$('log-p-summary-detail').innerHTML=`<span style="color:#333;">${summaryDetailText}</span>`;
    }else{
        const finalEval=sum.alEval||sum.afEval||sum.allEval;
        const ok=finalEval.allPass,
              pct=Math.round((finalEval.pass/finalEval.total)*100);
        const afText=sum.afEval?`AF: ${sum.afEval.pass}/${sum.afEval.total}`:'';
        const alText=sum.alEval?`AL: ${sum.alEval.pass}/${sum.alEval.total}`:'';
        const splitInfo=[afText,alText].filter(Boolean).join(' · ');
        summaryOk=ok;
        summaryResultText=ok?'PASSED':'FAILED';
        summaryDetailText=`${splitInfo} (${pct}% within ±${tolVal} ${tolUnit}) | ${extraStats}`;
        log$('log-p-summary-result').innerHTML=ok?'<span style="color:#006600;">PASSED</span>':'<span style="color:#cc0000;">FAILED</span>';
        log$('log-p-summary-detail').innerHTML=`<span style="color:${ok?'#006600':'#cc0000'};">${summaryDetailText}</span>`;
    }
    logSaveSettings();

    window._printing=true;
    log_drawChart();
    let chartDataUrl='';
    try{
        const cvs=log$('log-errorChart');
        if(cvs)chartDataUrl=cvs.toDataURL('image/png',1.0);
    }catch(e){}
    window._printing=false;
    log_drawChart();

    if(typeof window.exportCalibrationPdf==='function'){
        try{
            const modeSel=log$('log-vMode');
            const modeLabel=modeSel&&modeSel.selectedIndex>=0?modeSel.options[modeSel.selectedIndex].text:modeSel?.value||'';
            const tolPct=sum.tolPct;
            const rows=logData.map(l=>{
                const errNum=parseFloat(l.err);
                const status=tolPct!==null?(Math.abs(errNum)<=tolPct?'PASS':'FAIL'):'-';
                return{
                    state:(l.state==='AL')?'AL':'AF',
                    dir:l.dir,
                    act:String(l.act),
                    meas:parseFloat(l.meas).toFixed(3),
                    pv:parseFloat(l.pv).toFixed(3),
                    target:parseFloat(l.target).toFixed(3),
                    err:l.err,
                    status
                };
            });
            const headers=[
                'STATE',
                'DIR',
                log$('log-th-in').innerText||'INPUT',
                log$('log-th-meas').innerText||'MEAS',
                log$('log-th-pv').innerText||'PV',
                log$('log-th-tar').innerText||'TARGET',
                'ERR',
                'STATUS'
            ];
            window.exportCalibrationPdf({
                tech,tag,sn,area,date:formattedDate,modeLabel,range,
                toleranceText,
                summaryResult:summaryResultText,
                summaryOk,
                summaryDetail:summaryDetailText,
                headers,
                rows,
                chartDataUrl
            });
            showToast('PDF downloaded');
            return;
        }catch(e){}
    }

    window._printing=true;
    log_drawChart();
    setTimeout(()=>{window.print();},100);
    setTimeout(()=>{window._printing=false;logDrawChart();},1000);
}

/* ==================== INIT ==================== */
(function(){
    loadTheme();
    const hasSavedCalc=calcLoadState();
    if(!hasSavedCalc){
        calcRefMode='custom';
        document.getElementById('refModeStandard').classList.remove('active');
        document.getElementById('refModeCustom').classList.add('active');
        document.getElementById('customRefPanel').style.display='block';
        document.getElementById('standardRefTable').style.display='none';
        document.getElementById('customPointCount').value='0';
        calcBuildCustomInputs();
    }else if(calcRefMode==='custom'){
        const hasAnyCustom=[1,2,3,4,5].some(i=>{
            const el=document.getElementById('customVal'+i);
            return el&&el.value.trim()!=='';
        });
        if(hasAnyCustom)calcApplyCustomPoints(true);
    }
    calcTglS();
    calcTglF();
    calcTglP();
    calcSetCalibMode(calibMode||'target');
    calcScheduleUpdate();

    const t=new Date();
    log$('log-date').value=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
    logLoadSettings();
    logLoadLogs();
    logUpdateTolUnit();
    log$('log-clampMsg').innerText=logGetClampMsg();
    logChgMode();
    logDrawChart();
})();
window.addEventListener('beforeunload',()=>{
    calcSaveState();
    logSaveSettings();
    logSaveLogs();
});