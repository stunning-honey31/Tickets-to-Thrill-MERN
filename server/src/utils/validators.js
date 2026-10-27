// Small, reusable, server-side validation functions - same rules the
// original PHP app used in classes.php, so every form (register,
// contact, profile edit, ...) gets consistent limits regardless of
// what the client sent.

function vName(name) {
  return typeof name === 'string' && /^[a-zA-Z' -]{2,120}$/.test(name.trim());
}

function vEmail(email) {
  return (
    typeof email === 'string' &&
    email.length <= 190 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
}

function vPhone(phone) {
  if (!phone) return true; // optional field
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function vPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    password.length <= 72 &&
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

function vLength(str, min, max) {
  return typeof str === 'string' && str.trim().length >= min && str.trim().length <= max;
}

function vCardNumber(num) {
  const digits = String(num || '').replace(/\D/g, '');
  return digits.length >= 13 && digits.length <= 19;
}

function vExpiry(expiry) {
  return typeof expiry === 'string' && /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.trim());
}

function vCvv(cvv) {
  return typeof cvv === 'string' && /^\d{3,4}$/.test(cvv.trim());
}

/** Visit date must be a real, parseable date and not in the past (today is allowed). */
function vVisitDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

module.exports = { vName, vEmail, vPhone, vPassword, vLength, vCardNumber, vExpiry, vCvv, vVisitDate };
