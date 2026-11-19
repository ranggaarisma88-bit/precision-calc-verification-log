/* ==================== OLEOCHEMICAL DENSITY & PANEL TOGGLES ==================== */
(function () {
    const STORAGE_KEY = 'oleo_density_state';

    const oleoPresets = {
        cpo:     { rho: 891.0,  tRef: 50, cef: 0.67 },
        rbdpo:   { rho: 890.5,  tRef: 50, cef: 0.67 },
        olein:   { rho: 897.5,  tRef: 40, cef: 0.68 },
        stearin: { rho: 882.0,  tRef: 60, cef: 0.68 },
        cpko:    { rho: 904.0,  tRef: 40, cef: 0.70 },
        fa:      { rho: 870.0,  tRef: 50, cef: 0.72 },
        fame:    { rho: 875.0,  tRef: 40, cef: 0.72 },
        falc:    { rho: 830.0,  tRef: 40, cef: 0.72 },
        glyc:    { rho: 1261.0, tRef: 20, cef: 0.62 }
    };

    let convOpen = false;
    let oleoOpen = false;
    let lastPlcBrand = '27648';

    function $(id) {
        return document.getElementById(id);
    }

    function toNum(val) {
        if (typeof window.calcToNum === 'function') return window.calcToNum(val);
        const s = String(val || '').trim().replace(/,/g, '.');
        if (!s || s === '-' || s === '.' || s === '-.') return NaN;
        const n = parseFloat(s);
        return isNaN(n) ? NaN : n;
    }

    function buzz(ms) {
        if (typeof window.vibrate === 'function') window.vibrate(ms);
    }

    function applyPanelUI(contentId, toggleId, labelId, isOpen) {
        const content = $(contentId);
        const toggle = $(toggleId);
        const label = $(labelId);
        if (content) content.style.display = isOpen ? '' : 'none';
        if (toggle) toggle.classList.toggle('calc-toggle-off', !isOpen);
        if (label) label.textContent = isOpen ? 'ON' : 'OFF';
    }

    function syncDampingUI() {
        const dm = $('dampingMode');
        const isOpen = dm ? dm.value === 'on' : false;
        applyPanelUI('dampingContent', 'dampingToggle', 'dampingToggleLabel', isOpen);
    }

    function syncPlcUI() {
        const pb = $('pb');
        const isOpen = pb ? pb.value !== 'hi' : false;
        if (isOpen && pb && pb.value) lastPlcBrand = pb.value;
        applyPanelUI('plcContent', 'plcToggle', 'plcToggleLabel', isOpen);
    }

    function applyAllPanelsUI() {
        syncDampingUI();
        syncPlcUI();
        applyPanelUI('convContent', 'convToggle', 'convToggleLabel', convOpen);
        applyPanelUI('oleoContent', 'oleoToggle', 'oleoToggleLabel', oleoOpen);
    }

    function toggleDampingPanel() {
        buzz(15);
        const dm = $('dampingMode');
        if (!dm) return;
        dm.value = (dm.value === 'on') ? 'off' : 'on';
        syncDampingUI();
        if (typeof window.calcResetDamping === 'function') window.calcResetDamping();
        if (typeof window.calcSaveStateDebounced === 'function') window.calcSaveStateDebounced();
    }

    function togglePlcPanel() {
        buzz(15);
        const pb = $('pb');
        if (!pb) return;
        if (pb.value === 'hi') {
            pb.value = (lastPlcBrand && lastPlcBrand !== 'hi') ? lastPlcBrand : '27648';
        } else {
            lastPlcBrand = pb.value;
            pb.value = 'hi';
        }
        syncPlcUI();
        if (typeof window.calcTglP === 'function') window.calcTglP();
        saveOleoStateDebounced();
    }

    function onPlcSelectChange() {
        const pb = $('pb');
        if (pb && pb.value !== 'hi') {
            lastPlcBrand = pb.value;
        }
        syncPlcUI();
        if (typeof window.calcTglP === 'function') window.calcTglP();
        saveOleoStateDebounced();
    }

    function togglePressurePanel() {
        buzz(15);
        convOpen = !convOpen;
        applyPanelUI('convContent', 'convToggle', 'convToggleLabel', convOpen);
        saveOleoStateDebounced();
    }

    function toggleOleoPanel() {
        buzz(15);
        oleoOpen = !oleoOpen;
        applyPanelUI('oleoContent', 'oleoToggle', 'oleoToggleLabel', oleoOpen);
        saveOleoStateDebounced();
    }

    let saveTimer = null;
    function saveOleoState() {
        try {
            const data = {
                preset: $('oleoPreset')?.value || 'custom',
                rhoRef: $('oleoRhoRef')?.value || '',
                tRef: $('oleoTRef')?.value || '',
                tAct: $('oleoTAct')?.value || '',
                cef: $('oleoCef')?.value || '0.67',
                convOpen: convOpen,
                oleoOpen: oleoOpen,
                lastPlcBrand: lastPlcBrand
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    function saveOleoStateDebounced() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveOleoState, 300);
    }

    function loadOleoState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const d = JSON.parse(raw);
            if (d.preset && $('oleoPreset')) $('oleoPreset').value = d.preset;
            if (d.rhoRef !== undefined && $('oleoRhoRef')) $('oleoRhoRef').value = d.rhoRef;
            if (d.tRef !== undefined && $('oleoTRef')) $('oleoTRef').value = d.tRef;
            if (d.tAct !== undefined && $('oleoTAct')) $('oleoTAct').value = d.tAct;
            if (d.cef !== undefined && $('oleoCef')) $('oleoCef').value = d.cef;
            convOpen = d.convOpen === true;
            oleoOpen = d.oleoOpen === true;
            if (d.lastPlcBrand && d.lastPlcBrand !== 'hi') lastPlcBrand = d.lastPlcBrand;
        } catch (e) {}
    }

    function applyOleoPreset() {
        buzz(15);
        const key = $('oleoPreset')?.value;
        const p = oleoPresets[key];
        if (p) {
            if ($('oleoRhoRef')) $('oleoRhoRef').value = p.rho.toFixed(1);
            if ($('oleoTRef')) $('oleoTRef').value = p.tRef;
            if ($('oleoCef')) $('oleoCef').value = p.cef;
        }
        convertOleoDensity();
    }

    function convertOleoDensity() {
        const rhoEl = $('oleoRhoRef'),
              tRefEl = $('oleoTRef'),
              tActEl = $('oleoTAct'),
              cefEl = $('oleoCef'),
              resEl = $('oleoResult'),
              subEl = $('oleoSubInfo'),
              box = $('oleoResultBox');

        if (!rhoEl || !resEl || !box) return;

        const rhoVal = toNum(rhoEl.value);
        if (isNaN(rhoVal)) {
            resEl.innerText = '0.00';
            if (subEl) {
                subEl.innerText = '';
                subEl.style.display = 'none';
            }
            box.classList.remove('active');
            saveOleoStateDebounced();
            return;
        }

        const tRef = toNum(tRefEl?.value);
        const tAct = toNum(tActEl?.value);
        const cefRaw = toNum(cefEl?.value);
        const cef = isNaN(cefRaw) ? 0 : cefRaw;

        let rhoAct = rhoVal;
        let tempTag = 'REF';
        if (!isNaN(tRef) && !isNaN(tAct)) {
            rhoAct = rhoVal - cef * (tAct - tRef);
            tempTag = `@ ${tAct.toFixed(1)}°C`;
        }

        if (rhoAct <= 0) {
            resEl.innerText = 'ERR';
            if (subEl) {
                subEl.innerText = 'Invalid density (≤ 0)';
                subEl.style.display = 'block';
            }
            box.classList.remove('active');
            return;
        }

        resEl.innerText = rhoAct.toFixed(2);
        if (subEl) {
            subEl.innerText = `${(rhoAct / 1000).toFixed(4)} g/cm³ (kg/L) · ${tempTag}`;
            subEl.style.display = 'block';
        }
        box.classList.add('active');
        saveOleoStateDebounced();
    }

    function resetOleoDensity() {
        if ($('oleoPreset')) $('oleoPreset').value = 'custom';
        ['oleoRhoRef', 'oleoTRef', 'oleoTAct'].forEach(function (id) {
            const el = $(id);
            if (el) el.value = '';
        });
        if ($('oleoCef')) $('oleoCef').value = '0.67';
        if ($('oleoResult')) $('oleoResult').innerText = '0.00';
        if ($('oleoSubInfo')) {
            $('oleoSubInfo').innerText = '';
            $('oleoSubInfo').style.display = 'none';
        }
        if ($('oleoResultBox')) $('oleoResultBox').classList.remove('active');
        convOpen = false;
        oleoOpen = false;
        lastPlcBrand = '27648';
        applyAllPanelsUI();
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }

    // Hook otomatis ke tombol RESET ALL DATA (calcClr) di script.js
    const origCalcClr = window.calcClr;
    window.calcClr = function () {
        if (typeof origCalcClr === 'function') origCalcClr();
        resetOleoDensity();
    };

    window.applyOleoPreset = applyOleoPreset;
    window.convertOleoDensity = convertOleoDensity;
    window.toggleDampingPanel = toggleDampingPanel;
    window.togglePlcPanel = togglePlcPanel;
    window.onPlcSelectChange = onPlcSelectChange;
    window.togglePressurePanel = togglePressurePanel;
    window.toggleOleoPanel = toggleOleoPanel;

    window.addEventListener('beforeunload', saveOleoState);

    function initOleo() {
        loadOleoState();
        applyAllPanelsUI();
        convertOleoDensity();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOleo);
    } else {
        initOleo();
    }
})();