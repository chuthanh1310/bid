const express = require("express");
const cors = require("cors");
const cassandra = require("cassandra-driver");
const elastic = require("./elastic");
const crawler = require("./crawler");
const jwt = require("jsonwebtoken");
const userRoutes = require("./routes");

const app = express();

// ================= CORS =================
app.use(
  cors({
    origin: "http://localhost:5173", 
  })
);

app.use(express.json());
app.use("/api", userRoutes);
app.post("/follow", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.username;
    const { bid_id } = req.body;

    await cassandraClient.execute(
      `INSERT INTO demo.user_follow (user_id, bid_id, created_at)
       VALUES (?, ?, toTimestamp(now()))`,
      [user_id, bid_id],
      { prepare: true }
    );

    res.json({ message: "Follow thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/unfollow", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.username;
    const { bid_id } = req.body;

    await cassandraClient.execute(
      `DELETE FROM demo.user_follow WHERE user_id=? AND bid_id=?`,
      [user_id, bid_id],
      { prepare: true }
    );

    res.json({ message: "Đã bỏ theo dõi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/my-follow", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.username;

    const result = await cassandraClient.execute(
      `SELECT * FROM demo.user_follow WHERE user_id=?`,
      [user_id],
      { prepare: true }
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function authMiddleware(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, "secret_key_123");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
}

// ================= CASSANDRA =================
const cassandraClient = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1",
  keyspace: "demo",
});

// ================= ELASTIC =================
const { Client } = require("@elastic/elasticsearch");

const es = new Client({
  node: "http://localhost:9200",
});

// ================= INIT =================
(async () => {
  try {
    await elastic.initIndex();
    console.log("Elastic ready");
  } catch (err) {
    console.error("Elastic init error:", err.message);
  }
})();

// ================= SEARCH =================
app.get("/search", async (req, res) => {
  try {
    const { q, provinces, minPrice, invest_field } = req.query;

    const result = await elastic.search(
      q || "",
      provinces ? provinces.split(",") : [],
      minPrice || "",
      invest_field || ""
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ES DATA =================
app.get("/es-data", async (req, res) => {
  try {
    const result = await es.search({
      index: "contractors",
      size: 100,
      body: {
        query: { match_all: {} },
      },
    });

    const data = result.body.hits.hits.map((h) => h._source);

    res.json({
      count: result.body.hits.total.value,
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= CASSANDRA DATA =================
app.get("/data", async (req, res) => {
  try {
    const result = await cassandraClient.execute(
      "SELECT * FROM demo.contractors"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= CRAWL =================
app.get("/crawl", async (req, res) => {
  try {
    crawler.crawl();
    res.json({ status: "crawling..." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(8000, () => {
  console.log("Server running at http://localhost:8000");
});