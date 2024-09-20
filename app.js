// Import required modules 
const express = require('express'); 
const app = express(); 
 
// Middleware to parse incoming JSON requests 
app.use(express.json()); 
 
// Dummy data to simulate a database 
let chatLogs = []; 

const MAX_CHAT_HISTORY_SIZE = 10000;

// Function to detect SQL keywords
const containsSQLInjection = (chat_history) => {
    const sqlKeywords = ["DROP", "DELETE", "INSERT", "UPDATE", "ALTER", "TABLE"]; // Add any other SQL keywords you want to catch

    return chat_history.some(message => {
        // Check if any message contains an SQL keyword (case-insensitive)
        return sqlKeywords.some(keyword => message.toUpperCase().includes(keyword));
    });
};
 
app.all('/log-chat', (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(405).json({
            status: 'error',
            message: 'Method Not Allowed'
        });
    }
    next();
});

// POST /log-chat endpoint (vulnerable version) 
app.post('/log-chat', (req, res) => { 
    const { user_id, chat_history } = req.body; 


    if (chat_history==null && user_id==null) { 
        return res.status(400).json({ 
            status: 'error', 
            message: 'Invalid input. user_id must be a string and chat_history must be an array.'
        }); 
    }

    // Check if user_id is missing or null
    if (user_id == null) { 
        return res.status(400).json({ 
            status: 'error', 
            message: 'Invalid input. user_id must be a string.'
        }); 
    }

    if (user_id.trim() === '') {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Invalid input. user_id must not be an empty string.'
        }); 
    }


    // Check if chat_history  null
    if (!chat_history) { 
        return res.status(400).json({ 
            status: 'error', 
            message: 'Invalid input. chat_history must be an array.'
        }); 
    }
    
    if (!Array.isArray(chat_history)) { 
        return res.status(400).json({ 
            status: 'error', 
            message: 'Invalid input. chat_history must be an array.'
        }); 
    }
    
    if (chat_history.length===0) { 
        return res.status(400).json({ 
            status: 'error', 
            message: 'Invalid input. chat_history must not be empty.'
        }); 
    }

    if (chat_history.length > MAX_CHAT_HISTORY_SIZE) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid input. chat_history exceeds size limit.'
        });
    }

    // Check for SQL injection attempt
    if (containsSQLInjection(chat_history)) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid input.'
        });
    }
    
    const logEntry = { 
        user_id, 
        chat_history, 
        timestamp: new Date().toISOString(), // Timestamp format might be incorrect for certain clients 
    }; 
     
    chatLogs.push(logEntry); 
     
    res.json({ 
        status: 'success', 
        message: 'Chat logged successfully.', 
        logEntry, // Vulnerability: returning internal data directly 
    }); 
}); 

export default app