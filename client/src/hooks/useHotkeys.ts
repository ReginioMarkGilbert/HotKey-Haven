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
         console.log('Fetched hotkey sets:', response.data);
         setHotkeySets(response.data);
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
         console.log('Fetched single hotkey set:', response.data);
         return response.data;
      } catch (err)
      {
         console.error('Error fetching hotkey set:', err);
         setError(err as Error);
         throw err;
      }
   }, []);

   const createHotkeySet = async (hotkeySet: Omit<HotkeySet, '_id' | 'createdAt' | 'updatedAt'>) => {
      try
      {
         setLoading(true);
         const response = await axios.post(`${API_URL}/hotkey-sets`, hotkeySet);
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
      deleteHotkeySet,
      refreshHotkeySets: fetchHotkeySets
   };
};