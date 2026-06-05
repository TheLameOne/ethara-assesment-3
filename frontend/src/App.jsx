import { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';

import TopNav from './components/TopNav/TopNav';
import Footer from './components/Footer/Footer';

import Dashboard from './pages/Dashboard/Dashboard';
import Products from './pages/Products/Products';
import Customers from './pages/Customers/Customers';
import Orders from './pages/Orders/Orders';
import OrderDetail from './pages/Orders/OrderDetail';
import NewOrder from './pages/Orders/NewOrder';

export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

function getInitialTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <BrowserRouter>
        <TopNav />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<NewOrder />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

