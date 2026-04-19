// app/api/dashboard/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { attachGWA, computeOverallGWA, groupByCourse } from '@/lib/helpers'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        student_id,
        first_name,
        last_name,
        status,
        year_level,
        courses ( code, name ),
        grades (
          grade,
          subjects ( units )
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

    return NextResponse.json({
      data: { total, active, graduated, dropped, inactive, overallGWA, byCourse, recent },
    })
  } catch (err) {
    console.error('[GET /api/dashboard]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}