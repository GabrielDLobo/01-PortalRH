# PortalRH Frontend

Modern React TypeScript frontend for PortalRH - Human Resources Management System.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Employee Management**: Complete CRUD operations for employee data
- **Leave Management**: Request, approve, and track employee leave requests
- **Performance Evaluations**: Create and manage employee performance reviews
- **Dashboard Analytics**: Visual insights with charts and KPIs
- **Profile Management**: User profile editing and password management

### UI/UX Features
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Bilingual Support**: Portuguese and English with easy language switching
- **Modern Interface**: Clean, professional design using TailwindCSS
- **Loading States**: Skeleton screens and loading spinners for better UX
- **Toast Notifications**: Real-time feedback for user actions
- **Data Tables**: Sortable, filterable tables with pagination
- **Form Validation**: Client-side validation with user-friendly error messages

## 🛠️ Technology Stack

### Core Technologies
- **React 19** - Frontend framework
- **TypeScript** - Type-safe JavaScript
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework

### UI Components & Libraries
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - Beautiful hand-crafted SVG icons
- **React Hook Form** - Performant forms with easy validation
- **Yup** - Schema validation
- **React Hot Toast** - Toast notifications

### Data & Visualization
- **Axios** - HTTP client for API calls
- **Chart.js** - Charts and data visualization
- **React Chart.js 2** - React wrapper for Chart.js
- **Date-fns** - Date utility library

## 🚀 Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn
- Running Django backend (see backend README)

### Installation

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   NODE_ENV=development
   REACT_APP_APP_NAME=PortalRH
   REACT_APP_VERSION=1.0.0
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`.

## 📱 Available Scripts

- **`npm start`** - Starts the development server
- **`npm run build`** - Builds the app for production
- **`npm test`** - Launches the test runner
- **`npm run lint`** - Runs ESLint to check code quality
- **`npm run lint:fix`** - Fixes ESLint issues automatically
- **`npm run type-check`** - Runs TypeScript type checking

## 🎨 Design System

### Colors
- **Primary**: Blue tones (#2563eb) - Main brand color
- **Secondary**: Green tones (#16a34a) - Success states
- **Neutral**: Gray tones (#64748b) - Text and backgrounds
- **Success**: Green (#22c55e) - Success states
- **Warning**: Amber (#f59e0b) - Warning states
- **Error**: Red (#ef4444) - Error states

### Typography
- **Font Family**: Inter - Modern, readable sans-serif font
- **Font Weights**: 300, 400, 500, 600, 700

## 🌐 Internationalization

The app supports bilingual functionality (Portuguese/English):

- **Translation files**: Located in `src/locales/`
- **Language switching**: Header language toggle
- **Persistent preference**: Language preference saved to localStorage

### Adding New Translations

1. Add new keys to `src/locales/en.json` and `src/locales/pt.json`
2. Use the `useLanguage` hook: `const { t } = useLanguage()`
3. Access translations: `t('common.save')`

## 🔐 Authentication & Authorization

### Authentication Flow
1. User logs in with email/password
2. JWT token received and stored in localStorage
3. Token included in all API requests
4. Automatic logout on token expiration

### Role-Based Access Control
- **Admin**: Full access to all features
- **Manager**: Access to employee management and team data
- **Employee**: Access to personal data and leave requests

## 📊 State Management

The application uses React Context API for state management:

- **AuthContext**: User authentication state
- **LanguageContext**: Language preference and translation functions

## 🔌 API Integration

### API Service Layer
- **Base service**: `src/services/api.ts` - Axios configuration and interceptors
- **Auth service**: `src/services/authService.ts` - Authentication endpoints
- **Employee service**: `src/services/employeeService.ts` - Employee management
- **Leave service**: `src/services/leaveService.ts` - Leave management
- **Evaluation service**: `src/services/evaluationService.ts` - Performance evaluations

### Error Handling
- Automatic error toast notifications
- 401 handling with automatic logout
- Network error handling
- Request timeout handling

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```

This creates an optimized build in the `build/` folder.

### Environment Configuration
- **Development**: Uses `.env` file
- **Production**: Set environment variables in hosting platform

---

Built with ❤️ using React, TypeScript, and TailwindCSS.
