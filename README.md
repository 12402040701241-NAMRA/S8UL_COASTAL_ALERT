# Coastal Threat Alert System

A comprehensive, production-ready coastal monitoring and emergency alert system built with React, TypeScript, and Supabase. This system provides real-time monitoring of coastal conditions, alert management, and emergency response coordination.

## Features

### 🌊 Real-time Dashboard
- Interactive Leaflet map with coastal monitoring stations
- Color-coded station markers showing current status
- Real-time sensor data updates every 30 seconds
- Detailed sensor readings in interactive popups

### 🚨 Alert Management
- Multi-level alert system (Info, Warning, Critical, Emergency)
- Alert creation and approval workflow
- Geographic targeting and expiration settings
- Role-based access control for alert operations

### 📊 Data Analysis
- Historical data visualization with interactive charts
- Trend analysis across multiple parameters
- Data export functionality (CSV format)
- Customizable date ranges and station selection

### 🚑 Emergency Response
- Incident management dashboard
- Task assignment and tracking
- Response team coordination
- Status updates and resolution tracking

### 🔐 Authentication & Authorization
- Supabase authentication with email/password
- Role-based access control (Admin, Operator, Responder, Subscriber)
- Secure user profiles and session management

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Maps**: React-Leaflet, OpenStreetMap
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand
- **Routing**: React Router
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Setup Supabase**:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Click "Connect to Supabase" in the top right of the Bolt interface
   - The system will automatically configure environment variables

3. **Run database migrations**:
   The migrations will be automatically applied when you connect to Supabase.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

### Environment Variables

When you connect to Supabase, these variables are automatically configured:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Database Schema

The system uses the following main tables:

- **monitoring_stations**: Coastal monitoring station locations and metadata
- **sensor_readings**: Real-time sensor data (tide, waves, wind, temperature, etc.)
- **alerts**: System alerts with severity levels and targeting
- **incidents**: Emergency incidents and response tracking
- **user_profiles**: User information with role-based access
- **incident_tasks**: Task management for emergency response

## User Roles

- **Admin**: Full system access, user management
- **Operator**: Alert creation, incident management, data analysis
- **Responder**: Incident response, task updates, data viewing
- **Subscriber**: Read-only access to public alerts and data

## Key Features Explained

### Real-time Monitoring
The system simulates real-time sensor data updates every 30 seconds, showing:
- Tide levels with tidal patterns
- Wave height measurements
- Wind speed and direction
- Water temperature
- Water quality index
- Atmospheric pressure

### Alert System
Four severity levels with different behaviors:
- **Info**: General information and advisories
- **Warning**: Potential threats requiring attention
- **Critical**: Immediate threats requiring action
- **Emergency**: Life-threatening situations requiring evacuation

### Data Visualization
Interactive charts showing:
- Tidal patterns and water levels
- Wave condition trends
- Weather data correlation
- Environmental monitoring

### Emergency Response
Comprehensive incident management:
- Incident creation and status tracking
- Team assignment and task management
- Response coordination tools
- Resolution reporting

## Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components
│   ├── Dashboard/      # Dashboard-specific components
│   ├── Alerts/         # Alert management components
│   ├── Response/       # Emergency response components
│   └── Auth/           # Authentication components
├── pages/              # Main page components
├── stores/             # Zustand state management
├── hooks/              # Custom React hooks
└── lib/                # Utilities and configurations
```

### Adding New Features

1. **Database Changes**: Create new migration files in `supabase/migrations/`
2. **Components**: Follow the existing pattern with TypeScript interfaces
3. **State Management**: Use Zustand stores for global state
4. **Styling**: Use Tailwind CSS with the established design system

### Testing

Run the application and test:
- User authentication flow
- Real-time data updates
- Alert creation and management
- Incident response workflow
- Mobile responsiveness

## Deployment

The application can be deployed to any static hosting provider:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

3. **Configure environment variables** on your hosting platform

## Contributing

1. Follow the existing code organization patterns
2. Maintain TypeScript strict mode compliance
3. Use the established design system and color palette
4. Add appropriate error handling and loading states
5. Test on multiple device sizes

## Security Considerations

- All database operations use Row Level Security (RLS)
- User authentication required for sensitive operations
- Role-based access control throughout the system
- Input validation on all forms
- Secure API endpoints with proper authorization

## Support

For technical support or feature requests, please refer to the system documentation or contact your system administrator.