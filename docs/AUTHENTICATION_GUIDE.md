# 🔐 Guide d'Authentification - Sales Machine

Guide complet pour se connecter à Sales Machine.

---

## 🚀 Méthodes de Connexion

Sales Machine supporte **3 méthodes d'authentification** :

1. **Email + Mot de passe** (connexion classique)
2. **Google OAuth** (connexion via Google)
3. **LinkedIn OAuth** (connexion via LinkedIn)

---

## 📧 Connexion par Email + Mot de Passe

### Créer un Compte

1. Allez sur la page de login : `http://localhost:5173/login`
2. Cliquez sur **"Créer un compte"** (ou allez directement sur `/signup`)
3. Remplissez le formulaire :
   - Email
   - Mot de passe (minimum 8 caractères)
4. Confirmez votre email (si la confirmation est activée dans Supabase)

### Se Connecter

1. Allez sur : `http://localhost:5173/login`
2. Entrez votre email et mot de passe
3. Cliquez sur **"Se connecter"**
4. Vous serez redirigé vers le dashboard

**⚠️ Note:** Pour l'instant, la page de signup n'est pas encore implémentée. Vous pouvez créer un compte directement via Supabase.

---

## 🔵 Connexion via Google OAuth

### Prérequis

1. **Configurer Google OAuth dans Supabase :**
   - Aller sur : https://supabase.com/dashboard/project/[PROJECT_ID]/auth/providers
   - Activer Google
   - Ajouter les credentials OAuth :
     - **Client ID** : Depuis Google Cloud Console
     - **Client Secret** : Depuis Google Cloud Console
   - Callback URL : `https://[PROJECT_ID].supabase.co/auth/v1/callback`

2. **Configurer Google Cloud Console :**
   - Aller sur : https://console.cloud.google.com
   - Créer un projet (ou utiliser un existant)
   - Activer l'API "Google+ API"
   - Créer des credentials OAuth 2.0 :
     - Type : Application Web
     - Authorized redirect URIs : `https://[PROJECT_ID].supabase.co/auth/v1/callback`
   - Copier le **Client ID** et **Client Secret**

### Se Connecter avec Google

1. Allez sur : `http://localhost:5173/login`
2. Cliquez sur le bouton **"Google"**
3. Sélectionnez votre compte Google
4. Autorisez l'application
5. Vous serez redirigé vers le dashboard

---

## 🔷 Connexion via LinkedIn OAuth

### Prérequis

1. **Configurer LinkedIn OAuth dans Supabase :**
   - Aller sur : https://supabase.com/dashboard/project/[PROJECT_ID]/auth/providers
   - Activer LinkedIn
   - Ajouter les credentials OAuth :
     - **Client ID** : Depuis LinkedIn Developer Portal
     - **Client Secret** : Depuis LinkedIn Developer Portal
   - Callback URL : `https://[PROJECT_ID].supabase.co/auth/v1/callback`

2. **Configurer LinkedIn Developer Portal :**
   - Aller sur : https://www.linkedin.com/developers/apps
   - Créer une nouvelle application LinkedIn
   - Activer "Sign In with LinkedIn"
   - Ajouter la redirect URL : `https://[PROJECT_ID].supabase.co/auth/v1/callback`
   - Copier le **Client ID** et **Client Secret**

### Se Connecter avec LinkedIn

1. Allez sur : `http://localhost:5173/login`
2. Cliquez sur le bouton **"LinkedIn"**
3. Entrez vos identifiants LinkedIn
4. Autorisez l'application
5. Vous serez redirigé vers le dashboard

---

## 🛠️ Créer un Compte via Supabase (Développement)

Si la page de signup n'est pas encore disponible, vous pouvez créer un compte directement via Supabase :

### Méthode 1 : Via Supabase Dashboard

1. Aller sur : https://supabase.com/dashboard/project/[PROJECT_ID]/auth/users
2. Cliquer sur **"Add user"** → **"Create new user"**
3. Entrer :
   - Email
   - Mot de passe (ou générer un mot de passe temporaire)
4. L'utilisateur recevra un email pour définir son mot de passe

### Méthode 2 : Via SQL (Admin)

```sql
-- Créer un utilisateur directement dans auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'user@example.com',
  crypt('your-password-here', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  '',
  ''
);
```

### Méthode 3 : Via API Supabase

```bash
# Créer un utilisateur via l'API Supabase
curl -X POST 'https://[PROJECT_ID].supabase.co/auth/v1/admin/users' \
  -H "apikey: [SERVICE_ROLE_KEY]" \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure-password-123",
    "email_confirm": true
  }'
```

---

## 🔍 Vérifier la Session

Une fois connecté, vous pouvez vérifier votre session :

1. **Dans le frontend :** La session est automatiquement vérifiée via `useAuth()` hook
2. **Dans le backend :** Les endpoints protégés vérifient le token JWT automatiquement
3. **Via l'API :** Appeler `GET /api/users/me` pour récupérer votre profil

---

## 🚪 Déconnexion

Pour vous déconnecter :

1. Cliquez sur votre profil (dans le header du dashboard)
2. Cliquez sur **"Déconnexion"**
3. Vous serez redirigé vers la page de login

Ou programmatiquement :
```typescript
import { useAuthStore } from '@/stores/auth.store';

const logout = useAuthStore((state) => state.logout);
await logout();
```

---

## 🆘 Dépannage

### Erreur: "Invalid login credentials"
- Vérifier que l'email et le mot de passe sont corrects
- Vérifier que le compte existe dans Supabase
- Vérifier que l'email est confirmé (si la confirmation est activée)

### Erreur: "OAuth provider not configured"
- Vérifier que le provider OAuth est activé dans Supabase
- Vérifier que les credentials (Client ID/Secret) sont corrects
- Vérifier que la redirect URL est correcte

### Erreur: "Email not confirmed"
- Aller dans Supabase Dashboard → Auth → Users
- Trouver l'utilisateur et cliquer sur "Confirm email"
- Ou désactiver la confirmation d'email dans les settings Supabase (pour le développement)

### Session expirée
- Les sessions Supabase expirent après 1 heure (par défaut)
- Vous serez automatiquement redirigé vers la page de login
- Le token est automatiquement rafraîchi si vous êtes actif

---

## 📚 Documentation Complémentaire

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OAuth Configuration](https://supabase.com/docs/guides/auth/social-login)
- [Environment Variables](./ENV_SETUP_INSTRUCTIONS.md)

---

**Dernière mise à jour:** 2025-01-17

