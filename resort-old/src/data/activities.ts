import { Activity, ActivityType } from "../types/activity";

export const activities: Activity[] = [
  {
    id: 1,
    name: "Space Exploration Roller Coaster",
    description:
      "Experience an thrilling journey through simulated space with high-speed twists and turns.",
    type: "RIDE" as ActivityType,
    duration: 10,
    price: 25,
    ageLimit: 8,
    imageUrl: "/@activities.jpg",
    available: true,
  },
  {
    id: 2,
    name: "Glow-in-the-Dark Coral Ride",
    description:
      "A magical night-time experience inspired by bioluminescent coral reefs.",
    type: "RIDE" as ActivityType,
    duration: 15,
    price: 30,
    ageLimit: 6,
    imageUrl: "/@activities.jpg",
    available: true,
  },
  {
    id: 3,
    name: "Island Water Sports",
    description:
      "Enjoy various water activities including jet skiing, paddleboarding, and snorkeling.",
    type: "EXPERIENCE" as ActivityType,
    duration: 180,
    price: 70,
    imageUrl: "/mainresort.jpg",
    available: true,
  },
  {
    id: 4,
    name: "Sunset Beach Yoga",
    description:
      "Relax and rejuvenate with our beachfront yoga sessions at sunset.",
    type: "EXPERIENCE" as ActivityType,
    duration: 60,
    price: 20,
    imageUrl: "/mainresort.jpg",
    available: true,
  },
  {
    id: 5,
    name: "Cultural Dance Show",
    description:
      "Experience traditional dance performances showcasing local culture.",
    type: "SHOW" as ActivityType,
    duration: 120,
    price: 35,
    imageUrl: "/mainresort.jpg",
    available: true,
  },
];
