const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting tests", function () {
  async function deployContract() {
    const [owner, voter1, voter2, voter3] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(Voting);
    let proposal = "J'ai rejoins Alyra";
    return { voting, owner, voter1, proposal };
  }

  describe("Adding voter, proposal, and vote.", function () {
    it("Must allow an address to vote.", async function () {
      const { voting, voter1, owner } = await loadFixture(deployContract);

      await voting.addVoter(owner);

      expect((await voting.getVoter(voter1)) === false);

      await voting.addVoter(voter1);

      expect((await voting.getVoter(voter1)) === true);
    });
    it("Should be able to change the workflow.", async function () {
      const { voting } = await loadFixture(deployContract);

      expect(voting.workflowStatus === "RegisteringVoters");

      await voting.startProposalsRegistering();

      expect(voting.workflowStatus === "ProposalsRegistrationStarted");
    });
    it("Should be able to add proposal", async function () {
      const { voting, owner, proposal } = await loadFixture(deployContract);

      await voting.addVoter(owner);
      await voting.startProposalsRegistering();

      await voting.addProposal(proposal);

      expect((await voting.getOneProposal(1).description) === proposal);
    });
    it("Should be able voting", async function () {
      const { voting, owner, proposal } = await loadFixture(deployContract);

      await voting.addVoter(owner);
      await voting.startProposalsRegistering();

      await voting.addProposal(proposal);

      expect((await voting.getOneProposal(1).voteCount) === 0);

      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      await voting.setVote(1);

      expect((await voting.getOneProposal(1).voteCount) === 1);
    });
    it("Should be able retrieve winningProposalID", async function () {
      const { voting, owner, proposal } = await loadFixture(deployContract);
      let secondProposal = "Je souhaite rejoindre consensys";
      
      await voting.addVoter(owner);

      await voting.startProposalsRegistering();
      await voting.addProposal(proposal);
      await voting.addProposal(secondProposal);
      await voting.endProposalsRegistering();

      await voting.startVotingSession();
      await voting.setVote(1);
      await voting.endVotingSession();

      expect((await voting.tallyVotes()) === 1);
    });
    it("Should not be able to vote twice", async function () {
      const { voting, owner, proposal } = await loadFixture(deployContract);

      await voting.addVoter(owner);

      await voting.startProposalsRegistering();
      await voting.addProposal(proposal);
      await voting.endProposalsRegistering();

      await voting.startVotingSession();
      await voting.setVote(1);

      await expect(voting.setVote(1)).to.be.revertedWith(
        "You have already voted"
      );
    });
    it("Should emit an event when a proposal has been added.", async function () {
      const { voting, owner, proposal } = await loadFixture(deployContract);

      await voting.addVoter(owner);
      await voting.startProposalsRegistering();

      expect(await voting.addProposal(proposal))
        .to.emit(voting, "ProposalRegistered")
        .withArgs(owner.address);
    });
  });
});
