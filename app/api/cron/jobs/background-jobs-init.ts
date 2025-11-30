/**
 * Background Jobs Initialization Module
 * 
 * This module provides a singleton initialization for background jobs.
 * It ensures that initialization (and logging) happens only ONCE per process,
 * even when called from layout.tsx which renders on every request.
 * 
 * Usage:
 *   import { ensureBackgroundJobsInitialized } from '@/app/api/cron/jobs/background-jobs-init';
 *   ensureBackgroundJobsInitialized();
 */

import { getSchedulingMode } from '@/lib/background-jobs/config';
import type { SchedulingMode } from '@/lib/background-jobs/types';

// Module-level singleton state
let initializationState: 'pending' | 'initializing' | 'completed' = 'pending';
let initializationPromise: Promise<void> | null = null;
let loggedMode: SchedulingMode | null = null;

/**
 * Ensures background jobs are initialized exactly once.
 * Safe to call multiple times - subsequent calls are no-ops.
 * 
 * @returns Promise that resolves when initialization is complete
 */
export async function ensureBackgroundJobsInitialized(): Promise<void> {
	// Skip during tests
	if (process.env.NODE_ENV === 'test') {
		return;
	}

	// Skip during build
	if (process.env.NEXT_PHASE === 'phase-production-build') {
		return;
	}

	// Already completed - fast path
	if (initializationState === 'completed') {
		return;
	}

	// Already in progress - wait for completion
	if (initializationState === 'initializing' && initializationPromise) {
		return initializationPromise;
	}

	// Start initialization
	initializationState = 'initializing';
	initializationPromise = doInitialize();
	
	try {
		await initializationPromise;
		initializationState = 'completed';
	} catch (error) {
		// Reset state to allow retry on next call
		initializationState = 'pending';
		initializationPromise = null;
		throw error;
	}
}

/**
 * Internal initialization logic - called only once
 */
async function doInitialize(): Promise<void> {
	const schedulingMode = getSchedulingMode();

	// Log only once per mode (prevents duplicate logs even if state resets)
	if (loggedMode !== schedulingMode) {
		loggedMode = schedulingMode;
		
		switch (schedulingMode) {
			case 'vercel':
				console.log('[BackgroundJobs] Vercel cron mode - jobs handled by /api/cron/sync endpoint');
				break;
			case 'disabled':
				console.log('[BackgroundJobs] Disabled (DISABLE_AUTO_SYNC=true)');
				break;
			case 'trigger-dev':
				console.log('[BackgroundJobs] Trigger.dev mode - initializing...');
				break;
			case 'local':
				console.log('[BackgroundJobs] Local mode - initializing internal scheduler...');
				break;
		}
	}

	// Only initialize for modes that need internal scheduling
	if (schedulingMode === 'trigger-dev' || schedulingMode === 'local') {
		const { initializeBackgroundJobs } = await import('@/lib/background-jobs/initialize-jobs');
		await initializeBackgroundJobs();
	}
}

/**
 * Get current initialization state (for debugging)
 */
export function getInitializationState(): {
	state: 'pending' | 'initializing' | 'completed';
	mode: SchedulingMode | null;
} {
	return {
		state: initializationState,
		mode: loggedMode
	};
}

