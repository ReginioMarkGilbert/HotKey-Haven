import express from 'express';
import {
   createHotkeySet,
   deleteHotkeySet,
   getHotkeySet,
   getHotkeySets,
   updateHotkeySet,
   updateHotkeySetOrder
} from '../controllers/hotkeySetController';
import { validateHotkeySet } from '../middleware/validateHotkeySet';

const router = express.Router();

// Get all hotkey sets
router.get('/', getHotkeySets);

// Create a new hotkey set
router.post('/', validateHotkeySet, createHotkeySet);

// Reorder hotkey sets - must be before /:id routes
router.put('/reorder', updateHotkeySetOrder);

// Get a single hotkey set
router.get('/:id', getHotkeySet);

// Update a hotkey set
router.put('/:id', validateHotkeySet, updateHotkeySet);

// Delete a hotkey set
router.delete('/:id', deleteHotkeySet);

export default router;