// app/api/students/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const STUDENT_SELECT = `
  *,
  courses ( id, code, name ),
  grades!grades_student_id_fkey (
    id,
    grade,
    semester,
    school_year,
    subject_id,
    subjects!grades_subject_id_fkey ( id, code, name, units )
  )
`

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
    console.error('[GET /api/students]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { grades: gradeMap, subjects, semester, school_year, ...studentFields } = body

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

    // Step 3: Create enrollments in student_subjects table
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('student_subjects')
      .insert(subjects.map((s) => ({ student_id: student.id, subject_id: s.id })))
      .select()

    if (enrollmentError) throw new Error('Step 3 (insert enrollments): ' + enrollmentError.message)

    // Step 4: Create grade rows using the enrollment IDs
    const gradeRows = subjects.map((s) => {
      const enrollment = enrollments.find((e) => e.subject_id === s.id)
      const rawGrade   = gradeMap[s.code]
      return {
        student_subject_id: enrollment.id,
        student_id:         student.id,
        subject_id:         s.id,
        grade:              rawGrade,
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
    console.error('[POST /api/students]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}