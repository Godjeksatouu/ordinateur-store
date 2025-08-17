const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store'
};

let db;

async function connectDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database');

    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function createTables() {
  try {
    // Users table for admin authentication
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('product_manager', 'gestion_commandes', 'super_admin') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        ram VARCHAR(50),
        storage VARCHAR(50),
        screen VARCHAR(100),
        graphics VARCHAR(100),
        os VARCHAR(50),
        processor VARCHAR(100),
        old_price DECIMAL(10,2),
        new_price DECIMAL(10,2) NOT NULL,
        images JSON,
        main_images JSON,
        optional_images JSON,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Ensure schema: add processor if missing, drop name_ar if exists
    try {
      const [procCol] = await db.execute("SHOW COLUMNS FROM products LIKE 'processor'");
      // @ts-ignore
      if (Array.isArray(procCol) && procCol.length === 0) {
        await db.execute('ALTER TABLE products ADD COLUMN processor VARCHAR(100)');
      }
    } catch (e) {
      console.warn('⚠️ Could not ensure processor column exists:', e.message || e);
    }

    try {
      const [nameArCol] = await db.execute("SHOW COLUMNS FROM products LIKE 'name_ar'");
      // @ts-ignore
      if (Array.isArray(nameArCol) && nameArCol.length > 0) {
        await db.execute('ALTER TABLE products DROP COLUMN name_ar');
      }
    } catch (e) {
      console.warn('⚠️ Could not drop name_ar column (may not exist):', e.message || e);
    }

    // Add main_images and optional_images columns if they don't exist
    try {
      const [mainImagesCol] = await db.execute("SHOW COLUMNS FROM products LIKE 'main_images'");
      // @ts-ignore
      if (Array.isArray(mainImagesCol) && mainImagesCol.length === 0) {
        await db.execute('ALTER TABLE products ADD COLUMN main_images JSON');
      }
    } catch (e) {
      console.warn('⚠️ Could not ensure main_images column exists:', e.message || e);
    }

    try {
      const [optionalImagesCol] = await db.execute("SHOW COLUMNS FROM products LIKE 'optional_images'");
      // @ts-ignore
      if (Array.isArray(optionalImagesCol) && optionalImagesCol.length === 0) {
        await db.execute('ALTER TABLE products ADD COLUMN optional_images JSON');
      }
    } catch (e) {
      console.warn('⚠️ Could not ensure optional_images column exists:', e.message || e);
    }

    // Drop description_ar column if it exists
    try {
      const [descriptionArCol] = await db.execute("SHOW COLUMNS FROM products LIKE 'description_ar'");
      // @ts-ignore
      if (Array.isArray(descriptionArCol) && descriptionArCol.length > 0) {
        await db.execute('ALTER TABLE products DROP COLUMN description_ar');
        console.log('✅ Dropped description_ar column');
      }
    } catch (e) {
      console.warn('⚠️ Could not drop description_ar column (may not exist):', e.message || e);
    }
    // Ensure promo fields exist on products
    try {
      const [promoCodeCol] = await db.execute("SHOW COLUMNS FROM products LIKE 'promo_code'");
      // @ts-ignore
      if (Array.isArray(promoCodeCol) && promoCodeCol.length === 0) {
        await db.execute("ALTER TABLE products ADD COLUMN promo_code VARCHAR(100)");
      }
    } catch (e) {
      console.warn('⚠️ Could not ensure products.promo_code column exists:', e.message || e);
    }
    try {
      const [promoTypeCol] = await db.execute("SHOW COLUMNS FROM products LIKE 'promo_type'");
      // @ts-ignore
      if (Array.isArray(promoTypeCol) && promoTypeCol.length === 0) {
        await db.execute("ALTER TABLE products ADD COLUMN promo_type ENUM('percentage','fixed')");
      }
    } catch (e) {
      console.warn('⚠️ Could not ensure products.promo_type column exists:', e.message || e);
    }


    // Clients table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        city VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Ensure email column exists in clients
    try {
      const [emailCol] = await db.execute("SHOW COLUMNS FROM clients LIKE 'email'");
      // @ts-ignore
      if (Array.isArray(emailCol) && emailCol.length === 0) {
        await db.execute('ALTER TABLE clients ADD COLUMN email VARCHAR(255)');
      }
    } catch (e) {
      console.warn('⚠️ Could not ensure clients.email column exists:', e.message || e);
    }


    // Orders table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        status ENUM('en_attente', 'confirme', 'declined', 'en_cours', 'livre', 'retour') DEFAULT 'en_attente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);
    // Ensure extra fields on orders
    try {
      const [codePromoCol] = await db.execute("SHOW COLUMNS FROM orders LIKE 'code_promo'");
      // @ts-ignore
      if (Array.isArray(codePromoCol) && codePromoCol.length === 0) {
        await db.execute('ALTER TABLE orders ADD COLUMN code_promo VARCHAR(100)');
      }
    } catch (e) {
      console.warn('⚠️ Could not ensure orders.code_promo column exists:', e.message || e);
    }
    try {
      const [paymentMethodCol] = await db.execute("SHOW COLUMNS FROM orders LIKE 'payment_method'");
      // @ts-ignore
      if (Array.isArray(paymentMethodCol) && paymentMethodCol.length === 0) {
        await db.execute('ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50)');
      }
    } catch (e) {
      console.warn('⚠️ Could not ensure orders.payment_method column exists:', e.message || e);
    }

    // Categories table (called "categorie" per requirements)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categorie (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);


    // Seed default role-based accounts if not exist (using username as email)
    const defaultUsers = [
      { email: 'products@example.com', password: 'products123', role: 'product_manager' },
      { email: 'orders@example.com', password: 'orders123', role: 'gestion_commandes' },
      { email: 'admin@example.com', password: 'admin123', role: 'super_admin' },
    ];

    for (const u of defaultUsers) {
      const [rows] = await db.execute('SELECT id FROM users WHERE username = ?', [u.email]);
      if (rows.length === 0) {
        const hashed = await bcrypt.hash(u.password, 10);
        await db.execute(
          'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
          [u.email, hashed, u.role]
        );
        console.log(`✅ Seeded user: ${u.email} (${u.role})`);
      }
    }

    console.log('✅ Database tables created/verified');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Routes

// Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // We use the 'username' column to store the email address
    const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Place order (public endpoint)
app.post('/api/orders', async (req, res) => {
  try {
    const { fullName, phoneNumber, city, address, email, productId, productName, paymentMethod, codePromo } = req.body;

    // Insert client
    const [clientResult] = await db.execute(
      'INSERT INTO clients (full_name, phone, city, address, email) VALUES (?, ?, ?, ?, ?)',
      [fullName, phoneNumber, city, address, email || null]
    );

    const clientId = clientResult.insertId;

    // Insert order
    const [orderResult] = await db.execute(
      'INSERT INTO orders (client_id, product_id, product_name, status, payment_method, code_promo) VALUES (?, ?, ?, ?, ?, ?)',
      [clientId, productId, productName, 'en_attente', paymentMethod || null, codePromo || null]
    );

    res.json({
      success: true,
      orderId: orderResult.insertId,
      message: 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً.'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders (for admin)
app.get('/api/orders', authenticateToken, requireRole(['gestion_commandes', 'super_admin']), async (req, res) => {
  try {
    const [orders] = await db.execute(`
      SELECT o.*, c.full_name, c.phone, c.city, c.address, c.email
      FROM orders o
      JOIN clients c ON o.client_id = c.id
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
app.put('/api/orders/:id/status', authenticateToken, requireRole(['gestion_commandes', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Allowed statuses for Gestion Commandes role
    const allowedStatusesGestion = ['confirme', 'declined', 'en_cours', 'livre', 'retour'];

    if (req.user.role === 'gestion_commandes' && !allowedStatusesGestion.includes(status)) {
      return res.status(403).json({ error: 'Status change not permitted for your role' });
    }

    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Product management routes
app.get('/api/products', async (req, res) => {
  try {
    const [products] = await db.execute('SELECT * FROM products ORDER BY created_at DESC');

    // Parse JSON images for each product
    const productsWithParsedImages = products.map(product => {
      if (product.images) {
        try {
          product.images = JSON.parse(product.images);
        } catch (e) {
          console.error('Error parsing images for product', product.id, e);
          product.images = [];
        }
      } else {
        product.images = [];
      }
      return product;
    });

    res.json(productsWithParsedImages);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', authenticateToken, requireRole(['product_manager', 'super_admin']), upload.fields([
  { name: 'mainImages', maxCount: 3 },
  { name: 'optionalImages', maxCount: 5 },
  { name: 'images', maxCount: 5 } // Keep for backward compatibility
]), async (req, res) => {
  try {
    let { name, ram, storage, graphics, os, processor, old_price, new_price, description, promo_code, promo_type } = req.body;

    // Handle different image types
    const mainImages = req.files?.mainImages ? req.files.mainImages.map(file => `/uploads/${file.filename}`) : [];
    const optionalImages = req.files?.optionalImages ? req.files.optionalImages.map(file => `/uploads/${file.filename}`) : [];
    const legacyImages = req.files?.images ? req.files.images.map(file => `/uploads/${file.filename}`) : [];

    // For backward compatibility, if no main/optional images but legacy images exist, use legacy
    const finalMainImages = mainImages.length > 0 ? mainImages : legacyImages;
    const finalOptionalImages = optionalImages;

    // Convert undefined values to null for MySQL compatibility
    const params = [
      name || null,
      ram || null,
      storage || null,
      graphics || null,
      os || null,
      processor || null,
      old_price ? parseFloat(old_price) : null,
      new_price ? parseFloat(new_price) : null,
      JSON.stringify([...finalMainImages, ...finalOptionalImages]), // Combined for legacy images field
      JSON.stringify(finalMainImages),
      JSON.stringify(finalOptionalImages),
      description || null,
      promo_code || null,
      promo_type || null
    ];

    const [result] = await db.execute(
      `INSERT INTO products (name, ram, storage, graphics, os, processor, old_price, new_price, images, main_images, optional_images, description, promo_code, promo_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    res.json({ success: true, productId: result.insertId, message: 'Product created successfully' });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/products/:id', authenticateToken, requireRole(['product_manager', 'super_admin']), upload.fields([
  { name: 'mainImages', maxCount: 3 },
  { name: 'optionalImages', maxCount: 5 },
  { name: 'images', maxCount: 5 } // Keep for backward compatibility
]), async (req, res) => {
  try {
    const { id } = req.params;
    let { name, ram, storage, graphics, os, processor, old_price, new_price, description, promo_code, promo_type } = req.body;

    // Handle different image types for update
    let mainImages = [];
    let optionalImages = [];
    let legacyImages = [];

    if (req.files?.mainImages) {
      mainImages = req.files.mainImages.map(file => `/uploads/${file.filename}`);
    } else if (req.body.existing_main_images) {
      mainImages = JSON.parse(req.body.existing_main_images);
    }

    if (req.files?.optionalImages) {
      optionalImages = req.files.optionalImages.map(file => `/uploads/${file.filename}`);
    } else if (req.body.existing_optional_images) {
      optionalImages = JSON.parse(req.body.existing_optional_images);
    }

    if (req.files?.images) {
      legacyImages = req.files.images.map(file => `/uploads/${file.filename}`);
    } else if (req.body.existing_images) {
      legacyImages = JSON.parse(req.body.existing_images);
    }

    // For backward compatibility
    const finalMainImages = mainImages.length > 0 ? mainImages : legacyImages;
    const finalOptionalImages = optionalImages;
    const combinedImages = [...finalMainImages, ...finalOptionalImages];

    // Convert undefined values to null for MySQL compatibility
    const params = [
      name || null,
      ram || null,
      storage || null,
      graphics || null,
      os || null,
      processor || null,
      old_price ? parseFloat(old_price) : null,
      new_price ? parseFloat(new_price) : null,
      JSON.stringify(combinedImages), // Legacy images field
      JSON.stringify(finalMainImages),
      JSON.stringify(finalOptionalImages),
      description || null,
      promo_code || null,
      promo_type || null,
      id
    ];

    await db.execute(
      `UPDATE products SET name=?, ram=?, storage=?, graphics=?, os=?, processor=?, old_price=?, new_price=?, images=?, main_images=?, optional_images=?, description=?, promo_code=?, promo_type=? WHERE id=?`,
      params
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Get single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    if (product.images) {
      product.images = JSON.parse(product.images);
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.delete('/api/products/:id', authenticateToken, requireRole(['product_manager', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Clients endpoint
app.get('/api/clients', authenticateToken, requireRole(['gestion_commandes', 'super_admin']), async (req, res) => {
  try {
    const [clients] = await db.execute(`
      SELECT DISTINCT c.id, c.full_name, c.phone as phone_number, c.city, c.address, c.created_at
      FROM clients c
      INNER JOIN orders o ON c.id = o.client_id
      ORDER BY c.created_at DESC
    `);
    res.json(clients);
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// User Management endpoints (Super Admin only)
app.get('/api/users', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    if (!['product_manager', 'gestion_commandes', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE username = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );

    res.json({ success: true, userId: result.insertId, message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    if (!['product_manager', 'gestion_commandes', 'super_admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if email is already taken by another user
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE username = ? AND id != ?', [email, id]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email is already taken by another user' });
    }

    let updateQuery = 'UPDATE users SET username = ?, role = ? WHERE id = ?';
    let updateParams = [email, role, id];
// Categories endpoints
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM categorie ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { name, slug } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-');
    const [result] = await db.execute('INSERT INTO categorie (name, slug) VALUES (?, ?)', [name, finalSlug]);
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.delete('/api/categories/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM categorie WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});


    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery = 'UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?';
      updateParams = [email, hashedPassword, role, id];
    }

    await db.execute(updateQuery, updateParams);
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting the current user
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Statistics for Super Admin
app.get('/api/stats', authenticateToken, requireRole(['super_admin']), async (req, res) => {
  try {
    const [productCount] = await db.execute('SELECT COUNT(*) as count FROM products');
    const [orderCount] = await db.execute('SELECT COUNT(*) as count FROM orders');
    const [clientCount] = await db.execute('SELECT COUNT(*) as count FROM clients');
    const [confirmedOrders] = await db.execute('SELECT COUNT(*) as count FROM orders WHERE status = "confirme"');
    const [pendingOrders] = await db.execute('SELECT COUNT(*) as count FROM orders WHERE status = "en_attente"');
    const [declinedOrders] = await db.execute('SELECT COUNT(*) as count FROM orders WHERE status = "declined"');
    const [inProgressOrders] = await db.execute('SELECT COUNT(*) as count FROM orders WHERE status = "en_cours"');
    const [deliveredOrders] = await db.execute('SELECT COUNT(*) as count FROM orders WHERE status = "livre"');
    const [returnedOrders] = await db.execute('SELECT COUNT(*) as count FROM orders WHERE status = "retour"');

    res.json({
      products: productCount[0].count,
      orders: orderCount[0].count,
      clients: clientCount[0].count,
      confirmed: confirmedOrders[0].count,
      pending: pendingOrders[0].count,
      declined: declinedOrders[0].count,
      inProgress: inProgressOrders[0].count,
      delivered: deliveredOrders[0].count,
      returned: returnedOrders[0].count
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
  });
});
