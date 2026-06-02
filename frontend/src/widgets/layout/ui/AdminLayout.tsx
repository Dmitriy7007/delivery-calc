import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/widgets/sidebar';
import { Header } from '@/widgets/header';

export const AdminLayout: React.FC = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-layout__main">
        <Header />
        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
        }

        .admin-layout__main {
          flex: 1;
          margin-left: var(--sidebar-width);
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .admin-layout__content {
          flex: 1;
          overflow: auto;
        }
      `}</style>
    </div>
  );
};
