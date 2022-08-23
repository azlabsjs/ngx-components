import {parsePhoneNumber, PhoneNumber, PhoneNumberFormat} from 'awesome-phonenumber';

// @internal
export function sanitize(value: string) {
  if (value.startsWith('00')) {
    return `+${value.slice(2)}`;
  } else if (value.startsWith('+')) {
    return value;
  } else {
    return `+${value}`;
  }
}

// @internal
export function getPhoneNumberPlaceholder(
  region: string,
  format: PhoneNumberFormat
) {
  // const instance = PhoneNumberUtil.getInstance();
  try {
    const phoneNumber = parsePhoneNumber('90000505', region);
    return phoneNumberAsString(phoneNumber, format);
  } catch (e) {
    return e;
  }
}

// @internal
export function phoneNumberAsString(
  number: PhoneNumber,
  format: PhoneNumberFormat
) {
  // instance = instance || PhoneNumberUtil.getInstance();
  // return instance.format(number, format);
  return number.getNumber(format);
}

// @internal
export function safeValidatePhoneNumber(
  // instance: PhoneNumberUtil,
  phoneNumber: string
) {
  try {
    // return !instance.isValidNumber(
    //   instance.parseAndKeepRawInput(sanitize(String(phoneNumber) as string))
    // )
    //   ? false
    //   : true;
    return parsePhoneNumber(phoneNumber).isValid();
  } catch (e) {
    return false;
  }
}
