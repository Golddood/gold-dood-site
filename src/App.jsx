// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Starfield from './components/Starfield';
import Burn from './components/Burn';
import BoneshipPage from './pages/BoneshipPage'; // ✅ Custom full-layout page

function Home() {
  return (
    <div className="text-center py-10 z-10 relative">
      <h1 className="text-4xl font-bold">Welcome to Gold Dood</h1>
    </div>
  );
}

function App() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Routes>
        {/* 🕹 Boneship uses its own layout with no global header/footer */}
        <Route path="/boneship" element={<BoneshipPage />} />

        {/* 🌍 All other pages use shared layout */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col overflow-hidden">
              <Starfield />
              <Header />
              <main className="flex-grow overflow-hidden">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/burn" element={<Burn />} />
                  {/* Add more routes as needed */}
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

