import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import Dashboard from './components/Dashboard';
import HotkeySetForm from './components/HotkeySetForm';
import ViewHotkeySet from './components/ViewHotkeySet';
import './index.css';

function App() {
   return (
      <BrowserRouter>
         <div className="min-h-screen bg-background text-foreground">
            <Routes>
               <Route path="/" element={<Dashboard />} />
               <Route path="/create" element={<HotkeySetForm />} />
               <Route path="/edit/:id" element={<HotkeySetForm />} />
               <Route path="/view/:id" element={<ViewHotkeySet />} />
            </Routes>
            <Toaster position="top-right" />
         </div>
      </BrowserRouter>
   );
}

export default App;
