# CrisisProof Deployment Guide

## 1. Deploy Intelligent Contract

1. Go to https://studio.genlayer.com
2. Create a new Intelligent Contract
3. Paste `contracts/CrisisProof.py`
4. Click Deploy → StudioNet
5. Copy the deployed contract address (0x...)

## 2. Configure Environment

```bash
# .env.local
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_EXPLORER_URL=https://explorer-studio.genlayer.com
NEXT_PUBLIC_CRISISPROOF_CONTRACT_ADDRESS=0x15b98e948e9087351390358d563d62ca3A2B3547
```

## 3. Run Locally

```powershell
cd C:\Users\ojiku\Crisisproof
npm install
npm run dev
```

Open http://localhost:3000

## 4. Deploy Frontend to Vercel

```powershell
npm install -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard → Settings → Environment Variables.

## 5. Connect Wallet

- Use MetaMask or any WalletConnect-compatible wallet
- Switch to StudioNet (Chain ID: 61999)
- Get GEN tokens from the GenLayer faucet
