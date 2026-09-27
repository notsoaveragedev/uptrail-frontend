export type PasswordRule = {
  label: string;
  passed: boolean;
};

const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];

const BREACHED_PASSWORDS = ["password123", "Password123", "Qwerty12345", "Welcome2024"];

export function getPasswordRules(password: string): PasswordRule[] {
  return [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "Upper and lowercase letters", passed: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "At least one number", passed: /\d/.test(password) },
  ];
}

export function isPasswordValid(password: string) {
  return getPasswordRules(password).every((rule) => rule.passed);
}

export function getPasswordStrength(password: string) {
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password) || password.length >= 14,
  ];
  const score = checks.filter(Boolean).length;
  return { score, label: STRENGTH_LABELS[score] };
}

export function isBreachedPassword(password: string) {
  return BREACHED_PASSWORDS.includes(password);
}
