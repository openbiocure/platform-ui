# OpenBioCure Platform

A comprehensive bioinformatics platform built with modern technologies in a monorepo structure.

## 🏗️ Project Structure

```
openbiocure-platform-ui/
├── backend/                 # FastAPI Python backend
│   ├── app/                # Application modules
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core configuration
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── tests/             # Test suite
│   ├── venv/              # Python virtual environment
│   ├── main.py            # FastAPI application entry point
│   └── requirements.txt   # Python dependencies
├── frontend/               # Frontend applications
│   ├── shell-app/         # React shell application (main container)
│   ├── research-core-app/ # Research core micro frontend
│   ├── analysis-app/      # Analysis micro frontend
│   ├── workflow-app/      # Workflow micro frontend
│   └── shared/            # Shared components and utilities
├── docs/                   # Documentation
│   └── models.md          # Data models and API documentation
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI server:**
   ```bash
   python main.py
   # or
   uvicorn main:app --reload
   ```

5. **Access the API:**
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

### Frontend Setup

#### React Micro Frontend Applications

1. **Install all dependencies:**
   ```bash
   cd frontend
   npm run install:all
   ```

2. **Start all micro frontends:**
   ```bash
   npm run dev
   ```

3. **Start individual applications:**
   ```bash
   npm run start:shell      # Port 3000 (Main app)
   npm run start:research-core # Port 3001
   npm run start:analysis   # Port 3002
   npm run start:workflow   # Port 3003
   ```

4. **Access the applications:**
   - Shell App: http://localhost:3000
   - Research Core: http://localhost:3001
   - Analysis: http://localhost:3002
   - Workflow: http://localhost:3003

## 🛠️ Development

### Backend Development

The backend is built with FastAPI and follows a modular architecture:

- **API Routes**: RESTful endpoints in `app/api/`
- **Data Models**: SQLAlchemy models in `app/models/`
- **Schemas**: Pydantic validation schemas in `app/schemas/`
- **Services**: Business logic in `app/services/`
- **Core**: Configuration and utilities in `app/core/`

### Frontend Development

The frontend uses a React-based micro frontend architecture with modern UI components:

- **React 18**: Modern React with hooks and functional components
- **Micro Frontends**: Independent applications for different domains
- **Module Federation**: Seamless component sharing between apps
- **Modern Tooling**: Create React App, TypeScript, ESLint
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/docs/components-json) for professional, accessible, and customizable components
- **Design System**: Montserrat typography with professional color palette (blues, orange, cyan)
- **Performance**: Lazy loading, independent deployment, better caching

## 📚 Documentation

### API Documentation
The API provides endpoints for:

- **Authentication**: User registration, login, JWT tokens
- **Users**: Profile management
- **Bio Samples**: Sample tracking and management
- **Analyses**: Analysis workflows and results

See `docs/models.md` for detailed API specifications and data models.

### Feature Documentation
Comprehensive feature breakdown with user stories and requirements:

- **Feature Epics**: Detailed breakdown of platform capabilities
- **User Stories**: Implementation requirements and acceptance criteria
- **Development Roadmap**: MVP and Phase 2 feature priorities

See `docs/features/README.md` for the complete feature breakdown.

### Design System
Complete visual identity and component guidelines:

- **Color Palette**: Professional blues, orange, and cyan scheme
- **Typography**: Montserrat font family with comprehensive scale
- **Component Guidelines**: Button, form, and navigation standards
- **Accessibility**: Color contrast and focus indicator requirements

See `docs/design-system.md` for the complete design specifications.

## 🔧 Available Scripts

### Backend
- `python main.py` - Run FastAPI server
- `uvicorn main:app --reload` - Run with auto-reload
- `pytest` - Run test suite

### React Micro Frontends
- `npm run dev` - Start all micro frontends
- `npm run start:shell` - Start shell application
- `npm run start:research-core` - Start research core app
- `npm run start:analysis` - Start analysis app
- `npm run start:workflow` - Start workflow app
- `npm run build` - Build all applications
- `npm run test` - Run tests across all apps

## 🌐 Environment Variables

Create `.env` files in respective directories:

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SHELL_URL=http://localhost:3000
REACT_APP_RESEARCH_CORE_URL=http://localhost:3001
REACT_APP_ANALYSIS_URL=http://localhost:3002
REACT_APP_WORKFLOW_URL=http://localhost:3003
```

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests if applicable
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions, please open an issue in the repository.
