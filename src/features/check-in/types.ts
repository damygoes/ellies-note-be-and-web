import type { Symptom } from "@/db/schema/checkInEntry";

export type CheckInEntry = {
  id: string;
  userId: string;
  checkInDate: string | null;
  energyLevel: number;
  symptoms: Symptom[];
  notes: string | null;
  createdAt: string;
};
