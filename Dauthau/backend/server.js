const express = require("express");
const cors = require("cors");
const cassandra = require("cassandra-driver");
const elastic = require("./elastic");
const crawler = require("./crawler");
const jwt = require("jsonwebtoken");
const userRoutes = require("./routes");

const app = express();

// ================= CONFIG =================
const PORT = 8000;

// ================= CORS =================
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use("/api", userRoutes);

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

// ================= AUTH =================
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  try {
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, "secret_key_123");

    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
}

// ================= FOLLOW =================
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
    const { time } = req.query;

    let date = null;
    const now = new Date();

    if (time === "3m") {
      date = new Date(now.setMonth(now.getMonth() - 3));
    } else if (time === "6m") {
      date = new Date(now.setMonth(now.getMonth() - 6));
    } else if (time === "1y") {
      date = new Date(now.setFullYear(now.getFullYear() - 1));
    }

    let query = "";
    let params = [];

    if (date) {
      query = `
        SELECT * FROM demo.user_follow
        WHERE user_id=? AND created_at >= ?
      `;
      params = [user_id, date];
    } else {
      query = `
        SELECT * FROM demo.user_follow
        WHERE user_id=?
      `;
      params = [user_id];
    }

    const result = await cassandraClient.execute(query, params, {
      prepare: true,
    });

    
    const bids = [];

    for (const row of result.rows) {
      try {
        const esResult = await es.get({
          index: "contractors",
          id: row.bid_id,
        });

        bids.push({
          ...row,
          ...esResult.body._source,
        });
      } catch (err) {
        console.log("ES not found:", row.bid_id);
      }
    }

    
    res.json(bids);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= INIT ELASTIC =================
(async () => {
  try {
    await elastic.initIndex();
    console.log("✅ Elastic ready");
  } catch (err) {
    console.error("❌ Elastic init error:", err.message);
  }
})();

// ================= SEARCH =================
app.get("/search", async (req, res) => {
  try {
    const {
      q,
      provinces,
      minPrice,
      invest_field,
      page = 1,
      size = 5,
    } = req.query;

    const result = await elastic.search(
      q || "",
      provinces ? provinces.split(",") : [],
      minPrice || "",
      invest_field || "",
      Number(page),
      Number(size)
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DETAIL BY SLUG =================
app.get("/bid/:slug", async (req, res) => {
  try {
    const result = await es.search({
      index: "contractors",
      size: 1,
      body: {
        query: {
          term: {
            slug: req.params.slug,
          },
        },
      },
    });

    if (result.body.hits.hits.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(result.body.hits.hits[0]._source);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
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
// ================= GET BY ID (OPTIONAL) =================
app.get("/bid-id/:id", async (req, res) => {
  try {
    const result = await es.get({
      index: "contractors",
      id: req.params.id,
    });

    res.json(result.body._source);
  } catch {
    res.status(404).json({ message: "Not found" });
  }
});

// ================= REINDEX (MANUAL) =================
app.post("/reindex", async (req, res) => {
  try {
    const result = await cassandraClient.execute(
      "SELECT * FROM demo.contractors"
    );

    for (const item of result.rows) {
      await es.index({
        index: "contractors",
        id: item.id,
        body: item,
      });
    }

    res.json({
      message: "Reindex done",
      count: result.rows.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DEBUG =================
app.get("/es-data", async (req, res) => {
  try {
    const result = await es.search({
      index: "contractors",
      size: 20,
      body: {
        query: { match_all: {} },
      },
    });

    res.json(
      result.body.hits.hits.map((h) =>{ h._source,es_id=h._id})
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= START CRAWLER =================
let started = false;

(async () => {
  try {
    if (!started) {
      started = true;
      console.log(" Starting realtime crawler...");
      crawler.crawl();
    }
  } catch (err) {
    console.error("Crawler error:", err.message);
  }
})();

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});