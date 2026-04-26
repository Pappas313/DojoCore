import PropTypes from 'prop-types';

// material-ui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from 'store/constant';

// assets
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';

// ==============================|| MAIN PAGE - RECENT REGISTRATIONS CARD ||============================== //

const roleColor = {
  Athlete: 'primary',
  Coach: 'secondary',
  Manager: 'warning'
};

const recentRegistrations = [
  { id: 1, name: 'Alex Johnson', role: 'Athlete', gym: 'Gym Central', date: 'Apr 25' },
  { id: 2, name: 'Maria Lee', role: 'Coach', gym: 'North Dojo', date: 'Apr 24' },
  { id: 3, name: 'Carlos Ruiz', role: 'Athlete', gym: 'Gym Central', date: 'Apr 23' },
  { id: 4, name: 'Sara Kim', role: 'Manager', gym: 'South Arena', date: 'Apr 22' },
  { id: 5, name: 'Tom Watts', role: 'Athlete', gym: 'East Dojo', date: 'Apr 21' },
  { id: 6, name: 'Lily Chen', role: 'Coach', gym: 'North Dojo', date: 'Apr 20' }
];

export default function RecentRegistrationsCard({ isLoading }) {
  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Stack sx={{ gap: gridSpacing }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4">Recent Registrations</Typography>
              </Stack>
              <List disablePadding>
                {recentRegistrations.map((reg, idx) => (
                  <Box key={reg.id}>
                    <ListItem disableGutters sx={{ py: 0.75 }}>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            fontSize: '0.875rem',
                            bgcolor: `${roleColor[reg.role]}.light`,
                            color: `${roleColor[reg.role]}.dark`
                          }}
                        >
                          {reg.name[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="subtitle2">{reg.name}</Typography>}
                        secondary={
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {reg.gym}
                          </Typography>
                        }
                      />
                      <Stack alignItems="flex-end" gap={0.5}>
                        <Chip
                          label={reg.role}
                          size="small"
                          color={roleColor[reg.role]}
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 18 }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {reg.date}
                        </Typography>
                      </Stack>
                    </ListItem>
                    {idx < recentRegistrations.length - 1 && <Divider sx={{ my: 0.25 }} />}
                  </Box>
                ))}
              </List>
            </Stack>
          </CardContent>
          <CardActions sx={{ p: 1.25, pt: 0, justifyContent: 'center' }}>
            <Button size="small" disableElevation endIcon={<ChevronRightOutlinedIcon />}>
              View All
            </Button>
          </CardActions>
        </MainCard>
      )}
    </>
  );
}

RecentRegistrationsCard.propTypes = { isLoading: PropTypes.bool };
