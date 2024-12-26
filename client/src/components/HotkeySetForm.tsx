import { ArrowLeft, Loader2, MinusIcon, PlusIcon } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useHotkeys } from '../hooks/useHotkeys';
import { cn } from '../lib/utils';
import type { Hotkey } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { KeyComboInput } from './ui/key-combo-input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';

interface HotkeySetFormProps {
   onClose?: () => void;
}

const HotkeySetForm: React.FC<HotkeySetFormProps> = ({ onClose }) => {
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const { createHotkeySet, updateHotkeySet, getHotkeySet } = useHotkeys();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isLoading, setIsLoading] = useState(!!id);
   const [formData, setFormData] = useState({
      name: '',
      application: '',
      description: '',
      hotkeys: [{ id: '1', key: '', description: '', action: '' }] as Hotkey[]
   });
   const [lastDeletedHotkey, setLastDeletedHotkey] = useState<Hotkey | null>(null);

   const fetchHotkeySet = useCallback(async () => {
      if (!id) return;

      try
      {
         const hotkeySet = await getHotkeySet(id);
         setFormData({
            name: hotkeySet.name,
            application: hotkeySet.application,
            description: hotkeySet.description || '',
            hotkeys: hotkeySet.hotkeys.length > 0 ? hotkeySet.hotkeys : [{ id: '1', key: '', description: '', action: '' }]
         });
      } catch (error)
      {
         console.error('Error fetching hotkey set:', error);
         toast.error('Failed to load hotkey set');
         navigate('/');
      } finally
      {
         setIsLoading(false);
      }
   }, [id, getHotkeySet, navigate]);

   useEffect(() => {
      if (id)
      {
         fetchHotkeySet();
      }
   }, [id, fetchHotkeySet]);

   useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
         if (event.altKey && event.key === 'a')
         {
            event.preventDefault();
            addHotkeyRow();
            toast.success('Added new hotkey row', {
               description: 'Using Alt + A'
            });
         }

         if (event.altKey && event.key === 'd' && formData.hotkeys.length > 1)
         {
            event.preventDefault();
            const lastHotkeyId = formData.hotkeys[formData.hotkeys.length - 1].id;
            removeHotkeyRow(lastHotkeyId);
         }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [formData.hotkeys]);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
   };

   const handleHotkeyChange = (id: string, field: keyof Hotkey, value: string) => {
      setFormData(prev => ({
         ...prev,
         hotkeys: prev.hotkeys.map(hotkey =>
            hotkey.id === id ? { ...hotkey, [field]: value } : hotkey
         )
      }));
   };

   const addHotkeyRow = () => {
      setFormData(prev => ({
         ...prev,
         hotkeys: [...prev.hotkeys, { id: Date.now().toString(), key: '', description: '', action: '' }]
      }));
   };

   const removeHotkeyRow = (id: string) => {
      const hotkeyToDelete = formData.hotkeys.find(hotkey => hotkey.id === id);

      if (hotkeyToDelete)
      {
         setLastDeletedHotkey(hotkeyToDelete);

         setFormData(prev => ({
            ...prev,
            hotkeys: prev.hotkeys.filter(hotkey => hotkey.id !== id)
         }));

         toast('Hotkey row removed', {
            description: `Removed: ${hotkeyToDelete.key || 'Empty hotkey'}`,
            action: {
               label: 'Undo',
               onClick: () => {
                  setFormData(prev => ({
                     ...prev,
                     hotkeys: [...prev.hotkeys, hotkeyToDelete]
                  }));
                  setLastDeletedHotkey(null);
               }
            }
         });
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try
      {
         setIsSubmitting(true);

         if (!formData.name || !formData.application)
         {
            toast.error('Please fill in all required fields');
            return;
         }

         const validHotkeys = formData.hotkeys.filter(hotkey =>
            hotkey.key && hotkey.description
         );

         if (validHotkeys.length === 0)
         {
            toast.error('Please add at least one valid hotkey with key and description');
            return;
         }

         if (id)
         {
            const result = await updateHotkeySet(id, formData);
            if (result)
            {
               toast.success('Hotkey set updated successfully');
               navigate(`/view/${id}`);
            }
         } else
         {
            const result = await createHotkeySet(formData);
            if (result)
            {
               toast.success('Hotkey set created successfully');
               navigate('/');
            }
         }
      } catch (error)
      {
         console.error('Error saving hotkey set:', error);
         toast.error(id ? 'Failed to update hotkey set' : 'Failed to create hotkey set');
      } finally
      {
         setIsSubmitting(false);
      }
   };

   const handleBack = () => {
      navigate('/');
   };

   if (isLoading)
   {
      return (
         <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center space-y-4">
               <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
               <p className="text-sm text-muted-foreground">Loading hotkey set...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-background">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 border-b border-border">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                     <Button variant="ghost" onClick={handleBack} size="icon">
                        <ArrowLeft className="h-4 w-4" />
                     </Button>
                     <div>
                        <h1 className="text-2xl font-semibold text-foreground">
                           {id ? 'Edit Hotkey Set' : 'Create Hotkey Set'}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                           {id ? 'Update your hotkey set' : 'Add a new set of hotkeys for your application'}
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="py-8">
               <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid gap-6">
                     <div className="space-y-2">
                        <Label htmlFor="name">Set Name</Label>
                        <Input
                           id="name"
                           name="name"
                           value={formData.name}
                           onChange={handleInputChange}
                           placeholder="e.g., Photoshop Essential Shortcuts"
                           className="max-w-xl"
                        />
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="application">Application</Label>
                        <Input
                           id="application"
                           name="application"
                           value={formData.application}
                           onChange={handleInputChange}
                           placeholder="e.g., Adobe Photoshop"
                           className="max-w-xl"
                        />
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                           id="description"
                           name="description"
                           value={formData.description}
                           onChange={handleInputChange}
                           placeholder="Brief description of this hotkey set"
                           className="max-w-xl resize-none"
                           rows={3}
                        />
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <Label>Hotkeys</Label>
                           <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addHotkeyRow}
                              className="h-8"
                           >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Add Hotkey (Alt + A)
                           </Button>
                        </div>

                        <div className="rounded-lg border border-border">
                           <Table>
                              <TableHeader>
                                 <TableRow>
                                    <TableHead>Key Combination</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {formData.hotkeys.map((hotkey, index) => (
                                    <TableRow key={hotkey.id}>
                                       <TableCell>
                                          <KeyComboInput
                                             value={hotkey.key}
                                             onKeyComboChange={(value) => handleHotkeyChange(hotkey.id, 'key', value)}
                                             className="h-8"
                                          />
                                       </TableCell>
                                       <TableCell>
                                          <Input
                                             value={hotkey.description}
                                             onChange={(e) => handleHotkeyChange(hotkey.id, 'description', e.target.value)}
                                             placeholder="What does this hotkey do?"
                                             className="h-8"
                                          />
                                       </TableCell>
                                       <TableCell>
                                          <Input
                                             value={hotkey.action}
                                             onChange={(e) => handleHotkeyChange(hotkey.id, 'action', e.target.value)}
                                             placeholder="e.g., Copy"
                                             className="h-8"
                                          />
                                       </TableCell>
                                       <TableCell>
                                          {index > 0 && (
                                             <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeHotkeyRow(hotkey.id)}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                             >
                                                <MinusIcon className="h-4 w-4" />
                                             </Button>
                                          )}
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </div>
                     </div>
                  </div>

                  <div className="flex justify-end">
                     <Button
                        type="submit"
                        disabled={isSubmitting}
                        className={cn(
                           "bg-primary hover:bg-primary/90",
                           isSubmitting && "cursor-not-allowed opacity-70"
                        )}
                     >
                        {isSubmitting && (
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isSubmitting
                           ? (id ? 'Updating...' : 'Creating...')
                           : (id ? 'Update Hotkey Set' : 'Create Hotkey Set')}
                     </Button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
};

export default HotkeySetForm;