import { Shield, AlertTriangle, Users, Globe, Wifi, Building, ArrowRight } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { TENDER, NETWORK_GRAPH } from '../data/mock-data'

const bidders = TENDER.bidders

const riskColor = (score: number) => score > 60 ? '#fb7185' : score > 30 ? '#fbbf24' : '#34d399'
const riskLabel = (score: number) => score > 60 ? 'HIGH' : score > 30 ? 'MEDIUM' : 'LOW'

const radarData = [
  { metric: 'Director Links', b1: 10, b2: 85, b3: 30 },
  { metric: 'Address Overlap', b1: 5, b2: 70, b3: 40 },
  { metric: 'IP Clustering', b1: 0, b2: 75, b3: 65 },
  { metric: 'Price Coordination', b1: 8, b2: 60, b3: 20 },
  { metric: 'Win Pattern', b1: 12, b2: 55, b3: 25 },
  { metric: 'Shell Indicators', b1: 3, b2: 80, b3: 15 },
]

const nodeColors: Record<string, string> = { bidder: '#818cf8', director: '#94a3b8', company: '#fb7185', ip_cluster: '#fbbf24' }
const riskBorder: Record<string, string> = { low: 'border-emerald-500/30', medium: 'border-amber-500/30', high: 'border-rose-500/30' }

export default function ForensicAnalysis() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Bid-Rigging Detection — Forensic Analysis</h1>
        <p className="text-slate-400 text-sm mt-1">Temporal Graph Neural Network analysis of bidding entity relationships</p>
      </div>

      {/* Risk Score Cards */}
      <div className="grid grid-cols-3 gap-4">
        {bidders.map((b, i) => (
          <div key={b.id} className={`glass-card p-5 text-center animate-fade-in stagger-${i + 1}`}>
            <p className="text-sm font-medium text-white mb-3">{b.name}</p>
            <div className="risk-gauge mx-auto mb-3" style={{ background: `conic-gradient(${riskColor(b.forensic_risk_score)} ${b.forensic_risk_score * 3.6}deg, rgba(255,255,255,0.05) 0deg)` }}>
              <span style={{ color: riskColor(b.forensic_risk_score) }}>{b.forensic_risk_score}</span>
            </div>
            <span className="text-[11px] font-bold tracking-wider" style={{ color: riskColor(b.forensic_risk_score) }}>{riskLabel(b.forensic_risk_score)} RISK</span>
            {b.risk_flags.length > 0 && (
              <div className="mt-3 space-y-1 text-left">
                {b.risk_flags.map((f, fi) => (
                  <p key={fi} className="text-[10px] text-rose-400/80 flex items-start gap-1"><AlertTriangle size={10} className="mt-0.5 flex-shrink-0" />{f}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Radar Chart */}
        <div className="glass-card-static p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Risk Dimension Analysis</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#64748b' }} />
              <Radar name="Infra Build" dataKey="b1" stroke="#34d399" fill="#34d399" fillOpacity={0.1} strokeWidth={2} />
              <Radar name="QuickBuild" dataKey="b2" stroke="#fb7185" fill="#fb7185" fillOpacity={0.1} strokeWidth={2} />
              <Radar name="Bharat Nirman" dataKey="b3" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.1} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Infra Build</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" />QuickBuild</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Bharat Nirman</span>
          </div>
        </div>

        {/* Entity Network */}
        <div className="glass-card-static p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Entity Relationship Network</h3>
          <p className="text-[11px] text-slate-500 mb-4">Knowledge graph of directors, addresses, IP clusters, and company links</p>
          <div className="space-y-2">
            {NETWORK_GRAPH.nodes.map(node => (
              <div key={node.id} className={`flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border ${riskBorder[node.risk]} transition-colors`}>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: nodeColors[node.type] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{node.label}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{node.type.replace('_', ' ')}</p>
                </div>
                <span className={`text-[9px] font-bold tracking-wider ${node.risk === 'high' ? 'text-rose-400' : node.risk === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{node.risk.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-[10px] text-slate-500 font-medium">Detected Connections</p>
            {NETWORK_GRAPH.edges.map((e, i) => {
              const from = NETWORK_GRAPH.nodes.find(n => n.id === e.from)
              const to = NETWORK_GRAPH.nodes.find(n => n.id === e.to)
              return (
                <div key={i} className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="text-white">{from?.label}</span>
                  <ArrowRight size={10} className="text-indigo-400" />
                  <span className="text-white">{to?.label}</span>
                  <span className="text-slate-600 ml-auto">{e.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* TGNN Methodology */}
      <div className="glass-card-static p-5 gradient-border">
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2"><Shield size={16} className="text-indigo-400" /> TGNN Methodology</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Temporal Graph Neural Network continuously builds a knowledge graph of all bidding entities across historical tenders. 
          It tracks registered directors, shared addresses, IP submission metadata, bid amount patterns, and win/loss sequences. 
          The model detects shell company clusters, round-robin bidding rings, and coordinated price inflation patterns. 
          Each bidder receives a forensic risk score based on six dimensions: director linkages, address overlap, IP clustering, 
          price coordination signals, historical win patterns, and shell company indicators.
        </p>
      </div>
    </div>
  )
}
