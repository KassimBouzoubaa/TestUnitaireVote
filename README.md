# Tests de Contrat Intelligent pour le Vote

Ce référentiel contient un ensemble de tests pour un contrat intelligent de vote. Les tests sont écrits en JavaScript à l'aide du framwork Hardhat et des assertions Chai.

## Prérequis

Avant d'exécuter les tests, assurez-vous d'avoir les éléments suivants installés :

- Node.js et npm 
- Hardhat

## Installation

1. Clonez ce référentiel :

   ```bash
   git clone https://github.com/KassimBouzoubaa/TestUnitaireVote.git

2.  Accédez au dossier du projet :

    cd testvoting

3. Installez les dépendances :

    npm install

## Exécution des tests

Pour exécuter les tests, utilisez la commande suivante :

npx hardhat test

## Description des tests

Les tests couvrent les aspects suivants du contrat intelligent de vote :

    DEPLOIEMENT
      ✔ Le owner est bien le titulaire (660ms)
    MODIFIER ONLYVOTERS
      ✔ Doit être un voter
    REGISTRATION
      ✔ Doit pouvoir ajouter un voter en fonction en l'adresse
      ✔ Ne doit pas pouvoir ajouter deux fois le même voter
      ✔ Ne doit pas pouvoir ajouter de voter hors période RegisteringVoters
      ✔ Doit émettre un évenement lorsqu'un voter est ajouté
    PROPOSAL
      ✔ Doit pouvoir ajouter une proposal
      ✔ Ne doit pas pouvoir ajouter de voter hors période ProposalsRegistrationStarted
      ✔ Ne doit pas pouvoir ajouter de proposal vide
      ✔ Doit émettre un évenement lorsqu'une proposal est ajouté
    VOTE
      ✔ Doit pouvoir voter
      ✔ Ne doit pas pouvoir ajouter de voter hors période VotingSessionStarted
      ✔ Ne doit pas pouvoir voter deux fois
      ✔ Ne doit pas pouvoir voter pour une proposal qui n'existe pas
      ✔ Doit pouvoir enregistrer l'ID du vote au voter
      ✔ Doit pouvoir enregistrer le voter comme ayant déjà voter
      ✔ Doit émettre un évenement lorsqu'une vote est ajouté
    STATE
      ✔ Doit être au workflow RegisteringVoters
      ✔ Doit être au workflow ProposalsRegistrationStarted
      ✔ Doit être au workflow ProposalsRegistrationEnded
      ✔ Doit être au workflow VotingSessionStarted
      ✔ Doit être au workflow VotingSessionEnded
      ✔ Doit être au workflow VotesTallied
    TALLYVOTES
      ✔ Doit récupérer l'ID de la proposal winner