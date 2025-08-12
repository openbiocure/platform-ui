CREATE TYPE event_class AS ENUM ('security','auth','admin','config','content','billing','workflow');
CREATE TYPE event_severity AS ENUM ('info','warning','error');

CREATE TABLE audit_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid NOT NULL REFERENCES tenants(id),
  subject_type     text NOT NULL,          -- 'user','team','workspace','publication',...
  subject_id       uuid NOT NULL,
  action           text NOT NULL,          -- 'created','updated','deleted','user_added',...
  event_class      event_class NOT NULL,
  severity         event_severity NOT NULL DEFAULT 'info',
  actor_user_id    uuid REFERENCES users(id),
  team_id          uuid,                   -- hot filter
  workspace_id     uuid,                   -- hot filter
  request_id       text,
  idempotency_key  text,
  source_service   text,
  ip               inet,
  user_agent       text,
  occurred_at      timestamptz NOT NULL DEFAULT now(),
  payload          jsonb NOT NULL DEFAULT '{}'::jsonb
) PARTITION BY RANGE (occurred_at);

-- Example current partition
CREATE TABLE audit_logs_2025_08 PARTITION OF audit_logs
FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

-- Indexes on the hot path
CREATE INDEX audit_tenant_time_idx    ON audit_logs_2025_08 (tenant_id, occurred_at DESC);
CREATE INDEX audit_subject_idx        ON audit_logs_2025_08 (subject_type, subject_id, occurred_at DESC);
CREATE INDEX audit_team_time_idx      ON audit_logs_2025_08 (team_id, occurred_at DESC)      WHERE team_id IS NOT NULL;
CREATE INDEX audit_workspace_time_idx ON audit_logs_2025_08 (workspace_id, occurred_at DESC) WHERE workspace_id IS NOT NULL;
-- Optional ad hoc
-- CREATE INDEX audit_payload_gin ON audit_logs_2025_08 USING GIN (payload jsonb_path_ops);

CREATE TABLE audit_links (
  audit_id    uuid REFERENCES audit_logs(id) ON DELETE CASCADE,
  entity_type text NOT NULL,                -- 'invitation','document','publication',...
  entity_id   uuid NOT NULL,
  PRIMARY KEY (audit_id, entity_type, entity_id)
);
-- Partial index for rare but needed lookups
CREATE INDEX audit_links_inv_idx ON audit_links(entity_id) WHERE entity_type = 'invitation';