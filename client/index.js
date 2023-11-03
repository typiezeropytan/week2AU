const axios = require('axios');
const niceList = require('../utils/niceList.json');
const MerkleTree = require('../utils/MerkleTree'); // Ensure you have a MerkleTree implementation

const serverUrl = 'http://localhost:1225';

async function main() {
  const nameToCheck = 'Your Name'; // Replace with the name you want to check
  const leafNodes = niceList.names.map((name) => crypto.createHash('sha256').update(name).digest('hex'));
  
  // Create a Merkle tree
  const merkleTree = new MerkleTree(leafNodes);

  // Generate a Merkle proof for the name you want to check
  const proof = merkleTree.getProof(nameToCheck);

  // Send the POST request to the server with the name and proof
  const { data: gift } = await axios.post(`${serverUrl}/gift`, {
    name: nameToCheck,
    proof: proof,
  });

  console.log({ gift });
}

main();
