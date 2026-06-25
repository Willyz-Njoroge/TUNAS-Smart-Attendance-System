/**
 * Input Validation Utilities
 * Validates and sanitizes user input for security and data integrity
 */

/** Validate email format */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength.
 * Min 8 chars, at least one uppercase, one lowercase, one number, one special char.
 */
export const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password) {
    errors.push("Password is required");
    return { isValid: false, errors };
  }
  if (password.length < 8)
    errors.push("Password must be at least 8 characters long");
  if (!/[a-z]/.test(password))
    errors.push("Password must contain at least one lowercase letter");
  if (!/[A-Z]/.test(password))
    errors.push("Password must contain at least one uppercase letter");
  if (!/\d/.test(password))
    errors.push("Password must contain at least one number");
  if (!/[!@#$%^&*()_+\-=[\]{};:'",.<>?/\\|`~]/.test(password))
    errors.push(
      "Password must contain at least one special character (!@#$%^&* etc)"
    );

  return { isValid: errors.length === 0, errors };
};

/** Validate phone number (digits, spaces, dashes, +, parentheses) */
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[\d\s\-+()]+$/;
  if (!phone) return { isValid: false, error: "Phone number is required" };
  if (phone.length < 7)
    return { isValid: false, error: "Phone number too short" };
  if (!phoneRegex.test(phone))
    return {
      isValid: false,
      error: "Phone number contains invalid characters",
    };
  return { isValid: true, error: null };
};

/** Validate full name (letters, spaces, hyphens, apostrophes; min 2 chars) */
export const validateFullName = (name) => {
  if (!name || name.trim().length < 2)
    return {
      isValid: false,
      error: "Full name must be at least 2 characters",
    };
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name))
    return { isValid: false, error: "Full name contains invalid characters" };
  return { isValid: true, error: null };
};

/**
 * Validate matric number.
 * Allows alphanumeric characters and forward-slashes (e.g. CS/001/2023).
 */
export const validateMatricNumber = (matricNo) => {
  if (!matricNo || matricNo.trim().length < 3)
    return {
      isValid: false,
      error: "Matric number must be at least 3 characters",
    };
  // Allow letters, digits, forward-slashes, and hyphens
  const matricRegex = /^[a-zA-Z0-9\/\-]+$/;
  if (!matricRegex.test(matricNo.trim()))
    return {
      isValid: false,
      error: "Matric number can only contain letters, numbers, / and -",
    };
  return { isValid: true, error: null };
};

/** Sanitize text input to prevent XSS */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
};

/** Trim and normalise internal whitespace */
export const normalizeInput = (input) => {
  if (!input) return "";
  return input.trim().replace(/\s+/g, " ");
};

/** Validate lecturer registration form */
export const validateRegistrationForm = (formData) => {
  const errors = {};

  const nameValidation = validateFullName(formData.fullName);
  if (!nameValidation.isValid) errors.fullName = nameValidation.error;

  if (!validateEmail(formData.email)) errors.email = "Invalid email format";

  const passwordValidation = validatePasswordStrength(formData.password);
  if (!passwordValidation.isValid)
    errors.password = passwordValidation.errors.join("; ");

  if (formData.password !== formData.confirmPassword)
    errors.confirmPassword = "Passwords do not match";

  const phoneValidation = validatePhoneNumber(formData.phoneNumber);
  if (!phoneValidation.isValid) errors.phoneNumber = phoneValidation.error;

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate student registration form.
 * Extends the lecturer form with a matric number and course field.
 */
export const validateStudentRegistrationForm = (formData) => {
  const errors = {};

  const nameValidation = validateFullName(formData.fullName);
  if (!nameValidation.isValid) errors.fullName = nameValidation.error;

  const matricValidation = validateMatricNumber(formData.matricNo);
  if (!matricValidation.isValid) errors.matricNo = matricValidation.error;

  if (!validateEmail(formData.email)) errors.email = "Invalid email format";

  const phoneValidation = validatePhoneNumber(formData.phoneNumber);
  if (!phoneValidation.isValid) errors.phoneNumber = phoneValidation.error;

  if (!formData.course || formData.course.trim().length < 2)
    errors.course = "Course / department is required";

  const passwordValidation = validatePasswordStrength(formData.password);
  if (!passwordValidation.isValid)
    errors.password = passwordValidation.errors.join("; ");

  if (formData.password !== formData.confirmPassword)
    errors.confirmPassword = "Passwords do not match";

  return { isValid: Object.keys(errors).length === 0, errors };
};

/** Validate login form */
export const validateLoginForm = (email, password) => {
  const errors = {};
  if (!validateEmail(email)) errors.email = "Invalid email format";
  if (!password || password.length < 1) errors.password = "Password is required";
  return { isValid: Object.keys(errors).length === 0, errors };
};