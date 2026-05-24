<?php
/**
 * Uninstall handler for MAAG Daily Tracker
 * Removes all plugin data when the plugin is deleted.
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

global $wpdb;

// Drop custom tables
$checks_table = $wpdb->prefix . 'maag_daily_checks';
$users_table = $wpdb->prefix . 'maag_users';

$wpdb->query("DROP TABLE IF EXISTS $checks_table");
$wpdb->query("DROP TABLE IF EXISTS $users_table");

// Remove options
delete_option('maag_tracker_db_version');
