
import React, { useEffect, useState } from 'react'

type Row = { number:number; t_first_review_s?:number; t_copilot_review_s?:number; t_human_review_s?:number; t_to_merge_s?:number }

type PR = {
  number: number; created_at: string; merged_at?: string|null;
  first_review_at?: string|null; first_copilot_review_at?: string|null; first_human_review_at?: string|null;
}

function nice(s?: number) { if (s == null) return '—'; const m=Math.floor(s/60), sec=Math.round(s%60); return m?`${m}m ${sec}s`:`${sec}s` }

function toSec(a?:string|null,b?:string){ return a&&b? (new Date(a).getTime()-new Date(b).getTime())/1000: undefined }

export function App(){
  const [rows, setRows] = useState<Row[]|null>(null)
  const [error, setError] = useState<string|undefined>()

  useEffect(()=>{
    fetch('/metrics/pr-metrics.json').then(r=>{
      if(!r.ok) throw new Error('No metrics found yet')
      return r.json()
    }).then((data:PR[])=>{
      const mapped: Row[] = data.map(r=>({
        number: r.number,
        t_first_review_s: toSec(r.first_review_at, r.created_at),
        t_copilot_review_s: toSec(r.first_copilot_review_at, r.created_at),
        t_human_review_s: toSec(r.first_human_review_at, r.created_at),
        t_to_merge_s: toSec(r.merged_at||undefined, r.created_at)
      }))
      setRows(mapped)
    }).catch(e=> setError(e.message))
  },[])

  if(error) return <div style={{padding:16}}>Open a PR first, wait for Copilot/human reviews. Error: {error}</div>
  if(!rows) return <div style={{padding:16}}>Loading metrics…</div>

  const avg = (arr:(number|undefined)[])=>{ const f=arr.filter((x):x is number=> typeof x==='number'); return f.length? f.reduce((a,b)=>a+b,0)/f.length: undefined }
  const avgFirst = avg(rows.map(r=>r.t_first_review_s))
  const avgCopilot = avg(rows.map(r=>r.t_copilot_review_s))
  const avgHuman = avg(rows.map(r=>r.t_human_review_s))
  const avgMerge = avg(rows.map(r=>r.t_to_merge_s))

  return (
    <div style={{padding:16,fontFamily:'system-ui, sans-serif'}}>
      <h1>PR Review Metrics (Copilot Only)</h1>
      <p>This repo does not use Spec-Kit. Copilot reviews will be triggered via GitHub Rulesets and logged by a GitHub Action into <code>metrics/pr-metrics.json</code>.</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(2, minmax(200px, 1fr))',gap:12,margin:'12px 0'}}>
        <MetricCard title="Avg time to FIRST review" value={nice(avgFirst)} />
        <MetricCard title="Avg time to COPILOT review" value={nice(avgCopilot)} />
        <MetricCard title="Avg time to HUMAN review" value={nice(avgHuman)} />
        <MetricCard title="Avg time to MERGE" value={nice(avgMerge)} />
      </div>

      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr><th style={th}>PR #</th><th style={th}>First</th><th style={th}>Copilot</th><th style={th}>Human</th><th style={th}>Merge</th></tr>
        </thead>
        <tbody>
          {rows.sort((a,b)=>a.number-b.number).map(r=> (
            <tr key={r.number}>
              <td style={td}>{r.number}</td>
              <td style={td}>{nice(r.t_first_review_s)}</td>
              <td style={td}>{nice(r.t_copilot_review_s)}</td>
              <td style={td}>{nice(r.t_human_review_s)}</td>
              <td style={td}>{nice(r.t_to_merge_s)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const th:React.CSSProperties={borderBottom:'1px solid #ddd', textAlign:'left', padding:'6px 8px'}
const td:React.CSSProperties={borderBottom:'1px solid #f0f0f0', padding:'6px 8px', fontSize:14}

function MetricCard({title, value}:{title:string,value:string}){
  return (
    <div style={{border:'1px solid #e5e7eb', borderRadius:8, padding:12}}>
      <div style={{fontSize:12, color:'#6b7280'}}>{title}</div>
      <div style={{fontSize:20, fontWeight:600}}>{value}</div>
    </div>
  )
}
