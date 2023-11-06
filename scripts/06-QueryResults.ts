import { ethers } from "hardhat";
import * as dotenv from 'dotenv';
dotenv.config();
const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];
import { Ballot, Ballot__factory } from "../typechain-types";

// Write an script to query results from the contract
async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS ?? "";
  const proposalNumber = "1";
  const provider = new ethers.JsonRpcProvider(process.env.RPC_ENDPOINT_URL ?? "");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  console.log(`Using address ${wallet.address}`);
  const balanceBN = await provider.getBalance(wallet.address);
  const balance = Number(ethers.formatUnits(balanceBN));
  console.log(`Wallet balance ${balance} ETH`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }
  const ballotFactory = new Ballot__factory(wallet);
  const ballotContract = await ballotFactory.attach(contractAddress) as Ballot;
  // Query Results for all 3 proposals, stored in an array, by index number
  const results = await Promise.all(
    PROPOSALS.map(async (proposal, index) => {
      // Since Solidity uses numbers to index, we don't need to encode as bytes32
      const proposalVotes = await ballotContract.proposals(index); // Directly using index
      return {
        proposalName: proposal, // Assuming 'proposal' is the name or description
        proposalIndex: index,
        proposalVotes: proposalVotes.voteCount.toString() // Accessing the voteCount property
      };
    })
  );
  console.log(results);
}

main()
.then(() => process.exitCode = 0)
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});