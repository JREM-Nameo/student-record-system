// app/api/debug/route.js
// TEMPORARY - delete this file after confirming tables exist
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const results = {}

  const tables = ['courses', 'subjects', 'students', 'grades']
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(5)
    results[table] = error ? { error: error.message } : { count: data.length, sample: data }
  }

  return NextResponse.json(results)
}