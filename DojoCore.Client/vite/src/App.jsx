import { RouterProvider } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// routing
import router from 'routes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';

import ThemeCustomization from 'themes';
import { AuthProvider } from 'contexts/AuthContext';

// ==============================|| APP ||============================== //

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeCustomization>
        <NavigationScroll>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </NavigationScroll>
      </ThemeCustomization>
    </I18nextProvider>
  );
}
