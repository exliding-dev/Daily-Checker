<?php
/**
 * Export handler for MAAG Daily Tracker
 * Generates Excel (CSV) and PDF reports for admin download.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Maag_Export {

    /**
     * Initialize export hooks
     */
    public function init() {
        add_action('admin_init', [$this, 'handle_export_request']);
    }

    /**
     * Handle export request from admin
     */
    public function handle_export_request() {
        if (!isset($_GET['maag_export'])) {
            return;
        }

        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }

        if (!isset($_GET['_wpnonce']) || !wp_verify_nonce($_GET['_wpnonce'], 'maag_export_nonce')) {
            wp_die('Invalid nonce');
        }

        $format = sanitize_text_field($_GET['maag_export']);
        $type = isset($_GET['type']) ? sanitize_text_field($_GET['type']) : 'all';

        switch ($format) {
            case 'excel':
                $this->export_excel($type);
                break;
            case 'pdf':
                $this->export_pdf($type);
                break;
            default:
                wp_die('Invalid export format');
        }
    }

    /**
     * Get report data
     */
    private function get_report_data($type = 'all') {
        global $wpdb;
        $users_table = Maag_Database::get_users_table();
        $checks_table = Maag_Database::get_checks_table();

        if ($type === 'users') {
            return $wpdb->get_results(
                "SELECT u.id, u.name, u.ip_address, u.uuid, u.created_at,
                    (SELECT COUNT(*) FROM $checks_table c WHERE c.user_id = u.id) as total_checks,
                    (SELECT c2.risk_level FROM $checks_table c2 WHERE c2.user_id = u.id ORDER BY c2.checked_at DESC LIMIT 1) as last_risk_level,
                    (SELECT c3.checked_at FROM $checks_table c3 WHERE c3.user_id = u.id ORDER BY c3.checked_at DESC LIMIT 1) as last_check_at
                 FROM $users_table u
                 ORDER BY u.created_at DESC"
            );
        }

        // Default: all daily checks with user info
        return $wpdb->get_results(
            "SELECT c.id, u.name as user_name, u.ip_address, c.risk_level, 
                    c.total_score, c.max_score, c.score_percentage, 
                    c.triggers, c.answers, c.checked_at
             FROM $checks_table c
             LEFT JOIN $users_table u ON c.user_id = u.id
             ORDER BY c.checked_at DESC"
        );
    }

    /**
     * Export as Excel (CSV format - universally compatible)
     */
    private function export_excel($type) {
        $data = $this->get_report_data($type);
        $filename = 'maag-report-' . $type . '-' . date('Y-m-d-His') . '.csv';

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Pragma: no-cache');
        header('Expires: 0');

        $output = fopen('php://output', 'w');

        // BOM for Excel UTF-8 compatibility
        fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

        if ($type === 'users') {
            // Users report header
            fputcsv($output, [
                'ID',
                'Nama',
                'IP Address',
                'UUID',
                'Total Checks',
                'Risiko Terakhir',
                'Check Terakhir',
                'Tanggal Daftar',
            ]);

            foreach ($data as $row) {
                fputcsv($output, [
                    $row->id,
                    $row->name,
                    $row->ip_address ?: '-',
                    $row->uuid,
                    $row->total_checks,
                    $this->translate_risk_level($row->last_risk_level),
                    $row->last_check_at ? date('d/m/Y H:i', strtotime($row->last_check_at)) : '-',
                    date('d/m/Y H:i', strtotime($row->created_at)),
                ]);
            }
        } else {
            // Daily checks report header
            fputcsv($output, [
                'ID',
                'Nama User',
                'IP Address',
                'Tingkat Risiko',
                'Skor',
                'Skor Maksimal',
                'Persentase',
                'Pemicu',
                'Detail Jawaban',
                'Tanggal Check',
            ]);

            foreach ($data as $row) {
                $triggers = json_decode($row->triggers, true) ?: [];
                $answers = json_decode($row->answers, true) ?: [];
                $answers_text = $this->format_answers_text($answers);

                fputcsv($output, [
                    $row->id,
                    $row->user_name ?: 'Unknown',
                    $row->ip_address ?: '-',
                    $this->translate_risk_level($row->risk_level),
                    $row->total_score,
                    $row->max_score,
                    round($row->score_percentage, 1) . '%',
                    implode('; ', $triggers),
                    $answers_text,
                    date('d/m/Y H:i', strtotime($row->checked_at)),
                ]);
            }
        }

        fclose($output);
        exit;
    }

    /**
     * Export as PDF - opens preview in browser, user can print/save as PDF
     */
    private function export_pdf($type) {
        $data = $this->get_report_data($type);

        // Generate HTML report
        $html = $this->generate_pdf_html($data, $type);

        // Build the back URL to WP admin dashboard
        $back_url = admin_url('admin.php?page=maag-tracker');

        // Serve as HTML preview in browser with print toolbar
        header('Content-Type: text/html; charset=utf-8');

        echo $html;

        // Inject a fixed toolbar for print/download
        echo '
        <div id="maag-pdf-toolbar" style="position:fixed;top:0;left:0;right:0;background:#2d4a28;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;z-index:9999;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
            <span style="color:#fff;font-size:14px;font-weight:600;">📄 Preview Laporan MAAG Daily Tracker</span>
            <div>
                <button onclick="window.print()" style="background:#fff;color:#2d4a28;border:none;padding:8px 18px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;margin-right:8px;">🖨️ Print / Save as PDF</button>
                <a href="' . esc_url($back_url) . '" style="background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);padding:8px 18px;border-radius:6px;font-size:13px;cursor:pointer;text-decoration:none;display:inline-block;">← Kembali ke Dashboard</a>
            </div>
        </div>
        <style>
            body { margin-top: 55px !important; }
            @media print {
                #maag-pdf-toolbar { display:none !important; }
                body { margin-top: 0 !important; }
            }
        </style>';
        exit;
    }

    /**
     * Generate PDF HTML content
     */
    private function generate_pdf_html($data, $type) {
        $title = $type === 'users' ? 'Laporan Data Pengguna' : 'Laporan Daily Check Maag';
        $date = date('d F Y H:i');

        $html = '<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>' . esc_html($title) . '</title>
<style>
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #333; }
    h1 { font-size: 18px; color: #2d4a28; margin-bottom: 5px; }
    .subtitle { font-size: 12px; color: #666; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #3d7a2a; color: #fff; padding: 8px 6px; text-align: left; font-size: 10px; }
    td { padding: 6px; border-bottom: 1px solid #e0e0e0; font-size: 10px; }
    tr:nth-child(even) { background: #f9f9f9; }
    .badge { padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: bold; }
    .badge-low { background: #dcfce7; color: #166534; }
    .badge-medium { background: #fef3c7; color: #92400e; }
    .badge-high { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 20px; font-size: 9px; color: #999; text-align: center; }
    .summary { background: #f0f7ee; border: 1px solid #d4e8d0; border-radius: 8px; padding: 12px; margin-bottom: 15px; }
    .summary-item { display: inline-block; margin-right: 30px; }
    .summary-label { font-size: 10px; color: #666; }
    .summary-value { font-size: 16px; font-weight: bold; color: #2d4a28; }
</style>
</head>
<body>
<h1>' . esc_html($title) . '</h1>
<div class="subtitle">Digenerate pada: ' . esc_html($date) . ' | MAAG Daily Tracker</div>';

        // Summary section
        $total_records = count($data);
        $html .= '<div class="summary">';
        $html .= '<div class="summary-item"><div class="summary-label">Total Data</div><div class="summary-value">' . $total_records . '</div></div>';

        if ($type !== 'users' && !empty($data)) {
            $risk_counts = ['low' => 0, 'medium' => 0, 'high' => 0];
            foreach ($data as $row) {
                if (isset($risk_counts[$row->risk_level])) {
                    $risk_counts[$row->risk_level]++;
                }
            }
            $html .= '<div class="summary-item"><div class="summary-label">Risiko Rendah</div><div class="summary-value">' . $risk_counts['low'] . '</div></div>';
            $html .= '<div class="summary-item"><div class="summary-label">Risiko Sedang</div><div class="summary-value">' . $risk_counts['medium'] . '</div></div>';
            $html .= '<div class="summary-item"><div class="summary-label">Risiko Tinggi</div><div class="summary-value">' . $risk_counts['high'] . '</div></div>';
        }
        $html .= '</div>';

        // Table
        $html .= '<table>';

        if ($type === 'users') {
            $html .= '<thead><tr>
                <th>No</th><th>Nama</th><th>IP Address</th><th>Total Checks</th><th>Risiko Terakhir</th><th>Check Terakhir</th><th>Tanggal Daftar</th>
            </tr></thead><tbody>';

            foreach ($data as $i => $row) {
                $html .= '<tr>';
                $html .= '<td>' . ($i + 1) . '</td>';
                $html .= '<td><strong>' . esc_html($row->name) . '</strong></td>';
                $html .= '<td>' . esc_html($row->ip_address ?: '-') . '</td>';
                $html .= '<td>' . esc_html($row->total_checks) . '</td>';
                $html .= '<td><span class="badge badge-' . esc_attr($row->last_risk_level ?: 'low') . '">' . esc_html($this->translate_risk_level($row->last_risk_level)) . '</span></td>';
                $html .= '<td>' . ($row->last_check_at ? esc_html(date('d/m/Y H:i', strtotime($row->last_check_at))) : '-') . '</td>';
                $html .= '<td>' . esc_html(date('d/m/Y', strtotime($row->created_at))) . '</td>';
                $html .= '</tr>';
            }
        } else {
            $html .= '<thead><tr>
                <th>No</th><th>Nama</th><th>IP Address</th><th>Risiko</th><th>Skor</th><th>%</th><th>Pemicu</th><th>Tanggal</th>
            </tr></thead><tbody>';

            foreach ($data as $i => $row) {
                $triggers = json_decode($row->triggers, true) ?: [];
                $html .= '<tr>';
                $html .= '<td>' . ($i + 1) . '</td>';
                $html .= '<td><strong>' . esc_html($row->user_name ?: 'Unknown') . '</strong></td>';
                $html .= '<td>' . esc_html($row->ip_address ?: '-') . '</td>';
                $html .= '<td><span class="badge badge-' . esc_attr($row->risk_level) . '">' . esc_html($this->translate_risk_level($row->risk_level)) . '</span></td>';
                $html .= '<td>' . esc_html($row->total_score . '/' . $row->max_score) . '</td>';
                $html .= '<td>' . esc_html(round($row->score_percentage, 1)) . '%</td>';
                $html .= '<td>' . esc_html(implode(', ', $triggers)) . '</td>';
                $html .= '<td>' . esc_html(date('d/m/Y H:i', strtotime($row->checked_at))) . '</td>';
                $html .= '</tr>';
            }
        }

        $html .= '</tbody></table>';
        $html .= '<div class="footer">MAAG Daily Tracker &copy; ' . date('Y') . ' | Laporan ini digenerate secara otomatis</div>';
        $html .= '</body></html>';

        return $html;
    }

    /**
     * Translate risk level to Indonesian
     */
    private function translate_risk_level($level) {
        $translations = [
            'low'    => 'Rendah',
            'medium' => 'Sedang',
            'high'   => 'Tinggi',
        ];
        return $translations[$level] ?? '-';
    }

    /**
     * Format answers into readable text
     */
    private function format_answers_text($answers) {
        if (empty($answers)) return '-';

        $parts = [];
        foreach ($answers as $key => $value) {
            $parts[] = $key . ':' . $value;
        }
        return implode('; ', $parts);
    }

    /**
     * Get export URL
     */
    public static function get_export_url($format, $type = 'all') {
        return wp_nonce_url(
            admin_url('admin.php?maag_export=' . $format . '&type=' . $type),
            'maag_export_nonce'
        );
    }
}
