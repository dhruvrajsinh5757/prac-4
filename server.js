const http = require('http');
const fs = require('fs');
const url = require('url');
const { parse } = require('querystring');

// File path for the user data
const filePath = './users.json';

// Helper function to read the file
const readUsersFromFile = () => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper function to write to the file
const writeUsersToFile = (users) => {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');
};

// Create the HTTP server
const server = http.createServer((req, res) => {
  const { method, url: reqUrl } = req;
  const parsedUrl = url.parse(reqUrl, true);
  const path = parsedUrl.pathname;
  const id = parsedUrl.pathname.split('/')[2]; // Get the user ID from URL path

  // Set the response header
  res.setHeader('Content-Type', 'application/json');

  if (method === 'GET' && path === '/users') {
    // GET /users: Return a list of all users
    const users = readUsersFromFile();
    res.statusCode = 200;
    res.end(JSON.stringify(users));
  } else if (method === 'POST' && path === '/users') {
    // POST /users: Accept new user data and add it to the file
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const newUser = JSON.parse(body);
      const users = readUsersFromFile();

      // Assign a new ID (based on the highest existing ID + 1)
      const newId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
      const userWithId = { id: newId, ...newUser };

      users.push(userWithId);
      writeUsersToFile(users);

      res.statusCode = 201;
      res.end(JSON.stringify(userWithId));
    });
  } else if (method === 'DELETE' && path.startsWith('/users/') && id) {
    // DELETE /users/:id: Remove a user by their ID
    const users = readUsersFromFile();
    const userIndex = users.findIndex(user => user.id === parseInt(id));

    if (userIndex === -1) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: 'User not found' }));
    } else {
      const deletedUser = users.splice(userIndex, 1);
      writeUsersToFile(users);

      res.statusCode = 200;
      res.end(JSON.stringify({ message: 'User deleted', user: deletedUser[0] }));
    }
  } else {
    // 404 - Endpoint not found
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Not Found' }));
  }
});

// Server listens on port 3000
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
