# Engineering Decisions

## 1. Architecture & Stack
**Status:** Decided

**Decision:** 
We will use the MERN stack (MongoDB, Express, React/Vite, Node.js). 
For the database ORM, we are using Mongoose 

**Reasoning:**
The estimator relies heavily on highly nested configuration data (questions, options with varying properties like `rate_per_sqft` vs `multiplier`) and dynamic customer answers. MongoDB's document-oriented structure handles these flexible JSON payloads natively without requiring complex relational joins.