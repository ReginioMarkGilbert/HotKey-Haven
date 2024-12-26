import { XIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useKeyDetection } from '../../hooks/useKeyDetection';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Input } from './input';

interface KeyComboInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
   onKeyComboChange: (value: string) => void;
   value: string;
}

export const KeyComboInput = React.forwardRef<HTMLInputElement, KeyComboInputProps>(
   ({ className, onKeyComboChange, value, onFocus, onBlur, ...props }, ref) => {
      const [isManualMode, setIsManualMode] = useState(false);
      const {
         isListening,
         startListening,
         stopListening,
         detectedKeys,
         clearKeys,
      } = useKeyDetection();

      // Use ref to store the latest value to avoid infinite loops
      const lastDetectedRef = useRef(detectedKeys);

      // Update parent component when keys are detected
      useEffect(() => {
         if (detectedKeys && detectedKeys !== lastDetectedRef.current && !isManualMode)
         {
            lastDetectedRef.current = detectedKeys;
            onKeyComboChange(detectedKeys);
         }
      }, [detectedKeys, onKeyComboChange, isManualMode]);

      // Handle focus events
      const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
         if (!isManualMode)
         {
            startListening();
         }
         onFocus?.(e);
      };

      // Handle blur events
      const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
         if (!isManualMode)
         {
            stopListening();
         }
         onBlur?.(e);
      };

      // Handle clear button click
      const handleClear = () => {
         clearKeys();
         onKeyComboChange('');
         lastDetectedRef.current = '';
      };

      // Handle double click to toggle manual mode
      const handleDoubleClick = () => {
         setIsManualMode(prev => !prev);
         if (isListening)
         {
            stopListening();
         }
      };

      // Handle manual input change
      const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
         if (isManualMode)
         {
            onKeyComboChange(e.target.value);
         }
      };

      // Handle keyboard events
      const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
         // Reset on Escape key
         if (e.key === 'Escape')
         {
            e.preventDefault();
            handleClear();
            if (isManualMode)
            {
               setIsManualMode(false);
            }
         }
      };

      return (
         <div className="relative">
            <Input
               {...props}
               ref={ref}
               value={value}
               onFocus={handleFocus}
               onBlur={handleBlur}
               onChange={handleManualInput}
               onDoubleClick={handleDoubleClick}
               onKeyDown={handleKeyDown}
               className={cn(
                  'pr-8',
                  isListening && 'border-primary',
                  isManualMode && 'border-success',
                  className
               )}
               placeholder={
                  isManualMode
                     ? 'Type your key combination...'
                     : isListening
                        ? 'Press any key combination...'
                        : 'Click to record or double-click to type'
               }
               readOnly={!isManualMode}
            />
            {value && (
               <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={handleClear}
               >
                  <XIcon className="h-4 w-4" />
               </Button>
            )}
         </div>
      );
   }
);

KeyComboInput.displayName = 'KeyComboInput';