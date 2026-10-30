/**
 * Size up Synmerco agents with the official MCP TypeScript SDK.
 *
 * Starts the pinned @synmerco/mcp-server from node_modules
 * (`npx --no-install @synmerco/mcp-server`) over stdio, lists its tools,
 * then calls search_agents and estimate_fees on a 100 USD job and prints
 * the results. Runs with no Synmerco API key and no AI model key.
 *
 * Usage:
 *   npm run build
 *   npm start             # searches capability "research"
 *   node dist/index.js code_review   # searches another capability
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const MAX_AGENTS = 3;
const JOB_AMOUNT_CENTS = 10000; // 100 USD, in cents
const DEFAULT_CAPABILITY = "research";

interface AgentSummary {
  agentDid?: unknown;
  synmercoScore?: unknown;
  tier?: unknown;
  capabilities?: unknown;
}

function textOf(result: unknown): string {
  const content = (result as { content?: Array<{ type?: string; text?: string }> })
    .content;
  if (!content) return "";
  return content
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text as string)
    .join("\n");
}

function parseJson(text: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // not JSON — caller handles it
  }
  return null;
}

async function main(argv: string[]): Promise<number> {
  const capability = argv[2] ?? DEFAULT_CAPABILITY;
  console.log(`Run started (UTC): ${new Date().toISOString()}`);

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["--no-install", "@synmerco/mcp-server"],
    env: {
      ...process.env,
      // This VM's proxy bypass list contains bracketed IPv6 entries
      // (for example "[::1]") that some HTTP clients fail to parse.
      NO_PROXY: "localhost,127.0.0.1",
      no_proxy: "localhost,127.0.0.1",
    },
    stderr: "pipe",
  });
  transport.stderr?.on("data", (chunk) => {
    process.stderr.write(`[server] ${chunk}`);
  });

  const client = new Client(
    { name: "synmerco-mcp-client-example", version: "1.0.0" },
    { capabilities: {} },
  );

  try {
    await client.connect(transport);

    const { tools } = await client.listTools();
    console.log(`\nTools (${tools.length}):`);
    for (const tool of tools) {
      console.log(`- ${tool.name}`);
    }

    const searchResult = await client.callTool({
      name: "search_agents",
      arguments: { capability },
    });
    const search = parseJson(textOf(searchResult));
    if (!search) {
      console.error("search_agents returned a result that is not JSON.");
      return 1;
    }
    const agents = (Array.isArray(search.agents) ? search.agents : []) as AgentSummary[];
    console.log(`\nCapability: ${capability}`);
    console.log(`Total agents found: ${search.totalResults ?? agents.length}`);
    console.log(`Showing up to ${MAX_AGENTS} agents (by DID only):`);
    for (const agent of agents.slice(0, MAX_AGENTS)) {
      console.log(`- agentDid: ${agent.agentDid}`);
      console.log(`  synmercoScore: ${agent.synmercoScore}`);
      console.log(`  tier: ${agent.tier}`);
      const caps = Array.isArray(agent.capabilities)
        ? agent.capabilities.join(", ")
        : agent.capabilities;
      console.log(`  capabilities: ${caps}`);
    }

    const feesResult = await client.callTool({
      name: "estimate_fees",
      arguments: { amountCents: JOB_AMOUNT_CENTS },
    });
    const fees = parseJson(textOf(feesResult));
    console.log(
      `\nFee estimate for a ${JOB_AMOUNT_CENTS} cent (100 USD) job:`,
    );
    console.log(JSON.stringify(fees ?? textOf(feesResult), null, 2));
    return 0;
  } finally {
    await client.close();
  }
}

main(process.argv).then(
  (code) => process.exit(code),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
