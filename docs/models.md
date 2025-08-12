# OpenBioCure Platform Models

## Overview
This document describes the data models used in the OpenBioCure platform, including both backend API models and frontend data structures.

## Backend Models (FastAPI/Pydantic)

### User Model
```python
class User(BaseModel):
    id: int
    email: str
    username: str
    full_name: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
```

### Authentication Models
```python
class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    email: str
    username: str
    full_name: str
    password: str
    confirm_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
```

### Bio Sample Models
```python
class BioSample(BaseModel):
    id: int
    name: str
    description: str
    sample_type: str
    collection_date: date
    storage_location: str
    user_id: int
    created_at: datetime
    updated_at: datetime
```

### Analysis Models
```python
class Analysis(BaseModel):
    id: int
    name: str
    description: str
    analysis_type: str
    status: str
    bio_sample_id: int
    user_id: int
    created_at: datetime
    completed_at: Optional[datetime]
```

## Frontend Models (TypeScript/JavaScript)

### Vue.js Models
```typescript
interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BioSample {
  id: number;
  name: string;
  description: string;
  sampleType: string;
  collectionDate: string;
  storageLocation: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}
```

### React Models
```typescript
interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BioSample {
  id: number;
  name: string;
  description: string;
  sampleType: string;
  collectionDate: string;
  storageLocation: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}
```

## Database Schema

### Users Table
- `id` (Primary Key, Auto-increment)
- `email` (Unique, Not Null)
- `username` (Unique, Not Null)
- `full_name` (Not Null)
- `password_hash` (Not Null)
- `is_active` (Boolean, Default: True)
- `created_at` (Timestamp, Default: Current)
- `updated_at` (Timestamp, Default: Current)

### Bio Samples Table
- `id` (Primary Key, Auto-increment)
- `name` (Not Null)
- `description` (Text)
- `sample_type` (Not Null)
- `collection_date` (Date)
- `storage_location` (Not Null)
- `user_id` (Foreign Key to Users)
- `created_at` (Timestamp, Default: Current)
- `updated_at` (Timestamp, Default: Current)

### Analyses Table
- `id` (Primary Key, Auto-increment)
- `name` (Not Null)
- `description` (Text)
- `analysis_type` (Not Null)
- `status` (Not Null, Default: 'pending')
- `bio_sample_id` (Foreign Key to Bio Samples)
- `user_id` (Foreign Key to Users)
- `created_at` (Timestamp, Default: Current)
- `completed_at` (Timestamp, Nullable)

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `DELETE /users/me` - Delete current user account

### Bio Samples
- `GET /bio-samples` - List user's bio samples
- `POST /bio-samples` - Create new bio sample
- `GET /bio-samples/{id}` - Get specific bio sample
- `PUT /bio-samples/{id}` - Update bio sample
- `DELETE /bio-samples/{id}` - Delete bio sample

### Analyses
- `GET /analyses` - List user's analyses
- `POST /analyses` - Create new analysis
- `GET /analyses/{id}` - Get specific analysis
- `PUT /analyses/{id}` - Update analysis
- `DELETE /analyses/{id}` - Delete analysis

## Validation Rules

### User Registration
- Email must be valid format
- Username: 3-20 characters, alphanumeric + underscore
- Password: minimum 8 characters, must contain uppercase, lowercase, number
- Full name: 2-100 characters

### Bio Sample
- Name: 1-100 characters
- Sample type: must be from predefined list
- Collection date: cannot be in the future
- Storage location: 1-200 characters

### Analysis
- Name: 1-100 characters
- Analysis type: must be from predefined list
- Status: must be one of: pending, in_progress, completed, failed 