// Delete all movies that have userRating set (rated movies)
const API_BASE = 'https://my-watchlist-rho.vercel.app/api/watchlist';

async function main() {
  console.log('Fetching all rated movies...');
  const res = await fetch(`${API_BASE}?type=movie&hasRating=true`);
  const data = await res.json();
  const items = data.items || [];
  console.log(`Found ${items.length} rated movies to delete`);

  let deleted = 0;
  let failed = 0;

  // Process in batches of 10 concurrent requests
  const BATCH = 10;
  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(item => 
        fetch(`${API_BASE}/${item.id}`, { method: 'DELETE' })
          .then(r => {
            if (r.ok) {
              deleted++;
              return { ok: true, title: item.title };
            } else {
              failed++;
              return { ok: false, title: item.title, status: r.status };
            }
          })
      )
    );
    
    if ((i + BATCH) % 100 === 0 || i + BATCH >= items.length) {
      console.log(`Progress: ${Math.min(i + BATCH, items.length)}/${items.length} processed | Deleted: ${deleted} | Failed: ${failed}`);
    }
  }

  console.log(`\nDone! Deleted: ${deleted} | Failed: ${failed}`);
}

main().catch(console.error);
