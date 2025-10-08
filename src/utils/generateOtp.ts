import otpgenerator from "otp-generator";

export const generateOtp = (): string => {
  const otpCode = otpgenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
  return otpCode;
};