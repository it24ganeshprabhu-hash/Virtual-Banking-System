# Virtual Banking System

A complete full-stack banking application built with Spring Boot (Backend) and React.js (Frontend) that provides secure online banking functionality.

## 🏦 Features

### Backend (Spring Boot)
- **Customer Management**: Registration, login, and profile management
- **Account Operations**: Deposit and withdraw money with balance tracking
- **Transaction History**: Complete passbook with timestamps
- **RESTful API**: Clean REST endpoints for all operations
- **Database Integration**: MySQL with JPA/Hibernate
- **CORS Configuration**: Enabled for frontend communication

### Frontend (React.js)
- **Modern UI**: Professional banking website design
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live balance and transaction updates
- **Interactive Components**: Modal dialogs for transactions
- **User Authentication**: Secure login/logout functionality
- **Transaction Management**: Easy deposit/withdrawal with validation

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd VirtualBankingSystem
   ```

2. **Update database configuration in `src/main/resources/application.properties`:**
   ```properties
   spring.datasource.username=your_mysql_username
   spring.datasource.password=your_mysql_password
   ```

3. **Start MySQL and create database:**
   ```sql
   CREATE DATABASE virtual_banking_system;
   ```

4. **Run the Spring Boot application:**
   ```bash
   ./mvnw spring-boot:run
   ```
   
   Or on Windows:
   ```bash
   mvnw.cmd spring-boot:run
   ```

The backend will be available at `http://localhost:8080`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd VirtualBankingSystem/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## 📋 API Endpoints

### Customer Management
```
POST /api/customers/register          - Register new customer
POST /api/customers/login             - Customer login
GET  /api/customers/{id}              - Get customer by ID
GET  /api/customers/{id}/balance      - Get customer balance
```

### Transaction Management
```
POST /api/transactions/deposit        - Deposit money
POST /api/transactions/withdraw       - Withdraw money
GET  /api/transactions/customer/{id}  - Get customer transactions
GET  /api/transactions/customer/{id}/passbook - Get complete passbook
```

## 🎨 Frontend Features

### Pages & Components
- **Login/Register**: Secure authentication with validation
- **Dashboard**: Overview with balance, quick actions, and recent transactions
- **Deposit Modal**: Easy money deposit with preset amounts
- **Withdraw Modal**: Secure withdrawal with balance validation
- **Passbook**: Complete transaction history with filtering and export options

### Design Features
- **Professional Banking Theme**: Blue and gold color scheme
- **Responsive Layout**: Mobile-first design approach
- **Interactive Elements**: Hover effects, loading states, and smooth transitions
- **Form Validation**: Real-time validation with error messages
- **Modal Dialogs**: Clean transaction interfaces

## 🗄️ Database Schema

### Customer Table
```sql
- id (Primary Key)
- username (Unique)
- password
- firstName, lastName
- email (Unique)
- phoneNumber
- balance (BigDecimal)
```

### Transaction Table
```sql
- id (Primary Key)
- type (DEPOSIT/WITHDRAWAL)
- amount (BigDecimal)
- balanceAfterTransaction (BigDecimal)
- description
- timestamp (LocalDateTime)
- customer_id (Foreign Key)
```

## 🔧 Configuration

### Backend Configuration
- **Database**: MySQL with auto-table creation
- **CORS**: Enabled for all origins during development
- **JPA**: Hibernate with MySQL8 dialect
- **Logging**: Debug level enabled for development

### Frontend Configuration
- **Proxy**: Configured to forward API calls to backend
- **Routing**: React Router for navigation
- **State Management**: Context API for user state
- **HTTP Client**: Axios for API communication

## 🧪 Testing the Application

1. **Start both backend and frontend servers**
2. **Open browser to `http://localhost:3000`**
3. **Register a new account or use existing credentials**
4. **Test features:**
   - Register new customer
   - Login with credentials
   - View dashboard and balance
   - Make deposits and withdrawals
   - View transaction history
   - Export passbook data

## 📱 Mobile Responsiveness

The application is fully responsive and includes:
- Mobile-optimized navigation
- Touch-friendly buttons and forms
- Responsive grid layouts
- Optimized modal dialogs for mobile
- Adaptive typography and spacing

## 🔒 Security Notes

- **Development Only**: This is a demo application without production security
- **No Password Encryption**: Passwords are stored in plain text (for demo purposes)
- **CORS Enabled**: All origins allowed (configure for production)
- **No Authentication Tokens**: Simple session-based auth (implement JWT for production)

## 🛠️ Development

### Adding New Features
1. **Backend**: Add endpoints in controllers, implement business logic in services
2. **Frontend**: Create new components, add routes in App.jsx
3. **Styling**: Use existing CSS classes or add new ones in App.css

### Code Structure
```
Backend:
├── controller/     # REST endpoints
├── service/        # Business logic
├── repository/     # Data access
├── model/          # JPA entities
└── config/         # Configuration

Frontend:
├── components/     # React components
├── services/       # API communication
└── src/           # Main application files
```

## 📄 License

This project is for educational and demonstration purposes only.

## 🤝 Contributing

This is a demo project. For production use, consider adding:
- Password encryption (BCrypt)
- JWT authentication
- Input sanitization
- Rate limiting
- SSL/HTTPS
- Comprehensive error handling
- Unit and integration tests
- Production database configuration
- Security headers and CORS policies

---

**Happy Banking! 🏦**



