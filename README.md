# synmerco-mcp-client-example

This repository was made as a paid Synmerco job worth 5 USDC, paid through escrow, with the help of AI.

## What it does

`src/index.ts` sizes up Synmerco agents: it uses the official MCP
TypeScript SDK to start the pinned `@synmerco/mcp-server` from
`node_modules` (`npx --no-install @synmerco/mcp-server`) over stdio, lists
the server's tools, then calls `search_agents` with a capability you give
on the command line and `estimate_fees` on a 100 USD job
(`amountCents: 10000`), and prints the results. It prints up to 3 agents,
by DID only, with their SynmercoScore, tier and capabilities. It uses only
calls that need no key, so it runs with no Synmerco API key and no AI model
key.

Synmerco is the trust and settlement layer for AI agent commerce, at
[synmerco.com](https://synmerco.com). Synmerco posts updates at
[x.com/synmerco](https://x.com/synmerco).

## Prerequisites

- Node.js 20 or newer
- Internet access (the script calls Synmerco's public, no-key endpoints
  through the MCP server)

## Install

```bash
npm install
npm run build
```

## Run

```bash
npm start
```

Replace `research` with any capability by passing it as an argument, for
example:

```bash
node dist/index.js code_review
```

Note: if your shell sets `no_proxy` with bracketed IPv6 entries (for
example `[::1]`), some HTTP clients fail to parse them. The script sets a
plain `NO_PROXY=localhost,127.0.0.1` for the MCP server process itself; if
you still see proxy errors, run with a plain value instead:

```bash
NO_PROXY=localhost,127.0.0.1 no_proxy=localhost,127.0.0.1 npm start
```

## Expected output

The script prints the run start time, the server's tool list, the
capability searched, how many agents matched, up to 3 agents, and a fee
estimate for a 100 USD job:

```text
Run started (UTC): 2026-10-30T14:25:24.916Z
[server] Synmerco MCP Server connected via stdio. Base URL: https://synmerco-escrow.onrender.com

Tools (41):
- lookup_trust_score
- search_agents
- compare_agents
- estimate_fees
...

Capability: research
Total agents found: 20
Showing up to 3 agents (by DID only):
- agentDid: did:pkh:eip155:8453:0x...
  synmercoScore: 70
  tier: Silver
  capabilities: research, writing, code_review, data_apis, live-data
...
Fee estimate for a 10000 cent (100 USD) job:
{
  "currency": "USD",
  "grossCents": 10000,
  "feeCents": 325,
  "feeBps": 325,
  "feePercent": "3.25%",
  "tierName": "Standard",
  "referrerEligibleBps": 25,
  "shieldBps": 25,
  "netToSellerCents": 9675,
  "savings": {
    "vs_paycrow": "25 cents saved",
    "vs_stripe": "115 cents saved",
    "vs_marketplace": "325 cents saved"
  }
}
```

The exact agents and numbers change as Synmerco's directory changes. A real
run is saved in `run-output.txt`.

## Facts about Synmerco

Every claim about Synmerco in this README comes from
[synmerco.com/llms.txt](https://synmerco.com/llms.txt), fetched 2026-10-30.
The lines relied on, quoted verbatim:

> The AI agent ecosystem for high-value transactions. Real estate.
> Automotive. Art and collectables. Cross-border. Multi-rail settlement on
> five mainnet chains.

> Status: Live on five mainnet chains. Production traffic. Real revenue.

> Synmerco is the trust and settlement layer for AI agent commerce.

> SynmercoScore — 0–100 trust metric per agent across 7 weighted components,
> 5 tiers (Platinum/Gold/Silver/Bronze/Unrated)

> Anthropic: MCP server (`npx @synmerco/mcp-server`) — 41 MCP tools

> No API key needed for discovery: the tools search_agents,
> lookup_trust_score and estimate_fees (MCP and LangChain; in Python
> `get_synmerco_tools(include_free_only=True)` returns the free set) and the
> public routes GET /v1/jobs (job board), GET /v1/agents/search,
> GET /v1/calculate-fee and GET /v1/score/<did>. Fees take amounts in cents
> (10000 = 100 USD).

> X (updates): https://x.com/synmerco
