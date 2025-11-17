/**
 * Supported locale codes for decline code translations
 */
export type Locale = 'en' | 'ja';

/**
 * Translation for a specific locale
 */
export interface Translation {
  description: string;
  nextUserAction: string;
}

/**
 * Decline code information including descriptions and recommended actions
 */
export interface DeclineCodeInfo {
  /** Technical description of why the payment was declined */
  description: string;
  /** Recommended next steps for merchants */
  nextSteps: string;
  /** User-facing message that can be shown to customers */
  nextUserAction: string;
  /** Translations for different locales */
  translations?: Partial<Record<Locale, Translation>>;
}

/**
 * Result containing decline code information and metadata
 */
export interface DeclineCodeResult {
  /** Stripe API documentation version */
  docVersion: string;
  /** Decline code information, or empty object if code not found */
  code: DeclineCodeInfo | Record<string, never>;
}

/**
 * All supported Stripe decline codes
 */
export type DeclineCode =
  | 'approve_with_id'
  | 'call_issuer'
  | 'card_not_supported'
  | 'card_velocity_exceeded'
  | 'currency_not_supported'
  | 'do_not_honor'
  | 'do_not_try_again'
  | 'duplicate_transaction'
  | 'expired_card'
  | 'fraudulent'
  | 'generic_decline'
  | 'incorrect_number'
  | 'incorrect_cvc'
  | 'incorrect_pin'
  | 'incorrect_zip'
  | 'insufficient_funds'
  | 'invalid_account'
  | 'invalid_amount'
  | 'invalid_cvc'
  | 'invalid_expiry_year'
  | 'invalid_number'
  | 'invalid_pin'
  | 'issuer_not_available'
  | 'lost_card'
  | 'merchant_blacklist'
  | 'new_account_information_available'
  | 'no_action_taken'
  | 'not_permitted'
  | 'pickup_card'
  | 'pin_try_exceeded'
  | 'processing_error'
  | 'reenter_transaction'
  | 'restricted_card'
  | 'revocation_of_all_authorizations'
  | 'revocation_of_authorization'
  | 'security_violation'
  | 'service_not_allowed'
  | 'stolen_card'
  | 'stop_payment_order'
  | 'testmode_decline'
  | 'transaction_not_allowed'
  | 'try_again_later'
  | 'withdrawal_count_limit_exceeded';
