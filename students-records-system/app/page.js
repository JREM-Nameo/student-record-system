'use client'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StatCard from '@/components/StatCard'
import { Users, GraduationCap, TrendingUp, UserX, PlusCircle, BookOpen, RefreshCw } from 'lucide-react'
import { getFullName } from '@/lib/helpers'

export default function DashboardPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res  = await fetch(`/api/dashboard?_=${Date.now()}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setStats(json.data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const total      = stats?.total      ?? 0
  const active     = stats?.active     ?? 0
  const graduated  = stats?.graduated  ?? 0
  const dropped    = stats?.dropped    ?? 0
  const overallGWA = stats?.overallGWA ?? null
  const byCourse   = stats?.byCourse   ?? {}
  const recent     = stats?.recent     ?? []

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Overview of all student records
            {lastRefresh && (
              <span className="ml-2 text-xs">
                · Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/students/add"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition w-fit"
          >
            <PlusCircle className="w-4 h-4" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-sm">
          Failed to load dashboard: {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Students" value={total}     icon={Users}         color="indigo" />
            <StatCard label="Active"          value={active}    icon={TrendingUp}    color="green"  />
            <StatCard label="Graduated"       value={graduated} icon={GraduationCap} color="blue"   />
            <StatCard label="Dropped"         value={dropped}   icon={UserX}         color="red"    />
          </div>

          {/* Overall GWA */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-1">Overall Average GWA</p>
            <p className="text-4xl font-bold text-white">{overallGWA ?? '—'}</p>
            <p className="text-slate-500 text-sm mt-1">Across all {total} students</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* By Course */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Students by Course</h2>
              </div>
              {Object.keys(byCourse).length === 0 ? (
                <p className="text-slate-500 text-sm">No data yet.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(byCourse)
                    .sort((a, b) => b[1] - a[1])
                    .map(([code, count]) => {
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0
                      return (
                        <div key={code}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-white font-medium">{code}</span>
                            <span className="text-slate-400">{count} student{count !== 1 ? 's' : ''} · {pct}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>

            {/* Recent */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Recently Added</h2>
                </div>
                <Link href="/students" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                  View all →
                </Link>
              </div>
              {recent.length === 0 ? (
                <p className="text-slate-500 text-sm">No students yet.</p>
              ) : (
                <div className="space-y-2">
                  {recent.map((s) => (
                    <Link
                      key={s.id}
                      href={`/students/${s.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-600/20 text-indigo-400 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shrink-0">
                          {s.first_name?.[0]}{s.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium group-hover:text-indigo-300 transition">
                            {getFullName(s)}
                          </p>
                          <p className="text-slate-500 text-xs">{s.student_id} · {s.courses?.code}</p>
                        </div>
                      </div>
                      <span className="text-slate-400 text-xs font-mono">
                        {s.gwa != null ? `GWA ${s.gwa}` : '—'}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  )
}