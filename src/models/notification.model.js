import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        hackathonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hackathon',
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['deadline', 'team_update', 'system', 'announcement'],
            default: 'deadline',
        },
        readStatus: {
            type: Boolean,
            default: false,
        },
        scheduledFor: {
            type: Date,
            required: true,
        },
        deadlineType: {
            type: String, // e.g., 'prototype', 'final', 'registration'
        }
    },
    { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
