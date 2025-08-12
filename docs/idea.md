# 🧠 OpenBioCure – Product Idea Capture Log

This document captures all raw ideas and product concepts as provided, structured per feature using a consistent template to preserve original intent.

---

## 🔹 Centralized Research Dashboard

* Intent: Provide a home screen for users with personalized insights and entry points
* Details:

  * Shows:

    * Recent activity: latest publications, workspace changes, team invites
    * Topic trends: top virus/disease topics by volume
    * Metrics: document count, entities extracted, top tags
    * Subscribed topic updates (e.g., RSV, Cancer)
  * Widgets:

    * Timeline chart of publications by topic
    * Heatmap of ingestion activity
    * List of meta-analysis in progress or completed
    * Notification center with summarizer
  * Personalization:

    * Based on user's role, tenant, and subscribed topics
    * Admins see tenant usage stats and quotas
* Dependencies: Aggregation layer, summarizer, visual widget engine
* Persona: Scholar, Collaborator, Tenant Admin, Observer
* Permissions:

  * Scholar: personal + team workspaces
  * SaaS Admin: tenant-wide usage, topics
  * Platform Admin: all tenants
* Priority: MVP
* Next Step: Define data sources per widget and role-based filters

---

## 🔹 AI Assistant (Core Feature)

* Intent: Enable scholars and teams to interact with ingested data (or uploaded content) in a smart, explainable way
* Details:

  * Supports 3 scopes:

    1. Full datalake (public ingest)
    2. Workspace-specific (user upload)
    3. Team workspace (shared research context)
  * Summarizes documents, extracts entities, answers questions, finds patterns
  * Enables cross-topic correlation (e.g., virus-vs-bacteria)
  * Private workspace data can remain unpublished
* Dependencies: Vector DB, RAG, ingestion
* Persona: Scholar, Workspace Collaborator, Tenant Admin
* Permissions:

  * Scoped to data access level (public, private, team)
* Priority: MVP
* Next Step: Confirm assistant UI, fallback behavior, traceability logging

---

## 🔹 Workspace & Team Collaboration

* Intent: Allow scholars to explore research ideas without polluting the datalake; optionally publish as validated findings
* Details:

  * User creates a workspace and selects scope:

    * Personal (private analysis)
    * Team (invite-only research group)
    * Public (publish after validation)
  * Uploads can include documents, preprints, or proprietary IP
  * AI operates on workspace-only or combined content
  * Workspaces can generate:

    * Research notes
    * Summarized findings
    * Meta-analyses combining multiple sources
  * Published workspaces become visible to all (or tenant-only)
* Feature: Meta-Analysis Generator:

  * Purpose: Synthesize insights from multiple ingested documents within a workspace
  * Accepts: Clinical trials, publications, MMWR reports, preprints
  * Extracts: Efficacy metrics, confidence intervals, demographic insights, outcomes
  * Outputs: Cohesive summary with citations, ideal for scholarly publishing
  * Example: RSV vaccine comparison across age ≥60 populations
* Dependencies: RAG engine, document ingestion, citation linker
* Persona: Scholar, Workspace Owner, Collaborator
* Permissions: Owner manages members and publish rights
* Priority: MVP for workspaces, Phase 2 for meta-analysis tooling
* Next Step: Define citation linking, multi-source entity extraction, UI for result publishing

---

## 🔹 Topic Subscription + Notifications

* Intent: Let users follow topics (e.g. HIV, RSV) and receive updates on new publications or findings
* Details:

  * Weekly or real-time digest of new ingested content
  * AI generates a summary of what changed or was added
  * Tenant can define organization-wide interest areas
  * Delivered as email, dashboard widget, or web push
* Dependencies: Ingestion pipeline, tagging, AI summarizer
* Persona: Scholar, Observer, SaaS Admin
* Permissions: Opt-in per user, managed lists for tenants
* Priority: MVP
* Next Step: Tag-to-topic mapping, notification templates

---

## 🔹 Global Medical Breakthrough Feed

* Intent: Publicly highlight major medical discoveries; useful to all tenants and hospitals
* **Details**:

  * Powered by MCP browser + summarizer
  * Organized by topic (e.g., RSV, Cancer, Cardiology)
  * Includes date, title, bullets, source link, “why it matters”
  * Versioned daily/weekly, public access
* **Dependencies**: MCP agent, summarizer, tagging model
* **Persona**: Scholar, Public Health Lead, HospitalOpsViewer
* **Permissions**: Public feed, optionally embedded into tenant dashboards
* **Priority**: MVP
* **Next Step**: Finalize structure and summary style

---

## 🔹 Clinical Operations Optimization Assistant

* **Intent**: Help hospitals and public systems identify treatment protocols that lower cost per admission while maintaining or improving care quality
* **Details**:

  * Focuses on optimizing cost **during admission**, not avoiding readmissions
  * Accepts queries like: “what is the lowest-cost treatment protocol for RSV in elderly patients?”, “how to manage diabetes inpatient care with minimal cost impact?”, “which wound care method speeds up recovery **and reduces material use?”**
  * Assistant responds with:

    * Evidence-backed, cost-efficient protocols
    * Comparative outcomes (e.g., healing time, complication rates)
    * Source citations and confidence levels
  * Enables:

    * **Hospitals** to apply protocols that reduce LOS (length of stay) or material use (e.g. stitching techniques that lead to faster healing)
    * **Elderly care improvements that reduce nurse rounds, re-treatments**
    * **Governments/insurers** to model savings at scale
    * **Patients** to understand value-based care options
* **Dependencies**: Protocol-outcome mapping, RCT ingestion, clinical efficiency models
* **Persona**: HospitalOpsViewer, PayerAnalyst, ClinicalLead
* **Permissions**: Read-only with search, filter, region
* **Priority**: Phase 2
* **Next Step**: Ingest procedure-level data with outcomes; tag for cost, efficiency, demographics

---

## 🔹 Tenant & Role System (Multi-Tenant)

* **Intent**: Differentiate between global platform admins, tenant (SaaS) admins, and regular users
* **Details**:

  * Super Admin: controls platform, tenants, infrastructure
  * SaaS Admin: manages institution (users, limits, topics)
  * Researcher/Admin roles per tenant
  * Tenants configure their visible topics, default roles
* **Dependencies**: Role/tenant model, usage limits, dashboards
* **Persona**: Platform Admin, SaaS Admin, Scholar
* **Permissions**: See table below
* **Priority**: MVP

| Role              | Description          | Key Permissions                             |
| ----------------- | -------------------- | ------------------------------------------- |
| Platform Admin    | Oversees all tenants | User/tenant creation, config, kill-switches |
| SaaS Admin        | Manages their org    | Users, usage quotas, topic defaults         |
| Scholar           | End-user             | Create workspaces, use AI, follow topics    |
| Collaborator      | Workspace peer       | View/add content, use AI inside workspace   |
| Observer          | Passive viewer       | View shared content, subscribe to topics    |
| HospitalOpsViewer | Hospital role        | Access optimization assistant               |

---

## 🔹 Usage Metrics + Consumption Tracking

* **Intent**: Track how tenants and users consume the platform (storage, AI tokens, ingest size)
* **Details**:

  * Shows # documents, storage (GB), AI tokens used
  * SaaS admin dashboard with historical chart
  * Optional billing logic: free tier vs consumption-based
  * Consumption includes public vs private separately
* **Dependencies**: Token accounting, usage logs
* **Persona**: SaaS Admin, Platform Admin
* **Permissions**: Tenant-limited view
* **Priority**: MVP
* **Next Step**: Define credit model and display rules

---

## 🔹 Conversational Data Exploration with Visual Insights (DuckDB-inspired)

* **Intent**: Let users explore data using natural language, and instantly visualize insights without needing ML knowledge
* **Details**:

  * Uses conversational interface to ask things like:

    * "Show publication trends for RSV by year"
    * "Compare RSV vs COVID for hospitalizations in elderly"
  * Generates graphs, tables, or entity timelines automatically
  * Feels like DuckDB, but no SQL knowledge required
  * Uses vectorized + columnar querying engine (DuckDB or compatible)
  * Works on local workspace data or shared datasets
* **Dependencies**: Embedded DuckDB, NLP parser, plot renderer
* **Persona**: Scholar, Data Explorer, Non-technical researcher
* **Permissions**: Data access-bound; only works on datasets user can see
* **Priority**: Phase 2
* **Next Step**: Prototype voice-to-query layer; define chart types and limits

---
