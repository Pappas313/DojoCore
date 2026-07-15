// assets
import { IconUsersGroup } from '@tabler/icons-react';

// constant
const icons = { IconUsersGroup };

// ==============================|| MEMBERS MENU ITEMS ||============================== //

const members = {
  id: 'members',
  title: 'Members',
  type: 'group',
  children: [
    {
      id: 'my-members',
      title: 'Members',
      type: 'item',
      url: '/gyms/memberships',
      icon: icons.IconUsersGroup,
      breadcrumbs: false
    }
  ]
};

export default members;
