import { Link } from 'react-router-dom'
import { FileText, Users, Shield, BarChart3, AlertTriangle, CheckCircle, Clock, Workflow, Globe, ScrollText } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { TENDER } from '../data/mock-data'

const t = TENDER
const totalCriteria = t.criteria.length
const totalBidders = t.bidders.length
const allResults = t.bidders.flatMap(b => b.results)
const eligible = allResults.filter(r => r.verdict === 'eligible').length
const notEligible = allResults.filter(r => r.verdict === 'not_eligible').length
const needsReview = allResults.filter(r => r.verdict === 'needs_review').length
const riskAlerts = t.bidders.filter(b => b.forensic_risk_score > 50).length

const pieData = [
  { name: 'Eligible', value: eligible, color: '#34d399' },
  { name: 'Not Eligible', value: notEligible, color: '#fb7185' },
  { name: 'Needs Review', value: needsReview, color: '#fbbf24' },
]

const FEATURES = [
  { icon: FileText, title: 'Zero-Labeling Extraction', desc: 'AI extracts criteria from tender docs without manual annotation', to: '/tender/t1', color: 'from-blue-500 to-cyan-500' },
  { icon: Workflow, title: 'Document Pipeline', desc: 'Multi-format OCR: PDFs, scans, photos, handwritten docs', to: '/pipeline', color: 'from-violet-500 to-purple-500' },
  { icon: BarChart3, title: 'Source-Anchored Verdicts', desc: 'Per-criterion verdicts linked to exact source pages', to: '/results/t1', color: 'from-emerald-500 to-teal-500' },
  { icon: Shield, title: 'Bid-Rigging Detection', desc: 'Temporal GNN detects shell companies and cartel patterns', to: '/forensic', color: 'from-rose-500 to-pink-500' },
  { icon: Globe, title: 'Statutory Verification', desc: 'Live cross-check with GST, MSME, GeM, EPFO portals', to: '/statutory', color: 'from-amber-500 to-orange-500' },
  { icon: ScrollText, title: 'Override Audit Trail', desc: 'Full audit log of officer decisions with accountability', to: '/audit', color: 'from-indigo-500 to-blue-500' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">TenderEval AI — Anti-Cartel Forensic Tender Evaluation Platform</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Criteria Extracted', value: totalCriteria, icon: FileText, accent: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Bidders Evaluated', value: totalBidders, icon: Users, accent: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Verdicts Issued', value: allResults.length, icon: CheckCircle, accent: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Risk Alerts', value: riskAlerts, icon: AlertTriangle, accent: 'text-rose-400', bg: 'bg-rose-500/10' },
        ].map((kpi, i) => (
          <div key={i} className={`glass-card kpi-card p-5 stagger-${i + 1} animate-fade-in`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon size={20} className={kpi.accent} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tender Card + Chart */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Link to="/tender/t1" className="lg:col-span-2 glass-card p-6 block">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-indigo-400 font-semibold mb-1">{t.tender_number}</p>
              <h2 className="text-lg font-bold text-white">{t.title}</h2>
              <p className="text-sm text-slate-400 mt-1">{t.organization}</p>
            </div>
            <span className="badge-eligible px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle size={12} /> Parsed
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-slate-400"><FileText size={14} className="text-indigo-400" /> {totalCriteria} criteria</span>
            <span className="flex items-center gap-1.5 text-slate-400"><Users size={14} className="text-cyan-400" /> {totalBidders} bidders</span>
            <span className="flex items-center gap-1.5 text-slate-400"><Clock size={14} className="text-slate-500" /> {new Date(t.created_at).toLocaleDateString('en-IN')}</span>
          </div>
        </Link>
        <div className="glass-card-static p-5">
          <h3 className="text-sm font-semibold text-white mb-2">Verdict Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, fontSize: 12, color: '#f1f5f9' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-[11px]">
            {pieData.map(d => <span key={d.name} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: d.color }} />{d.name}</span>)}
          </div>
        </div>
      </div>

      {/* Bidder Summary */}
      <div className="glass-card-static overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="font-semibold text-white text-sm">Bidder Summary</h3>
        </div>
        <div className="divide-y divide-white/5">
          {t.bidders.map(b => {
            const elig = b.results.filter(r => r.verdict === 'eligible').length
            const pct = Math.round((elig / b.results.length) * 100)
            const badgeClass = b.overall_verdict === 'eligible' ? 'badge-eligible' : b.overall_verdict === 'not_eligible' ? 'badge-not-eligible' : 'badge-needs-review'
            return (
              <div key={b.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">{b.name[0]}</div>
                  <div>
                    <p className="text-sm font-medium text-white">{b.name}</p>
                    <p className="text-xs text-slate-500">{b.documents.length} docs · {elig}/{b.results.length} criteria met</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className={`text-sm font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{pct}%</p>
                    <p className="text-[10px] text-slate-500">compliance</p>
                  </div>
                  <span className={`${badgeClass} px-2.5 py-1 rounded-full text-[11px] font-medium`}>
                    {b.overall_verdict.replace('_', ' ')}
                  </span>
                  {b.forensic_risk_score > 50 && (
                    <span className="badge-not-eligible px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1">
                      <AlertTriangle size={10} /> Risk
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Feature Cards */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Platform Capabilities</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <Link key={i} to={f.to} className={`glass-card p-5 stagger-${i + 1} animate-fade-in group`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <f.icon size={20} className="text-white" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">{f.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
