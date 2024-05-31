/** @description Country instances type declaration */
export type Country = {
  name: string;
  iso2: string;
  dialCode: string;
  priority: number;
  areaCode?: number;
  flagClass: string;
  placeHolder: string;
};
