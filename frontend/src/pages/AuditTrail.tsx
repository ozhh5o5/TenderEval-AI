import { ScrollText, ArrowRight, Shield, AlertTriangle, CheckCircle, Clock, Download } from 'lucide-react'
import { AUDIT_TRAIL } from '../data/mock-data'

const actionStyle: Record<string, { color: string; bg: string }> = {
  'Override Verdict': { color: 'text-amber-400', bg: 'bg-amber-500/10' },
  'Confirm Verdict': { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  'Flag for Review': { color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  'Forensic Flag': { color: 'text-rose-400', bg: 'bg-rose-500/10' },
}

const verdictBadge = (v: string) => {
  if (v === 'eligible') return 'badge-eligible'
  if (v === 'not_eligible') return 'badge-not-eligible'
  if (v === 'needs_review') return 'badge-needs-review'
  return 'badge-pending'
}

export default function AuditTrail() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Override Audit Trail</h1>
          <p className="text-slate-400 text-sm mt-1">Complete accountability log of every officer decision</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors w-fit">
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Actions', value: AUDIT_TRAIL.length, icon: ScrollText, accent: 'text-indigo-400' },
          { label: 'Overrides', value: AUDIT_TRAIL.filter(a => a.action === 'Override Verdict').length, icon: ArrowRight, accent: 'text-amber-400' },
          { label: 'Confirmations', value: AUDIT_TRAIL.filter(a => a.action === 'Confirm Verdict').length, icon: CheckCircle, accent: 'text-emerald-400' },
          { label: 'Forensic Flags', value: AUDIT_TRAIL.filter(a => a.action === 'Forensic Flag').length, icon: Shield, accent: 'text-rose-400' },
        ].map((s, i) => (
          <div key={i} className={`glass-card p-4 animate-fade-in stagger-${i + 1}`}>
            <s.icon size={18} className={`${s.accent} mb-2`} />
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="glass-card-static overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="font-semibold text-white text-sm">Decision Timeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">Every override is logged with officer identity, justification, and timestamp</p>
        </div>
        <div className="divide-y divide-white/5">
          {AUDIT_TRAIL.map((entry, i) => {
            const as = actionStyle[entry.action] || actionStyle['Override Verdict']
            return (
              <div key={entry.id} className={`p-4 hover:bg-white/[0.02] transition-colors animate-fade-in stagger-${Math.min(i + 1, 6)}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mt-0.5">
                    {entry.action === 'Override Verdict' ? <ArrowRight size={16} className="text-amber-400" /> :
                     entry.action === 'Confirm Verdict' ? <CheckCircle size={16} className="text-emerald-400" /> :
                     entry.action === 'Forensic Flag' ? <Shield size={16} className="text-rose-400" /> :
                     <AlertTriangle size={16} className="text-cyan-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${as.bg} ${as.color}`}>{entry.action}</span>
                      <span className="text-xs font-medium text-white">{entry.bidder_name}</span>
                      {entry.criterion !== 'N/A' && <span className="text-[10px] text-slate-500">· {entry.criterion}</span>}
                    </div>
                    {entry.old_verdict !== 'N/A' && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`${verdictBadge(entry.old_verdict)} px-2 py-0.5 rounded-full text-[10px] font-medium`}>{entry.old_verdict.replace('_', ' ')}</span>
                        <ArrowRight size={12} className="text-slate-600" />
                        <span className={`${verdictBadge(entry.new_verdict)} px-2 py-0.5 rounded-full text-[10px] font-medium`}>{entry.new_verdict.replace('_', ' ')}</span>
                      </div>
                    )}
                    <p className="text-xs text-slate-400 leading-relaxed">{entry.reason}</p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-600">
                      <span className="flex items-center gap-1"><Shield size={10} />{entry.officer}</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{new Date(entry.timestamp).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
