# **PROJET BOT RP RED DEAD REDEMPTION**

<img src="./assets/logoServeur.png" alt="Image du projet" width="600" height="600">

## **Présentation du projet**

Le projet consiste à développer un bot Discord dédié au rôle-play de Red Dead Redemption (RDR). Ce bot utilise JavaScript et permet d'ajouter plusieurs fonctionnalités pour enrichir l'expérience RP au sein des serveurs. L'objectif est de créer un bot complet, interactif et facilement utilisable pour la gestion des sessions RP, des rôles et bien plus encore.

## **Fonctionnalités actuelles et commandes**

Le bot est déjà opérationnel avec les fonctionnalités suivantes :

- **Gestion des Rôles :**
  ```
  -accepter
  ```

  Attribution et gestion des rôles pour les joueurs en fonction de leurs actions ou de leur progression dans le RP.

- **Message de lancement et de clôture du serveur RP :**
```
-lancement
```

```
-clôture
```

  Envoi de messages automatiques lors du lancement et de la clôture des sessions RP, avec un compte à rebours en direct.

- **Message d'information pour prévenir les futures sessions RP :**
```
-proposition session
```

  Un message d'information détaillant la date et l'heure de la prochaine session RP, afin de prévenir les joueurs à l'avance.

- **Message de pré-lancement :**
```
-session
```
  Envoi d'un message quelques minutes avant le début de la session RP, avec les consignes à respecter pour bien débuter la session.

- **Message Anonyme :**
```
-Anonymous
```
  Possibilité de créer des messages en anonyme

- **Système de message d'xp :**
```
-xp
```
permet de visualiser son niveau ainsi que sa progression

```
-rang
```
permet de voir les rangs proposer 

mise en place d'une bdd SQlite pour stocker les données

  système mit en place pour divertir et inciter les personnes à être actif sur le serveur 

- **Mise en place de tickets dans différents salons :**

  Permet de créer des tickets pour différentes options


- **Automatisation des messages de départs et d'arrivées :**
  Le bot automatise les messages de départs et d'arrivées des membres dans le serveur.

- **Attribution d'un rôle en cliquant sur une émote**
  Quand un membre clique sur l'émot pré-définie sous un message, ça lui attribue automatiquement le rôle et envoie un MP de confirmation

## **Fonctionnalités à venir**

Le projet évolue constamment, et de nouvelles fonctionnalités sont en cours de développement, telles que :

- **Gestion de la banque :**
  Intégration d'une fonctionnalité pour gérer les finances des joueurs dans le RP.

- **Gestion des objets et équipements :**
  Permettre aux joueurs de gérer leurs objets et équipements dans le cadre du RP.

## **Objectif du projet**

L'objectif principal est de créer le bot RP Red Dead Redemption le plus complet et fonctionnel possible. Une fois stable, il sera mis à disposition des autres serveurs Discord qui souhaitent enrichir leur expérience RP avec des outils automatisés.

## **Conclusion**

Ce projet a pour but de rendre les sessions RP plus immersives et organisées, tout en apportant une gestion plus fluide des éléments clés du jeu. N'hésitez pas à rejoindre le projet et à contribuer pour faire de ce bot l'outil ultime pour tous les serveurs RP Red Dead Redemption !

## **Comment utiliser le bot**

installer les dépendances 
```
npm i 
```

créer un `.env` avec dedans la propriété `DISCORD_TOKEN=` puis faire la commande 
```
node index.js
```

## **Dernière mise à jour effectuée 20.01.2025**

Ajout système de message d'xp + bdd SQlite pour stockage

Précédente Mise à jour : WOLF RP V2.2.2 (20.01.2025)  
Mise à jour : WOLF RP V2.2.4 (20.01.2025)
