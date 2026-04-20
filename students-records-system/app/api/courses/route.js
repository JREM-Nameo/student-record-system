import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')

    if (error) throw error

    const sorted = (data ?? []).sort((a, b) => a.code.localeCompare(b.code))
    return NextResponse.json({ data: sorted })
  } catch (err) {
    console.error('[GET /api/courses]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { code, name } = await request.json()

    if (!code?.trim() || !name?.trim())
      return NextResponse.json({ error: 'Code and name are required.' }, { status: 400 })

    const { data: existing } = await supabase
      .from('courses')
      .select('id')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle()

    if (existing)
      return NextResponse.json({ error: `Course code "${code}" already exists.` }, { status: 409 })

    const { data, error } = await supabase
      .from('courses')
      .insert([{ code: code.trim().toUpperCase(), name: name.trim() }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/courses]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}