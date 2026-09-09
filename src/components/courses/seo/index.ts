import { CourseSeoCopy, CourseSeoMap } from "./types";
import { AI_COPY } from "./copyAi";
import { IT_COPY } from "./copyIt";
import { BUSINESS_COPY } from "./copyBusiness";
import { HUMAN_COPY } from "./copyHuman";

export type { CourseSeoCopy } from "./types";

/** Продающие SEO-описания курсов для взрослых, собранные по направлениям. */
export const COURSE_SEO_COPY: CourseSeoMap = {
  ...AI_COPY,
  ...IT_COPY,
  ...BUSINESS_COPY,
  ...HUMAN_COPY,
};

export function getCourseSeoCopy(id: number): CourseSeoCopy | undefined {
  return COURSE_SEO_COPY[id];
}
