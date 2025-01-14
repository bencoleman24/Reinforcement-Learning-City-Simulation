import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './routes/LandingPage';
import BasicConfigPage from './routes/BasicConfigPage';
import AdvancedConfigPage from './routes/AdvancedConfigPage';
import LoadingPage from './routes/LoadingPage';
import ResultsPage from './routes/ResultsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<LandingPage />} 
        />
        <Route 
          path="/config" 
          element={<BasicConfigPage />} 
        />
        <Route 
          path="/advanced" 
          element={<AdvancedConfigPage />} 
        />
        <Route 
          path="/loading" 
          element={<LoadingPage />} 
        />
        <Route 
          path="/results" 
          element={<ResultsPage />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
