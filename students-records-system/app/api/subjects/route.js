import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')

    if (error) throw error

    const sorted = (data ?? []).sort((a, b) => a.name.localeCompare(b.name))
    return NextResponse.json({ data: sorted })
  } catch (err) {
    console.error('[GET /api/subjects]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { code, name, units } = await request.json()

    if (!code?.trim() || !name?.trim() || !units)
      return NextResponse.json({ error: 'Code, name, and units are required.' }, { status: 400 })

    if (isNaN(units) || parseInt(units) < 1 || parseInt(units) > 6)
      return NextResponse.json({ error: 'Units must be between 1 and 6.' }, { status: 400 })

    const { data: existing } = await supabase
      .from('subjects')
      .select('id')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle()

    if (existing)
      return NextResponse.json({ error: `Subject code "${code}" already exists.` }, { status: 409 })

    const { data, error } = await supabase
      .from('subjects')
      .insert([{ code: code.trim().toUpperCase(), name: name.trim(), units: parseInt(units) }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/subjects]', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}