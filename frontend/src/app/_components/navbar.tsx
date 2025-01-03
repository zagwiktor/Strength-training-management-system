import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation'
import { IconButton, MenuItem, Menu, Button, Divider} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useState } from 'react';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/auth',
  withCredentials: true
});

export default function NavBar() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const router = useRouter()
    const isMenuOpen = Boolean(anchorEl);
    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
      await apiClient.post('logout').then((response) => {
        router.push('/login');
      }).catch((errors) => {
        console.log(errors);
      })
    }

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
          sx={{ mt: '45px' }}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          id={menuId}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => router.push('/account')}>My account</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );
    return (
      <Box sx={{ flexGrow: 1, width: '95%' }}>
            <AppBar 
                position="fixed" 
                sx={{
                  marginBottom: "20px",
                  backgroundColor: 'primary.main',
                }}
            >
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Strength training management system
              </Typography>
              <Box sx={{ flexGrow: 0, gap: "20px", display: { xs: 'none', md: 'flex' } }}> 
                <Divider orientation="vertical" variant="middle" flexItem />
                <Button
                    onClick={() => router.push('/exercises')}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                >
                    Exercises
                </Button> 
                <Divider orientation="vertical" variant="middle" flexItem />
                <Button
                    onClick={() => router.push('/diet')}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                >
                    Diet
                </Button> 
                <Divider orientation="vertical" variant="middle" flexItem />
                <Button
                    onClick={() => router.push('/dashboard')}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                >
                    Training Plans
                </Button> 
                <Divider orientation="vertical" variant="middle" flexItem />
              </Box>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, paddingLeft: "10px"}}>
                <IconButton
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-controls={menuId}
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                >
                <AccountCircle />
              </IconButton>
            
              </Box>
            </Toolbar>
          </AppBar>
          {renderMenu}
        </Box>
    )
};