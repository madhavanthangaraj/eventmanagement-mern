import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(undefined);
const STORAGE_KEY = 'college-erp-auth';
const REGISTRY_KEY = 'college-event-user-registry';
const EVENTS_KEY = 'college-event-events';
const REGISTRATIONS_KEY = 'college-event-registrations';
const PROOFS_KEY = 'college-event-proofs';
const CREDITS_KEY = 'college-event-credits';

const defaultUser = null;

const roleMenus = {
  'super-admin': [
    { label: 'Dashboard', path: '/super-admin/dashboard' },
    { label: 'User Management', path: '/super-admin/users' },
    { label: 'Role Assignment', path: '/super-admin/roles' },
    { label: 'Reports', path: '/super-admin/reports' },
    { label: 'Profile', path: '/profile' },
  ],
  'SUPER_ADMIN': [ // Add uppercase version
    { label: 'Dashboard', path: '/super-admin/dashboard' },
    { label: 'User Management', path: '/super-admin/users' },
    { label: 'Role Assignment', path: '/super-admin/roles' },
    { label: 'Reports', path: '/super-admin/reports' },
    { label: 'Profile', path: '/profile' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Event Approvals', path: '/admin/event-approvals' },
    { label: 'Event Management', path: '/admin/events' },
    { label: 'Reports', path: '/admin/reports' },
    { label: 'Profile', path: '/profile' },
  ],
  'ADMIN': [ // Add uppercase version
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Event Approvals', path: '/admin/event-approvals' },
    { label: 'Event Management', path: '/admin/events' },
    { label: 'Reports', path: '/admin/reports' },
    { label: 'Profile', path: '/profile' },
  ],
  organizer: [
    { label: 'Dashboard', path: '/organizer/dashboard' },
    { label: 'Create Event', path: '/organizer/create-event' },
    { label: 'My Events', path: '/organizer/my-events' },
    { label: 'Profile', path: '/profile' },
  ],
  'ORGANIZER': [ // Add uppercase version
    { label: 'Dashboard', path: '/organizer/dashboard' },
    { label: 'Create Event', path: '/organizer/create-event' },
    { label: 'My Events', path: '/organizer/my-events' },
    { label: 'Profile', path: '/profile' },
  ],
  mentor: [
    { label: 'Dashboard', path: '/mentor/dashboard' },
    { label: 'Proof Verification', path: '/mentor/proof-verification' },
    { label: 'Profile', path: '/profile' },
  ],
  'MENTOR': [ // Add uppercase version
    { label: 'Dashboard', path: '/mentor/dashboard' },
    { label: 'Proof Verification', path: '/mentor/proof-verification' },
    { label: 'Profile', path: '/profile' },
  ],
  student: [
    { label: 'Dashboard', path: '/student/dashboard' },
    { label: 'Available Events', path: '/student/events' },
    { label: 'My Registrations', path: '/student/registrations' },
    { label: 'Upload Proof', path: '/student/upload-proof' },
    { label: 'Reports', path: '/student/reports' },
    { label: 'Profile', path: '/profile' },
  ],
  'STUDENT': [ // Add uppercase version
    { label: 'Dashboard', path: '/student/dashboard' },
    { label: 'Available Events', path: '/student/events' },
    { label: 'My Registrations', path: '/student/registrations' },
    { label: 'Upload Proof', path: '/student/upload-proof' },
    { label: 'Reports', path: '/student/reports' },
    { label: 'Profile', path: '/profile' },
  ],
};

export const ROLE_REDIRECT = {
  'super-admin': '/super-admin/dashboard',
  'SUPER_ADMIN': '/super-admin/dashboard',
  'admin': '/admin/dashboard',
  'ORGANIZER': '/organizer/dashboard',
  'organizer': '/organizer/dashboard',
  'mentor': '/mentor/dashboard',
  'MENTOR': '/mentor/dashboard',
  'student': '/student/dashboard',
  'STUDENT': '/student/dashboard'
};

const readRegistry = () => {
  return [];
};

const writeRegistry = (registry) => {
  // No-op - using database only
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultUser;
  });

  const [usersCache, setUsersCache] = useState([]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const seedDefaultAccounts = () => {
    const registry = readRegistry();
    
    // Department-wise admin accounts with exact email format
    const departmentAdmins = [
      { dept: 'CSE', email: 'admincse@college.edu', password: 'Cse@2026' },
      { dept: 'IT', email: 'adminit@college.edu', password: 'It@2026' },
      { dept: 'ECE', email: 'adminece@college.edu', password: 'Ece@2026' },
      { dept: 'EEE', email: 'admineee@college.edu', password: 'Eee@2026' },
      { dept: 'CSBS', email: 'admincsbs@college.edu', password: 'Csbs@2026' },
      { dept: 'CCE', email: 'admincce@college.edu', password: 'Cce@2026' },
    ];
    
    // Department admin emails are now handled in the backend

    const defaultAccounts = [
      {
        name: 'Super Admin',
        email: 'superadmin@college.edu',
        password: 'Super@2026',
        role: 'SUPER_ADMIN',
        roles: ['SUPER_ADMIN'],
        department: 'Administration',
        year: 'N/A',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      },
      // Add department-wise admins
      ...departmentAdmins.map((admin) => ({
        name: `Admin ${admin.dept}`,
        email: admin.email,
        password: admin.password,
        role: 'admin',
        roles: ['admin'],
        department: admin.dept,
        year: 'N/A',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      })),
    ];

    let next = [...registry];
    
    defaultAccounts.forEach((defaultAcc) => {
      const existingIndex = next.findIndex((u) => u.email === defaultAcc.email);
      if (existingIndex === -1) {
        // Account doesn't exist, add it
        next.push(defaultAcc);
      } else {
        // Account exists - ensure it has correct role and ACTIVE status
        next[existingIndex] = {
          ...next[existingIndex],
          role: defaultAcc.role,
          status: 'ACTIVE',
          password: defaultAcc.password,
        };
      }
    });
    
    writeRegistry(next);
  };

  useEffect(() => {
    seedDefaultAccounts();
  }, []);

  // Helper function to normalize role format
  const normalizeRole = (role) => {
    if (!role) return 'user';
    // Keep uppercase for backend compatibility, only replace underscores with hyphens
    return role.replace(/_/g, '-');
  };

  const login = async (credentials) => {
    try {
      console.log('Login attempt with email:', credentials.email);
      
      // Direct super admin login
      if (credentials.email === 'superadmin@college.edu' && credentials.password === 'Super@2026') {
        const superAdmin = {
          _id: 'superadmin-id',
          name: 'Super Admin',
          email: 'superadmin@college.edu',
          role: 'SUPER_ADMIN',
          token: 'superadmin-token',
          department: 'Administration',
          year: 'N/A',
          status: 'ACTIVE'
        };
        
        console.log('Super admin login successful');
        setUser(superAdmin);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(superAdmin));
        return superAdmin;
      }
      
      // Regular login flow for other users
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password
        }),
      });

      let data;
      try {
        data = await response.json();
        console.log('Server response:', { status: response.status, data });
      } catch (parseError) {
        console.error('Failed to parse server response:', parseError);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        const errorMessage = data?.message || 'Login failed';
        const error = new Error(errorMessage);
        error.code = response.status === 401 ? 'INVALID_CREDENTIALS' : 
                   response.status === 403 ? 'INACTIVE' : 'LOGIN_ERROR';
        console.error('Login failed:', { status: response.status, errorMessage });
        throw error;
      }

      if (!data.token) {
        console.error('No token in response:', data);
        throw new Error('No authentication token received from server');
      }

      // Ensure role is properly formatted
      const userData = {
        ...data.user,
        role: data.user.role.toUpperCase() // Ensure uppercase for backend compatibility
      };

      const user = {
        ...userData,
        token: data.token,
        // Ensure all required fields have default values
        department: userData.department || 'N/A',
        year: userData.year || 'N/A',
        status: userData.status || 'ACTIVE'
      };

      console.log('Login successful, user:', user);
      setUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      
      return user;
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};

  const register = async ({ name, email, password, role, department, year }) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          department,
          year,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.message || 'Registration failed';
        if (data.errors) {
          // Handle validation errors from backend
          errorMessage = Object.values(data.errors).join('\n');
        }
        const error = new Error(errorMessage);
        if (response.status === 400) {
          if (errorMessage.toLowerCase().includes('already exists')) {
            error.code = 'EMAIL_EXISTS';
          } else if (errorMessage.toLowerCase().includes('password')) {
            error.code = 'INVALID_PASSWORD';
          }
        }
        throw error;
      }

      // If registration is successful, automatically log the user in
      if (data.token && data.user) {
        const user = {
          ...data.user,
          token: data.token
        };
        setUser(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getAllUsers = () => {
    return readRegistry();
  };

  const approveUser = (email) => {
    const registry = readRegistry();
    const updated = registry.map((u) => (u.email === email ? { ...u, status: 'ACTIVE' } : u));
    writeRegistry(updated);
    return updated.find((u) => u.email === email);
  };

  const rejectUser = (email) => {
    const registry = readRegistry();
    const updated = registry.map((u) => (u.email === email ? { ...u, status: 'REJECTED' } : u));
    writeRegistry(updated);
    return updated.find((u) => u.email === email);
  };

  const updateUserRole = (email, newRole) => {
    const registry = readRegistry();
    const updated = registry.map((u) => (u.email === email ? { ...u, role: newRole } : u));
    writeRegistry(updated);
    return updated.find((u) => u.email === email);
  };

  const activateUser = (email) => {
    const registry = readRegistry();
    const updated = registry.map((u) => (u.email === email ? { ...u, status: 'ACTIVE' } : u));
    writeRegistry(updated);
    return updated.find((u) => u.email === email);
  };

  const deactivateUser = (email) => {
    const registry = readRegistry();
    const updated = registry.map((u) => (u.email === email ? { ...u, status: 'INACTIVE' } : u));
    writeRegistry(updated);
    return updated.find((u) => u.email === email);
  };

  // Event Management Functions
  const readEvents = () => {
    return [];
  };

  const writeEvents = (events) => {
    // No-op - using database only
  };

  const readRegistrations = () => {
    return [];
  };

  const writeRegistrations = (registrations) => {
    // No-op - using database only
  };

  const createEvent = async (eventData) => {
    try {
      // Fix role format on the fly for existing users
      const currentUser = { ...user };
      if (currentUser.role === 'organizer') {
        currentUser.role = 'ORGANIZER';
      }
      
      console.log('Creating event with user role:', currentUser.role);
      console.log('User token:', currentUser.token ? 'exists' : 'missing');
      console.log('Event data being sent:', eventData);
      
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(eventData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          errorData = { message: errorText };
        }
        
        console.error('Error response parsed:', errorData);
        throw new Error(errorData.message || 'Failed to create event');
      }

      const data = await response.json();
      console.log('Event created successfully:', data);
      return data.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const getAllEvents = () => {
    return readEvents();
  };

  const getEventById = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  };

  const getEventsByDepartment = (department, collegeEventsOnly = false) => {
    const events = readEvents();
    return events.filter(event => {
      const matchesDepartment = event.organizerDepartment === department;
      return collegeEventsOnly 
        ? matchesDepartment && event.isCollegeEvent
        : matchesDepartment;
    });
  };

  const updateEventAPI = async (eventId, updates) => {
    try {
      const currentUser = { ...user };
      if (currentUser.role === 'organizer') {
        currentUser.role = 'ORGANIZER';
      }
      
      console.log('Updating event with ID:', eventId);
      console.log('Updates:', updates);
      
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error updating event:', errorText);
        throw new Error('Failed to update event');
      }

      const data = await response.json();
      console.log('Event updated successfully:', data);
      return data.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const updateEvent = (eventId, updates) => {
    const events = readEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) return null;
    
    // For college events, allow updates regardless of status
    const isCollegeEvent = events[eventIndex].isCollegeEvent;
    
    // If not a college event and not in PENDING status, don't allow updates
    if (!isCollegeEvent && events[eventIndex].status !== 'PENDING') {
      throw new Error('Only pending events can be updated');
    }
    
    // Preserve important fields that shouldn't be updated
    const { id, createdAt, organizerEmail, organizerName, organizerDepartment, isCollegeEvent: _, ...safeUpdates } = updates;
    
    const updatedEvent = {
      ...events[eventIndex],
      ...safeUpdates,
      updatedAt: new Date().toISOString()
    };
    
    const updatedEvents = [...events];
    updatedEvents[eventIndex] = updatedEvent;
    writeEvents(updatedEvents);
    
    return updatedEvent;
  };

  const deleteEvent = (eventId) => {
    const events = readEvents();
    const event = events.find(e => e.id === eventId);
    
    if (!event) return false;
    
    // Prevent deletion if event is completed or has participants
    if (event.status === 'COMPLETED' || 
        (event.registeredParticipants && event.registeredParticipants.length > 0)) {
      throw new Error('Cannot delete event with participants or completed events');
    }
    
    const updatedEvents = events.filter(e => e.id !== eventId);
    writeEvents(updatedEvents);
    return true;
  };

  const approveEvent = async (eventId, adminRemarks = '') => {
    try {
      console.log('Approving event with ID:', eventId);
      console.log('Event ID type:', typeof eventId);
      console.log('Event ID value:', JSON.stringify(eventId));
      
      const currentUser = { ...user };
      if (currentUser.role === 'admin') {
        currentUser.role = 'ADMIN';
      }
      
      console.log('Admin remarks:', adminRemarks);
      
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          adminRemarks,
          status: 'ACTIVE'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error approving event:', errorText);
        throw new Error('Failed to approve event');
      }

      const data = await response.json();
      console.log('Event approved successfully:', data);
      return data.data;
    } catch (error) {
      console.error('Error approving event:', error);
      throw error;
    }
  };

  const rejectEvent = async (eventId, adminRemarks = '') => {
    try {
      const currentUser = { ...user };
      if (currentUser.role === 'admin') {
        currentUser.role = 'ADMIN';
      }
      
      console.log('Rejecting event with ID:', eventId);
      console.log('Admin remarks:', adminRemarks);
      
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          adminRemarks,
          status: 'REJECTED'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error rejecting event:', errorText);
        throw new Error('Failed to reject event');
      }

      const data = await response.json();
      console.log('Event rejected successfully:', data);
      return data.data;
    } catch (error) {
      console.error('Error rejecting event:', error);
      throw error;
    }
  };

  const registerForEvent = (eventId, studentEmail) => {
    const registrations = readRegistrations();
    const exists = registrations.some((r) => r.eventId === eventId && r.studentEmail === studentEmail);
    if (exists) {
      throw new Error('Already registered for this event');
    }
    const newRegistration = {
      id: `reg-${Date.now()}`,
      eventId,
      studentEmail,
      registeredAt: new Date().toISOString(),
    };
    writeRegistrations([newRegistration, ...registrations]);
    return newRegistration;
  };

  const getEventRegistrations = (eventId) => {
    const registrations = readRegistrations();
    return registrations.filter((r) => r.eventId === eventId);
  };

  // Proof Management Functions
  const readProofs = () => {
    return [];
  };

  const writeProofs = (proofs) => {
    // No-op - using database only
  };

  const readCredits = () => {
    return [];
  };

  const writeCredits = (credits) => {
    // No-op - using database only
  };

  const submitProof = async (eventId, proofData) => {
    try {
      const currentUser = { ...user };
      if (currentUser.role === 'student') {
        currentUser.role = 'STUDENT';
      }
      
      console.log('Submitting proof with user role:', currentUser.role);
      console.log('Event ID:', eventId);
      console.log('Proof data:', proofData);
      
      // Send as JSON since no file upload
      const response = await fetch('http://localhost:5000/api/student/submit-proof', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          eventName: proofData.eventName,
          organizationName: proofData.organizationName,
          driveLink: proofData.driveLink,
          description: proofData.description,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error submitting proof:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          errorData = { message: errorText };
        }
        
        console.error('Error response parsed:', errorData);
        throw new Error(errorData.message || 'Failed to submit proof');
      }

      const data = await response.json();
      console.log('Proof submitted successfully:', data);
      
      return data.data;
    } catch (error) {
      console.error('Error submitting proof:', error);
      throw error;
    }
  };

  const getAllProofs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/mentor/proofs', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch proofs');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching proofs:', error);
      throw error;
    }
  };

  const getStudentProofs = async (studentEmail) => {
    try {
      // Use the reports endpoint to get proof status
      const response = await fetch('http://localhost:5000/api/student/reports', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch student reports');
      }
      
      const data = await response.json();
      // Convert reports to proof-like objects for compatibility
      return data.data.map(r => ({
        eventId: r.eventId,
        eventName: r.eventName,
        studentEmail: user?.email,
        status: r.proofStatus,
        mentorRemarks: r.mentorRemarks,
        id: `proof-${r.eventId}` // Generate a unique ID
      }));
    } catch (error) {
      console.error('Error fetching student proofs:', error);
      return [];
    }
  };

  const verifyProof = async (proofId, remarks = '', customCredits = null) => {
    try {
      const body = { remarks };
      if (customCredits !== null) {
        body.creditPoints = customCredits;
      }
      
      // Ensure we have the correct user token and role
      const currentUser = { ...user };
      if (currentUser.role === 'mentor') {
        currentUser.role = 'MENTOR';
      }
      
      const response = await fetch(`http://localhost:5000/api/mentor/verify-proof/${proofId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error verifying proof:', errorText);
        throw new Error('Failed to verify proof');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error verifying proof:', error);
      throw error;
    }
  };

  const rejectProof = async (proofId, remarks = '') => {
    try {
      // Ensure we have the correct user token and role
      const currentUser = { ...user };
      if (currentUser.role === 'mentor') {
        currentUser.role = 'MENTOR';
      }
      
      const response = await fetch(`http://localhost:5000/api/mentor/reject-proof/${proofId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remarks }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error rejecting proof:', errorText);
        throw new Error('Failed to reject proof');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error rejecting proof:', error);
      throw error;
    }
  };

  const getStudentCredits = async (studentEmail) => {
    try {
      // Use the dedicated student credits endpoint
      const response = await fetch('http://localhost:5000/api/student/credits', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch student credits');
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching student credits:', error);
      throw error;
    }
  };

  const getTotalCredits = async (studentEmail) => {
    try {
      const credits = await getStudentCredits(studentEmail);
      return credits.reduce((total, c) => total + (c.creditPoints || 0), 0);
    } catch (error) {
      console.error('Error calculating total credits:', error);
      return 0;
    }
  };

  const getAllCreditsFromDB = async () => {
    try {
      const currentUser = { ...user };
      if (currentUser.role === 'admin') {
        currentUser.role = 'ADMIN';
      }
      
      // Get all CSE students first
      const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const usersData = await usersResponse.json();
      const cseStudents = (usersData.data || []).filter(u => 
        u.department === 'CSE' && String(u.role || '').toUpperCase() === 'STUDENT'
      );
      
      console.log('Found CSE students:', cseStudents.length);
      
      // Create a map of student emails to their data
      const studentMap = {};
      cseStudents.forEach(student => {
        studentMap[student.email] = {
          ...student,
          totalCredits: 0,
          credits: []
        };
      });
      
      // Get all credits from the Credit collection
      try {
        const creditsResponse = await fetch('http://localhost:5000/api/admin/credits/all', {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (creditsResponse.ok) {
          const creditsData = await creditsResponse.json();
          console.log('Total credits found:', creditsData.data?.length);
          
          // Filter credits for CSE students
          const studentCredits = (creditsData.data || []).filter(credit => 
            studentMap[credit.studentEmail]
          );
          
          console.log('CSE student credits found:', studentCredits.length);
          
          // Calculate credits for each student
          studentCredits.forEach(credit => {
            if (studentMap[credit.studentEmail]) {
              studentMap[credit.studentEmail].totalCredits += credit.creditPoints || 0;
              studentMap[credit.studentEmail].credits.push({
                eventName: credit.eventName,
                creditPoints: credit.creditPoints,
                awardedAt: credit.awardedAt,
                awardedBy: credit.awardedBy
              });
            }
          });
        } else {
          console.log('Cannot access all credits endpoint, using fallback');
        }
      } catch (error) {
        console.log('All credits endpoint failed, using fallback approach');
      }
      
      // Convert map back to array
      const studentsWithCredits = Object.values(studentMap);
      
      console.log('Final students with credits:', studentsWithCredits.map(s => ({
        name: s.name,
        email: s.email,
        totalCredits: s.totalCredits
      })));
      
      return studentsWithCredits;
    } catch (error) {
      console.error('Error fetching all credits:', error);
      throw error;
    }
  };

  // Fetch dashboard statistics from backend
  const getDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/superadmin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  };

  // Fetch organizer dashboard data
  const getOrganizerDashboardData = async () => {
    try {
      console.log('Fetching organizer dashboard data...');
      console.log('User token:', user?.token ? 'exists' : 'missing');
      
      // First test if server is reachable
      try {
        const healthResponse = await fetch('http://localhost:5000/api/health');
        console.log('Server health check:', healthResponse.ok);
        if (!healthResponse.ok) {
          throw new Error('Server is not responding correctly');
        }
      } catch (healthErr) {
        console.error('Server health check failed:', healthErr);
        throw new Error('Backend server is not running or not accessible');
      }
      
      const response = await fetch('http://localhost:5000/api/organizer/dashboard', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch organizer dashboard data: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Dashboard data received:', data);
      return data.data;
    } catch (error) {
      console.error('Error fetching organizer dashboard data:', error);
      throw error;
    }
  };

  // Fetch organizer events from backend
  const getOrganizerEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/organizer/events', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch organizer events');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      throw error;
    }
  };

  // Fetch organizer events from backend
  const fetchAllEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  };

  // Fetch student's own registrations from backend
  const getStudentRegistrationsFromAPI = async () => {
    try {
      const currentUser = { ...user };
      if (currentUser.role === 'student') {
        currentUser.role = 'STUDENT';
      }
      
      // Use the same endpoint as MyRegistrations
      const response = await fetch('http://localhost:5000/api/events/registrations/me', {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch student registrations');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching student registrations:', error);
      throw error;
    }
  };

  // Fetch student reports with credits
  const getStudentReportsFromAPI = async () => {
    try {
      const currentUser = { ...user };
      if (currentUser.role === 'student') {
        currentUser.role = 'STUDENT';
      }
      
      const response = await fetch('http://localhost:5000/api/student/reports', {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch student reports');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching student reports:', error);
      throw error;
    }
  };

  // Fetch event registrations from backend
  const getEventRegistrationsFromAPI = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/registrations`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch event registrations');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      throw error;
    }
  };

  // Get all users with filters
  // In AuthContext.js, around line 622
const fetchUsers = async (filters = {}) => {
  try {
    if (!user?.token) {
      return [];
    }

    const queryParams = new URLSearchParams(filters).toString();
    const normalizedRole = String(user?.role || '').trim().toUpperCase();
    const baseUrl = normalizedRole === 'SUPER_ADMIN'
      ? 'http://localhost:5000/api/superadmin/users'
      : 'http://localhost:5000/api/admin/users';
    const url = queryParams ? `${baseUrl}?${queryParams}` : baseUrl;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${user?.token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const data = await response.json();
    const users = Array.isArray(data) ? data : (data.users || data.data || []);
    
    // Filter out superadmin
    return users.filter(user => 
      user.email !== 'superadmin@college.edu' && 
      user.role !== 'SUPER_ADMIN' && 
      user.role !== 'super-admin'
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

  useEffect(() => {
    let didCancel = false;

    const normalizedRole = String(user?.role || '').trim().toUpperCase();
    if (!user?.token || (normalizedRole !== 'ADMIN' && normalizedRole !== 'SUPER_ADMIN')) {
      setUsersCache([]);
      return;
    }

    (async () => {
      try {
        const users = await fetchUsers();
        if (!didCancel) {
          setUsersCache(Array.isArray(users) ? users : []);
        }
      } catch (e) {
        if (!didCancel) {
          setUsersCache([]);
        }
      }
    })();

    return () => {
      didCancel = true;
    };
  }, [user?.token, user?.role, user?.department]);

  const value = useMemo(
    () => ({
      // Authentication
      user,
      login,
      register,
      logout,
      
      // Navigation
      roleMenus,
      
      // User Management
      getDashboardStats,
      fetchUsers,
      getAllUsers: () => usersCache,
      approveUser: async (userId) => {
        const response = await fetch(`http://localhost:5000/api/superadmin/approve-user/${userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to approve user');
        return await response.json();
      },
      rejectUser: async (userId) => {
        const response = await fetch(`http://localhost:5000/api/superadmin/reject-user/${userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to reject user');
        return await response.json();
      },
      updateUserRole: async (userId, role) => {
      try {
        const response = await fetch(`http://localhost:5000/api/superadmin/assign-role/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
          body: JSON.stringify({ role })
        });
        if (!response.ok) {
          throw new Error('Failed to update user role');
        }

        const result = await response.json();
        return result?.data || result;
      } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
      }
    },
    toggleUserStatus: async (userId, currentStatus) => {
      try {
        const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        const response = await fetch(`http://localhost:5000/api/users/status/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
          body: JSON.stringify({ status: nextStatus })
        });
        if (!response.ok) {
          throw new Error('Failed to update user status');
        }

        const result = await response.json();
        return result?.data || result;
      } catch (error) {
        console.error('Error toggling user status:', error);
        throw error;
      }
    },
      
      // Event Management
      createEvent,
      getAllEvents,
      fetchAllEvents,
      getEventById,
      getEventsByDepartment,
      updateEvent,
      updateEventAPI,
      deleteEvent,
      approveEvent,
      rejectEvent,
      registerForEvent,
      getEventRegistrations,
      getOrganizerDashboardData,
      getOrganizerEvents,
      getEventRegistrationsFromAPI,
      getStudentRegistrationsFromAPI,
      getStudentReportsFromAPI,
      
      // Proof Management
      submitProof,
      getAllProofs,
      getStudentProofs,
      verifyProof,
      rejectProof,
      
      // Credit Management
      getStudentCredits,
      getTotalCredits,
      getAllCreditsFromDB,
      
      // Other
      readRegistry,
      writeRegistry,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, roleMenus, usersCache],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
