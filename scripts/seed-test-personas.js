import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.log('Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test user personas
const personas = [
  {
    email: 'new_user@test.com',
    password: 'TestPassword123!',
    profile: {
      full_name: 'Nova Newbie',
      date_of_birth: '1990-01-15',
      country: 'US',
      plan_strength: 0,
      subscription_status: 'free',
      onboarding_completed: false
    },
    description: 'Brand new user with 0% plan strength'
  },
  {
    email: 'mid_journey@test.com',
    password: 'TestPassword123!',
    profile: {
      full_name: 'Jordan Journey',
      date_of_birth: '1985-06-20',
      country: 'US',
      plan_strength: 50,
      subscription_status: 'free',
      onboarding_completed: true,
      last_review_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() // 6 months ago
    },
    description: 'Mid-journey user with ~50% plan strength'
  },
  {
    email: 'premium_user@test.com',
    password: 'TestPassword123!',
    profile: {
      full_name: 'Patricia Premium',
      date_of_birth: '1975-03-10',
      country: 'US',
      plan_strength: 100,
      subscription_status: 'active',
      subscription_tier: 'premium',
      onboarding_completed: true,
      preservation_mode: true,
      last_review_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 1 month ago
    },
    description: 'Premium user in Preservation Mode with 100% plan strength'
  },
  {
    email: 'free_user@test.com',
    password: 'TestPassword123!',
    profile: {
      full_name: 'Freddy Frugal',
      date_of_birth: '1988-11-25',
      country: 'US',
      plan_strength: 100,
      subscription_status: 'free',
      onboarding_completed: true,
      preservation_mode: true,
      last_review_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 2 months ago
    },
    description: 'Free user at 100% plan strength testing preservation mode'
  },
  {
    email: 'executor@test.com',
    password: 'TestPassword123!',
    profile: {
      full_name: 'Edward Executor',
      date_of_birth: '1970-07-15',
      country: 'US',
      plan_strength: 25,
      subscription_status: 'free',
      onboarding_completed: true,
      is_executor_for: [] // Will be populated after premium_user is created
    },
    description: 'Designated executor for premium user'
  },
  {
    email: 'recipient@test.com',
    password: 'TestPassword123!',
    profile: {
      full_name: 'Rachel Recipient',
      date_of_birth: '1995-09-05',
      country: 'US',
      plan_strength: 0,
      subscription_status: 'free',
      onboarding_completed: false
    },
    description: 'Time capsule recipient'
  },
  {
    email: 'review_due@test.com',
    password: 'TestPassword123!',
    profile: {
      full_name: 'Rita Review',
      date_of_birth: '1980-04-30',
      country: 'US',
      plan_strength: 100,
      subscription_status: 'active',
      subscription_tier: 'premium',
      onboarding_completed: true,
      preservation_mode: true,
      last_review_date: new Date(Date.now() - 395 * 24 * 60 * 60 * 1000).toISOString() // 13 months ago
    },
    description: 'Premium user due for annual review'
  }
];

// Helper function to create test data
async function createTestData(userId, persona) {
  try {
    // Create assets based on plan strength
    if (persona.profile.plan_strength >= 25) {
      const assets = [
        {
          user_id: userId,
          name: 'Family Home',
          category: 'real_estate',
          value: 450000,
          description: 'Our primary residence',
          asset_story: persona.profile.plan_strength >= 75 ? 
            'This home has been our sanctuary for the past 15 years. Every room holds precious memories of our children growing up.' : null
        },
        {
          user_id: userId,
          name: 'Retirement Account',
          category: 'investment',
          value: 325000,
          description: '401k retirement savings'
        }
      ];
      
      if (persona.profile.plan_strength >= 50) {
        assets.push({
          user_id: userId,
          name: 'Life Insurance Policy',
          category: 'insurance',
          value: 500000,
          description: 'Term life insurance policy'
        });
      }
      
      const { error: assetError } = await supabase
        .from('assets')
        .insert(assets);
      
      if (assetError) console.error('Error creating assets:', assetError);
    }
    
    // Create trusted people based on plan strength
    if (persona.profile.plan_strength >= 25) {
      const trustedPeople = [
        {
          user_id: userId,
          name: faker.person.fullName(),
          email: faker.internet.email(),
          relationship: 'spouse',
          phone: faker.phone.number(),
          is_primary_contact: true
        }
      ];
      
      if (persona.profile.plan_strength >= 50) {
        trustedPeople.push({
          user_id: userId,
          name: faker.person.fullName(),
          email: faker.internet.email(),
          relationship: 'child',
          phone: faker.phone.number()
        });
        
        trustedPeople.push({
          user_id: userId,
          name: 'Family Lawyer',
          email: 'lawyer@lawfirm.com',
          relationship: 'professional',
          phone: faker.phone.number(),
          is_professional: true
        });
      }
      
      const { error: peopleError } = await supabase
        .from('trusted_people')
        .insert(trustedPeople);
      
      if (peopleError) console.error('Error creating trusted people:', peopleError);
    }
    
    // Create documents for users with higher plan strength
    if (persona.profile.plan_strength >= 50) {
      const documents = [
        {
          user_id: userId,
          name: 'Last Will and Testament',
          category: 'will',
          file_path: 'test-documents/will.pdf',
          file_size: 1024000,
          uploaded_at: new Date().toISOString()
        }
      ];
      
      if (persona.profile.plan_strength >= 75) {
        documents.push({
          user_id: userId,
          name: 'Power of Attorney',
          category: 'legal',
          file_path: 'test-documents/poa.pdf',
          file_size: 512000,
          uploaded_at: new Date().toISOString()
        });
        
        documents.push({
          user_id: userId,
          name: 'Insurance Policy',
          category: 'insurance',
          file_path: 'test-documents/insurance.pdf',
          file_size: 768000,
          uploaded_at: new Date().toISOString()
        });
      }
      
      const { error: docError } = await supabase
        .from('documents')
        .insert(documents);
      
      if (docError) console.error('Error creating documents:', docError);
    }
    
    // Create time capsules for premium users
    if (persona.email === 'premium_user@test.com') {
      const timeCapsules = [
        {
          user_id: userId,
          recipient_email: 'recipient@test.com',
          title: 'Letter to My Children',
          message: 'Dear children, if you are reading this, it means I am no longer with you...',
          scheduled_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          delivery_method: 'email',
          status: 'scheduled'
        },
        {
          user_id: userId,
          recipient_email: 'spouse@example.com',
          title: 'Anniversary Message',
          message: 'My dearest love, on our anniversary, I want you to know...',
          scheduled_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
          delivery_method: 'email',
          status: 'scheduled',
          capsule_type: 'anniversary'
        }
      ];
      
      const { error: capsuleError } = await supabase
        .from('time_capsules')
        .insert(timeCapsules);
      
      if (capsuleError) console.error('Error creating time capsules:', capsuleError);
    }
    
    // Create life events for users with plan strength >= 75
    if (persona.profile.plan_strength >= 75) {
      const lifeEvents = [
        {
          user_id: userId,
          event_type: 'birth',
          event_date: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 5 years ago
          description: 'Birth of first child',
          actions_taken: ['Updated will', 'Added child as beneficiary', 'Increased life insurance']
        },
        {
          user_id: userId,
          event_type: 'home_purchase',
          event_date: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 2 years ago
          description: 'Purchased new family home',
          actions_taken: ['Updated asset list', 'Filed deed documents', 'Updated insurance']
        }
      ];
      
      const { error: eventError } = await supabase
        .from('life_events')
        .insert(lifeEvents);
      
      if (eventError) console.error('Error creating life events:', eventError);
    }
    
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

// Main seeding function
async function seedDatabase() {
  console.log('🌱 Starting Heritage Vault test persona seeding...\n');
  
  const createdUsers = {};
  
  for (const persona of personas) {
    try {
      console.log(`Creating ${persona.email}...`);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: persona.email,
        password: persona.password,
        email_confirm: true
      });
      
      if (authError) {
        if (authError.message.includes('already exists')) {
          console.log(`  ⚠️  User already exists, skipping...`);
          continue;
        }
        throw authError;
      }
      
      const userId = authData.user.id;
      createdUsers[persona.email] = userId;
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...persona.profile
        });
      
      if (profileError) {
        console.error('Profile error:', profileError);
        continue;
      }
      
      // Create additional test data
      await createTestData(userId, persona);
      
      console.log(`  ✅ Created: ${persona.description}`);
      
    } catch (error) {
      console.error(`  ❌ Error creating ${persona.email}:`, error.message);
    }
  }
  
  // Set up executor relationship
  if (createdUsers['premium_user@test.com'] && createdUsers['executor@test.com']) {
    try {
      const { error } = await supabase
        .from('executor_assignments')
        .insert({
          user_id: createdUsers['premium_user@test.com'],
          executor_id: createdUsers['executor@test.com'],
          assigned_at: new Date().toISOString(),
          status: 'active',
          permissions: ['view_all', 'execute_will', 'distribute_assets']
        });
      
      if (!error) {
        console.log('\n✅ Set up executor relationship between premium_user and executor');
      }
    } catch (error) {
      console.error('Error setting up executor relationship:', error);
    }
  }
  
  console.log('\n🎉 Test persona seeding complete!\n');
  console.log('📧 Test Accounts:');
  console.log('================');
  personas.forEach(p => {
    console.log(`${p.email} (password: ${p.password})`);
    console.log(`  ${p.description}`);
  });
  
  console.log('\n💡 Testing Scenarios:');
  console.log('====================');
  console.log('1. New User Onboarding: Login as new_user@test.com');
  console.log('2. Mid-Journey Progress: Login as mid_journey@test.com');
  console.log('3. Premium Features: Login as premium_user@test.com');
  console.log('4. Free User Limits: Login as free_user@test.com');
  console.log('5. Executor Toolkit: Login as executor@test.com');
  console.log('6. Time Capsule Receipt: Check recipient@test.com');
  console.log('7. Annual Review Flow: Login as review_due@test.com');
}

// Run the seeding
seedDatabase().catch(console.error);
