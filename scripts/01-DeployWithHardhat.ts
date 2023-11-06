import { ethers } from "hardhat";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function main() {
  console.log("Deploying Ballot Contract...");
  console.log("PROPOSALS: ", PROPOSALS);
  PROPOSALS.forEach((proposal) => {
    console.log("PROPOSAL: ", proposal);
  })
  const ballotFactory = await ethers.getContractFactory("Ballot");
  const ballotContract = await ballotFactory.deploy(
    PROPOSALS.map(ethers.encodeBytes32String)
  );
  await ballotContract.waitForDeployment();
  for (let index = 0; index < PROPOSALS.length; index++) {
    const proposal = await ballotContract.proposals(index);
    const name = ethers.decodeBytes32String(proposal.name);
    console.log({ index, name, proposal });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });