import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import PortfolioApp from './PortfolioApp';
import AdminPage from './AdminPage';

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const isAdmin = path === '/admin' || path.endsWith('/admin');
  return isAdmin ? <AdminPage /> : <PortfolioApp />;
}
