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
  beforeEach(async function () {
    Object.assign(this, await loadFixture(deployContract));
  });
  // ::::::::::::: DEPLOIMENT ::::::::::::: //

  describe("DEPLOIEMENT", function () {
    it("Le owner est bien le titulaire", async function () {
      expect((await this.voting.owner()) === this.owner.address);
    });
  });

  // ::::::::::::: ONLYVOTERS ::::::::::::: //

  describe("MODIFIER ONLYVOTERS", function () {
    it("Doit être un voter", async function () {
      await expect(this.voting.getVoter(this.owner)).to.be.revertedWith(
        "You're not a voter"
      );
    });
  });

  // ::::::::::::: REGISTRATION ::::::::::::: //

  describe("REGISTRATION", function () {
    it("Doit pouvoir ajouter un voter en fonction en l'adresse", async function () {
      await this.voting.addVoter(this.owner);
      const voter = await this.voting.getVoter(this.owner.address);

      expect(voter.isRegistered).to.be.true;
    });
    it("Ne doit pas pouvoir ajouter deux fois le même voter", async function () {
      await this.voting.addVoter(this.owner);
      await expect(this.voting.addVoter(this.owner)).to.be.revertedWith(
        "Already registered"
      );
    });
    it("Ne doit pas pouvoir ajouter de voter hors période RegisteringVoters", async function () {
      await this.voting.startProposalsRegistering();
      await expect(this.voting.addVoter(this.owner)).to.be.revertedWith(
        "Voters registration is not open yet"
      );
    });
    it("Doit émettre un évenement lorsqu'un voter est ajouté", async function () {
      expect(await this.voting.addVoter(this.owner))
        .to.emit(this.voting, "VoterRegistered")
        .withArgs(this.owner.address);
    });
  });

  // ::::::::::::: PROPOSAL ::::::::::::: //

  describe("PROPOSAL", function () {
    it("Doit pouvoir ajouter une proposal", async function () {
      await this.voting.addVoter(this.owner);
      await this.voting.startProposalsRegistering();
      await this.voting.addProposal(this.proposal);

      expect(
        (await this.voting.getOneProposal(this.proposalId).description) ===
          this.proposal
      );
    });
    it("Ne doit pas pouvoir ajouter de voter hors période ProposalsRegistrationStarted", async function () {
      await this.voting.addVoter(this.owner);

      await expect(this.voting.addProposal(this.proposal)).to.be.revertedWith(
        "Proposals are not allowed yet"
      );
    });
    it("Ne doit pas pouvoir ajouter de proposal vide", async function () {
      await this.voting.addVoter(this.owner);
      await this.voting.startProposalsRegistering();

      await expect(this.voting.addProposal("")).to.be.revertedWith(
        "Vous ne pouvez pas ne rien proposer"
      );
    });
    it("Doit émettre un évenement lorsqu'une proposal est ajouté", async function () {
      await this.voting.addVoter(this.owner);
      await this.voting.startProposalsRegistering();

      expect(await this.voting.addProposal(this.proposal))
        .to.emit(this.voting, "ProposalRegistered")
        .withArgs(this.proposalId);
    });
  });

  // ::::::::::::: VOTE ::::::::::::: //

  describe("VOTE", function () {
    it("Doit pouvoir voter", async function () {
      await this.voting.addVoter(this.owner);
      await this.voting.startProposalsRegistering();
      await this.voting.addProposal(this.proposal);
      await this.voting.endProposalsRegistering();
      await this.voting.startVotingSession();
      await this.voting.setVote(this.proposalId);

      expect(
        (await this.voting.getOneProposal(this.proposalId).voteCount) === this.proposalId
      );
    });
    it("Ne doit pas pouvoir ajouter de voter hors période VotingSessionStarted", async function () {
      await this.voting.addVoter(this.owner);

      await expect(this.voting.setVote(this.proposalId)).to.be.revertedWith(
        "Voting session havent started yet"
      );
    });
    it("Ne doit pas pouvoir voter deux fois", async function () {
      await this.voting.addVoter(this.owner);
      await this.voting.startProposalsRegistering();
      await this.voting.addProposal(this.proposal);
      await this.voting.endProposalsRegistering();
      await this.voting.startVotingSession();
      await this.voting.setVote(this.proposalId);

      await expect(this.voting.setVote(this.proposalId)).to.be.revertedWith(
        "You have already voted"
      );
    });
    it("Ne doit pas pouvoir voter pour une proposal qui n'existe pas", async function () {
      await this.voting.addVoter(this.owner);
      await this.voting.startProposalsRegistering();
      await this.voting.addProposal(this.proposal);
      await this.voting.endProposalsRegistering();
      await this.voting.startVotingSession();

      await expect(this.voting.setVote(3)).to.be.revertedWith("Proposal not found");
    });
    it("Doit pouvoir enregistrer l'ID du vote au voter", async function () {
      await this.voting.addVoter(this.owner);
      await this.voting.startProposalsRegistering();
      await this.voting.addProposal(this.proposal);
      await this.voting.endProposalsRegistering();
      await this.voting.startVotingSession();
      await this.voting.setVote(this.proposalId);
      const voter = await this.voting.getVoter(this.owner);
      const votedProposalId = BigInt(voter.votedProposalId);

      expect(votedProposalId).to.equal(this.proposalId);
    });

    it("Doit pouvoir enregistrer le voter comme ayant déjà voter", async function () {
      await this.voting.addVoter(this.owner);
      await this.voting.startProposalsRegistering();
      await this.voting.addProposal(this.proposal);
      await this.voting.endProposalsRegistering();
      await this.voting.startVotingSession();
      await this.voting.setVote(this.proposalId);
      const voter = await this.voting.getVoter(this.owner);

      expect(voter.hasVoted).to.be.true;
    });
    it("Doit émettre un évenement lorsqu'une vote est ajouté", async function () {
      await this.voting.addVoter(this.owner);
      await this.voting.startProposalsRegistering();
      await this.voting.addProposal(this.proposal);
      await this.voting.endProposalsRegistering();
      await this.voting.startVotingSession();

      expect(await this.voting.setVote(this.proposalId))
        .to.emit(this.voting, "Voted")
        .withArgs(this.owner, this.proposalId);
    });
  });
  // ::::::::::::: STATE ::::::::::::: //
  describe("STATE", function () {
    it("Doit être au workflow RegisteringVoters", async function () {
      const workflowStatus = await this.voting.workflowStatus();
      assert.equal(
        workflowStatus,
        0,
        "Le workflowStatus devrait être RegisteringVoters (valeur 0)"
      );
    });
    it("Doit être au workflow ProposalsRegistrationStarted", async function () {
      await this.voting.startProposalsRegistering();
      const workflowStatus = await this.voting.workflowStatus();
      assert.equal(
        workflowStatus,
        1,
        "Le workflowStatus devrait être ProposalsRegistrationStarted (valeur 1)"
      );
    });
    it("Doit être au workflow ProposalsRegistrationEnded", async function () {
      await this.voting.startProposalsRegistering();
      await this.voting.endProposalsRegistering();
      const workflowStatus = await this.voting.workflowStatus();

      assert.equal(
        workflowStatus,
        2,
        "Le workflowStatus devrait être ProposalsRegistrationEnded (valeur 2)"
      );
    });
    it("Doit être au workflow VotingSessionStarted", async function () {
      await this.voting.startProposalsRegistering();
      await this.voting.endProposalsRegistering();
      await this.voting.startVotingSession();
      const workflowStatus = await this.voting.workflowStatus();

      assert.equal(
        workflowStatus,
        3,
        "Le workflowStatus devrait être VotingSessionStarted (valeur 3)"
      );
    });
    it("Doit être au workflow VotingSessionEnded", async function () {
      await this.voting.startProposalsRegistering();
      await this.voting.endProposalsRegistering();
      await this.voting.startVotingSession();
      await this.voting.endVotingSession();
      const workflowStatus = await this.voting.workflowStatus();

      assert.equal(
        workflowStatus,
        4,
        "Le workflowStatus devrait être VotingSessionEnded (valeur 4)"
      );
    });
    it("Doit être au workflow VotesTallied", async function () {
      await this.voting.startProposalsRegistering();
      await this.voting.endProposalsRegistering();
      await this.voting.startVotingSession();
      await this.voting.endVotingSession();
      await this.voting.tallyVotes();
      const workflowStatus = await this.voting.workflowStatus();

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
      const secondProposal = "Je préfère Hardhat";
      await this.voting.addVoter(this.owner);
      await this.voting.startProposalsRegistering();
      await this.voting.addProposal(this.proposal);
      await this.voting.addProposal(secondProposal);
      await this.voting.endProposalsRegistering();
      await this.voting.startVotingSession();
      await this.voting.setVote(this.proposalId);
      await this.voting.endVotingSession();
      await this.voting.tallyVotes();
      expect(await this.voting.winningProposalID()).to.equal(this.proposalId);
    });
  });
});
