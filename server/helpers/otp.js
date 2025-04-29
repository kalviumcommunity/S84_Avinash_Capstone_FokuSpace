// helpers/otp.js
const otpGenerator = require('otp-generator');

const generateOTP = () => {
    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, specialChars: false });
    return otp;
};

module.exports = generateOTP;
