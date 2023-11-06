# Ballot.sol Function Execution Report

## Introduction

This report documents the execution of various functions within the "Ballot.sol" smart contract. I developed and run scripts to interact with the contract's functionalities, such as giving voting rights, casting votes, delegating votes, and querying results. Each function call is logged with its outcome and the corresponding transaction hash or revert reason.

## Methodology

Scripts were developed using [appropriate language/framework, e.g., JavaScript with Truffle/Hardhat]. They were executed against the deployed "Ballot.sol" contract at different addresses on the Sepolia Network.

Each function was invoked by a signer whose role is relevant to the action (e.g., the chairperson for giving voting rights). Transaction hashes are recorded for successful executions, and revert reasons are documented for any failed attempts.

## Execution Details

### Casting Votes

- **Contract Address:** `0xE8E4d890d8b134F382c503dE99A1b6c71198fF7D`
- **Transaction Hash:** `0x948402f35262953e1dffa6b46df871c87faa137cbac57dd647b61e2d4c27b14e`
- **Function Execution:** `vote(uint proposal)`
- **Signer:** `0xc743f017A2596F407eb3b3Cb7D347e2B46eb3b1d`
- **Status:** Success
- **Outcome:** Vote was successfully cast for proposal `0`.

### Giving Voting Rights

- **Contract Address:** `0x8235b4869f68c14e082F6Ca2776876482C1ade5E`
- **Transaction Hash:** `0x97d366bcecc21120dc3a4161fdc2e96ce4864887f2dd74f73cbe611a1df5e41e`
- **Function Execution:** `giveRightToVote(address voter)`
- **Signer:** `0xc743f017A2596F407eb3b3Cb7D347e2B46eb3b1d`
- **Status:** Success
- **Outcome:** The right to vote was successfully given to `0xdaabeCACDD888DCf68Ff1f2d9202e74ABA0601bd`.

### Delegating Votes

- **Contract Address:** `0x8235b4869f68c14e082F6Ca2776876482C1ade5E`
- **Transaction Hash:** `[Transaction_Hash]`
- **Function Execution:** `delegate(address to)`
- **Signer:** `0xc743f017A2596F407eb3b3Cb7D347e2B46eb3b1d`
- **Status:** Success
- **Outcome:** Voting power was successfully delegated to `0xdaabeCACDD888DCf68Ff1f2d9202e74ABA0601bd`.

### Querying Results

## Reading from the blockchain doesn't invole a transaction, this is a sample of one of the contracts:

```
0xE8E4d890d8b134F382c503dE99A1b6c71198fF7D
[
  { proposalName: 'Proposal 1', proposalIndex: 0, proposalVotes: '1' },
  { proposalName: 'Proposal 2', proposalIndex: 1, proposalVotes: '0' },
  { proposalName: 'Proposal 3', proposalIndex: 2, proposalVotes: '0' }
]
```

## Observations and Issues Encountered

Due to a design flaw in the contract, each address can vote only once, even when holding multiple proposals, hence, making the voting process unfair. This issue can be resolved by adding a mapping to keep track of the addresses that have already voted on each proposal, and not just on the global contract.
The other approach is to limit each contract to one proposal, and deploy multiple contracts for each proposal. This approach is not scalable, and it is not recommended to deploy multiple contracts for each proposal.
To be able to delegate the vote, you need to have the right to vote, which is not the case in the current contract. This issue can be resolved by adding a mapping to keep track of the addresses that have the right to vote, and not just on the global contract.

## Conclusion

The execution of the scripted functions within the "Ballot.sol" contract has been meticulously recorded in this report. The successful interactions demonstrate the functionality of the smart contract, while any rejections have been analyzed to understand and rectify the issues.