  const otpGenerator = require('otp-generator');

  const generateOTP = () => {
    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    console.log('Generated OTP:', otp); // Remove in production
    return otp;
  };

  module.exports = generateOTP;