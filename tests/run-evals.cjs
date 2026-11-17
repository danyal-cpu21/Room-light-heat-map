#!/usr/bin/env node
// Runs the advisor evaluation suite against index.html in a headless browser.
// Usage: npm run eval            (or: node tests/run-evals.cjs --verbose)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PAGE = 'file://' + path.resolve(process.env.EVAL_PAGE || path.join(ROOT, 'index.html'));
const CASES = JSON.parse(fs.readFileSync(path.join(__dirname, 'advisor-evals.json'), 'utf8'));
const verbose = process.argv.includes('--verbose');

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const toText = html => html.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function checkParse(got, expect) {
  const fails = [];
  for (const [k, v] of Object.entries(expect)) if (!eq(got[k], v)) fails.push(`${k}: expected ${JSON.stringify(v)}, got ${JSON.stringify(got[k])}`);
  return fails;
}

function checkAnswer(r, expect) {
  const fails = [], text = toText(r.html), words = text.split(/\s+/).filter(Boolean).length;
  const listed = (r.html.match(/<b>\d+\. /g) || []).length;
  if (expect.goal && r.goal !== expect.goal) fails.push(`goal: expected ${expect.goal}, got ${r.goal}`);
  if (expect.preview && !new RegExp(expect.preview).test(r.preview || '')) fails.push(`preview: expected /${expect.preview}/, got ${JSON.stringify(r.preview)}`);
  for (const p of expect.include || []) if (!new RegExp(p).test(text)) fails.push(`missing /${p}/`);
  for (const p of expect.exclude || []) if (new RegExp(p).test(text)) fails.push(`should not contain /${p}/`);
  if (expect.maxListed != null && listed > expect.maxListed) fails.push(`listed ${listed} options, max ${expect.maxListed}`);
  if (expect.maxWords != null && words > expect.maxWords) fails.push(`${words} words, max ${expect.maxWords}`);
  if (expect.maxCost != null) for (const c of r.listedCosts) if (c > expect.maxCost) fails.push(`listed an option costing $${c}, over $${expect.maxCost}`);
  return { fails, text, words };
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const results = [];

  await page.goto(PAGE);
  for (const c of CASES.parse) {
    const got = await page.evaluate(q => parseIntent(q), c.q);
    results.push({ kind: 'parse', q: c.q, fails: checkParse(got, c.expect), detail: got });
  }

  for (const c of CASES.answer) {
    await page.goto(PAGE);
    await page.click('#mDraw'); // default drawn room: bed, desk, nightstand, reading chair, one ceiling light, a window and a door
    const r = await page.evaluate(q => {
      const html = local(q);
      const shown = (html.match(/<b>\d+\. ([^<]+)<\/b>/g) || []).map(s => s.replace(/<b>\d+\. |<\/b>/g, ''));
      return { html, goal: S.goal, preview: S.pv >= 0 ? S.opts[S.pv].name : null,
               listedCosts: shown.map(n => (S.opts.find(o => o.name === n) || {}).cost).filter(x => x != null) };
    }, c.q);
    const { fails, text, words } = checkAnswer(r, c.expect);
    results.push({ kind: 'answer', q: c.q, fails, detail: { preview: r.preview, goal: r.goal, words, text } });
  }
  await browser.close();

  let pass = 0;
  for (const r of results) {
    const ok = !r.fails.length; if (ok) pass++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  [${r.kind}] ${r.q}`);
    for (const f of r.fails) console.log(`        - ${f}`);
    if (verbose || !ok) console.log('        ' + JSON.stringify(r.detail).slice(0, 600));
  }
  if (errors.length) console.log('\nPage errors:\n  ' + errors.join('\n  '));
  const pct = Math.round(pass / results.length * 100);
  console.log(`\n${pass}/${results.length} passed (${pct}%)`);
  process.exit(pass === results.length && !errors.length ? 0 : 1);
})();
