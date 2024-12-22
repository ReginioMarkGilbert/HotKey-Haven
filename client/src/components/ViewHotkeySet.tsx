import { ArrowLeft, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useHotkeys } from '../hooks/useHotkeys';
import { HotkeySet } from '../types';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const ViewHotkeySet = () => {
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const { hotkeySets } = useHotkeys();
   const [hotkeySet, setHotkeySet] = useState<HotkeySet | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (id && hotkeySets)
      {
         const set = hotkeySets.find(set => set.id === id);
         if (set)
         {
            setHotkeySet(set);
         } else
         {
            toast.error('Hotkey set not found');
            navigate('/');
         }
         setLoading(false);
      }
   }, [id, hotkeySets, navigate]);

   if (loading || !hotkeySet)
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
            {/* Header */}
            <div className="py-8 border-b border-border">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                     <Button variant="ghost" onClick={() => navigate('/')} size="icon">
                        <ArrowLeft className="h-4 w-4" />
                     </Button>
                     <div>
                        <h1 className="text-2xl font-semibold text-foreground">{hotkeySet.name}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                           {hotkeySet.application}
                        </p>
                     </div>
                  </div>
                  <Button
                     onClick={() => navigate(`/edit/${id}`)}
                     variant="outline"
                     className="bg-background"
                  >
                     <Pencil className="mr-2 h-4 w-4" />
                     Edit Set
                  </Button>
               </div>
            </div>

            {/* Content */}
            <div className="py-8">
               {hotkeySet.description && (
                  <div className="mb-8">
                     <h2 className="text-lg font-medium text-foreground mb-2">Description</h2>
                     <p className="text-sm text-muted-foreground">{hotkeySet.description}</p>
                  </div>
               )}

               <div className="space-y-4">
                  <h2 className="text-lg font-medium text-foreground">Hotkeys</h2>
                  <div className="rounded-lg border border-border">
                     <Table>
                        <TableHeader>
                           <TableRow>
                              <TableHead>Key Combination</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Action</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {hotkeySet.hotkeys.map((hotkey, index) => (
                              <TableRow key={index}>
                                 <TableCell className="font-mono bg-accent/50">
                                    {hotkey.key}
                                 </TableCell>
                                 <TableCell>{hotkey.description}</TableCell>
                                 <TableCell>{hotkey.action}</TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ViewHotkeySet;