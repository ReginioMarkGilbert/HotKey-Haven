import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import Dashboard from './components/Dashboard';
import HotkeySetForm from './components/HotkeySetForm';
import ViewHotkeySet from './components/ViewHotkeySet';
import { ThemeToggle } from './components/ui/theme-toggle';
import './index.css';

function App() {
   return (
      <Router>
         <div className="relative min-h-screen">
            {/* Theme Toggle */}
            <div className="fixed top-4 right-4 z-50">
               <ThemeToggle />
            </div>

            {/* Main Content */}
            <Routes>
               <Route path="/" element={<Dashboard />} />
               <Route path="/create" element={<HotkeySetForm />} />
               <Route path="/edit/:id" element={<HotkeySetForm />} />
               <Route path="/view/:id" element={<ViewHotkeySet />} />
            </Routes>

            {/* Toast Notifications */}
            <Toaster position="top-center" />
         </div>
      </Router>
   );
}

export default App;
