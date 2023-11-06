import { ethers } from "hardhat";
import * as dotenv from 'dotenv';
dotenv.config();
const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];
import { Ballot, Ballot__factory } from "../typechain-types";

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS ?? "";
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
  //encode the proposalNumber as bytes32
  const proposalNumber = "0";
  const tx = await ballotContract.vote(proposalNumber);
  const receipt = await tx.wait();
  console.log(`Transaction completed ${receipt?.hash}`)
}

main()
.then(() => process.exitCode = 0)
.catch((error) => {
  console.error(error);
  process.exitCode = 1;
});