import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp, FileText, ExternalLink } from 'lucide-react'
import { TENDER } from '../data/mock-data'

const data = TENDER
const allCriteria = [...new Set(data.bidders.flatMap(b => b.results.map(r => r.criterion)))]

const verdictStyle: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  eligible: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  not_eligible: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  needs_review: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
}

export default function EvaluationResults() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/tender/t1" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-400 transition-colors">
        <ArrowLeft size={16} /> Back to Tender
      </Link>

      <div>
        <h1 className="text-xl font-bold text-white">Evaluation Results</h1>
        <p className="text-slate-400 text-sm mt-1">{data.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">Per-criterion verdicts with source-page anchoring</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {data.bidders.map((b, i) => {
          const elig = b.results.filter(r => r.verdict === 'eligible').length
          const pct = Math.round((elig / b.results.length) * 100)
          const vs = verdictStyle[b.overall_verdict] || verdictStyle.needs_review
          const VIcon = vs.icon
          return (
            <div key={b.id} className={`glass-card p-4 text-center animate-fade-in stagger-${i + 1}`}>
              <p className="text-sm font-medium text-white truncate mb-2">{b.name}</p>
              <p className={`text-3xl font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{pct}%</p>
              <p className="text-[10px] text-slate-500 mb-2">compliance score</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${vs.bg} ${vs.color}`}>
                <VIcon size={11} /> {b.overall_verdict.replace('_', ' ')}
              </span>
            </div>
          )
        })}
      </div>

      {/* Evaluation Matrix */}
      <div className="glass-card-static overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-semibold text-white text-sm">Evaluation Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">Click any cell to see reasoning and source documents</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider min-w-[200px]">Criterion</th>
                {data.bidders.map(b => (
                  <th key={b.id} className="text-center px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider min-w-[140px]">{b.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allCriteria.map((criterion, idx) => (
                <tr key={criterion} className={`border-b border-white/5 ${idx % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <td className="px-4 py-3 text-sm text-slate-300 font-medium">{criterion}</td>
                  {data.bidders.map(b => {
                    const result = b.results.find(r => r.criterion === criterion)
                    const cellKey = `${b.id}-${criterion}`
                    const isExpanded = expanded === cellKey
                    if (!result) return <td key={b.id} className="text-center text-slate-600">—</td>
                    const vs = verdictStyle[result.verdict] || verdictStyle.needs_review
                    const VIcon = vs.icon
                    return (
                      <td key={b.id} className="px-2 py-2">
                        <button onClick={() => setExpanded(isExpanded ? null : cellKey)}
                          className={`w-full rounded-lg p-2 ${vs.bg} hover:opacity-80 transition-all flex flex-col items-center gap-1`}>
                          <VIcon size={18} className={vs.color} />
                          <span className={`text-[10px] font-medium ${vs.color}`}>{(result.confidence * 100).toFixed(0)}%</span>
                          {isExpanded ? <ChevronUp size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
                        </button>
                        {isExpanded && (
                          <div className="mt-2 p-3 rounded-lg bg-slate-800/50 border border-white/5 text-left animate-fade-in">
                            <p className="text-xs text-white font-medium mb-1">{b.name}</p>
                            {result.extracted_value && (
                              <p className="text-[11px] text-slate-300 mb-1"><span className="text-slate-500">Found:</span> {result.extracted_value}</p>
                            )}
                            <p className="text-[11px] text-slate-400 mb-2">{result.reasoning}</p>
                            {result.source_document && (
                              <div className="flex items-center gap-1.5 text-[10px] text-indigo-400">
                                <FileText size={10} />
                                <span>{result.source_document}</span>
                                {result.source_page && <span className="text-slate-500">p.{result.source_page}</span>}
                                <ExternalLink size={9} />
                              </div>
                            )}
                            <div className="mt-1.5 confidence-bar">
                              <div className="confidence-bar-fill" style={{
                                width: `${result.confidence * 100}%`,
                                background: result.confidence > 0.8 ? '#34d399' : result.confidence > 0.5 ? '#fbbf24' : '#fb7185'
                              }} />
                            </div>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-400" /> Eligible</span>
        <span className="flex items-center gap-1"><XCircle size={14} className="text-rose-400" /> Not Eligible</span>
        <span className="flex items-center gap-1"><AlertTriangle size={14} className="text-amber-400" /> Needs Review</span>
      </div>
    </div>
  )
}
