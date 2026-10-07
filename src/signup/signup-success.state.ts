export type SignupSuccessStatus = "confirmation-required" | "login" | "unknown";

const SIGNUP_SUCCESS_KEY = "odp.signup.success";

export function signupSuccessStatus(emailConfirmationRequired: boolean | undefined): SignupSuccessStatus {
  if (emailConfirmationRequired === true) return "confirmation-required";
  if (emailConfirmationRequired === false) return "login";
  return "unknown";
}

export function saveSignupSuccessStatus(status: SignupSuccessStatus) {
  try {
    window.sessionStorage.setItem(SIGNUP_SUCCESS_KEY, status);
  } catch {
    // Storage availability must never turn a completed signup into a failure.
  }
}

export function readSignupSuccessStatus(): SignupSuccessStatus {
  try {
    const status = window.sessionStorage.getItem(SIGNUP_SUCCESS_KEY);
    if (status === "confirmation-required" || status === "login") return status;
  } catch {
    // The success page can still explain both next steps without stored state.
  }
  return "unknown";
}

export function clearSignupSuccessStatus() {
  try {
    window.sessionStorage.removeItem(SIGNUP_SUCCESS_KEY);
  } catch {
    // No personal data or credentials are stored here.
  }
}
