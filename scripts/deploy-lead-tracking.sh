#!/bin/bash

# Lead Tracking System Deployment Script
# This script deploys the complete lead tracking system to Supabase

set -e

echo "🚀 Starting Lead Tracking System Deployment..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "supabase login"
    exit 1
fi

echo "✅ Supabase CLI is ready"

# Deploy database schema
echo "📊 Deploying database schema..."
supabase db push

echo "✅ Database schema deployed"

# Deploy Edge Functions
echo "🔧 Deploying Edge Functions..."

echo "  📧 Deploying open-tracker function..."
supabase functions deploy open-tracker

echo "  📱 Deploying whatsapp-status function..."
supabase functions deploy whatsapp-status

echo "  💬 Deploying whatsapp-message function..."
supabase functions deploy whatsapp-message

echo "  📈 Deploying daily-analytics function..."
supabase functions deploy daily-analytics

echo "✅ All Edge Functions deployed"

# Get project URL
PROJECT_URL=$(supabase status | grep "API URL" | awk '{print $3}')

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure your email templates with open tracking:"
echo "   <img src=\"${PROJECT_URL}/functions/v1/open-tracker/[LEAD_ID].gif\" width=\"1\" height=\"1\" style=\"display:none;\" />"
echo ""
echo "2. Configure WhatsApp webhooks:"
echo "   Status: ${PROJECT_URL}/functions/v1/whatsapp-status"
echo "   Messages: ${PROJECT_URL}/functions/v1/whatsapp-message"
echo ""
echo "3. Schedule daily analytics:"
echo "   ${PROJECT_URL}/functions/v1/daily-analytics"
echo ""
echo "4. Test the endpoints using the examples in docs/lead-tracking-deployment.md"
echo ""
echo "📖 Full documentation: docs/lead-tracking-deployment.md"