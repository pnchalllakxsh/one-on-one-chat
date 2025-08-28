const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'chatdb',
  port: 3306
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

// Database operations
const db = {
  // Add user to database
  async addUser(name) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (name) VALUES (?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
        [name]
      );
      return { success: true, userId: result.insertId };
    } catch (error) {
      console.error('Error adding user:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all users
  async getUsers() {
    try {
      const [rows] = await pool.execute('SELECT * FROM users ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  // Save message to database
  async saveMessage(senderName, receiverName, message) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO messages (sender_name, receiver_name, message) VALUES (?, ?, ?)',
        [senderName, receiverName, message]
      );
      return { success: true, messageId: result.insertId };
    } catch (error) {
      console.error('Error saving message:', error);
      return { success: false, error: error.message };
    }
  },

  // Get chat history between two users
  async getChatHistory(user1, user2) {
    try {
      const [rows] = await pool.execute(`
        SELECT * FROM messages 
        WHERE (sender_name = ? AND receiver_name = ?) 
           OR (sender_name = ? AND receiver_name = ?)
        ORDER BY created_at ASC
      `, [user1, user2, user2, user1]);
      return rows;
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }
};

module.exports = { db, testConnection };
