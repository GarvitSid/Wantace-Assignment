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