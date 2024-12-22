import { Request, Response } from 'express';
import { HotkeySet } from '../models/HotkeySet';

// Get all hotkey sets
export const getAllHotkeySets = async (req: Request, res: Response) => {
   try
   {
      const hotkeySets = await HotkeySet.find().sort({ createdAt: -1 });
      res.json(hotkeySets);
   } catch (error)
   {
      console.error('Error fetching hotkey sets:', error);
      res.status(500).json({ message: 'Error fetching hotkey sets', error });
   }
};

// Get a single hotkey set by ID
export const getHotkeySetById = async (req: Request, res: Response) => {
   try
   {
      const hotkeySet = await HotkeySet.findById(req.params.id);
      if (!hotkeySet)
      {
         return res.status(404).json({ message: 'Hotkey set not found' });
      }
      res.json(hotkeySet);
   } catch (error)
   {
      console.error('Error fetching hotkey set:', error);
      res.status(500).json({ message: 'Error fetching hotkey set', error });
   }
};

// Create a new hotkey set
export const createHotkeySet = async (req: Request, res: Response) => {
   try
   {
      const newHotkeySet = new HotkeySet(req.body);
      const savedHotkeySet = await newHotkeySet.save();
      res.status(201).json(savedHotkeySet);
   } catch (error)
   {
      console.error('Error creating hotkey set:', error);
      res.status(400).json({ message: 'Error creating hotkey set', error });
   }
};

// Update a hotkey set
export const updateHotkeySet = async (req: Request, res: Response) => {
   try
   {
      const updatedHotkeySet = await HotkeySet.findByIdAndUpdate(
         req.params.id,
         req.body,
         { new: true, runValidators: true }
      );
      if (!updatedHotkeySet)
      {
         return res.status(404).json({ message: 'Hotkey set not found' });
      }
      res.json(updatedHotkeySet);
   } catch (error)
   {
      console.error('Error updating hotkey set:', error);
      res.status(400).json({ message: 'Error updating hotkey set', error });
   }
};

// Delete a hotkey set
export const deleteHotkeySet = async (req: Request, res: Response) => {
   try
   {
      console.log('Attempting to delete hotkey set with ID:', req.params.id);

      const deletedHotkeySet = await HotkeySet.findByIdAndDelete(req.params.id);

      if (!deletedHotkeySet)
      {
         console.log('Hotkey set not found for deletion');
         return res.status(404).json({ message: 'Hotkey set not found' });
      }

      console.log('Successfully deleted hotkey set:', deletedHotkeySet);
      res.json({ message: 'Hotkey set deleted successfully', deletedSet: deletedHotkeySet });
   } catch (error)
   {
      console.error('Error deleting hotkey set:', error);
      res.status(500).json({ message: 'Error deleting hotkey set', error });
   }
};