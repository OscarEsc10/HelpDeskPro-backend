# HelpDeskPro Backend

A robust backend system for managing support tickets, built with Node.js, Express, and PostgreSQL.

## Features

- **User Authentication**
  - JWT-based authentication
  - Role-based access control (Client/Agent)
  - Secure password hashing with bcrypt

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
