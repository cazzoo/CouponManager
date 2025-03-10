/**
 * Mock Users for Development Environment
 * 
 * This file contains pre-defined mock users for development and testing purposes.
 * These users are used when the application is running in memory-database mode.
 */

export const mockUsers = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    email: "user@example.com",
    password: "password123", // In a real app, never store plain text passwords
    role: "user",
    name: "Test User",
    created_at: new Date(2023, 0, 15).toISOString()
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    email: "manager@example.com",
    password: "password123",
    role: "manager",
    name: "Test Manager",
    created_at: new Date(2023, 0, 10).toISOString()
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    name: "Test Admin",
    created_at: new Date(2023, 0, 5).toISOString()
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    email: "demo@example.com",
    password: "demo", // Simple password for demo account
    role: "demo_user", // Demo user with limited permissions
    name: "Demo Account",
    created_at: new Date(2023, 1, 20).toISOString()
  }
];

export default mockUsers; 