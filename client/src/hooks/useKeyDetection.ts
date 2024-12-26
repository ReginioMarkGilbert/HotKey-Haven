import { useCallback, useEffect, useState } from 'react';

// Define the modifier keys we want to support
const MODIFIER_KEYS = {
   Control: 'Ctrl',
   Alt: 'Alt',
   Shift: 'Shift',
   Meta: 'Cmd', // Command key on Mac, Windows key on Windows
} as const;

interface KeyDetectionHook {
   isListening: boolean;
   startListening: () => void;
   stopListening: () => void;
   detectedKeys: string;
   clearKeys: () => void;
}

export const useKeyDetection = (): KeyDetectionHook => {
   const [isListening, setIsListening] = useState(false);
   const [detectedKeys, setDetectedKeys] = useState('');

   // Convert key event to readable format
   const formatKeyCombo = useCallback((event: KeyboardEvent): string => {
      // Handle Escape key specially
      if (event.key === 'Escape')
      {
         return '';
      }

      // Get pressed modifier keys
      const modifiers = [];
      if (event.ctrlKey) modifiers.push('Ctrl');
      if (event.altKey) modifiers.push('Alt');
      if (event.shiftKey) modifiers.push('Shift');
      if (event.metaKey) modifiers.push('Cmd');

      // Get the main key
      let mainKey = event.key;

      // Handle special cases for modifier keys when pressed alone
      if (mainKey === 'Control') return 'Ctrl';
      if (mainKey === 'Alt') return 'Alt';
      if (mainKey === 'Shift') return 'Shift';
      if (mainKey === 'Meta') return 'Cmd';

      // Format the main key to be more readable
      const formattedKey = mainKey.length === 1
         ? mainKey.toUpperCase()
         : mainKey;

      // If we have modifiers and a non-modifier main key, combine them
      if (modifiers.length > 0 && !Object.keys(MODIFIER_KEYS).includes(mainKey))
      {
         return [...modifiers, formattedKey].join(' + ');
      }

      // If no modifiers or the key is a modifier key alone, just return the formatted key
      return formattedKey;
   }, []);

   // Handle keydown events
   const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if (!isListening) return;

      // Prevent default browser shortcuts
      event.preventDefault();

      const keyCombo = formatKeyCombo(event);
      setDetectedKeys(keyCombo); // Will clear if Escape was pressed
   }, [isListening, formatKeyCombo]);

   // Start listening for key combinations
   const startListening = useCallback(() => {
      setIsListening(true);
   }, []);

   // Stop listening for key combinations
   const stopListening = useCallback(() => {
      setIsListening(false);
   }, []);

   // Clear detected keys
   const clearKeys = useCallback(() => {
      setDetectedKeys('');
   }, []);

   // Set up and clean up event listeners
   useEffect(() => {
      if (isListening)
      {
         window.addEventListener('keydown', handleKeyDown);
         return () => {
            window.removeEventListener('keydown', handleKeyDown);
         };
      }
   }, [isListening, handleKeyDown]);

   return {
      isListening,
      startListening,
      stopListening,
      detectedKeys,
      clearKeys,
   };
};