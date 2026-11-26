/**
 * Form validation helpers shared by the login, reset-password and profile screens.
 * Every function returns an error message, or `undefined` when the value is fine.
 */

export const PASSWORD_MIN_LENGTH = 8

export function validateEmail(value: string): string | undefined {
  const email = value.trim()
  if (!email) return 'Email is required.'
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return 'Enter a valid email address, like name@example.com.'
  }
  return undefined
}

/** Login only checks that something sensible was typed; the strict rules apply to NEW passwords. */
export function validateLoginPassword(value: string): string | undefined {
  if (!value) return 'Password is required.'
  if (value.length < 6) return 'Password must be at least 6 characters.'
  return undefined
}

export interface PasswordRule {
  id: string
  label: string
  test: (value: string) => boolean
}

/** Rules for choosing a new password. The reset screen shows these as a live checklist. */
export const PASSWORD_RULES: readonly PasswordRule[] = [
  { id: 'length', label: `At least ${PASSWORD_MIN_LENGTH} characters`, test: (v) => v.length >= PASSWORD_MIN_LENGTH },
  { id: 'letter', label: 'At least one letter', test: (v) => /[A-Za-z]/.test(v) },
  { id: 'number', label: 'At least one number', test: (v) => /\d/.test(v) },
]

export function validateNewPassword(value: string): string | undefined {
  if (!value) return 'Password is required.'
  const failed = PASSWORD_RULES.find((rule) => !rule.test(value))
  return failed ? `Password needs: ${failed.label.toLowerCase()}.` : undefined
}

export function validateConfirmPassword(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Please type the password again.'
  if (confirm !== password) return 'The two passwords do not match.'
  return undefined
}