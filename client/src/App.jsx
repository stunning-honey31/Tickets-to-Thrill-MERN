import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

import Home from './pages/Home.jsx';
import Tickets from './pages/Tickets.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Cart from './pages/Cart.jsx';
import Payment from './pages/Payment.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import MyAccount from './pages/MyAccount.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Users from './pages/admin/Users.jsx';
import Bookings from './pages/admin/Bookings.jsx';
import Messages from './pages/admin/Messages.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="messages" element={<Messages />} />
      </Route>

      <Route
        path="*"
        element={
          <>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/payment/:orderId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </>
        }
      />
    </Routes>
  );
}
