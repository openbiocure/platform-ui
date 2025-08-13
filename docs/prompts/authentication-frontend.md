# 🚀 **Authentication Frontend Development Prompt**

## **Objective**
Build a complete authentication frontend for the OpenBioCure Platform using React 18, TypeScript, and shadcn/ui components. Focus on creating a working prototype with mock data and no backend API integration.

## **Reference Documentation**
- **User Stories**: See [@docs/features/authentication.md](./authentication.md) for complete requirements
- **Design System**: See [@docs/design-system.md](./design-system.md) for colors, typography, and components

## **Technical Stack**
See [@frontend/README.md](../frontend/README.md) for complete technical stack details including:
- Development and build commands

## **Key User Stories to Implement**

### **Phase 1: Core Authentication (MVP)**
- **US-146**: User Registration and Onboarding
- **US-147**: User Login and Session Management  
- **US-148**: Password Management
- **US-162**: Seamless Authentication Flow

### **Phase 2: Advanced Features**
- **US-149**: Multi-Factor Authentication
- **US-165**: Trial Account Management
- **US-166**: Individual vs. Organization Registration
- **US-167**: Tenant Assignment Rules

## **Implementation Focus**

### **1. Mock Data Structure**
```typescript
// Mock Users for Testing
const mockUsers = {
  individual: {
    id: 'ind_001',
    email: 'john.doe@example.com',
    name: 'John Doe',
    type: 'individual',
    tenant: 'trial',
    features: ['basic_research', 'ai_assistant_limited']
  },
  organization: {
    id: 'org_001',
    email: 'admin@acme.com',
    name: 'Jane Smith',
    type: 'organization_admin',
    tenant: 'acme_corp',
    organization: 'Acme Corporation',
    features: ['full_access', 'team_collaboration', 'custom_branding']
  }
};
```

### **2. Component Architecture**
```
src/
├── components/auth/          # Authentication components
├── contexts/AuthContext.tsx  # Global auth state
├── hooks/useAuth.ts         # Authentication hooks
├── types/auth.ts            # TypeScript interfaces
├── utils/validation.ts      # Form validation
└── pages/auth/              # Authentication pages
```

### **3. Mock Authentication Flow**
```typescript
// Simulate real authentication without backend
const mockLogin = async (email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  const user = mockUsers.find(u => u.email === email);
  if (user) {
    const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 3600000 }));
    localStorage.setItem('authToken', token);
    return user;
  }
  throw new Error('Invalid credentials');
};
```

## **Success Criteria**

✅ **All authentication pages render correctly**  
✅ **Forms validate input and show errors**  
✅ **Mock authentication flow works end-to-end**  
✅ **Responsive design works on all breakpoints**  
✅ **shadcn/ui components integrated properly**  
✅ **Custom color scheme applied correctly**  
✅ **TypeScript compilation without errors**  
✅ **No console errors or warnings**  
✅ **Accessibility features implemented**  
✅ **Mock data structure matches requirements**  

## **Start Building**

1. **Begin with AuthContext** and basic login form
2. **Implement mock data** and authentication flow
3. **Add form validation** and error handling
4. **Expand to other pages** incrementally
5. **Test all user flows** with mock data

---

**Reference**: See [@docs/features/authentication.md](./authentication.md) for complete user story details and acceptance criteria.
