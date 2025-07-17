// Database seed functions
// Import your db connection and schema here

export async function seed() {
  console.log('🌱 Seeding database...');
  
  // Add your seed logic here
  
  console.log('✅ Database seeded successfully');
}

// Run seeds if called directly
if (import.meta.main) {
  seed().catch(console.error);
}