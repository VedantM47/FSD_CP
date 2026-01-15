// src/data/mockHackathon.js
export const mockHackathon = {
  id: "1",
  name: "AI Innovation Challenge 2026",
  description: "Join us in an exciting week-long journey to build innovative AI solutions that solve real-world problems. This hackathon brings together the brightest minds to collaborate, innovate, and compete for amazing prizes.",
  organization: "Tech Institute",
  location: "Online",
  status: "Live", // Live, Draft, Closed
  startDate: "2026-01-10",
  endDate: "2026-02-15",
  registrationDeadline: "2026-01-08",
  maxTeamSize: 5,
  minTeamSize: 2,
  prizePool: "₹1,00,000",
  rules: "Open to all undergraduate and graduate students. Teams must consist of 2-5 members. Prior programming experience is recommended but not mandatory.",
  terms: "All participants must adhere to the code of conduct. Submissions must be original work. By participating, you agree to our terms and conditions.",
  registrationFee: "₹200 per team",
  totalPrizes: "₹2,00,000",
  rounds: [
    {
      id: 1,
      name: "Round 1: Ideation",
      description: "Submit your innovative idea and what you'll present",
      startDate: "2026-01-10",
      endDate: "2026-01-20"
    },
    {
      id: 2,
      name: "Round 2: Prototyping",
      description: "Build a working prototype of your solution",
      startDate: "2026-01-21",
      endDate: "2026-02-05"
    },
    {
      id: 3,
      name: "Round 3: Final Presentation",
      description: "Present your complete project to our expert judging panel",
      startDate: "2026-02-10",
      endDate: "2026-02-15"
    }
  ],
  judges: [
    { id: 1, name: "Dr. Sarah Johnson", role: "AI Research Lead" },
    { id: 2, name: "Prof. Michael Chen", role: "Computer Science" },
    { id: 3, name: "Emily Rodriguez", role: "Tech Entrepreneur" }
  ],
  problemStatement: "Design and develop an AI-powered solution that addresses a pressing social or environmental challenge. Your solution should be innovative, scalable, and have real-world impact.",
  prizes: [
    { place: "1st Place", amount: "₹1,00,000" },
    { place: "2nd Place", amount: "₹60,000" },
    { place: "3rd Place", amount: "₹40,000" }
  ],
  faqs: [
    {
      question: "Can I participate individually?",
      answer: "No, this hackathon requires teams of 2-5 members."
    },
    {
      question: "What technologies can we use?",
      answer: "You are free to use any programming language, framework, or technology stack that helps you build your solution."
    },
    {
      question: "Is there a registration deadline?",
      answer: "Yes, registration closes on January 8, 2026."
    }
  ]
};

export default mockHackathon;