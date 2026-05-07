const mongoose = require("mongoose");

const MeetingSchema =
  new mongoose.Schema({

    /* User */

    userId: {
      type: String,
      default: "demo-user"
    },

    /* Audio File */

    audioFile: {
      type: String,
      required: true
    },

    filePath: {
      type: String,
      default: ""
    },

    /* AI Fields */

    transcript: {
      type: String,
      default: ""
    },

    summary: {
      type: String,
      default: ""
    },

    /* Settings */

    meetingType: {
      type: String,
      default: "General"
    },

    language: {
      type: String,
      default: "English"
    },

    /* Date */

    date: {
      type: Date,
      default: Date.now
    }

  });

module.exports =
  mongoose.model(
    "Meeting",
    MeetingSchema
  );