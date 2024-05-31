import { Slide } from "../models/slide";

/** @description Creates a slide object from the list of provided parameters */
export const createSlide = (
  id: string | number,
  src: string,
  alt?: string,
  title?: string
) =>
  ({
    src,
    title,
    alt,
    id,
  } as Slide);
