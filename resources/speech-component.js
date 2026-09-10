/**
 * speech-component.js — instance-scoped, embeddable editor for the jambonz `synthesizer`
 * (TTS) and `recognizer` (STT) objects, built from Node-RED typedInputs.
 *
 * Field structure is driven by the generated `window.JambonzSpeechSchema`
 * (resources/speech-schema.js, produced from @jambonz/schema); vendor lists come from the
 * schema and language/voice CONTENTS from the existing /_jambonz/* data endpoints.
 *
 * Every field is a Node-RED typedInput, so it can be a static value OR a msg/flow/global/env
 * reference — vendor/language/voice additionally offer a picker dropdown of known values.
 * Each instance builds its own detached DOM (no shared/global element ids), so any number of
 * recognizers and synthesizers can coexist in one dialog (e.g. the `agent` node).
 *
 * Public API (window.JambonzSpeech):
 *   mountSynthesizer(containerEl, { value }) -> { collect() }
 *   mountRecognizer(containerEl, { value })  -> { collect() }
 * collect() returns a value/type "tree": static fields hold their final JS value; a field set
 * to a dynamic type holds a ref leaf { '#': <value>, t: <type> } resolved at runtime by
 * libs.resolveSpeechObject. Returns undefined when nothing is set.
 */
(function (root) {
  'use strict';

  var TTS_DATA = { google: 'googleTts', aws: 'awsTts', microsoft: 'microsoftTts', ibm: 'ibmTts', nuance: 'nuanceTts' };
  var STT_DATA = { google: 'googleSpeech', aws: 'awsSpeech', deepgram: 'deepgramSpeech', ibm: 'ibmSpeech', microsoft: 'microsoftSpeech', nuance: 'nuanceSpeech' };
  var DYNAMIC = ['msg', 'flow', 'global', 'env', 'jsonata'];
  var TRIBOOL = { value: 'bool', label: 'bool', icon: 'fa fa-toggle-on',
    options: [{ value: '', label: '(default)' }, { value: 'true', label: 'true' }, { value: 'false', label: 'false' }] };

  function getJSON(url) {
    return new Promise(function (resolve) {
      try { $.getJSON(url, function (d) { resolve(d); }).fail(function () { resolve(null); }); }
      catch (e) { resolve(null); }
    });
  }
  // normalize an item from either the live API ({value,name,voices:[{value,name}]}) or the static
  // data files ({code,name,voices}) into {code,name,voices:[{value,name}]}
  function normItem(l) {
    return { code: l.code != null ? l.code : l.value, name: l.name, voices: (l.voices || []).map(function (v) { return { value: v.value, name: v.name }; }) };
  }

  // Load a vendor's language/voice data as {tts:[...], stt:[...]}. When a serverId (jambonz_auth
  // config node) is provided, use the live account API; otherwise (or on failure) fall back to the
  // bundled static data files. Cached per server+vendor.
  var _cache = {};
  function loadVendorData(vendor, serverId) {
    var key = (serverId || '') + '|' + vendor;
    if (!_cache[key]) {
      _cache[key] = new Promise(function (resolve) {
        function normModels(a) { return (a || []).map(function (m) { return { value: m.value, name: m.name }; }); }
        function staticFallback() {
          Promise.all([
            TTS_DATA[vendor] ? getJSON('_jambonz/' + TTS_DATA[vendor]) : Promise.resolve([]),
            STT_DATA[vendor] ? getJSON('_jambonz/' + STT_DATA[vendor]) : Promise.resolve([])
          ]).then(function (r) {
            resolve({ tts: (r[0] || []).map(normItem), stt: (r[1] || []).map(normItem), models: [], sttModels: [] });
          });
        }
        if (serverId) {
          getJSON('_jambonz/speechData/' + encodeURIComponent(serverId) + '/' + encodeURIComponent(vendor)).then(function (d) {
            if (d && (d.tts || d.stt || d.models || d.sttModels)) {
              resolve({ tts: (d.tts || []).map(normItem), stt: (d.stt || []).map(normItem), models: normModels(d.models), sttModels: normModels(d.sttModels) });
            } else staticFallback();
          });
        } else {
          staticFallback();
        }
      });
    }
    return _cache[key];
  }

  function schema() { return root.JambonzSpeechSchema || { synthesizer: [], recognizer: {}, synthVendors: [], recVendors: [] }; }
  // When no server is explicitly selected, fall back to any configured jambonz_auth config node so
  // live language/voice/model data works out of the box (the node's own Speech-data field overrides).
  function autoServerId() {
    try {
      if (typeof RED === 'undefined' || !RED.nodes || !RED.nodes.eachConfig) return undefined;
      var found;
      RED.nodes.eachConfig(function (n) { if (!found && n && n.type === 'jambonz_auth') found = n.id; });
      return found;
    } catch (e) { return undefined; }
  }
  function isDynamic(t) { return DYNAMIC.indexOf(t) !== -1; }
  function isRef(v) { return v && typeof v === 'object' && !Array.isArray(v) && ('#' in v) && ('t' in v); }
  function selectType(name, label, icon, opts) {
    return { value: name, label: label, icon: icon, options: (opts || []).map(function (o) { return typeof o === 'string' ? { value: o, label: o } : o; }) };
  }

  // ---- generic typedInput control ------------------------------------------------------
  function typesFor(kind, desc) {
    var extra = ['msg', 'flow', 'global', 'env'];
    switch (kind) {
      case 'bool': return [TRIBOOL].concat(extra);
      case 'number': return ['num'].concat(extra);
      case 'enum': return [selectType('opt', 'option', 'fa fa-list',
        [{ value: '', label: '--default--' }].concat(desc.enum || []))].concat(extra);
      case 'list': return ['str', 'json'].concat(extra);
      case 'hintsList': return ['str', 'json'].concat(extra);
      case 'voice': return ['str', 'json'].concat(extra);
      case 'json': return ['json'].concat(extra);
      default: return ['str'].concat(extra);
    }
  }
  function firstType(types) { return typeof types[0] === 'object' ? types[0].value : types[0]; }

  function applyLeaf(input, kind, stored) {
    if (isRef(stored)) { input.typedInput('type', stored.t); input.typedInput('value', stored['#']); return; }
    if (stored === undefined || stored === null) return;
    switch (kind) {
      case 'bool': input.typedInput('type', 'bool'); input.typedInput('value', stored === true ? 'true' : (stored === false ? 'false' : '')); break;
      case 'number': input.typedInput('type', 'num'); input.typedInput('value', String(stored)); break;
      case 'enum': input.typedInput('type', 'opt'); input.typedInput('value', stored); break;
      case 'list': input.typedInput('type', 'str'); input.typedInput('value', Array.isArray(stored) ? stored.join(', ') : stored); break;
      case 'hintsList': input.typedInput('type', 'str');
        input.typedInput('value', Array.isArray(stored) ? (stored.length && typeof stored[0] === 'object' ? JSON.stringify(stored) : stored.join(', ')) : stored); break;
      case 'voice': if (typeof stored === 'object') { input.typedInput('type', 'json'); input.typedInput('value', JSON.stringify(stored)); }
        else { input.typedInput('type', 'str'); input.typedInput('value', stored); } break;
      case 'json': input.typedInput('type', 'json'); input.typedInput('value', typeof stored === 'object' ? JSON.stringify(stored, null, 2) : String(stored)); break;
      default: input.typedInput('type', 'str'); input.typedInput('value', String(stored));
    }
  }

  function readLeaf(input, kind) {
    var t = input.typedInput('type');
    var v = input.typedInput('value');
    if (isDynamic(t)) return (v === '' || v == null) ? undefined : { '#': v, t: t };
    if (t === 'json') { var s = ('' + (v || '')).trim(); if (!s) return undefined; try { return JSON.parse(s); } catch (e) { return undefined; } }
    switch (kind) {
      case 'bool': return (v === '' || v == null) ? undefined : (v === 'true' || v === true);
      case 'number': { var n = Number(v); return (v === '' || v == null || isNaN(n)) ? undefined : n; }
      case 'list': { var l = ('' + (v || '')).trim(); return l ? l.split(',').map(function (x) { return x.trim(); }).filter(Boolean) : undefined; }
      case 'hintsList': { var h = ('' + (v || '')).trim(); if (!h) return undefined; if (h[0] === '[') { try { return JSON.parse(h); } catch (e) { return undefined; } } return h.split(',').map(function (x) { return x.trim(); }).filter(Boolean); }
      case 'voice': { var vv = ('' + (v || '')).trim(); if (!vv) return undefined; if (vv[0] === '{') { try { return JSON.parse(vv); } catch (e) { return vv; } } return vv; }
      default: { var d = ('' + (v || '')).trim(); return d === '' ? undefined : d; }
    }
  }

  function makeControl(desc, stored) {
    var kind = desc.control;
    var input = $('<input type="text" style="width:70%;">');
    var types = typesFor(kind, desc);
    return {
      el: input,
      init: function () { input.typedInput({ types: types, default: firstType(types) }); applyLeaf(input, kind, stored); },
      get: function () { return readLeaf(input, kind); }
    };
  }

  function labelText(key) { return key.replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); }); }
  function row(label, el) {
    var r = $('<div class="form-row" style="margin-bottom:6px;"></div>');
    $('<label></label>').css({ width: '150px', display: 'inline-block', verticalAlign: 'top' }).text(label).appendTo(r);
    r.append(el);
    return r;
  }
  function details(title, open) {
    var d = $('<details style="margin:6px 0;border:1px solid #ddd;border-radius:4px;padding:4px 8px;"></details>');
    if (open) d.attr('open', 'open');
    $('<summary style="cursor:pointer;font-weight:600;"></summary>').text(title).appendTo(d);
    return d;
  }

  // ---- vendor / language / voice reactive picker --------------------------------------
  // cfg: { fields:{vendor,language,voice}, emptyLabel, labelPrefix, withVoice }
  function VendorLangVoice(kind, value, cfg) {
    cfg = cfg || {};
    var self = {};
    var F = cfg.fields || { vendor: 'vendor', language: 'language', voice: 'voice', model: 'model' };
    var emptyLabel = cfg.emptyLabel || '-- application default --';
    var prefix = cfg.labelPrefix || '';
    var withVoice = cfg.withVoice !== false && kind === 'tts';
    var withModel = cfg.withModel === true && !!F.model;
    var serverId = cfg.serverId;
    var vendors = (kind === 'tts' ? schema().synthVendors : schema().recVendors) || [];
    var extra = ['msg', 'flow', 'global', 'env'];
    var vendorOpts = [{ value: '', label: emptyLabel }].concat(vendors);

    var vendorInput = $('<input type="text" style="width:70%;">');
    var langInput = $('<input type="text" style="width:70%;">');
    var voiceInput = withVoice ? $('<input type="text" style="width:70%;">') : null;
    var modelInput = withModel ? $('<input type="text" style="width:70%;">') : null;

    var vendorRowEl = row(prefix + 'Vendor', vendorInput);
    var otherRowEls = [row(prefix + 'Language', langInput)];
    if (withModel) otherRowEls.push(row(prefix + 'Model', modelInput));
    if (withVoice) otherRowEls.push(row(prefix + 'Voice', voiceInput));

    function staticVendor() {
      var t = vendorInput.typedInput('type');
      if (t === 'vendor' || t === 'str') { var v = (vendorInput.typedInput('value') || '').trim(); return v || null; }
      return null;
    }
    function staticLang() {
      var t = langInput.typedInput('type');
      if (t === 'lang' || t === 'str') { var v = (langInput.typedInput('value') || '').trim(); return v || null; }
      return null;
    }
    function rebuild(input, name, opts, withJson) {
      var curType = input.typedInput('type');
      var curVal = input.typedInput('value');
      var types = [selectType(name, name, 'fa fa-list', opts), 'str'].concat(withJson ? ['json'] : []).concat(extra);
      input.typedInput('types', types);
      input.typedInput('type', curType || 'str');
      input.typedInput('value', curVal || '');
    }
    // When a data-backed vendor is chosen, show the populated dropdown by default: if the field
    // is on free-text ('str') and is empty or already matches an option, switch it to the select.
    // No data (empty list) leaves it as free text; a ref / other type is left untouched.
    function selectDefaultType(input, selectName, codes) {
      if (input.typedInput('type') !== 'str' || !codes.length) return;
      var v = (input.typedInput('value') || '').trim();
      if (v === '' || codes.indexOf(v) !== -1) input.typedInput('type', selectName);
    }
    function refreshVoices() {
      if (!withVoice) return;
      var entry = (self._langData || []).filter(function (l) { return l.code === staticLang(); })[0];
      var voices = (entry && entry.voices) ? entry.voices.map(function (vo) { return { value: vo.value, label: vo.name }; }) : [];
      rebuild(voiceInput, 'voice', voices, true);
      selectDefaultType(voiceInput, 'voice', voices.map(function (vo) { return vo.value; }));
    }
    function refreshModels(models) {
      if (!withModel) return;
      models = models || [];
      rebuild(modelInput, 'model', models.map(function (m) { return { value: m.value, label: m.name }; }));
      selectDefaultType(modelInput, 'model', models.map(function (m) { return m.value; }));
    }
    function onVendorChanged() {
      var vendor = staticVendor();
      if (!vendor) { self._langData = []; rebuild(langInput, 'lang', []); refreshVoices(); refreshModels([]); return; }
      loadVendorData(vendor, serverId).then(function (both) {
        self._langData = kind === 'tts' ? both.tts : both.stt;
        rebuild(langInput, 'lang', self._langData.map(function (l) { return { value: l.code, label: l.name }; }));
        selectDefaultType(langInput, 'lang', self._langData.map(function (l) { return l.code; }));
        refreshVoices();
        refreshModels(kind === 'tts' ? both.models : both.sttModels);
      });
    }
    function applyPicker(input, selectName, stored, options) {
      if (isRef(stored)) { input.typedInput('type', stored.t); input.typedInput('value', stored['#']); return; }
      if (stored === undefined || stored === null || stored === '') return;
      if (typeof stored === 'object') { input.typedInput('type', 'json'); input.typedInput('value', JSON.stringify(stored)); return; }
      var inList = options && options.indexOf(stored) !== -1;
      input.typedInput('type', inList ? selectName : 'str');
      input.typedInput('value', stored);
    }

    self.vendorRow = function () { return vendorRowEl; };
    self.otherRows = function () { return otherRowEls; };
    self.rows = function () { return [vendorRowEl].concat(otherRowEls); };
    self.onVendorChange = function (fn) { vendorInput.on('change', fn); };
    // "application default" (or "none" for fallback): a static empty vendor.
    self.isEmptyVendor = function () {
      var t = vendorInput.typedInput('type');
      if (isDynamic(t)) return false;
      return (vendorInput.typedInput('value') || '').trim() === '';
    };
    self.init = function () {
      vendorInput.typedInput({ types: [selectType('vendor', 'vendor', 'fa fa-list', vendorOpts), 'str'].concat(extra), default: 'vendor' });
      langInput.typedInput({ types: [selectType('lang', 'language', 'fa fa-list', []), 'str'].concat(extra), default: 'str' });
      if (withVoice) voiceInput.typedInput({ types: [selectType('voice', 'voice', 'fa fa-list', []), 'str', 'json'].concat(extra), default: 'str' });
      if (withModel) modelInput.typedInput({ types: [selectType('model', 'model', 'fa fa-list', []), 'str'].concat(extra), default: 'str' });

      // apply values synchronously (as str/ref) so a stored value is never lost while the
      // language/voice/model option lists load; onVendorChanged() then upgrades matches to a dropdown.
      applyPicker(vendorInput, 'vendor', value[F.vendor], vendors);
      applyPicker(langInput, 'lang', value[F.language], []);
      if (withVoice) applyPicker(voiceInput, 'voice', value[F.voice], []);
      if (withModel) applyPicker(modelInput, 'model', value[F.model], []);
      onVendorChanged();

      vendorInput.on('change', onVendorChanged);
      langInput.on('change', refreshVoices);
    };
    self.collect = function () {
      var o = {};
      o[F.vendor] = readLeaf(vendorInput, 'text');
      o[F.language] = readLeaf(langInput, 'text');
      if (withVoice) o[F.voice] = readLeaf(voiceInput, 'voice');
      if (withModel) o[F.model] = readLeaf(modelInput, 'text');
      Object.keys(o).forEach(function (k) { if (o[k] === undefined) delete o[k]; });
      return o;
    };
    return self;
  }

  // fields owned by a VendorLangVoice picker (excluded from the generic field loop)
  var SYNTH_PICKER = ['vendor', 'language', 'voice', 'fallbackVendor', 'fallbackLanguage', 'fallbackVoice'];
  var REC_PICKER = ['vendor', 'language', 'model', 'fallbackVendor', 'fallbackLanguage'];

  // ---- synthesizer ---------------------------------------------------------------------
  function mountSynthesizer(container, opts) {
    opts = opts || {};
    var value = opts.value || {};
    var serverId = opts.serverId || autoServerId();
    var $c = $(container).empty();
    var primary = VendorLangVoice('tts', value, { emptyLabel: '-- application default --', serverId: serverId });
    var fallback = VendorLangVoice('tts', value, {
      fields: { vendor: 'fallbackVendor', language: 'fallbackLanguage', voice: 'fallbackVoice' },
      emptyLabel: '-- none --', labelPrefix: '', serverId: serverId
    });

    // vendor row is always visible; everything else lives in `body` (hidden for app-default)
    var body = $('<div></div>');
    primary.otherRows().forEach(function (r) { body.append(r); });
    var optionsBox = details('Options', false);
    var fallbackBox = details('Fallback synthesizer', false);
    fallback.rows().forEach(function (r) { fallbackBox.append(r); });

    var controls = {}, inits = [];
    schema().synthesizer.forEach(function (desc) {
      if (SYNTH_PICKER.indexOf(desc.key) !== -1) return;
      var c = makeControl(desc, value[desc.key]);
      controls[desc.key] = c; inits.push(c.init);
      (/^fallback/.test(desc.key) ? fallbackBox : optionsBox).append(row(labelText(desc.key), c.el));
    });
    body.append(optionsBox).append(fallbackBox);
    $c.append(primary.vendorRow()).append(body);

    primary.init(); fallback.init();
    inits.forEach(function (fn) { fn(); });
    function updateVis() { body.toggle(!primary.isEmptyVendor()); }
    primary.onVendorChange(updateVis); updateVis();

    return {
      collect: function () {
        if (primary.isEmptyVendor()) return undefined; // application default -> omit the object
        var out = primary.collect();
        Object.keys(controls).forEach(function (k) { var r = controls[k].get(); if (r !== undefined) out[k] = r; });
        var fb = fallback.collect();
        Object.keys(fb).forEach(function (k) { out[k] = fb[k]; });
        return out.vendor ? out : undefined;
      }
    };
  }

  // ---- recognizer ----------------------------------------------------------------------
  function mountRecognizer(container, opts) {
    opts = opts || {};
    var value = opts.value || {};
    var serverId = opts.serverId || autoServerId();
    var rec = schema().recognizer;
    var $c = $(container).empty();
    var primary = VendorLangVoice('stt', value, { emptyLabel: '-- application default --', serverId: serverId, withModel: true });
    var fallback = VendorLangVoice('stt', value, {
      fields: { vendor: 'fallbackVendor', language: 'fallbackLanguage' },
      emptyLabel: '-- none --', labelPrefix: '', serverId: serverId
    });

    var body = $('<div></div>');
    primary.otherRows().forEach(function (r) { body.append(r); });

    var controls = {}, inits = [];
    var optsBox = details('Recognition options', false);
    var fallbackBox = details('Fallback recognizer', false);
    fallback.rows().forEach(function (r) { fallbackBox.append(r); });
    (rec.common || []).forEach(function (desc) {
      if (REC_PICKER.indexOf(desc.key) !== -1) return;
      var c = makeControl(desc, value[desc.key]);
      controls[desc.key] = c; inits.push(c.init);
      (/^fallback/.test(desc.key) ? fallbackBox : optsBox).append(row(labelText(desc.key), c.el));
    });

    var vadControls = {};
    var vadBox = details('Voice activity detection (vad)', false);
    (rec.vad || []).forEach(function (desc) {
      var c = makeControl(desc, value.vad ? value.vad[desc.key] : undefined);
      vadControls[desc.key] = c; inits.push(c.init);
      vadBox.append(row(labelText(desc.key), c.el));
    });

    var vendorBox = details('Vendor options', false);
    var vendorBody = $('<div></div>');
    vendorBox.append(vendorBody);
    var vendorState = { controls: {}, jsonCtl: null, property: null, kind: null };

    function currentVendor() {
      var leaf = primary.collect().vendor;
      return (typeof leaf === 'string') ? leaf : null; // vendor options only for a static vendor
    }
    function renderVendorOptions() {
      var vendor = currentVendor();
      vendorState = { controls: {}, jsonCtl: null, property: null, kind: null };
      vendorBody.empty();
      if (!vendor) { vendorBox.children('summary').text('Vendor options'); return; }
      var property = (rec.vendorMap || {})[vendor];
      if (!property) { vendorBox.children('summary').text('Vendor options'); return; }
      vendorState.property = property;
      vendorBox.children('summary').text(vendor + ' options');
      var existing = (value[property] && !isRef(value[property])) ? value[property] : {};
      if ((rec.vendorOptions || {})[vendor]) {
        vendorState.kind = 'flat';
        rec.vendorOptions[vendor].forEach(function (desc) {
          var c = makeControl(desc, existing[desc.key]);
          vendorState.controls[desc.key] = c;
          vendorBody.append(row(labelText(desc.key), c.el));
          c.init();
        });
      } else {
        vendorState.kind = 'json';
        var c = makeControl({ key: property, control: 'json' }, value[property]);
        vendorState.jsonCtl = c;
        vendorBody.append(row('Options', c.el));
        c.init();
      }
    }

    body.append(optsBox).append(vadBox).append(vendorBox).append(fallbackBox);
    $c.append(primary.vendorRow()).append(body);

    primary.init(); fallback.init();
    inits.forEach(function (fn) { fn(); });
    renderVendorOptions();
    function updateVis() { body.toggle(!primary.isEmptyVendor()); }
    primary.onVendorChange(function () { renderVendorOptions(); updateVis(); });
    updateVis();

    return {
      collect: function () {
        if (primary.isEmptyVendor()) return undefined; // application default -> omit the object
        var out = primary.collect();
        Object.keys(controls).forEach(function (k) { var r = controls[k].get(); if (r !== undefined) out[k] = r; });
        var fb = fallback.collect();
        Object.keys(fb).forEach(function (k) { out[k] = fb[k]; });
        var vad = {};
        Object.keys(vadControls).forEach(function (k) { var r = vadControls[k].get(); if (r !== undefined) vad[k] = r; });
        if (Object.keys(vad).length) out.vad = vad;
        if (vendorState.property) {
          var vo;
          if (vendorState.kind === 'flat') {
            vo = {};
            Object.keys(vendorState.controls).forEach(function (k) { var r = vendorState.controls[k].get(); if (r !== undefined) vo[k] = r; });
            if (!Object.keys(vo).length) vo = undefined;
          } else if (vendorState.jsonCtl) { vo = vendorState.jsonCtl.get(); }
          if (vo !== undefined) out[vendorState.property] = vo;
        }
        return out.vendor ? out : undefined;
      }
    };
  }

  root.JambonzSpeech = { mountSynthesizer: mountSynthesizer, mountRecognizer: mountRecognizer };
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
