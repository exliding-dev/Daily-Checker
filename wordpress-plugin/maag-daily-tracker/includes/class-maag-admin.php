<?php
/**
 * Admin dashboard page for MAAG Daily Tracker
 */

if (!defined('ABSPATH')) {
    exit;
}

class Maag_Admin {

    /**
     * Initialize admin hooks
     */
    public function init() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('wp_ajax_maag_delete_user', [$this, 'ajax_delete_user']);
        add_action('wp_ajax_maag_get_user_details', [$this, 'ajax_get_user_details']);
    }

    /**
     * Add admin menu page
     */
    public function add_admin_menu() {
        add_menu_page(
            'MAAG Daily Tracker',
            'MAAG Tracker',
            'manage_options',
            'maag-tracker',
            [$this, 'render_dashboard_page'],
            'dashicons-heart',
            30
        );

        add_submenu_page(
            'maag-tracker',
            'Dashboard',
            'Dashboard',
            'manage_options',
            'maag-tracker',
            [$this, 'render_dashboard_page']
        );

        add_submenu_page(
            'maag-tracker',
            'Users',
            'Users',
            'manage_options',
            'maag-tracker-users',
            [$this, 'render_users_page']
        );

        add_submenu_page(
            'maag-tracker',
            'Daily Checks',
            'Daily Checks',
            'manage_options',
            'maag-tracker-checks',
            [$this, 'render_checks_page']
        );
    }

    /**
     * Enqueue admin CSS and JS
     */
    public function enqueue_admin_assets($hook) {
        if (strpos($hook, 'maag-tracker') === false) {
            return;
        }

        wp_enqueue_style(
            'maag-admin-style',
            MAAG_TRACKER_PLUGIN_URL . 'assets/admin.css',
            [],
            MAAG_TRACKER_VERSION
        );

        wp_enqueue_script(
            'maag-admin-script',
            MAAG_TRACKER_PLUGIN_URL . 'assets/admin.js',
            ['jquery'],
            MAAG_TRACKER_VERSION,
            true
        );

        wp_localize_script('maag-admin-script', 'maagAdmin', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce'   => wp_create_nonce('maag_admin_nonce'),
            'restUrl' => rest_url('maag-tracker/v1/'),
        ]);
    }

    /**
     * Render dashboard page
     */
    public function render_dashboard_page() {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $checks_table = Maag_Database::get_checks_table();

        $total_users = (int) $wpdb->get_var("SELECT COUNT(*) FROM $users_table");
        $total_checks = (int) $wpdb->get_var("SELECT COUNT(*) FROM $checks_table");

        $today_checks = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $checks_table WHERE DATE(checked_at) = %s",
                current_time('Y-m-d')
            )
        );

        $risk_distribution = $wpdb->get_results(
            "SELECT risk_level, COUNT(*) as count FROM $checks_table GROUP BY risk_level"
        );
        $risk_stats = ['low' => 0, 'medium' => 0, 'high' => 0];
        foreach ($risk_distribution as $row) {
            $risk_stats[$row->risk_level] = (int) $row->count;
        }

        $avg_score = (float) $wpdb->get_var("SELECT AVG(score_percentage) FROM $checks_table");

        // Recent checks
        $recent_checks = $wpdb->get_results(
            "SELECT c.*, u.name as user_name 
             FROM $checks_table c 
             LEFT JOIN $users_table u ON c.user_id = u.id 
             ORDER BY c.checked_at DESC 
             LIMIT 10"
        );

        ?>
        <div class="wrap maag-admin">
            <h1>📊 MAAG Daily Tracker - Dashboard</h1>

            <!-- Export Buttons -->
            <div class="maag-export-bar">
                <span class="maag-export-label">📥 Download Laporan:</span>
                <a href="<?php echo esc_url(Maag_Export::get_export_url('excel', 'all')); ?>" class="button maag-btn-export maag-btn-excel">
                    📊 Export Excel (Semua Data)
                </a>
                <a href="<?php echo esc_url(Maag_Export::get_export_url('pdf', 'all')); ?>" class="button maag-btn-export maag-btn-pdf">
                    📄 Export PDF (Semua Data)
                </a>
                <a href="<?php echo esc_url(Maag_Export::get_export_url('excel', 'users')); ?>" class="button maag-btn-export maag-btn-excel">
                    👥 Export Excel (Users)
                </a>
                <a href="<?php echo esc_url(Maag_Export::get_export_url('pdf', 'users')); ?>" class="button maag-btn-export maag-btn-pdf">
                    👥 Export PDF (Users)
                </a>
            </div>

            <div class="maag-stats-grid">
                <div class="maag-stat-card">
                    <div class="maag-stat-icon">👥</div>
                    <div class="maag-stat-content">
                        <span class="maag-stat-number"><?php echo esc_html($total_users); ?></span>
                        <span class="maag-stat-label">Total Users</span>
                    </div>
                </div>
                <div class="maag-stat-card">
                    <div class="maag-stat-icon">📋</div>
                    <div class="maag-stat-content">
                        <span class="maag-stat-number"><?php echo esc_html($total_checks); ?></span>
                        <span class="maag-stat-label">Total Checks</span>
                    </div>
                </div>
                <div class="maag-stat-card">
                    <div class="maag-stat-icon">📅</div>
                    <div class="maag-stat-content">
                        <span class="maag-stat-number"><?php echo esc_html($today_checks); ?></span>
                        <span class="maag-stat-label">Today's Checks</span>
                    </div>
                </div>
                <div class="maag-stat-card">
                    <div class="maag-stat-icon">📈</div>
                    <div class="maag-stat-content">
                        <span class="maag-stat-number"><?php echo esc_html(round($avg_score, 1)); ?>%</span>
                        <span class="maag-stat-label">Avg Risk Score</span>
                    </div>
                </div>
            </div>

            <div class="maag-dashboard-row">
                <div class="maag-card">
                    <h2>Risk Level Distribution</h2>
                    <div class="maag-risk-bars">
                        <div class="maag-risk-bar">
                            <span class="maag-risk-label maag-risk-low">🟢 Low</span>
                            <div class="maag-bar-container">
                                <div class="maag-bar maag-bar-low" style="width: <?php echo $total_checks > 0 ? ($risk_stats['low'] / $total_checks * 100) : 0; ?>%"></div>
                            </div>
                            <span class="maag-risk-count"><?php echo esc_html($risk_stats['low']); ?></span>
                        </div>
                        <div class="maag-risk-bar">
                            <span class="maag-risk-label maag-risk-medium">🟡 Medium</span>
                            <div class="maag-bar-container">
                                <div class="maag-bar maag-bar-medium" style="width: <?php echo $total_checks > 0 ? ($risk_stats['medium'] / $total_checks * 100) : 0; ?>%"></div>
                            </div>
                            <span class="maag-risk-count"><?php echo esc_html($risk_stats['medium']); ?></span>
                        </div>
                        <div class="maag-risk-bar">
                            <span class="maag-risk-label maag-risk-high">🔴 High</span>
                            <div class="maag-bar-container">
                                <div class="maag-bar maag-bar-high" style="width: <?php echo $total_checks > 0 ? ($risk_stats['high'] / $total_checks * 100) : 0; ?>%"></div>
                            </div>
                            <span class="maag-risk-count"><?php echo esc_html($risk_stats['high']); ?></span>
                        </div>
                    </div>
                </div>

                <div class="maag-card">
                    <h2>API Endpoints</h2>
                    <table class="maag-endpoints-table">
                        <thead>
                            <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                            <tr><td><code>POST</code></td><td><code>/wp-json/maag-tracker/v1/users/register</code></td><td>Register user</td></tr>
                            <tr><td><code>GET</code></td><td><code>/wp-json/maag-tracker/v1/users/{uuid}</code></td><td>Get user</td></tr>
                            <tr><td><code>POST</code></td><td><code>/wp-json/maag-tracker/v1/daily-checks</code></td><td>Submit check</td></tr>
                            <tr><td><code>GET</code></td><td><code>/wp-json/maag-tracker/v1/daily-checks/{user_uuid}</code></td><td>Get history</td></tr>
                            <tr><td><code>DELETE</code></td><td><code>/wp-json/maag-tracker/v1/daily-checks/{uuid}/delete</code></td><td>Delete check</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- CORS Configuration Info -->
            <div class="maag-card">
                <h2>🔗 CORS Configuration</h2>
                <div class="maag-cors-info">
                    <p style="margin-bottom:12px;font-size:13px;color:#374151;">Allowed origins yang dapat mengakses REST API:</p>
                    <table class="maag-endpoints-table">
                        <thead>
                            <tr><th>Origin</th><th>Status</th><th>Keterangan</th></tr>
                        </thead>
                        <tbody>
                            <?php
                            $cors_origins = [
                                ['url' => 'https://dallytracker.medinova.info', 'label' => 'Production Frontend'],
                                ['url' => 'http://dallytracker.medinova.info', 'label' => 'Production Frontend (HTTP)'],
                                ['url' => 'https://dally-checker.medinova.info', 'label' => 'Daily Checker Frontend'],
                                ['url' => 'http://dally-checker.medinova.info', 'label' => 'Daily Checker Frontend (HTTP)'],
                                ['url' => 'http://localhost:4321', 'label' => 'Local Development'],
                                ['url' => 'http://127.0.0.1:4321', 'label' => 'Local Development'],
                            ];
                            foreach ($cors_origins as $origin) :
                            ?>
                            <tr>
                                <td><code><?php echo esc_html($origin['url']); ?></code></td>
                                <td><span class="maag-badge maag-badge-low">✓ Allowed</span></td>
                                <td><?php echo esc_html($origin['label']); ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                    <div style="margin-top:12px;padding:10px 14px;background:#f0f7ee;border:1px solid #d4e8d0;border-radius:8px;">
                        <p style="font-size:12px;color:#3d6b35;margin:0;">
                            <strong>ℹ️ Info:</strong> CORS dikelola oleh plugin <strong>MAAG CORS</strong> dan built-in di MAAG Daily Tracker. 
                            Pastikan kedua plugin aktif. Headers yang dikirim: <code>Access-Control-Allow-Origin</code>, 
                            <code>Access-Control-Allow-Methods</code>, <code>Access-Control-Allow-Headers</code>, 
                            <code>Access-Control-Allow-Credentials</code>.
                        </p>
                    </div>
                </div>
            </div>

            <div class="maag-card">
                <h2>Recent Daily Checks</h2>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Risk Level</th>
                            <th>Score</th>
                            <th>Triggers</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($recent_checks)) : ?>
                            <tr><td colspan="5" style="text-align:center;padding:20px;">No daily checks yet.</td></tr>
                        <?php else : ?>
                            <?php foreach ($recent_checks as $check) : ?>
                                <tr>
                                    <td><strong><?php echo esc_html($check->user_name ?: 'Unknown'); ?></strong></td>
                                    <td>
                                        <span class="maag-badge maag-badge-<?php echo esc_attr($check->risk_level); ?>">
                                            <?php echo esc_html(ucfirst($check->risk_level)); ?>
                                        </span>
                                    </td>
                                    <td><?php echo esc_html($check->total_score . '/' . $check->max_score); ?> (<?php echo esc_html(round($check->score_percentage, 1)); ?>%)</td>
                                    <td>
                                        <?php
                                        $triggers = json_decode($check->triggers, true) ?: [];
                                        echo esc_html(implode(', ', $triggers));
                                        ?>
                                    </td>
                                    <td><?php echo esc_html(date('d M Y H:i', strtotime($check->checked_at))); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
        <?php
    }

    /**
     * Render users management page
     */
    public function render_users_page() {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $checks_table = Maag_Database::get_checks_table();

        $page = isset($_GET['paged']) ? max(1, (int) $_GET['paged']) : 1;
        $per_page = 20;
        $offset = ($page - 1) * $per_page;
        $search = isset($_GET['s']) ? sanitize_text_field($_GET['s']) : '';

        $where = '';
        $where_args = [];
        if ($search) {
            $where = "WHERE u.name LIKE %s";
            $where_args[] = '%' . $wpdb->esc_like($search) . '%';
        }

        $count_query = "SELECT COUNT(*) FROM $users_table u $where";
        $total = (int) ($where_args
            ? $wpdb->get_var($wpdb->prepare($count_query, ...$where_args))
            : $wpdb->get_var($count_query));

        $query = "SELECT u.*, 
                    (SELECT COUNT(*) FROM $checks_table c WHERE c.user_id = u.id) as check_count,
                    (SELECT c2.checked_at FROM $checks_table c2 WHERE c2.user_id = u.id ORDER BY c2.checked_at DESC LIMIT 1) as last_check_at
                  FROM $users_table u 
                  $where
                  ORDER BY u.created_at DESC 
                  LIMIT %d OFFSET %d";

        $query_args = array_merge($where_args, [$per_page, $offset]);
        $users = $wpdb->get_results($wpdb->prepare($query, ...$query_args));

        $total_pages = ceil($total / $per_page);

        ?>
        <div class="wrap maag-admin">
            <h1>👥 MAAG Tracker - Users Management</h1>

            <div class="maag-toolbar">
                <form method="get" class="maag-search-form">
                    <input type="hidden" name="page" value="maag-tracker-users">
                    <input type="search" name="s" value="<?php echo esc_attr($search); ?>" placeholder="Search users..." class="maag-search-input">
                    <button type="submit" class="button">Search</button>
                </form>
                <span class="maag-total-count"><?php echo esc_html($total); ?> users total</span>
            </div>

            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th style="width:40px">ID</th>
                        <th>Name</th>
                        <th>IP Address</th>
                        <th>UUID</th>
                        <th>Checks</th>
                        <th>Last Check</th>
                        <th>Registered</th>
                        <th style="width:100px">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($users)) : ?>
                        <tr><td colspan="8" style="text-align:center;padding:20px;">No users found.</td></tr>
                    <?php else : ?>
                        <?php foreach ($users as $user) : ?>
                            <tr id="user-row-<?php echo esc_attr($user->id); ?>">
                                <td><?php echo esc_html($user->id); ?></td>
                                <td><strong><?php echo esc_html($user->name); ?></strong></td>
                                <td><code style="font-size:12px"><?php echo esc_html($user->ip_address ?: '-'); ?></code></td>
                                <td><code style="font-size:11px"><?php echo esc_html($user->uuid); ?></code></td>
                                <td><?php echo esc_html($user->check_count); ?></td>
                                <td><?php echo $user->last_check_at ? esc_html(date('d M Y H:i', strtotime($user->last_check_at))) : '-'; ?></td>
                                <td><?php echo esc_html(date('d M Y', strtotime($user->created_at))); ?></td>
                                <td>
                                    <button class="button button-small maag-btn-delete" 
                                            data-user-id="<?php echo esc_attr($user->id); ?>"
                                            data-user-name="<?php echo esc_attr($user->name); ?>">
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>

            <?php if ($total_pages > 1) : ?>
                <div class="tablenav bottom">
                    <div class="tablenav-pages">
                        <?php
                        echo paginate_links([
                            'base'    => add_query_arg('paged', '%#%'),
                            'format'  => '',
                            'current' => $page,
                            'total'   => $total_pages,
                        ]);
                        ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * Render daily checks page
     */
    public function render_checks_page() {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $checks_table = Maag_Database::get_checks_table();

        $page = isset($_GET['paged']) ? max(1, (int) $_GET['paged']) : 1;
        $per_page = 20;
        $offset = ($page - 1) * $per_page;
        $filter_risk = isset($_GET['risk_level']) ? sanitize_text_field($_GET['risk_level']) : '';

        $where = '';
        $where_args = [];
        if ($filter_risk && in_array($filter_risk, ['low', 'medium', 'high'])) {
            $where = "WHERE c.risk_level = %s";
            $where_args[] = $filter_risk;
        }

        $count_query = "SELECT COUNT(*) FROM $checks_table c $where";
        $total = (int) ($where_args
            ? $wpdb->get_var($wpdb->prepare($count_query, ...$where_args))
            : $wpdb->get_var($count_query));

        $query = "SELECT c.*, u.name as user_name 
                  FROM $checks_table c 
                  LEFT JOIN $users_table u ON c.user_id = u.id 
                  $where
                  ORDER BY c.checked_at DESC 
                  LIMIT %d OFFSET %d";

        $query_args = array_merge($where_args, [$per_page, $offset]);
        $checks = $wpdb->get_results($wpdb->prepare($query, ...$query_args));

        $total_pages = ceil($total / $per_page);

        ?>
        <div class="wrap maag-admin">
            <h1>📋 MAAG Tracker - Daily Checks</h1>

            <div class="maag-toolbar">
                <form method="get" class="maag-filter-form">
                    <input type="hidden" name="page" value="maag-tracker-checks">
                    <select name="risk_level" class="maag-filter-select">
                        <option value="">All Risk Levels</option>
                        <option value="low" <?php selected($filter_risk, 'low'); ?>>🟢 Low</option>
                        <option value="medium" <?php selected($filter_risk, 'medium'); ?>>🟡 Medium</option>
                        <option value="high" <?php selected($filter_risk, 'high'); ?>>🔴 High</option>
                    </select>
                    <button type="submit" class="button">Filter</button>
                </form>
                <span class="maag-total-count"><?php echo esc_html($total); ?> checks total</span>
            </div>

            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th style="width:40px">ID</th>
                        <th>User</th>
                        <th>Risk Level</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Triggers</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($checks)) : ?>
                        <tr><td colspan="7" style="text-align:center;padding:20px;">No daily checks found.</td></tr>
                    <?php else : ?>
                        <?php foreach ($checks as $check) : ?>
                            <tr>
                                <td><?php echo esc_html($check->id); ?></td>
                                <td><strong><?php echo esc_html($check->user_name ?: 'Unknown'); ?></strong></td>
                                <td>
                                    <span class="maag-badge maag-badge-<?php echo esc_attr($check->risk_level); ?>">
                                        <?php echo esc_html(ucfirst($check->risk_level)); ?>
                                    </span>
                                </td>
                                <td><?php echo esc_html($check->total_score . '/' . $check->max_score); ?></td>
                                <td><?php echo esc_html(round($check->score_percentage, 1)); ?>%</td>
                                <td>
                                    <?php
                                    $triggers = json_decode($check->triggers, true) ?: [];
                                    if (empty($triggers)) {
                                        echo '<em style="color:#999">None</em>';
                                    } else {
                                        foreach ($triggers as $trigger) {
                                            echo '<span class="maag-trigger-tag">' . esc_html($trigger) . '</span> ';
                                        }
                                    }
                                    ?>
                                </td>
                                <td><?php echo esc_html(date('d M Y H:i', strtotime($check->checked_at))); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>

            <?php if ($total_pages > 1) : ?>
                <div class="tablenav bottom">
                    <div class="tablenav-pages">
                        <?php
                        echo paginate_links([
                            'base'    => add_query_arg('paged', '%#%'),
                            'format'  => '',
                            'current' => $page,
                            'total'   => $total_pages,
                        ]);
                        ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * AJAX: Delete user
     */
    public function ajax_delete_user() {
        check_ajax_referer('maag_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }

        $user_id = isset($_POST['user_id']) ? (int) $_POST['user_id'] : 0;

        if (!$user_id) {
            wp_send_json_error(['message' => 'Invalid user ID']);
        }

        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $checks_table = Maag_Database::get_checks_table();

        // Delete checks first
        $wpdb->delete($checks_table, ['user_id' => $user_id], ['%d']);

        // Delete user
        $deleted = $wpdb->delete($users_table, ['id' => $user_id], ['%d']);

        if ($deleted) {
            wp_send_json_success(['message' => 'User deleted successfully']);
        } else {
            wp_send_json_error(['message' => 'Failed to delete user']);
        }
    }

    /**
     * AJAX: Get user details
     */
    public function ajax_get_user_details() {
        check_ajax_referer('maag_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }

        $user_id = isset($_GET['user_id']) ? (int) $_GET['user_id'] : 0;

        if (!$user_id) {
            wp_send_json_error(['message' => 'Invalid user ID']);
        }

        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $checks_table = Maag_Database::get_checks_table();

        $user = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM $users_table WHERE id = %d", $user_id)
        );

        if (!$user) {
            wp_send_json_error(['message' => 'User not found']);
        }

        $checks = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM $checks_table WHERE user_id = %d ORDER BY checked_at DESC LIMIT 10",
                $user_id
            )
        );

        wp_send_json_success([
            'user'   => $user,
            'checks' => $checks,
        ]);
    }
}
