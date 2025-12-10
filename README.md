# HelpDeskPro Backend

A robust backend system for managing support tickets, built with Node.js, Express, and PostgreSQL.

## Features

- **User Authentication**
  - JWT-based authentication
  - Role-based access control (Client/Agent)
  - Secure password hashing with bcrypt
  - Session management with token expiration

- **Ticket Management**
  - Create, view, update, and delete tickets
  - Assign tickets to agents
  - Add comments to tickets
  - Filter and search tickets
  - Ticket status and priority tracking

- **Dashboard & Analytics**
  - Agent dashboard with ticket statistics
  - Recent tickets overview
  - Assigned tickets tracking

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/HelpDeskPro-backend.git
   cd HelpDeskPro-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://username:password@localhost:5432/helpdeskpro
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   ```

4. Run database migrations:
   ```bash
   # Create database tables
   psql -U postgres -c "CREATE DATABASE helpdeskpro;"
   
   # Run migrations (if you have any)
   # npm run migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "client"
  }
}
```

#### Create User (Admin Only)

```http
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "securePassword123",
  "role": "agent"
}
```

### Tickets

#### Create Ticket

```http
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Website not loading",
  "description": "I can't access the website, getting a 500 error.",
  "priority": "high"
}
```

#### Get All Tickets

```http
GET /api/tickets
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status (open, in_progress, resolved, closed)
- `priority`: Filter by priority (low, medium, high)
- `assignedTo`: Filter by assigned agent ID
- `createdBy`: Filter by ticket creator ID (admin/agent only)

#### Get Single Ticket

```http
GET /api/tickets/1
Authorization: Bearer <token>
```

#### Update Ticket

```http
PUT /api/tickets/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress",
  "priority": "high"
}
```

#### Add Comment

```http
POST /api/tickets/1/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I'm looking into this issue."
}
```

### Agent Endpoints

#### Assign Ticket

```http
POST /api/tickets/1/assign
Authorization: Bearer <agent_token>
Content-Type: application/json

{
  "agentId": 2
}
```

#### Get Ticket Statistics

```http
GET /api/tickets/stats/summary
Authorization: Bearer <agent_token>
```

#### Agent Dashboard

```http
GET /api/tickets/agent/dashboard
Authorization: Bearer <agent_token>
```

## Testing with cURL

Here are some example cURL commands to test the API:

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Create Ticket
```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"Test Ticket","description":"This is a test ticket","priority":"medium"}'
```

### Get All Tickets
```bash
curl -X GET http://localhost:3000/api/tickets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port to run the server on | 3000 |
| NODE_ENV | Node environment | development |
| DATABASE_URL | PostgreSQL connection URL | - |
| JWT_SECRET | Secret key for JWT | - |
| JWT_EXPIRES_IN | JWT expiration time | 7d |

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

- **Ticket Management**
  - Create, read, update tickets
  - Filter and sort tickets
  - Assign tickets to agents
  - Track ticket status (Open, In Progress, Resolved, Closed)

- **Comments & Communication**
  - Threaded comments on tickets
  - Real-time updates (WebSocket ready)
  - Email notifications

- **API Endpoints**
  - RESTful API design
  - Comprehensive error handling
  - Input validation

## Prerequisites

- Node.js (v16+)
- PostgreSQL (v14+)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/helpdeskpro-backend.git](https://github.com/yourusername/helpdeskpro-backend.git)
   cd helpdeskpro-backend

2. **Install dependencies**
   ```bash
   npm install

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file and add your database connection string and other environment variables

4. **Start the server**
   ```bash
   npm run dev

## API Documentation

- [Postman Collection](https://documenter.getpostman.com/view/12345678/HelpDeskPro/UVzKJLQW)

## License

MIT License

## Author

Oscar Escorcia
