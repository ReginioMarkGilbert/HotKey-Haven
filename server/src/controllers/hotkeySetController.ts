// Import required types from express framework for handling HTTP requests and responses
import { Request, Response } from 'express';
// Import the HotkeySet model that defines the schema and provides methods to interact with MongoDB
import { HotkeySet } from '../models/HotkeySet';

// Controller function to get all hotkey sets, sorted by their order
export const getHotkeySets = async (req: Request, res: Response) => {
   try
   {
      // HotkeySet.find() returns all documents in the collection
      // .sort({ order: 1 }) sorts them by the order field in ascending order (1 means ascending, -1 would be descending)
      // The order of .find().sort() matters because we first get all documents, then sort them
      const hotkeySets = await HotkeySet.find().sort({ order: 1 });
      // Send the sorted hotkey sets as JSON response with default 200 status code
      res.json(hotkeySets);
   } catch (error)
   {
      // If any error occurs during database operation, return 500 (server error) with error details
      res.status(500).json({ message: 'Error fetching hotkey sets', error });
   }
};

// Controller function to get a single hotkey set by its MongoDB _id
export const getHotkeySet = async (req: Request, res: Response) => {
   try
   {
      // findById is a MongoDB method that looks for a document matching the provided id
      // req.params.id comes from the URL parameter (e.g., /hotkey-sets/:id)
      const hotkeySet = await HotkeySet.findById(req.params.id);
      // If no document is found with that id, return 404 (not found)
      if (!hotkeySet)
      {
         return res.status(404).json({ message: 'Hotkey set not found' });
      }
      // If found, send the hotkey set as JSON response
      res.json(hotkeySet);
   } catch (error)
   {
      // Handle any errors during the database operation
      res.status(500).json({ message: 'Error fetching hotkey set', error });
   }
};

// Controller function to create a new hotkey set
export const createHotkeySet = async (req: Request, res: Response) => {
   try
   {
      // Create a new HotkeySet instance using the request body data
      // req.body contains the JSON data sent in the POST request
      const hotkeySet = new HotkeySet(req.body);
      // Save the new hotkey set to the database
      // .save() is a Mongoose method that creates a new document
      const savedSet = await hotkeySet.save();
      // Return 201 (created) with the newly created hotkey set
      res.status(201).json(savedSet);
   } catch (error)
   {
      // If validation fails or other errors occur, return 400 (bad request)
      res.status(400).json({ message: 'Error creating hotkey set', error });
   }
};

// Controller function to update an existing hotkey set
export const updateHotkeySet = async (req: Request, res: Response) => {
   try
   {
      // findByIdAndUpdate combines finding a document by id and updating it
      // First argument is the id to find
      // Second argument is the update data from request body
      // { new: true } tells MongoDB to return the updated document instead of the original
      const hotkeySet = await HotkeySet.findByIdAndUpdate(
         req.params.id,
         req.body,
         { new: true }
      );
      // If no document found with that id, return 404
      if (!hotkeySet)
      {
         return res.status(404).json({ message: 'Hotkey set not found' });
      }
      // Return the updated hotkey set
      res.json(hotkeySet);
   } catch (error)
   {
      // Handle validation or other errors with 400 (bad request)
      res.status(400).json({ message: 'Error updating hotkey set', error });
   }
};

// Controller function to delete a hotkey set
export const deleteHotkeySet = async (req: Request, res: Response) => {
   try
   {
      // findByIdAndDelete combines finding by id and deleting in one operation
      // Returns the deleted document (useful for confirmation)
      const hotkeySet = await HotkeySet.findByIdAndDelete(req.params.id);
      // If no document found to delete, return 404
      if (!hotkeySet)
      {
         return res.status(404).json({ message: 'Hotkey set not found' });
      }
      // Confirm successful deletion
      res.json({ message: 'Hotkey set deleted successfully' });
   } catch (error)
   {
      // Handle any database errors with 500 (server error)
      res.status(500).json({ message: 'Error deleting hotkey set', error });
   }
};

// Controller function to update the order of multiple hotkey sets at once
export const updateHotkeySetOrder = async (req: Request, res: Response) => {
   try
   {
      // Extract the sets array from request body using destructuring
      const { sets } = req.body;
      // Log the received data for debugging purposes
      console.log('Received reorder request:', sets);

      // Validate that sets is actually an array
      if (!Array.isArray(sets))
      {
         return res.status(400).json({
            message: 'Invalid request format. Expected an array of sets.',
            received: sets
         });
      }

      // Ensure the sets array is not empty
      if (sets.length === 0)
      {
         return res.status(400).json({
            message: 'Empty sets array provided'
         });
      }

      // Validate each set object has required properties
      for (const set of sets)
      {
         if (!set.id || typeof set.order !== 'number')
         {
            return res.status(400).json({
               message: 'Invalid set format. Each set must have id and order properties.',
               invalidSet: set
            });
         }
      }

      // Create an array of update promises to perform all updates in parallel
      // This is more efficient than updating one at a time
      const updatePromises = sets.map(({ id, order }) =>
         HotkeySet.findByIdAndUpdate(
            id,
            { order },
            { new: true }
         )
      );

      // Wait for all updates to complete
      const updatedSets = await Promise.all(updatePromises);

      // Check if any updates failed (returned null)
      if (updatedSets.some(set => !set))
      {
         return res.status(404).json({
            message: 'One or more hotkey sets not found'
         });
      }

      // Fetch all sets in their new order to return consistent data
      const finalSets = await HotkeySet.find().sort({ order: 1 });
      console.log('Successfully updated sets order');
      // Return the final sorted list of all sets
      res.json(finalSets);
   } catch (error)
   {
      // Log the full error for debugging
      console.error('Error updating hotkey set order:', error);
      // Return a user-friendly error message
      res.status(400).json({
         message: 'Error updating hotkey set order',
         error: error instanceof Error ? error.message : 'Unknown error'
      });
   }
};