import { parsePhoneNumber, ParsedPhoneNumber } from 'awesome-phonenumber';

import { getExample } from 'awesome-phonenumber';

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
export function getPhoneNumberPlaceholder(regionCode: string) {
  try {
    const phoneNumber = getExample(regionCode, 'mobile');
    return phoneNumberAsString(phoneNumber);
  } catch (e) {
    return e;
  }
}

// @internal
export function phoneNumberAsString(number: ParsedPhoneNumber) {
  return number.number?.national;
}

// @internal
export function safeValidatePhoneNumber(
  phoneNumber: string,
  regionCode?: string
) {
  try {
    const num =  parsePhoneNumber(
      phoneNumber,
      regionCode ? { regionCode } : undefined
    );

    console.log(num);
    
    return num.valid;
  } catch (e) {
    console.log(e);
    return false;
  }
}
