import {
  IconHome,
  IconLayout,
  IconChartBar,
  IconTrendingUp,
  IconFileText,
  IconUsers,
  IconActivity,
  IconList,
  IconUserPlus,
  IconAward,
  IconBriefcase,
  IconSettings,
  IconUser,
  IconShield,
  IconLock,
  IconDeviceMobile,
  IconBell,
  IconLink,
  IconCirclePlus
} from '@tabler/icons-react';

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// Maps API icon name strings to Tabler icon components
const iconMap = {
  home: IconHome,
  layout: IconLayout,
  'bar-chart-2': IconChartBar,
  'trending-up': IconTrendingUp,
  'file-text': IconFileText,
  users: IconUsers,
  activity: IconActivity,
  list: IconList,
  'user-plus': IconUserPlus,
  award: IconAward,
  briefcase: IconBriefcase,
  settings: IconSettings,
  user: IconUser,
  shield: IconShield,
  lock: IconLock,
  smartphone: IconDeviceMobile,
  bell: IconBell,
  link: IconLink,
  'plus-circle': IconCirclePlus
};

export function getIconComponent(name) {
  return iconMap[name] ?? FiberManualRecordIcon;
}
