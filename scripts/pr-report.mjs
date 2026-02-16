
import fs from 'fs';
const p = 'metrics/pr-metrics.json';
if (!fs.existsSync(p)) { console.error('No metrics yet. Create a PR and wait for reviews.'); process.exit(1); }
const db = JSON.parse(fs.readFileSync(p,'utf8'));
const toSec = (a,b)=> a && b ? (new Date(a)-new Date(b))/1000 : null;

const rows = db.map(r => ({
  number: r.number,
  t_first_review_s: toSec(r.first_review_at, r.created_at),
  t_copilot_review_s: toSec(r.first_copilot_review_at, r.created_at),
  t_human_review_s: toSec(r.first_human_review_at, r.created_at),
  t_to_merge_s: toSec(r.merged_at, r.created_at),
}));

function avg(arr){ const f=arr.filter(x=>typeof x==='number'); return f.length? (f.reduce((a,b)=>a+b,0)/f.length):null; }
const avgFirst = avg(rows.map(r=>r.t_first_review_s));
const avgCopilot = avg(rows.map(r=>r.t_copilot_review_s));
const avgHuman = avg(rows.map(r=>r.t_human_review_s));
const avgMerge = avg(rows.map(r=>r.t_to_merge_s));

function nice(s){ if(!s && s!==0) return '—'; const m=Math.floor(s/60), sec=Math.round(s%60); return m?`${m}m ${sec}s`:`${sec}s`; }

console.log('=== PR Review Latency Summary ===');
console.log(`Total PRs: ${rows.length}`);
console.log(`Avg time to FIRST review:    ${nice(avgFirst)}`);
console.log(`Avg time to COPILOT review:  ${nice(avgCopilot)}`);
console.log(`Avg time to HUMAN review:    ${nice(avgHuman)}`);
console.log(`Avg time to MERGE:           ${nice(avgMerge)}`);
console.log('
Details:');
rows.sort((a,b)=>a.number-b.number).forEach(r=>{
  console.log(`#${r.number}	first=${nice(r.t_first_review_s)}	copilot=${nice(r.t_copilot_review_s)}	human=${nice(r.t_human_review_s)}	merge=${nice(r.t_to_merge_s)}`);
});
