// app/api/subjects/[id]/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request, { params }) {
  try {
    const { data, error } = await supabase
      .from('subjects')
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
    const { code, name, units } = body

    if (!code?.trim() || !name?.trim() || !units)
      return NextResponse.json({ error: 'Code, name, and units are required.' }, { status: 400 })

    if (isNaN(units) || parseInt(units) < 1 || parseInt(units) > 6)
      return NextResponse.json({ error: 'Units must be between 1 and 6.' }, { status: 400 })

    const { data: existing } = await supabase
      .from('subjects')
      .select('id')
      .eq('code', code.trim().toUpperCase())
      .neq('id', params.id)
      .maybeSingle()

    if (existing)
      return NextResponse.json({ error: `Subject code "${code}" already exists.` }, { status: 409 })

    const { data, error } = await supabase
      .from('subjects')
      .update({ code: code.trim().toUpperCase(), name: name.trim(), units: parseInt(units) })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (err) {
    console.error('[PUT /api/subjects/[id]]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check if subject has grades linked
    const { data: grades } = await supabase
      .from('grades')
      .select('id')
      .eq('subject_id', params.id)
      .limit(1)

    if (grades?.length > 0)
      return NextResponse.json(
        { error: 'Cannot delete subject — it has grades linked to it.' },
        { status: 409 }
      )

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ message: 'Subject deleted.' })
  } catch (err) {
    console.error('[DELETE /api/subjects/[id]]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}