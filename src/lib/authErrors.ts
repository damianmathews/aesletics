/**
 * Convert Firebase auth error codes to user-friendly messages
 */
export function getAuthErrorMessage(error: any): string {
  const errorCode = error?.code || '';

  switch (errorCode) {
    // Login errors
    case 'auth/user-not-found':
      return 'Account not found. Please check your email or sign up.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/invalid-email':
      return 'Invalid email address. Please check and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later or reset your password.';

    // Signup errors
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';

    // Network errors
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';

    // Password reset errors
    case 'auth/expired-action-code':
      return 'Password reset link has expired. Please request a new one.';
    case 'auth/invalid-action-code':
      return 'Invalid password reset link. Please request a new one.';

    // Google login errors
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Pop-up blocked by browser. Please allow pop-ups and try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized. Please contact support.';

    // Generic fallback
    default:
      // Remove "Firebase: " prefix and "(auth/...)" suffix from default message
      const message = error?.message || 'Authentication failed. Please try again.';
      return message
        .replace(/^Firebase:\s*/i, '')
        .replace(/\s*\(auth\/[^)]+\)\.?$/i, '')
        .trim() || 'Authentication failed. Please try again.';
  }
}
