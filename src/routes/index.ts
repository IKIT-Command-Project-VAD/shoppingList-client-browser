import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';

import asyncComponentLoader from '@/utils/loader';

import { Routes } from './types';

const routes: Routes = [
  {
    component: asyncComponentLoader(() => import('@/pages/Welcome')),
    path: '/',
    title: 'Добро пожаловать',
    icon: HomeIcon,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/AccountPage')),
    path: '/account',
    title: 'Аккаунт',
    icon: GitHubIcon,
    protected: true,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/ListsPage')),
    path: '/lists',
    title: 'Списки',
    icon: ListAltIcon,
    protected: true,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/ListDetailsPage')),
    path: '/lists/:id',
    protected: true,
  },
  {
    component: asyncComponentLoader(() => import('@/pages/NotFound')),
    path: '*',
  },
];

export default routes;
