import React from 'react';
import { Routes, Route } from 'react-router-dom';
import App from './App'; // Product list page
import Products from './Products'; // Dedicated product page

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/product/:id" element={<Products />} />
    </Routes>
  );
}

export default AppRouter;
