// ============================================================
// lib/validation.js
// Form validation for Student Record Management System
// ============================================================

// ------------------------------------------------------------
// STUDENT INFO VALIDATION
// ------------------------------------------------------------

export function validateStudentId(studentId) {
  const errors = []

  if (!studentId || studentId.trim() === '') {
    errors.push('Student ID is required.')
  } else if (!/^\d{4}-\d{2}$/.test(studentId.trim())) {
    errors.push('Student ID must follow the format YYYY-NN (e.g. 2024-01).')
  }

  return errors
}

export function validateFirstName(firstName) {
  const errors = []

  if (!firstName || firstName.trim() === '') {
    errors.push('First name is required.')
  } else if (firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters.')
  } else if (firstName.trim().length > 50) {
    errors.push('First name must not exceed 50 characters.')
  } else if (!/^[a-zA-Z\s\-'.]+$/.test(firstName.trim())) {
    errors.push('First name must only contain letters, spaces, hyphens, or apostrophes.')
  }

  return errors
}

export function validateLastName(lastName) {
  const errors = []

  if (!lastName || lastName.trim() === '') {
    errors.push('Last name is required.')
  } else if (lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters.')
  } else if (lastName.trim().length > 50) {
    errors.push('Last name must not exceed 50 characters.')
  } else if (!/^[a-zA-Z\s\-'.]+$/.test(lastName.trim())) {
    errors.push('Last name must only contain letters, spaces, hyphens, or apostrophes.')
  }

  return errors
}

export function validateEmail(email) {
  const errors = []

  if (!email || email.trim() === '') {
    errors.push('Email is required.')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('Please enter a valid email address.')
  } else if (email.trim().length > 100) {
    errors.push('Email must not exceed 100 characters.')
  }

  return errors
}

export function validateCourse(courseId) {
  const errors = []

  if (!courseId || courseId.trim() === '') {
    errors.push('Please select a course.')
  }

  return errors
}

export function validateYearLevel(yearLevel) {
  const errors = []
  const parsed = parseInt(yearLevel)

  if (!yearLevel && yearLevel !== 0) {
    errors.push('Year level is required.')
  } else if (isNaN(parsed)) {
    errors.push('Year level must be a number.')
  } else if (parsed < 1 || parsed > 5) {
    errors.push('Year level must be between 1 and 5.')
  }

  return errors
}

export function validateStatus(status) {
  const errors = []
  const validStatuses = ['Active', 'Inactive', 'Graduated', 'Dropped']

  if (!status || status.trim() === '') {
    errors.push('Status is required.')
  } else if (!validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}.`)
  }

  return errors
}

// ------------------------------------------------------------
// ENROLLMENT VALIDATION
// ------------------------------------------------------------

/**
 * Validates that at least one subject is selected
 */
export function validateEnrolledSubjects(enrolledSubjectIds) {
  const errors = []

  if (!enrolledSubjectIds || enrolledSubjectIds.length === 0) {
    errors.push('Please select at least one subject.')
  }

  return errors
}

// ------------------------------------------------------------
// GRADE VALIDATION
// ------------------------------------------------------------

export function validateGrade(grade, subjectName = 'Grade') {
  const errors = []
  const parsed = parseFloat(grade)

  if (grade === '' || grade === null || grade === undefined) {
    errors.push(`${subjectName} is required.`)
  } else if (isNaN(parsed)) {
    errors.push(`${subjectName} must be a valid number.`)
  } else if (parsed < 0 || parsed > 100) {
    errors.push(`${subjectName} must be between 0 and 100.`)
  }

  return errors
}

/**
 * Validates grades only for enrolled subjects
 */
export function validateGrades(grades, subjects) {
  const errors = {}

  if (!subjects || subjects.length === 0) {
    return {}
  }

  for (const subject of subjects) {
    const grade = grades?.[subject.code]
    const gradeErrors = validateGrade(grade, subject.name)
    if (gradeErrors.length > 0) {
      errors[subject.code] = gradeErrors
    }
  }

  return errors
}

// ------------------------------------------------------------
// SEMESTER & SCHOOL YEAR VALIDATION
// ------------------------------------------------------------

export function validateSemester(semester) {
  const errors = []
  const validSemesters = ['1st', '2nd', 'Summer']

  if (!semester || semester.trim() === '') {
    errors.push('Semester is required.')
  } else if (!validSemesters.includes(semester)) {
    errors.push(`Semester must be one of: ${validSemesters.join(', ')}.`)
  }

  return errors
}

export function validateSchoolYear(schoolYear) {
  const errors = []

  if (!schoolYear || schoolYear.trim() === '') {
    errors.push('School year is required.')
  } else if (!/^\d{4}-\d{4}$/.test(schoolYear.trim())) {
    errors.push('School year must follow the format YYYY-YYYY (e.g. 2024-2025).')
  } else {
    const [startYear, endYear] = schoolYear.split('-').map(Number)
    if (endYear !== startYear + 1) {
      errors.push('School year must be consecutive years (e.g. 2024-2025).')
    }
  }

  return errors
}

// ------------------------------------------------------------
// FULL FORM VALIDATION
// ------------------------------------------------------------

/**
 * Validates the entire Add/Edit student form
 * subjects here = only the enrolled subjects (already filtered)
 */
export function validateStudentForm(formData, subjects) {
  const errors = {}

  // Student info
  const studentIdErrors = validateStudentId(formData.student_id)
  if (studentIdErrors.length > 0) errors.student_id = studentIdErrors

  const firstNameErrors = validateFirstName(formData.first_name)
  if (firstNameErrors.length > 0) errors.first_name = firstNameErrors

  const lastNameErrors = validateLastName(formData.last_name)
  if (lastNameErrors.length > 0) errors.last_name = lastNameErrors

  const emailErrors = validateEmail(formData.email)
  if (emailErrors.length > 0) errors.email = emailErrors

  const courseErrors = validateCourse(formData.course_id)
  if (courseErrors.length > 0) errors.course_id = courseErrors

  const yearLevelErrors = validateYearLevel(formData.year_level)
  if (yearLevelErrors.length > 0) errors.year_level = yearLevelErrors

  const statusErrors = validateStatus(formData.status)
  if (statusErrors.length > 0) errors.status = statusErrors

  // Semester + school year
  const semesterErrors = validateSemester(formData.semester)
  if (semesterErrors.length > 0) errors.semester = semesterErrors

  const schoolYearErrors = validateSchoolYear(formData.school_year)
  if (schoolYearErrors.length > 0) errors.school_year = schoolYearErrors

  // Enrolled subjects — must select at least one
  const enrolledErrors = validateEnrolledSubjects(formData.enrolledSubjectIds)
  if (enrolledErrors.length > 0) errors.enrolledSubjectIds = enrolledErrors[0]

  // Grades — only validate for enrolled subjects
  const gradeErrors = validateGrades(formData.grades, subjects)
  if (Object.keys(gradeErrors).length > 0) errors.grades = gradeErrors

  const isValid = Object.keys(errors).length === 0

  return { isValid, errors }
}

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

export function getFieldError(errors, field) {
  if (!errors || !errors[field]) return null
  if (Array.isArray(errors[field])) return errors[field][0]
  if (typeof errors[field] === 'string') return errors[field]
  return null
}

export function getGradeError(errors, subjectCode) {
  if (!errors?.grades || !errors.grades[subjectCode]) return null
  return errors.grades[subjectCode][0]
}