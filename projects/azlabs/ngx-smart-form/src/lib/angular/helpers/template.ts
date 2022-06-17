/**
 * Default template text to use when tranlating
 */
export function useDefaultTemplateText() {
  return {
    loadingText: 'Loading...',
    uploadFileLabel: 'to upload',
    dragFileLabel: 'Drag file(s) here or',
    clickUploadButtonLabel: 'Click',
    validation: {
      maxValue: 'The maximum number of characters for this field is {{value}}',
      minValue: 'This field must contain at least {{value}} characters',
      invalid: 'The value of this field is invalid',
      required: 'This field is required',
      unique: 'Value is already taken',
      email: 'Invalid email format [example@email.com]',
      pattern: 'Value does not match the input pattern',
      min: 'The minimum value for this field is {{value}}',
      max: 'The maximum value for this field is {{value}}',
      phone: 'Please enter a valid phone number {{value}}',
      passwordPattern:
        'Password value must contain at least {{value}} characters',
      passwordMatch:
        'Password field and password confirmation values ​​do not match',
      minDate: 'Please enter or select a date after the date of {{date}}',
      maxDate: 'Please enter or select a date before the date of {{date}}',
      parentUUIDInvalid:
        'The specified godfather is either inextant or already has the maximum number of godchildren',
      emailTakenError: 'This email address is already taken.',
    },
  };
}
