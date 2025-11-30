# Content Management Architecture

This document describes how content is managed across different deployment environments (Vercel, Docker/Kubernetes, local development).

## Overview

The application uses a **Git-based CMS** where content is stored in a separate GitHub repository (`DATA_REPOSITORY`). Content flows through the system as follows:

```
GitHub Repository (DATA_REPOSITORY)
         │
         ▼
   Git Clone/Pull
         │
         ▼
Local Content Directory
  - Local: ./.content
  - Vercel: /tmp/.content
  - Docker: /app/.content or mounted volume
         │
         ▼
    Application Reads
```

## Key Principles

1. **Git is the Single Source of Truth** - All content originates from the Git repository
2. **Clone Instead of Copy** - Each container/instance clones directly from Git (no copying between directories)
3. **Lazy Initialization** - Content is cloned on first read, not at container startup
4. **Environment-Aware Paths** - `getContentPath()` returns the correct path for each environment

---

## Content Path Logic

```typescript
// lib/lib.ts
export function getContentPath() {
    const contentDir = '.content';
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

    // Vercel runtime: use /tmp (build artifact is read-only)
    if (process.env.VERCEL && !isBuildPhase) {
        return path.join(os.tmpdir(), contentDir); // /tmp/.content
    }

    // Local dev, Docker, Kubernetes: use project directory
    return path.join(process.cwd(), contentDir); // ./.content
}
```

| Environment | Path | Notes |
|-------------|------|-------|
| Local dev | `./.content` | Writable, persistent |
| Vercel build | `./.content` | Build phase only |
| Vercel runtime | `/tmp/.content` | Ephemeral, per-container |
| Docker/K8s | `./.content` or mounted volume | Depends on config |

---

## Flow 1: READ (User Visits Page)

```
User Request → ensureContentAvailable() → hasContentFiles()?
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         │                         ▼
              YES (warm)                      │                   NO (cold)
                    │                         │                         │
                    │                         │                         ▼
                    │                         │              trySyncRepository()
                    │                         │                         │
                    │                         │                         ▼
                    │                         │               Git Clone/Pull
                    │                         │                         │
                    └─────────────────────────┼─────────────────────────┘
                                              ▼
                                    Return content path
                                              │
                                              ▼
                                    fetchItems(), fetchConfig(), etc.
```

**Key Files:**
- `lib/lib.ts` - `ensureContentAvailable()`, `getContentPath()`
- `lib/repository.ts` - `trySyncRepository()`
- `lib/content.ts` - `fetchItems()`, `fetchConfig()`, etc.

---

## Flow 2: SYNC (Periodic Cron Job)

```
Cron Trigger (Vercel/Trigger.dev/Local)
          │
          ▼
    /api/cron/sync
          │
          ▼
    triggerManualSync()
          │
          ▼
    syncManager.performSync()
          │
          ▼
    trySyncRepository()
          │
    ┌─────┴─────┐
    ▼           ▼
  .git?       No .git
    │           │
    ▼           ▼
 git pull   git clone
    │           │
    └─────┬─────┘
          ▼
  invalidateContentCaches()
          │
          ▼
       Done
```

**Scheduling Methods:**

| Method | Environment | How It Works |
|--------|-------------|--------------|
| Vercel Cron | Vercel | `vercel.json` crons hit `/api/cron/sync` |
| Trigger.dev | Any | External scheduler calls sync endpoint |
| Local Scheduler | Local/Docker/K8s | `BackgroundJobManager` with `setInterval` |

**Key Files:**
- `app/api/cron/sync/route.ts` - Sync endpoint
- `lib/services/sync-service.ts` - SyncManager
- `lib/background-jobs/` - Job scheduling

---

## Flow 3: WRITE (Admin Creates/Updates Content)

```
Admin API Request (e.g., POST /api/admin/items)
          │
          ▼
    ItemRepository / TagRepository / etc.
          │
          ▼
    GitService (item-git.service.ts, etc.)
          │
          ├──────────────────────┐
          ▼                      ▼
    Write to local           Git operations
    content directory        (add, commit, push)
          │                      │
          │                      ▼
          │              Push to GitHub
          │                      │
          └──────────────────────┘
                    │
                    ▼
        Content updated in Git repo
                    │
                    ▼
        Other containers will get
        updates on next sync/pull
```

**Key Files:**
- `lib/repositories/item.repository.ts`
- `lib/repositories/tag.repository.ts`
- `lib/services/item-git.service.ts`
- `lib/services/tag-git.service.ts`
- `lib/services/category-git.service.ts`

---

## Multi-Container Behavior

### Vercel (Serverless Functions)

```
                    ┌───────────────────────────────────┐
                    │         Vercel Edge              │
                    └───────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
    ┌───────────┐             ┌───────────┐             ┌───────────┐
    │Container A│             │Container B│             │Container C│
    │(cold start)│             │(cold start)│             │(warm)    │
    └───────────┘             └───────────┘             └───────────┘
          │                         │                         │
          ▼                         ▼                         │
    git clone from             git clone from                 │
    DATA_REPOSITORY            DATA_REPOSITORY                │
          │                         │                         │
          ▼                         ▼                         ▼
    /tmp/.content             /tmp/.content             /tmp/.content
    (independent)             (independent)             (already has)
```

**Key Points:**
- Each serverless function has its own `/tmp` (ephemeral, ~500MB limit)
- Cold starts clone fresh from Git
- Warm containers use cached content until TTL expires
- No shared filesystem between containers
- `globalThis` singleton ensures initialization happens once per container

### Docker/Kubernetes

```
                    ┌───────────────────────────────────┐
                    │      Load Balancer / Ingress     │
                    └───────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
    ┌───────────┐             ┌───────────┐             ┌───────────┐
    │  Pod A    │             │  Pod B    │             │  Pod C    │
    │(container)│             │(container)│             │(container)│
    └───────────┘             └───────────┘             └───────────┘
          │                         │                         │
          ▼                         ▼                         ▼
     ./.content               ./.content               ./.content
    (local to pod)           (local to pod)           (local to pod)
```

**Options:**
1. **No shared storage**: Each pod clones independently (same as Vercel)
2. **Shared volume (PVC)**: All pods share `/app/.content` via NFS/PVC
3. **Init container**: Clone content before app starts

**Recommended for Kubernetes:**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: content-pvc
spec:
  accessModes:
    - ReadWriteMany  # Important for multi-pod
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      volumes:
        - name: content
          persistentVolumeClaim:
            claimName: content-pvc
      containers:
        - name: app
          volumeMounts:
            - name: content
              mountPath: /app/.content
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATA_REPOSITORY` | Yes | GitHub URL for content repo |
| `GH_TOKEN` | For private repos | GitHub personal access token |
| `GITHUB_BRANCH` | No | Branch to clone (default: main) |
| `VERCEL` | Auto-set | Set by Vercel runtime |
| `DISABLE_AUTO_SYNC` | No | Disable background sync |
| `CRON_SECRET` | Production | Secret for cron endpoint |

---

## Initialization Flow

### Background Jobs

```typescript
// app/api/cron/jobs/background-jobs-init.ts
// Uses globalThis singleton to ensure one-time init per container

globalThis.__BACKGROUND_JOBS_INIT__ = {
    initializationState: 'pending' | 'initializing' | 'completed',
    initializationPromise: Promise | null,
    loggedMode: SchedulingMode | null
};
```

### Content Availability

```typescript
// lib/lib.ts
// Uses globalThis singleton to ensure one-time init per container

globalThis.__CONTENT_INIT__ = {
    initialized: boolean,
    promise: Promise | null
};
```

---

## Write Operation Details

When admin creates/updates content:

1. **Local Write**: Content is written to `getContentPath()` (e.g., `/tmp/.content` on Vercel)
2. **Git Commit**: Changes are committed locally
3. **Git Push**: Changes are pushed to `DATA_REPOSITORY`
4. **Propagation**: Other containers get updates on next sync/pull

**Important:** On Vercel, writes to `/tmp` are ephemeral. The push to GitHub is the durable storage. Other containers will pull the changes on their next sync.

---

## Cache Invalidation

After sync operations:

```typescript
// lib/content.ts
export function invalidateContentCaches() {
    // Clear Next.js unstable_cache entries
    revalidateTag('config');
    revalidateTag('items');
    revalidateTag('categories');
    revalidateTag('tags');
    // ... etc
}
```

---

## Troubleshooting

### Content not appearing

1. Check `DATA_REPOSITORY` is set correctly
2. Check `GH_TOKEN` has read access to the repo
3. Check logs for "Repository sync" messages
4. Manually trigger sync: `curl -X POST /api/cron/sync?secret=YOUR_SECRET`

### Stale content

1. Sync interval might be too long
2. Check cron job is running (Vercel dashboard or logs)
3. Force revalidation through admin panel

### Write operations failing on Vercel

1. Check `GH_TOKEN` has write access
2. Check the push succeeded in logs
3. Verify content appears in GitHub repo after write

### Multiple containers showing different content

1. This is expected briefly after writes
2. Wait for next sync cycle
3. Consider reducing sync interval in high-write scenarios

---

## Summary Table

| Operation | Local Dev | Vercel | Docker/K8s |
|-----------|-----------|--------|------------|
| Content Path | `./.content` | `/tmp/.content` | `./.content` or volume |
| Init Trigger | First read | First read (per container) | First read or init container |
| Sync Method | Local scheduler | Vercel cron | Local scheduler or K8s CronJob |
| Write Storage | Local + Git push | `/tmp` + Git push | Local/Volume + Git push |
| Persistence | Persistent | Ephemeral | Depends on volume config |

---

## Files Modified

| File | Change |
|------|--------|
| `lib/lib.ts` | Added `ensureContentAvailable()` with Git clone on first read |
| `lib/repository.ts` | Removed copy logic, added data dir creation |
| `lib/repositories/item.repository.ts` | Uses `getContentPath()` |
| `lib/repositories/tag.repository.ts` | Uses `getContentPath()` |
| `lib/config-manager.ts` | Uses `getContentPath()` |
| `app/api/cron/jobs/background-jobs-init.ts` | Singleton for background job init |

