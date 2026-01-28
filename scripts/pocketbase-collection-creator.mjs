import PocketBase from 'pocketbase';

export async function createCollection(pb, collectionName) {
  console.log(`\nProcessing collection: ${collectionName}`);

  try {
    // Check if collection already exists
    const existingCollections = await pb.collections.getList(1, 50, {
      filter: `name = "${collectionName}"`
    });

    if (existingCollections.items.length > 0) {
      const existing = existingCollections.items[0];
      console.log(`  Found existing collection "${collectionName}" (${existing.id})`);

      try {
        await pb.collections.delete(existing.id);
        console.log(`  ✓ Deleted existing collection "${collectionName}"`);
      } catch (error) {
        console.error(`  ✗ Failed to delete existing collection:`, error.message);
        throw error;
      }
    }

    // Get users collection for relation
    const usersCollection = await pb.collections.getOne('users');

    if (collectionName === 'coupons') {
      await createCouponsCollection(pb, usersCollection.id);
    } else if (collectionName === 'retailers') {
      await createRetailersCollection(pb);
    }

    console.log(`  ✓ Created collection "${collectionName}"`);
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error(`\n✗ Failed to create collection "${collectionName}":`, error.message);
    throw error;
  }
}

async function createCouponsCollection(pb, usersCollectionId) {
  // Create collection without schema first
  const created = await pb.collections.create({
    name: 'coupons',
    type: 'base'
  });

  // Update with schema using direct API call
  const schema = [
    {
      name: 'userId',
      type: 'relation',
      required: true,
      options: {
        collectionId: usersCollectionId,
        cascadeDelete: false,
        minSelect: 0,
        maxSelect: 1
      }
    },
    {
      name: 'retailer',
      type: 'text',
      required: true,
      options: { min: 1, max: 100 }
    },
    {
      name: 'initialValue',
      type: 'text',
      required: true,
      options: { min: 0, max: 50 }
    },
    {
      name: 'currentValue',
      type: 'text',
      required: true,
      options: { min: 0, max: 50 }
    },
    {
      name: 'expirationDate',
      type: 'date',
      required: false,
      options: { min: '' }
    },
    {
      name: 'notes',
      type: 'editor',
      required: false
    },
    {
      name: 'barcode',
      type: 'text',
      required: false,
      options: { min: 0, max: 200 }
    },
    {
      name: 'reference',
      type: 'text',
      required: false,
      options: { min: 0, max: 100 }
    },
    {
      name: 'activationCode',
      type: 'text',
      required: false,
      options: { min: 0, max: 50 }
    },
    {
      name: 'pin',
      type: 'text',
      required: false,
      options: { min: 0, max: 10 }
    }
  ];

  // Use raw fetch call to update schema
  const token = pb.authStore.token;
  const response = await fetch(`${pb.baseUrl}/api/collections/${created.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({ schema })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to update schema: ${errorData.message || 'Unknown error'}`);
  }
}

async function createRetailersCollection(pb) {
  // Create collection without schema first
  const created = await pb.collections.create({
    name: 'retailers',
    type: 'base'
  });

  // Update with schema using direct API call
  const schema = [
    {
      name: 'name',
      type: 'text',
      required: true,
      options: { min: 1, max: 100 }
    },
    {
      name: 'website',
      type: 'url',
      required: false
    },
    {
      name: 'logo',
      type: 'file',
      required: false,
      options: {
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      }
    }
  ];

  // Use raw fetch call to update schema
  const token = pb.authStore.token;
  const response = await fetch(`${pb.baseUrl}/api/collections/${created.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({ schema })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to update schema: ${errorData.message || 'Unknown error'}`);
  }
}
