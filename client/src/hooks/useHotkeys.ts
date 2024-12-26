import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { HotkeySet } from '../types';

const API_URL = 'http://localhost:5000/api';

export const useHotkeys = () => {
   const [hotkeySets, setHotkeySets] = useState<HotkeySet[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const fetchHotkeySets = useCallback(async () => {
      try
      {
         setLoading(true);
         const response = await axios.get(`${API_URL}/hotkey-sets`);
         const sortedSets = response.data.sort((a: HotkeySet, b: HotkeySet) => a.order - b.order);
         setHotkeySets(sortedSets);
      } catch (err)
      {
         console.error('Error fetching hotkey sets:', err);
         setError(err as Error);
      } finally
      {
         setLoading(false);
      }
   }, []);

   const getHotkeySet = useCallback(async (id: string) => {
      try
      {
         const response = await axios.get(`${API_URL}/hotkey-sets/${id}`);
         return response.data;
      } catch (err)
      {
         console.error('Error fetching hotkey set:', err);
         setError(err as Error);
         throw err;
      }
   }, []);

   const createHotkeySet = async (hotkeySet: Omit<HotkeySet, '_id' | 'createdAt' | 'updatedAt' | 'order'>) => {
      try
      {
         setLoading(true);
         const maxOrder = hotkeySets.reduce((max, set) => Math.max(max, set.order), -1);
         const newSet = { ...hotkeySet, order: maxOrder + 1 };

         const response = await axios.post(`${API_URL}/hotkey-sets`, newSet);
         setHotkeySets(prev => [...prev, response.data]);
         return response.data;
      } catch (err)
      {
         console.error('Error creating hotkey set:', err);
         setError(err as Error);
         throw err;
      } finally
      {
         setLoading(false);
      }
   };

   const updateHotkeySet = async (id: string, hotkeySet: Partial<HotkeySet>) => {
      try
      {
         setLoading(true);
         const response = await axios.put(`${API_URL}/hotkey-sets/${id}`, hotkeySet);
         setHotkeySets(prev => prev.map(set => set._id === id ? response.data : set));
         return response.data;
      } catch (err)
      {
         console.error('Error updating hotkey set:', err);
         setError(err as Error);
         throw err;
      } finally
      {
         setLoading(false);
      }
   };

   const updateHotkeySetOrder = async (reorderedSets: { id: string; order: number }[]) => {
      try
      {
         setLoading(true);
         console.log('Sending reorder request:', { sets: reorderedSets });

         const response = await axios.put(`${API_URL}/hotkey-sets/reorder`, {
            sets: reorderedSets.map(set => ({
               id: set.id,
               order: Number(set.order) // Ensure order is a number
            }))
         });

         // Update local state with the response data
         const updatedSets = response.data;
         setHotkeySets(updatedSets);
         return updatedSets;
      } catch (err)
      {
         console.error('Error updating hotkey set order:', err);
         const error = err as Error;
         const message = error.message || 'Failed to update order';
         setError(error);
         throw new Error(message);
      } finally
      {
         setLoading(false);
      }
   };

   const deleteHotkeySet = async (id: string) => {
      try
      {
         setLoading(true);
         const response = await axios.delete(`${API_URL}/hotkey-sets/${id}`);
         if (response.status === 200)
         {
            setHotkeySets(prev => prev.filter(set => set._id !== id));
            return true;
         }
         return false;
      } catch (err)
      {
         console.error('Error deleting hotkey set:', err);
         setError(err as Error);
         throw err;
      } finally
      {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchHotkeySets();
   }, [fetchHotkeySets]);

   return {
      hotkeySets,
      loading,
      error,
      getHotkeySet,
      createHotkeySet,
      updateHotkeySet,
      updateHotkeySetOrder,
      deleteHotkeySet,
      refreshHotkeySets: fetchHotkeySets
   };
};