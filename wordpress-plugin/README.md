# MAAG Daily Tracker - WordPress Plugin

REST API backend plugin for the MAAG Daily Tracker frontend app.

## Installation

1. Copy the `maag-daily-tracker` folder to your WordPress `wp-content/plugins/` directory
2. Activate the plugin from the WordPress admin panel (Plugins → Activate)
3. The database tables are created automatically on activation

## Database Tables

The plugin creates three tables automatically:

- `wp_maag_users` — Stores app users (name, UUID, device ID)
- `wp_maag_daily_checks` — Stores daily check submissions (scores, risk levels, triggers, answers)
- `wp_maag_notes` — Stores user notes (title, content, timestamps)

## REST API Endpoints

Base URL: `https://your-site.com/wp-json/maag-tracker/v1`

### Public Endpoints (no auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/users/register` | Register a new user |
| `GET` | `/users/{uuid}` | Get user profile |
| `POST` | `/daily-checks` | Submit a daily check |
| `GET` | `/daily-checks/{user_uuid}` | Get user's check history |
| `DELETE` | `/daily-checks/{uuid}/delete` | Delete a check entry |
| `POST` | `/notes` | Create a new note |
| `GET` | `/notes/{user_uuid}` | Get user's notes |
| `PUT` | `/notes/{uuid}` | Update a note |
| `DELETE` | `/notes/{uuid}/delete` | Delete a note |

### Admin Endpoints (requires WordPress admin auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/users` | List all users (paginated) |
| `DELETE` | `/admin/users/{id}` | Delete a user and all data |
| `GET` | `/admin/daily-checks` | List all checks (filterable) |
| `GET` | `/admin/stats` | Dashboard statistics |

## API Usage Examples

### Register User

```bash
POST /wp-json/maag-tracker/v1/users/register
Content-Type: application/json

{
  "name": "John",
  "device_id": "abc-123-device-id"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John",
    "device_id": "abc-123-device-id"
  }
}
```

### Submit Daily Check

```bash
POST /wp-json/maag-tracker/v1/daily-checks
Content-Type: application/json

{
  "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
  "risk_level": "medium",
  "total_score": 8,
  "max_score": 30,
  "triggers": ["Telat Makan", "Konsumsi Kopi", "Stres atau Banyak Pikiran"],
  "answers": {
    "late-eating": "once",
    "coffee": "two-more",
    "stress": "sometimes"
  }
}
```

### Get History

```bash
GET /wp-json/maag-tracker/v1/daily-checks/550e8400-e29b-41d4-a716-446655440000?page=1&per_page=20
```

## Frontend Integration

Update the API base URL in your frontend `.env` file:

```env
PUBLIC_API_URL=https://your-wordpress-site.com/wp-json/maag-tracker/v1
```

The frontend API client is located at `src/lib/api.ts`.

## WordPress Admin Dashboard

After activation, a new "MAAG Tracker" menu appears in the WordPress admin sidebar with:

- **Dashboard** — Overview stats, risk distribution, recent checks
- **Users** — User management with search and delete functionality
- **Daily Checks** — All submissions with risk level filtering

## CORS Configuration

If your frontend is on a different domain, add this to your WordPress theme's `functions.php` or use a CORS plugin:

```php
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        return $value;
    });
});
```

## Uninstall

When the plugin is deleted (not just deactivated), all database tables and options are removed automatically.
