# Anonymizer

Outil web d’**anonymisation et dé-anonymisation** de documents (TXT, PDF, DOCX).

## 🎯 Objectif

Permettre d’anonymiser des documents contenant des données personnelles, de les faire traiter par une IA, puis de restaurer les données originales grâce à un mapping.

Ce projet a été développé en **vibe coding** avec Grok Build pour démontrer la rapidité de développement par rapport à une approche classique.

## ✨ Fonctionnalités

- Anonymisation intelligente avec tags cohérents (`[PER_001]`, `[SIRET_001]`, `[TEL_001]`, etc.)
- Génération automatique d’un fichier de mapping (JSON)
- Dé-anonymisation (restauration des données originales)
- Support des formats : **TXT**, **PDF**, **DOCX**
- Détection des principaux PII français (noms, téléphones, adresses, SIRET, SIREN, IBAN, etc.)

## 🛠 Stack

- Next.js 15 (App Router)
- TypeScript + Tailwind CSS
- Développé avec Grok Build (xAI)

## 🚀 Lancement en local

```bash```
npm install
npm run dev

http://localhost:3000

## 📦 Déploiement
Le projet est déployé sur Vercel : https://anonymizer-wheat.vercel.app/

## 📁 Structure
Anonymizer/
├── app/              # Application Next.js
├── samples/          # Fichiers de test
├── components/       # Composants React
└── lib/              # Logique d'anonymisation

## 🧪 Tests
Plusieurs fichiers de test sont disponibles dans le dossier samples/.

## 💡 Idée derrière le projet
Anonymiser → Traiter par IA → Dé-anonymiser
Cela permet d’envoyer des documents confidentiels à une IA tout en gardant le contrôle sur les données réelles.