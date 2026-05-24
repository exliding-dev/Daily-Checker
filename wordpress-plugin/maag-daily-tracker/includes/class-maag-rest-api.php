<?php
/**
 * REST API endpoints for MAAG Daily Tracker
 */

if (!defined('ABSPATH')) {
    exit;
}

class Maag_Rest_Api {

    const NAMESPACE = 'maag-tracker/v1';

    /**
     * Register all REST API routes
     */
    public function register_routes() {
        add_action('rest_api_init', [$this, 'init_routes']);
    }

    /**
     * Initialize routes
     */
    public function init_routes() {
        // User registration
        register_rest_route(self::NAMESPACE, '/users/register', [
            'methods'             => 'POST',
            'callback'            => [$this, 'register_user'],
            'permission_callback' => '__return_true',
            'args'                => [
                'name' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => function ($value) {
                        return !empty(trim($value));
                    },
                ],
                'device_id' => [
                    'required'          => false,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'ip_address' => [
                    'required'          => false,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);

        // Get user profile
        register_rest_route(self::NAMESPACE, '/users/(?P<uuid>[a-f0-9\-]+)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_user'],
            'permission_callback' => '__return_true',
            'args'                => [
                'uuid' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);

        // Submit daily check
        register_rest_route(self::NAMESPACE, '/daily-checks', [
            'methods'             => 'POST',
            'callback'            => [$this, 'submit_daily_check'],
            'permission_callback' => '__return_true',
            'args'                => [
                'user_uuid' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'risk_level' => [
                    'required'          => true,
                    'type'              => 'string',
                    'enum'              => ['low', 'medium', 'high'],
                    'validate_callback' => function ($value) {
                        return in_array($value, ['low', 'medium', 'high']);
                    },
                ],
                'total_score' => [
                    'required'          => true,
                    'type'              => 'integer',
                    'sanitize_callback' => 'absint',
                ],
                'max_score' => [
                    'required'          => true,
                    'type'              => 'integer',
                    'sanitize_callback' => 'absint',
                ],
                'triggers' => [
                    'required' => false,
                    'type'     => 'array',
                    'default'  => [],
                ],
                'answers' => [
                    'required' => false,
                    'type'     => 'object',
                    'default'  => [],
                ],
            ],
        ]);

        // Get user's daily check history
        register_rest_route(self::NAMESPACE, '/daily-checks/(?P<user_uuid>[a-f0-9\-]+)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_user_history'],
            'permission_callback' => '__return_true',
            'args'                => [
                'user_uuid' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'page' => [
                    'required' => false,
                    'type'     => 'integer',
                    'default'  => 1,
                ],
                'per_page' => [
                    'required' => false,
                    'type'     => 'integer',
                    'default'  => 20,
                ],
            ],
        ]);

        // Delete a specific daily check entry
        register_rest_route(self::NAMESPACE, '/daily-checks/(?P<uuid>[a-f0-9\-]+)/delete', [
            'methods'             => 'DELETE',
            'callback'            => [$this, 'delete_daily_check'],
            'permission_callback' => '__return_true',
            'args'                => [
                'uuid' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'user_uuid' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);

        // ─── Notes endpoints ────────────────────────────────

        // Create a new note
        register_rest_route(self::NAMESPACE, '/notes', [
            'methods'             => 'POST',
            'callback'            => [$this, 'create_note'],
            'permission_callback' => '__return_true',
            'args'                => [
                'user_uuid' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'title' => [
                    'required'          => false,
                    'type'              => 'string',
                    'default'           => '',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'content' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_textarea_field',
                ],
            ],
        ]);

        // Get user's notes
        register_rest_route(self::NAMESPACE, '/notes/(?P<user_uuid>[a-f0-9\-]+)', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_user_notes'],
            'permission_callback' => '__return_true',
            'args'                => [
                'user_uuid' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'page' => [
                    'required' => false,
                    'type'     => 'integer',
                    'default'  => 1,
                ],
                'per_page' => [
                    'required' => false,
                    'type'     => 'integer',
                    'default'  => 50,
                ],
            ],
        ]);

        // Update a note
        register_rest_route(self::NAMESPACE, '/notes/(?P<uuid>[a-f0-9\-]+)', [
            'methods'             => 'PUT',
            'callback'            => [$this, 'update_note'],
            'permission_callback' => '__return_true',
            'args'                => [
                'uuid' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'user_uuid' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'title' => [
                    'required'          => false,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'content' => [
                    'required'          => false,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_textarea_field',
                ],
            ],
        ]);

        // Delete a note
        register_rest_route(self::NAMESPACE, '/notes/(?P<uuid>[a-f0-9\-]+)/delete', [
            'methods'             => 'DELETE',
            'callback'            => [$this, 'delete_note'],
            'permission_callback' => '__return_true',
            'args'                => [
                'uuid' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
                'user_uuid' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);

        // Admin: Get all users (requires auth)
        register_rest_route(self::NAMESPACE, '/admin/users', [
            'methods'             => 'GET',
            'callback'            => [$this, 'admin_get_users'],
            'permission_callback' => [$this, 'admin_permission_check'],
            'args'                => [
                'page' => [
                    'required' => false,
                    'type'     => 'integer',
                    'default'  => 1,
                ],
                'per_page' => [
                    'required' => false,
                    'type'     => 'integer',
                    'default'  => 20,
                ],
                'search' => [
                    'required'          => false,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);

        // Admin: Delete user (requires auth)
        register_rest_route(self::NAMESPACE, '/admin/users/(?P<id>\d+)', [
            'methods'             => 'DELETE',
            'callback'            => [$this, 'admin_delete_user'],
            'permission_callback' => [$this, 'admin_permission_check'],
            'args'                => [
                'id' => [
                    'required' => true,
                    'type'     => 'integer',
                ],
            ],
        ]);

        // Admin: Get all daily checks (requires auth)
        register_rest_route(self::NAMESPACE, '/admin/daily-checks', [
            'methods'             => 'GET',
            'callback'            => [$this, 'admin_get_all_checks'],
            'permission_callback' => [$this, 'admin_permission_check'],
            'args'                => [
                'page' => [
                    'required' => false,
                    'type'     => 'integer',
                    'default'  => 1,
                ],
                'per_page' => [
                    'required' => false,
                    'type'     => 'integer',
                    'default'  => 20,
                ],
                'risk_level' => [
                    'required' => false,
                    'type'     => 'string',
                ],
                'user_id' => [
                    'required' => false,
                    'type'     => 'integer',
                ],
            ],
        ]);

        // Admin: Dashboard stats (requires auth)
        register_rest_route(self::NAMESPACE, '/admin/stats', [
            'methods'             => 'GET',
            'callback'            => [$this, 'admin_get_stats'],
            'permission_callback' => [$this, 'admin_permission_check'],
        ]);
    }

    /**
     * Admin permission check
     */
    public function admin_permission_check($request) {
        return current_user_can('manage_options');
    }

    /**
     * Register a new user
     */
    public function register_user($request) {
        global $wpdb;
        $table = Maag_Database::get_users_table();

        $name = $request->get_param('name');
        $device_id = $request->get_param('device_id');
        $ip_address = $request->get_param('ip_address');
        $uuid = wp_generate_uuid4();

        // Fallback: get IP from server if not provided by client
        if (empty($ip_address)) {
            $ip_address = $this->get_client_ip();
        }

        // Check if device already registered
        if ($device_id) {
            $existing = $wpdb->get_row(
                $wpdb->prepare("SELECT * FROM $table WHERE device_id = %s", $device_id)
            );
            if ($existing) {
                // Update IP address on re-visit
                $wpdb->update($table, ['ip_address' => $ip_address], ['id' => $existing->id], ['%s'], ['%d']);

                return new WP_REST_Response([
                    'success' => true,
                    'message' => 'User already registered',
                    'data'    => [
                        'uuid'       => $existing->uuid,
                        'name'       => $existing->name,
                        'ip_address' => $ip_address,
                        'device_id'  => $existing->device_id,
                        'created_at' => $existing->created_at,
                    ],
                ], 200);
            }
        }

        $result = $wpdb->insert($table, [
            'uuid'       => $uuid,
            'name'       => $name,
            'ip_address' => $ip_address,
            'device_id'  => $device_id,
        ], ['%s', '%s', '%s', '%s']);

        if ($result === false) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Failed to register user',
            ], 500);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => 'User registered successfully',
            'data'    => [
                'uuid'       => $uuid,
                'name'       => $name,
                'ip_address' => $ip_address,
                'device_id'  => $device_id,
            ],
        ], 201);
    }

    /**
     * Get client IP address from server headers
     */
    private function get_client_ip() {
        $ip = '';
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }
        return sanitize_text_field(trim($ip));
    }

    /**
     * Get user profile
     */
    public function get_user($request) {
        global $wpdb;
        $table = Maag_Database::get_users_table();
        $uuid = $request->get_param('uuid');

        $user = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM $table WHERE uuid = %s", $uuid)
        );

        if (!$user) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        return new WP_REST_Response([
            'success' => true,
            'data'    => [
                'uuid'       => $user->uuid,
                'name'       => $user->name,
                'ip_address' => $user->ip_address,
                'device_id'  => $user->device_id,
                'created_at' => $user->created_at,
            ],
        ], 200);
    }

    /**
     * Submit a daily check result
     */
    public function submit_daily_check($request) {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $checks_table = Maag_Database::get_checks_table();

        $user_uuid = $request->get_param('user_uuid');
        $risk_level = $request->get_param('risk_level');
        $total_score = (int) $request->get_param('total_score');
        $max_score = (int) $request->get_param('max_score');
        $triggers = $request->get_param('triggers');
        $answers = $request->get_param('answers');

        // Find user
        $user = $wpdb->get_row(
            $wpdb->prepare("SELECT id FROM $users_table WHERE uuid = %s", $user_uuid)
        );

        if (!$user) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $check_uuid = wp_generate_uuid4();
        $score_percentage = $max_score > 0 ? round(($total_score / $max_score) * 100, 2) : 0;

        $result = $wpdb->insert($checks_table, [
            'uuid'             => $check_uuid,
            'user_id'          => $user->id,
            'risk_level'       => $risk_level,
            'total_score'      => $total_score,
            'max_score'        => $max_score,
            'score_percentage' => $score_percentage,
            'triggers'         => wp_json_encode($triggers),
            'answers'          => wp_json_encode($answers),
            'checked_at'       => current_time('mysql'),
        ], ['%s', '%d', '%s', '%d', '%d', '%f', '%s', '%s', '%s']);

        if ($result === false) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Failed to save daily check',
            ], 500);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => 'Daily check saved successfully',
            'data'    => [
                'uuid'             => $check_uuid,
                'risk_level'       => $risk_level,
                'total_score'      => $total_score,
                'max_score'        => $max_score,
                'score_percentage' => $score_percentage,
                'triggers'         => $triggers,
                'checked_at'       => current_time('mysql'),
            ],
        ], 201);
    }

    /**
     * Get user's daily check history
     */
    public function get_user_history($request) {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $checks_table = Maag_Database::get_checks_table();

        $user_uuid = $request->get_param('user_uuid');
        $page = max(1, (int) $request->get_param('page'));
        $per_page = min(100, max(1, (int) $request->get_param('per_page')));
        $offset = ($page - 1) * $per_page;

        // Find user
        $user = $wpdb->get_row(
            $wpdb->prepare("SELECT id FROM $users_table WHERE uuid = %s", $user_uuid)
        );

        if (!$user) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // Get total count
        $total = (int) $wpdb->get_var(
            $wpdb->prepare("SELECT COUNT(*) FROM $checks_table WHERE user_id = %d", $user->id)
        );

        // Get paginated results
        $checks = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT uuid, risk_level, total_score, max_score, score_percentage, triggers, checked_at 
                 FROM $checks_table 
                 WHERE user_id = %d 
                 ORDER BY checked_at DESC 
                 LIMIT %d OFFSET %d",
                $user->id,
                $per_page,
                $offset
            )
        );

        // Format results
        $formatted = array_map(function ($check) {
            return [
                'uuid'             => $check->uuid,
                'risk_level'       => $check->risk_level,
                'total_score'      => (int) $check->total_score,
                'max_score'        => (int) $check->max_score,
                'score_percentage' => (float) $check->score_percentage,
                'triggers'         => json_decode($check->triggers, true) ?: [],
                'checked_at'       => $check->checked_at,
            ];
        }, $checks);

        return new WP_REST_Response([
            'success' => true,
            'data'    => $formatted,
            'meta'    => [
                'total'    => $total,
                'page'     => $page,
                'per_page' => $per_page,
                'pages'    => ceil($total / $per_page),
            ],
        ], 200);
    }

    /**
     * Delete a daily check entry
     */
    public function delete_daily_check($request) {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $checks_table = Maag_Database::get_checks_table();

        $check_uuid = $request->get_param('uuid');
        $user_uuid = $request->get_param('user_uuid');

        // Verify user
        $user = $wpdb->get_row(
            $wpdb->prepare("SELECT id FROM $users_table WHERE uuid = %s", $user_uuid)
        );

        if (!$user) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // Delete check (only if it belongs to the user)
        $deleted = $wpdb->delete($checks_table, [
            'uuid'    => $check_uuid,
            'user_id' => $user->id,
        ], ['%s', '%d']);

        if ($deleted === 0) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Daily check not found or not owned by user',
            ], 404);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => 'Daily check deleted successfully',
        ], 200);
    }

    /* ─── Notes Methods ──────────────────────────────── */

    /**
     * Create a new note
     */
    public function create_note($request) {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $notes_table = Maag_Database::get_notes_table();

        $user_uuid = $request->get_param('user_uuid');
        $title = $request->get_param('title') ?: '';
        $content = $request->get_param('content');

        // Find user
        $user = $wpdb->get_row(
            $wpdb->prepare("SELECT id FROM $users_table WHERE uuid = %s", $user_uuid)
        );

        if (!$user) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $note_uuid = wp_generate_uuid4();

        $result = $wpdb->insert($notes_table, [
            'uuid'       => $note_uuid,
            'user_id'    => $user->id,
            'title'      => $title,
            'content'    => $content,
        ], ['%s', '%d', '%s', '%s']);

        if ($result === false) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Failed to save note',
            ], 500);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => 'Note saved successfully',
            'data'    => [
                'uuid'       => $note_uuid,
                'title'      => $title,
                'content'    => $content,
                'created_at' => current_time('mysql'),
                'updated_at' => current_time('mysql'),
            ],
        ], 201);
    }

    /**
     * Get user's notes
     */
    public function get_user_notes($request) {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $notes_table = Maag_Database::get_notes_table();

        $user_uuid = $request->get_param('user_uuid');
        $page = max(1, (int) $request->get_param('page'));
        $per_page = min(100, max(1, (int) $request->get_param('per_page')));
        $offset = ($page - 1) * $per_page;

        // Find user
        $user = $wpdb->get_row(
            $wpdb->prepare("SELECT id FROM $users_table WHERE uuid = %s", $user_uuid)
        );

        if (!$user) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // Total count
        $total = (int) $wpdb->get_var(
            $wpdb->prepare("SELECT COUNT(*) FROM $notes_table WHERE user_id = %d", $user->id)
        );

        // Get paginated results
        $notes = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT uuid, title, content, created_at, updated_at
                 FROM $notes_table
                 WHERE user_id = %d
                 ORDER BY updated_at DESC
                 LIMIT %d OFFSET %d",
                $user->id,
                $per_page,
                $offset
            )
        );

        $formatted = array_map(function ($note) {
            return [
                'uuid'       => $note->uuid,
                'title'      => $note->title,
                'content'    => $note->content,
                'created_at' => $note->created_at,
                'updated_at' => $note->updated_at,
            ];
        }, $notes);

        return new WP_REST_Response([
            'success' => true,
            'data'    => $formatted,
            'meta'    => [
                'total'    => $total,
                'page'     => $page,
                'per_page' => $per_page,
                'pages'    => ceil($total / $per_page),
            ],
        ], 200);
    }

    /**
     * Update a note
     */
    public function update_note($request) {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $notes_table = Maag_Database::get_notes_table();

        $note_uuid = $request->get_param('uuid');
        $user_uuid = $request->get_param('user_uuid');
        $title = $request->get_param('title');
        $content = $request->get_param('content');

        // Verify user
        $user = $wpdb->get_row(
            $wpdb->prepare("SELECT id FROM $users_table WHERE uuid = %s", $user_uuid)
        );

        if (!$user) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // Build update data
        $update_data = [];
        $update_format = [];

        if ($title !== null) {
            $update_data['title'] = $title;
            $update_format[] = '%s';
        }
        if ($content !== null) {
            $update_data['content'] = $content;
            $update_format[] = '%s';
        }

        if (empty($update_data)) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'No data to update',
            ], 400);
        }

        $updated = $wpdb->update(
            $notes_table,
            $update_data,
            ['uuid' => $note_uuid, 'user_id' => $user->id],
            $update_format,
            ['%s', '%d']
        );

        if ($updated === false) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Failed to update note',
            ], 500);
        }

        if ($updated === 0) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Note not found or not owned by user',
            ], 404);
        }

        // Fetch updated note
        $note = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM $notes_table WHERE uuid = %s", $note_uuid)
        );

        return new WP_REST_Response([
            'success' => true,
            'message' => 'Note updated successfully',
            'data'    => [
                'uuid'       => $note->uuid,
                'title'      => $note->title,
                'content'    => $note->content,
                'created_at' => $note->created_at,
                'updated_at' => $note->updated_at,
            ],
        ], 200);
    }

    /**
     * Delete a note
     */
    public function delete_note($request) {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $notes_table = Maag_Database::get_notes_table();

        $note_uuid = $request->get_param('uuid');
        $user_uuid = $request->get_param('user_uuid');

        // Verify user
        $user = $wpdb->get_row(
            $wpdb->prepare("SELECT id FROM $users_table WHERE uuid = %s", $user_uuid)
        );

        if (!$user) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $deleted = $wpdb->delete($notes_table, [
            'uuid'    => $note_uuid,
            'user_id' => $user->id,
        ], ['%s', '%d']);

        if ($deleted === 0) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Note not found or not owned by user',
            ], 404);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => 'Note deleted successfully',
        ], 200);
    }

    /**
     * Admin: Get all users with pagination
     */
    public function admin_get_users($request) {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $checks_table = Maag_Database::get_checks_table();

        $page = max(1, (int) $request->get_param('page'));
        $per_page = min(100, max(1, (int) $request->get_param('per_page')));
        $search = $request->get_param('search');
        $offset = ($page - 1) * $per_page;

        $where = '';
        $where_args = [];

        if ($search) {
            $where = "WHERE u.name LIKE %s";
            $where_args[] = '%' . $wpdb->esc_like($search) . '%';
        }

        // Total count
        $count_query = "SELECT COUNT(*) FROM $users_table u $where";
        $total = (int) $wpdb->get_var(
            $where_args ? $wpdb->prepare($count_query, ...$where_args) : $count_query
        );

        // Get users with check count
        $query = "SELECT u.*, 
                    (SELECT COUNT(*) FROM $checks_table c WHERE c.user_id = u.id) as check_count,
                    (SELECT c2.risk_level FROM $checks_table c2 WHERE c2.user_id = u.id ORDER BY c2.checked_at DESC LIMIT 1) as last_risk_level,
                    (SELECT c3.checked_at FROM $checks_table c3 WHERE c3.user_id = u.id ORDER BY c3.checked_at DESC LIMIT 1) as last_check_at
                  FROM $users_table u 
                  $where
                  ORDER BY u.created_at DESC 
                  LIMIT %d OFFSET %d";

        $query_args = array_merge($where_args, [$per_page, $offset]);
        $users = $wpdb->get_results($wpdb->prepare($query, ...$query_args));

        $formatted = array_map(function ($user) {
            return [
                'id'              => (int) $user->id,
                'uuid'            => $user->uuid,
                'name'            => $user->name,
                'ip_address'      => $user->ip_address,
                'device_id'       => $user->device_id,
                'check_count'     => (int) $user->check_count,
                'last_risk_level' => $user->last_risk_level,
                'last_check_at'   => $user->last_check_at,
                'created_at'      => $user->created_at,
            ];
        }, $users);

        return new WP_REST_Response([
            'success' => true,
            'data'    => $formatted,
            'meta'    => [
                'total'    => $total,
                'page'     => $page,
                'per_page' => $per_page,
                'pages'    => ceil($total / $per_page),
            ],
        ], 200);
    }

    /**
     * Admin: Delete a user and all their data
     */
    public function admin_delete_user($request) {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $checks_table = Maag_Database::get_checks_table();
        $notes_table = Maag_Database::get_notes_table();

        $user_id = (int) $request->get_param('id');

        // Check user exists
        $user = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM $users_table WHERE id = %d", $user_id)
        );

        if (!$user) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        // Delete all user's notes first
        $wpdb->delete($notes_table, ['user_id' => $user_id], ['%d']);

        // Delete all user's checks
        $wpdb->delete($checks_table, ['user_id' => $user_id], ['%d']);

        // Delete user
        $deleted = $wpdb->delete($users_table, ['id' => $user_id], ['%d']);

        if ($deleted === false) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'Failed to delete user',
            ], 500);
        }

        return new WP_REST_Response([
            'success' => true,
            'message' => "User '{$user->name}' and all associated data deleted successfully",
        ], 200);
    }

    /**
     * Admin: Get all daily checks
     */
    public function admin_get_all_checks($request) {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $checks_table = Maag_Database::get_checks_table();

        $page = max(1, (int) $request->get_param('page'));
        $per_page = min(100, max(1, (int) $request->get_param('per_page')));
        $risk_level = $request->get_param('risk_level');
        $user_id = $request->get_param('user_id');
        $offset = ($page - 1) * $per_page;

        $where_clauses = [];
        $where_args = [];

        if ($risk_level && in_array($risk_level, ['low', 'medium', 'high'])) {
            $where_clauses[] = "c.risk_level = %s";
            $where_args[] = $risk_level;
        }

        if ($user_id) {
            $where_clauses[] = "c.user_id = %d";
            $where_args[] = (int) $user_id;
        }

        $where = $where_clauses ? 'WHERE ' . implode(' AND ', $where_clauses) : '';

        // Total count
        $count_query = "SELECT COUNT(*) FROM $checks_table c $where";
        $total = (int) ($where_args
            ? $wpdb->get_var($wpdb->prepare($count_query, ...$where_args))
            : $wpdb->get_var($count_query));

        // Get checks with user name
        $query = "SELECT c.*, u.name as user_name, u.uuid as user_uuid
                  FROM $checks_table c
                  LEFT JOIN $users_table u ON c.user_id = u.id
                  $where
                  ORDER BY c.checked_at DESC
                  LIMIT %d OFFSET %d";

        $query_args = array_merge($where_args, [$per_page, $offset]);
        $checks = $wpdb->get_results($wpdb->prepare($query, ...$query_args));

        $formatted = array_map(function ($check) {
            return [
                'id'               => (int) $check->id,
                'uuid'             => $check->uuid,
                'user_name'        => $check->user_name,
                'user_uuid'        => $check->user_uuid,
                'risk_level'       => $check->risk_level,
                'total_score'      => (int) $check->total_score,
                'max_score'        => (int) $check->max_score,
                'score_percentage' => (float) $check->score_percentage,
                'triggers'         => json_decode($check->triggers, true) ?: [],
                'answers'          => json_decode($check->answers, true) ?: [],
                'checked_at'       => $check->checked_at,
            ];
        }, $checks);

        return new WP_REST_Response([
            'success' => true,
            'data'    => $formatted,
            'meta'    => [
                'total'    => $total,
                'page'     => $page,
                'per_page' => $per_page,
                'pages'    => ceil($total / $per_page),
            ],
        ], 200);
    }

    /**
     * Admin: Get dashboard statistics
     */
    public function admin_get_stats($request) {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $checks_table = Maag_Database::get_checks_table();

        $total_users = (int) $wpdb->get_var("SELECT COUNT(*) FROM $users_table");
        $total_checks = (int) $wpdb->get_var("SELECT COUNT(*) FROM $checks_table");

        // Risk level distribution
        $risk_distribution = $wpdb->get_results(
            "SELECT risk_level, COUNT(*) as count FROM $checks_table GROUP BY risk_level"
        );

        $risk_stats = ['low' => 0, 'medium' => 0, 'high' => 0];
        foreach ($risk_distribution as $row) {
            $risk_stats[$row->risk_level] = (int) $row->count;
        }

        // Today's checks
        $today_checks = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $checks_table WHERE DATE(checked_at) = %s",
                current_time('Y-m-d')
            )
        );

        // This week's checks
        $week_start = date('Y-m-d', strtotime('monday this week'));
        $week_checks = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $checks_table WHERE DATE(checked_at) >= %s",
                $week_start
            )
        );

        // Average score
        $avg_score = (float) $wpdb->get_var(
            "SELECT AVG(score_percentage) FROM $checks_table"
        );

        // Recent users (last 7 days)
        $new_users_week = (int) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT COUNT(*) FROM $users_table WHERE DATE(created_at) >= %s",
                date('Y-m-d', strtotime('-7 days'))
            )
        );

        return new WP_REST_Response([
            'success' => true,
            'data'    => [
                'total_users'       => $total_users,
                'total_checks'      => $total_checks,
                'today_checks'      => $today_checks,
                'week_checks'       => $week_checks,
                'new_users_week'    => $new_users_week,
                'avg_score'         => round($avg_score, 1),
                'risk_distribution' => $risk_stats,
            ],
        ], 200);
    }
}
