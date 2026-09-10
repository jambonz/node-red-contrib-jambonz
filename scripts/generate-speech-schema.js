#!/usr/bin/env node
/**
 * generate-speech-schema.js
 *
 * Reads the official @jambonz/schema component definitions for `synthesizer` and
 * `recognizer` (plus `vad` and the per-vendor `recognizer-<vendor>Options`) and emits a
 * committed descriptor artifact at resources/speech-schema.js. That artifact drives the
 * instance-scoped speech editor component (resources/speech-component.js).
 *
 * The schema governs field STRUCTURE only; language/voice/model CONTENTS come from the
 * existing /_jambonz/* data pipeline (src/data/*), not from here.
 *
 * Run with:  npm run gen:speech
 */
'use strict';

const fs = require('fs');
const path = require('path');

const schemaPkgPath = require.resolve('@jambonz/schema/package.json');
const schemaRoot = path.dirname(schemaPkgPath);
const componentsDir = path.join(schemaRoot, 'components');
const schemaVersion = require(schemaPkgPath).version;

// ---- load + index every component by the last segment of its $id -----------------------
const byId = {};
for (const file of fs.readdirSync(componentsDir)) {
  if (!file.endsWith('.schema.json')) continue;
  const doc = JSON.parse(fs.readFileSync(path.join(componentsDir, file), 'utf8'));
  const id = doc.$id || '';
  const shortName = id.split('/').pop() || file.replace('.schema.json', '');
  byId[shortName] = doc;
}
const resolveRef = (ref) => byId[ref.split('/').pop()];

// ---- field descriptor helpers ----------------------------------------------------------
function scalarControl(sub) {
  const t = sub.type;
  if (sub.enum) return { control: 'enum', enum: sub.enum };
  if (t === 'boolean') return { control: 'bool' };
  if (t === 'number' || t === 'integer') {
    const d = { control: 'number' };
    if (typeof sub.minimum === 'number') d.min = sub.minimum;
    if (typeof sub.maximum === 'number') d.max = sub.maximum;
    return d;
  }
  if (t === 'array') return { control: 'list' }; // array of scalars -> comma-separated list editor
  return { control: 'text' }; // string, or union scalar type
}

function descriptor(key, sub) {
  const d = Object.assign({ key }, scalarControl(sub));
  if (sub.description) d.description = sub.description;
  return d;
}

// A vendor options sub-schema is "flat" (auto-generatable) only if every property is a
// scalar / enum / array-of-scalar. Anything nested, ref'd, unioned, passthrough
// (additionalProperties:true) or empty (e.g. gladia) is handled by a raw-JSON editor.
function isFlat(sub) {
  if (!sub || !sub.properties || Object.keys(sub.properties).length === 0) return false;
  for (const v of Object.values(sub.properties)) {
    if (v.$ref) return false;
    if (v.type === 'object') return false;
    if (v.additionalProperties === true) return false;
    if (v.oneOf || v.anyOf || v.allOf) return false;
    if (v.type === 'array') {
      const items = v.items || {};
      if (items.$ref || items.type === 'object' || items.properties || items.oneOf) return false;
    }
  }
  return true;
}

function flatFields(sub) {
  return Object.entries(sub.properties).map(([k, v]) => descriptor(k, v));
}

// ---- synthesizer -----------------------------------------------------------------------
const synthDoc = byId['synthesizer'];
const synthVendors = (synthDoc.properties.vendor.examples || []).slice();
const synthesizer = Object.entries(synthDoc.properties).map(([key, sub]) => {
  if (key === 'voice' || key === 'fallbackVoice') {
    return { key, control: 'voice', description: sub.description };
  }
  if (key === 'options') return { key, control: 'json', description: sub.description };
  return descriptor(key, sub);
});

// ---- recognizer ------------------------------------------------------------------------
const recDoc = byId['recognizer'];
const recVendors = (recDoc.properties.vendor.examples || []).slice();
const VENDOR_OVERRIDES = { azureOptions: 'microsoft' }; // property -> canonical vendor string
const common = [];
const vad = [];
const vendorOptions = {};
const vendorMap = {};   // vendor string -> options property name
const jsonVendors = [];

// vad group (from the vad component)
const vadDoc = resolveRef('vad');
for (const [k, sub] of Object.entries(vadDoc.properties)) vad.push(descriptor(k, sub));

for (const [key, sub] of Object.entries(recDoc.properties)) {
  if (key === 'vad') continue; // rendered as its own group
  if (/Options$/.test(key) && sub.$ref) {
    const vendor = VENDOR_OVERRIDES[key] || key.replace(/Options$/, '').toLowerCase();
    vendorMap[vendor] = key;
    const optDoc = resolveRef(sub.$ref);
    if (isFlat(optDoc)) vendorOptions[vendor] = flatFields(optDoc);
    else jsonVendors.push(vendor);
    continue;
  }
  if (key === 'hints') { common.push({ key, control: 'hintsList', description: sub.description }); continue; }
  common.push(descriptor(key, sub));
}
jsonVendors.sort();

// ---- emit ------------------------------------------------------------------------------
const out = {
  meta: { schemaVersion, generatedBy: 'scripts/generate-speech-schema.js' },
  synthVendors,
  recVendors,
  synthesizer,
  recognizer: { common, vad, vendorMap, vendorOptions, jsonVendors }
};

const banner =
  `// AUTO-GENERATED from @jambonz/schema v${schemaVersion} by scripts/generate-speech-schema.js\n` +
  `// DO NOT EDIT BY HAND. Regenerate with: npm run gen:speech\n`;
const body =
  `(function (root) {\n` +
  `  var schema = ${JSON.stringify(out, null, 2)};\n` +
  `  root.JambonzSpeechSchema = schema;\n` +
  `  if (typeof module !== 'undefined' && module.exports) module.exports = schema;\n` +
  `})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));\n`;

const outPath = path.join(__dirname, '..', 'resources', 'speech-schema.js');
fs.writeFileSync(outPath, banner + body);

const flatVendors = Object.keys(vendorOptions).sort();
console.log(`Wrote ${path.relative(path.join(__dirname, '..'), outPath)} from @jambonz/schema v${schemaVersion}`);
console.log(`  synthesizer fields : ${synthesizer.length}`);
console.log(`  recognizer common  : ${common.length} (+${vad.length} vad)`);
console.log(`  vendor blocks      : ${Object.keys(vendorMap).length}  (flat: ${flatVendors.length}, json: ${jsonVendors.length})`);
console.log(`  flat vendors       : ${flatVendors.join(', ')}`);
console.log(`  json vendors       : ${jsonVendors.join(', ')}`);
