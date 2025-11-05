#!/bin/bash

# Sales Machine - Script de Configuration Supabase
# Ce script vous guide pour configurer votre projet Supabase

set -e

echo "🚀 Configuration Supabase pour Sales Machine"
echo "=============================================="
echo ""

PROJECT_REF="sizslvtrbuldfzaoygbs"
PROJECT_URL="https://${PROJECT_REF}.supabase.co"

echo "📋 Étapes à suivre:"
echo ""
echo "1. Ouvrez votre navigateur à l'adresse:"
echo "   https://supabase.com/dashboard/project/${PROJECT_REF}/settings/api"
echo ""
echo "2. Copiez la clé 'service_role' (secret)"
echo ""
echo "3. Collez la clé ci-dessous (elle commence par 'eyJhbGc...')"
echo ""

# Lire la service role key
read -p "SERVICE_ROLE_KEY: " SERVICE_ROLE_KEY

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "❌ Erreur: Aucune clé fournie"
    exit 1
fi

# Mettre à jour le fichier .env
ENV_FILE="apps/api/.env"

echo ""
echo "📝 Mise à jour de ${ENV_FILE}..."

# Backup du fichier original
cp "${ENV_FILE}" "${ENV_FILE}.backup"

# Remplacer la ligne SERVICE_ROLE_KEY
sed -i '' "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}|g" "${ENV_FILE}"

echo "✅ Fichier .env mis à jour!"
echo ""

echo "🗄️  Application des migrations Supabase..."
echo ""
echo "Pour appliquer les migrations, suivez ces étapes:"
echo ""
echo "1. Ouvrez le SQL Editor:"
echo "   ${PROJECT_URL}/sql/new"
echo ""
echo "2. Exécutez les 3 migrations dans l'ordre:"
echo ""

MIGRATIONS=(
    "supabase/migrations/20251006000001_initial_schema.sql"
    "supabase/migrations/20251006000002_rls_policies.sql"
    "supabase/migrations/20251006000003_seed_data.sql"
)

for i in "${!MIGRATIONS[@]}"; do
    migration="${MIGRATIONS[$i]}"
    num=$((i + 1))
    echo "   Migration ${num}:"
    echo "   - Ouvrez: ${migration}"
    echo "   - Copiez le contenu"
    echo "   - Collez dans le SQL Editor"
    echo "   - Cliquez sur 'Run'"
    echo ""
done

echo "3. Vérifiez que les tables sont créées:"
echo "   ${PROJECT_URL}/editor"
echo ""
echo "Vous devriez voir 9 tables:"
echo "   - users"
echo "   - campaigns"
echo "   - prospects"
echo "   - prospect_enrichment"
echo "   - email_templates"
echo "   - ai_conversation_log"
echo "   - meetings"
echo "   - ai_review_queue"
echo "   - audit_log"
echo ""

read -p "Appuyez sur ENTRÉE une fois les migrations appliquées..."

echo ""
echo "🧪 Test de la connexion..."
echo ""

# Tester la connexion avec la nouvelle clé
export SUPABASE_URL="${PROJECT_URL}"
export SUPABASE_SERVICE_ROLE_KEY="${SERVICE_ROLE_KEY}"

# Démarrer le serveur API en arrière-plan pour le test
cd apps/api
npm run dev &
API_PID=$!

# Attendre que le serveur démarre
sleep 5

# Tester le health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health || echo "ERROR")

if [[ "$HEALTH_RESPONSE" == *"ok"* ]]; then
    echo "✅ Serveur API démarré avec succès!"
    echo ""
    echo "Response: ${HEALTH_RESPONSE}"
else
    echo "⚠️  Le serveur API n'a pas pu démarrer"
    echo "Vérifiez les logs avec: npm run dev:api"
fi

# Arrêter le serveur test
kill $API_PID 2>/dev/null || true

echo ""
echo "🎉 Configuration terminée!"
echo ""
echo "Pour démarrer l'application:"
echo "  npm run dev        # Frontend + Backend"
echo "  npm run dev:api    # Backend seulement"
echo "  npm run dev:web    # Frontend seulement"
echo ""
echo "Documentation:"
echo "  - MIGRATION_GUIDE.md - Guide détaillé de migration"
echo "  - README.md - Documentation complète"
echo ""
