# n8n Workflow UI Integration

## Recent Changes

**November 19, 2025:**
- Created login page for "Islamisches Sozialdienst- und Informationszentrum" attendance system
- Implemented minimalist design with centered card layout on gray background
- Added colorful SVG logo (multi-colored knot pattern)
- Built responsive password-protected login interface
- Integrated n8n webhook for authentication via backend proxy
- Added day selection screen (Samstag/Sonntag) with calendar emoji buttons
- Implemented class selection screen with different classes for Saturday/Sunday
- Created attendance list page with student management
- Implemented attendance tracking with 4 states: Present (✓), Late (⏰), Absent (✗), Delete (🗑️)
- Added real-time statistics counter (Anwesend/Zu spät/Abwesend)
- Created "Add new student" feature with first name/last name input
- Student list loaded from n8n JSON response (students array)
- Complete workflow: Login → Day selection → Class selection → Attendance list
- Express backend configured to run on port 5000 for Replit environment compatibility

## Overview

This is a digital attendance list application for the Islamisches Sozialdienst- und Informationszentrum e.V. (Islamic Social Service and Information Center). The application provides a password-protected interface for tracking student attendance in educational classes.

The application currently provides:
1. A login page with password authentication
2. Day selection (Saturday/Sunday) after successful login
3. Class selection with different class options based on selected day
4. Attendance list page with:
   - Student list loaded from n8n JSON response
   - Four-button attendance tracking per student (Present/Late/Absent/Delete)
   - Real-time statistics display
   - Add new student functionality
   - Current date and class information display
5. Responsive design for desktop and mobile devices
6. Back navigation between all steps

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express.js v5.1.0
- **Language:** JavaScript (CommonJS modules)
- **Port:** 5000

**Architectural Pattern:**
- Simple proxy server pattern
- Stateless request/response model
- No persistence layer (purely transactional)

**Key Design Decisions:**

1. **Proxy-Based Architecture**
   - **Problem:** Need to interact with n8n webhooks from a browser while avoiding CORS issues
   - **Solution:** Express backend acts as a proxy, forwarding requests to n8n webhook URLs
   - **Rationale:** Keeps the frontend simple and handles cross-origin restrictions server-side
   - **Pros:** Simple implementation, no CORS complexity in frontend
   - **Cons:** Adds network hop, single point of failure

2. **Query Parameter-Based URL Passing**
   - **Problem:** Need to support dynamic webhook URLs without hardcoding
   - **Solution:** Accept webhook/resume URLs as query parameters
   - **Rationale:** Provides flexibility for multiple workflows without configuration changes
   - **Pros:** Dynamic, no restart required for new workflows
   - **Cons:** URLs exposed in query strings (though this is server-to-server)

3. **Body Passthrough Pattern**
   - **Problem:** Need to forward arbitrary JSON payloads to n8n
   - **Solution:** Accept any JSON body and forward it unchanged to webhook endpoints
   - **Rationale:** Maximum flexibility for different workflow requirements
   - **Pros:** Works with any n8n workflow design
   - **Cons:** No validation or schema enforcement

### Frontend Architecture

**Technology Stack:**
- Pure HTML/CSS/JavaScript (no framework)
- Static file serving via Express

**Design Pattern:**
- Single-page application (SPA) approach
- Event-driven interactions
- Direct API calls to backend proxy endpoints

**Key Design Decisions:**

1. **Framework-Free Implementation**
   - **Problem:** Need interactive UI for workflow triggering
   - **Solution:** Vanilla JavaScript without frameworks
   - **Rationale:** Minimizes dependencies and complexity for a simple use case
   - **Pros:** Fast load times, no build step, easy to understand
   - **Cons:** More verbose code for complex interactions

2. **Gradient-Based Modern UI**
   - Uses CSS gradients and modern styling
   - Mobile-responsive design
   - Focus on visual clarity and user experience

### API Design

**Endpoint 1: `/api/trigger-workflow`**
- **Method:** POST
- **Purpose:** Initiates an n8n workflow via webhook
- **Parameters:** 
  - Query: `webhookUrl` (required) - The n8n webhook URL to trigger
  - Body: Any JSON payload to pass to n8n
- **Response:** Proxied JSON response from n8n (typically includes `resumeUrl`)

**Endpoint 2: `/api/resume-workflow`**
- **Method:** POST  
- **Purpose:** Resumes a paused n8n workflow at a wait node
- **Parameters:**
  - Query: `resumeUrl` (required) - The n8n resume URL from wait node
  - Body: Raw request stream forwarded to n8n
- **Response:** Proxied JSON response from n8n
- **Special Handling:** Streams request body with duplex mode for efficient data transfer

### Error Handling Strategy

1. **Validation Errors:** Returns 400 status with descriptive error messages for missing parameters
2. **Network Errors:** Catches fetch failures and returns 500 status with error details
3. **Console Logging:** Errors logged to console for debugging

## External Dependencies

### Third-Party Packages

1. **express (v5.1.0)**
   - Purpose: Web server framework
   - Used for: HTTP server, routing, static file serving, JSON parsing middleware
   - Why chosen: Industry standard, well-documented, extensive middleware ecosystem

2. **@types/node (v22.13.11)**
   - Purpose: TypeScript type definitions for Node.js
   - Used for: IDE autocomplete and development tooling support
   - Note: Included despite no TypeScript code (likely for editor support)

### External Services

1. **n8n Workflow Automation Platform**
   - Purpose: Backend workflow execution engine
   - Integration Method: Webhook-based HTTP API
   - Endpoints Used:
     - Webhook trigger URLs (for initiating workflows)
     - Wait node resume URLs (for continuing paused workflows)
   - Expected Response Format: JSON with `resumeUrl` field for multi-step workflows
   - Authentication: Handled by URL-based security in n8n (webhook URLs contain unique tokens)

### Node.js Built-in APIs

1. **fetch API**
   - Used for making HTTP requests to n8n webhooks
   - Available natively in Node.js (no external package needed in modern versions)
   - Supports duplex streaming for efficient request forwarding

### Static Assets

- Served from `public/` directory
- Includes `index.html` (frontend UI)
- No build process or bundling required