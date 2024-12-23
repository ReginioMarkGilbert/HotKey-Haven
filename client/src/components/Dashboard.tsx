import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, Pencil, Pin, PinOff, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useHotkeys } from '../hooks/useHotkeys';
import { cn } from '../lib/utils';
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

interface SortableHotkeySetCardProps {
   id: string;
   children: React.ReactNode;
}

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
      cursor: 'grab',
   };

   return (
      <div
         ref={setNodeRef}
         style={style}
         {...attributes}
         {...listeners}
         className="touch-none"
      >
         {children}
      </div>
   );
};

const Dashboard = () => {
   const navigate = useNavigate();
   const { hotkeySets, loading, error, deleteHotkeySet, updateHotkeySet } = useHotkeys();
   const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [orderedSets, setOrderedSets] = useState<string[]>([]);

   // Initialize orderedSets when hotkeySets changes
   useEffect(() => {
      if (hotkeySets.length > 0)
      {
         // Sort sets with pinned ones first
         const sortedSets = [...hotkeySets].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return 0;
         });
         setOrderedSets(sortedSets.map(set => set._id));
      }
   }, [hotkeySets]);

   const sensors = useSensors(
      useSensor(PointerSensor, {
         activationConstraint: {
            delay: 0,
            tolerance: 0,
         },
      })
   );

   const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id)
      {
         setOrderedSets((items) => {
            const oldIndex = items.indexOf(active.id as string);
            const newIndex = items.indexOf(over.id as string);
            return arrayMove(items, oldIndex, newIndex);
         });
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
            // Remove the deleted set from orderedSets
            setOrderedSets(prev => prev.filter(id => id !== selectedSetId));
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

   const handleTogglePin = async (setId: string, currentPinned: boolean) => {
      try
      {
         const result = await updateHotkeySet(setId, { pinned: !currentPinned });
         if (result)
         {
            toast.success(currentPinned ? 'Set unpinned' : 'Set pinned');
            // Reorder sets with pinned ones first
            const updatedSets = hotkeySets.map(set =>
               set._id === setId ? { ...set, pinned: !currentPinned } : set
            );
            const sortedSets = [...updatedSets].sort((a, b) => {
               if (a.pinned && !b.pinned) return -1;
               if (!a.pinned && b.pinned) return 1;
               return 0;
            });
            setOrderedSets(sortedSets.map(set => set._id));
         }
      } catch (error)
      {
         toast.error('Failed to update pin status');
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

   const sortedHotkeySets = orderedSets
      .map(id => hotkeySets.find(set => set._id === id))
      .filter((set): set is NonNullable<typeof set> => set !== undefined);

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
                        <SortableContext items={orderedSets} strategy={rectSortingStrategy}>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {sortedHotkeySets.map((set) => (
                                 <SortableHotkeySetCard key={set._id} id={set._id}>
                                    <Card
                                       className={cn(
                                          "group relative hover:shadow-lg transition-all duration-200 hover:border-primary/50 active:cursor-grabbing",
                                          set.pinned && "border-primary/50"
                                       )}
                                    >
                                       {/* Pin indicator */}
                                       {set.pinned && (
                                          <div className="absolute top-2 right-2 text-primary">
                                             <Pin className="h-4 w-4" />
                                          </div>
                                       )}

                                       {/* Hover Overlay */}
                                       <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 z-10">
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/view/${set._id}`);
                                             }}
                                             className="bg-background hover:bg-accent"
                                          >
                                             <Eye className="mr-2 h-4 w-4" />
                                             View
                                          </Button>
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/edit/${set._id}`);
                                             }}
                                             className="bg-background hover:bg-accent"
                                          >
                                             <Pencil className="mr-2 h-4 w-4" />
                                             Edit
                                          </Button>
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                handleTogglePin(set._id, !!set.pinned);
                                             }}
                                             className="bg-background hover:bg-accent"
                                          >
                                             {set.pinned ? (
                                                <>
                                                   <PinOff className="mr-2 h-4 w-4" />
                                                   Unpin
                                                </>
                                             ) : (
                                                <>
                                                   <Pin className="mr-2 h-4 w-4" />
                                                   Pin
                                                </>
                                             )}
                                          </Button>
                                          <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedSetId(set._id);
                                                setIsDeleteDialogOpen(true);
                                             }}
                                             className="bg-background hover:bg-destructive hover:text-destructive-foreground"
                                          >
                                             <Trash2 className="mr-2 h-4 w-4" />
                                             Delete
                                          </Button>
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