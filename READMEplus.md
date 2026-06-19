# Anonymizer - Outil d'Anonymisation / Dé-anonymisation

## 🎯 Objectif du Projet

Démontrer la puissance du **vibe coding** avec Grok Build en créant rapidement un outil d’anonymisation de documents, capable de :

- Anonymiser des documents en remplaçant les données personnelles par des tags cohérents
- Générer un mapping (JSON) des correspondances
- Permettre la **dé-anonymisation** après traitement par une IA

L’objectif est aussi de montrer à mes collègues la différence de productivité par rapport à un développement classique.

## ✨ Fonctionnalités

- **Anonymisation** intelligente (regex + règles avancées)
- Tags spécifiques et cohérents : `[PER_001]`, `[TEL_001]`, `[SIRET_001]`, `[EMAIL_001]`, etc.
- Génération automatique d’un fichier de mapping JSON
- **Dé-anonymisation** (restauration des données originales)
- Interface web simple avec vue avant/après
- Support des principaux PII français :
  - Noms (y compris composés)
  - Téléphones (portables et fixes)
  - Adresses
  - Emails
  - Dates de naissance
  - Numéros de Sécurité Sociale
  - SIRET / SIREN
  - IBAN
  - Cartes bancaires

## 🛠 Stack Technique

- **Next.js 15** (App Router)
- TypeScript
- Tailwind CSS
- Traitement principalement côté client
- Développé en **vibe coding** avec Grok Build

## 📁 Structure du Projet

Anonymizer/
├── app/                  # Pages et composants Next.js
├── samples/              # Fichiers de test
├── public/
├── mapping/              # Fichiers de mapping générés (optionnel)
├── components/
└── lib/                  # Logique d'anonymisation



## 🚀 Installation & Lancement

```bash
cd Anonymizer
npm install
npm run dev


Ouvre ensuite http://localhost:3000
📋 Tests Réalisés

test1.txt → Basique (noms, téléphones, adresses)
test2.txt / test3.txt → Avancé (SIRET, SIREN, noms composés, etc.)

Tous les tests passent avec une bonne couverture.
🎯 Objectif Futur

Ajouter le support PDF
Améliorer l’interface utilisateur
Ajouter un mode "niveau d’anonymisation" (léger / strict)
Déploiement (Vercel)

💡 Contexte
Ce projet a été entièrement créé en vibe coding avec Grok Build en une seule session.
Objectif : montrer qu’avec les bons outils, on peut prototyper très rapidement des solutions fonctionnelles et maintenables.
