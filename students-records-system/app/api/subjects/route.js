import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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