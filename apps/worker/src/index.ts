const intervalMs = Number(process.env.WORKER_INTERVAL_MS ?? 5000);
console.log('PMMI worker started');
setInterval(() => {
  // Phase 1 placeholder: notification/provisioning jobs will be claimed from PostgreSQL.
}, intervalMs);
