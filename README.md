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

1. Ajout d'un électeur et vérification de son droit de vote.
2. Modification du workflow.
3. Ajout d'une proposition et vérification de son existence.
4. Émission d'un vote.
5. Récupération de l'ID de la proposition gagnante.
6. Garantir qu'une adresse ne peut pas voter deux fois.
7. Vérification de l'émission d'un événement lorsqu'une proposition est ajoutée.