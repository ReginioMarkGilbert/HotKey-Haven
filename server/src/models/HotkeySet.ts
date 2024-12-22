import { Schema, model } from 'mongoose';

// Schemaless model with minimal validation
const HotkeySetSchema = new Schema({
   // We'll only enforce that the document has a name and application
   name: { type: String, required: true },
   application: { type: String, required: true }
}, {
   timestamps: true,
   versionKey: false,
   strict: false // This makes the schema flexible/schemaless
});

export const HotkeySet = model('HotkeySet', HotkeySetSchema);