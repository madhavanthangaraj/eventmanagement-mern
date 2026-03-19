import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, Paper, Grid } from '@mui/material';
import { keyframes } from '@mui/system';
import EventIcon from '@mui/icons-material/Event';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import GroupIcon from '@mui/icons-material/Group';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HandshakeIcon from '@mui/icons-material/Handshake';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BarChartIcon from '@mui/icons-material/BarChart';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%   { transform: translateY(0px) rotate(0deg); }
  50%  { transform: translateY(-14px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.08); }
`;

const rotateSlow = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

/* ── New title animations ── */
const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
`;



/* Big card data */
const bigCards = [
  {
    accent: '#00f2fe',
    accentBg: 'rgba(0,242,254,0.08)',
    accentBorder: 'rgba(0,242,254,0.2)',
    accentGlow: 'rgba(0,242,254,0.3)',
    title: 'Discover & Join',
    subtitle: 'Find events that matter to you',
    icon: <EventIcon fontSize="large" />,
    small: [
      {
        icon: <EventIcon fontSize="small" />,
        bg: 'rgba(0,242,254,0.1)', color: '#00f2fe', glow: 'rgba(0,242,254,0.28)',
        border: 'rgba(0,242,254,0.18)',
        title: 'Browse Events',
        desc: 'Workshops, seminars, and tech fests',
      },
      {
        icon: <CalendarMonthIcon fontSize="small" />,
        bg: 'rgba(0,242,254,0.1)', color: '#4facfe', glow: 'rgba(79,172,254,0.28)',
        border: 'rgba(79,172,254,0.18)',
        title: 'Schedule View',
        desc: 'Track upcoming events on a calendar',
      },
      {
        icon: <NotificationsActiveIcon fontSize="small" />,
        bg: 'rgba(0,242,254,0.1)', color: '#00d4e8', glow: 'rgba(0,212,232,0.28)',
        border: 'rgba(0,212,232,0.18)',
        title: 'Smart Alerts',
        desc: 'Get notified before events begin',
      },
    ],
  },
  {
    accent: '#ef629f',
    accentBg: 'rgba(239,98,159,0.08)',
    accentBorder: 'rgba(239,98,159,0.2)',
    accentGlow: 'rgba(239,98,159,0.3)',
    title: 'Earn & Achieve',
    subtitle: 'Grow your academic credentials',
    icon: <EmojiEventsIcon fontSize="large" />,
    small: [
      {
        icon: <EmojiEventsIcon fontSize="small" />,
        bg: 'rgba(239,98,159,0.1)', color: '#ef629f', glow: 'rgba(239,98,159,0.28)',
        border: 'rgba(239,98,159,0.18)',
        title: 'Earn Credits',
        desc: 'Gain activity points for participation',
      },
      {
        icon: <TrendingUpIcon fontSize="small" />,
        bg: 'rgba(239,98,159,0.1)', color: '#ee9ca7', glow: 'rgba(238,156,167,0.28)',
        border: 'rgba(238,156,167,0.18)',
        title: 'Track Progress',
        desc: 'Monitor your credit dashboard',
      },
      {
        icon: <WorkspacePremiumIcon fontSize="small" />,
        bg: 'rgba(239,98,159,0.1)', color: '#ffd89b', glow: 'rgba(255,216,155,0.28)',
        border: 'rgba(255,216,155,0.18)',
        title: 'Certificates',
        desc: 'Download verified participation proof',
      },
    ],
  },
  {
    accent: '#34d399',
    accentBg: 'rgba(52,211,153,0.08)',
    accentBorder: 'rgba(52,211,153,0.2)',
    accentGlow: 'rgba(52,211,153,0.3)',
    title: 'Connect & Grow',
    subtitle: 'Build your campus network',
    icon: <ConnectWithoutContactIcon fontSize="large" />,
    small: [
      {
        icon: <ConnectWithoutContactIcon fontSize="small" />,
        bg: 'rgba(52,211,153,0.1)', color: '#34d399', glow: 'rgba(52,211,153,0.28)',
        border: 'rgba(52,211,153,0.18)',
        title: 'Build Network',
        desc: 'Connect with peers and mentors',
      },
      {
        icon: <GroupIcon fontSize="small" />,
        bg: 'rgba(52,211,153,0.1)', color: '#6ee7b7', glow: 'rgba(110,231,183,0.28)',
        border: 'rgba(110,231,183,0.18)',
        title: 'Join Clubs',
        desc: 'Find communities around your interests',
      },
      {
        icon: <HandshakeIcon fontSize="small" />,
        bg: 'rgba(52,211,153,0.1)', color: '#a7f3d0', glow: 'rgba(167,243,208,0.28)',
        border: 'rgba(167,243,208,0.18)',
        title: 'Collaborate',
        desc: 'Partner on projects with students',
      },
    ],
  },
  {
    accent: '#a78bfa',
    accentBg: 'rgba(167,139,250,0.08)',
    accentBorder: 'rgba(167,139,250,0.2)',
    accentGlow: 'rgba(167,139,250,0.3)',
    title: 'Manage & Analyze',
    subtitle: 'Organizer tools & insights',
    icon: <AdminPanelSettingsIcon fontSize="large" />,
    small: [
      {
        icon: <AdminPanelSettingsIcon fontSize="small" />,
        bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', glow: 'rgba(167,139,250,0.28)',
        border: 'rgba(167,139,250,0.18)',
        title: 'Event Control',
        desc: 'Create and manage your events easily',
      },
      {
        icon: <BarChartIcon fontSize="small" />,
        bg: 'rgba(167,139,250,0.1)', color: '#c4b5fd', glow: 'rgba(196,181,253,0.28)',
        border: 'rgba(196,181,253,0.18)',
        title: 'Analytics',
        desc: 'View attendance and engagement stats',
      },
      {
        icon: <ManageAccountsIcon fontSize="small" />,
        bg: 'rgba(167,139,250,0.1)', color: '#ddd6fe', glow: 'rgba(221,214,254,0.28)',
        border: 'rgba(221,214,254,0.18)',
        title: 'Role Management',
        desc: 'Assign organizers and volunteers',
      },
    ],
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #090910 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: 6,
      }}
    >
      {/* ── Subtle grid overlay ── */}
      <Box sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,242,254,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,242,254,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '56px 56px',
      }} />

      {/* ── Ambient blobs ── */}
      <Box sx={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,172,254,0.18) 0%, rgba(0,242,254,0) 70%)',
        animation: `${float} 10s ease-in-out infinite`,
        filter: 'blur(1px)',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,98,159,0.1) 0%, rgba(238,205,214,0) 70%)',
        animation: `${float} 12s ease-in-out infinite reverse`,
        filter: 'blur(1px)',
      }} />

      {/* ── Rotating ring decorations ── */}
      <Box sx={{
        position: 'absolute', top: '6%', right: '3%',
        width: '170px', height: '170px', borderRadius: '50%',
        border: '1px dashed rgba(0,242,254,0.12)',
        animation: `${rotateSlow} 30s linear infinite`,
        pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '8%', left: '2%',
        width: '110px', height: '110px', borderRadius: '50%',
        border: '1px dashed rgba(239,98,159,0.1)',
        animation: `${rotateSlow} 22s linear infinite reverse`,
        pointerEvents: 'none',
      }} />

      <Container maxWidth="xl" sx={{ zIndex: 1 }}>

        {/* ══════════════ HERO SECTION ══════════════ */}
        <Box sx={{
          textAlign: 'center',
          mb: { xs: 6, md: 8 },
          animation: `${fadeIn} 0.9s ease-out both`,
        }}>
          {/* Live badge */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1,
            mb: 4, px: 2, py: 0.7,
            borderRadius: '100px',
            border: '1px solid rgba(0,242,254,0.22)',
            background: 'rgba(0,242,254,0.05)',
            backdropFilter: 'blur(8px)',
          }}>
            <Box sx={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#00f2fe',
              animation: `${pulse} 2s ease-in-out infinite`,
              boxShadow: '0 0 8px rgba(0,242,254,0.8)',
            }} />
            <Typography sx={{
              fontSize: '0.7rem', letterSpacing: '2.5px',
              textTransform: 'uppercase', color: '#00f2fe', fontWeight: 600,
            }}>
              Campus Event Platform
            </Typography>
          </Box>

          {/* ── Single-line animated title ── */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 1.5, md: 2.5 },
            flexWrap: 'nowrap',
            mb: 2,
          }}>
            <Typography
              component="span"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '3.2rem', sm: '4.5rem', md: '6rem' },
                lineHeight: 1,
                letterSpacing: '-3px',
                color: '#fff',
                display: 'inline-block',
                animation: `${slideInLeft} 0.8s cubic-bezier(0.34,1.56,0.64,1) both`,
              }}
            >
              Event
            </Typography>

            {/* Divider dot */}
            <Box sx={{
              width: { xs: 8, md: 12 },
              height: { xs: 8, md: 12 },
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
              flexShrink: 0,
              animation: `${pulse} 2.5s ease-in-out infinite`,
              boxShadow: '0 0 16px rgba(0,242,254,0.6)',
            }} />

            <Typography
              component="span"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '3.2rem', sm: '4.5rem', md: '6rem' },
                lineHeight: 1,
                letterSpacing: '-3px',
                display: 'inline-block',
                background: 'linear-gradient(90deg, #00f2fe, #4facfe, #a78bfa, #00f2fe)',
                backgroundSize: '300% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${shimmer} 3s linear infinite, ${slideInRight} 0.8s cubic-bezier(0.34,1.56,0.64,1) both`,
              }}
            >
              Manager
            </Typography>
          </Box>

          <Typography
            variant="h5"
            sx={{
              color: 'rgba(226,232,240,0.6)',
              fontWeight: 300,
              mb: 3,
              fontSize: { xs: '1rem', md: '1.25rem' },
              letterSpacing: '0.5px',
            }}
          >
            Unifying Campus Experiences
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#94a3b8',
              fontSize: '1.05rem',
              lineHeight: 1.85,
              mb: 5,
              maxWidth: '600px',
              mx: 'auto',
              fontWeight: 300,
            }}
          >
            The ultimate platform to discover, register, and manage college events. Seamlessly connect with organizers, track your credits, and elevate your academic journey.
          </Typography>

          {/* CTA Buttons */}
          <Box sx={{
            display: 'flex', flexWrap: 'wrap', gap: 2.5,
            justifyContent: 'center',
            animation: `${fadeIn} 1.1s 0.2s ease-out both`,
          }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
              startIcon={<ConnectWithoutContactIcon />}
              sx={{
                px: 4, py: 1.6,
                fontSize: '1.05rem',
                textTransform: 'none',
                borderRadius: '14px',
                fontWeight: 600,
                letterSpacing: '-0.2px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: '#090910',
                boxShadow: '0 8px 28px -6px rgba(0,242,254,0.55)',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: '0 16px 36px -6px rgba(0,242,254,0.72)',
                },
                '&:active': { transform: 'translateY(-1px)' },
              }}
            >
              Sign In
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                px: 4, py: 1.6,
                fontSize: '1.05rem',
                textTransform: 'none',
                borderRadius: '14px',
                fontWeight: 600,
                letterSpacing: '-0.2px',
                color: '#00f2fe',
                borderColor: 'rgba(0,242,254,0.38)',
                borderWidth: '1.5px',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                '&:hover': {
                  borderWidth: '1.5px',
                  borderColor: '#00f2fe',
                  background: 'rgba(0,242,254,0.07)',
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: '0 12px 28px -8px rgba(0,242,254,0.28)',
                },
                '&:active': { transform: 'translateY(-1px)' },
              }}
            >
              Create Account
            </Button>
          </Box>
        </Box>

        {/* ══════════════ FOUR BIG CARDS — centered ══════════════ */}

        <Grid 
          container 
          spacing={3} 
          justifyContent="center" 
          sx={{ animation: `${fadeIn} 1s 0.4s ease-out both` }}
        >
          {bigCards.map((card, cardIdx) => (
            <Grid 
              item 
              xs={12} sm={6} lg={3} 
              key={cardIdx} 
              sx={{ minWidth: 0, display: 'flex', justifyContent: 'center' }}
            >
              <Box sx={{ width: '100%', maxWidth: '340px' }}>
              <Paper
                elevation={0}
                sx={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(24px)',
                  borderRadius: '24px',
                  border: `1px solid ${card.accentBorder}`,
                  p: 2.5,
                  height: '100%',
                  boxShadow: `
                    0 30px 60px -20px rgba(0,0,0,0.6),
                    inset 0 1px 0 rgba(255,255,255,0.06),
                    0 0 0 1px ${card.accent}08
                  `,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `
                      0 40px 70px -20px rgba(0,0,0,0.7),
                      inset 0 1px 0 rgba(255,255,255,0.08),
                      0 0 40px -10px ${card.accentGlow}
                    `,
                    border: `1px solid ${card.accent}55`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                    background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)`,
                  },
                  '&::after': {
                    content: '""', position: 'absolute',
                    top: '-30%', right: '-10%',
                    width: '180px', height: '180px',
                    background: `radial-gradient(circle, ${card.accent}0a 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  },
                }}
              >
                {/* Big card header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Box sx={{
                    p: 1.2, borderRadius: '13px',
                    background: card.accentBg,
                    color: card.accent,
                    display: 'flex', flexShrink: 0,
                    boxShadow: `0 4px 20px -4px ${card.accentGlow}`,
                  }}>
                    {card.icon}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{
                      color: '#fff', fontWeight: 700,
                      fontSize: '0.95rem', letterSpacing: '-0.3px', lineHeight: 1.2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {card.title}
                    </Typography>
                    <Typography sx={{
                      color: '#64748b', fontSize: '0.72rem', mt: 0.3,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {card.subtitle}
                    </Typography>
                  </Box>
                </Box>

                {/* Divider */}
                <Box sx={{
                  height: '1px',
                  background: `linear-gradient(90deg, ${card.accent}40, transparent)`,
                  mb: 2,
                }} />

                {/* 3 small cards inside */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {card.small.map((item, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex', alignItems: 'flex-start', gap: 1.5,
                        p: 1.5,
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.04)',
                        background: 'rgba(255,255,255,0.02)',
                        transition: 'all 0.25s ease',
                        cursor: 'default',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.05)',
                          border: `1px solid ${item.border}`,
                          transform: 'translateX(3px)',
                          boxShadow: `-3px 0 0 0 ${item.color}55, 6px 0 16px -6px ${item.glow}`,
                        },
                      }}
                    >
                      <Box sx={{
                        p: 0.8, borderRadius: '8px',
                        background: item.bg, color: item.color,
                        display: 'flex', flexShrink: 0,
                        boxShadow: `0 4px 12px -4px ${item.glow}`,
                      }}>
                        {item.icon}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{
                          color: '#e2e8f0', fontWeight: 600,
                          fontSize: '0.78rem', mb: 0.2, letterSpacing: '-0.1px',
                        }}>
                          {item.title}
                        </Typography>
                        <Typography sx={{
                          color: '#64748b', fontSize: '0.7rem', lineHeight: 1.5,
                        }}>
                          {item.desc}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
              </Box>
            </Grid>
          ))}
        </Grid>

      </Container>
    </Box>
  );
}

export default Home;