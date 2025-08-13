# 🤖 AI Assistant Epic - OpenBioCure

## Overview
Enable scholars and teams to interact with ingested data or uploaded content through conversational AI that is explainable, scoped, and auditable.

## Epic Goals
- Provide intelligent summarization and entity extraction
- Enable cross-topic correlation and pattern discovery
- Support public, private, and team scopes without leakage
- Deliver explainable answers with citations and trace logs

## Personas
- **Scholar** - academic researcher who asks questions and reviews evidence
- **Team collaborator** - participates in shared workspaces and reviews AI outputs
- **SaaS admin** - configures tenant policies, quotas, and usage
- **Platform admin** - operates the platform and global settings
- **HospitalOps viewer** - explores cost and protocol insights read-only

## Assumptions
- Datalake on MinIO stores PDFs and artifacts
- Vector index available for RAG
- Canonical metadata in Postgres with optional Neo4j mirror
- RBAC and audit logs exist at request time

## Out of Scope for MVP
- Real-time auto-translation of documents
- On-device inference
- PHI ingestion beyond de-identified data

---

## User Stories

### Core AI Capabilities

#### US-010: Document Summarization
**As a** Scholar  
**I want** AI summaries  
**So that** I can understand papers quickly  

**Acceptance:**
- 100 to 200 word summary with key findings, method, conclusion
- Extracted entities: diseases, drugs, outcomes
- Confidence score per summary
- Citations that point to source spans

**Definition of Done:**
- p95 latency under 10 seconds warm cache, under 20 seconds cold
- Human alignment score over 0.90 on a sample set
- Inputs: PDF, DOCX, TXT
- Export to PDF or DOC with inline citations

---

#### US-011: Entity Extraction
**As a** Scholar  
**I want** structured entities  
**So that** I can analyze patterns  

**Acceptance:**
- Types at MVP: disease, virus, bacteria, gene, protein, drug, outcome, demographic
- Relevance ranking and confidence per entity
- Co-occurrence pairs with counts
- Supports MeSH and SNOMED CT codes where applicable

**Definition of Done:**
- F1 over 0.85 on validation set
- p95 under 30 seconds per document
- Export CSV or JSON of entities and pairs

---

#### US-012: Intelligent Question Answering
**As a** Scholar  
**I want** natural language answers  
**So that** I can query without technical skills  

**Acceptance:**
- Uses RAG over scoped content with source citations
- Shows confidence and alternative readings
- Supports follow-ups that use conversation context

**Definition of Done:**
- p95 under 15 seconds warm cache, under 30 seconds cold
- Factual accuracy over 0.80 on held-out benchmark
- All answers show at least two citations when available
- Conversation state stored per workspace or team

---

#### US-013: Cross-Topic Correlation
**As a** Scholar  
**I want** cross-topic links  
**So that** I can find new hypotheses  

**Acceptance:**
- Correlates topics across viruses, bacteria, conditions, drugs
- Shows shared mechanisms and study overlaps
- Flags research gaps with supporting evidence
- Visual graph view or matrix

**Definition of Done:**
- p95 under 20 seconds for N under 50 topics
- Correlation score with method documented
- Export to CSV and PNG

---

### Data Scope Management

#### US-014: Public Data Lake Access
**As a** Scholar  
**I want** to query the public datalake  
**So that** I get broad coverage  

**Acceptance:**
- Searches all public ingested documents
- Shows sources and dates
- Honors licensing and access policies

**Definition of Done:**
- Index scale up to 1M documents
- p95 search under 30 seconds cold
- New ingests appear in results within 5 minutes

---

#### US-015: Private Workspace Analysis
**As a** Scholar  
**I want** to analyze my private files  
**So that** my work stays confidential  

**Acceptance:**
- Queries only private files in my workspace
- No bleed into other scopes
- Proprietary and unpublished content supported

**Definition of Done:**
- Zero cross-tenant and cross-workspace contamination by test
- All interactions logged in audit_logs with subject workspace
- Data encrypted in transit and at rest

---

#### US-016: Team Workspace Collaboration
**As a** Scholar  
**I want** shared analysis  
**So that** my team can co-create insights  

**Acceptance:**
- Queries team workspace content for members
- Shared conversation history visible to the team
- Role aware actions: owner, editor, viewer

**Definition of Done:**
- Permission checks exist for every retrieval and write
- Versioned AI answers stored with author and timestamp
- Real-time view refresh within 2 seconds for new messages

---

### Advanced AI Features

#### US-017: Pattern Discovery
**As a** Scholar  
**I want** temporal and institutional patterns  
**So that** I can track trends  

**Acceptance:**
- Trend lines by topic, geography, institution
- Emerging topic detection threshold configurable
- Displays significance and confidence

**Definition of Done:**
- p95 under 60 seconds for 1 year window
- False discovery controls documented
- Export pattern report to PDF and JSON

---

#### US-018: Research Gap Analysis
**As a** Scholar  
**I want** gaps identified  
**So that** I can plan new studies  

**Acceptance:**
- Under-researched topics with counts and date windows
- Conflicting evidence clusters with key citations
- Suggested next steps with rationale

**Definition of Done:**
- p95 under 120 seconds for 1M docs index
- Output includes priority score and evidence set
- Links to create a workspace plan from results

---

#### US-019: Explainable AI Responses
**As a** Scholar  
**I want** reasons and trails  
**So that** I can trust outputs  

**Acceptance:**
- Structured explanation trace: retrieved chunks, ranking scores, applied reasoning steps
- Confidence intervals or calibrated scores
- Drill-down to source spans

**Definition of Done:**
- Every answer stores a JSON trace linked in audit_logs
- Confidence calibration tested with ECE under 0.1
- UI can render trace steps and citations

---

### User Experience

#### US-020: Conversational Interface
**As a** Scholar  
**I want** a chat experience  
**So that** I can iterate naturally  

**Acceptance:**
- Natural language input and output
- Context persistence across turns
- Conversation management: rename, archive, export

**Definition of Done:**
- NL understanding accuracy over 0.90 on intent set
- Context window retention across at least 10 turns
- Export conversation to PDF or JSONL

---

#### US-021: AI Response Export
**As a** Scholar  
**I want** to export results  
**So that** I can publish or share  

**Acceptance:**
- PDF, DOCX, JSON exports
- Proper citations and references
- Optional redaction of sensitive fields

**Definition of Done:**
- p95 export under 10 seconds for 20 page output
- Batch export up to 100 items
- Redaction rules applied and logged

---

### Governance and Operations

#### US-022: Tenant AI Policy Controls
**As a** SaaS admin  
**I want** to set policies  
**So that** usage is safe and predictable  

**Acceptance:**
- Per-tenant limits for tokens and rate
- Allowed models and data scopes
- Retention windows for traces and logs

**Definition of Done:**
- Policy enforcement at gateway
- Violations generate notifications
- Policy changes audited with old and new values

---

#### US-023: Bias and Safety Monitoring
**As a** Platform admin  
**I want** monitoring  
**So that** outputs are fair and safe  

**Acceptance:**
- Bias checks on sampled answers
- PII leak detector in responses
- Safety categories flagged

**Definition of Done:**
- Weekly bias report with metrics
- PII false positive rate under 5 percent
- Block rules configurable per tenant

---

#### US-024: Feedback and Continuous Improvement
**As a** Scholar  
**I want** feedback tools  
**So that** the system learns  

**Acceptance:**
- Thumb up or down with reason
- Suggest correction with proposed citation
- Feedback routed to review queue

**Definition of Done:**
- Feedback stored with conversation and user
- Model or prompt updates tracked by version
- Impact report of changes after 2 weeks

---

#### US-025: Traceability and Audit
**As a** Platform admin  
**I want** full traces  
**So that** I can investigate any answer  

**Acceptance:**
- Every AI call logs in audit_logs with subject_type and subject_id
- Trace JSON includes retrieval set, prompts, parameters, model version, latencies
- Idempotency keys for retries

**Definition of Done:**
- p95 write latency under 50 ms for audit writes
- Traces linked to conversations and workspaces
- Partitioning strategy in place for audit volume

---

#### US-026: Ontology and Mapping
**As a** Scholar  
**I want** ontology support  
**So that** entities are consistent  

**Acceptance:**
- MeSH and SNOMED CT codes attached when possible
- Mappings visible in UI and exports
- Unknowns flagged for curation

**Definition of Done:**
- Coverage over 80 percent on test corpus
- Curator tool to merge or fix mappings
- Neo4j mirror receives updates within 5 minutes

---

## Technical Requirements

### Architecture fit
- RAG over three scopes: public, private workspace, team workspace
- Retrieval priority: workspace over team over public unless user overrides
- Postgres as source of truth for publications, entities, topics, workspaces
- pgvector or external vector DB for embeddings
- Optional Neo4j for multi-hop correlation

### Performance
- QA p95 under 15 seconds warm, under 30 seconds cold
- Summarization p95 under 10 seconds warm, under 20 seconds cold
- Extraction p95 under 30 seconds
- Pattern discovery p95 under 120 seconds at 1M docs

### Security
- Strict scope checks per request using tenant, team, workspace
- Data encrypted in transit and at rest
- Secrets stored in vault, DB holds only references
- Redaction pipeline available for exports

### Observability
- Metrics: latency, tokens, hit rate, retrieval depth, answer length, citation count
- Logs: structured with request_id
- Traces: per answer JSON persisted and linked to audit

---

## Success Metrics
- Answer accuracy over 0.85 on curated benchmark
- Scholar satisfaction over 4.5 out of 5
- Average response time under 15 seconds
- Adoption over 70 percent among active scholars

## Risks and Mitigations
- **Retrieval drift at scale** - add continuous evaluation and drift alerts
- **Scope leakage** - enforce checks in gateway and add unit tests
- **Ontology gaps** - provide curator workflow and fallback tagging
- **Cost overruns** - cache answers and deduplicate similar queries

## Definition of Epic Done
- All stories implemented and tested
- Performance targets met with p95 metrics
- Security and audit validated by dry run
- Accuracy goals met on benchmark
- UAT passed with key tenants
- Documentation and runbooks complete
- Production rollout enabled for selected tenants
