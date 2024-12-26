import { XIcon } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
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
         if (detectedKeys && detectedKeys !== lastDetectedRef.current)
         {
            lastDetectedRef.current = detectedKeys;
            onKeyComboChange(detectedKeys);
         }
      }, [detectedKeys, onKeyComboChange]);

      // Handle focus events
      const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
         startListening();
         onFocus?.(e);
      };

      // Handle blur events
      const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
         stopListening();
         onBlur?.(e);
      };

      // Handle clear button click
      const handleClear = () => {
         clearKeys();
         onKeyComboChange('');
         lastDetectedRef.current = '';
      };

      return (
         <div className="relative">
            <Input
               {...props}
               ref={ref}
               value={value}
               onFocus={handleFocus}
               onBlur={handleBlur}
               className={cn(
                  'pr-8',
                  isListening && 'border-primary',
                  className
               )}
               placeholder={isListening ? 'Press any key combination...' : 'Click to record key combination'}
               readOnly
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