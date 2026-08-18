# Engineering Decisions

## 1. Architecture & Stack
**Status:** Decided

**Decision:** 
We will use the MERN stack (MongoDB, Express, React/Vite, Node.js). 
For the database ORM, we are using Mongoose 

**Reasoning:**
The estimator relies heavily on highly nested configuration data (questions, options with varying properties like `rate_per_sqft` vs `multiplier`) and dynamic customer answers. MongoDB's document-oriented structure handles these flexible JSON payloads natively without requiring complex relational joins.

## 2. Data Seeding, Legacy Leads & Safety
**Status:** Completed

**Decision:** 
The database seed script (`seed.js`) handles both data normalization and safety. 
1. **Safety:** It uses a non-destructive `countDocuments()` check to verify the database is completely empty before executing. It will safely abort if data exists, preventing the accidental wiping of production leads or owner configurations.
2. **Legacy Leads:** The provided seed data contained a historical lead (Bill Tanner, config_version: 1) with answer fields not present in the Version 3 configuration (e.g., `chimney_count`, `gutter_replace`). I explicitly designed the `Lead` schema's `answers` field as a flexible `Mixed` type (JSON) to store historical payloads exactly as they were captured, ensuring past records are never broken by future configuration changes.
3. **Data Normalization:** Mongoose's built-in schema casting automatically handles the string multiplier `"1.12"` found in the brief, normalizing it to a float upon insertion.

## 3. Calculation Formula & Validation
**Status:** Completed

**Decision:** 
The pricing logic is strictly executed on the server via `services/calculator.js` to prevent frontend tampering. Missing or invalid inputs (e.g., omitting the `roof_area` or submitting a material not found in the current active configuration) explicitly throw validation errors rather than silently defaulting to zero. 

**Formula Used:**
*   **Base Material Cost** = (Roof Area × Rate Per SqFt) × (1 + Waste Factor)
*   **Tear-Off Cost** = Roof Area × Tear-Off Rate Per SqFt
*   **Adjusted Subtotal** = (Base Material Cost + Tear-Off Cost) × Pitch Multiplier × Stories Multiplier
*   **Midpoint** = Adjusted Subtotal + Permit Flat Fee
*   The final low and high bounds are calculated by applying the `range_spread_pct` (e.g., ±12%) to the Midpoint and rounding to the nearest whole dollar.

*Note:* The historical estimates in the seed data (e.g., Ana Ruiz's legacy total of 21,480-27,260) are retained for historical display, but new estimates run purely on this deterministic formula.

## 4. Public API & Security Boundaries
**Status:** Completed

**Decision:** 
The `GET /api/config` endpoint intentionally strips out `rate_per_sqft`, `multiplier`, and global modifiers before sending the configuration to the client. The frontend only receives the `label` and `value` for each option.

**Reasoning:**
The client brief requires protecting proprietary pricing formulas so they cannot be read or tampered with from the browser. By restricting the payload strictly to rendering requirements, the frontend remains completely ignorant of the business logic, establishing a hard security boundary.

## 5. Frontend Architecture & The "Dumb Client"
**Status:** Completed

**Decision:** 
The React frontend acts as a pure renderer. The `QuestionField` component dynamically loops through the JSON payload to render inputs based strictly on `question.type`. 

**Reasoning:**
This satisfies the strict requirement of zero hardcoded pricing or question logic in the client. Furthermore, during development, I decided to remove frontend filtering for inactive questions. Because the Express backend already strips inactive questions via the `GET /api/config` controller, the client can blindly trust the API payload. This centralizes the filtering logic entirely on the server.

## 6. Scope Management (What was deliberately NOT built)
Given the 24-hour constraint, I aggressively prioritized the core business flow, operational stability, and security over peripheral features:
* **No Complex RBAC/OAuth:** I implemented a secure JWT-based Basic Auth system. Building role-based access control, password reset flows, or Google OAuth would have compromised the time needed to perfect the core calculation engine and dynamic UI rendering.
* **No Frontend State Management Libraries:** Context/Redux was omitted in favor of simple state passing, keeping the bundle size small and logic straightforward.
* **No CSV Export / Webhooks:** While listed as stretch goals, I prioritized end-to-end deployment, robust error handling, and documentation over these features to guarantee a flawless core submission.

## 7. Questions for Dale (Production Considerations)
If this were moving into a full production cycle, I would ask the client:
1. **Partial Leads:** "If a user answers all the roofing questions but abandons the form at the contact step, do you still want us to log those answers anonymously to see where they dropped off?"
2. **Tax Handling:** "The current formula does not explicitly detail state/local sales tax. Should tax be baked into the material rates, or applied dynamically based on the customer's zip code?"
3. **Missing Data Fallbacks:** "If a user bypasses validation and submits a missing required field, the system currently rejects the request entirely. Would you prefer it defaults to the highest/safest multiplier instead to still capture the lead?"

## 8. Next Steps (With 1 More Week)
1. **Automated Testing:** Implement Jest for the `calculator.js` service to rigorously test edge cases (NaN inputs, zero values, extreme bounds).
2. **Configuration Diffing:** Add a "Version History" view in the Owner Panel so Dale can see exactly what prices Marcus changed last week.
3. **CSV Exports:** Add the stretch goal to export the `Leads` table to CSV for external CRM importing.
4. **Frontend:** Currently the web pages are in standard form(box and test) format. Proper responsive and dynamic web components could be implemented for more client engagement.