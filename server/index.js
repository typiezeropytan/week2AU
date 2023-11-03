const express = require('express');
const crypto = require('crypto'); // Import the crypto module

const port = 1225;

const app = express();
app.use(express.json());

// Parse the niceList JSON (assuming niceList.json is in the same directory as your script)
const niceList = require('./utils/niceList.json');


// Create an array of leaf nodes (in this case, we'll use the names as leaf nodes)
const leafNodes = niceList.names.map((name) => crypto.createHash('sha256').update(name).digest('hex'));

// Function to build a Merkle Tree
function buildMerkleTree(leafNodes) {
  if (leafNodes.length === 0) {
    return null;
  }

  if (leafNodes.length === 1) {
    return leafNodes[0];
  }

  const nextLevel = [];
  for (let i = 0; i < leafNodes.length; i += 2) {
    const left = leafNodes[i];
    const right = i + 1 < leafNodes.length ? leafNodes[i + 1] : '';
    const combinedHash = crypto.createHash('sha256').update(left + right).digest('hex');
    nextLevel.push(combinedHash);
  }

  return buildMerkleTree(nextLevel);
}

// Build the Merkle Tree
const merkleRoot = buildMerkleTree(leafNodes);

// TODO: Hardcode the calculated Merkle Root here
// Paste the hex string in the MERKLE_ROOT variable, without the 0x prefix
const MERKLE_ROOT = merkleRoot;

// Function to verify a Merkle proof
function verifyProof(name, root, leafNodes, proof) {
  const leafHash = crypto.createHash('sha256').update(name).digest('hex');
  let currentHash = leafHash;

  for (const proofElement of proof) {
    if (proofElement.position === 'left') {
      currentHash = crypto.createHash('sha256').update(currentHash + proofElement.sibling).digest('hex');
    } else {
      currentHash = crypto.createHash('sha256').update(proofElement.sibling + currentHash).digest('hex');
    }
  }

  return currentHash === root;
}

// You can now use this function in your /gift route
app.post('/gift', (req, res) => {
  // Grab the parameters from the front-end here
  const body = req.body;
  const name = body.name; // Assuming the name is in the request body
  const proof = body.proof; // Assuming the proof is in the request body

  // Prove that a name is in the list by checking the Merkle proof
  const isInTheList = verifyProof(name, MERKLE_ROOT, leafNodes, proof);

  if (isInTheList) {
    res.send("You got a toy robot!");
  } else {
    res.send("You are not on the list :(");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
