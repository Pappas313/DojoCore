import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

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

// admin routing
const MenuManagePage = Loadable(lazy(() => import('views/menu/MenuManagePage')));
const TranslationsPage = Loadable(lazy(() => import('views/admin/TranslationsPage')));
const CompetitionImportPage = Loadable(lazy(() => import('views/admin/competitions/CompetitionImportPage')));
const CompetitionResultsPage = Loadable(lazy(() => import('views/admin/competitions/CompetitionResultsPage')));
const CompetitionListPage = Loadable(lazy(() => import('views/admin/competitions/CompetitionListPage')));

// maps routing
const CombinedMapPage = Loadable(lazy(() => import('views/maps/CombinedMapPage')));
const AthletesMapPage = Loadable(lazy(() => import('views/maps/AthletesMapPage')));
const CoachesMapPage = Loadable(lazy(() => import('views/maps/CoachesMapPage')));
const ManagersMapPage = Loadable(lazy(() => import('views/maps/ManagersMapPage')));

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
    },
    {
      path: 'competitions/list',
      element: <CompetitionListPage />
    },
    {
      path: 'maps',
      children: [
        {
          path: 'combined',
          element: <CombinedMapPage />
        },
        {
          path: 'athletes',
          element: <AthletesMapPage />
        },
        {
          path: 'coaches',
          element: <CoachesMapPage />
        },
        {
          path: 'managers',
          element: <ManagersMapPage />
        }
      ]
    },
    {
      path: 'competitions/import',
      element: <CompetitionImportPage />
    },
    {
      path: 'competitions/results/:importId',
      element: <CompetitionResultsPage />
    },
    {
      path: 'admin',
      children: [
        {
          path: 'menu',
          element: <MenuManagePage />
        },
        {
          path: 'translations',
          element: <TranslationsPage />
        },
        {
          path: 'competitions',
          element: <CompetitionImportPage />
        },
        {
          path: 'competitions/list',
          element: <CompetitionListPage />
        },
        {
          path: 'competitions/results',
          element: <Navigate to="/admin/competitions" replace />
        },
        {
          path: 'competitions/results/:importId',
          element: <CompetitionResultsPage />
        }
      ]
    }
  ]
};

export default MainRoutes;
