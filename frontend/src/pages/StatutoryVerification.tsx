import { Globe, CheckCircle, XCircle, AlertTriangle, ExternalLink, Clock, Shield } from 'lucide-react'
import { TENDER, STATUTORY_CHECKS } from '../data/mock-data'

const bidders = TENDER.bidders
const statusStyle: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  verified: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Verified' },
  clear: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Clear' },
  flagged: { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10', label: 'Flagged' },
  not_found: { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Not Found' },
}

const SOURCES = [
  { name: 'GST Portal', url: 'gst.gov.in', desc: 'GST registration status verification' },
  { name: 'MSME Udyam Portal', url: 'udyamregistration.gov.in', desc: 'MSME registration verification' },
  { name: 'GeM Blacklist Check', url: 'gem.gov.in', desc: 'Government e-Marketplace blacklisting records' },
  { name: 'EPFO Compliance', url: 'epfindia.gov.in', desc: 'Employee Provident Fund compliance status' },
]

export default function StatutoryVerification() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Live Statutory Cross-Verification</h1>
        <p className="text-slate-400 text-sm mt-1">Automated cross-referencing with government databases — discrepancies flagged with source citations</p>
      </div>

      {/* Data Sources */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SOURCES.map((s, i) => (
          <div key={i} className={`glass-card p-4 animate-fade-in stagger-${i + 1}`}>
            <Globe size={18} className="text-indigo-400 mb-2" />
            <p className="text-xs font-semibold text-white">{s.name}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{s.desc}</p>
            <p className="text-[10px] text-indigo-400 mt-1 flex items-center gap-1">{s.url} <ExternalLink size={9} /></p>
          </div>
        ))}
      </div>

      {/* Per-Bidder Verification */}
      {bidders.map((b, bi) => {
        const checks = STATUTORY_CHECKS.filter(c => c.bidder_id === b.id)
        const flagged = checks.filter(c => c.discrepancy).length
        return (
          <div key={b.id} className={`glass-card-static overflow-hidden animate-fade-in stagger-${bi + 1}`}>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">{b.name[0]}</div>
                <div>
                  <p className="text-sm font-semibold text-white">{b.name}</p>
                  <p className="text-[10px] text-slate-500">{checks.length} sources checked</p>
                </div>
              </div>
              {flagged > 0 ? (
                <span className="badge-not-eligible px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1">
                  <AlertTriangle size={11} /> {flagged} discrepancies
                </span>
              ) : (
                <span className="badge-eligible px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1">
                  <Shield size={11} /> All clear
                </span>
              )}
            </div>
            <div className="divide-y divide-white/5">
              {checks.map((c, ci) => {
                const ss = statusStyle[c.status] || statusStyle.not_found
                const SIcon = ss.icon
                return (
                  <div key={ci} className={`p-4 ${c.discrepancy ? 'bg-rose-500/[0.03]' : ''} hover:bg-white/[0.02] transition-colors`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${ss.bg} ${ss.color}`}>
                            <SIcon size={10} /> {ss.label}
                          </span>
                          <span className="text-xs font-medium text-white">{c.source}</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-[10px] text-slate-500 mb-0.5">Claimed</p>
                            <p className="text-xs text-slate-300">{c.claimed_value}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 mb-0.5">Actual (from source)</p>
                            <p className={`text-xs ${c.discrepancy ? 'text-rose-400 font-medium' : 'text-slate-300'}`}>{c.actual_value}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[9px] text-slate-600 flex items-center gap-1"><Clock size={9} />{new Date(c.verified_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
