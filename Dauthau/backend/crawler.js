const axios = require("axios");
const cassandra = require("cassandra-driver");
const elastic = require("./elastic");

const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1",
  keyspace: "demo",
});
function createSlug(str) {
  if (!str) return "";

  return str
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function safeNumber(val) {
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

function normalizeItem(item) {
  const name = Array.isArray(item.bidName)
  ? item.bidName[0]
  : item.bidName;

  const slug = createSlug(name);
  return {
    id: item.id || "",
    slug: slug,
    bid_close_date: item.bidCloseDate || "",
    bid_form: item.bidForm || "",
    bid_id: item.bidId || "",
    bid_mode: item.bidMode || "",
    bid_open_date: item.bidOpenDate || "",
    created_by: item.createdBy || "",

    investor_code: item.investorCode || "",
    investor_name: item.investorName || "",

    is_domestic: safeNumber(item.isDomestic),
    is_internet: safeNumber(item.isInternet),

    notify_id: item.notifyId || "",
    notify_no: item.notifyNo || "",
    notify_no_stand: item.notifyNoStand || "",
    notify_version: item.notifyVersion || "",

    num_bidder_tech: safeNumber(item.numBidderTech),
    num_clarify_req: safeNumber(item.numClarifyReq),
    num_petition: safeNumber(item.numPetition),
    num_petition_hsmt: safeNumber(item.numPetitionHsmt),
    num_petition_kqlcnt: safeNumber(item.numPetitionKqlcnt),
    num_petition_lcnt: safeNumber(item.numPetitionLcnt),

    original_public_date: item.originalPublicDate || "",
    plan_no: item.planNo || "",
    plan_type: item.planType || "",
    process_apply: item.processApply || "",
    public_date: item.publicDate || "",

    score: item.score || "",
    status: item.status || "",
    status_for_notify: item.statusForNotify || "",
    step_code: item.stepCode || "",
    type: item.type || "",
    work_type: item.workType || "",

    bid_name: item.bidName
      ? Array.isArray(item.bidName)
        ? item.bidName
        : [item.bidName]
      : [],

    bid_name: item.bidName
      ? Array.isArray(item.bidName)
        ? item.bidName
        : [item.bidName]
      : [],

    invest_field: item.investField
      ? (Array.isArray(item.investField)
          ? item.investField
          : [item.investField]
        )
          .flatMap((v) => (v ? v.split(/[,;]/) : []))
          .map((v) => v.trim())
      : [],

    bid_price: item.bidPrice
      ? (Array.isArray(item.bidPrice) ? item.bidPrice : [item.bidPrice]).map(
          (v) => safeNumber(v),
        )
      : [],

    locations: (item.locations || []).map((l) => ({
      prov_code: l?.provCode || "",
      prov_name: l?.provName || "",
      district_code: l?.districtCode || "",
      district_name: l?.districtName || "",
    })),
  };
}

async function saveToCassandra(item) {
  const query = `
    INSERT INTO demo.contractors (
      id, bid_close_date, bid_form, bid_id, bid_mode, bid_open_date, created_by,
      investor_code, investor_name, is_domestic, is_internet,
      notify_id, notify_no, notify_no_stand, notify_version,
      num_bidder_tech, num_clarify_req, num_petition,
      num_petition_hsmt, num_petition_kqlcnt, num_petition_lcnt,
      original_public_date, plan_no, plan_type, process_apply, public_date,
      score, status, status_for_notify, step_code, type, work_type,
      bid_name, bid_price, invest_field, locations
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    item.id,
    item.bid_close_date,
    item.bid_form,
    item.bid_id,
    item.bid_mode,
    item.bid_open_date,
    item.created_by,

    item.investor_code,
    item.investor_name,

    item.is_domestic,
    item.is_internet,

    item.notify_id,
    item.notify_no,
    item.notify_no_stand,
    item.notify_version,

    item.num_bidder_tech,
    item.num_clarify_req,
    item.num_petition,

    item.num_petition_hsmt,
    item.num_petition_kqlcnt,
    item.num_petition_lcnt,

    item.original_public_date,
    item.plan_no,
    item.plan_type,
    item.process_apply,
    item.public_date,

    item.score,
    item.status,
    item.status_for_notify,
    item.step_code,
    item.type,
    item.work_type,

    item.bid_name,
    item.bid_price,
    item.invest_field,
    item.locations,
  ];

  await client.execute(query, params, { prepare: true });
}

const url =
  "https://muasamcong.mpi.gov.vn/o/egp-portal-contractor-selection-v2/services/smart/search?token=";


let isFirstRun = true;

const INTERVAL = 5000;
let seenIds = new Set();

async function crawl() {
  console.log("FULL + REALTIME CRAWL START");

  // ================= BACKFILL =================
  console.log("BACKFILL START...");

  let page = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const payload = [
        {
          pageSize: 50,
          pageNumber: page,
          query: [
            {
              index: "es-contractor-selection",
              keyWord: "",
              matchType: "all-1",
              matchFields: ["notifyNo", "bidName"],
              filters: [
                {
                  fieldName: "type",
                  searchType: "in",
                  fieldValues: ["es-notify-contractor"],
                },
                {
                  fieldName: "caseKHKQ",
                  searchType: "not_in",
                  fieldValues: ["1"],
                },
              ],
            },
          ],
        },
      ];

      const res = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        httpsAgent: new (require("https").Agent)({
          rejectUnauthorized: false,
        }),
      });

      const items = res.data.page.content;

      if (!items || items.length === 0) {
        hasMore = false;
        break;
      }

      let count = 0;

      for (const raw of items) {
        const item = normalizeItem(raw);

        if (!item.id) continue;

        seenIds.add(item.id);
        item.bid_name = item.bid_name || [];
        item.bid_price = item.bid_price || [];
        item.invest_field = item.invest_field || [];
        item.locations = item.locations || [];

        await saveToCassandra(item);
        await elastic.indexDocument(item);

        count++;
      }

      console.log(`BACKFILL Page ${page} | ${count} items`);

      page++;

      // tránh spam API
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error("BACKFILL ERROR:", err.message);
      break;
    }
  }

  console.log("BACKFILL DONE");

 
  console.log("REALTIME START");

  while (true) {
    try {
      const payload = [
        {
          pageSize: 50,
          pageNumber: 0, 
          query: [
            {
              index: "es-contractor-selection",
              keyWord: "",
              matchType: "all-1",
              matchFields: ["notifyNo", "bidName"],
              filters: [
                {
                  fieldName: "type",
                  searchType: "in",
                  fieldValues: ["es-notify-contractor"],
                },
                {
                  fieldName: "caseKHKQ",
                  searchType: "not_in",
                  fieldValues: ["1"],
                },
              ],
            },
          ],
        },
      ];

      const res = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0",
        },
        httpsAgent: new (require("https").Agent)({
          rejectUnauthorized: false,
        }),
      });

      const items = res.data.page.content;

      let newCount = 0;

      for (const raw of items) {
        const item = normalizeItem(raw);

        if (!item.id) continue;

        
        if (seenIds.has(item.id)) continue;

        seenIds.add(item.id);

        item.bid_name = item.bid_name || [];
        item.bid_price = item.bid_price || [];
        item.invest_field = item.invest_field || [];
        item.locations = item.locations || [];

        await saveToCassandra(item);
        await elastic.indexDocument(item);

        newCount++;
      }

      console.log(`REALTIME new: ${newCount}`);
    } catch (err) {
      console.error("REALTIME ERROR:", err.message);
    }

    await new Promise((r) => setTimeout(r, INTERVAL));
  }
}

module.exports = { crawl };
