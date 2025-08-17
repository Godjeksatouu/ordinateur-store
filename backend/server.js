const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config({ path: '../.env' });

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

    // Add category_id column if it doesn't exist
    try {
      const [categoryCol] = await db.execute("SHOW COLUMNS FROM products LIKE 'category_id'");
      // @ts-ignore
      if (Array.isArray(categoryCol) && categoryCol.length === 0) {
        await db.execute("ALTER TABLE products ADD COLUMN category_id INT");
        console.log('✅ Added category_id column to products table');
      }
    } catch (e) {
      console.warn('⚠️ Could not add category_id column to products:', e.message || e);
    }
    // Remove old promo fields from products (now using global promo system)
    try {
      const [promoCodeCol] = await db.execute("SHOW COLUMNS FROM products LIKE 'promo_code'");
      // @ts-ignore
      if (Array.isArray(promoCodeCol) && promoCodeCol.length > 0) {
        await db.execute("ALTER TABLE products DROP COLUMN promo_code");
        console.log('✅ Dropped promo_code column from products');
      }
    } catch (e) {
      console.warn('⚠️ Could not drop products.promo_code column:', e.message || e);
    }
    try {
      const [promoTypeCol] = await db.execute("SHOW COLUMNS FROM products LIKE 'promo_type'");
      // @ts-ignore
      if (Array.isArray(promoTypeCol) && promoTypeCol.length > 0) {
        await db.execute("ALTER TABLE products DROP COLUMN promo_type");
        console.log('✅ Dropped promo_type column from products');
      }
    } catch (e) {
      console.warn('⚠️ Could not drop products.promo_type column:', e.message || e);
    }

    // Drop and recreate promo codes table to ensure correct structure
    try {
      await db.execute('DROP TABLE IF EXISTS promo_codes');
      console.log('✅ Dropped existing promo_codes table');
    } catch (e) {
      console.warn('⚠️ Could not drop promo_codes table:', e.message);
    }

    // Create promo codes table
    await db.execute(`
      CREATE TABLE promo_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        type ENUM('percentage', 'fixed') NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        applies_to ENUM('all', 'specific') DEFAULT 'all',
        product_ids JSON,
        commercial_name VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created promo_codes table with correct structure');

    // Create categories table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created categories table');

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
// Email (Nodemailer)
const nodemailer = require('nodemailer');

function createTransporter() {
  // Use environment variables for credentials; if absent, fallback to ethereal
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure: SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  // Fallback: create a testing account (Ethereal)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'test@example.com',
      pass: 'test-password',
    },
  });
}

// Email templates for different languages
const emailTemplates = {
  ar: {
    greeting: 'السلام عليكم،',
    thankYou: 'نشكر لك ثقتك بشركتنا.',
    orderReceived: 'لقد استلمنا طلبك بنجاح. التفاصيل كالتالي:',
    product: 'المنتج',
    quantity: 'الكمية',
    price: 'السعر',
    orderNumber: 'رقم الطلب',
    orderDate: 'تاريخ الطلب',
    processingInfo: 'سيتم تجهيز طلبك وشحنه خلال 3 أيام عمل. عند شحن الطلب ستصلك رسالة تتضمن رقم التتبع.',
    contactInfo: 'للاستفسار، يمكنك التواصل معنا عبر البريد الإلكتروني: support@company.com أو الاتصال على الرقم: +212 661-585396',
    regards: 'مع تحياتنا،',
    team: 'فريق شركة',
    currency: 'درهم',
    subject: 'تأكيد طلبك - رقم الطلب'
  },
  en: {
    greeting: 'Hello,',
    thankYou: 'Thank you for trusting our company.',
    orderReceived: 'We have successfully received your order. Details are as follows:',
    product: 'Product',
    quantity: 'Quantity',
    price: 'Price',
    orderNumber: 'Order Number',
    orderDate: 'Order Date',
    processingInfo: 'Your order will be prepared and shipped within 3 business days. When the order is shipped, you will receive a message with the tracking number.',
    contactInfo: 'For inquiries, you can contact us via email: support@company.com or call: +212 661-585396',
    regards: 'Best regards,',
    team: 'Team',
    currency: 'DH',
    subject: 'Order Confirmation - Order Number'
  },
  fr: {
    greeting: 'Bonjour,',
    thankYou: 'Merci de faire confiance à notre entreprise.',
    orderReceived: 'Nous avons reçu votre commande avec succès. Les détails sont les suivants:',
    product: 'Produit',
    quantity: 'Quantité',
    price: 'Prix',
    orderNumber: 'Numéro de commande',
    orderDate: 'Date de commande',
    processingInfo: 'Votre commande sera préparée et expédiée dans les 3 jours ouvrables. Lorsque la commande est expédiée, vous recevrez un message avec le numéro de suivi.',
    contactInfo: 'Pour toute question, vous pouvez nous contacter par email: support@company.com ou appeler: +212 661-585396',
    regards: 'Cordialement,',
    team: 'Équipe',
    currency: 'DH',
    subject: 'Confirmation de commande - Numéro de commande'
  },
  es: {
    greeting: 'Hola,',
    thankYou: 'Gracias por confiar en nuestra empresa.',
    orderReceived: 'Hemos recibido su pedido exitosamente. Los detalles son los siguientes:',
    product: 'Producto',
    quantity: 'Cantidad',
    price: 'Precio',
    orderNumber: 'Número de pedido',
    orderDate: 'Fecha del pedido',
    processingInfo: 'Su pedido será preparado y enviado dentro de 3 días hábiles. Cuando el pedido sea enviado, recibirá un mensaje con el número de seguimiento.',
    contactInfo: 'Para consultas, puede contactarnos por email: support@company.com o llamar: +212 661-585396',
    regards: 'Saludos cordiales,',
    team: 'Equipo',
    currency: 'DH',
    subject: 'Confirmación de pedido - Número de pedido'
  }
};

function buildOrderEmail({ storeName, fullName, productName, quantity, price, orderId, orderDate, language = 'ar', originalPrice = null, discount = null }) {
  const template = emailTemplates[language] || emailTemplates.ar;
  const isRTL = language === 'ar';

  // Format price with currency
  const formattedPrice = `${price} ${template.currency}`;
  const formattedOriginalPrice = originalPrice ? `${originalPrice} ${template.currency}` : null;

  const plain = `${template.greeting}\n\n${template.thankYou}\n\n${template.orderReceived}\n\n${template.product}: ${productName}\n${template.quantity}: ${quantity}\n${template.price}: ${formattedPrice}\n${template.orderNumber}: #${orderId}\n${template.orderDate}: ${orderDate}\n\n${template.processingInfo}\n\n${template.contactInfo}\n\n${template.regards}\n${template.team} ${storeName}`;

  const html = `
  <div dir="${isRTL ? 'rtl' : 'ltr'}" style="font-family: ${isRTL ? 'Tahoma, Arial' : 'Arial, Helvetica'}, sans-serif; color: #262a2f; background:#fdfefd; padding:24px; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #6188a4 0%, #262a2f 100%); padding: 20px; border-radius: 12px; margin-bottom: 24px;">
      <h2 style="margin: 0; color: white; font-size: 24px;">${storeName}</h2>
    </div>

    <p style="font-size: 16px; line-height: 1.6;">${template.greeting}</p>
    <p style="font-size: 16px; line-height: 1.6;">${template.thankYou}</p>
    <p style="font-size: 16px; line-height: 1.6; font-weight: bold;">${template.orderReceived}</p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6188a4;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #e9ecef;">
          <td style="padding: 8px 0; font-weight: bold;">${template.product}:</td>
          <td style="padding: 8px 0;">${productName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e9ecef;">
          <td style="padding: 8px 0; font-weight: bold;">${template.quantity}:</td>
          <td style="padding: 8px 0;">${quantity}</td>
        </tr>
        ${originalPrice && discount ? `
        <tr style="border-bottom: 1px solid #e9ecef;">
          <td style="padding: 8px 0; font-weight: bold;">السعر الأصلي:</td>
          <td style="padding: 8px 0; text-decoration: line-through; color: #6c757d;">${formattedOriginalPrice}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e9ecef;">
          <td style="padding: 8px 0; font-weight: bold;">الخصم:</td>
          <td style="padding: 8px 0; color: #28a745;">-${discount} ${template.currency}</td>
        </tr>
        ` : ''}
        <tr style="border-bottom: 1px solid #e9ecef;">
          <td style="padding: 8px 0; font-weight: bold;">${template.price}:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #6188a4; font-size: 18px;">${formattedPrice}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e9ecef;">
          <td style="padding: 8px 0; font-weight: bold;">${template.orderNumber}:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #262a2f;">#${orderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold;">${template.orderDate}:</td>
          <td style="padding: 8px 0;">${orderDate}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 16px; line-height: 1.6; background: #e3f2fd; padding: 16px; border-radius: 8px; border-left: 4px solid #2196f3;">${template.processingInfo}</p>

    <p style="font-size: 14px; line-height: 1.6; color: #6c757d;">${template.contactInfo}</p>

    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e9ecef;">
      <p style="margin: 0; font-size: 16px;">${template.regards}</p>
      <p style="margin: 0; font-weight: bold; color: #6188a4;">${template.team} ${storeName}</p>
    </div>
  </div>`;

  return { plain, html, subject: `${template.subject} #${orderId}` };
}

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

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

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
        email: user.username, // Return as email for frontend compatibility
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
    const { fullName, phoneNumber, city, address, email, productId, productName, paymentMethod, codePromo, language = 'ar', finalPrice, originalPrice, discount } = req.body;

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

    // Fire-and-forget email (does not block the response)
    (async () => {
      try {
        const transporter = createTransporter();
        const storeName = 'متجر الحاسوب'; // Will be translated in email template
        const quantity = 1;
        const price = finalPrice || '—';
        const orderId = orderResult.insertId;
        const orderDate = new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US');

        const { plain, html, subject } = buildOrderEmail({
          storeName,
          fullName,
          productName,
          quantity,
          price,
          orderId,
          orderDate,
          language,
          originalPrice,
          discount
        });

        if (email) {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"${storeName}" <no-reply@laptopstore.ma>`,
            to: email,
            subject,
            text: plain,
            html,
            headers: {
              'X-Priority': '1',
              'X-MSMail-Priority': 'High',
              'Importance': 'high'
            }
          });
          console.log(`✅ Order confirmation email sent to ${email} for order #${orderId}`);
        }
      } catch (mailErr) {
        console.error('Nodemailer error (non-blocking):', mailErr);
      }
    })();

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

// Promo Codes API endpoints

// Get all promo codes (admin only)
app.get('/api/promos', authenticateToken, requireRole(['product_manager', 'super_admin']), async (req, res) => {
  try {
    const [promos] = await db.execute('SELECT * FROM promo_codes ORDER BY created_at DESC');
    res.json(promos);
  } catch (error) {
    console.error('Get promos error:', error);
    res.status(500).json({ error: 'Failed to fetch promo codes' });
  }
});

// Create promo code (admin only)
app.post('/api/promos', authenticateToken, requireRole(['product_manager', 'super_admin']), async (req, res) => {
  try {
    const { name, code, type, value, applies_to, product_ids, commercial_name, is_active } = req.body;

    const [result] = await db.execute(
      'INSERT INTO promo_codes (name, code, type, value, applies_to, product_ids, commercial_name, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, code.toUpperCase(), type, value, applies_to, JSON.stringify(product_ids || []), commercial_name || null, is_active !== false]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Create promo error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Promo code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create promo code' });
    }
  }
});

// Update promo code (admin only)
app.put('/api/promos/:id', authenticateToken, requireRole(['product_manager', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, type, value, applies_to, product_ids, commercial_name, is_active } = req.body;

    await db.execute(
      'UPDATE promo_codes SET name = ?, code = ?, type = ?, value = ?, applies_to = ?, product_ids = ?, commercial_name = ?, is_active = ? WHERE id = ?',
      [name, code.toUpperCase(), type, value, applies_to, JSON.stringify(product_ids || []), commercial_name || null, is_active !== false, id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update promo error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Promo code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update promo code' });
    }
  }
});

// Toggle promo code active status (admin only)
app.put('/api/promos/:id/toggle', authenticateToken, requireRole(['product_manager', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    await db.execute('UPDATE promo_codes SET is_active = ? WHERE id = ?', [is_active, id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Toggle promo error:', error);
    res.status(500).json({ error: 'Failed to toggle promo code status' });
  }
});

// Delete promo code (admin only)
app.delete('/api/promos/:id', authenticateToken, requireRole(['product_manager', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM promo_codes WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete promo error:', error);
    res.status(500).json({ error: 'Failed to delete promo code' });
  }
});

// Validate promo code (public endpoint)
app.post('/api/promos/validate', async (req, res) => {
  try {
    const { code, productId } = req.body;

    if (!code) {
      return res.status(400).json({ valid: false, message: 'كود الخصم مطلوب' });
    }

    // Get promo code
    const [promos] = await db.execute('SELECT * FROM promo_codes WHERE code = ? AND is_active = TRUE', [code.toUpperCase()]);

    if (promos.length === 0) {
      return res.status(400).json({ valid: false, message: 'كود الخصم غير صحيح أو منتهي الصلاحية' });
    }

    const promo = promos[0];

    // Check if promo applies to this product
    if (promo.applies_to === 'specific' && productId) {
      const productIds = JSON.parse(promo.product_ids || '[]');
      if (!productIds.includes(parseInt(productId))) {
        return res.status(400).json({ valid: false, message: 'كود الخصم غير صالح لهذا المنتج' });
      }
    }

    res.json({
      valid: true,
      discount: promo.value,
      type: promo.type,
      message: `تم تطبيق كود الخصم: ${promo.name}`
    });
  } catch (error) {
    console.error('Validate promo error:', error);
    res.status(500).json({ valid: false, message: 'حدث خطأ في التحقق من كود الخصم' });
  }
});

// Category Management API endpoints

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await db.execute('SELECT * FROM categories ORDER BY name ASC');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category (admin only)
app.post('/api/categories', authenticateToken, requireRole(['product_manager', 'super_admin']), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const [result] = await db.execute(
      'INSERT INTO categories (name) VALUES (?)',
      [name.trim()]
    );

    res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
});

// Update category (admin only)
app.put('/api/categories/:id', authenticateToken, requireRole(['product_manager', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const [result] = await db.execute(
      'UPDATE categories SET name = ? WHERE id = ?',
      [name.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
});

// Delete category (admin only)
app.delete('/api/categories/:id', authenticateToken, requireRole(['product_manager', 'super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is being used by any products
    const [products] = await db.execute('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
    if (products[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete category that is being used by products' });
    }

    const [result] = await db.execute('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
  });
});
