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

export default function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <main>
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
  );
}
