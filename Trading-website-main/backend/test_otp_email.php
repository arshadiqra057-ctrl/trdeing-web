<?php
// Test OTP Email Delivery
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Mail\WithdrawalOtpMail;
use Illuminate\Support\Facades\Mail;

try {
    // Test OTP
    $testOtp = '123456';
    $testEmail = 'test@example.com'; // Replace with your actual email
    
    echo "Sending test OTP email to: $testEmail\n";
    echo "OTP Code: $testOtp\n\n";
    
    // Send test email
    Mail::to($testEmail)->send(new WithdrawalOtpMail($testOtp));
    
    echo "✅ Email sent successfully!\n";
    echo "Please check your inbox (and spam folder) for the verification code.\n";
    
} catch (\Exception $e) {
    echo "❌ Email failed to send!\n";
    echo "Error: " . $e->getMessage() . "\n\n";
    echo "Troubleshooting:\n";
    echo "1. Check your .env MAIL settings\n";
    echo "2. Verify your Gmail App Password is correct\n";
    echo "3. Make sure MAIL_MAILER=smtp (not 'log')\n";
    echo "4. Ensure your firewall allows outbound SMTP connections\n";
}
