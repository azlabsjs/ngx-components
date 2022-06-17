import {
  PhoneNumber,
  PhoneNumberFormat,
  PhoneNumberUtil,
} from 'google-libphonenumber';

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
  const instance = PhoneNumberUtil.getInstance();
  try {
    const phoneNumber = instance.parse('90000505', region);
    return phoneNumberAsString(instance, phoneNumber, format);
  } catch (e) {
    return e;
  }
}

// @internal
export function phoneNumberAsString(
  instance: PhoneNumberUtil,
  number: PhoneNumber,
  format: PhoneNumberFormat
) {
  instance = instance || PhoneNumberUtil.getInstance();
  return instance.format(number, format);
}

// @internal
export function safeValidatePhoneNumber(
  instance: PhoneNumberUtil,
  phoneNumber: string
) {
  try {
    return !instance.isValidNumber(
      instance.parseAndKeepRawInput(sanitize(String(phoneNumber) as string))
    )
      ? false
      : true;
  } catch (e) {
    return false;
  }
}
