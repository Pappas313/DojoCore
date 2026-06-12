// assets
import { IconMap, IconMap2, IconMapPin } from '@tabler/icons-react';

// constant
const icons = { IconMap, IconMap2, IconMapPin };

// ==============================|| MAPS MENU ITEMS ||============================== //

const maps = {
  id: 'maps',
  title: 'Maps',
  type: 'group',
  children: [
    {
      id: 'maps-section',
      title: 'Maps',
      type: 'collapse',
      icon: icons.IconMap,
      children: [
        {
          id: 'maps-combined',
          title: 'Combined Map',
          type: 'item',
          url: '/maps/combined',
          icon: icons.IconMap2,
          breadcrumbs: false
        },
        {
          id: 'maps-athletes',
          title: 'Athletes Map',
          type: 'item',
          url: '/maps/athletes',
          icon: icons.IconMapPin,
          breadcrumbs: false
        },
        {
          id: 'maps-coaches',
          title: 'Coaches Map',
          type: 'item',
          url: '/maps/coaches',
          icon: icons.IconMapPin,
          breadcrumbs: false
        },
        {
          id: 'maps-managers',
          title: 'Managers Map',
          type: 'item',
          url: '/maps/managers',
          icon: icons.IconMapPin,
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default maps;
