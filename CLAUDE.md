# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **中道商城 H5** (Zhongdao Mall H5) - the mobile frontend application for the multi-level supply chain social e-commerce platform. It's a React-based progressive web app (PWA) designed for mobile users with features like:

- **Multi-level user hierarchy display**: Normal users → VIP → 1-5 star agents → Directors
- **Mobile-first shopping experience**: Product browsing, cart management, and ordering
- **User center with level management**: Display user levels, points, commissions, and team stats
- **Responsive design**: Optimized for various mobile screen sizes
- **Authentication flow**: Phone-based login and WeChat integration

## Key Development Commands

### Development
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Quality
```bash
# Run TypeScript type checking
npx tsc --noEmit

# Format code with Prettier (if configured)
npx prettier --write src/**/*.{ts,tsx}
```

## Architecture Overview

### Technology Stack
- **Frontend Framework**: React 18 with TypeScript
- **State Management**: Zustand (lightweight state management)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **UI Components**: Custom components following design system

### Project Structure
```
src/
├── api/                # API layer and HTTP client configuration
│   ├── auth.ts         # Authentication APIs
│   ├── client.ts       # Axios client setup
│   └── index.ts        # API exports
├── components/         # Reusable React components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── MainApp.tsx     # Main application component with navigation
│   └── MainApp.simple.tsx # Simplified version for testing
├── pages/              # Page components
│   ├── Login/          # Login flow pages
│   │   ├── index.tsx
│   │   ├── LoginPage.tsx
│   │   ├── LoginSuccessPage.tsx
│   │   └── PhoneInputPage.tsx
│   ├── Home/           # Home page
│   ├── Shop/           # Shop/product pages
│   ├── Profile/        # User profile
│   ├── Cart/           # Shopping cart
│   ├── Checkout/       # Checkout process
│   ├── Order/          # Order management
│   └── ProductDetail/  # Product detail page
├── styles/             # Global styles (if any)
└── main.tsx           # Application entry point
```

### Application Flow
1. **Authentication**: Users enter through login flow (`/login`, `/phone-input`, `/login-success`)
2. **Protected Routes**: After login, users access the main app via `ProtectedRoute`
3. **Main App**: Single-page application with tab-based navigation (Home, Shop, Profile)
4. **State Management**: Uses localStorage for auth persistence, mock data for development

### Key Components

#### MainApp.tsx
- **Purpose**: Core application container with bottom navigation
- **Features**:
  - Tab navigation between Home, Shop, and Profile
  - Mock user data and product data for development
  - Responsive mobile layout
  - User authentication state management

#### Authentication Flow
- **LoginPage.tsx**: Main login interface
- **PhoneInputPage.tsx**: Phone number input and verification
- **LoginSuccessPage.tsx**: Post-login success handling
- **ProtectedRoute**: Route guard for authenticated pages

#### Design System
Based on the comprehensive README.md, the project includes:
- **Color Palette**: Primary red (#DC2626), secondary colors, level-based colors
- **Typography**: Mobile-first font system (12px-36px)
- **Spacing**: 8-point grid system
- **Components**: Cards, buttons, tags with specific styling patterns
- **Animations**: Smooth transitions and micro-interactions

## Important Development Notes

### Design System Compliance
- **Follow the design specifications** in README.md strictly
- **Use CSS custom properties** for colors, spacing, and typography
- **Maintain brand consistency** across all components
- **Mobile-first approach**: Design for mobile screens first

### State Management
- **Authentication**: Stored in localStorage under `auth-storage` key
- **User Data**: Mock data in development, API integration in production
- **Navigation**: React Router with protected routes
- **Global State**: Currently minimal, consider expanding with Zustand

### API Integration
- **Base URL**: Configured in Vite proxy to `http://localhost:3000`
- **API Routes**: All backend routes prefixed with `/api`
- **Authentication**: JWT-based (to be implemented)
- **Error Handling**: Centralized error handling in API client

### Development Workflow
1. **Component Development**: Create components following the design system
2. **Mock Data**: Use mock data for UI development and testing
3. **API Integration**: Connect to backend APIs when ready
4. **Testing**: Test on various mobile devices and screen sizes
5. **Build Optimization**: Ensure fast loading and smooth performance

### Business Context
This H5 app serves the multi-level marketing platform:
- **User Levels**: Display progression from normal to director level
- **Points System**: Show user points and transaction history
- **Team Management**: Display team structure and commission
- **Product Catalog**: E-commerce functionality with special pricing
- **Order Management**: Shopping cart and checkout process

### Code Style Guidelines
- **TypeScript**: Use strict typing for all components and functions
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Component Structure**: Follow the established file organization
- **Naming**: Use descriptive names for components and functions
- **Error Boundaries**: Implement proper error handling for robust UX

### Performance Considerations
- **Bundle Size**: Optimize imports and use lazy loading where appropriate
- **Images**: Implement lazy loading for product images
- **Animations**: Use CSS transforms for smooth 60fps animations
- **Network**: Implement proper loading states and error handling
- **Caching**: Cache API responses and static assets appropriately

## Testing Strategy
- **Component Testing**: Test individual components with React Testing Library
- **Integration Testing**: Test user flows and API integrations
- **Visual Testing**: Ensure design consistency across different devices
- **Performance Testing**: Monitor bundle size and loading performance

When working on this codebase, always prioritize the mobile user experience and follow the comprehensive design system outlined in the README.md file. The app should feel native-like on mobile devices with smooth animations and intuitive navigation.