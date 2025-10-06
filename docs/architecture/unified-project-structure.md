# Unified Project Structure

```
sales-machine/
├── .github/workflows/
│   ├── ci.yaml
│   └── deploy.yaml
├── apps/
│   ├── web/                    # Frontend (Vite + React)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── atoms/      # shadcn/ui primitives
│   │   │   │   ├── molecules/  # ConfidenceBadge, VIPIndicator
│   │   │   │   ├── organisms/  # HealthScoreCard, PipelineKanban
│   │   │   │   └── templates/  # Layouts
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── lib/            # Supabase, API client
│   │   │   ├── stores/         # Zustand
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── tests/
│   │   └── package.json
│   └── api/                    # Backend (Fastify)
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── middleware/
│       │   ├── utils/
│       │   └── server.ts
│       ├── tests/
│       └── package.json
├── packages/
│   └── shared/                 # Shared types, constants
│       ├── src/
│       │   ├── types/
│       │   ├── constants/
│       │   └── utils/
│       └── package.json
├── workflows/                  # N8N JSONs
│   ├── linkedin-scraper.json
│   ├── ai-enrichment.json
│   └── ...
├── mcp-servers/               # MCP abstraction (Epic 4)
├── scripts/
├── docs/
│   ├── prd.md
│   ├── design-specifications.md
│   ├── architecture.md
│   └── runbooks/
├── .env.example
├── package.json               # Root workspace
└── README.md
```

---
