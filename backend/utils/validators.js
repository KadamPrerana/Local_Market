export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return 'Name is required.';
  }
  const trimmed = name.trim();
  if (trimmed.length < 20) {
    return `Must be at least 20 characters (current: ${trimmed.length}).`;
  }
  if (trimmed.length > 60) {
    return `Cannot exceed 60 characters (current: ${trimmed.length}).`;
  }
  return null;
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email address is required.';
  }
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    return 'Address is required.';
  }
  const trimmed = address.trim();
  if (trimmed.length === 0) {
    return 'Address cannot be empty.';
  }
  if (trimmed.length > 400) {
    return `Address cannot exceed 400 characters (current: ${trimmed.length}).`;
  }
  return null;
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }
  if (password.length < 8 || password.length > 16) {
    return `Password must be 8–16 characters long (current: ${password.length}).`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character (e.g. !@#$%^&*).';
  }
  return null;
}
