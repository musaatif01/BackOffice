const API_BASE_URL = "http://localhost:4000";
const REFRESH_INTERVAL_MS = 10000;

const PAGES = [
  { id: "overview", label: "Overview", hint: "Executive pulse" },
  { id: "orders", label: "Orders", hint: "Tickets and baskets" },
  { id: "menu", label: "Menu", hint: "Catalog and availability" },
  { id: "promotions", label: "Promotions", hint: "Offers and campaigns" },
  { id: "kiosks", label: "Kiosks", hint: "Fleet health" },
  { id: "analytics", label: "Analytics", hint: "Mix and trends" },
  { id: "settings", label: "Settings", hint: "Store configuration" }
];

const EMPTY_DATA = {
  categories: [],
  items: [],
  promotions: [],
  orders: [],
  kioskStatuses: [],
  locales: []
};

const DEMO_DATA = {
  categories: [
    { id: "chicken", name: { "en-GB": "Chicken" } },
    { id: "sides", name: { "en-GB": "Sides" } },
    { id: "drinks", name: { "en-GB": "Drinks" } },
    { id: "dessert", name: { "en-GB": "Desserts" } }
  ],
  items: [
    { id: "classic-sandwich", categoryId: "chicken", name: { "en-GB": "Classic Sandwich" }, price: 8.49, soldOut: false, tags: ["Top seller"] },
    { id: "spicy-tenders", categoryId: "chicken", name: { "en-GB": "Spicy Tenders" }, price: 9.2, soldOut: false, tags: ["Upsell"] },
    { id: "signature-wrap", categoryId: "chicken", name: { "en-GB": "Signature Wrap" }, price: 7.95, soldOut: false, tags: ["Lunch"] },
    { id: "fries-large", categoryId: "sides", name: { "en-GB": "Large Fries" }, price: 3.95, soldOut: true, tags: ["Low stock"] },
    { id: "mac-cheese", categoryId: "sides", name: { "en-GB": "Mac and Cheese" }, price: 4.25, soldOut: false, tags: ["Comfort"] },
    { id: "cola-zero", categoryId: "drinks", name: { "en-GB": "Cola Zero" }, price: 2.8, soldOut: false, tags: ["Cold"] },
    { id: "sparkling-water", categoryId: "drinks", name: { "en-GB": "Sparkling Water" }, price: 2.5, soldOut: false, tags: ["Healthy"] },
    { id: "apple-pie", categoryId: "dessert", name: { "en-GB": "Apple Pie" }, price: 3.8, soldOut: false, tags: ["Dessert"] }
  ],
  promotions: [
    {
      id: "lunch-rush",
      title: { "en-GB": "Lunch Rush Saver" },
      description: { "en-GB": "Bundle discount for the midday peak." },
      itemIds: ["classic-sandwich", "fries-large"],
      discountAmount: 2.5,
      active: true
    },
    {
      id: "dessert-push",
      title: { "en-GB": "Sweet Finish" },
      description: { "en-GB": "Add a dessert for a lower ticket boost." },
      itemIds: ["apple-pie"],
      discountAmount: 1,
      active: false
    }
  ],
  orders: [
    {
      id: "ord-1049",
      cart: { fulfillment: "takeaway", locale: "en-GB" },
      pricedCart: {
        lines: [
          { id: "ln-1", itemId: "classic-sandwich", quantity: 2, lineTotal: 16.98 },
          { id: "ln-2", itemId: "cola-zero", quantity: 1, lineTotal: 2.8 }
        ],
        subtotal: 19.78,
        discount: 2.5,
        total: 17.28
      },
      status: "submitted",
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    },
    {
      id: "ord-1048",
      cart: { fulfillment: "dine-in", locale: "en-GB" },
      pricedCart: {
        lines: [{ id: "ln-3", itemId: "spicy-tenders", quantity: 1, lineTotal: 9.2 }],
        subtotal: 9.2,
        discount: 0,
        total: 9.2
      },
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 31).toISOString()
    },
    {
      id: "ord-1047",
      cart: { fulfillment: "takeaway", locale: "en-GB" },
      pricedCart: {
        lines: [{ id: "ln-4", itemId: "mac-cheese", quantity: 2, lineTotal: 8.5 }],
        subtotal: 8.5,
        discount: 0,
        total: 8.5
      },
      status: "failed",
      createdAt: new Date(Date.now() - 1000 * 60 * 49).toISOString()
    },
    {
      id: "ord-1046",
      cart: { fulfillment: "takeaway", locale: "fr-FR" },
      pricedCart: {
        lines: [{ id: "ln-5", itemId: "signature-wrap", quantity: 1, lineTotal: 7.95 }],
        subtotal: 7.95,
        discount: 0,
        total: 7.95
      },
      status: "submitted",
      createdAt: new Date(Date.now() - 1000 * 60 * 62).toISOString()
    }
  ],
  kioskStatuses: [
    { kioskId: "kiosk-01", health: "healthy", lastHeartbeat: new Date(Date.now() - 1000 * 30).toISOString(), activeLocale: "en-GB" },
    { kioskId: "kiosk-02", health: "warning", lastHeartbeat: new Date(Date.now() - 1000 * 90).toISOString(), activeLocale: "en-GB" },
    { kioskId: "kiosk-03", health: "offline", lastHeartbeat: new Date(Date.now() - 1000 * 60 * 12).toISOString(), activeLocale: "fr-FR" }
  ],
  locales: [
    { code: "en-GB", label: "English (UK)" },
    { code: "fr-FR", label: "French (France)" }
  ]
};

const state = {
  page: "overview",
  mode: "live",
  demo: structuredClone(DEMO_DATA),
  live: { ...EMPTY_DATA },
  lastUpdated: null,
  error: null,
  loading: false
};

const app = document.querySelector("#app");

function currency(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2
  }).format(Number(value ?? 0));
}

function dateTime(value) {
  if (!value) return "No timestamp";
  return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function time(value) {
  if (!value) return "No time";
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function titleCase(value) {
  return String(value ?? "").replace(/-/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toneForHealth(health) {
  if (health === "healthy") return "good";
  if (health === "warning") return "warn";
  return "bad";
}

function toneForOrder(status) {
  if (status === "submitted") return "good";
  if (status === "pending") return "warn";
  return "bad";
}

function getItemName(items, itemId) {
  return items.find((item) => item.id === itemId)?.name?.["en-GB"] ?? itemId;
}

function getCategoryName(categories, categoryId) {
  return categories.find((category) => category.id === categoryId)?.name?.["en-GB"] ?? titleCase(categoryId);
}

function getCurrentData() {
  return state.mode === "demo" ? state.demo : state.live;
}

function updateCurrentData(updater) {
  if (state.mode === "demo") {
    state.demo = updater(structuredClone(state.demo));
    return;
  }

  state.live = updater(structuredClone(state.live));
}

function productOptions(item) {
  return item.options ?? [];
}

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildAnalytics(data) {
  const items = data.items ?? [];
  const categories = data.categories ?? [];
  const promotions = data.promotions ?? [];
  const orders = [...(data.orders ?? [])].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  const kioskStatuses = data.kioskStatuses ?? [];
  const locales = data.locales ?? [];
  const submittedOrders = orders.filter((order) => order.status === "submitted");
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const failedOrders = orders.filter((order) => order.status === "failed");
  const activePromotions = promotions.filter((promotion) => promotion.active);
  const soldOutItems = items.filter((item) => item.soldOut);
  const healthyKiosks = kioskStatuses.filter((status) => status.health === "healthy");
  const warningKiosks = kioskStatuses.filter((status) => status.health === "warning");
  const offlineKiosks = kioskStatuses.filter((status) => status.health === "offline");
  const totalRevenue = submittedOrders.reduce((sum, order) => sum + Number(order.pricedCart?.total ?? 0), 0);
  const averageOrderValue = submittedOrders.length ? totalRevenue / submittedOrders.length : 0;
  const fulfillmentMix = orders.reduce((acc, order) => {
    const key = order.cart?.fulfillment ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const localeMix = orders.reduce((acc, order) => {
    const key = order.cart?.locale ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const topCategories = categories.map((category) => {
    const categoryItems = items.filter((item) => item.categoryId === category.id);
    return {
      id: category.id,
      name: category.name?.["en-GB"] ?? titleCase(category.id),
      items: categoryItems.length,
      soldOut: categoryItems.filter((item) => item.soldOut).length
    };
  }).sort((left, right) => right.items - left.items);

  return {
    items,
    categories,
    promotions,
    orders,
    kioskStatuses,
    locales,
    submittedOrders,
    pendingOrders,
    failedOrders,
    activePromotions,
    soldOutItems,
    healthyKiosks,
    warningKiosks,
    offlineKiosks,
    totalRevenue,
    averageOrderValue,
    fulfillmentMix,
    localeMix,
    topCategories,
    newestOrder: orders[0] ?? null
  };
}

function isLiveEmpty(data) {
  return !data.categories?.length && !data.items?.length && !data.promotions?.length && !data.orders?.length && !data.kioskStatuses?.length;
}

function emptyBlock(title, description) {
  return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p></div>`;
}

function badge(text, tone = "neutral") {
  return `<span class="tag ${tone}">${escapeHtml(text)}</span>`;
}

function lineMetric(label, count, total) {
  const percent = total ? Math.round((count / total) * 100) : 0;
  return `
    <div class="metric-line">
      <div class="lane-row">
        <div><strong>${escapeHtml(label)}</strong><span>${count} records</span></div>
        <strong>${percent}%</strong>
      </div>
      <div class="lane-bar"><div class="lane-fill" style="width:${percent}%"></div></div>
    </div>
  `;
}

function pageCounter(pageId, analytics) {
  switch (pageId) {
    case "orders": return analytics.orders.length;
    case "menu": return analytics.items.length;
    case "promotions": return analytics.activePromotions.length;
    case "kiosks": return analytics.kioskStatuses.length;
    case "analytics": return Object.keys(analytics.fulfillmentMix).length;
    case "settings": return analytics.locales.length;
    default: return analytics.submittedOrders.length;
  }
}

function navMarkup(analytics) {
  return PAGES.map((page) => `
    <button class="nav-chip nav-button ${state.page === page.id ? "is-active" : ""}" data-nav="${page.id}">
      <div>
        <strong>${page.label}</strong>
        <div class="small-label">${page.hint}</div>
      </div>
      <span>${pageCounter(page.id, analytics)}</span>
    </button>
  `).join("");
}

function renderOverview(analytics) {
  const signalTone = analytics.offlineKiosks.length ? "bad" : analytics.warningKiosks.length ? "warn" : "good";
  return `
    <section class="hero">
      <div class="hero-copy">
        <div class="story-pills">
          <span class="pill">${state.mode === "live" ? "Live mode" : "Demo mode"}</span>
          ${badge(state.mode === "live" ? "Using live backend" : "Using fake demo data", state.mode === "live" ? "good" : "warn")}
        </div>
        <div>
          <p class="eyebrow">Backoffice overview</p>
          <h2>Run kiosks like a modern restaurant ops team.</h2>
        </div>
        <p class="muted">${
          state.mode === "live"
            ? state.error ?? "Live mode only shows real backend data. If the backend is empty, the backoffice stays empty."
            : "Demo mode is intentionally populated with fake examples so the full backoffice can be explored."
        }</p>
        <div class="toolbar">
          <div class="toast-line"><span class="dot"></span>Last synced ${state.lastUpdated ? dateTime(state.lastUpdated) : "Waiting for first sync"}</div>
          <div class="toolbar-actions">
            <button class="button secondary" data-action="switch-live">Live mode</button>
            <button class="button secondary" data-action="switch-demo">Demo mode</button>
            <button class="button primary" data-action="refresh-live">${state.loading ? "Refreshing..." : "Refresh live data"}</button>
          </div>
        </div>
        <div class="hero-grid">
          <div class="hero-stat">
            <span class="small-label">Gross revenue</span>
            <strong>${currency(analytics.totalRevenue)}</strong>
            <span class="metric-trend ${analytics.submittedOrders.length ? "good" : "neutral"}">${analytics.submittedOrders.length} submitted orders</span>
          </div>
          <div class="hero-stat">
            <span class="small-label">Average ticket</span>
            <strong>${currency(analytics.averageOrderValue)}</strong>
            <span class="metric-trend neutral">Based on submitted orders only</span>
          </div>
        </div>
      </div>
      <div class="hero-side">
        <article class="story-card">
          <div class="panel-title">
            <div><div class="panel-kicker">Fleet posture</div><h3>Kiosk health</h3></div>
            <strong class="${signalTone}">${analytics.healthyKiosks.length}/${analytics.kioskStatuses.length || 0}</strong>
          </div>
          <div class="story-number">${analytics.healthyKiosks.length}</div>
          <p class="muted">Healthy kiosks currently reporting in.</p>
          <div class="story-pills">
            ${badge(`${analytics.healthyKiosks.length} healthy`, "good")}
            ${badge(`${analytics.warningKiosks.length} warning`, "warn")}
            ${badge(`${analytics.offlineKiosks.length} offline`, "bad")}
          </div>
        </article>
        <article class="story-card">
          <div class="panel-title">
            <div><div class="panel-kicker">Menu coverage</div><h3>Availability watch</h3></div>
            <strong class="${analytics.soldOutItems.length ? "warn" : "good"}">${analytics.soldOutItems.length}</strong>
          </div>
          <p class="muted">Items currently unavailable right now.</p>
          <div class="story-pills">
            ${analytics.topCategories.length
              ? analytics.topCategories.slice(0, 3).map((category) => badge(`${category.name}: ${category.soldOut}/${category.items}`)).join("")
              : badge("No category data")}
          </div>
        </article>
      </div>
    </section>

    <section class="metrics-grid">
      <article class="metric-card">
        <div class="metric-top"><div class="metric-meta"><span class="kpi-label">Order queue</span><strong class="metric-value">${analytics.pendingOrders.length + analytics.failedOrders.length}</strong></div>${badge("Needs review", analytics.failedOrders.length ? "bad" : analytics.pendingOrders.length ? "warn" : "good")}</div>
        <span class="metric-trend neutral">${analytics.pendingOrders.length} pending, ${analytics.failedOrders.length} failed</span>
      </article>
      <article class="metric-card">
        <div class="metric-top"><div class="metric-meta"><span class="kpi-label">Menu breadth</span><strong class="metric-value">${analytics.categories.length}</strong></div>${badge("Categories")}</div>
        <span class="metric-trend neutral">${analytics.items.length} live items in catalog</span>
      </article>
      <article class="metric-card">
        <div class="metric-top"><div class="metric-meta"><span class="kpi-label">Campaigns running</span><strong class="metric-value">${analytics.activePromotions.length}</strong></div>${badge("Promo engine", analytics.activePromotions.length ? "good" : "neutral")}</div>
        <span class="metric-trend neutral">${analytics.promotions.length} total promotions</span>
      </article>
      <article class="metric-card">
        <div class="metric-top"><div class="metric-meta"><span class="kpi-label">Locales</span><strong class="metric-value">${analytics.locales.length}</strong></div>${badge("Configuration")}</div>
        <span class="metric-trend neutral">Available kiosk languages</span>
      </article>
    </section>

    <section class="content-grid">
      <section class="panel">
        <div class="panel-title"><div><div class="panel-kicker">Recent tickets</div><h3>Order stream</h3></div><strong>${analytics.orders.length}</strong></div>
        <div class="stack-list">
          ${analytics.orders.length
            ? analytics.orders.slice(0, 6).map((order) => `
              <div class="list-row">
                <div class="list-copy">
                  <strong>${escapeHtml(order.id.toUpperCase())}</strong>
                  <span>${escapeHtml(dateTime(order.createdAt))} | ${escapeHtml(titleCase(order.cart?.fulfillment ?? "unknown"))}</span>
                </div>
                <div class="lane-badges">
                  ${badge(order.status, toneForOrder(order.status))}
                  <strong>${currency(order.pricedCart?.total)}</strong>
                </div>
              </div>
            `).join("")
            : emptyBlock("No live orders yet", "This panel stays empty in live mode until the backend returns real orders.")}
        </div>
      </section>
      <section class="panel">
        <div class="panel-title"><div><div class="panel-kicker">Campaign spotlight</div><h3>Promotions</h3></div><strong>${analytics.activePromotions.length}</strong></div>
        <div class="stack-list">
          ${analytics.promotions.length
            ? analytics.promotions.map((promotion) => `
              <div class="list-card">
                <div class="panel-title">
                  <div><strong>${escapeHtml(promotion.title?.["en-GB"] ?? promotion.id)}</strong><span>${escapeHtml(promotion.description?.["en-GB"] ?? "No description")}</span></div>
                  ${badge(promotion.active ? "Active" : "Inactive", promotion.active ? "good" : "neutral")}
                </div>
                <div class="lane-badges">
                  ${badge(currency(promotion.discountAmount), "warn")}
                  ${(promotion.itemIds ?? []).slice(0, 2).map((itemId) => badge(getItemName(analytics.items, itemId))).join("")}
                </div>
              </div>
            `).join("")
            : emptyBlock("No promotions available", "Live mode shows no fake campaigns. Switch to demo mode to preview this page fully.")}
        </div>
      </section>
    </section>
  `;
}

function renderOrders(analytics) {
  return `
    <section class="panel page-panel">
      <div class="panel-title"><div><div class="panel-kicker">Order management</div><h3>All tickets</h3></div><div class="lane-badges">${badge(`${analytics.submittedOrders.length} submitted`, "good")}${badge(`${analytics.pendingOrders.length} pending`, analytics.pendingOrders.length ? "warn" : "neutral")}${badge(`${analytics.failedOrders.length} failed`, analytics.failedOrders.length ? "bad" : "neutral")}</div></div>
      ${analytics.orders.length ? `
        <div class="table-shell">
          <table class="data-table">
            <thead><tr><th>Order</th><th>Time</th><th>Fulfillment</th><th>Locale</th><th>Status</th><th>Total</th></tr></thead>
            <tbody>
              ${analytics.orders.map((order) => `
                <tr>
                  <td><strong>${escapeHtml(order.id.toUpperCase())}</strong></td>
                  <td>${escapeHtml(dateTime(order.createdAt))}</td>
                  <td>${escapeHtml(titleCase(order.cart?.fulfillment ?? "unknown"))}</td>
                  <td>${escapeHtml(order.cart?.locale ?? "unknown")}</td>
                  <td>${badge(order.status, toneForOrder(order.status))}</td>
                  <td>${currency(order.pricedCart?.total)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : emptyBlock("No live orders", "Order history will appear here as soon as the backend starts returning tickets.")}
    </section>

    <section class="content-grid narrow-grid">
      <section class="panel">
        <div class="panel-title"><div><div class="panel-kicker">Receipt preview</div><h3>Latest order</h3></div></div>
        ${analytics.newestOrder ? `
          <div class="receipt-card compact-card">
            <div class="receipt-header">
              <div class="receipt-meta">
                <h4>${escapeHtml(analytics.newestOrder.id.toUpperCase())}</h4>
                <p class="muted">${escapeHtml(time(analytics.newestOrder.createdAt))} | ${escapeHtml(titleCase(analytics.newestOrder.cart?.fulfillment ?? "unknown"))}</p>
              </div>
              <div class="receipt-tags">${badge(analytics.newestOrder.status, toneForOrder(analytics.newestOrder.status))}</div>
            </div>
            <div class="receipt-lines">
              ${analytics.newestOrder.pricedCart.lines.map((line) => `
                <div class="receipt-row"><span>${line.quantity} x ${escapeHtml(getItemName(analytics.items, line.itemId))}</span><strong>${currency(line.lineTotal)}</strong></div>
              `).join("")}
            </div>
          </div>
        ` : emptyBlock("No receipt yet", "There is no latest live order to preview right now.")}
      </section>
      <section class="panel">
        <div class="panel-title"><div><div class="panel-kicker">Channel mix</div><h3>Fulfillment split</h3></div></div>
        ${Object.keys(analytics.fulfillmentMix).length
          ? Object.entries(analytics.fulfillmentMix).map(([channel, count]) => lineMetric(titleCase(channel), count, analytics.orders.length)).join("")
          : emptyBlock("No fulfillment mix yet", "When live orders arrive, the channel split will appear here.")}
      </section>
    </section>
  `;
}

function renderMenu(analytics) {
  return `
    <section class="panel page-panel">
      <div class="panel-title"><div><div class="panel-kicker">Catalog</div><h3>Menu library</h3></div><div class="lane-badges">${badge(`${analytics.categories.length} categories`)}${badge(`${analytics.items.length} items`)}${badge(`${analytics.soldOutItems.length} sold out`, analytics.soldOutItems.length ? "warn" : "good")}</div></div>
      <div class="content-grid narrow-grid">
        <form class="editor-card" data-form="add-product">
          <div>
            <div class="panel-kicker">Create product</div>
            <h3>Add a new menu item</h3>
          </div>
          <label class="field">
            <span>Name</span>
            <input name="name" type="text" placeholder="Chicken Deluxe" required />
          </label>
          <label class="field">
            <span>Category</span>
            <select name="categoryId" required>
              <option value="">Select category</option>
              ${analytics.categories.map((category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name?.["en-GB"] ?? category.id)}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>Price</span>
            <input name="price" type="number" min="0" step="0.01" placeholder="9.99" required />
          </label>
          <label class="field checkbox-field">
            <input name="soldOut" type="checkbox" />
            <span>Start as sold out</span>
          </label>
          <button class="button primary" type="submit">Add product</button>
        </form>

        <form class="editor-card" data-form="add-option">
          <div>
            <div class="panel-kicker">Attach option</div>
            <h3>Add an option to a product</h3>
          </div>
          <label class="field">
            <span>Product</span>
            <select name="itemId" required>
              <option value="">Select product</option>
              ${analytics.items.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name?.["en-GB"] ?? item.id)}</option>`).join("")}
            </select>
          </label>
          <label class="field">
            <span>Option name</span>
            <input name="optionName" type="text" placeholder="Extra Cheese" required />
          </label>
          <label class="field">
            <span>Price delta</span>
            <input name="priceDelta" type="number" min="0" step="0.01" placeholder="1.50" required />
          </label>
          <button class="button primary" type="submit">Add option</button>
        </form>
      </div>
      ${analytics.items.length ? `
        <div class="card-grid">
          ${analytics.items.map((item) => `
            <article class="menu-card">
              <div class="panel-title">
                <div><strong>${escapeHtml(item.name?.["en-GB"] ?? item.id)}</strong><span>${escapeHtml(getCategoryName(analytics.categories, item.categoryId))}</span></div>
                ${badge(item.soldOut ? "Sold out" : "Available", item.soldOut ? "bad" : "good")}
              </div>
              <div class="lane-badges">
                ${badge(currency(item.price))}
                ${(item.tags ?? []).map((tag) => badge(tag)).join("")}
              </div>
              ${productOptions(item).length ? `
                <div class="option-list">
                  ${productOptions(item).map((option) => `
                    <div class="option-row">
                      <span>${escapeHtml(option.name)}</span>
                      <strong>+${currency(option.priceDelta)}</strong>
                    </div>
                  `).join("")}
                </div>
              ` : `<div class="inline-note">No options added yet.</div>`}
            </article>
          `).join("")}
        </div>
      ` : emptyBlock("No live menu items", "This page intentionally shows nothing in live mode until the backend sends real menu data.")}
    </section>

    <section class="content-grid narrow-grid">
      <section class="panel">
        <div class="panel-title"><div><div class="panel-kicker">Category view</div><h3>Category coverage</h3></div></div>
        ${analytics.topCategories.length
          ? analytics.topCategories.map((category) => `
            <div class="list-row">
              <div class="list-copy"><strong>${escapeHtml(category.name)}</strong><span>${category.items} items</span></div>
              <div class="lane-badges">${badge(`${category.soldOut} sold out`, category.soldOut ? "warn" : "good")}</div>
            </div>
          `).join("")
          : emptyBlock("No categories configured", "Category coverage will appear here when live data exists.")}
      </section>
      <section class="panel">
        <div class="panel-title"><div><div class="panel-kicker">Availability focus</div><h3>Recovery queue</h3></div></div>
        ${analytics.soldOutItems.length
          ? analytics.soldOutItems.map((item) => `
            <div class="list-row">
              <div class="list-copy"><strong>${escapeHtml(item.name?.["en-GB"] ?? item.id)}</strong><span>${escapeHtml(getCategoryName(analytics.categories, item.categoryId))}</span></div>
              ${badge("Sold out", "bad")}
            </div>
          `).join("")
          : emptyBlock("Nothing blocked", "No sold-out items are currently reported by the live backend.")}
      </section>
    </section>
  `;
}

function renderPromotions(analytics) {
  return `
    <section class="panel page-panel">
      <div class="panel-title"><div><div class="panel-kicker">Campaign management</div><h3>Promotions</h3></div><div class="lane-badges">${badge(`${analytics.promotions.length} total`)}${badge(`${analytics.activePromotions.length} active`, analytics.activePromotions.length ? "good" : "neutral")}</div></div>
      ${analytics.promotions.length ? `
        <div class="card-grid">
          ${analytics.promotions.map((promotion) => `
            <article class="list-card">
              <div class="panel-title">
                <div><strong>${escapeHtml(promotion.title?.["en-GB"] ?? promotion.id)}</strong><span>${escapeHtml(promotion.description?.["en-GB"] ?? "No description")}</span></div>
                ${badge(promotion.active ? "Active" : "Inactive", promotion.active ? "good" : "neutral")}
              </div>
              <div class="lane-badges">
                ${badge(currency(promotion.discountAmount), "warn")}
                ${(promotion.itemIds ?? []).map((itemId) => badge(getItemName(analytics.items, itemId))).join("")}
              </div>
            </article>
          `).join("")}
        </div>
      ` : emptyBlock("No live promotions", "Switch to demo mode if you want to inspect a populated campaign page right now.")}
    </section>
  `;
}

function renderKiosks(analytics) {
  return `
    <section class="panel page-panel">
      <div class="panel-title"><div><div class="panel-kicker">Fleet management</div><h3>Kiosk health board</h3></div><div class="lane-badges">${badge(`${analytics.healthyKiosks.length} healthy`, "good")}${badge(`${analytics.warningKiosks.length} warning`, analytics.warningKiosks.length ? "warn" : "neutral")}${badge(`${analytics.offlineKiosks.length} offline`, analytics.offlineKiosks.length ? "bad" : "neutral")}</div></div>
      ${analytics.kioskStatuses.length ? `
        <div class="stack-list">
          ${analytics.kioskStatuses.map((status) => `
            <div class="list-row">
              <div class="list-copy">
                <strong>${escapeHtml(status.kioskId.toUpperCase())}</strong>
                <span>Heartbeat ${escapeHtml(dateTime(status.lastHeartbeat))}</span>
              </div>
              <div class="lane-badges">
                ${badge(status.activeLocale)}
                ${badge(status.health, toneForHealth(status.health))}
              </div>
            </div>
          `).join("")}
        </div>
      ` : emptyBlock("No kiosk telemetry", "Live mode does not fake fleet data. Kiosk telemetry appears only when the backend sends it.")}
    </section>
  `;
}

function renderAnalytics(analytics) {
  return `
    <section class="content-grid narrow-grid">
      <section class="panel page-panel">
        <div class="panel-title"><div><div class="panel-kicker">Operational mix</div><h3>Fulfillment breakdown</h3></div></div>
        ${Object.keys(analytics.fulfillmentMix).length
          ? Object.entries(analytics.fulfillmentMix).map(([channel, count]) => lineMetric(titleCase(channel), count, analytics.orders.length)).join("")
          : emptyBlock("No order-channel data", "Once live orders exist, this split will populate automatically.")}
      </section>
      <section class="panel page-panel">
        <div class="panel-title"><div><div class="panel-kicker">Language usage</div><h3>Locale breakdown</h3></div></div>
        ${Object.keys(analytics.localeMix).length
          ? Object.entries(analytics.localeMix).map(([locale, count]) => lineMetric(locale, count, analytics.orders.length)).join("")
          : emptyBlock("No locale data", "Locale mix depends on real orders flowing through the backend.")}
      </section>
    </section>
  `;
}

function renderSettings(analytics) {
  return `
    <section class="content-grid narrow-grid">
      <section class="panel page-panel">
        <div class="panel-title"><div><div class="panel-kicker">Configuration</div><h3>Locales</h3></div></div>
        ${analytics.locales.length
          ? analytics.locales.map((locale) => `
            <div class="list-row">
              <div class="list-copy"><strong>${escapeHtml(locale.code)}</strong><span>${escapeHtml(locale.label ?? "Configured locale")}</span></div>
              ${badge("Enabled", "good")}
            </div>
          `).join("")
          : emptyBlock("No locale configuration", "If the backend exposes locales, they will appear here.")}
      </section>
      <section class="panel page-panel">
        <div class="panel-title"><div><div class="panel-kicker">Data source</div><h3>Mode controls</h3></div></div>
        <div class="stack-list">
          <div class="list-card">
            <strong>Live mode</strong>
            <p class="muted">Shows only real backend responses. Empty backend means empty pages.</p>
            <button class="button secondary" data-action="switch-live">Use live mode</button>
          </div>
          <div class="list-card">
            <strong>Demo mode</strong>
            <p class="muted">Loads fake sample data so the full backoffice can be previewed without services running.</p>
            <button class="button secondary" data-action="switch-demo">Use demo mode</button>
          </div>
        </div>
      </section>
    </section>
  `;
}

function renderPage(analytics) {
  switch (state.page) {
    case "orders": return renderOrders(analytics);
    case "menu": return renderMenu(analytics);
    case "promotions": return renderPromotions(analytics);
    case "kiosks": return renderKiosks(analytics);
    case "analytics": return renderAnalytics(analytics);
    case "settings": return renderSettings(analytics);
    default: return renderOverview(analytics);
  }
}

function renderApp() {
  const data = getCurrentData();
  const analytics = buildAnalytics(data);
  const usingLive = state.mode === "live";
  const liveIsEmpty = usingLive && isLiveEmpty(state.live);

  app.innerHTML = `
    <div class="shell">
      <div class="layout">
        <aside class="rail">
          <section class="brand">
            <div class="brand-badge">BO</div>
            <div>
              <p class="eyebrow">Toast-inspired backoffice</p>
              <h1>Backoffice suite</h1>
            </div>
            <p class="muted">Multi-page admin for orders, menu, promotions, kiosks, analytics, and settings.</p>
          </section>

          <section class="nav-group">
            ${navMarkup(analytics)}
          </section>

          <section class="rail-section">
            <p class="eyebrow">Data source</p>
            <div class="nav-chip">
              <div><strong>${usingLive ? "Live backend" : "Demo dataset"}</strong><div class="small-label">${usingLive ? "Real API only" : "Fake sample data"}</div></div>
              ${badge(usingLive ? "Live" : "Demo", usingLive ? "good" : "warn")}
            </div>
            <div class="nav-chip">
              <div><strong>Last sync</strong><div class="small-label">${state.lastUpdated ? dateTime(state.lastUpdated) : "No sync yet"}</div></div>
              <span>${state.loading ? "..." : "Ready"}</span>
            </div>
          </section>

          <section class="rail-callout">
            <p class="eyebrow">Current behavior</p>
            <strong>${usingLive ? "Live mode stays truthful." : "Demo mode stays illustrative."}</strong>
            <p class="muted">${usingLive ? "When the backend has no data, the pages stay empty instead of inventing numbers." : "Every populated card you see in demo mode is intentionally fake sample data."}</p>
          </section>
        </aside>

        <main class="main">
          ${state.error ? `<section class="banner error-banner"><strong>Live data note</strong><p>${escapeHtml(state.error)}</p></section>` : ""}
          ${liveIsEmpty ? `<section class="banner info-banner"><strong>Live backend is connected but empty</strong><p>No real categories, items, promotions, orders, or kiosk statuses are available right now.</p></section>` : ""}
          ${renderPage(analytics)}
        </main>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      state.page = button.getAttribute("data-nav");
      renderApp();
    });
  });

  document.querySelectorAll("[data-action='switch-demo']").forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = "demo";
      renderApp();
    });
  });

  document.querySelectorAll("[data-action='switch-live']").forEach((button) => {
    button.addEventListener("click", () => {
      state.mode = "live";
      renderApp();
    });
  });

  document.querySelectorAll("[data-action='refresh-live']").forEach((button) => {
    button.addEventListener("click", () => {
      void loadLiveData(true);
    });
  });

  document.querySelector("[data-form='add-product']")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const categoryId = String(form.get("categoryId") ?? "").trim();
    const price = Number(form.get("price") ?? 0);
    const soldOut = form.get("soldOut") === "on";

    if (!name || !categoryId || Number.isNaN(price)) {
      return;
    }

    updateCurrentData((data) => {
      data.items = [
        ...data.items,
        {
          id: createId("item"),
          categoryId,
          name: { "en-GB": name },
          price,
          soldOut,
          tags: ["Custom"],
          options: []
        }
      ];
      return data;
    });

    event.currentTarget.reset();
    renderApp();
  });

  document.querySelector("[data-form='add-option']")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const itemId = String(form.get("itemId") ?? "").trim();
    const optionName = String(form.get("optionName") ?? "").trim();
    const priceDelta = Number(form.get("priceDelta") ?? 0);

    if (!itemId || !optionName || Number.isNaN(priceDelta)) {
      return;
    }

    updateCurrentData((data) => {
      data.items = data.items.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        return {
          ...item,
          options: [
            ...productOptions(item),
            {
              id: createId("opt"),
              name: optionName,
              priceDelta
            }
          ]
        };
      });
      return data;
    });

    event.currentTarget.reset();
    renderApp();
  });
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`);
  }
  return response.json();
}

async function loadLiveData(showErrors = false) {
  state.loading = true;
  renderApp();

  const results = await Promise.allSettled([
    fetchJson("/admin/dashboard"),
    fetchJson("/admin/promotions"),
    fetchJson("/admin/locales")
  ]);

  const dashboardResult = results[0];
  const promotionsResult = results[1];
  const localesResult = results[2];

  state.loading = false;
  state.lastUpdated = new Date().toISOString();

  if (dashboardResult.status === "fulfilled") {
    state.live = {
      categories: dashboardResult.value.categories ?? [],
      items: dashboardResult.value.items ?? [],
      promotions: promotionsResult.status === "fulfilled" ? promotionsResult.value ?? [] : dashboardResult.value.promotions ?? [],
      orders: dashboardResult.value.orders ?? [],
      kioskStatuses: dashboardResult.value.kioskStatuses ?? [],
      locales: localesResult.status === "fulfilled" ? localesResult.value ?? [] : []
    };
    state.error = null;
  } else {
    state.live = { ...EMPTY_DATA };
    state.error = showErrors
      ? `Live refresh failed. ${dashboardResult.reason instanceof Error ? dashboardResult.reason.message : "Backend unavailable."}`
      : "Live backend unavailable. Switch to demo mode to preview populated pages.";
  }

  renderApp();
}

renderApp();
void loadLiveData(false);
window.setInterval(() => {
  void loadLiveData(false);
}, REFRESH_INTERVAL_MS);
