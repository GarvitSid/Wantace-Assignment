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