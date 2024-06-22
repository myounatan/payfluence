import * as yup from 'yup';

// create checkout data

export const CreateCheckout = yup.object({
  productId: yup.string().required(),
  // optional checkout pre-fill
  email: yup.string().email(),
  name: yup.string(),
});

// webhook data

export const SubscriptionSchema = yup.object({
  type: yup.string(),
  id: yup.string(),
  attributes: yup.object({
    store_id: yup.number(),
    customer_id: yup.number(),
    order_id: yup.number(),
    order_item_id: yup.number(),
    product_id: yup.number(),
    variant_id: yup.number(),
    product_name: yup.string(),
    variant_name: yup.string(),
    user_name: yup.string(),
    user_email: yup.string().email(),
    status: yup.string(),
    status_formatted: yup.string(),
    card_brand: yup.string(),
    card_last_four: yup.string(),
    pause: yup.mixed().nullable(),
    cancelled: yup.boolean(),
    trial_ends_at: yup.mixed().nullable(),
    billing_anchor: yup.number(),
    first_subscription_item: yup.object({
      id: yup.number(),
      subscription_id: yup.number(),
      price_id: yup.number(),
      quantity: yup.number(),
      created_at: yup.string(),
      updated_at: yup.string(),
    }),
    urls: yup.object({
      update_payment_method: yup.string().url(),
      customer_portal: yup.string().url(),
      customer_portal_update_subscription: yup.string().url(),
    }),
    renews_at: yup.string(),
    ends_at: yup.mixed().nullable(),
    created_at: yup.string(),
    updated_at: yup.string(),
    test_mode: yup.boolean(),
  }),
});

export const SubscriptionInvoiceSchema = yup.object({
  type: yup.string(),
  id: yup.string(),
  attributes: yup.object({
    store_id: yup.number(),
    subscription_id: yup.number(),
    customer_id: yup.number(),
    user_name: yup.string(),
    user_email: yup.string().email(),
    billing_reason: yup.string(),
    card_brand: yup.string(),
    card_last_four: yup.string(),
    currency: yup.string(),
    currency_rate: yup.string(),
    status: yup.string(),
    status_formatted: yup.string(),
    refunded: yup.boolean(),
    refunded_at: yup.mixed().nullable(),
    subtotal: yup.number(),
    discount_total: yup.number(),
    tax: yup.number(),
    tax_inclusive: yup.boolean(),
    total: yup.number(),
    subtotal_usd: yup.number(),
    discount_total_usd: yup.number(),
    tax_usd: yup.number(),
    total_usd: yup.number(),
    subtotal_formatted: yup.string(),
    discount_total_formatted: yup.string(),
    tax_formatted: yup.string(),
    total_formatted: yup.string(),
    urls: yup.object({
      invoice_url: yup.string().url(),
    }),
    created_at: yup.string(),
    updated_at: yup.string(),
    test_mode: yup.boolean(),
  }),
  relationships: yup.object({
    store: yup.object({
      links: yup.object({
        related: yup.string().url(),
        self: yup.string().url(),
      }),
    }),
    subscription: yup.object({
      links: yup.object({
        related: yup.string().url(),
        self: yup.string().url(),
      }),
    }),
    customer: yup.object({
      links: yup.object({
        related: yup.string().url(),
        self: yup.string().url(),
      }),
    }),
  }),
  links: yup.object({
    self: yup.string().url(),
  }),
});

export const WebhookSchema = yup.object({
  meta: yup.object({
    test_mode: yup.boolean(),
    event_name: yup.string(),
    webhook_id: yup.string(),
  }).required(),
  data: yup.mixed().test('is-valid-data', 'Invalid data', value => {
    try {
      SubscriptionSchema.validateSync(value);
      return true;
    } catch (error) {
      try {
        SubscriptionInvoiceSchema.validateSync(value);
        return true;
      } catch (error) {
        return false;
      }
    }
  }).required(),
});
