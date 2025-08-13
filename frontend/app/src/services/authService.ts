import { User, LoginCredentials, RegisterData } from '../types/auth';

// Mock Users for Testing
export const mockUsers: User[] = [
  {
    id: 'ind_001',
    email: 'john.doe@example.com',
    name: 'John Doe',
    type: 'individual',
    tenant: 'trial',
    features: ['basic_research', 'ai_assistant_limited'],
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'org_001',
    email: 'admin@acme.com',
    name: 'Jane Smith',
    type: 'organization_admin',
    tenant: 'acme_corp',
    organization: 'Acme Corporation',
    features: ['full_access', 'team_collaboration', 'custom_branding'],
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-15T09:15:00Z'
  },
  {
    id: 'org_002',
    email: 'member@acme.com',
    name: 'Bob Johnson',
    type: 'organization_member',
    tenant: 'acme_corp',
    organization: 'Acme Corporation',
    features: ['basic_research', 'team_collaboration'],
    createdAt: '2024-01-05T00:00:00Z',
    lastLoginAt: '2024-01-14T16:45:00Z'
  }
];

// Simulate real authentication without backend
export const mockLogin = async (credentials: LoginCredentials): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  const user = mockUsers.find(u => u.email === credentials.email);
  if (user) {
    // Simulate token generation
    const token = btoa(JSON.stringify({ 
      userId: user.id, 
      exp: Date.now() + 3600000,
      type: user.type,
      tenant: user.tenant
    }));
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  throw new Error('Invalid credentials');
};

export const mockRegister = async (data: RegisterData): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
  
  // Check if user already exists
  if (mockUsers.find(u => u.email === data.email)) {
    throw new Error('User with this email already exists');
  }
  
  // Create new user
  const newUser: User = {
    id: `user_${Date.now()}`,
    email: data.email,
    name: data.name,
    type: data.type === 'organization' ? 'organization_admin' : 'individual',
    tenant: data.type === 'organization' ? data.organization?.toLowerCase().replace(/\s+/g, '_') || 'new_org' : 'trial',
    features: data.type === 'organization' 
      ? ['full_access', 'team_collaboration', 'custom_branding']
      : ['basic_research', 'ai_assistant_limited'],
    organization: data.organization,
    createdAt: new Date().toISOString(),
  };
  
  // Add to mock users
  mockUsers.push(newUser);
  
  // Simulate token generation
  const token = btoa(JSON.stringify({ 
    userId: newUser.id, 
    exp: Date.now() + 3600000,
    type: newUser.type,
    tenant: newUser.tenant
  }));
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(newUser));
  
  return newUser;
};

export const mockLogout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const mockGetCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('authToken');
  
  if (!userStr || !token) {
    return null;
  }
  
  try {
    const tokenData = JSON.parse(atob(token));
    if (tokenData.exp < Date.now()) {
      mockLogout();
      return null;
    }
    
    return JSON.parse(userStr);
  } catch {
    mockLogout();
    return null;
  }
};
