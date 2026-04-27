// assets
import { IconLanguage, IconMenu2 } from '@tabler/icons-react';

// constant
const icons = { IconLanguage, IconMenu2 };

// ==============================|| ADMIN MENU ITEMS ||============================== //

const admin = {
  id: 'admin',
  title: 'Admin',
  type: 'group',
  children: [
    {
      id: 'admin-menu',
      title: 'Menu Management',
      type: 'item',
      url: '/admin/menu',
      icon: icons.IconMenu2,
      breadcrumbs: false
    },
    {
      id: 'admin-translations',
      title: 'Translations',
      type: 'item',
      url: '/admin/translations',
      icon: icons.IconLanguage,
      breadcrumbs: false
    }
  ]
};

export default admin;
