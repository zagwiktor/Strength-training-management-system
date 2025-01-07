# Strength Training Management System

The **Strength Training Management System** is a web application designed to support the organization and monitoring of strength training. The system enables users to create training plans, track their progress through reports, and visualize body parameters. 

This project was developed as part of an engineering thesis at **Silesian University of Technology** in the field of **Computer Science**.


## 🛠 Built With

- TypeScript
- React
- MUI: React component library
- Next.js
- NestJS
- PostgreSQL
- Postman

## Installation

### Prerequisites
Ensure you have installed:
1. **Node.js** – Download and install from [Node.js Official Site](https://nodejs.org).

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/zagwiktor/Strength-training-management-system.git
   cd Strength-training-management-system
   ```
2. **Install a package manager (e.g., pnpm, npm, or yarn):**
   - Recommended: 
    ```bash
    npm install -g pnpm
    ```
2. **Install dependencies:**

   - Navigate to the frontend folder and install dependencies: 

    ```bash
    cd frontend
    pnpm install
    ```
    - Navigate to the backend folder and install dependencies:
    ```bash
    cd ../backend
    pnpm install
    ```

## Running the Application
### Prepare the Database
1. **Create a primary database for the application in pgAdmin.**
2. **Create a test database for testing purposes.**

### Configure Environment Variables
In the backend folder, create two files:

- **.env** (for development and production configurations)
- **.env.test** (for testing configurations)

Use the following structure:
  ```bash
  POSTGRES_HOST=localhost
  POSTGRES_PORT=5432
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=<your_password>
  POSTGRES_DB=<database_name>
  ```

### Start the Application
 - **Frontend:**
    ```bash
    cd frontend
    pnpm dev
    ```
- **Backend:**
    ```bash
    cd ../backend
    pnpm start:dev
    ```
- Open your browser and navigate to:
    ```bash
    http://localhost:3001
    ```
## Running Tests

### Unit and Integration Tests
Run tests in the backend folder:
```bash
  pnpm run test
```

### End-to-End Tests
Navigate to the frontend folder and run:
```bash
  pnpm cypress open
```
Select and run desired tests from the Cypress interface.

## Application Preview

### Registration and Login
![register](https://github.com/user-attachments/assets/71cecaab-7359-465f-be4b-dbc2fc034a4a)

### Training Plan Creator
![plan_creator](https://github.com/user-attachments/assets/c4b0b8a6-1ea7-4474-91ea-e4c92630fc94)

### Main Panel with Training Plans
![Dashboard](https://github.com/user-attachments/assets/63aa18ad-4f16-4552-ba32-37d0d1f19592)

### Reports and Charts
![raports](https://github.com/user-attachments/assets/db3a0f11-bf8b-42e1-93d9-95c3cdbe0fa5)
![charts](https://github.com/user-attachments/assets/3b128ccb-8821-4bab-8efd-c1f9fb320559)

### Diet
![diet](https://github.com/user-attachments/assets/90b36580-3858-4bb4-b86d-23e9a69eed97)



