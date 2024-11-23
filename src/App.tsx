import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Sermons from './pages/Sermons';
import Calendar from './pages/Calendar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Toaster 
          position="top-right"
          theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/sermons" element={<Sermons />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;