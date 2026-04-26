// material-ui
import { styled } from '@mui/material/styles';

// assets
import dojoBg from 'assets/images/auth/dojo-bg.jpg';

// ==============================|| AUTHENTICATION 1 WRAPPER ||============================== //

const AuthWrapper1 = styled('div')(() => ({
  backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${dojoBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh'
}));

export default AuthWrapper1;
