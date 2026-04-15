const { Client } = require("@elastic/elasticsearch");

const es = new Client({
  node: "http://localhost:9200",
});

const INDEX = "contractors";

// ================= INIT INDEX =================
async function initIndex() {
  const exists = await es.indices.exists({ index: INDEX });

  if (!exists.body) {
    await es.indices.create({
      index: INDEX,
      body: {
        mappings: {
          properties: {
            id: { type: "keyword" },

            bid_close_date: {
              type: "date",
              format: "strict_date_optional_time||epoch_millis",
            },
            bid_form: { type: "keyword" },
            bid_id: { type: "keyword" },
            bid_mode: { type: "keyword" },
            bid_open_date: {
              type: "date",
              format: "strict_date_optional_time||epoch_millis",
            },
            created_by: { type: "keyword" },

            investor_code: { type: "keyword" },
            investor_name: { type: "text" },

            is_domestic: { type: "integer" },
            is_internet: { type: "integer" },

            notify_id: { type: "keyword" },
            notify_no: { type: "keyword" },
            notify_no_stand: { type: "keyword" },
            notify_version: { type: "keyword" },

            num_bidder_tech: { type: "integer" },
            num_clarify_req: { type: "integer" },
            num_petition: { type: "integer" },
            num_petition_hsmt: { type: "integer" },
            num_petition_kqlcnt: { type: "integer" },
            num_petition_lcnt: { type: "integer" },

            original_public_date: {
              type: "date",
              format: "strict_date_optional_time||epoch_millis",
            },
            plan_no: { type: "keyword" },
            plan_type: { type: "keyword" },
            process_apply: { type: "keyword" },
            public_date: {
              type: "date",
              format: "strict_date_optional_time||epoch_millis",
            },

            score: { type: "keyword" },
            status: { type: "keyword" },
            status_for_notify: { type: "keyword" },
            step_code: { type: "keyword" },
            type: { type: "keyword" },
            work_type: { type: "keyword" },

            bid_name: { type: "text" },
            invest_field: { type: "keyword" },
            bid_price: { type: "double" },

            locations: {
              type: "nested",
              properties: {
                prov_code: { type: "keyword" },
                prov_name: { type: "text" },
                district_code: { type: "keyword" },
                district_name: { type: "text" },
              },
            },
          },
        },
      },
    });
  }

  console.log("Index created FULL");
}

// ================= NORMALIZE =================
function normalizeItem(item) {
  return {
    id: item.id || "",

    bid_name: item.bidName
      ? Array.isArray(item.bidName)
        ? item.bidName
        : [item.bidName]
      : [],

    investor_name: item.investorName || "",

    invest_field: item.investField
      ? (Array.isArray(item.investField)
          ? item.investField
          : [item.investField]
        )
          .flatMap((v) => v.split(/[,;]/))
          .map((v) => v.trim())
          .filter((v) => v)
      : [],

    // ✅ FIX NaN
    bid_price: item.bidPrice
      ? (Array.isArray(item.bidPrice) ? item.bidPrice : [item.bidPrice])
          .map((v) => Number(v))
          .filter((v) => !isNaN(v))
      : [],

    locations: (item.locations || []).map((l) => ({
      provCode: l.provCode || "",
      prov_name: l.provName || "",
    })),

    // ✅ KEEP ORIGINAL ISO STRING (ES hiểu được rồi)
    bid_close_date: item.bidCloseDate || null,
    public_date: item.publicDate || null,
  };
}

// ================= INDEX DOCUMENT =================
async function indexDocument(item) {
  try {
    await es.index({
      index: INDEX,
      id: item.id,
      body: {
        ...item,
        bid_price: item.bid_price || [],
        locations: item.locations || [],
      },
    });
  } catch (err) {
    console.error("ES index error:", err.meta?.body?.error || err.message);
  }
}

// ================= SEARCH =================
async function search(
  keyword = "",
  provinces = [],
  minPrice = "",
  investField = "",
) {
  const must = [];
  if (keyword) {
    must.push({
      multi_match: {
        query: keyword,
        fields: ["bid_name", "investor_name"],
        fuzziness: "AUTO",
      },
    });
  }
  if (provinces.length > 0) {
    must.push({
      nested: {
        path: "locations",
        query: {
          bool: {
            should: provinces.map((p) => ({
              term: { "locations.prov_code": p },
            })),
          },
        },
      },
    });
  }
  if (minPrice && !isNaN(Number(minPrice))) {
    must.push({
      range: {
        bid_price: {
          gte: Number(minPrice),
        },
      },
    });
  }
  if (investField) {
    const fieldsArray = investField.split(",");
    must.push({
      terms: {
        invest_field: fieldsArray,
      },
    });
  }

  const result = await es.search({
    index: INDEX,
    size: 1000,
    body: {
      query: {
        bool: { must },
      },
    },
  });

  return result.body.hits.hits.map((h) => h._source);
}

// ================= EXPORT =================
module.exports = {
  initIndex,
  indexDocument,
  search,
};
