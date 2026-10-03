export type CrewMember = {
  initials: string;
  name: string;
  role: string;
  line: string;
  photo?: string;
};

export const crew: CrewMember[] = [
  {
    initials: "AR",
    name: "Ana Reyes",
    role: "Commander",
    line: "Leads every mission from launch to landing.",
    photo: "/about/ana.webp",
  },
  {
    initials: "MC",
    name: "Miguel Cruz",
    role: "Pilot",
    line: "Flies the spacecraft through orbit, docking, and descent.",
    photo: "/about/miguel.webp",
  },
  {
    initials: "LB",
    name: "Liza Bautista",
    role: "Flight Engineer",
    line: "Keeps every system running in deep space.",
    photo: "/about/liza.webp",
  },
  {
    initials: "JR",
    name: "Jose Ramos",
    role: "Mission Scientist",
    line: "Turns mission data into discoveries.",
    photo: "/about/jose.webp",
  },
];
