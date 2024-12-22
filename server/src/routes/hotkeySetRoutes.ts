import { Router } from 'express';
import {
   createHotkeySet,
   deleteHotkeySet,
   getAllHotkeySets,
   getHotkeySetById,
   updateHotkeySet
} from '../controllers/hotkeySetController';
import { validateHotkeySet } from '../middleware/validateHotkeySet';
import { validateId } from '../middleware/validateId';

const router = Router();

// GET all hotkey sets
router.get('/', getAllHotkeySets);

// GET single hotkey set by ID
router.get('/:id', validateId, getHotkeySetById);

// POST create new hotkey set
router.post('/', validateHotkeySet, createHotkeySet);

// PUT update hotkey set
router.put('/:id', validateId, validateHotkeySet, updateHotkeySet);

// DELETE hotkey set
router.delete('/:id', validateId, deleteHotkeySet);

export default router;