// lib/helpers.js

/**
 * Compute weighted GWA from grades array
 * Each grade must have: grade (number), subjects: { units (number) }
 */
export function computeGWA(grades) {
  const numeric = grades.filter((g) => !isSpecialGrade(String(g.grade)))
  if (numeric.length === 0) return null

  const totalUnits  = numeric.reduce((sum, g) => sum + (g.subjects?.units ?? g.units ?? 0), 0)
  const weightedSum = numeric.reduce((sum, g) => {
    const units     = g.subjects?.units ?? g.units ?? 0
    const converted = percentToGradeScale(g.grade)
    return sum + (converted ?? 0) * units
  }, 0)

  if (totalUnits === 0) return null
  return Math.round((weightedSum / totalUnits) * 100) / 100
}

/**
 * Converts percentage (65–100) to 1.0–5.0 scale
 * Below 75 = 5.0 (failed)
 */
export function percentToGradeScale(percent) {
  const n = parseFloat(percent)
  if (isNaN(n)) return null
  if (n >= 97)  return 1.0
  if (n >= 94)  return 1.25
  if (n >= 91)  return 1.5
  if (n >= 88)  return 1.75
  if (n >= 85)  return 2.0
  if (n >= 82)  return 2.25
  if (n >= 79)  return 2.5
  if (n >= 76)  return 2.75
  if (n >= 75)  return 3.0
  return 5.0
}

export const SPECIAL_GRADES = ['INC']

export function isSpecialGrade(grade) {
  return SPECIAL_GRADES.includes(String(grade))
}

// Grades are already stored as 'INC' or numeric strings, no normalization needed
export function normalizeGrades(grades = []) {
  return grades
}

/**
 * Get remark and color based on GWA (1.0-5.0 scale)
 */
export function getGWARemark(gwa) {
  if (gwa === null || gwa === undefined) return null
  if (gwa <= 1.0)  return { label: 'Excellent',   color: 'green'  }
  if (gwa <= 1.5)  return { label: 'Very Good',    color: 'green'  }
  if (gwa <= 2.0)  return { label: 'Good',         color: 'blue'   }
  if (gwa <= 2.5)  return { label: 'Satisfactory', color: 'cyan'   }
  if (gwa <= 3.0)  return { label: 'Passing',      color: 'yellow' }
  return                   { label: 'Failed',       color: 'red'    }
}

/**
 * Check if a grade is passing (>= 75)
 */
export function isPassing(grade) {
  return parseFloat(grade) >= 75
}

/**
 * Get full name from student object
 */
export function getFullName(student) {
  if (!student) return ''
  return `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim()
}

/**
 * Get color key for student status badge
 */
export function getStatusColor(status) {
  const map = {
    Active:    'green',
    Inactive:  'yellow',
    Graduated: 'blue',
    Dropped:   'red',
  }
  return map[status] ?? 'yellow'
}

/**
 * Attach computed GWA to each student object
 */
export function attachGWA(students) {
  return students.map((s) => ({
    ...s,
    grades: normalizeGrades(s.grades ?? []),
    gwa: computeGWA(normalizeGrades(s.grades ?? [])),
  }))
}

/**
 * Compute overall average GWA across all students
 */
export function computeOverallGWA(students) {
  const withGWA = students.map((s) => s.gwa).filter((g) => g != null)
  if (withGWA.length === 0) return null
  return parseFloat((withGWA.reduce((a, b) => a + b, 0) / withGWA.length).toFixed(2))
}

/**
 * Group students by course code
 */
export function groupByCourse(students) {
  return students.reduce((acc, s) => {
    const code = s.courses?.code ?? 'Unknown'
    acc[code] = (acc[code] ?? 0) + 1
    return acc
  }, {})
}