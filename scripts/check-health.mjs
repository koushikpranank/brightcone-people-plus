const base=(process.argv[2]||process.env.APP_URL||'http://127.0.0.1:5150').replace(/\/$/,'');
try {
  const response=await fetch(base+'/api/health',{signal:AbortSignal.timeout(10000)});
  const body=await response.json();
  if(!response.ok||body.status!=='ok')throw new Error('Application or database is unavailable');
  console.log(`Healthy: ${base}/api/health`);
} catch(error) {
  console.error(`Health check failed: ${error.message}`);
  process.exitCode=1;
}
