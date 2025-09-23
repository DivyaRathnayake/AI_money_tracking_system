require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

// Middleware 
app.use(cors({ origin: ["http://localhost:3000"], credentials: false }));
app.use(express.json());

// MySQL Connection 
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "0713327209",
  database: process.env.DB_NAME || "budgetbuddy",
  multipleStatements: false,
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
    process.exit(1);
  }
  console.log("✅ MySQL Connected...");
});

// Google Gemini API Setup 
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// WT Authentication Middleware 
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

app.get("/", (_req, res) => res.send("✅ Backend is running 🚀"));



// Signup
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    db.query(
      "SELECT id FROM user WHERE username = ? OR email = ?",
      [username, email],
      async (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        if (result.length > 0)
          return res.status(400).json({ message: "Username or email exists" });

        const hashed = await bcrypt.hash(password, 10);
        db.query(
          "INSERT INTO user (username, email, password) VALUES (?, ?, ?)",
          [username, email, hashed],
          (err2, insertRes) => {
            if (err2) return res.status(500).json({ message: err2.message });

            const user = { id: insertRes.insertId, username, email };
            const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: "1h" });

            return res.status(201).json({ message: "User registered", token, user });
          }
        );
      }
    );
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username & password required" });

  db.query(
    "SELECT id, username, email, password FROM user WHERE username = ?",
    [username],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      if (rows.length === 0) return res.status(401).json({ message: "User not found" });

      const userRow = rows[0];
      const ok = await bcrypt.compare(password, userRow.password);
      if (!ok) return res.status(401).json({ message: "Invalid password" });

      const token = jwt.sign({ id: userRow.id, username: userRow.username }, JWT_SECRET, { expiresIn: "1h" });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: { id: userRow.id, username: userRow.username, email: userRow.email },
      });
    }
  );
});


const updateTotalIncome = (userId) => {
  db.query(
    "SELECT COALESCE(SUM(income),0) AS total FROM incomes WHERE user_id = ?",
    [userId],
    (err, rows) => {
      if (err) return console.error(err.message);
      const total = Number(rows[0].total || 0);
      db.query("UPDATE user SET total_income = ? WHERE id = ?", [total, userId], (err2) => {
        if (err2) console.error(err2.message);
      });
    }
  );
};

// Create income
app.post("/income", authenticateToken, (req, res) => {
  const { source, income } = req.body;
  const userId = req.user.id;
  if (!source || income === undefined)
    return res.status(400).json({ message: "source & income required" });

  const value = Number(income);
  if (!Number.isFinite(value) || value < 0)
    return res.status(400).json({ message: "income must be non-negative" });

  db.query("INSERT INTO incomes (user_id, source, income) VALUES (?, ?, ?)", [userId, source.trim(), value], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    updateTotalIncome(userId);
    return res.status(201).json({ message: "Income saved", income: { id: result.insertId, user_id: userId, source: source.trim(), income: value } });
  });
});

// Get all incomes
app.get("/income", authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.query("SELECT id, source, income, created_at FROM incomes WHERE user_id = ? ORDER BY created_at DESC", [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    db.query("SELECT COALESCE(SUM(income),0) AS total FROM incomes WHERE user_id = ?", [userId], (err2, totalRows) => {
      if (err2) return res.status(500).json({ message: err2.message });
      return res.status(200).json({ incomes: rows, total: Number(totalRows[0].total) });
    });
  });
});

// Update income
app.put("/income/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { source, income } = req.body;
  const userId = req.user.id;
  const fields = [];
  const params = [];

  if (source) { fields.push("source=?"); params.push(source.trim()); }
  if (income !== undefined) {
    const val = Number(income);
    if (!Number.isFinite(val) || val < 0) return res.status(400).json({ message: "income must be non-negative" });
    fields.push("income=?"); params.push(val);
  }
  if (!fields.length) return res.status(400).json({ message: "Nothing to update" });

  const q = `UPDATE incomes SET ${fields.join(", ")} WHERE id=? AND user_id=?`;
  params.push(id, userId);

  db.query(q, params, (err) => {
    if (err) return res.status(500).json({ message: err.message });
    updateTotalIncome(userId);
    return res.status(200).json({ message: "Income updated" });
  });
});

// Delete income
app.delete("/income/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.query("DELETE FROM incomes WHERE id=? AND user_id=?", [id, userId], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Income not found" });
    updateTotalIncome(userId);
    return res.status(200).json({ message: "Income deleted" });
  });
});




const updateTotalExpense = (userId) => {
  db.query("SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE user_id=?", [userId], (err, rows) => {
    if (err) return console.error(err.message);
    const total = Number(rows[0].total || 0);
    db.query("UPDATE user SET total_expenses=? WHERE id=?", [total, userId], (err2) => {
      if (err2) console.error(err2.message);
    });
  });
};

// Create expense
app.post("/expense", authenticateToken, (req, res) => {
  const { source, amount } = req.body;
  const userId = req.user.id;
  if (!source || amount === undefined) return res.status(400).json({ message: "source & amount required" });

  const val = Number(amount);
  if (!Number.isFinite(val) || val < 0) return res.status(400).json({ message: "amount must be non-negative" });

  db.query("INSERT INTO expenses (user_id, source, amount) VALUES (?, ?, ?)", [userId, source.trim(), val], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    updateTotalExpense(userId);
    return res.status(201).json({ message: "Expense saved", expense: { id: result.insertId, user_id: userId, source: source.trim(), amount: val } });
  });
});

// Get all expenses
app.get("/expense", authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.query("SELECT id, source, amount, created_at FROM expenses WHERE user_id=? ORDER BY created_at DESC", [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    db.query("SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE user_id=?", [userId], (err2, totalRows) => {
      if (err2) return res.status(500).json({ message: err2.message });
      return res.status(200).json({ expenses: rows, total: Number(totalRows[0].total) });
    });
  });
});

// Update expense
app.put("/expense/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { source, amount } = req.body;
  const userId = req.user.id;

  const fields = [];
  const params = [];
  if (source) { fields.push("source=?"); params.push(source.trim()); }
  if (amount !== undefined) {
    const val = Number(amount);
    if (!Number.isFinite(val) || val < 0) return res.status(400).json({ message: "amount must be non-negative" });
    fields.push("amount=?"); params.push(val);
  }
  if (!fields.length) return res.status(400).json({ message: "Nothing to update" });

  const q = `UPDATE expenses SET ${fields.join(", ")} WHERE id=? AND user_id=?`;
  params.push(id, userId);

  db.query(q, params, (err) => {
    if (err) return res.status(500).json({ message: err.message });
    updateTotalExpense(userId);
    return res.status(200).json({ message: "Expense updated" });
  });
});

// Delete expense
app.delete("/expense/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  db.query("DELETE FROM expenses WHERE id=? AND user_id=?", [id, userId], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Expense not found" });
    updateTotalExpense(userId);
    return res.status(200).json({ message: "Expense deleted" });
  });
});

// summary
app.get("/summary", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const q = `
    SELECT 
      (SELECT COALESCE(SUM(income),0) FROM incomes WHERE user_id=?) AS total_income,
      (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE user_id=?) AS total_expenses
  `;
  db.query(q, [userId, userId], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    return res.status(200).json({ total_income: Number(rows[0].total_income), total_expenses: Number(rows[0].total_expenses) });
  });
});

// RECOMMENDATION (AI) 
app.post("/recommendation", authenticateToken, async (req, res) => {
  try {
    const { income, expenses, itemPrice } = req.body;
    if (income === undefined || expenses === undefined || itemPrice === undefined)
      return res.status(400).json({ error: "Missing required fields" });

    const balance = income - expenses;
    const price = Number(itemPrice);
    let aiMessage = "";
    let budgetPlan = null;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are a financial advisor.
        User has total income: LKR ${income}, total expenses: LKR ${expenses}, 
        current balance: LKR ${balance}, and wants to buy an item worth LKR ${itemPrice}.
        Give a clear recommendation including:
        - If they can afford it, how much will remain after purchase.
        - If they cannot afford it, show current savings and how much more is needed.
        - Suggest a simple monthly saving plan to buy it in next 3-6 months.
        - Keep it short and friendly.
      `;
      const result = await model.generateContent(prompt);
      aiMessage = result.response.candidates[0].content.parts[0].text;
    } catch (aiErr) {
      console.error("AI API failed, using fallback rules:", aiErr);
      if (balance <= 0) {
        aiMessage = `⚠️ You have no savings. Current balance: LKR ${balance.toFixed(2)}. Better to save before buying.`;
      } else if (price <= balance) {
        const remaining = balance - price;
        aiMessage = `✅ You can afford this purchase. Spend LKR ${price.toFixed(2)} and you'll have LKR ${remaining.toFixed(2)} remaining for savings.`;
      } else {
        const needed = price - balance;
        const monthsOptions = [3, 6, 12];
        budgetPlan = monthsOptions.map((m) => ({ months: m, savePerMonth: (needed / m).toFixed(2) }));
        aiMessage = `❌ Not affordable right now. Current savings: LKR ${balance.toFixed(2)}. You need LKR ${needed.toFixed(2)} more to buy this item. Here's a budget plan to save over the next months:`;
      }
    }

    res.json({ recommendation: aiMessage, balance, price, budgetPlan });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Recommendation failed" });
  }
});


// Forgot password
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });

  db.query("SELECT id, username FROM user WHERE email=?", [email], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message });
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = rows[0];
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    db.query("UPDATE user SET reset_token=? WHERE id=?", [token, user.id], (err2) => {
      if (err2) return res.status(500).json({ message: err2.message });

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER || "your_email@gmail.com",
          pass: process.env.EMAIL_PASS || "your_email_password",
        },
      });

      const resetLink = `http://localhost:3000/reset-password/${token}`;
      const mailOptions = {
        from: process.env.EMAIL_USER || "your_email@gmail.com",
        to: email,
        subject: "Password Reset",
        text: `Click here to reset your password: ${resetLink} \n\nLink expires in 1 hour.`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) return res.status(500).json({ message: error.message });
        res.json({ message: "Password reset link sent to your email" });
      });
    });
  });
});

// Reset password
app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: "Password required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    db.query("SELECT * FROM user WHERE id=? AND reset_token=?", [decoded.id, token], async (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      if (rows.length === 0) return res.status(400).json({ message: "Invalid or expired token" });

      const hashedPassword = await bcrypt.hash(password, 10);
      db.query("UPDATE user SET password=?, reset_token=NULL WHERE id=?", [hashedPassword, decoded.id], (err2) => {
        if (err2) return res.status(500).json({ message: err2.message });
        res.json({ message: "Password successfully reset" });
      });
    });
  } catch {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
});


app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
