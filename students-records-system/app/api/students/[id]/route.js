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

export async function GET(request, { params }) {
  try {
    const { data, error } = await supabase
      .from('students')
      .select(STUDENT_SELECT)
      .eq('id', params.id)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Student not found.' }, { status: 404 })

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[GET /api/students/[id]]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const { grades: gradeMap, subjects, semester, school_year, ...studentFields } = body

    // 1. Check email uniqueness
    const { data: existingEmail } = await supabase
      .from('students')
      .select('id')
      .eq('email', studentFields.email)
      .neq('id', params.id)
      .maybeSingle()

    if (existingEmail) {
      return NextResponse.json(
        { error: `Email "${studentFields.email}" is already in use.` },
        { status: 409 }
      )
    }

    // 2. Update student info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .update({
        first_name: studentFields.first_name,
        last_name:  studentFields.last_name,
        email:      studentFields.email,
        course_id:  studentFields.course_id,
        year_level: parseInt(studentFields.year_level),
        status:     studentFields.status,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (studentError) throw new Error('Step 2 (update student): ' + studentError.message)

    // 3. Get current enrollments
    const { data: currentEnrollments, error: fetchError } = await supabase
      .from('student_subjects')
      .select('id, subject_id')
      .eq('student_id', params.id)

    if (fetchError) throw new Error('Step 3 (fetch enrollments): ' + fetchError.message)

    const currentSubjectIds = currentEnrollments.map((e) => e.subject_id)
    const newSubjectIds     = subjects.map((s) => s.id)

    const toAdd    = subjects.filter((s) => !currentSubjectIds.includes(s.id))
    const toRemove = currentEnrollments.filter((e) => !newSubjectIds.includes(e.subject_id))

    // 4. Remove dropped enrollments (grades cascade delete automatically)
    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('student_subjects')
        .delete()
        .in('id', toRemove.map((e) => e.id))

      if (deleteError) throw new Error('Step 4 (delete enrollments): ' + deleteError.message)
    }

    // 5. Insert new enrollments
    let newEnrollments = []
    if (toAdd.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('student_subjects')
        .insert(toAdd.map((s) => ({ student_id: params.id, subject_id: s.id })))
        .select()

      if (insertError) throw new Error('Step 5 (insert enrollments): ' + insertError.message)
      newEnrollments = inserted
    }

    // 6. Build full enrollment map (kept + newly added)
    const allEnrollments = [
      ...currentEnrollments.filter((e) => newSubjectIds.includes(e.subject_id)),
      ...newEnrollments,
    ]

    // 7. Upsert grades for all enrolled subjects
    const gradeRows = subjects.map((s) => {
      const enrollment = allEnrollments.find((e) => e.subject_id === s.id)
      if (!enrollment) throw new Error(`Step 7: No enrollment found for subject ${s.code}`)
      return {
        student_subject_id: enrollment.id,
        student_id:         params.id,
        subject_id:         s.id,
        grade:              parseFloat(gradeMap[s.code]),
        semester,
        school_year,
      }
    })

    const { error: gradesError } = await supabase
      .from('grades')
      .upsert(gradeRows, { onConflict: 'student_subject_id,semester,school_year' })

    if (gradesError) throw new Error('Step 7 (upsert grades): ' + gradesError.message)

    return NextResponse.json({ data: student })
  } catch (err) {
    console.error('[PUT /api/students/[id]]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ message: 'Student deleted successfully.' })
  } catch (err) {
    console.error('[DELETE /api/students/[id]]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}