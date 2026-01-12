const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserAccount"
    },
    fullName: String,
    relation: {
        type: String,
        enum: ["spouse", "daughter", "son", "father", "mother"]
    },
    mobile: {
        type: Number,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: String,
    gender: {
        type: String,
        enum: ["male", "female", "others"]
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    }
});

const FamilyMember = mongoose.model("FamilyMember", familyMemberSchema);
module.exports = FamilyMember;