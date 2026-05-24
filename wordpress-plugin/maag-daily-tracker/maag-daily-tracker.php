<?php
/**
 * Plugin Name: MAAG Daily Tracker API
 * Plugin URI: https://github.com/wahyupuji/maag-daily-tracker
 * Description: REST API backend for MAAG Daily Tracker app. Manages users, daily check submissions, and history.
 * Version: 1.1.0
 * Author: MAAG Team
 * License: GPL v2 or later
 * Text Domain: maag-daily-tracker
 */

if (!defined('ABSPATH')) {
    exit;
}

define('MAAG_TRACKER_VERSION', '1.1.0');
define('MAAG_TRACKER_DB_VERSION', '1.1.0');
define('MAAG_TRACKER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('MAAG_TRACKER_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include files
require_once MAAG_TRACKER_PLUGIN_DIR . 'includes/class-maag-database.php';
require_once MAAG_TRACKER_PLUGIN_DIR . 'includes/class-maag-rest-api.php';
require_once MAAG_TRACKER_PLUGIN_DIR . 'includes/class-maag-admin.php';
require_once MAAG_TRACKER_PLUGIN_DIR . 'includes/class-maag-export.php';

/**
 * Activation hook - create database tables
 */
function maag_tracker_activate() {
    $database = new Maag_Database();
    $database->create_tables();
    update_option('maag_tracker_db_version', MAAG_TRACKER_DB_VERSION);
}
register_activation_hook(__FILE__, 'maag_tracker_activate');

/**
 * Deactivation hook
 */
function maag_tracker_deactivate() {
    // Clean up scheduled events if any
}
register_deactivation_hook(__FILE__, 'maag_tracker_deactivate');

/**
 * Initialize the plugin
 */
function maag_tracker_init() {
    // Initialize REST API
    $api = new Maag_Rest_Api();
    $api->register_routes();

    // Initialize Admin
    if (is_admin()) {
        $admin = new Maag_Admin();
        $admin->init();

        $export = new Maag_Export();
        $export->init();
    }
}
add_action('init', 'maag_tracker_init');

/**
 * Handle CORS for frontend requests
 */
function maag_tracker_get_allowed_origins() {
    return [
        'https://dallytracker.medinova.info',
        'http://dallytracker.medinova.info',
        'https://dally-checker.medinova.info',
        'http://dally-checker.medinova.info',
        'http://localhost:4321',
        'http://127.0.0.1:4321',
    ];
}

function maag_tracker_cors_headers() {
    $allowed_origins = maag_tracker_get_allowed_origins();
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-WP-Nonce");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Max-Age: 86400");
    }
}

// Handle preflight OPTIONS requests early
add_action('init', function () {
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        maag_tracker_cors_headers();
        status_header(200);
        exit;
    }
}, 1);

// Add CORS headers to REST API responses
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        maag_tracker_cors_headers();
        return $value;
    });
}, 15);

// Add CORS headers for non-REST requests
add_action('send_headers', 'maag_tracker_cors_headers');

/**
 * Check for database updates
 */
function maag_tracker_check_db_update() {
    $installed_version = get_option('maag_tracker_db_version');
    if ($installed_version !== MAAG_TRACKER_DB_VERSION) {
        $database = new Maag_Database();
        $database->create_tables();
        update_option('maag_tracker_db_version', MAAG_TRACKER_DB_VERSION);
    }
}
add_action('plugins_loaded', 'maag_tracker_check_db_update');
