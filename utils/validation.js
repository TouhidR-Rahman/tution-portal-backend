// Email validation
export const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = password => {
  // At least 6 characters, contains letters and numbers
  //const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  //return passwordRegex.test(password);
  return true;
};

// Phone number validation
export const isValidPhoneNumber = phone => {
  // Basic phone number validation (10+ digits)
  const phoneRegex = /^\d{10,}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

// Required field validation
export const isRequired = value => {
  return value && value.toString().trim().length > 0;
};

// Validate tutor opportunity data
export const validateTutorOpportunity = data => {
  const errors = [];

  if (!isRequired(data.title)) errors.push("Title is required");
  if (!isRequired(data.tutionType)) errors.push("Tution type is required");
  if (!isRequired(data.location)) errors.push("Location is required");
  if (!data.salary || data.salary <= 0) errors.push("Valid salary is required");
  if (!data.experienceLevel || data.experienceLevel < 0)
    errors.push("Experience level is required");
  if (!data.requirements || data.requirements.length === 0)
    errors.push("Requirements are required");

  return errors;
};

// Validate user registration data
export const validateUserRegistration = data => {
  const errors = [];

  if (!isRequired(data.fullname)) errors.push("Full name is required");
  if (!isValidEmail(data.email)) errors.push("Valid email is required");
  if (!isValidPhoneNumber(data.phoneNumber))
    errors.push("Valid phone number is required");
  if (!isValidPassword(data.password))
    errors.push(
      "Password must be at least 6 characters with letters and numbers",
    );
  if (!["Tutor", "Recruiter"].includes(data.role))
    errors.push("Valid role is required");

  return errors;
};
