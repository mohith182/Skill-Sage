# SkillSage - AI-Powered Career Mentor

## Overview

SkillSage is a full-stack web application that serves as an AI-powered career mentor and learning navigator. It provides personalized guidance, interview simulation, and progress tracking for students through an intelligent chatbot, course recommendations, and comprehensive dashboard system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React.js with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI components with shadcn/ui design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **API Design**: RESTful API endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL
- **AI Integration**: Google Gemini API for conversational AI and analysis

### Authentication System
- **Provider**: Firebase Authentication
- **Method**: Google OAuth with redirect flow
- **Session Management**: Firebase auth state management
- **User Creation**: Automatic user creation in database upon first login

## Key Components

### AI Mentor System
- **Chat Interface**: Real-time conversational AI powered by Google Gemini
- **Context Awareness**: Maintains user context for personalized responses
- **Career Guidance**: Provides actionable career advice and suggestions
- **Message Storage**: Persistent chat history with database storage

### Interview Simulator
- **Question Generation**: AI-generated interview questions by type (technical, behavioral, case study)
- **Real-time Feedback**: Gemini-powered analysis of interview responses
- **Performance Scoring**: Automated scoring with detailed feedback
- **Session Tracking**: Historical interview session storage

### Course Recommendation Engine
- **AI-Powered Suggestions**: Gemini-based course recommendations
- **User Interest Matching**: Personalized course filtering
- **Progress Tracking**: Individual course progress monitoring
- **Enrollment Management**: User-course relationship tracking

### Skills Progress Dashboard
- **Visual Progress Tracking**: Interactive progress bars and charts
- **Skill Categorization**: Organized skill development tracking
- **Achievement System**: Credit and certification tracking
- **Career Metrics**: Internship hours and career milestone tracking

### User Management
- **Profile System**: Comprehensive user profiles with skills and preferences
- **Role-Based Access**: Support for student, mentor, and admin roles
- **Activity Logging**: User action and achievement tracking
- **Data Privacy**: Secure user data handling with Firebase integration

## Data Flow

### Authentication Flow
1. User initiates Google OAuth through Firebase
2. Firebase handles authentication and returns user object
3. Backend checks for existing user in database
4. If new user, creates database record with Firebase user data
5. Client maintains auth state through Firebase SDK

### AI Interaction Flow
1. User submits message through chat interface
2. Frontend sends request to backend chat endpoint
3. Backend processes message with user context
4. Gemini API generates contextual response
5. Response stored in database and returned to client
6. Frontend updates chat interface with new messages

### Course Recommendation Flow
1. System analyzes user skills and interests
2. Gemini API generates personalized course suggestions
3. Recommendations filtered and ranked by relevance
4. Frontend displays courses with enrollment options
5. User interactions tracked for future recommendations

### Interview Simulation Flow
1. User selects interview type (technical/behavioral/case study)
2. Backend generates appropriate question using Gemini
3. User provides response through interface
4. Gemini analyzes response for feedback and scoring
5. Results stored in interview session record
6. Feedback displayed with improvement suggestions

## External Dependencies

### AI Services
- **Google Gemini API**: Primary AI service for chat, analysis, and content generation
- **Model**: Gemini 2.5 Flash for optimal performance and cost efficiency

### Authentication & Database
- **Firebase Auth**: Google OAuth authentication
- **Neon Database**: PostgreSQL hosting for production
- **Drizzle ORM**: Type-safe database operations

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form validation and handling

### Development Tools
- **Vite**: Fast development build tool
- **TypeScript**: Type safety across the stack
- **ESBuild**: Production bundling for backend

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Drizzle migrations with push command
- **AI**: Direct Gemini API integration

### Production Build
- **Frontend**: Vite production build to static assets
- **Backend**: ESBuild bundle for Node.js deployment
- **Database**: PostgreSQL with connection pooling
- **Environment**: Environment variables for API keys and database URLs

### Key Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Google Gemini API authentication
- `VITE_FIREBASE_*`: Firebase configuration variables
- `NODE_ENV`: Environment mode (development/production)

### Database Schema
- **Users**: Core user profiles with skills and progress
- **Courses**: Course catalog with metadata and difficulty levels
- **Chat Messages**: Persistent conversation history
- **Skill Progress**: Individual skill development tracking
- **Activities**: User action and achievement logging
- **Interview Sessions**: Mock interview results and feedback

The application follows a monolithic architecture with clear separation between client and server, utilizing modern web technologies for a responsive and intelligent career guidance platform.