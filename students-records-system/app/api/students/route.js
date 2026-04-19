// app/api/students/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const STUDENT_SELECT = `
  *,
  courses ( id, code, name ),
  student_subjects (
    id,
    subject_id,
    subjects ( id, code, name, units )
  ),
  grades (
    id,
    grade,
    semester,
    school_year,
    student_subject_id,
    subject_id,
    subjects ( id, code, name, units )
  )
`

// ─── GET all students ────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search    = searchParams.get('search')    ?? ''
    const course    = searchParams.get('course')    ?? 'All'
    const yearLevel = searchParams.get('yearLevel') ?? 'All'
    const status    = searchParams.get('status')    ?? 'All'

    let query = supabase
      .from('students')
      .select(STUDENT_SELECT)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,student_id.ilike.%${search}%,email.ilike.%${search}%`
      )
    }
    if (yearLevel !== 'All') query = query.eq('year_level', parseInt(yearLevel))
    if (status    !== 'All') query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error

    let result = data ?? []
    if (course !== 'All') {
      result = result.filter((s) => s.courses?.code === course)
    }

    return NextResponse.json({ data: result })
  } catch (err) {
    console.error('[GET /api/students]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ─── POST create student ─────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json()
    const { grades: gradeMap, subjects, semester, school_year, ...studentFields } = body

    // 1. Check duplicate student_id
    const { data: existing } = await supabase
      .from('students')
      .select('id')
      .eq('student_id', studentFields.student_id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: `Student ID "${studentFields.student_id}" already exists.` },
        { status: 409 }
      )
    }

    // 2. Check duplicate email
    const { data: existingEmail } = await supabase
      .from('students')
      .select('id')
      .eq('email', studentFields.email)
      .maybeSingle()

    if (existingEmail) {
      return NextResponse.json(
        { error: `Email "${studentFields.email}" is already in use.` },
        { status: 409 }
      )
    }

    // 3. Insert student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([{
        student_id: studentFields.student_id,
        first_name: studentFields.first_name,
        last_name:  studentFields.last_name,
        email:      studentFields.email,
        course_id:  studentFields.course_id,
        year_level: parseInt(studentFields.year_level),
        status:     studentFields.status,
      }])
      .select()
      .single()

    if (studentError) throw studentError

    // 4. Insert student_subjects
    const ssRows = subjects.map((s) => ({
      student_id: student.id,
      subject_id: s.id,
    }))

    const { data: enrollments, error: ssError } = await supabase
      .from('student_subjects')
      .insert(ssRows)
      .select()

    if (ssError) throw ssError

    // 5. Insert grades using student_subject_id
    const gradeRows = subjects.map((s) => {
      const enrollment = enrollments.find((e) => e.subject_id === s.id)
      return {
        student_subject_id: enrollment.id,
        student_id:         student.id,
        subject_id:         s.id,
        grade:              parseFloat(gradeMap[s.code]),
        semester,
        school_year,
      }
    })

    const { error: gradesError } = await supabase
      .from('grades')
      .insert(gradeRows)

    if (gradesError) throw gradesError

    return NextResponse.json({ data: student }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/students]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}