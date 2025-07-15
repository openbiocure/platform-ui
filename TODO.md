# TODO: External Agent Feature Implementation

# NOTE: If you set `agents: true` and `modelSelect: false` in librechat.yaml, the agents will NOT appear in the dropdown. This is a current UI/UX limitation/bug.

## Completed
- [x] Add external agent fields (`isExternal`, `externalUrl`, `externalAuth`) to Agent schema and types
- [x] Update backend validation (Zod schemas, controllers) to support new external agent fields
- [x] Ensure encryption/decryption of sensitive data in `externalAuth`
- [x] Add config options for external agent support (allowed auth types, domain whitelist, etc.)

## Next Steps
- [ ] Update Agent Builder UI: add External Agent toggle, conditionally show/hide fields, add external URL and authentication config fields
- [ ] Implement authentication UI components for selecting auth type and entering credentials (API key, bearer, basic, custom header)
- [ ] Implement backend logic to forward requests to external URL with correct authentication headers. Handle responses, errors, and streaming if supported
- [ ] Enforce URL validation, domain whitelisting, HTTPS, and encrypt/decrypt credentials at rest for external agents
- [ ] Add unit and integration tests for new schema, API, and UI logic related to external agents
- [ ] Update user and developer documentation to cover the new external agent feature 