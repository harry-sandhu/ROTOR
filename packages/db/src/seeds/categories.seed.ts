import type { NewCategory } from "../schema/catalog.js";

export const categoriesSeed: NewCategory[] = [
  {
    key: "FRAME",
    name: "Frame",
    description: "The structural base of the drone build.",
    sortOrder: 1,
    isActive: true,
  },
  {
    key: "MOTOR",
    name: "Motor",
    description: "Brushless motors selected to match frame and power system constraints.",
    sortOrder: 2,
    isActive: true,
  },
  {
    key: "ESC",
    name: "ESC",
    description: "Electronic speed controllers that must support the selected motors and battery voltage.",
    sortOrder: 3,
    isActive: true,
  },
  {
    key: "BATTERY",
    name: "Battery",
    description: "Battery packs selected by supported cell count and power needs.",
    sortOrder: 4,
    isActive: true,
  },
  {
    key: "PROPELLER",
    name: "Propeller",
    description: "Propellers matched against frame clearance and motor recommendations.",
    sortOrder: 5,
    isActive: true,
  },
];
