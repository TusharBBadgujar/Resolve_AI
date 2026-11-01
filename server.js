require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 3000;
const databaseName = 'Resolve_AI';
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';

const initialOrders = [
  {
    orderId: 'ORD-8492',
    customerName: 'Rahul Sharma',
    email: 'rahul.s@example.com',
    itemName: 'boAt Rockerz 450 Bluetooth Headphones',
    amountINR: 899,
    status: 'Delivered',
    shippingAddress: 'Flat 204, Green Glen Layout, Bengaluru',
    trackingId: 'BLUEDART-882190',
    carrier: 'BlueDart Express',
    position: 0
  },
  {
    orderId: 'ORD-3120',
    customerName: 'Pooja Verma',
    email: 'pooja.v@example.com',
    itemName: 'Puma Smashic Unisex Sneakers (Size UK 7)',
    amountINR: 2499,
    status: 'Shipped',
    shippingAddress: 'B-12, Sector 62, Noida, UP',
    trackingId: 'DELHIVERY-774102',
    carrier: 'Delhivery',
    position: 1
  },
  {
    orderId: 'ORD-9914',
    customerName: 'Aditya Nair',
    email: 'aditya.n@example.com',
    itemName: 'Logitech MX Master 3S Mouse',
    amountINR: 7995,
    status: 'Processing',
    shippingAddress: 'Room 108, Boys Hostel 2, COEP Tech, Pune',
    trackingId: 'PENDING_DISPATCH',
    carrier: 'DTDC',
    position: 2
  },
  {
    orderId: 'ORD-5501',
    customerName: 'Vikram Malhotra',
    email: 'vikram.m@example.com',
    itemName: 'Sony Bravia 55-inch 4K Smart TV',
    amountINR: 54990,
    status: 'Delivered',
    shippingAddress: 'Villa 45, Palm Meadows, Bengaluru',
    trackingId: 'BLUEDART-110943',
    carrier: 'BlueDart Express',
    position: 3
  }
];

const initialTransactions = [
  {
    txId: 'TXN-INIT-001',
    orderId: 'ORD-8492',
    amountINR: 899,
    type: 'PAYMENT_CAPTURE',
    timestamp: '2026-10-24 10:14:22',
    status: 'SUCCESS',
    position: 1
  },
  {
    txId: 'TXN-INIT-002',
    orderId: 'ORD-3120',
    amountINR: 2499,
    type: 'PAYMENT_CAPTURE',
    timestamp: '2026-10-25 14:30:10',
    status: 'SUCCESS',
    position: 0
  }
];

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  itemName: { type: String, required: true },
  amountINR: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['Delivered', 'Shipped', 'Processing', 'Refunded', 'Escalated_To_Human'],
    required: true
  },
  shippingAddress: { type: String, required: true },
  trackingId: { type: String, required: true },
  carrier: { type: String, required: true },
  position: { type: Number, required: true }
}, { versionKey: false });

const transactionSchema = new mongoose.Schema({
  txId: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  amountINR: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['PAYMENT_CAPTURE', 'REFUND_AUTONOMOUS', 'ESCALATION_QUEUE'], required: true },
  timestamp: { type: String, required: true },
  status: { type: String, enum: ['SUCCESS', 'ESCALATED'], required: true },
  position: { type: Number, required: true }
}, { versionKey: false });

const Order = mongoose.model('Order', orderSchema);
const AuditTransaction = mongoose.model('AuditTransaction', transactionSchema, 'audit_ledger');

app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    connected,
    database: databaseName
  });
});

app.get('/api/state', async (req, res, next) => {
  try {
    const [orders, transactions] = await Promise.all([
      Order.find().sort({ position: 1 }).select('-_id -position').lean(),
      AuditTransaction.find().sort({ position: -1 }).select('-_id -position').lean()
    ]);
    res.json({ orders, transactions });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/orders/:orderId', async (req, res, next) => {
  const allowedFields = ['status', 'shippingAddress'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([field]) => allowedFields.includes(field))
  );

  if (Object.keys(updates).length === 0 || Object.keys(updates).length !== Object.keys(req.body).length) {
    return res.status(400).json({ error: 'Provide only a valid status or shippingAddress update.' });
  }

  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-_id -position').lean();

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

app.post('/api/operations', async (req, res, next) => {
  const { orderId, updates, transaction } = req.body;
  const allowedFields = ['status'];
  const orderUpdates = updates && typeof updates === 'object'
    ? Object.fromEntries(Object.entries(updates).filter(([field]) => allowedFields.includes(field)))
    : {};

  if (!orderId || !transaction || Object.keys(orderUpdates).length === 0 ||
      Object.keys(orderUpdates).length !== Object.keys(updates || {}).length) {
    return res.status(400).json({ error: 'A valid order update and audit transaction are required.' });
  }

  try {
    const orderExists = await Order.exists({ orderId });
    if (!orderExists) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const auditEntry = new AuditTransaction({ ...transaction, position: Date.now() });
    await auditEntry.validate();
    await auditEntry.save();

    try {
      const order = await Order.findOneAndUpdate(
        { orderId },
        { $set: orderUpdates },
        { new: true, runValidators: true }
      ).select('-_id -position').lean();

      if (!order) {
        await AuditTransaction.deleteOne({ txId: transaction.txId });
        return res.status(404).json({ error: 'Order not found.' });
      }

      return res.status(201).json({ order, transaction: auditEntry.toObject() });
    } catch (error) {
      await AuditTransaction.deleteOne({ txId: transaction.txId });
      throw error;
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Transaction ID already exists.' });
    }
    next(error);
  }
});

app.post('/api/transactions', async (req, res, next) => {
  try {
    const transaction = await AuditTransaction.create({
      ...req.body,
      position: Date.now()
    });
    res.status(201).json(transaction.toObject());
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Transaction ID already exists.' });
    }
    next(error);
  }
});

app.post('/api/reset', async (req, res, next) => {
  try {
    await Promise.all([
      Order.deleteMany({}),
      AuditTransaction.deleteMany({})
    ]);
    await Promise.all([
      Order.insertMany(initialOrders),
      AuditTransaction.insertMany(initialTransactions)
    ]);
    res.json({ reset: true });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(path.join(__dirname), { dotfiles: 'deny' }));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'The request could not be completed.' });
});

async function start() {
  await mongoose.connect(mongoUri, { dbName: databaseName });

  if (await Order.countDocuments() === 0) {
    await Order.insertMany(initialOrders);
  }
  if (await AuditTransaction.countDocuments() === 0) {
    await AuditTransaction.insertMany(initialTransactions);
  }

  app.listen(port, () => {
    console.log(`ResolvAI is available at http://localhost:${port}`);
    console.log(`MongoDB connected to database "${databaseName}".`);
  });
}

start().catch(error => {
  console.error(`Unable to start ResolvAI or connect to MongoDB: ${error.message}`);
  process.exitCode = 1;
});
