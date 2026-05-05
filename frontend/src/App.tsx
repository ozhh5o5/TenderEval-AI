import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { FileText, Users, BarChart3, Home, Shield, Globe, ScrollText, Workflow, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Dashboard from './pages/Dashboard'
import TenderDetail from './pages/TenderDetail'
import BidderManagement from './pages/BidderManagement'
import EvaluationResults from './pages/EvaluationResults'
import DocumentPipeline from './pages/DocumentPipeline'
import ForensicAnalysis from './pages/ForensicAnalysis'
import StatutoryVerification from './pages/StatutoryVerification'
import AuditTrail from './pages/AuditTrail'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/tender/t1', icon: FileText, label: 'Tender Criteria' },
  { to: '/bidders/t1', icon: Users, label: 'Bidders' },
  { to: '/results/t1', icon: BarChart3, label: 'Evaluation Matrix' },
  { to: '/pipeline', icon: Workflow, label: 'Document Pipeline' },
  { to: '/forensic', icon: Shield, label: 'Forensic Analysis' },
  { to: '/statutory', icon: Globe, label: 'Statutory Checks' },
  { to: '/audit', icon: ScrollText, label: 'Audit Trail' },
]

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation()
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0d1117] border-r border-white/5 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 flex items-center gap-3 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight">TenderEval AI</h1>
            <p className="text-[10px] text-slate-500 font-medium">Anti-Cartel Forensics</p>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
            return (
              <Link key={item.to} to={item.to} onClick={onClose}
                className={`sidebar-link ${active ? 'active' : ''}`}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="glass-card-static p-3 text-center">
            <p className="text-[10px] text-slate-500 font-medium">PanIIT AI for Bharat</p>
            <p className="text-[11px] text-indigo-400 font-semibold">Theme 3 — CRPF</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="min-h-screen bg-[#0a0e1a] bg-mesh">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 h-14 flex items-center px-4 lg:px-6 border-b border-white/5 bg-[#0a0e1a]/80 backdrop-blur-xl">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-3 text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </span>
          </div>
        </header>
        <main className="p-4 lg:p-6 max-w-[1400px] mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tender/:tenderId" element={<TenderDetail />} />
            <Route path="/bidders/:tenderId" element={<BidderManagement />} />
            <Route path="/results/:tenderId" element={<EvaluationResults />} />
            <Route path="/pipeline" element={<DocumentPipeline />} />
            <Route path="/forensic" element={<ForensicAnalysis />} />
            <Route path="/statutory" element={<StatutoryVerification />} />
            <Route path="/audit" element={<AuditTrail />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
