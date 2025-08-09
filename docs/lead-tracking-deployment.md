# Lead Tracking System Deployment Guide

## Overview
This system tracks email opens, WhatsApp message delivery status, and incoming replies for lead management.

## Components
1. **Database Tables**: `leads`, `lead_metrics_summary`, `supplier_phone_mapping`
2. **Edge Functions**: 
   - `open-tracker` - Email open tracking
   - `whatsapp-status` - WhatsApp delivery status
   - `whatsapp-message` - Incoming WhatsApp messages
   - `daily-analytics` - Daily metrics calculation

## Deployment Steps

### 1. Deploy Database Schema
```bash
# Run the migration in your Supabase project
supabase db push
```

### 2. Deploy Edge Functions
```bash
# Deploy all edge functions
supabase functions deploy open-tracker
supabase functions deploy whatsapp-status
supabase functions deploy whatsapp-message
supabase functions deploy daily-analytics
```

### 3. Set Environment Variables
Ensure these environment variables are set in your Supabase project:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configure Webhooks

#### Email Open Tracking
Add this to your email templates:
```html
<img src="https://your-project.supabase.co/functions/v1/open-tracker/[LEAD_ID].gif" width="1" height="1" style="display:none;" />
```

#### WhatsApp Status Webhook
Configure your WhatsApp provider to send status updates to:
```
https://your-project.supabase.co/functions/v1/whatsapp-status
```

#### WhatsApp Message Webhook
Configure your WhatsApp provider to send incoming messages to:
```
https://your-project.supabase.co/functions/v1/whatsapp-message
```

### 5. Schedule Daily Analytics
Set up a cron job or use Supabase's scheduled functions to call:
```
https://your-project.supabase.co/functions/v1/daily-analytics
```

## Testing

### Test Email Open Tracking
```bash
curl "https://your-project.supabase.co/functions/v1/open-tracker/test-lead-123.gif"
```

### Test WhatsApp Status
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/whatsapp-status" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_id": "test-lead-123",
    "message_id": "msg-456",
    "status": "delivered",
    "timestamp": "2024-01-01T12:00:00Z"
  }'
```

### Test WhatsApp Message
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/whatsapp-message" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+1234567890",
    "text": "Hello, I received your message",
    "timestamp": "2024-01-01T12:00:00Z"
  }'
```

### Test Daily Analytics
```bash
curl "https://your-project.supabase.co/functions/v1/daily-analytics?date=2024-01-01"
```

## Usage Examples

### Creating a Lead
```sql
INSERT INTO leads (lead_id, supplier_id) 
VALUES ('lead-123', 'supplier-456');
```

### Adding Phone Mapping
```sql
INSERT INTO supplier_phone_mapping (phone_number, supplier_id) 
VALUES ('+1234567890', 'supplier-456');
```

### Viewing Metrics
```sql
SELECT * FROM lead_metrics_summary 
ORDER BY date DESC 
LIMIT 7;
```

## Monitoring
- Check Supabase Edge Function logs for errors
- Monitor the `lead_metrics_summary` table for daily analytics
- Set up alerts for failed webhook calls

## Security Notes
- All endpoints use CORS headers for web access
- Database uses Row Level Security (RLS)
- Service role key is used for database operations
- Phone numbers are mapped to supplier IDs for privacy