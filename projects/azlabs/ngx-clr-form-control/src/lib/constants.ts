/** @description Default template text to use when tranlating */
export const defaultStrings = {
  loadingText: 'Loading...',
  uploadFileLabel: 'to upload',
  dragFileLabel: 'Drag file(s) here or',
  clickUploadButtonLabel: 'Click',
  fileUploadError: 'Error while uploading file to server',
  fileSizeError: 'File size must be less than or equal to {{maxFilesize}}Mo.',
  addButtonText: 'Click on the the button to add a new input element',
  validation: {
    minlength:
      'input value must contain at least {{requiredLength}} characters',
    maxlength:
      'maximum number of characters for this input is {{requiredLength}}',
    maxLength: 'maximum number of characters for this input is {{value}}',
    minLength: 'input value must contain at least {{value}} characters',
    invalid: 'input value this input is invalid',
    required: 'input is required',
    unique: 'input value is already taken',
    email: 'input has invalid email format [example@email.com]',
    pattern: 'input value does not match the input pattern',
    min: 'minimum value for this input is {{value}}',
    max: 'maximum value for this input is {{value}}',
    phone: 'please enter a valid phone number',
    minDate: 'please enter or select a date after the date of {{date}}',
    maxDate: 'please enter or select a date before the date of {{date}}',
    exists: 'input value does not exists',
    equals: 'input and {{value}} input values does not match',
  },
};
