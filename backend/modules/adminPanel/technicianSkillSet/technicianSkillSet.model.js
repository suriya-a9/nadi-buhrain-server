const mongoose = require('mongoose');

const technicianSkillSetSchema = new mongoose.Schema({
    skill: {
        type: String
    }
}, { timestamps: true });

const TechnicalSkillSet = mongoose.model("TechnicalSkillSet", technicianSkillSetSchema);
module.exports = TechnicalSkillSet;