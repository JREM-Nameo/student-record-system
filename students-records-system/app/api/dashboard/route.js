// app/api/dashboard/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { attachGWA, computeOverallGWA, groupByCourse } from '@/lib/helpers'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        courses ( code, name ),
        grades!grades_student_id_fkey (
          grade,
          subjects!grades_subject_id_fkey ( units )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    const students   = attachGWA(data ?? [])
    const total      = students.length
    const active     = students.filter((s) => s.status === 'Active').length
    const graduated  = students.filter((s) => s.status === 'Graduated').length
    const dropped    = students.filter((s) => s.status === 'Dropped').length
    const inactive   = students.filter((s) => s.status === 'Inactive').length
    const overallGWA = computeOverallGWA(students)
    const byCourse   = groupByCourse(students)
    const recent     = students.slice(0, 5)

    return NextResponse.json(
      { data: { total, active, graduated, dropped, inactive, overallGWA, byCourse, recent } },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (err) {
    console.error('[GET /api/dashboard]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}