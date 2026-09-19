import type { EventConfig } from "../types";

const config: EventConfig = {
  name: "CascadiaJS 2026",
  year: "2026",
  dates: "June 1-2, 2026",
  venue: "Town Hall Seattle",
  location: "Seattle, WA, USA",
  logo: "/events/2026/images/icon-dark-blue.png",
  ogImage: "/images/2026/social/social-sharing-general.png",
  ogDescription: "CascadiaJS 2026 is coming up June 1 - 2 in Seattle, WA!",
  nav: [
    { label: "Networking", href: "/2026/#networking" },
    { label: "Pricing", href: "/2026/#pricing" },
    { label: "Speakers", href: "/2026/#speakers" },
    { label: "Schedule", href: "/2026/schedule" },
    { label: "Attend", href: "/2026/attend" },
    { label: "Sponsor", href: "/2026/sponsor" },
    { label: "Trainings", href: "/2026/trainings" },
    { label: "Tickets", href: "/2026/", isCta: true },
  ],
  cta: { label: "SOLD OUT", href: "/2026/" },
};

export default config;
