const API_BASE_URL = "http://localhost:4000";
const REFRESH_INTERVAL_MS = 10000;

const fallbackData = {
  categories: [
    { id: "chicken", name: { "en-GB": "Chicken" } },
    { id: "sides", name: { "en-GB": "Sides" } },
    { id: "drinks", name: { "en-GB": "Drinks" } }
  ],
  items: [
    { id: "classic-sandwich", categoryId: "chicken", name: { "en-GB": "Classic Sandwich" }, price: 8.49, soldOut: false },
    { id: "spicy-tenders", categoryId: "chicken", name: { "en-GB": "Spicy Tenders" }, price: 9.2, soldOut: false },
    { id: "fries-large", categoryId: "sides", name: { "en-GB": "Large Fries" }, price: 3.95, soldOut: true },
    { id: "mac-cheese", categoryId: "sides", name: { "en-GB": "Mac and Cheese" }, price: 4.25, soldOut: false },
    { id: "cola-zero", categoryId: "drinks", name: { "en-GB": "Cola Zero" }, price: 2.8, soldOut: false }
  ],
  promotions: [
    {
      id: "lunch-rush",
      title: { "en-GB": "Lunch Rush Saver" },
      description: { "en-GB": "Bundle discount for the midday peak." },
      itemIds: ["classic-sandwich", "fries-large"],
      discountAmount: 2.5,
      active: true
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
    }
  ],
  kioskStatuses: [
    { kioskId: "kiosk-01", health: "healthy", lastHeartbeat: new Date(Date.now() - 1000 * 30).toISOString(), activeLocale: "en-GB" },
    { kioskId: "kiosk-02", health: "warning", lastHeartbeat: new Date(Date.now() - 1000 * 90).toISOString(), activeLocale: "en-GB" },
    { kioskId: "kiosk-03", health: "offline", lastHeartbeat: new Date(Date.now() - 1000 * 60 * 12).toISOString(), activeLocale: "fr-FR" }
  ]
};

const app = document.querySelector("#app");

function currency(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2
  }).format(value);
}

function dateTime(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function time(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function titleCase(value) {
  return String(value).replace(/-/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
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

function getCategoryName(categories, categoryId) {
  return categories.find((category) => category.id === categoryId)?.name?.["en-GB"] ?? titleCase(categoryId);
}

function getItemName(items, itemId) {
  return items.find((item) => item.id === itemId)?.name?.["en-GB"] ?? itemId;
}

function buildAnalytics(data) {
  const items = data.items ?? [];
  const categories = data.categories ?? [];
  const promotions = data.promotions ?? [];
  const orders = [...(data.orders ?? [])].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  const kioskStatuses = data.kioskStatuses ?? [];

  const submittedOrders = orders.filter((order) => order.status === "submitted");
  const pendingOrders = orders.filter((order) => order.status === "pending");
  const failedOrders = orders.filter((order) => order.status === "failed");
  const soldOutItems = items.filter((item) => item.soldOut);
  const activePromotions = promotions.filter((promo) => promo.active);
  const healthyKiosks = kioskStatuses.filter((status) => status.health === "healthy");
  const warningKiosks = kioskStatuses.filter((status) => status.health === "warning");
  const offlineKiosks = kioskStatuses.filter((status) => status.health === "offline");
  const totalRevenue = submittedOrders.reduce((sum, order) => sum + (order.pricedCart?.total ?? 0), 0);
  const averageOrderValue = submittedOrders.length ? totalRevenue / submittedOrders.length : 0;

  const topCategories = categories
    .map((category) => {
      const categoryItems = items.filter((item) => item.categoryId === category.id);
      return {
        id: category.id,
        name: category.name?.["en-GB"] ?? titleCase(category.id),
        items: categoryItems.length,
        soldOut: categoryItems.filter((item) => item.soldOut).length
      };
    })
    .sort((left, right) => right.items - left.items);

  const fulfillmentMix = orders.reduce((acc, order) => {
    const key = order.cart?.fulfillment ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return {
    items,
    categories,
    promotions,
    orders,
    kioskStatuses,
    submittedOrders,
    pendingOrders,
    failedOrders,
    soldOutItems,
    activePromotions,
    healthyKiosks,
    warningKiosks,
    offlineKiosks,
    totalRevenue,
    averageOrderValue,
    topCategories,
    fulfillmentMix,
    newestOrder: orders[0] ?? null
  };
}

function renderDashboard(data, meta = {}) {
  const analytics = buildAnalytics(data);
  const connectionTone = meta.live ? "good" : "warn";
  const updatedLabel = meta.lastUpdated ? dateTime(meta.lastUpdated) : "Waiting for sync";

  app.innerHTML = `
    <div class="shell">
      <div class="layout">
        <aside class="rail">
          <section class="brand">
            <div class="brand-badge">BO</div>
            <div>
              <p class="eyebrow">Toast-inspired backoffice</p>
              <h1>Store command center</h1>
            </div>
            <p class="muted">A sharper backoffice for kiosk operations, menu integrity, and live service recovery.</p>
          </section>

          <section class="nav-group">
            <div class="nav-chip"><div><strong>Operations</strong><div class="small-label">Live service board</div></div><span>${analytics.orders.length} orders</span></div>
            <div class="nav-chip"><div><strong>Menu</strong><div class="small-label">Availability controls</div></div><span>${analytics.items.length} items</span></div>
            <div class="nav-chip"><div><strong>Promotions</strong><div class="small-label">Campaign spotlight</div></div><span>${analytics.activePromotions.length} active</span></div>
            <div class="nav-chip"><div><strong>Fleet</strong><div class="small-label">Heartbeat and health</div></div><span>${analytics.kioskStatuses.length} kiosks</span></div>
          </section>

          <section class="rail-section">
            <p class="eyebrow">Shift pulse</p>
            <div class="nav-chip"><div><strong>Submitted</strong><div class="small-label">Paid orders</div></div><span class="good">${analytics.submittedOrders.length}</span></div>
            <div class="nav-chip"><div><strong>Attention</strong><div class="small-label">Pending or failed</div></div><span class="${analytics.failedOrders.length ? "bad" : analytics.pendingOrders.length ? "warn" : "good"}">${analytics.pendingOrders.length + analytics.failedOrders.length}</span></div>
            <div class="nav-chip"><div><strong>Sold out</strong><div class="small-label">Menu blockers</div></div><span class="${analytics.soldOutItems.length ? "warn" : "good"}">${analytics.soldOutItems.length}</span></div>
          </section>

          <section class="rail-callout">
            <p class="eyebrow">Recommended focus</p>
            <strong>${
              analytics.offlineKiosks.length
                ? "Recover offline kiosks before the next rush."
                : analytics.soldOutItems.length
                  ? "Review sold out items to protect conversion."
                  : "Service is steady. Use this window to test a new campaign."
            }</strong>
            <p class="muted">${
              analytics.offlineKiosks.length
                ? `${analytics.offlineKiosks.length} terminal${analytics.offlineKiosks.length === 1 ? "" : "s"} need immediate attention.`
                : analytics.soldOutItems.length
                  ? `${analytics.soldOutItems.length} menu item${analytics.soldOutItems.length === 1 ? "" : "s"} are unavailable right now.`
                  : "No critical kiosk or menu blockers are visible."
            }</p>
          </section>
        </aside>

        <main class="main">
          <section class="hero">
            <div class="hero-copy">
              <div class="story-pills">
                <span class="pill">Backoffice</span>
                <span class="tag ${connectionTone}"><span class="dot"></span>${meta.live ? "Live backend" : "Demo fallback"}</span>
              </div>
              <div>
                <p class="eyebrow">Today at a glance</p>
                <h2>Run kiosks like a modern restaurant ops team.</h2>
              </div>
              <p class="muted">${meta.error ? meta.error : "Monitor service, spot menu risk, and review basket activity without digging through dense admin tables."}</p>
              <div class="toolbar">
                <div class="toast-line"><span class="dot"></span>Last synced ${updatedLabel}</div>
                <div class="toolbar-actions">
                  <button class="button secondary" id="use-demo">Use demo data</button>
                  <button class="button primary" id="refresh-dashboard">Refresh live data</button>
                </div>
              </div>
              <div class="hero-grid">
                <div class="hero-stat">
                  <span class="small-label">Gross revenue</span>
                  <strong>${currency(analytics.totalRevenue)}</strong>
                  <span class="metric-trend ${analytics.submittedOrders.length ? "good" : "neutral"}">${analytics.submittedOrders.length} paid ticket${analytics.submittedOrders.length === 1 ? "" : "s"}</span>
                </div>
                <div class="hero-stat">
                  <span class="small-label">Average ticket</span>
                  <strong>${currency(analytics.averageOrderValue)}</strong>
                  <span class="metric-trend neutral">Based on submitted orders</span>
                </div>
              </div>
            </div>

            <div class="hero-side">
              <article class="story-card">
                <div class="panel-title">
                  <div><div class="panel-kicker">Service posture</div><h3>Shift story</h3></div>
                  <strong class="${analytics.offlineKiosks.length ? "bad" : analytics.warningKiosks.length ? "warn" : "good"}">${analytics.healthyKiosks.length}/${analytics.kioskStatuses.length || 0}</strong>
                </div>
                <div class="story-number">${analytics.healthyKiosks.length}</div>
                <p class="muted">Kiosks operating normally, with outliers surfaced below for intervention.</p>
                <div class="story-pills">
                  <span class="tag good">${analytics.healthyKiosks.length} healthy</span>
                  <span class="tag warn">${analytics.warningKiosks.length} warning</span>
                  <span class="tag bad">${analytics.offlineKiosks.length} offline</span>
                </div>
              </article>

              <article class="story-card">
                <div class="panel-title">
                  <div><div class="panel-kicker">Menu coverage</div><h3>Availability watch</h3></div>
                  <strong class="${analytics.soldOutItems.length ? "warn" : "good"}">${analytics.soldOutItems.length}</strong>
                </div>
                <p class="muted">Items currently unavailable across the menu.</p>
                <div class="story-pills">
                  ${analytics.topCategories.slice(0, 3).map((category) => `<span class="tag neutral">${category.name}: ${category.soldOut}/${category.items}</span>`).join("")}
                </div>
              </article>
            </div>
          </section>

          <section class="metrics-grid">
            <article class="metric-card">
              <div class="metric-top"><div class="metric-meta"><span class="kpi-label">Order queue</span><strong class="metric-value">${analytics.pendingOrders.length + analytics.failedOrders.length}</strong></div><span class="tag ${analytics.failedOrders.length ? "bad" : analytics.pendingOrders.length ? "warn" : "good"}">Needs review</span></div>
              <span class="metric-trend neutral">${analytics.pendingOrders.length} pending, ${analytics.failedOrders.length} failed</span>
            </article>
            <article class="metric-card">
              <div class="metric-top"><div class="metric-meta"><span class="kpi-label">Menu breadth</span><strong class="metric-value">${analytics.categories.length}</strong></div><span class="tag neutral">Categories</span></div>
              <span class="metric-trend neutral">${analytics.items.length} live items in the catalog</span>
            </article>
            <article class="metric-card">
              <div class="metric-top"><div class="metric-meta"><span class="kpi-label">Campaigns running</span><strong class="metric-value">${analytics.activePromotions.length}</strong></div><span class="tag ${analytics.activePromotions.length ? "good" : "neutral"}">Promo engine</span></div>
              <span class="metric-trend neutral">${analytics.promotions.length - analytics.activePromotions.length} inactive offer${analytics.promotions.length - analytics.activePromotions.length === 1 ? "" : "s"}</span>
            </article>
            <article class="metric-card">
              <div class="metric-top"><div class="metric-meta"><span class="kpi-label">Locale support</span><strong class="metric-value">2</strong></div><span class="tag neutral">EN / FR</span></div>
              <span class="metric-trend neutral">Ready for bilingual kiosk operations</span>
            </article>
          </section>

          <section class="ops-grid">
            <section class="panel">
              <div class="panel-title"><div><div class="panel-kicker">Fleet health</div><h3>Kiosk signal board</h3></div><strong>${analytics.kioskStatuses.length} live</strong></div>
              <div class="signal-list">
                ${analytics.kioskStatuses.map((status) => `
                  <div class="signal-row">
                    <div class="signal-copy">
                      <span class="signal-title">${status.kioskId.toUpperCase()}</span>
                      <span class="signal-time">Heartbeat ${dateTime(status.lastHeartbeat)}</span>
                    </div>
                    <div class="lane-badges">
                      <span class="tag neutral">${status.activeLocale}</span>
                      <span class="tag ${toneForHealth(status.health)}"><span class="dot"></span>${status.health}</span>
                    </div>
                  </div>
                `).join("")}
              </div>
            </section>

            <section class="panel">
              <div class="panel-title"><div><div class="panel-kicker">Order channels</div><h3>Fulfillment mix</h3></div><strong>${analytics.orders.length} orders</strong></div>
              <div class="lane-chart">
                ${Object.entries(analytics.fulfillmentMix).map(([channel, count]) => {
                  const percent = analytics.orders.length ? Math.round((count / analytics.orders.length) * 100) : 0;
                  return `
                    <div>
                      <div class="lane-row">
                        <div><strong>${titleCase(channel)}</strong><span>${count} orders</span></div>
                        <strong>${percent}%</strong>
                      </div>
                      <div class="lane-bar"><div class="lane-fill" style="width:${percent}%"></div></div>
                    </div>
                  `;
                }).join("")}
              </div>
            </section>
          </section>

          <section class="bottom-grid">
            <section class="panel">
              <div class="panel-title"><div><div class="panel-kicker">Catalog controls</div><h3>Menu availability</h3></div><strong>${analytics.soldOutItems.length} blocked</strong></div>
              <div class="availability-list">
                ${analytics.items.map((item) => `
                  <div class="availability-row">
                    <div class="availability-copy">
                      <strong class="availability-name">${item.name["en-GB"]}</strong>
                      <span>${getCategoryName(analytics.categories, item.categoryId)}</span>
                    </div>
                    <div class="lane-badges">
                      <span class="tag neutral">${currency(item.price)}</span>
                      <span class="tag ${item.soldOut ? "bad" : "good"}">${item.soldOut ? "Sold out" : "Available"}</span>
                    </div>
                  </div>
                `).join("")}
              </div>

              <div class="promo-card">
                <div class="panel-title">
                  <div><div class="panel-kicker">Campaign spotlight</div><h4>${analytics.activePromotions[0]?.title?.["en-GB"] ?? "No active promotion"}</h4></div>
                  <strong>${analytics.activePromotions[0] ? currency(analytics.activePromotions[0].discountAmount) : ""}</strong>
                </div>
                <p class="muted">${analytics.activePromotions[0]?.description?.["en-GB"] ?? "Activate a campaign to feature discounts, bundle nudges, or daypart offers here."}</p>
                <div class="promo-tags">
                  ${(analytics.activePromotions[0]?.itemIds ?? []).map((itemId) => `<span class="tag neutral">${getItemName(analytics.items, itemId)}</span>`).join("")}
                </div>
              </div>
            </section>

            <section class="panel">
              <div class="panel-title"><div><div class="panel-kicker">Order stream</div><h3>Recent tickets</h3></div><strong>${analytics.orders.length} shown</strong></div>
              <div class="orders-list">
                ${analytics.orders.map((order) => `
                  <div class="order-row">
                    <div class="order-copy">
                      <strong class="order-id">${order.id.toUpperCase()}</strong>
                      <span>${dateTime(order.createdAt)} | ${titleCase(order.cart.fulfillment ?? "unknown")}</span>
                    </div>
                    <div class="lane-badges">
                      <span class="tag neutral">${order.pricedCart.lines.length} lines</span>
                      <span class="tag ${toneForOrder(order.status)}">${order.status}</span>
                      <strong>${currency(order.pricedCart.total)}</strong>
                    </div>
                  </div>
                `).join("")}
              </div>
            </section>
          </section>

          <section class="receipt-card">
            <div class="receipt-header">
              <div class="receipt-meta">
                <div class="panel-kicker">Latest basket snapshot</div>
                <h4>${analytics.newestOrder ? analytics.newestOrder.id.toUpperCase() : "No receipt yet"}</h4>
                <p class="muted">${analytics.newestOrder ? `Opened ${time(analytics.newestOrder.createdAt)} for ${titleCase(analytics.newestOrder.cart.fulfillment ?? "unknown")}` : "No order data available yet."}</p>
              </div>
              ${analytics.newestOrder ? `<div class="receipt-tags"><span class="tag ${toneForOrder(analytics.newestOrder.status)}">${analytics.newestOrder.status}</span><span class="tag neutral">${analytics.newestOrder.cart.locale}</span></div>` : ""}
            </div>
            ${
              analytics.newestOrder
                ? `
                  <div class="receipt-lines">
                    ${analytics.newestOrder.pricedCart.lines.map((line) => `
                      <div class="receipt-row">
                        <span>${line.quantity} x ${getItemName(analytics.items, line.itemId)}</span>
                        <strong>${currency(line.lineTotal)}</strong>
                      </div>
                    `).join("")}
                  </div>
                  <div class="receipt-total">
                    <div class="receipt-row"><span>Subtotal</span><strong>${currency(analytics.newestOrder.pricedCart.subtotal)}</strong></div>
                    <div class="receipt-row"><span>Discount</span><strong>${currency(analytics.newestOrder.pricedCart.discount)}</strong></div>
                    <div class="receipt-row"><span>Total</span><strong>${currency(analytics.newestOrder.pricedCart.total)}</strong></div>
                  </div>
                `
                : `<div class="empty-state">Submit an order from a kiosk to populate this section.</div>`
            }
          </section>
        </main>
      </div>
    </div>
  `;

  document.querySelector("#refresh-dashboard")?.addEventListener("click", () => loadDashboard(true));
  document.querySelector("#use-demo")?.addEventListener("click", () => renderDashboard(fallbackData, {
    live: false,
    error: "Showing bundled demo data because the live backend is unavailable.",
    lastUpdated: new Date().toISOString()
  }));
}

async function loadDashboard(forceLive = false) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Dashboard request failed with ${response.status}.`);
    }

    const data = await response.json();
    renderDashboard(data, { live: true, lastUpdated: new Date().toISOString() });
  } catch (error) {
    renderDashboard(fallbackData, {
      live: false,
      error: forceLive
        ? error instanceof Error ? `${error.message} Switched to bundled demo data.` : "Live refresh failed. Switched to bundled demo data."
        : "Live backend unavailable. Showing bundled demo data so the dashboard still works.",
      lastUpdated: new Date().toISOString()
    });
  }
}

loadDashboard();
window.setInterval(loadDashboard, REFRESH_INTERVAL_MS);
