import { FileText, ScanLine, Image, FileSpreadsheet, CheckCircle, Cpu, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TENDER } from '../data/mock-data'

const allDocs = TENDER.bidders.flatMap(b => b.documents.map(d => ({ ...d, bidder: b.name })))
const ocrStats = [
  { method: 'Docling', count: allDocs.filter(d => d.ocr_used === 'docling').length, color: '#818cf8' },
  { method: 'PaddleOCR', count: allDocs.filter(d => d.ocr_used === 'paddleocr').length, color: '#a78bfa' },
  { method: 'VLM', count: 0, color: '#c084fc' },
]

const PIPELINE_STEPS = [
  { icon: FileText, title: 'Upload', desc: 'PDF, DOCX, JPG, PNG, TIFF', color: 'from-blue-500 to-cyan-500' },
  { icon: ScanLine, title: 'Format Detection', desc: 'Typed vs Scanned vs Photo', color: 'from-violet-500 to-purple-500' },
  { icon: Cpu, title: 'OCR / Parsing', desc: 'Docling → PaddleOCR → VLM', color: 'from-indigo-500 to-blue-500' },
  { icon: FileSpreadsheet, title: 'Text Extraction', desc: 'Structured data output', color: 'from-emerald-500 to-teal-500' },
  { icon: CheckCircle, title: 'Ready', desc: 'Criterion evaluation input', color: 'from-green-500 to-emerald-500' },
]

const FORMAT_SUPPORT = [
  { format: 'Machine-typed PDFs', method: 'Docling (IBM)', accuracy: '97.9%', icon: FileText },
  { format: 'Scanned Documents', method: 'PaddleOCR', accuracy: '93.8% F1', icon: ScanLine },
  { format: 'Photographs / Tilted', method: 'Vision-Language Model', accuracy: '91.2%', icon: Image },
  { format: 'Word / Excel Files', method: 'Docling Parser', accuracy: '99.1%', icon: FileSpreadsheet },
]

export default function DocumentPipeline() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Multi-Format Document Intelligence Pipeline</h1>
        <p className="text-slate-400 text-sm mt-1">No document rejected for format incompatibility — handles PDFs, scans, photos, handwritten annotations</p>
      </div>

      {/* Pipeline Visualization */}
      <div className="glass-card-static p-6">
        <h3 className="text-sm font-semibold text-white mb-5">Processing Pipeline</h3>
        <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-0">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="pipeline-node text-center min-w-[120px] animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-2`}>
                  <step.icon size={20} className="text-white" />
                </div>
                <p className="text-xs font-semibold text-white">{step.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{step.desc}</p>
              </div>
              {i < PIPELINE_STEPS.length - 1 && <ArrowRight size={16} className="text-indigo-500/50 hidden lg:block flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Format Support */}
        <div className="glass-card-static p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Supported Formats</h3>
          <div className="space-y-2">
            {FORMAT_SUPPORT.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <f.icon size={18} className="text-indigo-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-white">{f.format}</p>
                  <p className="text-[10px] text-slate-500">{f.method}</p>
                </div>
                <span className="text-xs font-semibold text-emerald-400">{f.accuracy}</span>
              </div>
            ))}
          </div>
        </div>

        {/* OCR Method Distribution */}
        <div className="glass-card-static p-5">
          <h3 className="text-sm font-semibold text-white mb-3">OCR Method Usage</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ocrStats} barCategoryGap="30%">
              <XAxis dataKey="method" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, fontSize: 12, color: '#f1f5f9' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {ocrStats.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-Document Details */}
      <div className="glass-card-static overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="font-semibold text-white text-sm">Document Processing Log</h3>
          <p className="text-xs text-slate-500 mt-0.5">{allDocs.length} documents processed across {TENDER.bidders.length} bidders</p>
        </div>
        <table className="eval-table">
          <thead>
            <tr>
              <th>Bidder</th><th>Document</th><th>OCR Method</th><th>Confidence</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allDocs.map(d => (
              <tr key={d.id}>
                <td className="text-white font-medium">{d.bidder}</td>
                <td className="flex items-center gap-1.5"><FileText size={13} className="text-indigo-400" />{d.filename}</td>
                <td><span className={`px-2 py-0.5 rounded text-[11px] font-medium ${d.ocr_used === 'docling' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-violet-500/10 text-violet-400'}`}>{d.ocr_used}</span></td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="confidence-bar flex-1 max-w-[80px]">
                      <div className="confidence-bar-fill" style={{ width: `${d.confidence * 100}%`, background: d.confidence > 0.9 ? '#34d399' : d.confidence > 0.7 ? '#fbbf24' : '#fb7185' }} />
                    </div>
                    <span className="text-xs">{(d.confidence * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td><span className="badge-eligible px-2 py-0.5 rounded-full text-[10px] font-medium"><CheckCircle size={10} className="inline mr-1" />Processed</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
