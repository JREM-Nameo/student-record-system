// components/GradeDisplay.js
import { getGWARemark, isPassing } from '@/lib/helpers'
import { CheckCircle, XCircle } from 'lucide-react'

function GradeBar({ grade }) {
  const isInc = grade === 'INC'
  const numericGrade = parseFloat(grade)
  const passing = !isInc && !isNaN(numericGrade) && numericGrade >= 75
  const width = isInc ? '0%' : `${Math.min(numericGrade, 100)}%`

  return (
    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${
          isInc ? 'bg-yellow-500' : passing ? 'bg-green-500' : 'bg-red-500'
        }`}
        style={{ width }}
      />
    </div>
  )
}

export default function GradeDisplay({ grades = [], gwa }) {
  const remark = getGWARemark(gwa)

  const remarkColorMap = {
    green:  'bg-green-500/10  text-green-400  border-green-500/20',
    blue:   'bg-blue-500/10   text-blue-400   border-blue-500/20',
    cyan:   'bg-cyan-500/10   text-cyan-400   border-cyan-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    red:    'bg-red-500/10    text-red-400    border-red-500/20',
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      {/* GWA Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">General Weighted Average</p>
          <p className="text-white text-3xl font-bold mt-0.5">{gwa ?? '—'}</p>
        </div>
        {remark && (
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${remarkColorMap[remark.color]}`}>
            {remark.label}
          </span>
        )}
      </div>

      {/* Grades Table */}
      {grades.length > 0 ? (
        <div className="space-y-4">
          {grades.map((g) => {
            const isInc = g.grade === 'INC'
            const numericGrade = parseFloat(g.grade)
            const passing = !isInc && !isNaN(numericGrade) && numericGrade >= 75
            return (
              <div key={g.subjects?.code || g.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {isInc ? (
                      <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-xs text-black font-bold">!</span>
                      </div>
                    ) : passing ? (
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span className="text-sm text-white font-medium">
                      {g.subjects?.name ?? g.subject_code}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({g.subjects?.units ?? '?'} units)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      isInc ? 'text-yellow-400' :
                      passing ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {g.grade}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isInc
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : passing
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {isInc ? 'INC' : passing ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                </div>
                <GradeBar grade={g.grade} />
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-slate-500 text-sm text-center py-4">No grades recorded yet.</p>
      )}

      {/* Semester & School Year */}
      {grades[0] && (
        <div className="mt-5 pt-4 border-t border-slate-700 flex gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Semester</p>
            <p className="text-white text-sm font-medium mt-0.5">{grades[0].semester}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">School Year</p>
            <p className="text-white text-sm font-medium mt-0.5">{grades[0].school_year}</p>
          </div>
        </div>
      )}
    </div>
  )
}