import { Outlet } from 'react-router-dom';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color)] pb-16">
      <Outlet />
    </div>
  );
};
