const validateEmail = (email) => {
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(String(email).toLowerCase());
};

const validateIndianPhone = (phone) => {
  if (!phone) return false;
  // Cleans spaces/hyphens/+91
  const clean = phone.replace(/\D/g, '').slice(-10);
  const re = /^[6-9]\d{9}$/;
  return re.test(clean);
};

const validateIndianPincode = (pincode) => {
  if (!pincode) return false;
  const clean = String(pincode).trim();
  const re = /^[1-9][0-9]{5}$/;
  return re.test(clean);
};

module.exports = {
  validateEmail,
  validateIndianPhone,
  validateIndianPincode
};
