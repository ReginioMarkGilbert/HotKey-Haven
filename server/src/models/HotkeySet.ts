import mongoose from 'mongoose';

const hotkeySchema = new mongoose.Schema({
   id: { type: String, required: true },
   key: { type: String, required: true },
   description: { type: String, required: true },
   action: { type: String }
});

const hotkeySetSchema = new mongoose.Schema({
   name: { type: String, required: true },
   application: { type: String, required: true },
   description: { type: String },
   hotkeys: [hotkeySchema],
   order: { type: Number, default: 0 },
}, {
   timestamps: true
});

// Add index for order field
hotkeySetSchema.index({ order: 1 });

export const HotkeySet = mongoose.model('HotkeySet', hotkeySetSchema);