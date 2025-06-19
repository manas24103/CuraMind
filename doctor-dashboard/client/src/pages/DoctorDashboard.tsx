import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  useTheme,
  useMediaQuery,
  Divider,
  ListItemButton,
  IconButton,
} from '@mui/material';
import { 
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Event as EventIcon,
  EventAvailable as EventAvailableIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  EventNote as EventNoteIcon,
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Create as CreateIcon,
  Settings as SettingsIcon,
  Lock as LockIcon,
  Build as BuildIcon,
  RateReview as RateReviewIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
} from '@mui/icons-material';





interface IMenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  onClick?: () => void;
  children?: IMenuItem[];
}

interface SidebarProps {
  onLogout: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar = ({ onLogout, isMobileOpen, onMobileClose }: SidebarProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openMenus, setOpenMenus] = React.useState<{[key: string]: boolean}>({});
  
  const handleMenuClick = (menu: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };
  
  const menuItems: IMenuItem[] = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/dashboard' 
    },
    { 
      text: 'Appointments', 
      icon: <EventNoteIcon />, 
      onClick: () => handleMenuClick('appointments'),
      children: [
        { 
          text: 'View Appointments', 
          icon: <EventAvailableIcon />, 
          path: '/appointments' 
        },
        { 
          text: 'Schedule New', 
          icon: <AddIcon />, 
          path: '/appointments/new' 
        },
        { 
          text: 'Calendar View', 
          icon: <EventIcon />, 
          path: '/appointments/calendar' 
        }
      ]
    },
    { 
      text: 'Patients', 
      icon: <PeopleIcon />, 
      onClick: () => handleMenuClick('patients'),
      children: [
        { 
          text: 'All Patients', 
          icon: <PeopleIcon />, 
          path: '/patients' 
        },
        { 
          text: 'Add New Patient', 
          icon: <PersonAddIcon />, 
          path: '/patients/new' 
        },
        { 
          text: 'Patient Records', 
          icon: <DescriptionIcon />, 
          path: '/patients/records' 
        }
      ]
    },
    { 
      text: 'Prescriptions', 
      icon: <DescriptionIcon />, 
      onClick: () => handleMenuClick('prescriptions'),
      children: [
        { 
          text: 'All Prescriptions', 
          icon: <DescriptionIcon />, 
          path: '/prescriptions' 
        },
        { 
          text: 'Create New', 
          icon: <CreateIcon />, 
          path: '/prescriptions/new' 
        },
        { 
          text: 'Templates', 
          icon: <RateReviewIcon />, 
          path: '/prescriptions/templates' 
        }
      ]
    },
    { 
      text: 'Settings', 
      icon: <SettingsIcon />, 
      onClick: () => handleMenuClick('settings'),
      children: [
        { 
          text: 'Profile', 
          icon: <PersonIcon />, 
          path: '/settings/profile' 
        },
        { 
          text: 'Account', 
          icon: <SettingsIcon />, 
          path: '/settings/account' 
        },
        { 
          text: 'Security', 
          icon: <LockIcon />, 
          path: '/settings/security' 
        },
        { 
          text: 'Preferences', 
          icon: <BuildIcon />, 
          path: '/settings/preferences' 
        }
      ]
    },
    { 
      text: 'Help & Support', 
      icon: <HelpIcon />, 
      path: '/help' 
    },
    { 
      text: 'Logout', 
      icon: <LogoutIcon />, 
      onClick: onLogout
    }];

  const renderMenuItems = (items: IMenuItem[]) => {
    return items.map((item) => {
      if (item.children) {
        const menuKey = item.text.toLowerCase();
        return (
          <div key={item.text}>
            <ListItem 
              button 
              onClick={() => handleMenuClick(menuKey)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {openMenus[menuKey] ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </ListItem>
            <Collapse in={openMenus[menuKey]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.children.map((child) => (
                  <ListItem 
                    button 
                    key={child.text} 
                    sx={{ pl: 4 }}
                    onClick={() => {
                      if (child.path) {
                        navigate(child.path);
                        if (isMobile) {
                          onMobileClose();
                        }
                      } else if (child.onClick) {
                        child.onClick();
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
            } else if (item.onClick) {
              item.onClick();
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
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {renderMenuItems(menuItems)}
      </List>
    </Box>
  );
};

const DoctorDashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = { name: 'Dr. John Doe' };
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8f9fc' }}>
      <CssBaseline />
      <Topbar user={user} onMenuClick={handleDrawerToggle} onLogout={handleLogout} />
      <Sidebar onLogout={handleLogout} isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box sx={{ 
        flexGrow: 1, 
        p: 3, 
        width: { sm: `calc(100% - 250px)` }, 
        mt: 8,
        backgroundColor: '#f8f9fc',
        minHeight: 'calc(100vh - 64px)'
      }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2e3a4d' }}>Dashboard</Typography>
          <Typography variant="body1" sx={{ color: '#6c757d' }}>Welcome back, {user?.name || 'Doctor'}!</Typography>
        </Box>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Patients */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 2,
              boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)',
              borderLeft: '0.25rem solid #4e73df'
            }}>
              <CardContent>
                <Typography sx={{ 
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#4e73df',
                  textTransform: 'uppercase',
                  mb: 1
                }}>
                  Total Patients
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#5a5c69' }}>1,257</Typography>
                  <Box sx={{ 
                    bgcolor: 'rgba(78, 115, 223, 0.1)',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PersonIcon sx={{ color: '#4e73df' }} />
                  </Box>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <ArrowUpwardIcon sx={{ color: '#1cc88a', fontSize: '1rem', mr: 0.5 }} />
                  <Typography variant="caption" sx={{ color: '#1cc88a', fontWeight: 600 }}>
                    12% increase
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#858796', ml: 1, fontSize: '0.7rem' }}>
                    Since last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Appointments */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 2,
              boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)',
              borderLeft: '0.25rem solid #1cc88a'
            }}>
              <CardContent>
                <Typography sx={{ 
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#1cc88a',
                  textTransform: 'uppercase',
                  mb: 1
                }}>
                  Appointments
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#5a5c69' }}>42</Typography>
                  <Box sx={{ 
                    bgcolor: 'rgba(28, 200, 138, 0.1)',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <EventAvailableIcon sx={{ color: '#1cc88a' }} />
                  </Box>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <ArrowUpwardIcon sx={{ color: '#1cc88a', fontSize: '1rem', mr: 0.5 }} />
                  <Typography variant="caption" sx={{ color: '#1cc88a', fontWeight: 600 }}>
                    8% increase
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#858796', ml: 1, fontSize: '0.7rem' }}>
                    Since last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Schedule */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 2,
              boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)',
              borderLeft: '0.25rem solid #36b9cc'
            }}>
              <CardContent>
                <Typography sx={{ 
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#36b9cc',
                  textTransform: 'uppercase',
                  mb: 1
                }}>
                  Today's Schedule
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#5a5c69' }}>18</Typography>
                  <Box sx={{ 
                    bgcolor: 'rgba(54, 185, 204, 0.1)',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <EventIcon sx={{ color: '#36b9cc' }} />
                  </Box>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <ArrowDownwardIcon sx={{ color: '#e74a3b', fontSize: '1rem', mr: 0.5 }} />
                  <Typography variant="caption" sx={{ color: '#e74a3b', fontWeight: 600 }}>
                    3% decrease
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#858796', ml: 1, fontSize: '0.7rem' }}>
                    Since yesterday
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Requests */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 2,
              boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)',
              borderLeft: '0.25rem solid #f6c23e'
            }}>
              <CardContent>
                <Typography sx={{ 
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#f6c23e',
                  textTransform: 'uppercase',
                  mb: 1
                }}>
                  Pending Requests
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#5a5c69' }}>18</Typography>
                  <Box sx={{ 
                    bgcolor: 'rgba(246, 194, 62, 0.1)',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <EventNoteIcon sx={{ color: '#f6c23e' }} />
                  </Box>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                  <ArrowDownwardIcon sx={{ color: '#e74a3b', fontSize: '1rem', mr: 0.5 }} />
                  <Typography variant="caption" sx={{ color: '#e74a3b', fontWeight: 600 }}>
                    2% decrease
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#858796', ml: 1, fontSize: '0.7rem' }}>
                    Since yesterday
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DoctorDashboard;