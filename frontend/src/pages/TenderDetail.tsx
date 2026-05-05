import { Link } from 'react-router-dom'
import { ArrowLeft, Users, BarChart3, Hash, FileText, DollarSign, Shield, Cpu, Sparkles } from 'lucide-react'
import { TENDER } from '../data/mock-data'

const tender = TENDER
const categoryConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  eligibility: { icon: Shield, color: 'badge-not-eligible', label: 'Eligibility' },
  technical: { icon: FileText, color: 'badge-needs-review', label: 'Technical' },
  financial: { icon: DollarSign, color: 'badge-eligible', label: 'Financial' },
}

export default function TenderDetail() {
  const tabs = ['all', 'eligibility', 'technical', 'financial']
  const activeTab = 'all'

  const filtered = activeTab === 'all' ? tender.criteria : tender.criteria.filter(c => c.category === activeTab)

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-400 transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* AI Extraction Banner */}
      <div className="glass-card p-5 gradient-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Zero-Labeling AI Criterion Extraction</h3>
            <p className="text-xs text-slate-400">Criteria auto-extracted without manual annotation or pre-training</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1"><Cpu size={12} /> Claude Sonnet AI</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{tender.criteria.length} criteria found</span>
          <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">Nested conditions parsed</span>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Thresholds structured</span>
        </div>
      </div>

      {/* Tender Header */}
      <div className="glass-card-static p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-indigo-400 font-semibold mb-1">{tender.tender_number}</p>
            <h1 className="text-xl font-bold text-white">{tender.title}</h1>
            <p className="text-slate-400 text-sm mt-1">{tender.organization}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/bidders/t1" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors">
              <Users size={16} /> Bidders
            </Link>
            <Link to="/results/t1" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">
              <BarChart3 size={16} /> Results
            </Link>
          </div>
        </div>
      </div>

      {/* Criteria List */}
      <div className="glass-card-static overflow-hidden">
        <div className="border-b border-white/5 px-4 py-3 flex gap-1 flex-wrap">
          {tabs.map(tab => (
            <span key={tab} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize cursor-default ${tab === 'all' ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-500'}`}>
              {tab === 'all' ? `All (${tender.criteria.length})` : `${tab} (${tender.criteria.filter(c => c.category === tab).length})`}
            </span>
          ))}
        </div>
        <div className="divide-y divide-white/5">
          {filtered.map((c, i) => {
            const cc = categoryConfig[c.category] || categoryConfig.eligibility
            const CatIcon = cc.icon
            return (
              <div key={c.id} className={`p-4 hover:bg-white/[0.02] transition-colors animate-fade-in stagger-${Math.min(i + 1, 6)}`}>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-slate-600 text-xs font-mono w-5 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${cc.color}`}>
                        <CatIcon size={11} /> {cc.label}
                      </span>
                      {c.data_type && <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{c.data_type}</span>}
                      {c.page_reference && <span className="text-[10px] text-slate-600">p.{c.page_reference}</span>}
                    </div>
                    <h4 className="font-medium text-white text-sm">{c.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{c.description}</p>
                    {c.threshold && (
                      <div className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/15">
                        <Hash size={11} /> {c.threshold}
                      </div>
                    )}
                    {c.requirement_text && (
                      <p className="mt-2 text-[11px] text-slate-500 italic border-l-2 border-slate-700 pl-3">"{c.requirement_text}"</p>
                    )}
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
