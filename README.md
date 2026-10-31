# CivicFix - Smart Public Issue Reporting & Community Governance Platform

A modern, responsive, municipal-grade civic portal designed to connect citizens with local public works authorities for reporting and tracking public infrastructure problems (potholes, sanitation, water leaks, power outages, damaged streetlights, and drainage issues).

---

## 🚀 Quick Start

1. Navigate to the project folder:
   ```
   C:\Users\nived\.gemini\antigravity\scratch\civicfix
   ```
2. Simply double-click **`index.html`** or open it in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari).
3. No build steps, dependencies, or local web server required. All assets (fonts, icons, Leaflet OpenStreetMap) load smoothly from modern CDNs.

---

## 🛠️ Errors Cleared & Bugs Fixed

| Component | Previous Issue / Error | Solution Applied |
| :--- | :--- | :--- |
| **Missing Title Input** | In `#reportForm`, the title input was completely omitted and its placeholder (`"Enter issue title"`) was placed inside a duplicate `#issueLocation` field. Form submission failed with `TypeError: Cannot read properties of null (reading 'value')`. | Added a dedicated `#issueTitle` text field with character counter (`0/120`) and distinct styling. |
| **Duplicate Element IDs** | Multiple elements had `id="issueLocation"`, causing DOM selector collisions and ambiguous form value retrieval. | Normalized DOM IDs: distinct `#issueTitle`, `#issueLocation`, `#mapSearchInput`, `#issueLatitude`, and `#issueLongitude`. |
| **Map Rendering on Hidden Tab** | Leaflet was initialized on `<div id="issueMap">` while its container was hidden (`display: none`), leading to zero-dimension calculations and broken grey tile grids. | Added map container lifecycle management: auto-invalidates size whenever the Report or Explore views are activated. |
| **LocalStorage Quota Crash** | Storing uncompressed raw photo base64 strings quickly triggered browser `QuotaExceededError` (>5MB limit). | Implemented an offscreen **HTML5 Canvas Image Compressor** that automatically resizes images to a maximum of 900×900px at 0.75 JPEG quality (~60KB), enabling dozens of photo reports without storage exhaustion. |
| **Dead Buttons & Broken Icons** | Notification icon (`♧`), profile menu, and view toggles had no functional callbacks or real data. | Added an active notification dropdown panel with unread badges, mark-as-read actions, and interactive card filtering from dashboard KPI tiles. |
| **Mobile Drawer Glitches** | Mobile sidebar had no backdrop, causing clicks on the rest of the screen to fail to dismiss the drawer. | Built an interactive slide-over drawer with backdrop blur and touch dismiss. |

---

## ✨ Key Improvisations & Professional Enhancements

1. **Dual Leaflet & OpenStreetMap Integration**:
   - **Report Pinpoint Map**: Interactive draggable pin with latitude/longitude readout, address search bar via OpenStreetMap Nominatim, and automatic **Reverse Geocoding** (dragging the pin automatically fills in the physical street address!).
   - **Community Map View**: Seamless toggle between card grid and live citywide map in *Explore Issues* with color-coded status markers (Pending = Amber, In Progress = Purple, Resolved = Emerald) and rich interactive popups.

2. **Citizen Upvote & Endorsement System**:
   - Residents can click the upvote icon on any card or detail modal to signal urgency to municipal authorities. Upvotes persist in `localStorage`.

3. **Municipal Resolution Lifecycle Stepper**:
   - Every report features a 4-step progress stepper: *1. Citizen Submission → 2. Department Triage → 3. Field Action & Repair → 4. Inspection & Closure*.

4. **Modern Design System & Vector SVG Icons**:
   - Replaced placeholder unicode characters (`▤`, `◷`, `↻`, `✓`, `♧`) with clean, inline vector SVGs.
   - Refined typography with *Plus Jakarta Sans* headings and *Inter* body text.
   - Professional municipal palette (Deep Slate `#0f172a`, Civic Blue `#2563eb`, Emerald `#059669`, Amber `#d97706`).

5. **Live Analytics & SLA Benchmarking**:
   - Resolution efficiency rate, sector breakdowns, lifecycle pipeline status rings, and departmental SLA turnaround benchmarks.

6. **Full-Featured Admin Management Portal & Secure Login Gate**:
   - **Dedicated Staff Login Gateway**: Restricted authentication screen preventing unauthorized access to the admin triage ledger.
   - **Demo Credentials**:
     - **Email:** `admin@civicfix.gov`
     - **Passcode:** `admin123`
     - Includes a **1-Click Auto Fill** button and password visibility toggle.
   - **Session Persistence**: Choice between temporary session authentication and persistent device login.
   - **Dynamic Role Reflection**: Logging in updates the user avatar to *AD*, changes title to *Officer Admin (Active)*, and activates staff controls.
   - **Official Sign Out**: One-click logout that terminates the session and safely returns to the public portal.
   - Real-time search and status filtering for municipal staff.
   - Live status changer dropdown with instant auto-save.
   - Modal confirmation before report deletion.
   - One-click **CSV Audit Export** and **Reset Demo Data** capability.
