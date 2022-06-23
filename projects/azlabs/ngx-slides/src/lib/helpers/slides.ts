import { Slide } from "../models/slide";

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
