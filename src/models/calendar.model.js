import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['Registration', 'Submission', 'Results', 'Evaluation'],
            required: true,
        },
        status: {
            type: String,
            enum: ['Upcoming', 'Ongoing', 'Past'],
            required: true,
        },
        hackathon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hackathon',
        },
        hackathonName: {
            type: String,
        },
        description: {
            type: String,
        },
    },
    { timestamps: true }
);

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
export default CalendarEvent;
