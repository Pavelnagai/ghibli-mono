import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/app/layout/Layout';
import { Home, Settings } from '@/pages';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />} path="/">
        <Route element={<Home />} index />
        <Route element={<Settings />} path="settings" />
      </Route>
    </Routes>
  );
};

export default AppRouter;
