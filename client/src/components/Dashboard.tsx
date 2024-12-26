import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useHotkeys } from '../hooks/useHotkeys';
import type { HotkeySet } from '../types';
import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
} from "./ui/tooltip";

interface DropResult {
   active: { id: string };
   over: { id: string } | null;
}

interface SortableHotkeySetCardProps {
   id: string;
   children: React.ReactNode;
}

const DragHandle = () => {
   return (
      <TooltipProvider delayDuration={250}>
         <Tooltip>
            <TooltipTrigger asChild>
               <div className="flex flex-col gap-[3px]">
                  <div className="flex gap-[3px]">
                     <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70" />
                     <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70" />
                  </div>
                  <div className="flex gap-[3px]">
                     <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70" />
                     <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70" />
                  </div>
                  <div className="flex gap-[3px]">
                     <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70" />
                     <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70" />
                  </div>
               </div>
            </TooltipTrigger>
            <TooltipContent>
               <p>Drag to reorder</p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   );
};

const SortableHotkeySetCard = ({ id, children }: SortableHotkeySetCardProps) => {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({ id });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      position: 'relative' as const,
      zIndex: isDragging ? 1 : 0,
   };

   return (
      <div ref={setNodeRef} style={style} className="group">
         <div
            className="absolute left-0 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 z-20"
            {...attributes}
            {...listeners}
         >
            <div className="p-1.5 hover:bg-accent/50 rounded-md cursor-grab active:cursor-grabbing">
               <DragHandle />
            </div>
         </div>
         {children}
      </div>
   );
};

const Dashboard = () => {
   const navigate = useNavigate();
   const { hotkeySets, loading, error, deleteHotkeySet, updateHotkeySetOrder, refreshHotkeySets } = useHotkeys();
   const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [filteredHotkeySets, setFilteredHotkeySets] = useState<HotkeySet[]>([]);

   // Initialize filtered sets
   useEffect(() => {
      setFilteredHotkeySets(hotkeySets);
   }, [hotkeySets]);

   const sensors = useSensors(
      useSensor(PointerSensor, {
         activationConstraint: {
            distance: 3,
            delay: 0,
            tolerance: 5,
         },
      })
   );

   const handleDragEnd = async (event: DragEndEvent) => {
      if (!event.over) return;

      const oldIndex = filteredHotkeySets.findIndex(set => set._id === event.active.id);
      const newIndex = filteredHotkeySets.findIndex(set => set._id === event.over!.id);

      if (oldIndex === -1 || newIndex === -1)
      {
         console.error('Invalid indices:', { oldIndex, newIndex, event });
         return;
      }

      const items = Array.from(filteredHotkeySets);
      const [reorderedItem] = items.splice(oldIndex, 1);
      items.splice(newIndex, 0, reorderedItem);

      // Create the reorder request with correct types
      const reorderRequest = items.map((item, index) => ({
         id: item._id,
         order: index
      }));

      console.log('Reordering sets:', reorderRequest);

      // Update the UI immediately
      setFilteredHotkeySets(items);

      try
      {
         // Persist the new order
         await updateHotkeySetOrder(reorderRequest);
         toast.success('Order updated successfully');
      } catch (error)
      {
         console.error('Failed to update order:', error);
         toast.error('Failed to save the new order');
         // Revert to the original order on error
         await refreshHotkeySets();
      }
   };

   const handleDelete = async () => {
      if (!selectedSetId) return;

      try
      {
         setIsDeleting(true);
         const success = await deleteHotkeySet(selectedSetId);
         if (success)
         {
            toast.success('Hotkey set deleted successfully');
            setIsDeleteDialogOpen(false);
         }
      } catch (error)
      {
         toast.error('Failed to delete hotkey set');
      } finally
      {
         setIsDeleting(false);
         setSelectedSetId(null);
      }
   };

   if (loading)
   {
      return (
         <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center space-y-4">
               <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
               <p className="text-sm text-muted-foreground">Loading your hotkey sets...</p>
            </div>
         </div>
      );
   }

   if (error)
   {
      return (
         <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="p-6 max-w-md mx-auto bg-destructive/10 rounded-lg">
               <p className="text-destructive text-center">Error: {error.message}</p>
            </div>
         </div>
      );
   }

   return (
      <>
         <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               {/* Header */}
               <div className="py-8 border-b border-border">
                  <div className="flex justify-between items-center">
                     <div>
                        <h1 className="text-2xl font-semibold text-foreground">HotKey Haven</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                           Manage your application hotkeys in one place
                        </p>
                     </div>
                     <Button
                        onClick={() => navigate('/create')}
                        className="bg-primary hover:bg-primary/90"
                     >
                        <Plus className="mr-2 h-4 w-4" /> New Hotkey Set
                     </Button>
                  </div>
               </div>

               {/* Content */}
               <div className="py-8">
                  {hotkeySets.length === 0 ? (
                     <div className="rounded-lg border border-dashed border-border bg-background p-12">
                        <div className="text-center">
                           <h2 className="text-xl font-semibold text-foreground mb-2">No hotkey sets yet</h2>
                           <p className="text-sm text-muted-foreground mb-6">
                              Create your first hotkey set to get started organizing your shortcuts
                           </p>
                           <Button
                              onClick={() => navigate('/create')}
                              variant="outline"
                              className="mx-auto"
                           >
                              <Plus className="mr-2 h-4 w-4" /> Create Hotkey Set
                           </Button>
                        </div>
                     </div>
                  ) : (
                     <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                     >
                        <SortableContext items={filteredHotkeySets.map(set => set._id)} strategy={rectSortingStrategy}>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {filteredHotkeySets.map((set) => (
                                 <SortableHotkeySetCard key={set._id} id={set._id}>
                                    <Card className="group relative hover:shadow-lg transition-all duration-200 hover:border-primary/50 pl-12">
                                       {/* Hover Overlay */}
                                       <div
                                          className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 z-10"
                                          onClick={(e) => e.stopPropagation()}
                                       >
                                          <TooltipProvider delayDuration={250}>
                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                   <Button
                                                      variant="outline"
                                                      size="icon"
                                                      onClick={(e) => {
                                                         e.preventDefault();
                                                         e.stopPropagation();
                                                         navigate(`/view/${set._id}`);
                                                      }}
                                                      className="bg-background hover:bg-accent h-8 w-8"
                                                   >
                                                      <Eye className="h-4 w-4" />
                                                   </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                   <p>View hotkey set</p>
                                                </TooltipContent>
                                             </Tooltip>

                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                   <Button
                                                      variant="outline"
                                                      size="icon"
                                                      onClick={(e) => {
                                                         e.preventDefault();
                                                         e.stopPropagation();
                                                         navigate(`/edit/${set._id}`);
                                                      }}
                                                      className="bg-background hover:bg-accent h-8 w-8"
                                                   >
                                                      <Pencil className="h-4 w-4" />
                                                   </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                   <p>Edit hotkey set</p>
                                                </TooltipContent>
                                             </Tooltip>

                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                   <Button
                                                      variant="outline"
                                                      size="icon"
                                                      onClick={(e) => {
                                                         e.preventDefault();
                                                         e.stopPropagation();
                                                         setSelectedSetId(set._id);
                                                         setIsDeleteDialogOpen(true);
                                                      }}
                                                      className="bg-background hover:bg-destructive hover:text-destructive-foreground h-8 w-8"
                                                   >
                                                      <Trash2 className="h-4 w-4" />
                                                   </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                   <p>Delete hotkey set</p>
                                                </TooltipContent>
                                             </Tooltip>
                                          </TooltipProvider>
                                       </div>

                                       <CardHeader>
                                          <CardTitle className="flex items-center justify-between">
                                             <span className="text-lg font-medium">{set.name}</span>
                                             <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                {set.hotkeys.length} hotkeys
                                             </span>
                                          </CardTitle>
                                          <CardDescription className="text-sm text-muted-foreground">
                                             {set.application}
                                          </CardDescription>
                                       </CardHeader>
                                       <CardContent>
                                          <p className="text-sm text-muted-foreground line-clamp-2">
                                             {set.description || 'No description provided'}
                                          </p>
                                          <div className="mt-4 flex flex-wrap gap-2">
                                             {set.hotkeys.slice(0, 3).map((hotkey, index) => (
                                                <span
                                                   key={`${set._id}-hotkey-${index}`}
                                                   className="px-2 py-1 text-xs rounded-md bg-accent text-accent-foreground"
                                                >
                                                   {hotkey.key}
                                                </span>
                                             ))}
                                             {set.hotkeys.length > 3 && (
                                                <span
                                                   key={`${set._id}-more`}
                                                   className="px-2 py-1 text-xs rounded-md bg-accent text-accent-foreground"
                                                >
                                                   +{set.hotkeys.length - 3} more
                                                </span>
                                             )}
                                          </div>
                                       </CardContent>
                                    </Card>
                                 </SortableHotkeySetCard>
                              ))}
                           </div>
                        </SortableContext>
                     </DndContext>
                  )}
               </div>
            </div>
         </div>

         <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
               <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                     This action cannot be undone. This will permanently delete the hotkey set
                     and all its associated hotkeys.
                  </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                     onClick={handleDelete}
                     disabled={isDeleting}
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                     {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
      </>
   );
};

export default Dashboard;