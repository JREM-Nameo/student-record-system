// app/api/courses/[id]/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', params.id)
      .single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const { code, name } = body

    if (!code?.trim() || !name?.trim())
      return NextResponse.json({ error: 'Code and name are required.' }, { status: 400 })

    // Check duplicate code excluding self
    const { data: existing } = await supabase
      .from('courses')
      .select('id')
      .eq('code', code.trim().toUpperCase())
      .neq('id', params.id)
      .maybeSingle()

    if (existing)
      return NextResponse.json({ error: `Course code "${code}" already exists.` }, { status: 409 })

    const { data, error } = await supabase
      .from('courses')
      .update({ code: code.trim().toUpperCase(), name: name.trim() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[PUT /api/courses/[id]]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check if any students are enrolled in this course
    const { data: students } = await supabase
      .from('students')
      .select('id')
      .eq('course_id', params.id)
      .limit(1)

    if (students?.length > 0)
      return NextResponse.json(
        { error: 'Cannot delete course — students are currently enrolled in it.' },
        { status: 409 }
      )

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ message: 'Course deleted.' })
  } catch (err) {
    console.error('[DELETE /api/courses/[id]]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}