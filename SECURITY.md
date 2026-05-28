# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | ✅ Current release |

## Reporting a Vulnerability

If you discover a security vulnerability in Potdo, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email: **security@edycu.dev**

Include:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive an acknowledgment within **48 hours** and a detailed response within **5 business days**.

## Security Architecture

Potdo is designed with a **non-custodial, client-side signing** architecture:

### What Potdo Does NOT Do

- ❌ Store, transmit, or have access to private keys
- ❌ Hold custody of any user funds
- ❌ Execute transactions without explicit user approval
- ❌ Store wallet addresses or balances server-side
- ❌ Require authentication or collect PII

### Security Model

1. **Intent Parsing** — Natural language is parsed into structured intents using deterministic NLP (regex + pattern matching). No user input is sent to external AI APIs.
2. **Simulation Before Signing** — Every transaction is simulated with a visual balance diff before the wallet extension is invoked. Users always see the exact state change.
3. **Client-Side Signing** — All transaction signing happens in the user's Portaldot browser extension. Potdo never touches private keys.
4. **Input Validation** — Strict schema validation prevents malformed addresses, negative amounts, and amounts exceeding 14-decimal POT precision.
5. **No Blind Signing** — The `<TransferCard>` and `<BatchCard>` components render human-readable transaction details. Users must explicitly click "Execute" after reviewing.

### Dependencies

- Portaldot SDK Client
- Portaldot Wallet extension SDK
- `next` — Web framework (no server-side secrets in client bundle)

### Environment Variables

| Variable                        | Sensitivity | Purpose                              |
| ------------------------------- | ----------- | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Low         | Public Supabase endpoint             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Low         | Public anon key (RLS enforced)       |
| `SUPABASE_SERVICE_ROLE_KEY`     | **High**    | Server-only, never exposed to client |

> **Note:** The app runs in full demo mode without any environment variables configured. No API keys are required for local development.

## Scope

The following are **in scope** for security reports:

- Cross-site scripting (XSS) in chat interface or transaction cards
- Transaction amount manipulation or address injection
- Server-side environment variable leakage
- Dependency vulnerabilities with exploitable impact

The following are **out of scope**:

- Vulnerabilities in the Portaldot browser extension itself
- Portaldot chain-level issues
- Rate limiting on demo/development endpoints
- Self-XSS requiring developer console access

## License

This security policy applies to the [MIT-licensed](LICENSE) Potdo codebase.

© 2026 Edy Cu
