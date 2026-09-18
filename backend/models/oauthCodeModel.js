const mongoose = require("mongoose");

const oauthCodeSchema = new mongoose.Schema(
    {
        codeHash: {
            type: String,
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        expiresAt: {
            type: Date,
            required: true
        },

        used: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("OAuthCode", oauthCodeSchema);