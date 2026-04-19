// components/StudentCard.js
import Link from 'next/link'
import { Pencil, Trash2, Mail, BookOpen, CalendarDays, Hash } from 'lucide-react'
import { getFullName, getStatusColor } from '@/lib/helpers'

export default function StudentCard({ student, onDelete }) {
  const fullName = getFullName(student)
  const statusColor = getStatusColor(student.status)

  const statusColorMap = {
    green:  'bg-green-500/10  text-green-400  border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    blue:   'bg-blue-500/10   text-blue-400   border-blue-500/20',
    red:    'bg-red-500/10    text-red-400    border-red-500/20',
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="bg-indigo-600 rounded-full w-14 h-14 flex items-center justify-center shrink-0">
            <span className="text-white text-xl font-bold">
              {student.first_name?.[0]?.toUpperCase()}{student.last_name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">{fullName}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{student.student_id}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${statusColorMap[statusColor]}`}>
          {student.status}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <InfoRow icon={Mail} label="Email" value={student.email} />
        <InfoRow icon={BookOpen} label="Course" value={student.courses?.name ?? student.courses?.code ?? '—'} />
        <InfoRow icon={CalendarDays} label="Year Level" value={`Year ${student.year_level}`} />
        <InfoRow icon={Hash} label="Student ID" value={student.student_id} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-700">
        <Link
          href={`/students/${student.id}/edit`}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Link>
        <button
          onClick={() => onDelete(student)}
          className="flex items-center gap-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-slate-700/50 p-2 rounded-lg shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-white text-sm font-medium mt-0.5 break-all">{value ?? '—'}</p>
      </div>
    </div>
  )
}