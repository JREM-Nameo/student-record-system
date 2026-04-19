// components/EmptyState.js
import { Users } from 'lucide-react'
import Link from 'next/link'

export default function EmptyState({
  title = 'No students found',
  description = 'Try adjusting your search or filters, or add a new student.',
  action = true,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-slate-800 border border-slate-700 rounded-full p-5 mb-4">
        <Users className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs">{description}</p>
      {action && (
        <Link
          href="/students/add"
          className="mt-5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
        >
          Add Student
        </Link>
      )}
    </div>
  )
}