import React, { useState, useEffect, FC, MouseEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types/user';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  useTheme, 
  useMediaQuery, 
  IconButton, 
  Close, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Collapse, 
  ExpandMore,
  Divider,
  ListItemButton,
  Paper,
  Avatar,
  InputBase,
  Button,
  Menu,
  Toolbar
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Person as PersonIcon, 
  People as PeopleIcon, 
  EventNote as EventNoteIcon, 
  EventAvailable as EventAvailableIcon, 
  CheckCircle as CheckCircleIcon, 
  Cancel as CancelIcon, 
  Description as DescriptionIcon, 
  Create as CreateIcon, 
  Settings as SettingsIcon, 
  ExitToApp as ExitToAppIcon, 
  Lock as LockIcon, 
  Build as BuildIcon, 
  RateReview as RateReviewIcon, 
  Add as AddIcon, 
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { COLORS } from '../constants/colors';
import { stats } from '../data/stats';
import { appointmentsData } from '../data/appointments';
import { patientVisitData } from '../data/patientVisits';
import { Cell } from 'recharts';

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path?: string;
  onClick?: () => void;
  children?: MenuItem[];
}

interface SidebarProps {
  onLogout: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar: FC<SidebarProps> = ({ onLogout, isMobileOpen, onMobileClose }: SidebarProps) => {
  const [openDoctors, setOpenDoctors] = useState(false);
  const [openPatients, setOpenPatients] = useState(false);
  const [openAppointments, setOpenAppointments] = useState(false);
  const [openPrescriptions, setOpenPrescriptions] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleClick = (menu: string) => {
    switch(menu) {
      case 'doctors':
        setOpenDoctors(!openDoctors);
        break;
      case 'patients':
        setOpenPatients(!openPatients);
        break;
      case 'appointments':
        setOpenAppointments(!openAppointments);
        break;
      case 'prescriptions':
        setOpenPrescriptions(!openPrescriptions);
        break;
      case 'settings':
        setOpenSettings(!openSettings);
        break;
      default:
        break;
    }
  };

  const menuItems: MenuItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    
    // Doctor Section
    { 
      text: 'Doctor', 
      icon: <PersonIcon />, 
      onClick: () => handleClick('doctors'),
      children: [
        { text: 'All Doctors', icon: <PersonIcon />, path: '/doctors' },
        { text: 'Add Doctor', icon: <AddIcon />, path: '/doctors/add' },
        { text: 'Delete Doctor', icon: <DeleteIcon />, path: '/doctors/delete' },
        { text: 'Doctor Profile', icon: <DescriptionIcon />, path: '/profile/doctor' },
      ]
    },
    
    // Patient Section
    { 
      text: 'Patient', 
      icon: <PeopleIcon />, 
      onClick: () => handleClick('patients'),
      children: [
        { text: 'All Patients', icon: <PeopleIcon />, path: '/patients' },
        { text: 'Medical History', icon: <DescriptionIcon />, path: '/patients/history' },
        { text: 'Patient Feedback', icon: <RateReviewIcon />, path: '/patients/feedback' },
      ]
    },
    
    // Appointments Section
    { 
      text: 'Appointments', 
      icon: <EventNoteIcon />, 
      onClick: () => handleClick('appointments'),
      children: [
        { text: 'View Appointments', icon: <EventNoteIcon />, path: '/appointments' },
        { text: 'Schedule Appointment', icon: <EventAvailableIcon />, path: '/appointments/schedule' },
        { text: 'Completed Appointments', icon: <CheckCircleIcon />, path: '/appointments/completed' },
        { text: 'Cancelled Appointments', icon: <CancelIcon />, path: '/appointments/cancelled' },
      ]
    },
    
    // Prescriptions Section
    { 
      text: 'Prescriptions', 
      icon: <DescriptionIcon />, 
      onClick: () => handleClick('prescriptions'),
      children: [
        { text: 'All Prescriptions', icon: <DescriptionIcon />, path: '/prescriptions' },
        { text: 'Write New Prescription', icon: <CreateIcon />, path: '/prescriptions/new' },
      ]
    },
    
    // Settings Section
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      onClick: () => handleClick('settings'),
      children: [
        { text: 'Profile Settings', icon: <PersonIcon />, path: '/settings/profile' },
        { text: 'Change Password', icon: <LockIcon />, path: '/settings/password' },
        { text: 'System Preferences', icon: <BuildIcon />, path: '/settings/preferences' },
      ]
    },
    
    // Logout
    { text: 'Logout', icon: <ExitToAppIcon />, onClick: onLogout },
  ];

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => {
      if (item.children) {
        return (
          <div key={item.text}>
            <ListItem
              button
              onClick={item.onClick}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {item.onClick && <ExpandMore />}
            </ListItem>
            <Collapse in={item.text === 'Doctor' ? openDoctors :
                         item.text === 'Patient' ? openPatients :
                         item.text === 'Appointments' ? openAppointments :
                         item.text === 'Prescriptions' ? openPrescriptions :
                         item.text === 'Settings' ? openSettings : false}>
              <List component="div" disablePadding>
                {item.children.map((child) => (
                  <ListItem
                    button
                    key={child.text}
                    onClick={() => {
                      if (child.path) {
                        navigate(child.path);
                        if (isMobile) {
                          onMobileClose();
                        }
                      }
                    }}
                  >
                    <ListItemIcon>{child.icon}</ListItemIcon>
                    <ListItemText primary={child.text} />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </div>
        );
      }
      return (
        <ListItem
          button
          key={item.text}
          onClick={() => {
            if (item.path) {
              navigate(item.path);
              if (isMobile) {
                onMobileClose();
              }
            }
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItem>
      );
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '250px',
        borderRight: '1px solid #e0e0e0',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="h6">Doctor Dashboard</Typography>
        <IconButton onClick={onMobileClose} sx={{ display: { sm: 'none' } }}>
          <Close />
        </IconButton>
      </Box>
      <List>
        {renderMenuItems(menuItems)}
      </List>
    </Box>
  );
};

const DoctorDashboard: React.FC = () => {
};

interface TopbarProps {
  user: User | null;
  onMenuClick: () => void;
  onLogout: () => void;
}

const Topbar: FC<TopbarProps> = ({ user, onMenuClick, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenu = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = (): void => {
    setAnchorEl(null);
  };
  
  const handleLogoutClick = (): void => {
    onLogout();
    handleClose();
  };
  return (
    <AppBar position="fixed" sx={{ ml: `${drawerWidth}px`, bgcolor: 'white', color: 'black', boxShadow: 1 }}>
      <Toolbar>
        <IconButton 
          size="large" 
          edge="start" 
          color="inherit" 
          aria-label="menu" 
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Paper component="form" sx={{ display: 'flex', alignItems: 'center', width: 300, bgcolor: '#f4f6fa', boxShadow: 0, pl: 1 }}>
            <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search for..." inputProps={{ 'aria-label': 'search' }} />
            <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
        </Box>
        <IconButton color="inherit">
          <NotificationsIcon />
        </IconButton>
        <Box sx={{ ml: 2 }}>
          <Button onClick={handleMenu} color="inherit" startIcon={<Avatar sx={{ width: 32, height: 32 }}>{user?.name?.[0] || '?'}</Avatar>}>
            {user?.name || 'User'}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>Settings</MenuItem>
            <MenuItem onClick={handleClose}>Activity Log</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
          </Menu>
        </Box>
            </Box>
            <List dense>
              {[1, 2, 3].map((item) => (
                <ListItem key={item} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton>
                    <ListItemIcon><DescriptionIcon /></ListItemIcon>
                    <ListItemText 
                      primary={`Prescription #PR${1000 + item}`}
                      secondary={`Patient: John Doe • ${item} day${item > 1 ? 's' : ''} ago`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <EventNoteIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Upcoming Appointments</Typography>
            </Box>
            <List dense>
              {[1, 2, 3].map((item) => (
                <ListItem key={item} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton>
                    <ListItemIcon><EventNoteIcon /></ListItemIcon>
                    <ListItemText 
                      primary={`Appointment #AP${1000 + item}`}
                      secondary={`Patient: Jane Smith • 10:00 AM`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <PersonAddIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Recently Added Patients</Typography>
            </Box>
            <List dense>
              {[1, 2, 3].map((item) => (
                <ListItem key={item} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton>
                    <ListItemIcon><PersonAddIcon /></ListItemIcon>
                    <ListItemText 
                      primary={`Patient #${1000 + item}`}
                      secondary={`Added: ${new Date().toLocaleDateString()}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Card sx={{ borderLeft: '4px solid #1cc88a', boxShadow: 2 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14, color: '#1cc88a', fontWeight: 700 }}>EARNINGS (ANNUAL)</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>$215,000</Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Card sx={{ borderLeft: '4px solid #36b9cc', boxShadow: 2 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14, color: '#36b9cc', fontWeight: 700 }}>TASKS</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>50%</Typography>
        </CardContent>
      </Card>
    </Grid>
    <Grid item xs={12} sm={6} md={3}>
      <Card sx={{ borderLeft: '4px solid #f6c23e', boxShadow: 2 }}>
        <CardContent>
          <Typography sx={{ fontSize: 14, color: '#f6c23e', fontWeight: 700 }}>PENDING REQUESTS</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>18</Typography>
        </CardContent>

const DoctorDashboard: FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const handleDrawerToggle = useCallback((): void => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback((): void => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fc' }}>
      <Sidebar 
        onLogout={handleLogout} 
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box sx={{ 
        flexGrow: 1, 
        ml: { sm: `${drawerWidth}px` },
        width: { sm: `calc(100% - ${drawerWidth}px)` }
      }}>
        <Topbar 
          user={user} 
          onMenuClick={handleDrawerToggle}
          onLogout={handleLogout}
        />
        <Box sx={{ p: 4, pt: 10 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Dashboard</Typography>
          <DashboardCards />
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorDashboard;
