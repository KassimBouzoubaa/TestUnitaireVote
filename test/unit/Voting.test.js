const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting tests", function () {
  async function deployContract() {
    const [owner, voter1] = await ethers.getSigners();
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(Voting);
    const proposal = "J'ai rejoins Alyra";
    const proposalId = 1;
    return { voting, owner, voter1, proposal, proposalId };
  }

  // ::::::::::::: DEPLOIMENT ::::::::::::: //

  describe("DEPLOIEMENT", function () {
    it("Le owner est bien le titulaire", async function () {
      const { voting, owner } = await loadFixture(deployContract);
      expect((await voting.owner()) === owner.address);
    });
  });

  // ::::::::::::: ONLYVOTERS ::::::::::::: //

  describe("MODIFIER ONLYVOTERS", function () {
    it("Doit être un voter", async function () {
      const { voting, owner } = await loadFixture(deployContract);
      await expect(voting.getVoter(owner)).to.be.revertedWith(
        "You're not a voter"
      );
    });
  });

  // ::::::::::::: REGISTRATION ::::::::::::: //

  describe("REGISTRATION", function () {
    it("Doit pouvoir ajouter un voter en fonction en l'adresse", async function () {
      const { voting, owner } = await loadFixture(deployContract);
      await voting.addVoter(owner);
      const voter = await voting.getVoter(owner.address);

      expect(voter.isRegistered).to.be.true;
    });
    it("Ne doit pas pouvoir ajouter deux fois le même voter", async function () {
      const { voting, owner } = await loadFixture(deployContract);
      await voting.addVoter(owner);
      await expect(voting.addVoter(owner)).to.be.revertedWith(
        "Already registered"
      );
    });
    it("Ne doit pas pouvoir ajouter de voter hors période RegisteringVoters", async function () {
      const { voting, owner } = await loadFixture(deployContract);
      await voting.startProposalsRegistering();
      await expect(voting.addVoter(owner)).to.be.revertedWith(
        "Voters registration is not open yet"
      );
    });
    it("Doit émettre un évenement lorsqu'un voter est ajouté", async function () {
      const { voting, owner } = await loadFixture(deployContract);

      expect(await voting.addVoter(owner))
        .to.emit(voting, "VoterRegistered")
        .withArgs(owner.address);
    });
  });

  // ::::::::::::: PROPOSAL ::::::::::::: //

  describe("PROPOSAL", function () {
    it("Doit pouvoir ajouter une proposal", async function () {
      const { voting, owner, proposal, proposalId } = await loadFixture(
        deployContract
      );
      await voting.addVoter(owner);
      await voting.startProposalsRegistering();
      await voting.addProposal(proposal);

      expect(
        (await voting.getOneProposal(proposalId).description) === proposal
      );
    });
    it("Ne doit pas pouvoir ajouter de voter hors période ProposalsRegistrationStarted", async function () {
      const { voting, owner, proposal } = await loadFixture(deployContract);
      await voting.addVoter(owner);

      await expect(voting.addProposal(proposal)).to.be.revertedWith(
        "Proposals are not allowed yet"
      );
    });
    it("Ne doit pas pouvoir ajouter de proposal vide", async function () {
      const { voting, owner } = await loadFixture(deployContract);
      await voting.addVoter(owner);
      await voting.startProposalsRegistering();

      await expect(voting.addProposal("")).to.be.revertedWith(
        "Vous ne pouvez pas ne rien proposer"
      );
    });
    it("Doit émettre un évenement lorsqu'une proposal est ajouté", async function () {
      const { voting, owner, proposal, proposalId } = await loadFixture(
        deployContract
      );
      await voting.addVoter(owner);
      await voting.startProposalsRegistering();

      expect(await voting.addProposal(proposal))
        .to.emit(voting, "ProposalRegistered")
        .withArgs(proposalId);
    });
  });

  // ::::::::::::: VOTE ::::::::::::: //

  describe("VOTE", function () {
    it("Doit pouvoir voter", async function () {
      const { voting, owner, proposal, proposalId } = await loadFixture(
        deployContract
      );
      await voting.addVoter(owner);
      await voting.startProposalsRegistering();
      await voting.addProposal(proposal);
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      await voting.setVote(proposalId);

      expect(
        (await voting.getOneProposal(proposalId).voteCount) === proposalId
      );
    });
    it("Ne doit pas pouvoir ajouter de voter hors période VotingSessionStarted", async function () {
      const { voting, owner, proposalId } = await loadFixture(deployContract);
      await voting.addVoter(owner);

      await expect(voting.setVote(proposalId)).to.be.revertedWith(
        "Voting session havent started yet"
      );
    });
    it("Ne doit pas pouvoir voter deux fois", async function () {
      const { voting, owner, proposal, proposalId } = await loadFixture(
        deployContract
      );
      await voting.addVoter(owner);
      await voting.startProposalsRegistering();
      await voting.addProposal(proposal);
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      await voting.setVote(proposalId);

      await expect(voting.setVote(proposalId)).to.be.revertedWith(
        "You have already voted"
      );
    });
    it("Ne doit pas pouvoir voter pour une proposal qui n'existe pas", async function () {
      const { voting, owner, proposal } = await loadFixture(deployContract);
      await voting.addVoter(owner);
      await voting.startProposalsRegistering();
      await voting.addProposal(proposal);
      await voting.endProposalsRegistering();
      await voting.startVotingSession();

      await expect(voting.setVote(3)).to.be.revertedWith("Proposal not found");
    });
    it("Doit pouvoir enregistrer l'ID du vote au voter", async function () {
      const { voting, owner, proposal, proposalId } = await loadFixture(
        deployContract
      );

      await voting.addVoter(owner);
      await voting.startProposalsRegistering();
      await voting.addProposal(proposal);
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      await voting.setVote(proposalId);
      const voter = await voting.getVoter(owner);
      const votedProposalId = BigInt(voter.votedProposalId);

      expect(votedProposalId).to.equal(proposalId);
    });

    it("Doit pouvoir enregistrer le voter comme ayant déjà voter", async function () {
      const { voting, owner, proposal, proposalId } = await loadFixture(
        deployContract
      );

      await voting.addVoter(owner);
      await voting.startProposalsRegistering();
      await voting.addProposal(proposal);
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      await voting.setVote(proposalId);
      const voter = await voting.getVoter(owner);

      expect(voter.hasVoted).to.be.true;
    });
    it("Doit émettre un évenement lorsqu'une vote est ajouté", async function () {
      const { voting, owner, proposal, proposalId } = await loadFixture(
        deployContract
      );

      await voting.addVoter(owner);
      await voting.startProposalsRegistering();
      await voting.addProposal(proposal);
      await voting.endProposalsRegistering();
      await voting.startVotingSession();

      expect(await voting.setVote(proposalId))
        .to.emit(voting, "Voted")
        .withArgs(owner, proposalId);
    });
  });
  // ::::::::::::: STATE ::::::::::::: //
  describe("STATE", function () {
    it("Doit être au workflow RegisteringVoters", async function () {
      const { voting } = await loadFixture(deployContract);
      const workflowStatus = await voting.workflowStatus();
      assert.equal(
        workflowStatus,
        0,
        "Le workflowStatus devrait être RegisteringVoters (valeur 0)"
      );
    });
    it("Doit être au workflow ProposalsRegistrationStarted", async function () {
      const { voting } = await loadFixture(deployContract);
      await voting.startProposalsRegistering();
      const workflowStatus = await voting.workflowStatus();
      assert.equal(
        workflowStatus,
        1,
        "Le workflowStatus devrait être ProposalsRegistrationStarted (valeur 1)"
      );
    });
    it("Doit être au workflow ProposalsRegistrationEnded", async function () {
      const { voting } = await loadFixture(deployContract);
      await voting.startProposalsRegistering();
      await voting.endProposalsRegistering();
      const workflowStatus = await voting.workflowStatus();

      assert.equal(
        workflowStatus,
        2,
        "Le workflowStatus devrait être ProposalsRegistrationEnded (valeur 2)"
      );
    });
    it("Doit être au workflow VotingSessionStarted", async function () {
      const { voting } = await loadFixture(deployContract);
      await voting.startProposalsRegistering();
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      const workflowStatus = await voting.workflowStatus();

      assert.equal(
        workflowStatus,
        3,
        "Le workflowStatus devrait être VotingSessionStarted (valeur 3)"
      );
    });
    it("Doit être au workflow VotingSessionEnded", async function () {
      const { voting } = await loadFixture(deployContract);
      await voting.startProposalsRegistering();
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      await voting.endVotingSession();
      const workflowStatus = await voting.workflowStatus();

      assert.equal(
        workflowStatus,
        4,
        "Le workflowStatus devrait être VotingSessionEnded (valeur 4)"
      );
    });
    it("Doit être au workflow VotesTallied", async function () {
      const { voting } = await loadFixture(deployContract);
      await voting.startProposalsRegistering();
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      await voting.endVotingSession();
      await voting.tallyVotes();
      const workflowStatus = await voting.workflowStatus();

      assert.equal(
        workflowStatus,
        5,
        "Le workflowStatus devrait être VotesTallied (valeur 5)"
      );
    });
  });
  // ::::::::::::: TALLYVOTES ::::::::::::: //
  describe("TALLYVOTES", function () {
    it("Doit récupérer l'ID de la proposal winner", async function () {
      const { voting, owner, proposal, proposalId } = await loadFixture(
        deployContract
      );
      const secondProposal = "Je préfère Hardhat";
      await voting.addVoter(owner);
      await voting.startProposalsRegistering();
      await voting.addProposal(proposal);
      await voting.addProposal(secondProposal);
      await voting.endProposalsRegistering();
      await voting.startVotingSession();
      await voting.setVote(proposalId);
      await voting.endVotingSession();
      await voting.tallyVotes();
      expect(await voting.winningProposalID()).to.equal(proposalId);
    });
  });
});
