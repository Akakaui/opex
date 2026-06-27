#!/usr/bin/env node

/**
 * Qdrant Client - Vector DB operations for domain knowledge
 * 
 * Usage:
 *   node qdrant.js create-collection <name>
 *   node qdrant.js upsert <collection> <id> <vector> <payload>
 *   node qdrant.js search <collection> <vector> <limit>
 *   node qdrant.js list-collections
 *   node qdrant.js delete-collection <name>
 */

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';

async function request(path, options = {}) {
  const url = `${QDRANT_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response.json();
}

async function createCollection(name) {
  return request(`/collections/${name}`, {
    method: 'PUT',
    body: JSON.stringify({
      vectors: {
        size: 768,
        distance: 'Cosine',
      },
    }),
  });
}

async function deleteCollection(name) {
  return request(`/collections/${name}`, {
    method: 'DELETE',
  });
}

async function listCollections() {
  return request('/collections');
}

async function upsert(collection, id, vector, payload) {
  return request(`/collections/${collection}/points`, {
    method: 'PUT',
    body: JSON.stringify({
      points: [
        {
          id: id,
          vector: vector,
          payload: payload,
        },
      ],
    }),
  });
}

async function search(collection, vector, limit = 5, filter = null) {
  const body = {
    vector: vector,
    limit: limit,
    with_payload: true,
  };
  
  if (filter) {
    body.filter = filter;
  }
  
  return request(`/collections/${collection}/points/search`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function getCollections() {
  const result = await listCollections();
  return result.result?.collections?.map(c => c.name) || [];
}

async function collectionExists(name) {
  const collections = await getCollections();
  return collections.includes(name);
}

// CLI
if (require.main === module) {
  const [,, command, ...args] = process.argv;

  async function main() {
    switch (command) {
      case 'create-collection':
        console.log(JSON.stringify(await createCollection(args[0]), null, 2));
        break;
      case 'delete-collection':
        console.log(JSON.stringify(await deleteCollection(args[0]), null, 2));
        break;
      case 'list-collections':
        console.log(JSON.stringify(await listCollections(), null, 2));
        break;
      case 'upsert':
        console.log(JSON.stringify(
          await upsert(args[0], args[1], JSON.parse(args[2]), JSON.parse(args[3])),
          null, 2
        ));
        break;
      case 'search':
        console.log(JSON.stringify(
          await search(args[0], JSON.parse(args[1]), parseInt(args[2]) || 5),
          null, 2
        ));
        break;
      default:
        console.log('Usage: node qdrant.js <command> [args...]');
        console.log('Commands: create-collection, delete-collection, list-collections, upsert, search');
    }
  }
  
  main().catch(console.error);
}

module.exports = { createCollection, deleteCollection, listCollections, upsert, search, collectionExists, getCollections };
