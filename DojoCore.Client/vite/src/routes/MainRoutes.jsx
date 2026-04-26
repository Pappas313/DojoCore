import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import AuthGuard from './AuthGuard';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// main page routing
const MainPage = Loadable(lazy(() => import('views/main')));

// users routing
const AthletesListPage = Loadable(lazy(() => import('views/users/athletes/AthletesListPage')));
const CoachesListPage = Loadable(lazy(() => import('views/users/coaches/CoachesListPage')));
const ManagersListPage = Loadable(lazy(() => import('views/users/managers/ManagersListPage')));

// gyms routing
const GymsListPage = Loadable(lazy(() => import('views/gyms/GymsListPage')));
const GymMembershipsPage = Loadable(lazy(() => import('views/gyms/GymMembershipsPage')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'typography',
      element: <UtilsTypography />
    },
    {
      path: 'color',
      element: <UtilsColor />
    },
    {
      path: 'shadow',
      element: <UtilsShadow />
    },
    {
      path: '/main',
      element: <MainPage />
    },
    {
      path: 'users',
      children: [
        {
          path: 'athletes/list',
          element: <AthletesListPage />
        },
        {
          path: 'coaches/list',
          element: <CoachesListPage />
        },
        {
          path: 'managers/list',
          element: <ManagersListPage />
        }
      ]
    },
    {
      path: 'gyms',
      children: [
        {
          path: 'list',
          element: <GymsListPage />
        },
        {
          path: 'memberships',
          element: <GymMembershipsPage />
        }
      ]
    }
  ]
};

export default MainRoutes;
