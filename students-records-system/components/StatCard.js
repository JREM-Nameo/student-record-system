// components/StatCard.js

export default function StatCard({ label, value, icon: Icon, color = 'indigo', sub }) {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    green:  'bg-green-500/10  text-green-400  border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    red:    'bg-red-500/10    text-red-400    border-red-500/20',
    blue:   'bg-blue-500/10   text-blue-400   border-blue-500/20',
    cyan:   'bg-cyan-500/10   text-cyan-400   border-cyan-500/20',
  }

  const iconClass = colorMap[color] || colorMap.indigo

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex items-center gap-4 hover:border-slate-500 transition-colors">
      {Icon && (
        <div className={`p-3 rounded-xl border ${iconClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}