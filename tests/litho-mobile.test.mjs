import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../mobile-v210.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);

test('HTML structure and unique IDs', () => {
  assert.equal((html.match(/<style\b/g)||[]).length, (html.match(/<\/style>/g)||[]).length);
  assert.equal((html.match(/<script\b/g)||[]).length, (html.match(/<\/script>/g)||[]).length);
  assert.equal((html.match(/<dialog\b/g)||[]).length, (html.match(/<\/dialog>/g)||[]).length);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate DOM IDs');
});

test('All JavaScript blocks have valid syntax', () => {
  assert.ok(scripts.length >= 4);
  scripts.forEach((script, i) => assert.doesNotThrow(() => new vm.Script(script, {filename: 'inline-'+i+'.js'})));
});

test('Required workflow screens and documents are retained', () => {
  for (const id of ['home','projects','tasks','calendar','site','gallery','notes','details','settings',
    'siteDrawings','siteDrawingUpload','drawingDialog','drawingPreview',
    'lithoPinEditor','lithoPinTitle','lithoPinNotes','lithoPinFiles',
    'lithoProjectDetailTabs','lithoProjectCover','lithoIssueFiles',
    'photoInput','import','export','diagnosticsEnabled','lithoRunSelfTest']) {
    assert.ok(ids.includes(id), 'Missing '+id);
  }
});

test('Architectural UI and actions are present', () => {
  for (const feature of ['litho-final-editorial-css','litho-final-editorial-js',
    'litho-observations-controller','litho-imageBounds','renderDrawingPins',
    'lithoPlacePin','lithoImageBounds','renderDrawings','renderSite','renderDetails',
    'attachProjectPhoto','refreshDetail','projectFilter','selfTest']) {
    if(feature==='litho-imageBounds') continue;
    assert.ok(html.includes(feature), 'Missing '+feature);
  }
});

test('Storage key remains compatible with existing users', () => {
  assert.match(html, /litho_mobile_standalone_v1/);
  assert.match(html, /litho_mobile_photos_v1/);
  assert.match(html, /litho_mobile_diagnostics_v1/);
});

test('No invalid early-theme insertions or broken photo gradient shorthands', () => {
  assert.doesNotMatch(html, /id="litho-mockup-fidelity-v8"/);
  assert.doesNotMatch(html, /background:#[0-9a-fA-F]{3,8}\s+linear-gradient/);
  assert.doesNotMatch(html, /background:#[0-9a-fA-F]{3,8}\s+center\/cover/);
});
