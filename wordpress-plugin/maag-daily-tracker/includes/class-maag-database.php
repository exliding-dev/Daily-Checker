<?php
/**
 * Database handler for MAAG Daily Tracker
 * Creates and manages custom database tables.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Maag_Database {

    /**
     * Get the users table name
     */
    public static function get_users_table() {
        global $wpdb;
        return $wpdb->prefix . 'maag_users';
    }

    /**
     * Get the daily checks table name
     */
    public static function get_checks_table() {
        global $wpdb;
        return $wpdb->prefix . 'maag_daily_checks';
    }

    /**
     * Get the notes table name
     */
    public static function get_notes_table() {
        global $wpdb;
        return $wpdb->prefix . 'maag_notes';
    }

    /**
     * Create database tables on plugin activation
     */
    public function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $users_table = self::get_users_table();
        $checks_table = self::get_checks_table();

        $sql_users = "CREATE TABLE $users_table (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            uuid VARCHAR(36) NOT NULL,
            name VARCHAR(100) NOT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            device_id VARCHAR(255) DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uuid (uuid),
            KEY device_id (device_id),
            KEY ip_address (ip_address)
        ) $charset_collate;";

        $sql_checks = "CREATE TABLE $checks_table (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            uuid VARCHAR(36) NOT NULL,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            risk_level ENUM('low','medium','high') NOT NULL DEFAULT 'low',
            total_score INT(11) NOT NULL DEFAULT 0,
            max_score INT(11) NOT NULL DEFAULT 0,
            score_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
            triggers TEXT DEFAULT NULL,
            answers LONGTEXT DEFAULT NULL,
            checked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uuid (uuid),
            KEY user_id (user_id),
            KEY risk_level (risk_level),
            KEY checked_at (checked_at),
            CONSTRAINT fk_maag_check_user FOREIGN KEY (user_id) REFERENCES $users_table(id) ON DELETE CASCADE
        ) $charset_collate;";

        $notes_table = self::get_notes_table();

        $sql_notes = "CREATE TABLE $notes_table (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            uuid VARCHAR(36) NOT NULL,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            title VARCHAR(255) NOT NULL DEFAULT '',
            content LONGTEXT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uuid (uuid),
            KEY user_id (user_id),
            CONSTRAINT fk_maag_note_user FOREIGN KEY (user_id) REFERENCES $users_table(id) ON DELETE CASCADE
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql_users);
        dbDelta($sql_checks);
        dbDelta($sql_notes);
    }

    /**
     * Drop tables (used on uninstall)
     */
    public function drop_tables() {
        global $wpdb;
        $notes_table = self::get_notes_table();
        $checks_table = self::get_checks_table();
        $users_table = self::get_users_table();

        $wpdb->query("DROP TABLE IF EXISTS $notes_table");
        $wpdb->query("DROP TABLE IF EXISTS $checks_table");
        $wpdb->query("DROP TABLE IF EXISTS $users_table");
    }
}
