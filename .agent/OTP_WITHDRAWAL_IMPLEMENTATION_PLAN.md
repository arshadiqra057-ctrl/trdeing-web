# OTP-Based Withdrawal Implementation Plan

## Overview
Implement a secure 2-step OTP verification system for withdrawals. Only users with **approved KYC** can request withdrawals. Email OTP must be verified before processing.

---

## Prerequisites
✅ User must have KYC status = 'approved'
✅ Email configuration must be working (SMTP/Gmail)
✅ Cache system enabled for OTP storage

---

## Implementation Steps

### **PHASE 1: Backend - Email Template & Mailable Class**

#### 1.1 Create Professional Email Template
- **File**: `backend/resources/views/emails/withdrawal-otp.blade.php`
- **Purpose**: Beautiful HTML email with OTP code
- **Content**:
  - Company branding
  - 6-digit OTP code (large, centered)
  - Expiry notice (10 minutes)
  - Security warning (never share OTP)
  - Support contact info

#### 1.2 Create Mailable Class
- **File**: `backend/app/Mail/WithdrawalOtpMail.php`
- **Purpose**: Laravel Mailable to send OTP emails
- **Properties**:
  - `$otp` - The 6-digit code
  - Subject: "Your Withdrawal Verification Code"
  - Uses: `withdrawal-otp.blade.php` template

---

### **PHASE 2: Backend - API Routes**

#### 2.1 Add OTP Send Route
- **Route**: `POST /api/withdraw/send-otp`
- **Middleware**: `auth:sanctum` (requires logged-in user)
- **Controller**: `AdminController@sendWithdrawalOtp`

#### 2.2 Update Withdraw Route
- **Route**: `POST /api/withdraw` (already exists)
- **Add Validation**: Require `otp` field
- **Controller**: `AdminController@withdraw`

---

### **PHASE 3: Backend - Controller Logic**

#### 3.1 Implement `sendWithdrawalOtp` Method
**Location**: `backend/app/Http/Controllers/AdminController.php`

**Steps**:
1. Validate request (email required, must be valid email)
2. Get authenticated user
3. Verify user has approved KYC (return 403 if not)
4. Generate random 6-digit OTP (100000 to 999999)
5. Store OTP in cache with key: `withdraw_otp_{user_id}`
6. Set cache expiry: 10 minutes (600 seconds)
7. Send email using `WithdrawalOtpMail` class
8. Log OTP generation for debugging (server logs only, never expose to client)
9. Return success response: "OTP sent to your email"

**Error Handling**:
- If email fails to send: Clear cached OTP, return 500 error
- If validation fails: Return 422 with validation errors
- If user not authenticated: Return 401

#### 3.2 Update `withdraw` Method
**Location**: `backend/app/Http/Controllers/AdminController.php`

**Steps**:
1. Validate request (amount, method, details, **otp**)
2. Get authenticated user
3. Retrieve cached OTP using key: `withdraw_otp_{user_id}`
4. Compare submitted OTP with cached OTP (strict string comparison)
5. If OTP invalid/expired: Return 422 error "Invalid or expired OTP"
6. If OTP valid:
   - Process withdrawal via `TransactionService`
   - Clear OTP from cache (one-time use)
   - Return success with transaction details
7. If withdrawal fails: Return 422 with error message

---

### **PHASE 4: Frontend - Update Withdrawal Form**

#### 4.1 Add State Variables
**File**: `src/pages/NewWithdraw.jsx`

**New States**:
```javascript
const [email, setEmail] = useState('');
const [otpSent, setOtpSent] = useState(false);
const [otp, setOtp] = useState('');
```

#### 4.2 Create Two-Step Form Flow

**Step 1: Request OTP Form**
- Show when: `!otpSent`
- Fields:
  - Amount (number, min: 10)
  - Withdrawal Method (select: crypto/bank)
  - Destination (wallet address or account number)
  - **Email** (email input, required)
- Button: "Send Verification Code"
- On Submit: Call `handleSendOtp()`

**Step 2: Verify OTP & Submit**
- Show when: `otpSent === true`
- Fields:
  - OTP Input (6-digit code, large centered text)
  - Display message: "Code sent to {email}"
- Buttons:
  - Primary: "Submit Withdrawal Request"
  - Secondary: "Cancel / Edit Details" (resets to Step 1)
- On Submit: Call `handleSubmit()` with OTP

#### 4.3 Implement Handler Functions

**`handleSendOtp()` Function**:
1. Validate all fields are filled
2. Set loading state
3. Call API: `POST /api/withdraw/send-otp` with `{ email }`
4. On success:
   - Set `otpSent = true`
   - Show success message
5. On error:
   - Display error message
   - Keep user on Step 1

**`handleSubmit()` Function**:
1. Validate OTP is entered
2. Set loading state
3. Call API: `POST /api/withdraw` with:
   ```json
   {
     "amount": parseFloat(amount),
     "method": method,
     "details": { "destination": destination },
     "otp": otp
   }
   ```
4. On success:
   - Show success message
   - Clear all form fields
   - Reset `otpSent = false`
   - Refresh user balance
5. On error:
   - Display error (e.g., "Invalid OTP")
   - Allow retry

---

### **PHASE 5: Email Configuration Verification**

#### 5.1 Ensure `.env` is Configured
**File**: `backend/.env`

**Required Settings**:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="Your App Name"
```

⚠️ **CRITICAL**: Use Gmail App Password, NOT regular password!

#### 5.2 Test Email Delivery
- Create a test script to send a test email
- Verify email arrives in inbox (not spam)
- Check OTP is clearly visible
- Confirm expiry time is mentioned

---

### **PHASE 6: Security & Edge Cases**

#### 6.1 Security Measures
✅ OTP expires after 10 minutes
✅ OTP deleted after successful use (one-time only)
✅ OTP never exposed in API responses (client-side)
✅ KYC must be approved before OTP can be sent
✅ Email validation prevents invalid addresses
✅ Rate limiting on OTP send endpoint (prevent spam)

#### 6.2 Error Scenarios to Handle
1. **Email delivery fails**: Clear OTP, inform user
2. **OTP expired**: User can request new OTP
3. **Invalid OTP**: Allow retry (but limit attempts?)
4. **User closes browser**: OTP still valid for 10 min
5. **SMTP errors**: Log detailed error, show user-friendly message

---

## Testing Checklist

### Backend Tests
- [ ] OTP generated correctly (6 digits, numeric)
- [ ] OTP stored in cache with correct key
- [ ] OTP expires after 10 minutes
- [ ] Email sent successfully
- [ ] Invalid email returns validation error
- [ ] Unapproved KYC users blocked
- [ ] OTP validation works (correct vs incorrect)
- [ ] OTP cleared after successful withdrawal

### Frontend Tests
- [ ] Step 1 form displays correctly
- [ ] Email validation works
- [ ] "Send Code" button triggers API call
- [ ] Success message shown after OTP sent
- [ ] Step 2 form displays with OTP input
- [ ] "Cancel" button resets to Step 1
- [ ] Invalid OTP shows error message
- [ ] Successful withdrawal resets form
- [ ] Loading states work correctly

### End-to-End Tests
- [ ] Complete flow: KYC approved → Request withdrawal → Receive email → Enter OTP → Success
- [ ] Email arrives within 30 seconds
- [ ] OTP in email matches what server expects
- [ ] Expired OTP rejected correctly
- [ ] Multiple withdraw requests work independently

---

## Rollback Plan (If Issues Occur)

1. **If emails not sending**:
   - Check `.env` configuration
   - Verify Gmail App Password is correct
   - Check server logs for SMTP errors
   - Fallback: Log OTP to server logs temporarily for testing

2. **If OTP validation failing**:
   - Check cache is working (`php artisan cache:clear`)
   - Verify string comparison (no type coercion issues)
   - Add detailed logging to track OTP flow

3. **If frontend broken**:
   - Git revert to working state
   - Re-implement changes incrementally
   - Test each change before proceeding

---

## Deployment Steps

1. **Commit backend changes** (Mailable, Controller, Routes)
2. **Commit frontend changes** (NewWithdraw.jsx)
3. **Test on local environment** (all scenarios)
4. **Deploy to staging** (if available)
5. **Final production deployment**
6. **Monitor logs** for first 24 hours

---

## Success Criteria

✅ User with approved KYC can request withdrawal
✅ OTP email arrives in inbox within 30 seconds
✅ OTP is clearly visible and easy to copy
✅ Correct OTP allows withdrawal to process
✅ Invalid/expired OTP shows helpful error
✅ No errors in server logs
✅ Professional, secure user experience

---

**Ready to implement? Please confirm and I'll begin with Phase 1!**
