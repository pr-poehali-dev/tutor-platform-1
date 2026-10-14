import MarathonLanding from "@/components/marathon/MarathonLanding";
import MarathonCabinet from "@/components/marathon/MarathonCabinet";
import { TEACHER_PROGRAM } from "@/components/marathon/teacherProgram";
import { PARENT_PROGRAM } from "@/components/marathon/parentProgram";
import { MarathonTrack } from "@/components/marathon/types";

interface Props {
  track: MarathonTrack;
  cabinet?: boolean;
}

/** Марафон скорочтения: лендинг или кабинет участника для педагогов и родителей. */
export default function ReadingMarathon({ track, cabinet }: Props) {
  const program = track === "teacher" ? TEACHER_PROGRAM : PARENT_PROGRAM;
  const other = track === "teacher" ? PARENT_PROGRAM : TEACHER_PROGRAM;

  return cabinet ? <MarathonCabinet program={program} /> : <MarathonLanding program={program} other={other} />;
}
