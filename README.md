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
├── frontend/               # Frontend application
│   └── vue-app/           # Vue.js 3 + Vite application
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

#### Vue.js Application

1. **Navigate to Vue app:**
   ```bash
   cd frontend/vue-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Access the app:** http://localhost:5173

## 🛠️ Development

### Backend Development

The backend is built with FastAPI and follows a modular architecture:

- **API Routes**: RESTful endpoints in `app/api/`
- **Data Models**: SQLAlchemy models in `app/models/`
- **Schemas**: Pydantic validation schemas in `app/schemas/`
- **Services**: Business logic in `app/services/`
- **Core**: Configuration and utilities in `app/core/`

### Frontend Development

The frontend is built with Vue.js 3, a modern, production-ready framework:

- **Vue.js 3**: Composition API, Vite, TypeScript, Pinia, Router
- **Modern Tooling**: ESLint, Prettier, Vitest, Playwright
- **Performance**: Fast rendering, small bundle size, excellent for data-heavy applications

## 📚 API Documentation

The API provides endpoints for:

- **Authentication**: User registration, login, JWT tokens
- **Users**: Profile management
- **Bio Samples**: Sample tracking and management
- **Analyses**: Analysis workflows and results

See `docs/models.md` for detailed API specifications and data models.

## 🔧 Available Scripts

### Backend
- `python main.py` - Run FastAPI server
- `uvicorn main:app --reload` - Run with auto-reload
- `pytest` - Run test suite

### Vue.js
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run test:unit` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier

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
VITE_API_URL=http://localhost:8000
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
