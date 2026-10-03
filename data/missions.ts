export type MissionStatus = "complete" | "active" | "planned";

export type Mission = {
  code: string;
  name: string;
  meaning: string;
  year: number;
  destination: string;
  status: MissionStatus;
  goal: string;
};

export const missions: Mission[] = [
  {
    code: "ASA-001",
    name: "Liwayway",
    meaning: "Dawn",
    year: 2022,
    destination: "International Space Station",
    status: "complete",
    goal: "Prove crews live and work safely in orbit.",
  },
  {
    code: "ASA-002",
    name: "Bituin",
    meaning: "Star",
    year: 2023,
    destination: "Lunar orbit",
    status: "complete",
    goal: "Scout landing sites for a future lunar base.",
  },
  {
    code: "ASA-003",
    name: "Hiraya",
    meaning: "Dreams made real",
    year: 2025,
    destination: "Venus orbit",
    status: "complete",
    goal: "Study the Venus atmosphere to learn how planets heat up.",
  },
  {
    code: "ASA-004",
    name: "Sinag",
    meaning: "Ray of light",
    year: 2026,
    destination: "Mars",
    status: "active",
    goal: "Build the first agency outpost on another world.",
  },
];
