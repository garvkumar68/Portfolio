import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SideNav.css';

const routes = [
  { path: '/', name: 'Home' },
  { path: '/skills', name: 'Skills' },
  { path: '/projects', name: 'Projects' },
  { path: '/experience', name: 'Experience' },
  { path: '/certifications', name: 'Certifications' },
  { path: '/achievements', name: 'Achievements' },
  { path: '/reachout', name: 'Reachout' },
];

export const SideNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/debugger') {
    return null;
  }

  return (
    <div className="side-nav">
      {routes.map((route, index) => {
        const isActive = location.pathname === route.path || (location.pathname === '/Portfolio' && route.path === '/');
        return (
          <div
            key={index}
            className={`nav-dot ${isActive ? 'active' : ''}`}
            onClick={() => navigate(route.path)}
            title={route.name}
          ></div>
        );
      })}
    </div>
  );
};
