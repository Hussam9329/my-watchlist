/**
 * Delete all movies WITHOUT a user rating (userRating = null) from ratings
 * Only targets movies with type="movie" and userRating=null
 * Does NOT touch series or rated movies
 * Run: node scripts/delete-unrated-movies.js
 */

const API_BASE = 'https://my-watchlist-rho.vercel.app/api/watchlist';

async function main() {
  console.log('Fetching all movies WITHOUT ratings (userRating = null)...');
  const res = await fetch(`${API_BASE}?hasRating=false&type=movie`);
  const data = await res.json();
  const items = data.items || [];
  console.log(`Found ${items.length} unrated movies to delete`);

  if (items.length === 0) {
    console.log('No unrated movies found. Nothing to delete.');
    return;
  }

  // Show first few items as sample
  console.log('\nSample items to be deleted:');
  items.slice(0, 5).forEach(item => {
    console.log(`  - ${item.title} (${item.year}) | type: ${item.type} | rating: ${item.userRating}`);
  });
  console.log(`  ... and ${items.length - 5} more\n`);

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
    
    const progress = Math.min(i + BATCH, items.length);
    if (progress % 50 === 0 || progress >= items.length) {
      console.log(`Progress: ${progress}/${items.length} processed | Deleted: ${deleted} | Failed: ${failed}`);
    }
  }

  console.log(`\nDone! Deleted: ${deleted} | Failed: ${failed}`);

  // Verify remaining
  console.log('\nVerifying remaining unrated movies...');
  const verifyRes = await fetch(`${API_BASE}?hasRating=false&type=movie`);
  const verifyData = await verifyRes.json();
  const remaining = verifyData.items || [];
  console.log(`Remaining unrated movies: ${remaining.length}`);

  // Also check rated movies count
  const ratedRes = await fetch(`${API_BASE}?hasRating=true&type=movie`);
  const ratedData = await ratedRes.json();
  const ratedItems = ratedData.items || [];
  console.log(`Rated movies count: ${ratedItems.length}`);
}

main().catch(console.error);
