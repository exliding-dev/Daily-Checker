(function ($) {
    'use strict';

    $(document).ready(function () {
        // Delete user handler
        $('.maag-btn-delete').on('click', function (e) {
            e.preventDefault();

            var $btn = $(this);
            var userId = $btn.data('user-id');
            var userName = $btn.data('user-name');

            if (!confirm('Are you sure you want to delete user "' + userName + '" and all their daily check data? This action cannot be undone.')) {
                return;
            }

            $btn.prop('disabled', true).text('Deleting...');

            $.ajax({
                url: maagAdmin.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'maag_delete_user',
                    nonce: maagAdmin.nonce,
                    user_id: userId
                },
                success: function (response) {
                    if (response.success) {
                        $('#user-row-' + userId).fadeOut(300, function () {
                            $(this).remove();
                        });
                    } else {
                        alert('Error: ' + (response.data.message || 'Failed to delete user'));
                        $btn.prop('disabled', false).text('🗑️ Delete');
                    }
                },
                error: function () {
                    alert('Network error. Please try again.');
                    $btn.prop('disabled', false).text('🗑️ Delete');
                }
            });
        });
    });
})(jQuery);
