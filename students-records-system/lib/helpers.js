// lib/helpers.js

/**
 * Compute weighted GWA from grades array
 * Each grade must have: grade (number), subjects: { units (number) }
 */
export function computeGWA(grades) {
  if (!grades || grades.length === 0) return null
  const totalUnits = grades.reduce((sum, g) => sum + g.subjects.units, 0)
  if (totalUnits === 0) return null
  const weightedSum = grades.reduce((sum, g) => sum + g.grade * g.subjects.units, 0)
  return parseFloat((weightedSum / totalUnits).toFixed(2))
}

/**
 * Get remark and color based on GWA
 */
export function getGWARemark(gwa) {
  if (gwa == null) return null
  if (gwa >= 90) return { label: 'Excellent',    color: 'green'  }
  if (gwa >= 85) return { label: 'Very Good',    color: 'blue'   }
  if (gwa >= 80) return { label: 'Good',         color: 'cyan'   }
  if (gwa >= 75) return { label: 'Satisfactory', color: 'yellow' }
  return             { label: 'Failed',        color: 'red'    }
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
    gwa: computeGWA(s.grades ?? []),
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