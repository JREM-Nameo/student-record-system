'use client'

// components/FilterBar.js

const YEAR_LEVELS = ['All', '1', '2', '3', '4', '5']
const STATUSES = ['All', 'Active', 'Inactive', 'Graduated', 'Dropped']

export default function FilterBar({ courses = [], filters, onChange }) {
  function handleChange(key, value) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Course filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Course</label>
        <select
          value={filters.course}
          onChange={(e) => handleChange('course', e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        >
          <option value="All">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.code}>{c.code}</option>
          ))}
        </select>
      </div>

      {/* Year level filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Year Level</label>
        <select
          value={filters.yearLevel}
          onChange={(e) => handleChange('yearLevel', e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        >
          {YEAR_LEVELS.map((y) => (
            <option key={y} value={y}>{y === 'All' ? 'All Years' : `Year ${y}`}</option>
          ))}
        </select>
      </div>

      {/* Status filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">Status</label>
        <select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
          ))}
        </select>
      </div>

      {/* Reset */}
      {(filters.course !== 'All' || filters.yearLevel !== 'All' || filters.status !== 'All') && (
        <div className="flex flex-col justify-end">
          <button
            onClick={() => onChange({ course: 'All', yearLevel: 'All', status: 'All' })}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 py-2 transition"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  )
}