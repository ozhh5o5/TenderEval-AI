import { Link } from 'react-router-dom'
import { ArrowLeft, BarChart3, User, FileText, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { TENDER } from '../data/mock-data'

const tender = TENDER
const verdictConfig: Record<string, { icon: React.ElementType; badge: string }> = {
  eligible: { icon: CheckCircle, badge: 'badge-eligible' },
  not_eligible: { icon: XCircle, badge: 'badge-not-eligible' },
  needs_review: { icon: Clock, badge: 'badge-needs-review' },
  pending: { icon: Clock, badge: 'badge-pending' },
}

export default function BidderManagement() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/tender/t1" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-400 transition-colors">
        <ArrowLeft size={16} /> Back to Tender
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Bidder Management</h1>
          <p className="text-slate-400 text-sm mt-1">{tender.title}</p>
        </div>
        <Link to="/results/t1" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors w-fit">
          <BarChart3 size={16} /> View Results
        </Link>
      </div>

      <div className="grid gap-4">
        {tender.bidders.map((b, bi) => {
          const vc = verdictConfig[b.overall_verdict] || verdictConfig.pending
          const Icon = vc.icon
          const elig = b.results.filter(r => r.verdict === 'eligible').length
          const pct = Math.round((elig / b.results.length) * 100)
          return (
            <div key={b.id} className={`glass-card p-5 animate-fade-in stagger-${bi + 1}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-slate-300 border border-white/5">{b.name[0]}</div>
                  <div>
                    <h3 className="font-semibold text-white">{b.name}</h3>
                    <p className="text-xs text-slate-500">{b.documents.length} documents · {elig}/{b.results.length} criteria met · {pct}% compliance</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`${vc.badge} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                    <Icon size={12} /> {b.overall_verdict.replace('_', ' ')}
                  </span>
                  {b.forensic_risk_score > 50 && (
                    <span className="badge-not-eligible px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1">
                      <AlertTriangle size={11} /> Risk: {b.forensic_risk_score}
                    </span>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="border-t border-white/5 pt-3 mt-3">
                <p className="text-xs text-slate-500 font-medium mb-2">Submitted Documents</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {b.documents.map(d => (
                    <div key={d.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs">
                      <FileText size={14} className="text-indigo-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-300 truncate">{d.filename}</p>
                        <p className="text-slate-600">{d.ocr_used} · {(d.confidence * 100).toFixed(0)}% conf</p>
                      </div>
                      <span className={`flex-shrink-0 w-2 h-2 rounded-full ${d.confidence > 0.9 ? 'bg-emerald-400' : d.confidence > 0.7 ? 'bg-amber-400' : 'bg-rose-400'}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk flags */}
              {b.risk_flags.length > 0 && (
                <div className="border-t border-white/5 pt-3 mt-3">
                  <p className="text-xs text-rose-400 font-medium mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Forensic Risk Flags</p>
                  <div className="space-y-1">
                    {b.risk_flags.map((f, i) => (
                      <p key={i} className="text-xs text-slate-400 pl-4 border-l-2 border-rose-500/30">{f}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
