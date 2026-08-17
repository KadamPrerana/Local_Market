// Form validation utility functions following coding challenge rules

export function validateName(name) {
  if (!name || name.trim().length === 0) {
    return "Name is required.";
  }
  const len = name.trim().length;
  if (len < 20) {
    return `Name must be at least 20 characters long (currently ${len}).`;
  }
  if (len > 60) {
    return `Name must not exceed 60 characters (currently ${len}).`;
  }
  return null;
}

export function validateAddress(address) {
  if (!address || address.trim().length === 0) {
    return "Address is required.";
  }
  const len = address.trim().length;
  if (len > 400) {
    return `Address must not exceed 400 characters (currently ${len}).`;
  }
  return null;
}

export function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return "Email is required.";
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address (e.g., user@example.com).";
  }
  return null;
}

export function validatePassword(password) {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < 8 || password.length > 16) {
    return `Password must be between 8 and 16 characters (currently ${password.length}).`;
  }
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return "Password must include at least one uppercase letter (A-Z).";
  }
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasSpecialChar) {
    return "Password must include at least one special character (e.g. !@#$%^&*).";
  }
  return null;
}

// Calculate store overall average rating
export function calculateStoreRating(storeId, ratings) {
  const storeRatings = ratings.filter((r) => r.storeId === storeId);
  if (storeRatings.length === 0) return { avg: 0, count: 0 };
  const sum = storeRatings.reduce((acc, curr) => acc + curr.rating, 0);
  const avg = (sum / storeRatings.length).toFixed(1);
  return { avg: parseFloat(avg), count: storeRatings.length };
}

// Get store rating if user is store owner
export function getOwnerStoreRating(ownerId, stores, ratings) {
  const store = stores.find((s) => s.ownerId === ownerId);
  if (!store) return null;
  return calculateStoreRating(store.id, ratings);
}
