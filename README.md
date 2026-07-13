# CrisisProof Protocol

CrisisProof is a decentralized institutional crisis decision protocol built on GenLayer. When an organization faces a critical incident — a smart contract exploit, data breach, financial fraud, or service outage — CrisisProof enables structured, evidence-backed, on-chain crisis response verdicts through GenLayer's Optimistic Democracy consensus.

Teams submit a crisis case, attach public evidence URLs, and define competing response options. GenLayer validators — acting as senior crisis analysts — evaluate the evidence, assess harm severity, operational risk, regulatory exposure, and response proportionality, then reach consensus on the recommended action.

The result is a tamper-proof, publicly auditable crisis verdict: what to do, what not to do, when to disclose, and whether compensation is warranted — all without a central authority making the call.

## Live Demo

[crisis-proof.vercel.app](https://crisis-proof.vercel.app/app)

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS, TypeScript
- **Blockchain:** GenLayer StudioNet (Chain ID 61999)
- **SDK:** genlayer-js v1.1.8
- **Contract:** Python Intelligent Contract — `contracts/CrisisProof.py`
- **Wallet:** MetaMask / injected wallet

## Contract

Deployed on GenLayer StudioNet:
```
0x76E18c6e9027FB9b590F46c38FE6A4469950a817
```

## How It Works

1. **Create a Crisis Case** — Define the incident, affected users, reported harm, urgency level, and known constraints
2. **Submit Evidence** — Attach public URL evidence with source credibility notes and relevance context
3. **Define Response Options** — Add 2–6 competing response strategies with expected benefits, key risks, and failure conditions
4. **Request GenLayer Review** — Trigger Optimistic Democracy consensus across GenLayer validators
5. **Receive Verdict** — Get a structured AI-consensus verdict: crisis classification, recommended response, disclosure timeline, risk scores, and what not to do

## Verdict Output

Each GenLayer verdict includes:
- Crisis classification and recommended response option
- Confidence score (0–100)
- Harm severity, user impact, operational/reputation/regulatory risk
- Response proportionality assessment
- Disclosure recommendation and compensation review status
- Key supporting and contradictory evidence
- Evidence gaps and follow-up actions needed

## Local Development

```bash
npm install
npm run dev
```

Create `.env.local`:
```
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
NEXT_PUBLIC_CRISISPROOF_CONTRACT_ADDRESS=0x76E18c6e9027FB9b590F46c38FE6A4469950a817
```

Open [http://localhost:3000](http://localhost:3000)

## Wallet Setup

- Install MetaMask
- Add StudioNet: RPC `https://studio.genlayer.com/api`, Chain ID `61999`
- Get GEN tokens from the GenLayer faucet
