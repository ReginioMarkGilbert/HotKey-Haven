import { ArrowLeft, Loader2, MinusIcon, PlusIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useHotkeys } from '../hooks/useHotkeys';
import { cn } from '../lib/utils';
import type { Hotkey } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';

interface HotkeySetFormProps {
   onClose?: () => void;
}

const HotkeySetForm: React.FC<HotkeySetFormProps> = ({ onClose }) => {
   const navigate = useNavigate();
   const { createHotkeySet } = useHotkeys();
   const [isSubmitting, setIsSubmitting] = useState(false);

   const [formData, setFormData] = useState({
      name: '',
      application: '',
      description: '',
      hotkeys: [{ id: '1', key: '', description: '', action: '' }] as Hotkey[]
   });

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
      setFormData(prev => ({
         ...prev,
         hotkeys: prev.hotkeys.filter(hotkey => hotkey.id !== id)
      }));
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
            hotkey.key && hotkey.description && hotkey.action
         );

         if (validHotkeys.length === 0)
         {
            toast.error('Please add at least one valid hotkey');
            return;
         }

         const result = await createHotkeySet(formData);

         if (result)
         {
            toast.success('Hotkey set created successfully');
            navigate('/');
         }
      } catch (error)
      {
         console.error('Error creating hotkey set:', error);
         toast.error('Failed to create hotkey set');
      } finally
      {
         setIsSubmitting(false);
      }
   };

   const handleBack = () => {
      navigate('/');
   };

   return (
      <div className="min-h-screen bg-background">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="py-8 border-b border-border">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                     <Button variant="ghost" onClick={handleBack} size="icon">
                        <ArrowLeft className="h-4 w-4" />
                     </Button>
                     <div>
                        <h1 className="text-2xl font-semibold text-foreground">Create Hotkey Set</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                           Add a new set of hotkeys for your application
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Form */}
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
                              Add Hotkey
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
                                          <Input
                                             value={hotkey.key}
                                             onChange={(e) => handleHotkeyChange(hotkey.id, 'key', e.target.value)}
                                             placeholder="e.g., Ctrl + C"
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
                        {isSubmitting ? 'Creating...' : 'Create Hotkey Set'}
                     </Button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
};

export default HotkeySetForm;