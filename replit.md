# SarkarConnect - Government Scheme Discovery Platform

## Overview

SarkarConnect is an AI-powered citizen portal that helps users discover and apply for government schemes based on their socio-economic profiles. The platform provides personalized recommendations, real-time chat assistance in multiple Indian languages, and streamlined application tracking. Built with modern web technologies, it features a React frontend with TypeScript, Express.js backend, PostgreSQL database with Drizzle ORM, and comprehensive UI components using shadcn/ui and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Real-time Communication**: WebSocket integration for live updates
- **Accessibility**: Built-in support through Radix UI components

### Backend Architecture
- **Runtime**: Node.js with TypeScript using ESM modules
- **Framework**: Express.js for REST API endpoints
- **WebSocket Support**: Native WebSocket server for real-time features
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Design**: RESTful endpoints with structured error handling
- **Middleware**: Custom logging and error handling middleware
- **Development Server**: Integrated Vite middleware for hot reloading

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema definition
- **Data Models**: Comprehensive citizen profiles, government schemes, applications, chat conversations, recommendations, and grievances
- **Validation**: Zod schemas for type-safe data validation
- **Session Storage**: Connect-pg-simple for PostgreSQL-backed sessions

### Authentication and Authorization
- **User Management**: Custom user system with username/email authentication
- **Profile System**: Detailed citizen profiles with socio-economic data
- **Session Handling**: PostgreSQL-backed session management
- **Data Privacy**: Structured approach to sensitive information like Aadhaar numbers

### Key Features Architecture
- **AI-Powered Recommendations**: OpenAI GPT integration for personalized scheme suggestions
- **Multi-language Support**: Chatbot supporting 12+ Indian languages
- **Eligibility Checking**: Rule-based and AI-enhanced eligibility assessment
- **Application Tracking**: Real-time status updates and timeline tracking
- **Scheme Discovery**: Advanced filtering and search capabilities
- **Real-time Chat**: WebSocket-based chatbot with voice input support

### Component Organization
- **Shared Schema**: Common TypeScript definitions across frontend and backend
- **Modular Services**: Separated business logic for OpenAI, recommendations, and schemes
- **Reusable Components**: Well-structured React components with consistent patterns
- **Custom Hooks**: Specialized hooks for WebSocket, speech recognition, and mobile detection

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Build Tools**: Vite for frontend bundling, ESBuild for backend compilation
- **Package Management**: NPM with lockfile for dependency consistency

### AI and Language Services
- **OpenAI API**: GPT models for intelligent recommendations and multilingual chat
- **Speech Recognition**: Web Speech API for voice input functionality
- **Language Support**: Multi-language interface with regional language support

### UI and Design System
- **Component Library**: Radix UI primitives for accessible components
- **Icons**: Lucide React for consistent iconography
- **Styling**: Tailwind CSS with PostCSS for processing
- **Fonts**: Google Fonts integration for typography

### Development and Monitoring
- **Development**: Replit-specific plugins for error handling and cartography
- **Type Safety**: TypeScript across the entire stack
- **Validation**: Zod for runtime type checking and form validation
- **Date Handling**: date-fns for date manipulation and formatting

### Real-time Features
- **WebSockets**: Native WebSocket implementation for live updates
- **State Synchronization**: TanStack Query for server state management
- **Voice Features**: Browser Speech API integration for accessibility