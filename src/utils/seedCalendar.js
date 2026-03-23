import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CalendarEvent from '../models/calendar.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const events = [
    {
        title: "Registration Opens",
        date: new Date("2026-01-10"),
        time: "10:00 AM",
        type: "Registration",
        status: "Upcoming",
        hackathonName: "AI Innovation Challenge",
        description: "Start your journey in the AI Innovation Challenge."
    },
    {
        title: "Project Submission",
        date: new Date("2026-01-20"),
        time: "11:59 PM",
        type: "Submission",
        status: "Ongoing",
        hackathonName: "Green Earth Hack",
        description: "Submit your eco-friendly solutions."
    },
    {
        title: "Results Announcement",
        date: new Date("2026-01-18"),
        time: "03:00 PM",
        type: "Results",
        status: "Past",
        hackathonName: "Innovation Hub",
        description: "Winners will be announced live."
    }
];

const seedDB = async () => {
    try {
        // Check if mongo URI exists
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hackathon_db'; // fallback
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        await CalendarEvent.deleteMany({});
        await CalendarEvent.insertMany(events);
        console.log("Database Seeded!");
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
