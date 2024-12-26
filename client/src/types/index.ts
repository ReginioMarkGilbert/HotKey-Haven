export interface Hotkey {
   id: string;
   key: string;
   description: string;
   action?: string;
}

export interface HotkeySet {
   _id: string;
   name: string;
   application: string;
   description: string;
   hotkeys: Hotkey[];
   order: number;
   createdAt: Date;
   updatedAt: Date;
}