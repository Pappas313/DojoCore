import { memo, useState } from 'react';

import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';

import { useGetMenuMaster, useGetApiMenu } from 'api/menu';

// ==============================|| SIDEBAR MENU LIST ||============================== //

function MenuList() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const { apiMenuItems, apiMenuLoading, apiMenuError } = useGetApiMenu();

  const [selectedID, setSelectedID] = useState('');

  if (apiMenuLoading) {
    return (
      <Box sx={{ px: 2, mt: 1 }}>
        {[1, 2, 3, 4].map((n) => (
          <Skeleton key={n} variant="rectangular" height={36} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  if (apiMenuError) {
    return (
      <Typography variant="body2" align="center" sx={{ color: 'error.main', mt: 2 }}>
        Failed to load menu.
      </Typography>
    );
  }

  const navItems = apiMenuItems.map((item) => {
    switch (item.type) {
      case 'group':
        // Only render as a direct NavItem link when there are no children
        if (item.url && !item.children?.length) {
          return (
            <List key={item.id}>
              <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
              <Divider sx={{ py: 0.5 }} />
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
            lastItem={null}
            remItems={[]}
            lastItemId={''}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
            Menu Items Error
          </Typography>
        );
    }
  });

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(MenuList);
