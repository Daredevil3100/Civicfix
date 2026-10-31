// ==========================================================================
// CIVICFIX - MODERN MUNICIPAL CIVIC PLATFORM
// Core Application Logic & State Management
// ==========================================================================

const STORAGE_KEY = "civicfix_issues_v2";

// Category configuration
const CATEGORY_MAP = {
  "Roads": { icon: "🛣️", label: "Roads & Potholes", dept: "Public Works & Highways" },
  "Garbage": { icon: "🗑️", label: "Sanitation & Waste", dept: "Municipal Solid Waste" },
  "Water Supply": { icon: "💧", label: "Water Supply & Leaks", dept: "Water & Sewerage Board" },
  "Electricity": { icon: "⚡", label: "Electricity & Grid", dept: "Power Distribution Corp" },
  "Drainage": { icon: "🌊", label: "Drainage & Sewage", dept: "Stormwater Drainage Dept" },
  "Streetlights": { icon: "💡", label: "Streetlights & Lighting", dept: "Electrical Maintenance" },
  "Other": { icon: "📌", label: "Other Public Issues", dept: "City Administration" }
};

// Curated Demo Issues with realistic coordinates & initial upvotes
const DEMO_ISSUES = [
  {
    id: "CF-1001",
    title: "Deep pothole cluster near Central Junction",
    category: "Roads",
    priority: "High",
    location: "Central Junction, 4th Cross Road",
    description: "Multiple severe potholes across both lanes. Two-wheelers frequently lose balance during morning commute. Urgent asphalt resurfacing required.",
    status: "In Progress",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
    latitude: 37.7749,
    longitude: -122.4194,
    upvotes: 24,
    officialNote: "Work order #PW-849 issued. Asphalt repair crew dispatched on site."
  },
  {
    id: "CF-1002",
    title: "Commercial garbage dump uncollected for 4 days",
    category: "Garbage",
    priority: "Medium",
    location: "Main Market Square, Block B",
    description: "Overflowing community bins blocking the pedestrian sidewalk. Stray animals dispersing litter onto the street, producing foul odor.",
    status: "Pending",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=600&q=80",
    latitude: 37.7833,
    longitude: -122.4167,
    upvotes: 18,
    officialNote: "Inspection assigned to Ward Sanitation Inspector."
  },
  {
    id: "CF-1003",
    title: "Three streetlights blackout on residential avenue",
    category: "Streetlights",
    priority: "High",
    location: "East Residential Boulevard, Lane 7",
    description: "All streetlights between house numbers 40 to 85 have ceased functioning. Area is completely dark at night, posing safety hazard for pedestrians.",
    status: "Resolved",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80",
    latitude: 37.7690,
    longitude: -122.4467,
    upvotes: 31,
    officialNote: "LED driver ballast and cabling replaced by Night Maintenance Crew. Verified active."
  },
  {
    id: "CF-1004",
    title: "Major underground pipeline fracture causing clean water wastage",
    category: "Water Supply",
    priority: "High",
    location: "Green Valley Avenue, near Community Park",
    description: "Treated drinking water is flooding the street from a cracked underground pipe joint. Neighboring apartments have very low pressure.",
    status: "In Progress",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80",
    latitude: 37.7600,
    longitude: -122.4200,
    upvotes: 42,
    officialNote: "Valve isolated. Excavation team on site replacing 4-inch ductile iron pipe segment."
  },
  {
    id: "CF-1005",
    title: "Blocked storm drainage channel causing stagnant water",
    category: "Drainage",
    priority: "Medium",
    location: "Lake View Road, culvert near bridge",
    description: "Culvert grating clogged with plastic waste and tree silt. Rainwater cannot drain, creating mosquito breeding hotspot.",
    status: "Pending",
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
    latitude: 37.7550,
    longitude: -122.4350,
    upvotes: 11,
    officialNote: "Slated for desilting excavator machine on next cycle."
  },
  {
    id: "CF-1006",
    title: "Tilted utility electric pole following storm",
    category: "Electricity",
    priority: "High",
    location: "North Highland Avenue & 12th St",
    description: "Electric distribution pole tilted approximately 25 degrees with tension on overhead wires. Requires structural reinforcement.",
    status: "Resolved",
    date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80",
    latitude: 37.7950,
    longitude: -122.4050,
    upvotes: 29,
    officialNote: "Pole restabilized with concrete footing base and new guy wire anchors."
  }
];

// ==========================================================================
// STATE MANAGEMENT & LOCAL STORAGE
// ==========================================================================

function loadIssues() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("CivicFix: Could not read local storage, falling back to demo data.", err);
  }
  return JSON.parse(JSON.stringify(DEMO_ISSUES));
}

let issues = loadIssues();
let userUpvotedIds = new Set(JSON.parse(localStorage.getItem("civicfix_user_upvotes") || "[]"));
let activeView = "dashboard";
let exploreViewMode = "cards"; // "cards" or "map"
let pendingDeleteId = null;

function saveIssues() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    return true;
  } catch (err) {
    console.error("CivicFix: LocalStorage quota exceeded or storage failure.", err);
    showToast("Storage quota exceeded. Image compressed or remove older reports.", "error");
    return false;
  }
}

function saveUpvotes() {
  try {
    localStorage.setItem("civicfix_user_upvotes", JSON.stringify(Array.from(userUpvotedIds)));
  } catch (err) {
    console.warn("Could not persist upvotes.", err);
  }
}

// ==========================================================================
// UTILITY & HELPER FUNCTIONS
// ==========================================================================

function escapeHTML(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function formatDate(isoStr) {
  if (!isoStr) return "Recently";
  const date = new Date(isoStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getCategoryIcon(cat) {
  return CATEGORY_MAP[cat]?.icon || "📌";
}

function getCategoryDept(cat) {
  return CATEGORY_MAP[cat]?.dept || "Municipal Administration";
}

function getStatusClass(status) {
  return (status || "pending").toLowerCase().replace(/\s+/g, "-");
}

function getStatusBadge(status) {
  const cls = getStatusClass(status);
  return `<span class="status-badge ${cls}"><span class="status-indicator-dot ${cls}"></span>${escapeHTML(status)}</span>`;
}

function getPriorityBadge(priority) {
  const p = (priority || "medium").toLowerCase();
  return `<span class="priority-pill ${p}">${escapeHTML(priority)} Priority</span>`;
}

// Toast Notifications
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
    <span class="toast-message">${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Global Counts
function getStats() {
  const total = issues.length;
  const pending = issues.filter(i => i.status === "Pending").length;
  const inProgress = issues.filter(i => i.status === "In Progress").length;
  const resolved = issues.filter(i => i.status === "Resolved").length;
  const highPriority = issues.filter(i => i.priority === "High").length;
  const totalUpvotes = issues.reduce((acc, i) => acc + (i.upvotes || 0), 0);
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;

  return { total, pending, inProgress, resolved, highPriority, totalUpvotes, resolutionRate };
}

// ==========================================================================
// IMAGE COMPRESSION UTILITY (Canvas Resizer)
// Ensures images never exceed ~80KB so LocalStorage NEVER crashes
// ==========================================================================

function compressImageFile(file, maxWidth = 900, maxHeight = 900, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = err => reject(err);
    };
    reader.onerror = err => reject(err);
  });
}

// ==========================================================================
// ADMIN AUTHENTICATION STATE & SESSION
// ==========================================================================

const ADMIN_SESSION_KEY = "civicfix_admin_session_v1";
const VALID_ADMIN_EMAIL = "admin@civicfix.gov";
const VALID_ADMIN_PASS = "admin123";

function checkAdminAuth() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true" ||
         localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

let isAdminLoggedIn = checkAdminAuth();

function updateAdminProfileUI() {
  const avatar = document.getElementById("sidebarAvatar");
  const name = document.getElementById("sidebarUserName");
  const role = document.getElementById("sidebarUserRole");
  const badge = document.getElementById("sidebarAdminBadge");
  const avatarRing = document.getElementById("sidebarAvatarRing");

  const pAvatar = document.getElementById("pmenuAvatar");
  const pName = document.getElementById("pmenuUserName");
  const pBadge = document.getElementById("pmenuBadge");
  const pEmail = document.getElementById("pmenuUserEmail");
  const pRing = document.getElementById("pmenuAvatarRing");

  if (isAdminLoggedIn) {
    if (avatar) avatar.textContent = "AD";
    if (name) name.textContent = "Officer Admin";
    if (role) role.textContent = "Public Works Staff (Active)";
    if (badge) {
      badge.textContent = "Active";
      badge.style.backgroundColor = "rgba(16, 185, 129, 0.25)";
      badge.style.color = "#a7f3d0";
    }
    if (avatarRing) {
      avatarRing.style.background = "linear-gradient(135deg, #10b981, #f59e0b)";
    }

    if (pAvatar) pAvatar.textContent = "AD";
    if (pName) pName.textContent = "Officer Admin";
    if (pBadge) {
      pBadge.textContent = "Staff Active";
      pBadge.className = "pmenu-badge admin";
    }
    if (pEmail) pEmail.textContent = "admin@civicfix.gov • On Duty";
    if (pRing) {
      pRing.style.background = "linear-gradient(135deg, #10b981, #f59e0b)";
    }
  } else {
    if (avatar) avatar.textContent = "CF";
    if (name) name.textContent = "Citizen Contributor";
    if (role) role.textContent = "Verified Resident";
    if (badge) {
      badge.textContent = "Staff";
      badge.style.backgroundColor = "";
      badge.style.color = "";
    }
    if (avatarRing) {
      avatarRing.style.background = "linear-gradient(135deg, var(--primary), #10b981)";
    }

    if (pAvatar) pAvatar.textContent = "CF";
    if (pName) pName.textContent = "Citizen Contributor";
    if (pBadge) {
      pBadge.textContent = "Resident";
      pBadge.className = "pmenu-badge";
    }
    if (pEmail) pEmail.textContent = "citizen@civicfix.local";
    if (pRing) {
      pRing.style.background = "linear-gradient(135deg, var(--primary), #10b981)";
    }
  }

  renderProfileMenu();
}

// ==========================================================================
// NAVIGATION CONTROLLER
// ==========================================================================

const VIEW_TITLES = {
  dashboard: "Community Overview",
  issues: "Public Issue Registry",
  report: "Submit a Public Issue Report",
  analytics: "Community Impact Analytics",
  admin: "Issue Administration & Triage",
  adminLogin: "Staff Administration Portal"
};

function navigate(viewName) {
  // Gatekeeper: Redirect unauthenticated requests to adminLogin
  if (viewName === "admin" && !isAdminLoggedIn) {
    viewName = "adminLogin";
  } else if (viewName === "adminLogin" && isAdminLoggedIn) {
    viewName = "admin";
  }

  const targetView = document.getElementById(viewName);
  if (!targetView) return;

  activeView = viewName;

  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  targetView.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(btn => {
    const isTarget = btn.dataset.view === viewName || (viewName === "adminLogin" && btn.dataset.view === "admin");
    btn.classList.toggle("active", isTarget);
  });

  const title = VIEW_TITLES[viewName] || "Community Portal";
  const pageTitleEl = document.getElementById("pageTitle");
  const breadcrumbEl = document.getElementById("breadcrumb");
  if (pageTitleEl) pageTitleEl.textContent = title;
  if (breadcrumbEl) breadcrumbEl.textContent = title;

  // Close mobile sidebar and profile dropdown
  closeMobileSidebar();
  closeProfileMenu();

  // Invalidate Leaflet maps when navigating to views containing them
  if (viewName === "report" && reportMap) {
    setTimeout(() => reportMap.invalidateSize(), 200);
  }
  if (viewName === "issues" && exploreViewMode === "map" && exploreMap) {
    setTimeout(() => {
      exploreMap.invalidateSize();
      renderExploreMapMarkers();
    }, 200);
  }

  renderAll();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openMobileSidebar() {
  document.getElementById("sidebar")?.classList.add("open");
  document.getElementById("sidebarBackdrop")?.classList.add("show");
}

function closeMobileSidebar() {
  document.getElementById("sidebar")?.classList.remove("open");
  document.getElementById("sidebarBackdrop")?.classList.remove("show");
}

// Set up navigation listeners
document.querySelectorAll("[data-view]").forEach(btn => {
  btn.addEventListener("click", () => navigate(btn.dataset.view));
});

document.querySelectorAll("[data-go]").forEach(btn => {
  btn.addEventListener("click", () => navigate(btn.dataset.go));
});

document.getElementById("topReportBtn")?.addEventListener("click", () => navigate("report"));
document.getElementById("menuToggle")?.addEventListener("click", openMobileSidebar);
document.getElementById("sidebarCloseBtn")?.addEventListener("click", closeMobileSidebar);
document.getElementById("sidebarBackdrop")?.addEventListener("click", closeMobileSidebar);

// Stat card shortcut clicks (filter issues directly)
document.querySelectorAll(".stat-card[data-filter-status]").forEach(card => {
  card.addEventListener("click", () => {
    const status = card.dataset.filterStatus;
    const statusSelect = document.getElementById("statusFilter");
    if (statusSelect) {
      statusSelect.value = status;
    }
    navigate("issues");
  });
});

// Notifications dropdown toggle
const notifBtn = document.getElementById("notificationBtn");
const notifDropdown = document.getElementById("notificationsDropdown");
if (notifBtn && notifDropdown) {
  notifBtn.addEventListener("click", e => {
    e.stopPropagation();
    notifDropdown.classList.toggle("show");
  });

  document.addEventListener("click", e => {
    if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
      notifDropdown.classList.remove("show");
    }
  });

  document.getElementById("markAllReadBtn")?.addEventListener("click", () => {
    document.querySelectorAll(".notif-item.unread").forEach(el => el.classList.remove("unread"));
    const badge = document.getElementById("notifBadge");
    if (badge) badge.style.display = "none";
    showToast("Notifications marked as read", "info");
  });
}

// ==========================================================================
// RENDER: DASHBOARD VIEW
// ==========================================================================

function renderDashboard() {
  const stats = getStats();

  document.getElementById("totalStat").textContent = stats.total;
  document.getElementById("pendingStat").textContent = stats.pending;
  document.getElementById("progressStat").textContent = stats.inProgress;
  document.getElementById("resolvedStat").textContent = stats.resolved;

  document.getElementById("sidebarResolutionRate").textContent = `${stats.resolutionRate}%`;
  document.getElementById("sidebarProgressFill").style.width = `${stats.resolutionRate}%`;
  document.getElementById("navIssueCounter").textContent = stats.total;

  // Render 5 recent reports
  const recentContainer = document.getElementById("recentIssues");
  const sortedIssues = [...issues].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (!sortedIssues.length) {
    recentContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📂</div>
        <h4>No community reports yet</h4>
        <p>Be the first citizen to report an issue in your neighborhood.</p>
        <button class="btn btn-primary btn-sm" data-go="report">Submit a Report</button>
      </div>
    `;
  } else {
    recentContainer.innerHTML = sortedIssues.map(issue => `
      <div class="recent-item" data-open-id="${escapeHTML(issue.id)}">
        <div class="recent-cat-icon">${getCategoryIcon(issue.category)}</div>
        <div class="recent-info">
          <div class="recent-title-line">
            <strong>${escapeHTML(issue.title)}</strong>
            ${getPriorityBadge(issue.priority)}
          </div>
          <div class="recent-meta-line">
            <span>📍 ${escapeHTML(issue.location)}</span>
            <span>•</span>
            <span>${formatDate(issue.date)}</span>
            <span>•</span>
            <span>▲ ${issue.upvotes || 0} upvotes</span>
          </div>
        </div>
        ${getStatusBadge(issue.status)}
      </div>
    `).join("");
  }

  // Render category breakdown
  const categoryContainer = document.getElementById("categoryBreakdown");
  const uniqueCats = Object.keys(CATEGORY_MAP);
  let activeCatsCount = 0;

  categoryContainer.innerHTML = uniqueCats.map(cat => {
    const count = issues.filter(i => i.category === cat).length;
    if (count > 0) activeCatsCount++;
    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;

    return `
      <div class="cat-breakdown-item">
        <div class="cat-breakdown-header">
          <div class="cat-name-box">
            <span>${getCategoryIcon(cat)}</span>
            <span>${escapeHTML(cat)}</span>
          </div>
          <span class="cat-count">${count} reports (${pct}%)</span>
        </div>
        <div class="cat-progress-track">
          <div class="cat-progress-fill" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join("");

  document.getElementById("activeCategoryCount").textContent = `${activeCatsCount} Active`;
}

// ==========================================================================
// RENDER: EXPLORE ISSUES VIEW
// ==========================================================================

function getFilteredIssues() {
  const search = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const category = document.getElementById("categoryFilter")?.value || "All";
  const status = document.getElementById("statusFilter")?.value || "All";
  const priority = document.getElementById("priorityFilter")?.value || "All";
  const sort = document.getElementById("sortOrder")?.value || "newest";

  let filtered = issues.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(search) ||
      issue.location.toLowerCase().includes(search) ||
      issue.id.toLowerCase().includes(search) ||
      issue.description.toLowerCase().includes(search);

    const matchesCategory = category === "All" || issue.category === category;
    const matchesStatus = status === "All" || issue.status === status;
    const matchesPriority = priority === "All" || issue.priority === priority;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  // Sorting
  if (sort === "newest") {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sort === "oldest") {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sort === "upvotes") {
    filtered.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  } else if (sort === "priority") {
    const priorityWeight = { "High": 3, "Medium": 2, "Low": 1 };
    filtered.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
  }

  return filtered;
}

function renderIssues() {
  const filtered = getFilteredIssues();
  document.getElementById("resultCount").textContent = filtered.length;

  // Toggle clear search button
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearchBtn");
  if (clearBtn && searchInput) {
    clearBtn.hidden = !searchInput.value;
  }

  const container = document.getElementById("allIssues");

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔍</div>
        <h4>No matching reports found</h4>
        <p>Try resetting filters or expanding your search query.</p>
        <button class="btn btn-secondary btn-sm" id="emptyResetBtn">Reset All Filters</button>
      </div>
    `;
    document.getElementById("emptyResetBtn")?.addEventListener("click", resetFilters);
    return;
  }

  container.innerHTML = filtered.map(issue => {
    const isUpvoted = userUpvotedIds.has(issue.id);
    return `
      <article class="issue-card" data-open-id="${escapeHTML(issue.id)}">
        <div class="issue-card-media">
          ${issue.image
            ? `<img src="${escapeHTML(issue.image)}" alt="${escapeHTML(issue.title)}" loading="lazy">`
            : `<div class="media-placeholder-icon">${getCategoryIcon(issue.category)}</div>`
          }
          <div class="card-top-tags">
            <span class="category-tag">
              <span>${getCategoryIcon(issue.category)}</span>
              <span>${escapeHTML(issue.category)}</span>
            </span>
            ${getStatusBadge(issue.status)}
          </div>
        </div>

        <div class="issue-card-body">
          <h3 class="issue-card-title">${escapeHTML(issue.title)}</h3>
          <div class="issue-card-location">
            <span>📍</span>
            <span>${escapeHTML(issue.location)}</span>
          </div>
          <p class="issue-card-desc">${escapeHTML(issue.description)}</p>

          <div class="issue-card-footer">
            <span class="card-ticket-id">${escapeHTML(issue.id)}</span>
            <div class="card-actions-right">
              ${getPriorityBadge(issue.priority)}
              <button
                type="button"
                class="upvote-btn ${isUpvoted ? 'upvoted' : ''}"
                data-upvote-id="${escapeHTML(issue.id)}"
                title="Upvote to raise urgency"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="${isUpvoted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <span>${issue.upvotes || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  // Update explore map if active
  if (exploreViewMode === "map") {
    renderExploreMapMarkers();
  }
}

function resetFilters() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";
  document.getElementById("categoryFilter").value = "All";
  document.getElementById("statusFilter").value = "All";
  document.getElementById("priorityFilter").value = "All";
  document.getElementById("sortOrder").value = "newest";
  renderIssues();
}

// Search and filter listeners
document.getElementById("searchInput")?.addEventListener("input", renderIssues);
document.getElementById("clearSearchBtn")?.addEventListener("click", () => {
  const search = document.getElementById("searchInput");
  if (search) search.value = "";
  renderIssues();
});
document.getElementById("categoryFilter")?.addEventListener("change", renderIssues);
document.getElementById("statusFilter")?.addEventListener("change", renderIssues);
document.getElementById("priorityFilter")?.addEventListener("change", renderIssues);
document.getElementById("sortOrder")?.addEventListener("change", renderIssues);
document.getElementById("resetFiltersBtn")?.addEventListener("click", resetFilters);

// Upvote handler
document.addEventListener("click", e => {
  const upvoteBtn = e.target.closest("[data-upvote-id]");
  if (!upvoteBtn) return;
  e.stopPropagation(); // Don't trigger modal

  const id = upvoteBtn.dataset.upvoteId;
  const issue = issues.find(i => i.id === id);
  if (!issue) return;

  if (userUpvotedIds.has(id)) {
    userUpvotedIds.delete(id);
    issue.upvotes = Math.max(0, (issue.upvotes || 1) - 1);
    showToast("Upvote removed", "info");
  } else {
    userUpvotedIds.add(id);
    issue.upvotes = (issue.upvotes || 0) + 1;
    showToast(`You upvoted "${issue.title}"!`, "success");
  }

  saveIssues();
  saveUpvotes();
  renderIssues();
  renderDashboard();

  // If modal is open for this issue, update modal upvote button
  const modalUpvote = document.querySelector(`.modal-card [data-upvote-id="${id}"]`);
  if (modalUpvote) {
    const isUpvoted = userUpvotedIds.has(id);
    modalUpvote.className = `btn ${isUpvoted ? 'btn-danger' : 'btn-secondary'} btn-sm`;
    modalUpvote.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="${isUpvoted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      <span>${issue.upvotes || 0} Upvotes</span>
    `;
  }
});

// Switch Cards vs Map View
document.getElementById("modeGridBtn")?.addEventListener("click", () => {
  exploreViewMode = "cards";
  document.getElementById("modeGridBtn").classList.add("active");
  document.getElementById("modeMapBtn").classList.remove("active");
  document.getElementById("allIssues").style.display = "grid";
  document.getElementById("communityMapContainer").style.display = "none";
});

document.getElementById("modeMapBtn")?.addEventListener("click", () => {
  exploreViewMode = "map";
  document.getElementById("modeMapBtn").classList.add("active");
  document.getElementById("modeGridBtn").classList.remove("active");
  document.getElementById("allIssues").style.display = "none";
  document.getElementById("communityMapContainer").style.display = "block";

  initExploreMap();
  setTimeout(() => {
    if (exploreMap) {
      exploreMap.invalidateSize();
      renderExploreMapMarkers();
    }
  }, 150);
});

// ==========================================================================
// RENDER: ANALYTICS VIEW
// ==========================================================================

function renderAnalytics() {
  const stats = getStats();

  document.getElementById("analyticsTotal").textContent = stats.total;
  document.getElementById("resolutionRate").textContent = `${stats.resolutionRate}%`;
  document.getElementById("highPriority").textContent = stats.highPriority;
  document.getElementById("totalUpvotes").textContent = stats.totalUpvotes;

  // Category Distribution Bars
  const catContainer = document.getElementById("analyticsCategories");
  const uniqueCats = Object.keys(CATEGORY_MAP);

  catContainer.innerHTML = uniqueCats.map(cat => {
    const count = issues.filter(i => i.category === cat).length;
    const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
    return `
      <div class="cat-breakdown-item">
        <div class="cat-breakdown-header">
          <div class="cat-name-box">
            <span>${getCategoryIcon(cat)}</span>
            <strong>${escapeHTML(cat)}</strong>
          </div>
          <span>${count} tickets (${pct}%)</span>
        </div>
        <div class="cat-progress-track">
          <div class="cat-progress-fill" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join("");

  // Status Breakdown
  const statusContainer = document.getElementById("statusChart");
  const statuses = [
    { name: "Pending", count: stats.pending, color: "var(--amber)" },
    { name: "In Progress", count: stats.inProgress, color: "var(--purple)" },
    { name: "Resolved", count: stats.resolved, color: "var(--green)" }
  ];

  statusContainer.innerHTML = statuses.map(s => {
    const pct = stats.total ? Math.round((s.count / stats.total) * 100) : 0;
    return `
      <div class="cat-breakdown-item">
        <div class="cat-breakdown-header">
          <strong>${s.name}</strong>
          <span>${s.count} reports (${pct}%)</span>
        </div>
        <div class="cat-progress-track">
          <div class="cat-progress-fill" style="width: ${pct}%; background: ${s.color};"></div>
        </div>
      </div>
    `;
  }).join("");

  // Priority Benchmark Grid
  const benchmarkGrid = document.getElementById("priorityBenchmarkGrid");
  const highAvg = "24-48 Hours";
  const medAvg = "3-5 Days";
  const lowAvg = "7-10 Days";

  benchmarkGrid.innerHTML = `
    <div class="benchmark-box" style="border-left: 4px solid var(--red);">
      <strong style="color: var(--red);">High Urgency SLA</strong>
      <p>Target Response: Under 24h</p>
      <p>Current City Average: <strong>${highAvg}</strong></p>
    </div>
    <div class="benchmark-box" style="border-left: 4px solid var(--amber);">
      <strong style="color: var(--amber);">Medium Urgency SLA</strong>
      <p>Target Response: 3-5 Days</p>
      <p>Current City Average: <strong>${medAvg}</strong></p>
    </div>
    <div class="benchmark-box" style="border-left: 4px solid var(--green);">
      <strong style="color: var(--green);">Routine Maintenance SLA</strong>
      <p>Target Response: 7 Days</p>
      <p>Current City Average: <strong>${lowAvg}</strong></p>
    </div>
  `;
}

// Download Analytics Summary
document.getElementById("exportAnalyticsBtn")?.addEventListener("click", () => {
  const stats = getStats();
  const reportText = `CIVICFIX MUNICIPAL METRICS SUMMARY
Generated on: ${new Date().toLocaleString()}
------------------------------------------------
Total Handled: ${stats.total}
Resolved Tickets: ${stats.resolved} (${stats.resolutionRate}%)
Active In Progress: ${stats.inProgress}
Pending Triage: ${stats.pending}
High Priority Emergency Tickets: ${stats.highPriority}
Total Community Upvotes: ${stats.totalUpvotes}
`;

  const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `CivicFix-Analytics-${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Analytics summary report downloaded", "success");
});

// ==========================================================================
// RENDER: ADMIN MANAGEMENT VIEW
// ==========================================================================

function renderAdmin() {
  const stats = getStats();

  document.getElementById("adminTotal").textContent = stats.total;
  document.getElementById("adminPending").textContent = stats.pending;
  document.getElementById("adminProgress").textContent = stats.inProgress;
  document.getElementById("adminResolved").textContent = stats.resolved;

  const search = (document.getElementById("adminSearchInput")?.value || "").toLowerCase().trim();
  const statusFilter = document.getElementById("adminStatusFilter")?.value || "All";

  const filtered = issues.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(search) ||
      issue.id.toLowerCase().includes(search) ||
      issue.location.toLowerCase().includes(search);
    const matchesStatus = statusFilter === "All" || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tableBody = document.getElementById("adminTable");

  if (!filtered.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state" style="border:none; padding: 40px;">
          <p>No complaints match your query.</p>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = [...filtered]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(issue => `
      <tr>
        <td class="table-title-cell">
          <strong>${escapeHTML(issue.title)}</strong>
          <span class="table-id-tag">${escapeHTML(issue.id)} • ${formatDate(issue.date)}</span>
        </td>
        <td>
          <span>${getCategoryIcon(issue.category)} ${escapeHTML(issue.category)}</span>
        </td>
        <td>
          ${getPriorityBadge(issue.priority)}
        </td>
        <td>
          <span title="${escapeHTML(issue.location)}">${escapeHTML(issue.location.slice(0, 32))}${issue.location.length > 32 ? "..." : ""}</span>
        </td>
        <td>
          <select
            class="admin-status-select ${getStatusClass(issue.status)}"
            data-change-status-id="${escapeHTML(issue.id)}"
            aria-label="Change status"
          >
            <option value="Pending" ${issue.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="In Progress" ${issue.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option value="Resolved" ${issue.status === "Resolved" ? "selected" : ""}>Resolved</option>
          </select>
        </td>
        <td>
          <span style="font-size: 0.78rem; color: var(--slate-600);" title="${escapeHTML(issue.officialNote || 'No notes yet')}">
            ${escapeHTML((issue.officialNote || "No notes yet").slice(0, 30))}...
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn-icon-table" data-open-id="${escapeHTML(issue.id)}" title="Inspect Full Report">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="btn-icon-table delete" data-request-delete="${escapeHTML(issue.id)}" title="Delete Report">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
}

// Admin status change listener
document.getElementById("adminTable")?.addEventListener("change", e => {
  const id = e.target.dataset.changeStatusId;
  if (!id) return;

  const issue = issues.find(i => i.id === id);
  if (issue) {
    const oldStatus = issue.status;
    const newStatus = e.target.value;
    issue.status = newStatus;

    if (newStatus === "Resolved" && !issue.officialNote?.includes("Resolved")) {
      issue.officialNote = `Resolved on ${new Date().toLocaleDateString()} following field verification.`;
    }

    if (saveIssues()) {
      showToast(`Report ${id} status updated to ${newStatus}`, "success");
      renderAll();
    } else {
      issue.status = oldStatus;
      renderAll();
    }
  }
});

// Admin search & filter listeners
document.getElementById("adminSearchInput")?.addEventListener("input", renderAdmin);
document.getElementById("adminStatusFilter")?.addEventListener("change", renderAdmin);

// Delete confirmation modal handler
document.addEventListener("click", e => {
  const deleteBtn = e.target.closest("[data-request-delete]");
  if (!deleteBtn) return;

  const id = deleteBtn.dataset.requestDelete;
  const issue = issues.find(i => i.id === id);
  if (!issue) return;

  pendingDeleteId = id;
  const deleteModal = document.getElementById("deleteConfirmModal");
  const msg = document.getElementById("deleteModalMessage");
  if (msg) {
    msg.textContent = `Are you sure you want to permanently delete "${issue.title}" (${issue.id})? This action cannot be undone.`;
  }
  deleteModal?.classList.add("show");
});

document.getElementById("cancelDeleteBtn")?.addEventListener("click", () => {
  pendingDeleteId = null;
  document.getElementById("deleteConfirmModal")?.classList.remove("show");
});

document.getElementById("confirmDeleteBtn")?.addEventListener("click", () => {
  if (!pendingDeleteId) return;

  const previous = issues;
  issues = issues.filter(i => i.id !== pendingDeleteId);
  userUpvotedIds.delete(pendingDeleteId);

  if (saveIssues()) {
    showToast(`Report ${pendingDeleteId} has been deleted`, "info");
    saveUpvotes();
    renderAll();
  } else {
    issues = previous;
    showToast("Could not delete report from storage", "error");
  }

  pendingDeleteId = null;
  document.getElementById("deleteConfirmModal")?.classList.remove("show");
});

// Reset demo data button
document.getElementById("resetDemoBtn")?.addEventListener("click", () => {
  if (confirm("Reset all reports back to initial demonstration issues? Any custom submitted reports will be replaced.")) {
    issues = JSON.parse(JSON.stringify(DEMO_ISSUES));
    userUpvotedIds.clear();
    saveIssues();
    saveUpvotes();
    showToast("Demo complaints restored successfully", "success");
    renderAll();
  }
});

// CSV Export
document.getElementById("exportBtn")?.addEventListener("click", () => {
  if (!issues.length) {
    showToast("There are no reports to export", "warning");
    return;
  }

  const headers = [
    "ID", "Title", "Category", "Priority", "Department",
    "Location", "Latitude", "Longitude", "Status", "Upvotes", "Date", "Official Note"
  ];

  function csvCell(val) {
    return '"' + String(val ?? "").replace(/"/g, '""') + '"';
  }

  const rows = issues.map(i => [
    i.id,
    i.title,
    i.category,
    i.priority,
    getCategoryDept(i.category),
    i.location,
    i.latitude || "",
    i.longitude || "",
    i.status,
    i.upvotes || 0,
    formatDate(i.date),
    i.officialNote || ""
  ]);

  const csv = [headers, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `CivicFix-Reports-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("CSV data exported successfully", "success");
});

// ==========================================================================
// ADMIN LOGIN & AUTHENTICATION HANDLERS
// ==========================================================================

// Toggle password visibility in login form
const togglePassBtn = document.getElementById("togglePasswordBtn");
const passInput = document.getElementById("adminPassword");
if (togglePassBtn && passInput) {
  togglePassBtn.addEventListener("click", () => {
    const isPassword = passInput.type === "password";
    passInput.type = isPassword ? "text" : "password";
    const eyeIcon = document.getElementById("eyeIcon");
    if (eyeIcon) {
      eyeIcon.innerHTML = isPassword
        ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" x2="23" y1="1" y2="23"/>`
        : `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`;
    }
  });
}

// 1-Click Auto Fill Demo Credentials
document.getElementById("autoFillCredsBtn")?.addEventListener("click", () => {
  const emailInput = document.getElementById("adminEmail");
  const passwordInput = document.getElementById("adminPassword");
  if (emailInput) emailInput.value = VALID_ADMIN_EMAIL;
  if (passwordInput) passwordInput.value = VALID_ADMIN_PASS;
  showToast("Demo staff credentials filled in!", "info");
});

// Forgot password link
document.getElementById("forgotPassBtn")?.addEventListener("click", () => {
  showToast("Demo environment: Passcode is 'admin123' (use 1-Click Auto Fill).", "info");
});

// Admin Login form submit
const adminLoginForm = document.getElementById("adminLoginForm");
if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = (document.getElementById("adminEmail")?.value || "").trim().toLowerCase();
    const pass = (document.getElementById("adminPassword")?.value || "").trim();
    const remember = document.getElementById("rememberAdmin")?.checked;
    const alertBanner = document.getElementById("loginAlertBanner");

    if (email === VALID_ADMIN_EMAIL && pass === VALID_ADMIN_PASS) {
      if (alertBanner) alertBanner.style.display = "none";
      isAdminLoggedIn = true;

      if (remember) {
        localStorage.setItem(ADMIN_SESSION_KEY, "true");
      } else {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }

      updateAdminProfileUI();
      showToast("Access granted. Welcome, Officer Admin.", "success");
      navigate("admin");
    } else {
      if (alertBanner) {
        alertBanner.style.display = "flex";
        alertBanner.classList.remove("shake");
        void alertBanner.offsetWidth; // trigger reflow
        alertBanner.classList.add("shake");
      }
      showToast("Authentication failed: Check email or passcode.", "error");
    }
  });
}

// Admin Logout button handler & common logout action
function performAdminLogout() {
  isAdminLoggedIn = false;
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_SESSION_KEY);
  updateAdminProfileUI();
  showToast("Administrative session closed. Signed out successfully.", "info");
  navigate("dashboard");
}

document.getElementById("adminLogoutBtn")?.addEventListener("click", performAdminLogout);

// ==========================================================================
// PROFILE DROPDOWN MENU (3-DOTS) & PROFILE MODAL CONTROLLERS
// ==========================================================================

function toggleProfileMenu(e) {
  if (e) {
    e.stopPropagation();
  }
  const menu = document.getElementById("profileDropdownMenu");
  const btn = document.getElementById("profileBtn");
  const card = document.getElementById("profileCard");
  if (!menu) return;

  const isOpen = menu.classList.contains("show");
  if (isOpen) {
    closeProfileMenu();
  } else {
    renderProfileMenu();
    menu.classList.add("show");
    btn?.classList.add("active");
    btn?.setAttribute("aria-expanded", "true");
    card?.classList.add("active");
  }
}

function closeProfileMenu() {
  const menu = document.getElementById("profileDropdownMenu");
  const btn = document.getElementById("profileBtn");
  const card = document.getElementById("profileCard");
  if (menu && menu.classList.contains("show")) {
    menu.classList.remove("show");
    btn?.classList.remove("active");
    btn?.setAttribute("aria-expanded", "false");
    card?.classList.remove("active");
  }
}

function renderProfileMenu() {
  const statsContainer = document.getElementById("pmenuStats");
  const itemsContainer = document.getElementById("pmenuItems");
  if (!statsContainer || !itemsContainer) return;

  const stats = getStats();
  const upvotedCount = userUpvotedIds.size;
  const citizenCreatedCount = issues.filter(i => !DEMO_ISSUES.some(d => d.id === i.id)).length;

  if (isAdminLoggedIn) {
    statsContainer.innerHTML = `
      <div class="pmenu-stat-item">
        <span class="pmenu-stat-num" style="color:#60a5fa;">${stats.total}</span>
        <span class="pmenu-stat-lbl">Tickets</span>
      </div>
      <div class="pmenu-stat-item">
        <span class="pmenu-stat-num" style="color:#f59e0b;">${stats.pending}</span>
        <span class="pmenu-stat-lbl">Pending</span>
      </div>
      <div class="pmenu-stat-item">
        <span class="pmenu-stat-num" style="color:#10b981;">${stats.resolved}</span>
        <span class="pmenu-stat-lbl">Resolved</span>
      </div>
    `;

    itemsContainer.innerHTML = `
      <button type="button" class="pmenu-item-btn highlight" id="pmenuAdminBtn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        <span>Admin Management Desk</span>
        <span class="pmenu-item-tag">Console</span>
      </button>

      <button type="button" class="pmenu-item-btn" id="pmenuAnalyticsBtn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        <span>Municipal SLA Analytics</span>
      </button>

      <button type="button" class="pmenu-item-btn" id="pmenuViewIssuesBtn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
        <span>Public Registry Feed</span>
      </button>

      <button type="button" class="pmenu-item-btn" id="pmenuProfileModalBtn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
        <span>Officer ID & Clearances</span>
      </button>

      <button type="button" class="pmenu-item-btn" id="pmenuExportBtn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        <span>Export Complaints CSV</span>
      </button>

      <div class="pmenu-divider"></div>

      <button type="button" class="pmenu-item-btn danger" id="pmenuLogoutBtn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        <span>Sign Out of Staff Desk</span>
      </button>
    `;

    document.getElementById("pmenuAdminBtn")?.addEventListener("click", () => {
      navigate("admin");
      closeProfileMenu();
    });
    document.getElementById("pmenuAnalyticsBtn")?.addEventListener("click", () => {
      navigate("analytics");
      closeProfileMenu();
    });
    document.getElementById("pmenuViewIssuesBtn")?.addEventListener("click", () => {
      navigate("issues");
      closeProfileMenu();
    });
    document.getElementById("pmenuProfileModalBtn")?.addEventListener("click", () => {
      openProfileModal();
      closeProfileMenu();
    });
    document.getElementById("pmenuExportBtn")?.addEventListener("click", () => {
      document.getElementById("exportBtn")?.click();
      closeProfileMenu();
    });
    document.getElementById("pmenuLogoutBtn")?.addEventListener("click", () => {
      performAdminLogout();
      closeProfileMenu();
    });

  } else {
    // Citizen Mode
    statsContainer.innerHTML = `
      <div class="pmenu-stat-item">
        <span class="pmenu-stat-num" style="color:#ef4444;">${upvotedCount}</span>
        <span class="pmenu-stat-lbl">Upvoted</span>
      </div>
      <div class="pmenu-stat-item">
        <span class="pmenu-stat-num" style="color:#3b82f6;">${citizenCreatedCount}</span>
        <span class="pmenu-stat-lbl">Filed</span>
      </div>
      <div class="pmenu-stat-item">
        <span class="pmenu-stat-num" style="color:#10b981;">Good</span>
        <span class="pmenu-stat-lbl">Standing</span>
      </div>
    `;

    itemsContainer.innerHTML = `
      <button type="button" class="pmenu-item-btn" id="pmenuCitizenProfileBtn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
        <span>Citizen Profile & Ward Info</span>
      </button>

      <button type="button" class="pmenu-item-btn" id="pmenuReportBtn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
        <span>File a Public Issue Report</span>
      </button>

      <button type="button" class="pmenu-item-btn highlight" id="pmenuMyUpvotesBtn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <span>My Endorsed / Upvoted Issues</span>
        <span class="pmenu-item-tag">${upvotedCount}</span>
      </button>

      <button type="button" class="pmenu-item-btn" id="pmenuExploreBtn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <span>Browse All Community Issues</span>
      </button>

      <div class="pmenu-divider"></div>

      <button type="button" class="pmenu-item-btn" id="pmenuLoginBtn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
        <span>Staff / Officer Sign In</span>
        <span class="pmenu-item-tag">Admin</span>
      </button>
    `;

    document.getElementById("pmenuCitizenProfileBtn")?.addEventListener("click", () => {
      openProfileModal();
      closeProfileMenu();
    });
    document.getElementById("pmenuReportBtn")?.addEventListener("click", () => {
      navigate("report");
      closeProfileMenu();
    });
    document.getElementById("pmenuMyUpvotesBtn")?.addEventListener("click", () => {
      filterUserUpvotedIssues();
      closeProfileMenu();
    });
    document.getElementById("pmenuExploreBtn")?.addEventListener("click", () => {
      navigate("issues");
      closeProfileMenu();
    });
    document.getElementById("pmenuLoginBtn")?.addEventListener("click", () => {
      navigate("adminLogin");
      closeProfileMenu();
    });
  }
}

function filterUserUpvotedIssues() {
  navigate("issues");
  const sortSelect = document.getElementById("sortOrder");
  if (sortSelect) sortSelect.value = "upvotes";
  
  if (userUpvotedIds.size === 0) {
    showToast("You haven't upvoted any issues yet. Click the heart on any card to endorse it!", "info");
  } else {
    showToast(`Showing issues with ${userUpvotedIds.size} community endorsements!`, "success");
  }
  renderIssues();
}

function openProfileModal() {
  const modal = document.getElementById("profileModal");
  const body = document.getElementById("profileModalBody");
  if (!modal || !body) return;

  const isStaff = isAdminLoggedIn;
  const upvotedCount = userUpvotedIds.size;
  const stats = getStats();

  body.innerHTML = `
    <div class="profile-modal-badge-header" style="${isStaff ? 'background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%);' : 'background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);'}">
      <div class="profile-modal-user-row">
        <div class="avatar-ring" style="${isStaff ? 'background: linear-gradient(135deg, #10b981, #f59e0b);' : 'background: linear-gradient(135deg, var(--primary), #10b981);'}">
          <div class="avatar">${isStaff ? 'AD' : 'CF'}</div>
        </div>
        <div class="profile-modal-meta">
          <h3 id="profileModalTitle">${isStaff ? 'Officer Admin' : 'Citizen Contributor'}</h3>
          <p>${isStaff ? 'Department of Public Works & Infrastructure Maintenance' : 'Verified Resident · Civic Contributor Level 2'}</p>
          <span class="profile-modal-id-pill">${isStaff ? 'STAFF ID: PW-8842-GOV' : 'CITIZEN ID: CTZ-9104-PUB'}</span>
        </div>
      </div>
    </div>

    <div class="profile-details-grid">
      <div class="profile-detail-cell">
        <span>Account Status</span>
        <strong style="color: #10b981;">● ${isStaff ? 'Staff Verified (Active)' : 'Resident Good Standing'}</strong>
      </div>
      <div class="profile-detail-cell">
        <span>Jurisdiction</span>
        <strong>${isStaff ? 'Citywide Maintenance Hub' : 'Ward 4 - Metro & Central'}</strong>
      </div>
      <div class="profile-detail-cell">
        <span>Assigned Role</span>
        <strong>${isStaff ? 'Field Triage Supervisor' : 'Public Infrastructure Reporter'}</strong>
      </div>
      <div class="profile-detail-cell">
        <span>Platform Impact</span>
        <strong>${isStaff ? `${stats.resolved} Closed Solutions` : `${upvotedCount} Upvotes Recorded`}</strong>
      </div>
    </div>

    <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 14px; margin-bottom: 20px;">
      <span style="font-size: 0.72rem; font-weight: 700; color: var(--slate-500); text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 6px;">
        ${isStaff ? 'Administrative Security Clearances' : 'Citizen Participation Rights'}
      </span>
      <p style="font-size: 0.8rem; color: var(--slate-600); line-height: 1.5; margin: 0;">
        ${isStaff 
          ? 'Authorized for live status modification, municipal work order generation, CSV compliance audits, and issue priority escalation under Directive 2026-B.'
          : 'Granted full submission authority with GPS geotagging, public registry transparency access, upvote prioritization, and community resolution notifications.'}
      </p>
    </div>

    <div class="profile-modal-actions">
      ${isStaff ? `
        <button type="button" class="btn btn-secondary btn-sm" id="modalGoAdminBtn">
          <span>Go to Admin Panel</span>
        </button>
        <button type="button" class="btn btn-danger btn-sm" id="modalSignOutBtn">
          <span>Sign Out</span>
        </button>
      ` : `
        <button type="button" class="btn btn-secondary btn-sm" id="modalGoReportBtn">
          <span>Report New Issue</span>
        </button>
        <button type="button" class="btn btn-primary btn-sm" id="modalGoStaffBtn">
          <span>Officer Sign In →</span>
        </button>
      `}
    </div>
  `;

  document.getElementById("modalGoAdminBtn")?.addEventListener("click", () => {
    closeProfileModal();
    navigate("admin");
  });
  document.getElementById("modalSignOutBtn")?.addEventListener("click", () => {
    closeProfileModal();
    performAdminLogout();
  });
  document.getElementById("modalGoReportBtn")?.addEventListener("click", () => {
    closeProfileModal();
    navigate("report");
  });
  document.getElementById("modalGoStaffBtn")?.addEventListener("click", () => {
    closeProfileModal();
    navigate("adminLogin");
  });

  modal.classList.add("show");
}

function closeProfileModal() {
  document.getElementById("profileModal")?.classList.remove("show");
}

// Global Profile 3-dots Button and Profile Card Toggle Listeners
document.getElementById("profileBtn")?.addEventListener("click", (e) => {
  toggleProfileMenu(e);
});

document.getElementById("profileCard")?.addEventListener("click", (e) => {
  if (e.target !== document.getElementById("profileBtn") && !document.getElementById("profileBtn")?.contains(e.target)) {
    toggleProfileMenu(e);
  }
});

// Close Profile Dropdown when clicking outside
document.addEventListener("click", (e) => {
  const menu = document.getElementById("profileDropdownMenu");
  const card = document.getElementById("profileCard");
  if (menu && menu.classList.contains("show")) {
    if (!menu.contains(e.target) && !card?.contains(e.target)) {
      closeProfileMenu();
    }
  }
});

// Profile Modal Close Handlers
document.getElementById("profileModalClose")?.addEventListener("click", closeProfileModal);
document.getElementById("profileModal")?.addEventListener("click", (e) => {
  if (e.target.id === "profileModal") {
    closeProfileModal();
  }
});



// ==========================================================================
// ISSUE DETAILS MODAL
// ==========================================================================

function openIssueDetails(id) {
  const issue = issues.find(i => i.id === id);
  if (!issue) return;

  const modal = document.getElementById("issueModal");
  const content = document.getElementById("modalContent");
  const isUpvoted = userUpvotedIds.has(issue.id);

  // Status timeline calculation
  const isPending = issue.status === "Pending";
  const isInProg = issue.status === "In Progress";
  const isResolved = issue.status === "Resolved";

  content.innerHTML = `
    <div class="modal-header-meta">
      <span class="category-tag">
        <span>${getCategoryIcon(issue.category)}</span>
        <span>${escapeHTML(issue.category)}</span>
      </span>
      ${getPriorityBadge(issue.priority)}
      <span class="table-id-tag">${escapeHTML(issue.id)}</span>
    </div>

    <h2 class="modal-issue-title" id="modalIssueTitle">${escapeHTML(issue.title)}</h2>

    ${issue.image ? `
      <img src="${escapeHTML(issue.image)}" alt="${escapeHTML(issue.title)}" class="modal-image-full">
    ` : ""}

    <!-- RESOLUTION TIMELINE -->
    <div class="modal-timeline-box">
      <div class="timeline-title">Public Resolution Stepper</div>
      <div class="timeline-track">
        <div class="timeline-node completed">
          <div class="node-dot">1</div>
          <span class="node-label">Reported</span>
        </div>
        <div class="timeline-node ${!isPending ? 'completed' : 'current'}">
          <div class="node-dot">2</div>
          <span class="node-label">Triaged</span>
        </div>
        <div class="timeline-node ${isResolved ? 'completed' : isInProg ? 'current' : ''}">
          <div class="node-dot">3</div>
          <span class="node-label">In Progress</span>
        </div>
        <div class="timeline-node ${isResolved ? 'completed' : ''}">
          <div class="node-dot">4</div>
          <span class="node-label">Resolved</span>
        </div>
      </div>
    </div>

    <div class="modal-info-grid">
      <div class="info-grid-cell">
        <span class="info-grid-label">Location</span>
        <span class="info-grid-val">📍 ${escapeHTML(issue.location)}</span>
      </div>
      <div class="info-grid-cell">
        <span class="info-grid-label">Assigned Department</span>
        <span class="info-grid-val">${getCategoryDept(issue.category)}</span>
      </div>
      <div class="info-grid-cell">
        <span class="info-grid-label">Submission Date</span>
        <span class="info-grid-val">${formatDate(issue.date)}</span>
      </div>
      <div class="info-grid-cell">
        <span class="info-grid-label">Coordinates</span>
        <span class="info-grid-val">
          ${issue.latitude && issue.longitude
            ? `<a href="https://www.openstreetmap.org/?mlat=${issue.latitude}&mlon=${issue.longitude}#map=17/${issue.latitude}/${issue.longitude}" target="_blank" rel="noopener" style="color:var(--primary);text-decoration:underline;">${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)} ↗</a>`
            : "Not specified"
          }
        </span>
      </div>
    </div>

    <div class="modal-desc-block">
      <h4>Detailed Description</h4>
      <p>${escapeHTML(issue.description)}</p>
    </div>

    <div class="modal-desc-block" style="background:#f0fdf4; border:1px solid #bbf7d0; padding:16px; border-radius:10px;">
      <h4 style="color:#166534;">Official Municipal Response</h4>
      <p style="color:#14532d; font-size: 0.85rem;">
        ${escapeHTML(issue.officialNote || "Ticket received by municipal triage desk. Field inspection pending assignment.")}
      </p>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px; border-top:1px solid var(--slate-200); padding-top:18px;">
      <button
        type="button"
        class="btn ${isUpvoted ? 'btn-danger' : 'btn-secondary'} btn-sm"
        data-upvote-id="${escapeHTML(issue.id)}"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="${isUpvoted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <span>${issue.upvotes || 0} Upvotes</span>
      </button>

      ${issue.latitude && issue.longitude ? `
        <button
          type="button"
          class="btn btn-outline btn-sm"
          onclick="viewOnExploreMap(${issue.latitude}, ${issue.longitude}, '${escapeHTML(issue.id)}')"
        >
          <span>View on Map</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
        </button>
      ` : ""}
    </div>
  `;

  modal.classList.add("show");
}

window.openIssueDetails = openIssueDetails;

window.viewOnExploreMap = function(lat, lng, id) {
  document.getElementById("issueModal")?.classList.remove("show");
  navigate("issues");
  document.getElementById("modeMapBtn")?.click();
  setTimeout(() => {
    if (exploreMap) {
      exploreMap.setView([lat, lng], 16);
      const marker = exploreMarkers.find(m => m.issueId === id);
      if (marker) marker.openPopup();
    }
  }, 300);
};

// Modal open delegate
document.addEventListener("click", e => {
  const target = e.target.closest("[data-open-id]");
  if (target && !e.target.closest("[data-upvote-id]") && !e.target.closest(".admin-status-select") && !e.target.closest(".btn-icon-table.delete")) {
    openIssueDetails(target.dataset.openId);
  }
});

document.getElementById("modalClose")?.addEventListener("click", () => {
  document.getElementById("issueModal")?.classList.remove("show");
});

document.getElementById("issueModal")?.addEventListener("click", e => {
  if (e.target.id === "issueModal") {
    e.target.classList.remove("show");
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.getElementById("issueModal")?.classList.remove("show");
    document.getElementById("deleteConfirmModal")?.classList.remove("show");
    closeProfileMenu();
    closeProfileModal();
  }
});

// ==========================================================================
// FORM REPORT SUBMISSION LOGIC
// ==========================================================================

let uploadedImageDataUrl = "";
let selectedReportCoordinates = null;
const imageInput = document.getElementById("issueImage");
const dropZone = document.getElementById("dropZone");
const previewBox = document.getElementById("previewBox");
const dropzoneContent = document.getElementById("dropzoneContent");
const imagePreview = document.getElementById("imagePreview");
const fileNameSpan = document.getElementById("fileName");
const fileSizeSpan = document.getElementById("fileSize");
const removePhotoBtn = document.getElementById("removePhotoBtn");

// Character counters
document.getElementById("issueTitle")?.addEventListener("input", e => {
  document.getElementById("titleCount").textContent = e.target.value.length;
});

document.getElementById("issueDescription")?.addEventListener("input", e => {
  document.getElementById("descCount").textContent = e.target.value.length;
});

// Drag and drop setup
if (dropZone && imageInput) {
  dropZone.addEventListener("click", e => {
    if (e.target !== removePhotoBtn && !removePhotoBtn.contains(e.target)) {
      imageInput.click();
    }
  });

  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelection(e.dataTransfer.files[0]);
    }
  });

  imageInput.addEventListener("change", e => {
    if (e.target.files && e.target.files[0]) {
      handleImageSelection(e.target.files[0]);
    }
  });
}

async function handleImageSelection(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    showToast("Please upload a valid image file (JPG, PNG, or WEBP).", "warning");
    return;
  }

  showToast("Optimizing photograph for fast upload...", "info");

  try {
    const compressed = await compressImageFile(file, 900, 900, 0.75);
    uploadedImageDataUrl = compressed;

    imagePreview.src = compressed;
    fileNameSpan.textContent = file.name;
    const estSize = Math.round((compressed.length * 3) / 4 / 1024);
    fileSizeSpan.textContent = `${estSize} KB (Optimized)`;

    dropzoneContent.style.display = "none";
    previewBox.style.display = "flex";
    showToast("Photo ready for submission", "success");
  } catch (err) {
    console.error("Compression error:", err);
    showToast("Could not process image. Please try another.", "error");
  }
}

removePhotoBtn?.addEventListener("click", e => {
  e.stopPropagation();
  uploadedImageDataUrl = "";
  if (imageInput) imageInput.value = "";
  imagePreview.src = "";
  previewBox.style.display = "none";
  dropzoneContent.style.display = "flex";
  showToast("Photo removed", "info");
});

// Clear report form
function resetReportForm() {
  document.getElementById("reportForm")?.reset();
  uploadedImageDataUrl = "";
  selectedReportCoordinates = null;
  if (imageInput) imageInput.value = "";
  imagePreview.src = "";
  previewBox.style.display = "none";
  dropzoneContent.style.display = "flex";

  document.getElementById("titleCount").textContent = "0";
  document.getElementById("descCount").textContent = "0";

  document.getElementById("issueLatitude").value = "";
  document.getElementById("issueLongitude").value = "";
  document.getElementById("latitudeText").textContent = "Not selected";
  document.getElementById("longitudeText").textContent = "Not selected";
  document.getElementById("locationStatus").textContent = "Click anywhere on the map or drag the pin to set the exact coordinates";

  if (reportMarker && reportMap) {
    reportMap.removeLayer(reportMarker);
    reportMarker = null;
  }
}

document.getElementById("resetForm")?.addEventListener("click", resetReportForm);
document.getElementById("clearCoordsBtn")?.addEventListener("click", () => {
  selectedReportCoordinates = null;
  document.getElementById("issueLatitude").value = "";
  document.getElementById("issueLongitude").value = "";
  document.getElementById("latitudeText").textContent = "Not selected";
  document.getElementById("longitudeText").textContent = "Not selected";
  document.getElementById("locationStatus").textContent = "Location pin cleared";
  if (reportMarker && reportMap) {
    reportMap.removeLayer(reportMarker);
    reportMarker = null;
  }
  showToast("Location coordinates cleared", "info");
});

// SUBMIT FORM HANDLER (Fixed all bugs!)
const reportForm = document.getElementById("reportForm");
if (reportForm) {
  reportForm.addEventListener("submit", function (e) {
    e.preventDefault();

    try {
      const titleInput = document.getElementById("issueTitle");
      const categoryInput = document.getElementById("issueCategory");
      const priorityInput = document.getElementById("issuePriority");
      const locationInput = document.getElementById("issueLocation");
      const descInput = document.getElementById("issueDescription");
      const confirmInput = document.getElementById("confirmDetails");

      const title = (titleInput?.value || "").trim();
      const category = categoryInput?.value || "";
      const priority = priorityInput?.value || "Medium";
      const location = (locationInput?.value || "").trim();
      const description = (descInput?.value || "").trim();
      const confirmed = confirmInput?.checked || false;

      // Validation
      if (!title || !category || !location || !description) {
        showToast("Please fill in all required fields marked with *", "warning");
        return;
      }

      if (title.length < 5) {
        showToast("Title must be at least 5 characters long.", "warning");
        titleInput?.focus();
        return;
      }

      if (location.length < 3) {
        showToast("Please specify an accurate location.", "warning");
        locationInput?.focus();
        return;
      }

      if (description.length < 15) {
        showToast("Please write at least 15 characters in the description.", "warning");
        descInput?.focus();
        return;
      }

      if (!confirmed) {
        showToast("Please check the confirmation box to submit.", "warning");
        return;
      }

      const newIssue = {
        id: "CF-" + Math.floor(1000 + Math.random() * 9000),
        title,
        category,
        priority,
        location,
        description,
        status: "Pending",
        date: new Date().toISOString(),
        image: uploadedImageDataUrl || "",
        latitude: selectedReportCoordinates ? selectedReportCoordinates.lat : null,
        longitude: selectedReportCoordinates ? selectedReportCoordinates.lng : null,
        upvotes: 1,
        officialNote: "Ticket logged by citizen. Under preliminary review by Municipal Desk."
      };

      // Add to beginning of array
      issues.unshift(newIssue);
      userUpvotedIds.add(newIssue.id);

      if (!saveIssues()) {
        issues.shift();
        userUpvotedIds.delete(newIssue.id);
        showToast("Submission failed: Local storage limit reached.", "error");
        return;
      }

      saveUpvotes();
      resetReportForm();

      showToast(`Success! Report ${newIssue.id} registered with City Council.`, "success");
      renderAll();
      navigate("issues");

    } catch (err) {
      console.error("CivicFix report submission error:", err);
      showToast("Submission error: " + err.message, "error");
    }
  });
}

// ==========================================================================
// LEAFLET MAPS: REPORT PICKER & EXPLORE MAP
// ==========================================================================

let reportMap = null;
let reportMarker = null;

let exploreMap = null;
let exploreMarkers = [];

// 1. Report Form Map Initializer
function initReportMap() {
  const mapEl = document.getElementById("issueMap");
  if (!mapEl || typeof L === "undefined" || reportMap) return;

  // Default coordinates centered on a municipal urban hub (e.g. San Francisco)
  const defaultLat = 37.7749;
  const defaultLng = -122.4194;

  reportMap = L.map("issueMap", {
    zoomControl: true,
    scrollWheelZoom: false
  }).setView([defaultLat, defaultLng], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(reportMap);

  reportMap.on("click", e => {
    setReportCoordinates(e.latlng.lat, e.latlng.lng, true);
  });
}

function setReportCoordinates(lat, lng, reverseGeocode = false) {
  lat = Number(lat);
  lng = Number(lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

  selectedReportCoordinates = { lat, lng };

  document.getElementById("issueLatitude").value = lat;
  document.getElementById("issueLongitude").value = lng;
  document.getElementById("latitudeText").textContent = lat.toFixed(5);
  document.getElementById("longitudeText").textContent = lng.toFixed(5);
  document.getElementById("locationStatus").textContent = `Selected: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

  if (!reportMarker) {
    reportMarker = L.marker([lat, lng], { draggable: true }).addTo(reportMap);
    reportMarker.on("dragend", e => {
      const pos = e.target.getLatLng();
      setReportCoordinates(pos.lat, pos.lng, true);
    });
  } else {
    reportMarker.setLatLng([lat, lng]);
  }

  reportMap.setView([lat, lng], Math.max(reportMap.getZoom(), 15));

  // Reverse geocode to auto-fill location address if empty or updated
  if (reverseGeocode) {
    reverseGeocodeLocation(lat, lng);
  }
}

// OpenStreetMap Nominatim reverse geocode (with friendly timeout)
async function reverseGeocodeLocation(lat, lng) {
  const locInput = document.getElementById("issueLocation");
  const statusEl = document.getElementById("locationStatus");

  try {
    statusEl.textContent = "Resolving street address...";
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: { "Accept-Language": "en" }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        // Pick friendly short address
        const parts = data.display_name.split(",");
        const shortAddr = parts.slice(0, 3).join(",").trim();
        if (locInput && (!locInput.value || locInput.value.startsWith("Coordinates:"))) {
          locInput.value = shortAddr;
        }
        statusEl.textContent = `📍 ${shortAddr}`;
        return;
      }
    }
  } catch (err) {
    // Non-critical background feature
    console.debug("Reverse geocode skipped:", err);
  }
  statusEl.textContent = `Pinpoint set: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

// Map Address Search
document.getElementById("mapSearchBtn")?.addEventListener("click", searchMapAddress);
document.getElementById("mapSearchInput")?.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchMapAddress();
  }
});

async function searchMapAddress() {
  const query = document.getElementById("mapSearchInput")?.value?.trim();
  if (!query) {
    showToast("Please enter an address or area to search", "info");
    return;
  }

  showToast(`Searching for "${query}"...`, "info");
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: { "Accept-Language": "en" }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        setReportCoordinates(lat, lon, false);
        const locInput = document.getElementById("issueLocation");
        if (locInput) locInput.value = item.display_name.split(",").slice(0, 3).join(",").trim();
        showToast("Address found on map!", "success");
        return;
      }
    }
    showToast("Location not found. Try clicking directly on the map.", "warning");
  } catch (err) {
    showToast("Search service unavailable. Click directly on the map.", "error");
  }
}

// GPS Location
document.getElementById("useMyLocation")?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showToast("Geolocation is not supported by your browser.", "warning");
    return;
  }

  showToast("Requesting device GPS coordinates...", "info");
  navigator.geolocation.getCurrentPosition(
    pos => {
      setReportCoordinates(pos.coords.latitude, pos.coords.longitude, true);
      showToast("Current location pinpointed!", "success");
    },
    err => {
      showToast("Could not access location. Please click on the map.", "warning");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
  );
});

// 2. Explore Issues Map Initializer
function initExploreMap() {
  const mapEl = document.getElementById("exploreMap");
  if (!mapEl || typeof L === "undefined" || exploreMap) return;

  exploreMap = L.map("exploreMap", {
    zoomControl: true
  }).setView([37.7749, -122.4194], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(exploreMap);
}

function renderExploreMapMarkers() {
  if (!exploreMap) return;

  exploreMarkers.forEach(m => m.remove());
  exploreMarkers = [];

  const filtered = getFilteredIssues();
  const bounds = [];

  filtered.forEach(issue => {
    if (issue.latitude == null || issue.longitude == null) return;
    const lat = Number(issue.latitude);
    const lng = Number(issue.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    bounds.push([lat, lng]);

    // Custom color marker
    const statusCls = getStatusClass(issue.status);
    const marker = L.circleMarker([lat, lng], {
      radius: 9,
      fillColor: issue.status === "Resolved" ? "#10b981" : issue.status === "In Progress" ? "#8b5cf6" : "#f59e0b",
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95
    }).addTo(exploreMap);

    marker.issueId = issue.id;

    const popupHtml = `
      <div style="min-width: 190px; font-family: sans-serif; line-height: 1.4;">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 3px;">
          ${getCategoryIcon(issue.category)} ${escapeHTML(issue.category)}
        </div>
        <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 5px;">
          ${escapeHTML(issue.title)}
        </strong>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
          📍 ${escapeHTML(issue.location)}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px;">
          <span style="font-size: 10px; font-weight: 700; color: #3b82f6;">${escapeHTML(issue.id)}</span>
          <button
            onclick="openIssueDetails('${escapeHTML(issue.id)}')"
            style="background: #2563eb; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; font-weight: 600;"
          >
            Details →
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    exploreMarkers.push(marker);
  });

  if (bounds.length > 0) {
    exploreMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }
}

// ==========================================================================
// MASTER RENDER DISPATCHER
// ==========================================================================

function renderAll() {
  renderDashboard();
  renderIssues();
  renderAnalytics();
  renderAdmin();
}

// ==========================================================================
// APPLICATION INITIALIZATION
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initReportMap();
  updateAdminProfileUI();
  renderAll();
  console.log("CivicFix Municipal Platform ready. Total loaded issues:", issues.length);
});