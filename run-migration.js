require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  // Step 1: Create the table using individual inserts to test if it exists
  // Since we can't run DDL via PostgREST, we'll check if the table exists
  // by trying to query it, and if not, tell the user to run the migration

  try {
    const { data, error } = await supabase.from('content_preferences').select('id').limit(1);
    if (error && error.code === '42P01') {
      console.log('Table does not exist. Running migration via Supabase Management API...');

      const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
      const fs = require('fs');
      const sql = fs.readFileSync('supabase/migrations/20260227000003_content_preferences.sql', 'utf-8');

      const resp = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ACCESS_TOKEN || ''}`
        },
        body: JSON.stringify({ query: sql })
      });

      if (resp.ok) {
        console.log('Migration ran successfully!');
      } else {
        const body = await resp.text();
        console.log('Management API failed (status ' + resp.status + '), trying Supabase Dashboard SQL...');
        console.log(body.substring(0, 200));
        console.log('\n=== MANUAL STEP NEEDED ===');
        console.log('Run this SQL in Supabase Dashboard > SQL Editor:');
        console.log('File: supabase/migrations/20260227000003_content_preferences.sql');
      }
    } else if (error) {
      // Table might exist but different error
      console.log('Error checking table:', error.message, error.code);
    } else {
      console.log('Table already exists! Found', data.length, 'rows');
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

run();
