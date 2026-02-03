<?php
// Quick Email Test
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;

$testEmail = readline("Enter your email address to test: ");
$testOtp = '123456';

echo "\nAttempting to send test OTP to: $testEmail\n";
echo "OTP: $testOtp\n\n";

try {
    Mail::to($testEmail)->send(new \App\Mail\WithdrawalOtpMail($testOtp));
    echo "✅ SUCCESS! Email sent successfully!\n";
    echo "Please check your inbox (and spam folder).\n";
} catch (\Exception $e) {
    echo "❌ FAILED! Error: " . $e->getMessage() . "\n\n";
    echo "Common issues:\n";
    echo "1. Wrong Gmail App Password in .env\n";
    echo "2. MAIL_MAILER not set to 'smtp'\n";
    echo "3. Wrong email format\n";
    echo "4. 2-Step Verification not enabled on Gmail account\n\n";
    echo "Current mail config:\n";
    echo "MAIL_MAILER: " . config('mail.default') . "\n";
    echo "MAIL_HOST: " . config('mail.mailers.smtp.host') . "\n";
    echo "MAIL_PORT: " . config('mail.mailers.smtp.port') . "\n";
    echo "MAIL_USERNAME: " . config('mail.mailers.smtp.username') . "\n";
}
