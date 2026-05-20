// assets
import { IconTrophy, IconLayoutList, IconUpload } from '@tabler/icons-react';

// constant
const icons = { IconTrophy, IconLayoutList, IconUpload };

// ==============================|| COMPETITIONS MENU ITEMS ||============================== //

const competitions = {
  id: 'competitions',
  title: 'Competitions',
  type: 'group',
  children: [
    {
      id: 'admin-competitions',
      title: 'Competitions',
      type: 'collapse',
      icon: icons.IconTrophy,
      children: [
        {
          id: 'admin-competitions-results',
          title: 'Results',
          type: 'item',
          url: '/competitions/list',
          icon: icons.IconLayoutList,
          breadcrumbs: false
        },
        {
          id: 'admin-competitions-import',
          title: 'Import',
          type: 'item',
          url: '/competitions/import',
          icon: icons.IconUpload,
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default competitions;
