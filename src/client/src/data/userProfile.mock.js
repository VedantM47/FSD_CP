export const userProfile = {
  name: "Sanika",
  email: "sanika@gmail.com",
  college: "Vishwakarma Institute of Technology",
  course: "B.Tech Computer Science & Engineering",
  location: "Pune",

  stats: {
    hackathons: 12,
    wins: 3,
    active: 2,
  },

  activeHackathons: [
    {
      id: 1,
      title: "AI Innovation Challenge 2026",
      organizer: "Google Developers",
      round: "Round 2 - Prototype",
      deadline: "Jan 15, 2026",
    },
    {
      id: 2,
      title: "FinTech Hackathon",
      organizer: "JP Morgan Chase",
      round: "Round 1 - Ideation",
      deadline: "Jan 12, 2026",
    },
  ],

  activity: [
    { text: "Qualified for Round 2 in AI Innovation Challenge", time: "2 hours ago" },
    { text: "Submitted Round 1 for FinTech Hackathon", time: "1 day ago" },
    { text: "Joined team 'Tech Innovators'", time: "2 days ago" },
    { text: "Results announced: 1st Place in Web3 Challenge", time: "5 days ago" },
  ],

  team: {
    name: "Tech Innovators",
    open: true,
    members: [
      { name: "John Doe", leader: true },
      { name: "Sarah Wilson" },
      { name: "Mike Chen" },
    ],
  },
};