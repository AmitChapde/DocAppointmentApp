import { Button } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

interface LinkBtnProps {
  to: string;
  label: string;
}

const LinkBtn: React.FC<LinkBtnProps> = ({ to, label }) => {
  const loc = useLocation();

  return (
    <Button
      color="inherit"
      component={RouterLink}
      to={to}
      variant={loc.pathname === to ? 'outlined' : 'text'}
      sx={{ textTransform: 'none' }}
    >
      {label}
    </Button>
  );
};

export default LinkBtn;