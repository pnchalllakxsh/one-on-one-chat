-- Chat App Database Schema
-- Run this in MySQL Workbench to set up the database

CREATE DATABASE IF NOT EXISTS chatdb;
USE chat_app;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_name VARCHAR(50) NOT NULL,
    receiver_name VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_name) REFERENCES users(name) ON DELETE CASCADE,
    FOREIGN KEY (receiver_name) REFERENCES users(name) ON DELETE CASCADE
);

-- Index for better query performance
CREATE INDEX idx_messages_participants ON messages(sender_name, receiver_name);
CREATE INDEX idx_messages_timestamp ON messages(created_at);
