'use client'

// components/StudentTable.js
import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, Eye } from 'lucide-react'
import { getFullName, getGWARemark, getStatusColor } from '@/lib/helpers'
import EmptyState from './EmptyState'

const PAGE_SIZE = 10

const COLUMNS = [
  { key: 'student_id', label: 'Student ID' },
  { key: 'name',       label: 'Name' },
  { key: 'course',     label: 'Course' },
  { key: 'year_level', label: 'Year' },
  { key: 'gwa',        label: 'GWA' },
  { key: 'status',     label: 'Status' },
]

function SortIcon({ column, sortConfig }) {
  if (sortConfig.key !== column) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600" />
  return sortConfig.dir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
    : <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
}

export default function StudentTable({ students = [], onDelete }) {
  const [sortConfig, setSortConfig] = useState({ key: 'student_id', dir: 'asc' })
  const [page, setPage] = useState(1)

  const statusColorMap = {
    green:  'bg-green-500/10  text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    blue:   'bg-blue-500/10   text-blue-400',
    red:    'bg-red-500/10    text-red-400',
  }

  // Sort
  function handleSort(key) {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
    setPage(1)
  }

  function getValue(student, key) {
    if (key === 'name') return getFullName(student).toLowerCase()
    if (key === 'course') return student.courses?.code ?? ''
    if (key === 'gwa') return student.gwa ?? 0
    return student[key] ?? ''
  }

  const sorted = [...students].sort((a, b) => {
    const aVal = getValue(a, sortConfig.key)
    const bVal = getValue(b, sortConfig.key)
    const cmp = typeof aVal === 'number'
      ? aVal - bVal
      : String(aVal).localeCompare(String(bVal))
    return sortConfig.dir === 'asc' ? cmp : -cmp
  })

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (students.length === 0) return <EmptyState />

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white select-none"
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    <SortIcon column={col.key} sortConfig={sortConfig} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {paginated.map((student) => {
              const remark = getGWARemark(student.gwa)
              const statusColor = getStatusColor(student.status)
              return (
                <tr
                  key={student.id}
                  className="bg-slate-800 hover:bg-slate-750 transition-colors group"
                >
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">{student.student_id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-600/20 text-indigo-400 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0">
                        {student.first_name?.[0]}{student.last_name?.[0]}
                      </div>
                      <span className="text-white font-medium">{getFullName(student)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{student.courses?.code ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300">Year {student.year_level}</td>
                  <td className="px-4 py-3">
                    {student.gwa != null ? (
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{student.gwa}</span>
                        {remark && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-${remark.color}-500/10 text-${remark.color}-400`}>
                            {remark.label}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColorMap[statusColor]}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/students/${student.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/students/${student.id}/edit`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => onDelete(student)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-500 text-xs">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} students
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  p === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}