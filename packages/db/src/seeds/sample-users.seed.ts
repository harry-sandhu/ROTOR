import { hashSync } from "bcryptjs";

import type { NewUser } from "../schema/auth.js";
import { stableUuid } from "./shared.js";

const demoPasswordHash = hashSync("RotorDemo123!", 10);

export const sampleUserSeeds: NewUser[] = [
  {
    id: stableUuid("user:demo"),
    email: "demo@rotor.app",
    passwordHash: demoPasswordHash,
    displayName: "Demo Pilot",
    role: "USER",
  },
  {
    id: stableUuid("user:admin"),
    email: "admin@rotor.app",
    passwordHash: demoPasswordHash,
    displayName: "Rotor Admin",
    role: "ADMIN",
  },
];
