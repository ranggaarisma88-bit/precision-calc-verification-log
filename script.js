/* ==================== THEME SYSTEM ==================== */
function setTheme(themeName) {
    vibrate(15);
    localStorage.setItem('app_theme', themeName);
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
    
    showToast('Theme: ' + themeName);
}

function toggleThemeMenu() {
    vibrate(10);
    const popup = document.getElementById('themePopup');
    if (popup) popup.classList.toggle('show');
}

function loadTheme() {
    const saved = localStorage.getItem('app_theme') || 'industrial';
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
        setTimeout(()=>{logDrawChart();},100);
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
    psi:0.0689476,
    mmHg:0.00133322,
    mmH2O:0.0000980665,
    inH2O:0.00249089,
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
    for(let i=0;i<4;i++){
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
    if(mV<=0)return 0;
    let T=800;
    for(let i=0;i<50;i++){
        const Vc=calcTcS_TtoV(T),dV=(calcTcS_TtoV(T+0.1)-Vc)/0.1;
        if(!isFinite(dV)||Math.abs(dV)<1e-12)break;
        const delta=(Vc-mV)/dV;
        T-=calcClamp(delta,-50,50);
        if(Math.abs(delta)<0.0001)return T;
        if(!isFinite(T))break;
    }
    if(!isFinite(T)||T<-50||T>1768){
        let lo=-50,hi=1768;
        for(let i=0;i<50;i++){
            T=(lo+hi)/2;
            const Vc=calcTcS_TtoV(T);
            if(Math.abs(Vc-mV)<0.0001)return T;
            if(Vc<mV)lo=T;else hi=T;
        }
    }
    return calcClamp(T,-50,1768);
}
function calcPT100_RtoT(R){
    const disc=CALC_PT100_A*CALC_PT100_A-4*CALC_PT100_B*(1-R/CALC_PT100_R0);
    if(disc>=0){
        const T=(-CALC_PT100_A+Math.sqrt(disc))/(2*CALC_PT100_B);
        if(T>=-200&&T<=850)return T;
    }
    let T=0;
    for(let i=0;i<50;i++){
        const T100=T-100,
              Rt=CALC_PT100_R0*(1+CALC_PT100_A*T+CALC_PT100_B*T*T+CALC_PT100_C*T100*T*T*T),
              dRt=CALC_PT100_R0*(CALC_PT100_A+2*CALC_PT100_B*T+CALC_PT100_C*T*T*(4*T-300));
        if(Math.abs(dRt)<1e-12)break;
        T-=calcClamp((Rt-R)/dRt,-50,50);
        if(!isFinite(T)||Math.abs(Rt-R)<0.00001)break;
    }
    if(T<-250||T>900)return NaN;
    return calcClamp(T,-200,850);
}
function calcPT100_TtoR(T){
    T=calcClamp(T,-200,850);
    const T100=T-100;
    return T>=0?
        CALC_PT100_R0*(1+CALC_PT100_A*T+CALC_PT100_B*T*T):
        CALC_PT100_R0*(1+CALC_PT100_A*T+CALC_PT100_B*T*T+CALC_PT100_C*T100*T*T*T);
}

let calcDampingTimer=null,calcDampedValue=CALC_MA_MIN,calcDampingActive=false,calcDampingLastTime=0,calcUpdatePending=false;
const calcState={locked1:false,lockVal1:CALC_MA_MIN,locked2:false,lockVal2:0};
const calcTableCache={lrv:NaN,urv:NaN,unit:'',fmMode:'',td:NaN,ta:NaN,pd:NaN,pa:NaN,ffc:NaN,ffm:'',sm:'',cjc:NaN,html:''};
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
        v=(v[0]==='-'?'-':'')+v.replace(/-/g,'').replace(/^/,'');
    }
    const parts=v.split('.');
    if(parts.length>2){
        v=parts[0]+'.'+parts.slice(1).join('');
    }
    el.value=v;
}
function calcSaveState(){
    try{
        const data={
            sm:calc$('sm').value,
            cjcTemp:calc$('cjcTemp').value,
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
            calibMode:calibMode,
            customPointCount:document.getElementById('customPointCount')?.value||'0'
        };
        for(let i=1;i<=5;i++){
            const el=document.getElementById('customVal'+i);
            if(el)data['customVal'+i]=el.value;
        }
        localStorage.setItem('calc_state',JSON.stringify(data));
    }catch(e){}
}
function calcLoadState(){
    const saved=localStorage.getItem('calc_state');
    if(!saved)return;
    try{
        const data=JSON.parse(saved);
        if(data.sm)calc$('sm').value=data.sm;
        if(data.cjcTemp!==undefined)calc$('cjcTemp').value=data.cjcTemp;
        if(data.lrv!==undefined)calc$('lrv').value=data.lrv;
        if(data.urv!==undefined)calc$('urv').value=data.urv;
        if(data.unit!==undefined)calc$('unit').value=data.unit;
        if(data.mi!==undefined)calc$('mi').value=data.mi;
        if(data.actualPV!==undefined)calc$('actualPV').value=data.actualPV;
        if(data.damping!==undefined)calc$('damping').value=data.damping;
        if(data.dampingMode)calc$('dampingMode').value=data.dampingMode;
        if(data.fm)calc$('fm').value=data.fm;
        if(data.td!==undefined)calc$('td').value=data.td;
        if(data.ta!==undefined)calc$('ta').value=data.ta;
        if(data.pd!==undefined)calc$('pd').value=data.pd;
        if(data.pa!==undefined)calc$('pa').value=data.pa;
        if(data.ffc!==undefined)calc$('ffc').value=data.ffc;
        if(data.ffm)calc$('ffm').value=data.ffm;
        if(data.pb)calc$('pb').value=data.pb;
        if(data.dpLrv!==undefined)calc$('dpLrv').value=data.dpLrv;
        if(data.dpUrv!==undefined)calc$('dpUrv').value=data.dpUrv;
        if(data.dpUnit)calc$('dpUnit').value=data.dpUnit;
        if(data.dpShowMode)calc$('dpShowMode').value=data.dpShowMode;
        if(data.calibMode){calibMode=data.calibMode;}
        if(data.locked1){
            calcState.locked1=true;
            calcState.lockVal1=data.lockVal1||CALC_MA_MIN;
            calcEl.lockBtn1.textContent='🔒';
            calcEl.lockBtn1.classList.add('locked');
        }
        if(data.locked2){
            calcState.locked2=true;
            calcState.lockVal2=data.lockVal2||0;
            calcEl.lockBtn2.textContent='🔒';
            calcEl.lockBtn2.classList.add('locked');
        }
        if(data.refMode){
            calcRefMode=data.refMode;
            document.getElementById('refModeStandard').classList.toggle('active',data.refMode==='standard');
            document.getElementById('refModeCustom').classList.toggle('active',data.refMode==='custom');
            document.getElementById('customRefPanel').style.display=data.refMode==='custom'?'block':'none';
            document.getElementById('standardRefTable').style.display=data.refMode==='standard'?'block':'none';
        }
        if(data.customPointCount)document.getElementById('customPointCount').value=data.customPointCount;
        calcBuildCustomInputs();
        for(let i=1;i<=5;i++){
            if(data['customVal'+i]){
                const el=document.getElementById('customVal'+i);
                if(el)el.value=data['customVal'+i];
            }
        }
    }catch(e){}
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
    if(mA<=3.6)return{status:'fault',color:'var(--red)'};
    if(mA>3.6&&mA<3.8)return{status:'low',color:'var(--yellow)'};
    if(mA>=3.8&&mA<=20.5)return{status:'normal',color:'var(--green)'};
    if(mA>20.5&&mA<21.0)return{status:'high',color:'var(--orange)'};
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
    calcDampingActive=true;
    calcDampingLastTime=performance.now();
    function loop(now){
        if(!calcDampingActive)return;
        const sm=calc$('sm').value,
              pvInputActive=(calcEl.actualPV.value.trim()!==''&&!calcState.locked2);
        if((sm!=='ma'&&sm!=='ma-rev')||pvInputActive||calcState.locked2){
            calcDampingTimer=requestAnimationFrame(loop);
            return;
        }
        const rawmA=calcState.locked1?calcState.lockVal1:(calcToNum(calcEl.mi.value)||CALC_MA_MIN);
        const tau=calcToNum(calc$('damping').value);
        if(isNaN(rawmA)||isNaN(tau)||tau<=0){
            calcDampedValue=rawmA;
            calcEl.dampedDisplay.textContent='';
            calcScheduleUpdate();
            calcDampingTimer=requestAnimationFrame(loop);
            return;
        }
        const dt=Math.min((now-calcDampingLastTime)/1000,0.05);
        calcDampingLastTime=now;
        const alpha=1-Math.exp(-dt/tau);
        calcDampedValue+=alpha*(rawmA-calcDampedValue);
        if(Math.abs(rawmA-calcDampedValue)<0.0005)calcDampedValue=rawmA;
        calcEl.dampedDisplay.textContent=Math.abs(rawmA-calcDampedValue)>0.001?
            `Damped: ${calcDampedValue.toFixed(3)} → ${rawmA.toFixed(3)} mA`:'';
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
    calcDampingActive=calc$('dampingMode').value==='on';
    if(!calcDampingActive){
        calcDampedValue=calcToNum(calcEl.mi.value)||CALC_MA_MIN;
        calcEl.dampedDisplay.textContent='';
        calcStopDampingLoop();
    }else{
        if(isNaN(calcDampedValue))calcDampedValue=calcToNum(calcEl.mi.value)||CALC_MA_MIN;
        calcStartDampingLoop();
    }
}
function calcGetCurrentmA(){
    if(calcState.locked1)return calcDampingActive?calcDampedValue:calcState.lockVal1;
    const sm=calc$('sm').value,
          pvInputActive=(calcEl.actualPV.value.trim()!==''&&!calcState.locked2);
    if((sm!=='ma'&&sm!=='ma-rev')||pvInputActive){
        const raw=calcToNum(calcEl.mi.value);
        return isNaN(raw)?NaN:raw;
    }
    const rawmA=calcToNum(calcEl.mi.value);
    if(isNaN(rawmA))return NaN;
    if(!calcDampingActive){
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
        calcState.lockVal1=calcToNum(calcEl.mi.value)||CALC_MA_MIN;
        calcEl.mi.disabled=true;
        pb.forEach(b=>b.disabled=true);
        calcEl.lockBtn1.textContent='🔒';
        calcEl.lockBtn1.classList.add('locked');
    }else{
        calcEl.mi.disabled=(calc$('sm').value!=='ma'&&calc$('sm').value!=='ma-rev');
        pb.forEach(b=>b.disabled=false);
        calcEl.lockBtn1.textContent='🔓';
        calcEl.lockBtn1.classList.remove('locked');
    }
    calcScheduleUpdate();
}
function calcToggleLock2(){
    vibrate(15);
    calcState.locked2=!calcState.locked2;
    if(calcState.locked2){
        calcState.lockVal2=calcToNum(calcEl.actualPV.value)||0;
        calcEl.actualPV.disabled=true;
        calcEl.lockBtn2.textContent='🔒';
        calcEl.lockBtn2.classList.add('locked');
    }else{
        calcEl.actualPV.disabled=false;
        calcEl.lockBtn2.textContent='🔓';
        calcEl.lockBtn2.classList.remove('locked');
    }
}

/* ============ SENSOR MODE TOGGLE ============ */
function calcTglS(){
    vibrate(15);
    const mode=calc$('sm').value;
    const adcDacBox=document.getElementById('adcDacInfoBox');
    const calibModeSensorBtn=document.getElementById('calibModeSensor');
    
    if(mode==='ma'||mode==='ma-rev'){
        calc$('cjcBox').style.display='none';
        calcEl.actualPVbox.style.display='flex';
        calcEl.mi.disabled=calcState.locked1;
        calc$('calibBox').style.display='none';
        calc$('calibTarget').value='';
        calc$('calibRawOut').value='';
        if(adcDacBox)adcDacBox.style.display='none';
        updateADCDisplay(NaN,NaN);
        updateSensorRangeDisplay('');
        calcDampedValue=CALC_MA_MIN;
        calcEl.dampedDisplay.textContent='';
    }else{
        calc$('cjcBox').style.display=(mode==='tk')?'block':'none';
        calcEl.actualPVbox.style.display='none';
        calcEl.actualPV.value='';
        calcEl.mi.disabled=true;
        calc$('calibBox').style.display='block';
        if(adcDacBox)adcDacBox.style.display='block';
        calcUpdateCalibUnitLabel();
        
        updateADCDisplay(NaN,NaN);
        
        if(calibModeSensorBtn){
            if(mode==='tk'||mode==='ts'){
                calibModeSensorBtn.style.display='block';
            }else{
                calibModeSensorBtn.style.display='none';
                if(calibMode==='sensor'){
                    calcSetCalibMode('target');
                }
            }
        }
        
        if(calibMode==='target'){calcCalibToRaw();}else{calcMvToTarget();}
        calcDampedValue=CALC_MA_MIN;
        calcEl.dampedDisplay.textContent='';
    }
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
        if (lbl) lbl.textContent = 'Ω';
        if (rawLabel) rawLabel.textContent = 'Resistance (Ω)';
    } else if (mode === 'tk' || mode === 'ts') {
        if (lbl) lbl.textContent = calc$('unit').value || 'Unit';
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
}

/* ============ SENSOR RANGE DISPLAY ============ */
function updateSensorRangeDisplay(mode) {
    const el1 = document.getElementById('sensorRangeDisplay');
    const el2 = document.getElementById('sensorRangeDisplay2');
    
    const ranges = {
        pt: 'Range: 18 - 390 Ω',
        tk: 'Range: -6.5 - 54.8 mV',
        ts: 'Range: -0.236 - 18.693 mV'
    };
    
    const text = ranges[mode] || '';
    if (el1) el1.innerText = text;
    if (el2) el2.innerText = text;
}

/* ============ ADC/DAC DISPLAY ============ */
function updateADCDisplay(rawValue, targetValue) {
    const adcEl = document.getElementById('adcValueDisplay');
    const dacEl = document.getElementById('dacValueDisplay');
    const dacMaEl = document.getElementById('dacMaDisplay');
    
    if (!adcEl || !dacEl || !dacMaEl) return;
    
    const mode = calc$('sm').value;
    
    if (isNaN(rawValue) || !mode || mode === 'ma' || mode === 'ma-rev' || isNaN(targetValue)) {
        adcEl.innerText = '---';
        dacEl.innerText = '---';
        dacMaEl.innerText = '---';
        return;
    }
    
    const rawRanges = {
        pt: { min: 18, max: 390 },
        tk: { min: -6.5, max: 54.8 },
        ts: { min: -0.236, max: 18.693 }
    };
    const range = rawRanges[mode];
    const pct = Math.max(0, Math.min(1, (rawValue - range.min) / (range.max - range.min)));
    const adcValue = Math.round(pct * 16777215);
    
    adcEl.innerText = adcValue.toLocaleString();
    
    const lrv = calcToNum(calc$('lrv').value);
    const urv = calcToNum(calc$('urv').value);
    if (!isNaN(lrv) && !isNaN(urv) && urv > lrv) {
        const targetPct = Math.max(0, Math.min(1, (targetValue - lrv) / (urv - lrv)));
        const dacValue = Math.round(targetPct * 65535);
        const dacMa = 4 + targetPct * 16;
        
        dacEl.innerText = dacValue.toLocaleString();
        dacMaEl.innerText = dacMa.toFixed(3) + ' mA';
    } else {
        dacEl.innerText = '---';
        dacMaEl.innerText = 'Set range';
    }
}

/* ============ MODE TARGET: Input °C → Output mV/Ω ============ */
function calcCalibToRaw(){
    const mode=calc$('sm').value,outEl=calc$('calibRawOut');
    
    const rawLabel = document.querySelector('#calibTargetMode .calc-row .calc-col:nth-child(2) .calc-label');
    if (rawLabel) {
        if (mode === 'pt') {
            rawLabel.textContent = 'Resistance (Ω)';
        } else if (mode === 'tk' || mode === 'ts') {
            rawLabel.textContent = 'Voltage (mV)';
        } else {
            rawLabel.textContent = 'Raw Output';
        }
    }
    
    if(mode==='ma'||mode==='ma-rev'){
        outEl.value='';
        updateADCDisplay(NaN,NaN);
        updateSensorRangeDisplay('');
        return;
    }
    updateSensorRangeDisplay(mode);
    const target=calcToNum(calc$('calibTarget').value);
    if(isNaN(target)){
        outEl.value='';
        updateADCDisplay(NaN,NaN);
        return;
    }
    
    let raw=NaN,unitLabel='';
    if(mode==='pt'){
        raw=calcPT100_TtoR(target);
        unitLabel='Ω';
    }else if(mode==='tk'){
        const cjcTemp=calcToNum(calc$('cjcTemp').value);
        const cjcmV=!isNaN(cjcTemp)?calcTcK_TtoV(cjcTemp):0;
        raw=calcTcK_TtoV(target)-cjcmV;
        unitLabel='mV';
    }else if(mode==='ts'){
        raw=calcTcS_TtoV(target);
        unitLabel='mV';
    }
    
    outEl.value=isNaN(raw)?'--':raw.toFixed(3)+' '+unitLabel;
    updateADCDisplay(NaN,NaN);
}

/* ============ MODE SENSOR: Input mV → Output °C ============ */
function calcMvToTarget(){
    const mode=calc$('sm').value;
    const outEl=calc$('calibTempOut');
    const mvEl=calc$('calibSensorMv');
    
    if(mode==='ma'||mode==='ma-rev'||mode==='pt'){
        if(outEl)outEl.value='';
        updateADCDisplay(NaN,NaN);
        updateSensorRangeDisplay('');
        return;
    }
    updateSensorRangeDisplay(mode);
    const mv=calcToNum(mvEl.value);
    if(isNaN(mv)){
        if(outEl)outEl.value='';
        updateADCDisplay(NaN,NaN);
        return;
    }
    
    let temp=NaN;
    if(mode==='tk'){
        const cjcTemp=calcToNum(calc$('cjcTemp').value);
        const cjc_mV=!isNaN(cjcTemp)?calcTcK_TtoV(cjcTemp):0;
        temp=calcTcK_mVToTemp(mv+cjc_mV);
    }else if(mode==='ts'){
        temp=calcTcS_VtoT(mv);
    }
    
    if(outEl)outEl.value=isNaN(temp)?'--':temp.toFixed(3)+' °C';
    updateADCDisplay(NaN,NaN);
}

/* ============ CJC CHANGE ============ */
function calcOnCjcChange(){
    calcSanitizeInput(calc$('cjcTemp'));
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
    
    let target=NaN;
    let raw=NaN;
    
    if(calibMode==='target'){
        target=calcToNum(calc$('calibTarget').value);
        if(isNaN(target))return;
        if(mode==='pt')raw=calcPT100_TtoR(target);
        else if(mode==='tk'){
            const cjcTemp=calcToNum(calc$('cjcTemp').value);
            const cjcmV=!isNaN(cjcTemp)?calcTcK_TtoV(cjcTemp):0;
            raw=calcTcK_TtoV(target)-cjcmV;
        }else if(mode==='ts')raw=calcTcS_TtoV(target);
    }else{
        if(mode==='pt')return;
        const mv=calcToNum(calc$('calibSensorMv').value);
        if(isNaN(mv))return;
        raw=mv;
        if(mode==='tk'){
            const cjcTemp=calcToNum(calc$('cjcTemp').value);
            const cjc_mV=!isNaN(cjcTemp)?calcTcK_TtoV(cjcTemp):0;
            target=calcTcK_mVToTemp(mv+cjc_mV);
        }else if(mode==='ts'){
            target=calcTcS_VtoT(mv);
        }
    }
    
    if(isNaN(raw)||isNaN(target))return;
    
    const lrv=calcToNum(calc$('lrv').value),urv=calcToNum(calc$('urv').value);
    const actionMode=(calc$('sm').value==='ma-rev')?'reverse':'direct';
    if(isNaN(lrv)||isNaN(urv))return;
    if(urv<=lrv){
        calcEl.rangeError.style.display='block';
        calcScheduleUpdate();
        return;
    }
    calcEl.rangeError.style.display='none';
    const pct=actionMode==='reverse'?(urv-target)/(urv-lrv):(target-lrv)/(urv-lrv);
    const displayMA=calcClamp(CALC_MA_MIN+Math.max(0,Math.min(1,pct))*CALC_MA_SPAN,2.5,22.5);
    calcEl.mi.value=displayMA.toFixed(3);
    if(!calcState.locked1)calcState.lockVal1=displayMA;
    
    updateADCDisplay(raw, target);
    
    calcScheduleUpdate();
}

function calcSp(pct,btn){
    vibrate(15);
    if(calcState.locked1||(calc$('sm').value!=='ma'&&calc$('sm').value!=='ma-rev'))return;
    calcClearPctButtons();
    btn.classList.add('active');
    calcEl.mi.value=(CALC_MA_MIN+(pct/100)*CALC_MA_SPAN).toFixed(3);
    calcState.lockVal1=CALC_MA_MIN+(pct/100)*CALC_MA_SPAN;
    calcEl.actualPV.value='';
    calcScheduleUpdate();
}
function calcOnMiInput(){
    const v=calcToNum(calcEl.mi.value);
    if(isNaN(v))return;
    calcClearPctButtons();
    calcState.lockVal1=v;
    calcEl.actualPV.value='';
    calcScheduleUpdate();
}
function calcActualToMA(){
    if(calcState.locked2){
        calcEl.actualPV.value=calcState.lockVal2.toFixed(2);
        return;
    }
    const pv=calcToNum(calcEl.actualPV.value.trim());
    if(isNaN(pv))return;
    const lrv=calcToNum(calc$('lrv').value),urv=calcToNum(calc$('urv').value);
    if(isNaN(lrv)||isNaN(urv)||urv<=lrv){
        calcScheduleUpdate();
        return;
    }
    const actionMode=(calc$('sm').value==='ma-rev')?'reverse':'direct';
    const span=urv-lrv,fmMode=calc$('fm').value;
    let rawPct=(pv-lrv)/span;
    if(actionMode==='reverse')rawPct=1-rawPct;
    if(fmMode==='dp'||fmMode==='ol'||fmMode==='gs'){
        const sign=rawPct>=0?1:-1;
        rawPct=sign*Math.pow(Math.abs(rawPct),2);
    }
    let maTarget=CALC_MA_MIN+rawPct*CALC_MA_SPAN;
    if(maTarget<CALC_NAMUR.faultLow){
        maTarget=CALC_NAMUR.faultLow;
    }else if(maTarget<CALC_NAMUR.low){
        const ratio=(CALC_NAMUR.low-maTarget)/(CALC_NAMUR.low-CALC_NAMUR.faultLow);
        maTarget=CALC_NAMUR.low-(CALC_NAMUR.low-CALC_NAMUR.faultLow)*Math.sqrt(calcClamp(ratio,0,1));
    }else if(maTarget>CALC_NAMUR.faultHigh){
        maTarget=CALC_NAMUR.faultHigh;
    }else if(maTarget>CALC_NAMUR.high){
        const ratio=(maTarget-CALC_NAMUR.high)/(CALC_NAMUR.faultHigh-CALC_NAMUR.high);
        maTarget=CALC_NAMUR.high+(CALC_NAMUR.faultHigh-CALC_NAMUR.high)*Math.sqrt(calcClamp(ratio,0,1));
    }
    maTarget=calcClamp(maTarget,CALC_NAMUR.faultLow,CALC_NAMUR.faultHigh);
    calcEl.mi.value=maTarget.toFixed(3);
    calcState.lockVal1=maTarget;
    if(!calcDampingActive)calcDampedValue=maTarget;
    calcClearPctButtons();
    calcScheduleUpdate();
}
function calcTglF(){
    vibrate(15);
    const m=calc$('fm').value;
    calc$('ca').style.display=(m==='ol'||m==='gs')?'block':'none';
    calc$('go').style.display=m==='gs'?'flex':'none';
    calc$('ff').style.display=(m==='ol'||m==='gs')?'flex':'none';
    calc$('dpRangeBlock').style.display=(m==='dp'||m==='ol'||m==='gs')?'block':'none';
    calcBuildRegularButtons();
    calcResetTableCache();
    calcScheduleUpdate();
}
function calcTglP(){
    vibrate(15);
    calc$('pp').style.display=calc$('pb').value==='hi'?'none':'block';
    calcScheduleUpdate();
}
function calcOnParamChange(){
    const rt=document.getElementById('customResultTable');
    if(rt)rt.style.display='none';
    calcResetTableCache();
    calcUpdateCalibUnitLabel();
    calcScheduleUpdate();
}
function calcResetTableCache(){
    Object.assign(calcTableCache,{lrv:NaN,urv:NaN,unit:'',fmMode:'',td:NaN,ta:NaN,pd:NaN,pa:NaN,ffc:NaN,ffm:'',sm:'',cjc:NaN,html:''});
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

/* ============ FINAL PV DENGAN PROGRESS BAR ============ */
function calcUpdateFinalPV(mA,lrv,urv,unit,fmMode){
    const actionMode=(calc$('sm').value==='ma-rev')?'reverse':'direct';
    let dpPct;
    if(actionMode==='reverse'){
        dpPct=(CALC_MA_MAX-mA)/CALC_MA_SPAN;
    }else{
        dpPct=(mA-CALC_MA_MIN)/CALC_MA_SPAN;
    }
    
    let result;
    if(fmMode==='ln'){
        result=lrv+dpPct*(urv-lrv);
    }else{
        const clampedDpPct=Math.max(0,Math.min(1,dpPct));
        const flowPct=Math.sqrt(clampedDpPct);
        result=lrv+flowPct*(urv-lrv);
        if(flowPct>0.001&&(fmMode==='ol'||fmMode==='gs')){
            const tdR=calcToNum(calc$('td').value),taR=calcToNum(calc$('ta').value);
            if(!isNaN(tdR)&&!isNaN(taR)&&tdR>-273&&taR>-273){
                const denom=taR+273.15;
                if(Math.abs(denom)>0.001){
                    let cf=Math.sqrt((tdR+273.15)/denom);
                    if(fmMode==='gs'){
                        const pdR=calcToNum(calc$('pd').value),paR=calcToNum(calc$('pa').value);
                        if(!isNaN(pdR)&&!isNaN(paR)){
                            const Pd=pdR+1.01325,Pa=paR+1.01325;
                            if(Pd>0&&Pa>0)cf*=Math.sqrt(Pa/Pd);
                        }
                    }
                    result*=cf;
                }
            }
        }
    }
    const ffm=calc$('ffm').value;
    if(ffm==='on'){
        const ffcVal=calc$('ffc').value.trim();
        const ffc=ffcVal!==''?calcToNum(ffcVal):100;
        if(!isNaN(ffc)&&ffc>0){
            result=result*(ffc/100);
        }
    }
    calcEl.pvVal.innerText=result.toFixed(3);
    calcEl.pvUnit.innerText=unit;
    
    const progressLinear=document.getElementById('progressLinear');
    const progressFlow=document.getElementById('progressFlow');
    const clampedPct=Math.max(0,Math.min(1,dpPct));
    
    if(fmMode==='dp'||fmMode==='ol'||fmMode==='gs'){
        if(progressLinear)progressLinear.style.display='none';
        if(progressFlow)progressFlow.style.display='block';
        
        const flowPctVal=Math.sqrt(clampedPct);
        const dpBar=document.getElementById('dpProgressBar');
        const flowBar=document.getElementById('flowProgressBar');
        const dpPctEl=document.getElementById('dpPctDisplay');
        const flowPctEl=document.getElementById('flowPctDisplay');
        
        if(dpBar)dpBar.style.width=(clampedPct*100)+'%';
        if(flowBar)flowBar.style.width=(flowPctVal*100)+'%';
        if(dpPctEl)dpPctEl.textContent=(clampedPct*100).toFixed(0)+'%';
        if(flowPctEl)flowPctEl.textContent=(flowPctVal*100).toFixed(0)+'%';
        
        calcEl.pctDisplay.textContent='DP: '+(clampedPct*100).toFixed(1)+'% | Flow: '+(flowPctVal*100).toFixed(1)+'%';
    }else{
        if(progressLinear)progressLinear.style.display='block';
        if(progressFlow)progressFlow.style.display='none';
        
        const bar=document.getElementById('progressBar');
        if(bar)bar.style.width=(clampedPct*100)+'%';
        calcEl.pctDisplay.textContent=(clampedPct*100).toFixed(1)+'%';
    }
    
    const dpShowMode=calc$('dpShowMode')?calc$('dpShowMode').value:'off';
    if(fmMode!=='ln'&&dpShowMode==='on'){
        const dpLrv=calcToNum(calc$('dpLrv').value);
        const dpUrv=calcToNum(calc$('dpUrv').value);
        if(!isNaN(dpLrv)&&!isNaN(dpUrv)&&dpUrv>dpLrv){
            const dpActual=dpLrv+dpPct*(dpUrv-dpLrv);
            const dpUnitVal=calc$('dpUnit')?calc$('dpUnit').value.trim():'';
            const dpUnit=dpUnitVal!==''?dpUnitVal:'mbar';
            if(calc$('dpInfoLine'))calc$('dpInfoLine').style.display='block';
            if(calc$('dpVal'))calc$('dpVal').innerText=dpActual.toFixed(2);
            if(calc$('dpUnitDisplay'))calc$('dpUnitDisplay').innerText=dpUnit;
        }else{
            if(calc$('dpInfoLine'))calc$('dpInfoLine').style.display='none';
        }
    }else{
        if(calc$('dpInfoLine'))calc$('dpInfoLine').style.display='none';
    }
    
    return dpPct;
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
    const tdR=calcToNum(calc$('td').value),
          taR=calcToNum(calc$('ta').value),
          pdR=calcToNum(calc$('pd').value),
          paR=calcToNum(calc$('pa').value);
    const ffcVal=calc$('ffc').value.trim();
    const ffcR=ffcVal!==''?calcToNum(ffcVal):100;
    const ffmR=calc$('ffm').value;
    const smR=calc$('sm').value;
    const cjcR=smR==='tk'?calcToNum(calc$('cjcTemp').value):NaN;
    const rawLabel=smR==='pt'?'Ω':(smR==='tk'||smR==='ts')?'mV':'';
    calcEl.thRaw.style.display=rawLabel?'':'none';
    calcEl.thRaw.textContent=rawLabel;
    let html='';
    CALC_TABLE_POINTS.forEach(p=>{
        const cp=calcClamp(p/100,0,1),
              cm=actionMode==='reverse'?CALC_MA_MAX-cp*CALC_MA_SPAN:CALC_MA_MIN+cp*CALC_MA_SPAN;
        let cr;
        if(fmMode==='ln'){
            cr=lrv+cp*(urv-lrv);
        }else{
            cr=lrv+Math.sqrt(calcClamp(cp,0,1))*(urv-lrv);
        }
        if(cp>0.002&&(fmMode==='ol'||fmMode==='gs')&&!isNaN(tdR)&&!isNaN(taR)&&tdR>-273&&taR>-273){
            let cf=Math.sqrt((tdR+273.15)/(taR+273.15));
            if(fmMode==='gs'&&!isNaN(pdR)&&!isNaN(paR)){
                const Pd=pdR+1.01325,Pa=paR+1.01325;
                if(Pd>0&&Pa>0)cf*=Math.sqrt(Pa/Pd);
            }
            cr*=cf;
        }
        if(ffmR==='on'){
            if(!isNaN(ffcR)&&ffcR>0){
                cr=cr*(ffcR/100);
            }
        }
        let rawCell='';
        if(rawLabel){
            let rawVal=NaN;
            if(smR==='pt')rawVal=calcPT100_TtoR(cr);
            else if(smR==='tk'){
                const cjcmV=!isNaN(cjcR)?calcTcK_TtoV(cjcR):0;
                rawVal=calcTcK_TtoV(cr)-cjcmV;
            }else if(smR==='ts')rawVal=calcTcS_TtoV(cr);
            rawCell='<td class="calc-td">'+(isNaN(rawVal)?'--':rawVal.toFixed(3))+'</td>';
        }
        html+='<tr class="calc-tr"><td class="calc-td">'+p+'%</td><td class="calc-td">'+cm.toFixed(2)+'</td><td class="calc-td">'+cr.toFixed(2)+' '+unit+'</td>'+rawCell+'</tr>';
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
    if(isNaN(lrv)||isNaN(urv)||urv<=lrv){
        calcEl.pvVal.innerText='0.00';
        calcEl.pvUnit.innerText=unit;
        calcEl.tb.innerHTML='';
        return;
    }
    const pctElecUncapped=calcUpdateFinalPV(mA,lrv,urv,unit,fmMode);
    calcUpdatePLCRegister(pctElecUncapped);
    if(calcRefMode==='standard')calcUpdateTable(lrv,urv,unit,fmMode);
    calcSaveState();
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
        const rt=document.getElementById('customResultTable');
        if(rt)rt.style.display='none';
    }else{
        CALC_TABLE_POINTS=[0,25,50,75,100];
        calcScheduleUpdate();
    }
}
function calcBuildCustomInputs(){
    const count=parseInt(document.getElementById('customPointCount').value);
    const container=document.getElementById('customInputsContainer');
    if(count===0){
        container.innerHTML='<div style="text-align:center;color:var(--text3);font-size:9px;padding:10px;">Select total points</div>';
        const rt=document.getElementById('customResultTable');
        if(rt)rt.style.display='none';
        return;
    }
    const unit=calc$('unit').value||'Unit';
    let html='';
    for(let i=1;i<=count;i++){
        const val=document.getElementById('customVal'+i)?.value||'';
        html+=`<div class="custom-entry-row"><span style="font-size:8px;color:var(--text3);min-width:44px;">Point ${i}</span><input type="text" id="customVal${i}" class="custom-entry-input" placeholder="0.00" value="${val}" lang="en" inputmode="decimal"><span style="font-size:8px;color:var(--text3);min-width:20px;">${unit}</span></div>`;
    }
    container.innerHTML=html;
    const rt=document.getElementById('customResultTable');
    if(rt)rt.style.display='none';
}
function calcApplyCustomPoints(){
    vibrate(20);
    const count=parseInt(document.getElementById('customPointCount').value);
    if(count===0)return;
    const lrv=calcToNum(calc$('lrv').value),
          urv=calcToNum(calc$('urv').value),
          unit=calc$('unit').value||'Unit';
    const actionMode=(calc$('sm').value==='ma-rev')?'reverse':'direct';
    if(isNaN(lrv)||isNaN(urv)||urv<=lrv){
        const rt=document.getElementById('customResultTable');
        if(rt)rt.style.display='none';
        return;
    }
    const span=urv-lrv;
    let html='<table class="calc-table"><thead><tr><th class="calc-th">INPUT</th><th class="calc-th">mA</th><th class="calc-th">% SPAN</th></tr></thead><tbody>';
    let hasData=false;
    for(let i=1;i<=count;i++){
        const val=calcToNum(document.getElementById('customVal'+i).value);
        if(isNaN(val))continue;
        hasData=true;
        let pct=(val-lrv)/span;
        if(actionMode==='reverse')pct=1-pct;
        pct=Math.max(0,Math.min(1,pct));
        const mA=CALC_MA_MIN+pct*CALC_MA_SPAN;
        html+=`<tr class="calc-tr"><td class="calc-td">${val.toFixed(2)} ${unit}</td><td class="calc-td">${mA.toFixed(3)}</td><td class="calc-td">${(pct*100).toFixed(1)}%</td></tr>`;
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
}
function calcClr(){
    vibrate(50);
    ['lrv','urv','mi','cjcTemp','td','ta','pd','pa','actualPV','damping','ffc','calibTarget','calibSensorMv','dpLrv','dpUrv','dpUnit'].forEach(id=>{
        const e=calc$(id);
        if(e)e.value='';
    });
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
    calcState.lockVal1=CALC_MA_MIN;
    calcState.locked1=false;
    calcEl.lockBtn1.textContent='🔓';
    calcEl.lockBtn1.classList.remove('locked');
    calcState.lockVal2=0;
    calcState.locked2=false;
    calcEl.lockBtn2.textContent='🔓';
    calcEl.lockBtn2.classList.remove('locked');
    calcResetTableCache();
    document.querySelectorAll('#tab-calc .calc-btn-pct').forEach(b=>b.disabled=false);
    calcEl.actualPVbox.style.display='flex';
    calcBuildRegularButtons();
    calcResetNamurState();
    calcResetDamping();
    
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
    localStorage.removeItem('calc_state');
    calcScheduleUpdate();
}

/* ==================== LOG ENGINE ==================== */
const LOG_R0=100,LOG_A=3.9083e-3,LOG_B=-5.775e-7,LOG_C=-4.183e-12;
function logPT100_TtoR(T){
    if(T>=0)return LOG_R0*(1+LOG_A*T+LOG_B*T*T);
    return LOG_R0*(1+LOG_A*T+LOG_B*T*T+LOG_C*(T-100)*T*T*T);
}
function logPT100_RtoT(R){
    if(R>=LOG_R0){
        const d=(R/LOG_R0)-1,
              dis=LOG_A*LOG_A+4*LOG_B*d;
        return(-LOG_A+Math.sqrt(dis))/(2*LOG_B);
    }
    let T=-50;
    for(let i=0;i<10;i++){
        const T100=T-100,
              f=LOG_R0*(1+LOG_A*T+LOG_B*T*T+LOG_C*T100*T*T*T)-R,
              df=LOG_R0*(LOG_A+2*LOG_B*T+LOG_C*T*T*(4*T-300));
        if(Math.abs(df)<1e-15)break;
        T-=f/df;
        if(Math.abs(f/df)<1e-12)break;
    }
    return T;
}
const LOG_NKmV=[0,2.5173462e-2,-1.1662878e-6,-1.0833638e-9,-8.977354e-13,-3.7342377e-16,-8.6632643e-20,-1.0450598e-23,-5.1920577e-28,0];
const LOG_NKlo=[0,3.9450128025e-2,2.3622373598e-5,-3.2858906784e-7,-4.9904828777e-9,-6.7509059173e-11,-5.7410327428e-13,-3.1088872894e-15,-1.0451609365e-17,-1.9889266878e-20,-1.6322697486e-23];
const LOG_NKhi=[-1.7600413686e-2,3.8921204975e-2,1.8558770032e-5,-9.9457592874e-8,3.1840945719e-10,-5.6072844889e-13,5.6075059059e-16,-3.2020720003e-19,9.7151147152e-23,-1.2104721275e-26];
const LOG_NSmV=[0,1.8494946e-2,-8.00504062e-6,1.0223743e-8,-1.52248592e-11,1.88821343e-14,-1.59085941e-17,8.2302788e-21,-2.34181944e-24,2.7978626e-28];
const LOG_NSTmV=[0,5.40313308e-2,1.2593342e-5,-2.04405043e-8,3.17533172e-11,-4.68917176e-14,5.89025127e-17,-6.25331094e-20,5.74008144e-23,-4.47813056e-26];
function logTk_mVtoT_raw(mV){
    let T=0;
    for(let i=0;i<LOG_NKmV.length;i++)T+=LOG_NKmV[i]*Math.pow(mV,i);
    return T;
}
function logTk_TtomV_raw(T){
    const c=T<0?LOG_NKlo:LOG_NKhi;
    let mV=0;
    for(let i=0;i<c.length;i++)mV+=c[i]*Math.pow(T,i);
    return mV;
}
function logTs_mVtoT_raw(mV){
    let T=0;
    for(let i=0;i<LOG_NSmV.length;i++)T+=LOG_NSmV[i]*Math.pow(mV,i);
    return T;
}
function logTs_TtomV_raw(T){
    let mV=0;
    for(let i=0;i<LOG_NSTmV.length;i++)mV+=LOG_NSTmV[i]*Math.pow(T,i);
    return mV;
}
function logGetCJ(){
    const m=log$('log-vMode').value;
    if(m!=='tk'&&m!=='ts')return 0;
    const cjInput=log$('log-coldJunction');
    const cj=parseFloat(cjInput?.value);
    return isNaN(cj)?0:cj;
}
function logTk_mVtoT(mV){
    const cj=logGetCJ(),
          mVcj=logTk_TtomV_raw(cj);
    return logTk_mVtoT_raw(mV+mVcj);
}
function logTk_TtomV(T){
    const cj=logGetCJ(),
          mVcj=logTk_TtomV_raw(cj);
    return logTk_TtomV_raw(T)-mVcj;
}
function logTs_mVtoT(mV){
    const cj=logGetCJ(),
          mVcj=logTs_TtomV_raw(cj);
    return logTs_mVtoT_raw(mV+mVcj);
}
function logTs_TtomV(T){
    const cj=logGetCJ(),
          mVcj=logTs_TtomV_raw(cj);
    return logTs_TtomV_raw(T)-mVcj;
}
const log$=id=>document.getElementById(id);
let logCurrentDir='up',logCurrentState='found',logTolMode='none',logData=[];
const logClampMap={pt:{min:18,max:390,unit:'Ω'},tk:{min:-6.5,max:54.8,unit:'mV'},ts:{min:-0.236,max:18.693,unit:'mV'}};
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
    log$('log-lrv').value=s.lrv||'';
    log$('log-urv').value=s.urv||'';
    log$('log-unit').value=s.unit||'';
    log$('log-vMode').value=s.mode||'ma';
    if(log$('log-coldJunction'))log$('log-coldJunction').value=s.cj||'';
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
function logClearLogs(){
    vibrate(30);
    if(!confirm('Delete all measurement data?\n\nConfiguration will be KEPT.'))return;
    logData=[];
    logSaveLogs();
    log$('log-logBody').innerHTML='';
    log$('log-actIn').value='';
    log$('log-maMeasured').value='';
    log$('log-convOut').innerText='';
    log$('log-maIdeal').innerText='---';
    log$('log-unitIdeal').innerText='';
    logAutoStepActive=false;
    logAutoStepIdx=-1;
    logResetAutoBtn();
    logDrawChart();
}
function logResetAll(){
    vibrate(50);
    if(!confirm('Reset ALL data?\n\nPress OK.'))return;
    if(!confirm('FINAL CONFIRMATION'))return;
    try{localStorage.removeItem('log_settings');}catch(e){}
    try{localStorage.removeItem('log_logs');}catch(e){}
    ['log-tech','log-tag','log-sn','log-area','log-lrv','log-urv','log-unit','log-actIn','log-maMeasured'].forEach(id=>log$(id).value='');
    log$('log-vMode').value='ma';
    if(log$('log-coldJunction'))log$('log-coldJunction').value='';
    log$('log-convOut').innerText='';
    log$('log-maIdeal').innerText='---';
    log$('log-unitIdeal').innerText='';
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
    log$('log-logBody').innerHTML='';
    logAutoStepActive=false;
    logAutoStepIdx=-1;
    logResetAutoBtn();
    log$('log-validationMsg').style.display='none';
    logUpdateTolUnit();
    logChgMode();
    logDrawChart();
    alert('All data has been reset.');
}
function logRebuildTable(){
    log$('log-logBody').innerHTML='';
    logData.forEach((l,idx)=>logAppendRow(l,idx));
}
function logAppendRow(l,idx){
    const body=log$('log-logBody'),
          row=body.insertRow(-1);
    row.className='log-tr';
    const tolVal=logGetTolValue(),
          errNum=parseFloat(l.err);
    let status='-',statusClass='';
    if(tolVal!==null){
        const passed=Math.abs(errNum)<=tolVal;
        status=passed?'PASS':'FAIL';
        statusClass=passed?'pass':'fail';
    }
    row.innerHTML=`<td class="log-td">${l.dir}</td><td class="log-td">${l.act}</td><td class="log-td">${parseFloat(l.meas).toFixed(3)}</td><td class="log-td">${parseFloat(l.pv).toFixed(3)}</td><td class="log-td">${parseFloat(l.target).toFixed(3)}</td><td class="log-td" style="color:${tolVal!==null?(Math.abs(errNum)<=tolVal?'green':'red'):'var(--text3)'}">${l.err}%</td><td class="log-td ${statusClass}">${status}</td><td class="log-td log-no-print"><button class="log-btn-del-box" onclick="logDeleteRow(${idx})">x</button></td>`;
}
function logDeleteRow(idx){
    vibrate(20);
    logData.splice(idx,1);
    logSaveLogs();
    logRebuildTable();
    logDrawChart();
}
function logValidateRange(){
    const lrv=parseFloat(log$('log-lrv').value),
          urv=parseFloat(log$('log-urv').value);
    if(!isNaN(lrv)&&!isNaN(urv)&&urv<=lrv){
        log$('log-validationMsg').style.display='block';
        return false;
    }
    log$('log-validationMsg').style.display='none';
    return true;
}
function logGetSpan(){
    return(parseFloat(log$('log-urv').value)||0)-(parseFloat(log$('log-lrv').value)||0);
}
function logChgMode(){
    vibrate(15);
    const m=log$('log-vMode').value;
    log$('log-cjRow').style.display=(m==='tk'||m==='ts')?'flex':'none';
    const unitInput=log$('log-unit');
    if(m==='ma'){
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
    if(m==='tk'||m==='ts'){
        const cjVal=logGetCJ();
        msg+=cjVal!==0?` | CJC: ${cjVal.toFixed(1)}°C`:' | CJC: -';
    }
    return msg;
}
function logGetTarget(act){
    const m=log$('log-vMode').value;
    if(m==='ma'){
        const s=logGetSpan();
        if(s===0)return NaN;
        return((act-(parseFloat(log$('log-lrv').value)||0))/s)*16+4;
    }
    if(m==='pt')return logPT100_TtoR(act);
    if(m==='tk')return logTk_TtomV(act);
    if(m==='ts')return logTs_TtomV(act);
    return NaN;
}
function logGetPV(meas){
    const m=log$('log-vMode').value;
    if(m==='ma'){
        const lrv=parseFloat(log$('log-lrv').value)||0,
              s=logGetSpan();
        if(s===0)return NaN;
        return((meas-4)/16)*s+lrv;
    }
    if(m==='pt')return logPT100_RtoT(meas);
    if(m==='tk')return logTk_mVtoT(meas);
    if(m==='ts')return logTs_mVtoT(meas);
    return NaN;
}
function logUpd(){
    if(!logValidateRange()){
        log$('log-maIdeal').innerText="ERR";
        return;
    }
    const m=log$('log-vMode').value,
          act=parseFloat(log$('log-actIn').value);
    const unit=logGetDispUnit(),
          uOut=(m==='ma'?'mA':m==='pt'?'Ω':'mV');
    log$('log-th-in').innerText=`INPUT (${unit})`;
    log$('log-th-meas').innerText=`MEAS (${uOut})`;
    log$('log-th-pv').innerText=`PV (${unit})`;
    log$('log-th-tar').innerText=`TARGET (${uOut})`;
    if(isNaN(act)){
        log$('log-maIdeal').innerText="---";
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
          unit=logGetDispUnit();
    if(isNaN(meas)){
        log$('log-convOut').innerText="";
        return;
    }
    const pv=logGetPV(meas);
    log$('log-convOut').innerText=!isNaN(pv)?"≈ "+pv.toFixed(3)+" "+unit:"";
}
function logAddLog(){
    vibrate(25);
    if(!logValidateRange()){
        alert("URV must be greater than LRV");
        return;
    }
    const act=parseFloat(log$('log-actIn').value),
          meas=parseFloat(log$('log-maMeasured').value);
    if(isNaN(act)||isNaN(meas))return;
    const ideal=logGetTarget(act),
          pv=logGetPV(meas);
    if(isNaN(ideal)||isNaN(pv))return;
    const s=logGetSpan();
    if(s===0){
        alert("Span cannot be zero");
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
    log$('log-actIn').value="";
    log$('log-maMeasured').value="";
    log$('log-convOut').innerText="";
    logUpd();
    logSaveLogs();
    logDrawChart();
}
const LOG_STEPS=[0,25,50,75,100];
let logAutoStepIdx=-1,logAutoStepActive=false;
function logResetAutoBtn(){
    const btn=log$('log-btnAuto');
    btn.innerText='AUTO STEP (0%–100%)';
    btn.classList.remove('running');
}
function logAutoStep(){
    vibrate(20);
    if(logAutoStepActive){
        alert('Auto Step is running. Complete 0-100% first.');
        return;
    }
    if(!logValidateRange()){
        alert("URV must be greater than LRV");
        return;
    }
    if(logData.length>0){
        if(!confirm('Measurement data already exists.\n\nAuto Step will start from 0%.\nExisting data will NOT be deleted.\n\nContinue Auto Step?')){
            return;
        }
    }
    const lrv=parseFloat(log$('log-lrv').value)||0,
          s=logGetSpan();
    if(s===0){
        alert("Span cannot be zero");
        return;
    }
    logAutoStepIdx=0;
    logAutoStepActive=true;
    logSetAutoRef(lrv,s,0);
}
function logSetAutoRef(lrv,s,i){
    const ref=lrv+(s*LOG_STEPS[i]/100);
    log$('log-actIn').value=ref;
    log$('log-maMeasured').value='';
    log$('log-convOut').innerText='';
    logUpd();
    const btn=log$('log-btnAuto');
    btn.innerText=`AUTO STEP ${LOG_STEPS[i]}% (${i+1}/5)`;
    btn.classList.add('running');
    log$('log-maMeasured').focus();
}
document.addEventListener('click',function(e){
    if(!logAutoStepActive)return;
    if(!e.target.classList.contains('log-btn-add'))return;
    const lrv=parseFloat(log$('log-lrv').value)||0,
          s=logGetSpan();
    setTimeout(()=>{
        logAutoStepIdx++;
        if(logAutoStepIdx>=LOG_STEPS.length){
            logAutoStepActive=false;
            logAutoStepIdx=-1;
            logResetAutoBtn();
            return;
        }
        logSetAutoRef(lrv,s,logAutoStepIdx);
    },350);
},true);
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
    const w=cvs.width=container.offsetWidth-24;
    const h=cvs.height=Math.max(160,w*0.4);
    const mrg={top:15,right:15,bottom:28,left:38},
          pw=w-mrg.left-mrg.right,
          ph=h-mrg.top-mrg.bottom;
    const isPrint=window._printing===true;
    if(isPrint){
        ctx.fillStyle='#fff';
        ctx.fillRect(0,0,w,h);
        ctx.strokeStyle='#000';
        ctx.lineWidth=1.5;
        ctx.strokeRect(0,0,w,h);
    }else{
        ctx.fillStyle='var(--card)';
        ctx.fillRect(0,0,w,h);
        ctx.strokeStyle='var(--border2)';
        ctx.lineWidth=1;
        ctx.strokeRect(0,0,w,h);
    }
    const midY=mrg.top+ph/2;
    ctx.strokeStyle=isPrint?'#ddd':'var(--border2)';
    ctx.lineWidth=0.5;
    ctx.beginPath();
    ctx.moveTo(mrg.left,midY);
    ctx.lineTo(w-mrg.right,midY);
    ctx.stroke();
    const tolVal=logGetTolValue();
    if(tolVal!==null&&tolVal>0&&logData.length>0){
        const maxAct=Math.max(...logData.map(d=>d.act));
        const minAct=Math.min(...logData.map(d=>d.act));
        const range=maxAct-minAct||1;
        const x1=mrg.left,x2=mrg.left+pw;
        ctx.strokeStyle='#ff9500';
        ctx.lineWidth=1;
        ctx.setLineDash([4,4]);
        ctx.beginPath();
        ctx.moveTo(x1,midY-ph*(tolVal/(range*2)*2));
        ctx.lineTo(x2,midY-ph*(tolVal/(range*2)*2));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1,midY+ph*(tolVal/(range*2)*2));
        ctx.lineTo(x2,midY+ph*(tolVal/(range*2)*2));
        ctx.stroke();
        ctx.setLineDash([]);
    }
    ctx.fillStyle=isPrint?'#333':'var(--text3)';
    ctx.font='bold 7px sans-serif';
    ctx.textAlign='right';
    const labels=[2,1,0,-1,-2];
    labels.forEach(v=>{
        const y=midY-(v*ph/5);
        ctx.fillText(v+'%',mrg.left-4,y+3);
    });
    ctx.textAlign='center';
    const sorted=[...logData].sort((a,b)=>a.act-b.act);
    if(sorted.length>0){
        const minAct=sorted[0].act,
              maxAct=sorted[sorted.length-1].act;
        const range=maxAct-minAct||1;
        const refs=[0,25,50,75,100].map(p=>minAct+(range*p/100));
        refs.forEach((ref,i)=>{
            const x=mrg.left+(pw/4)*i;
            ctx.fillText(ref.toFixed(1),x,h-6);
        });
        ctx.strokeStyle=isPrint?'#000':'var(--text3)';
        ctx.lineWidth=1.2;
        ctx.beginPath();
        ctx.moveTo(mrg.left,h-mrg.bottom);
        ctx.lineTo(w-mrg.right,h-mrg.bottom);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mrg.left,mrg.top);
        ctx.lineTo(mrg.left,h-mrg.bottom);
        ctx.stroke();
        sorted.forEach(d=>{
            const x=mrg.left+((d.act-minAct)/range)*pw;
            const errVal=parseFloat(d.err);
            const y=midY-(errVal/5)*ph;
            ctx.beginPath();
            ctx.arc(x,Math.max(mrg.top,Math.min(h-mrg.bottom,y)),4,0,Math.PI*2);
            ctx.fillStyle=d.dir==='▲'?'#00d4ff':'#ff3b30';
            ctx.fill();
            ctx.strokeStyle=isPrint?'#000':'#fff';
            ctx.lineWidth=1;
            ctx.stroke();
        });
    }
}
function logSavePdf(){
    vibrate(30);
    log$('log-p-tech').innerText=log$('log-tech').value||"-";
    log$('log-p-tag').innerText=log$('log-tag').value||"-";
    log$('log-p-sn').innerText=log$('log-sn').value||"-";
    log$('log-p-area').innerText=log$('log-area').value||"-";
    log$('log-p-range').innerText=(log$('log-lrv').value||"0")+" to "+(log$('log-urv').value||"0")+" "+(log$('log-unit').value||"");
    const d=log$('log-date').value;
    if(d){
        const[y,m,day]=d.split("-");
        log$('log-p-date').innerText=`${day}-${m}-${y}`;
    }else{
        log$('log-p-date').innerText="-";
    }
    const tolVal=logGetTolValue(),
          tolUnit=logGetTolUnit();
    if(tolVal!==null){
        log$('log-p-tolerance').innerText=`± ${tolVal} ${tolUnit}`;
        log$('log-p-tolerance').style.color='#000';
    }else{
        log$('log-p-tolerance').innerText='VERIFICATION ONLY';
        log$('log-p-tolerance').style.color='#666';
    }
    const total=logData.length;
    let pass=0;
    logData.forEach(l=>{
        if(tolVal!==null&&Math.abs(parseFloat(l.err))<=tolVal)pass++;
    });
    if(total===0){
        log$('log-p-summary-result').innerHTML='<span style="color:#333;">NO DATA</span>';
        log$('log-p-summary-detail').innerText='No verification points recorded.';
    }else if(tolVal===null){
        log$('log-p-summary-result').innerHTML='<span style="color:#333;">VERIFICATION ONLY</span>';
        log$('log-p-summary-detail').innerHTML='<span style="color:#333;">'+total+' points recorded (no tolerance)</span>';
    }else{
        const ok=pass===total,
              pct=Math.round((pass/total)*100);
        log$('log-p-summary-result').innerHTML=ok?'<span style="color:#006600;">PASSED</span>':'<span style="color:#cc0000;">FAILED</span>';
        log$('log-p-summary-detail').innerHTML=ok?`<span style="color:#006600;">${pass}/${total} (${pct}%) within ±${tolVal} ${tolUnit}</span>`:`<span style="color:#cc0000;">${pass}/${total} (${pct}%) — ${total-pass} out of tolerance ±${tolVal} ${tolUnit}</span>`;
    }
    logSaveSettings();
    window._printing=true;
    logDrawChart();
    setTimeout(()=>{window.print();},200);
    setTimeout(()=>{window._printing=false;logDrawChart();},1000);
}

/* ==================== PWA ==================== */
let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();
    deferredPrompt=e;
    if(document.getElementById('installPWA'))return;
    const btn=document.createElement('button');
    btn.id='installPWA';
    btn.innerText='INSTALL APP';
    btn.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);padding:14px 22px;border:none;border-radius:14px;background:#c9a830;color:#000;font-weight:bold;z-index:99999;box-shadow:0 0 20px rgba(201,168,48,0.4);cursor:pointer;font-size:12px;letter-spacing:1px;';
    document.body.appendChild(btn);
    btn.addEventListener('click',async()=>{
        btn.remove();
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt=null;
    });
});
window.addEventListener('appinstalled',()=>{
    const btn=document.getElementById('installPWA');
    if(btn)btn.remove();
    deferredPrompt=null;
});

/* ==================== INIT ==================== */
(function(){
    loadTheme();
    calcTglF();
    calcBuildRegularButtons();
    calcResetDamping();
    calcLoadState();
    calcTglS();
    calcTglF();
    calcTglP();
    calcResetDamping();
    calcSetCalibMode(calibMode||'target');
    document.getElementById('refTableContent').style.display='';
    calc$('refTableLabel').textContent='ON';
    calc$('refTableToggle').classList.remove('calc-toggle-off');
    calcRefMode='custom';
    document.getElementById('refModeStandard').classList.remove('active');
    document.getElementById('refModeCustom').classList.add('active');
    document.getElementById('customRefPanel').style.display='block';
    document.getElementById('standardRefTable').style.display='none';
    document.getElementById('customPointCount').value='0';
    calcBuildCustomInputs();
    const rt=document.getElementById('customResultTable');
    if(rt)rt.style.display='none';
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
if('serviceWorker' in navigator){
    window.addEventListener('load',()=>{
        navigator.serviceWorker.register('./sw.js')
            .then(r=>console.log('SW:',r.scope))
            .catch(e=>console.log('SW:',e));
    });
}