import PropTypes from 'prop-types';

// material-ui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
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

// ==============================|| STATS - ATHLETE NAMES CARD ||============================== //

export default function AthleteNamesCard({ isLoading, athletes }) {
  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Stack sx={{ gap: gridSpacing }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h4">Athletes</Typography>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  {athletes?.length ?? 0} total
                </Typography>
              </Stack>
              <List disablePadding sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {(athletes ?? []).map((athlete, idx) => (
                  <Box key={athlete.id ?? idx}>
                    {idx > 0 && <Divider sx={{ my: 0.5 }} />}
                    <ListItem disableGutters sx={{ py: 0.75 }}>
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar
                          sx={{
                            width: 30,
                            height: 30,
                            fontSize: '0.875rem',
                            bgcolor: 'primary.light',
                            color: 'primary.dark'
                          }}
                        >
                          {athlete.name?.[0] ?? '?'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="subtitle2">{athlete.name}</Typography>}
                      />
                    </ListItem>
                  </Box>
                ))}
                {(!athletes || athletes.length === 0) && (
                  <ListItem disableGutters>
                    <ListItemText primary={<Typography variant="body2" sx={{ color: 'text.secondary' }}>No athletes found.</Typography>} />
                  </ListItem>
                )}
              </List>
            </Stack>
          </CardContent>
        </MainCard>
      )}
    </>
  );
}

AthleteNamesCard.propTypes = {
  isLoading: PropTypes.bool,
  athletes: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string }))
};
