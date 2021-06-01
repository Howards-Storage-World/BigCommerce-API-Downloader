export interface Order {
    id: number
    date_modified: string
    date_shipped: string
    cart_id: string
    status: string
    subtotal_tax: string
    shipping_cost_tax: string
    shipping_cost_tax_class_id: number
    handling_cost_tax: string
    handling_cost_tax_class_id: number
    wrapping_cost_tax: string
    wrapping_cost_tax_class_id: number
    payment_status: string
    store_credit_amount: string
    gift_certificate_amount: string
    currency_id: number
    currency_code: string
    currency_exchange_rate: string
    default_currency_id: number
    coupon_discount: string
    shipping_address_count: number
    is_email_opt_in: boolean
    order_source: string
    products: AdditionalResource // Requires another Look-up
    shipping_addresses: AdditionalResource // Requires another Look-up
    coupons: AdditionalResource // Requires another Look-up
    status_id: number
    base_handling_cost: string
    base_shipping_cost: string
    base_wrapping_cost: string | number
    billing_address: BillingAddress
    channel_id: number
    customer_id: number
    customer_message: string
    date_created: string
    default_currency_code: string
    discount_amount: string
    ebay_order_id: string
    external_id: string | null
    external_source: string | null
    geoip_country: string
    geoip_country_iso2: string
    handling_cost_ex_tax: string
    handling_cost_inc_tax: string
    ip_address: string
    is_deleted: boolean
    items_shipped: number
    items_total: number
    order_is_digital: boolean
    payment_method: string
    payment_provider_id: string | number
    refunded_amount: string
    shipping_cost_ex_tax: string
    shipping_cost_inc_tax: string
    staff_notes: string
    subtotal_ex_tax: string
    subtotal_inc_tax: string
    tax_provider_id: string
    customer_locale: string
    total_ex_tax: string
    total_inc_tax: string
    wrapping_cost_ex_tax: string
    wrapping_cost_inc_tax: string
}

export interface Line {
    id: number
    order_id: number
    product_id: number
    order_address_id: number
    name: string // name_customer
    sku: string
    type: string
    base_price: string
    price_ex_tax: string
    price_inc_tax: string
    price_tax: string
    base_total: string
    total_ex_tax: string
    total_inc_tax: string
    total_tax: string
    quantity: number
    base_cost_price: string
    cost_price_inc_tax: string
    cost_price_ex_tax: string
    weight: number | string
    cost_price_tax: string
    is_refunded: boolean
    refunded_amount: string
    return_id: number
    wrapping_name: string
    base_wrapping_cost: number | string
    wrapping_cost_ex_tax: string
    wrapping_cost_inc_tax: string
    wrapping_cost_tax: string
    wrapping_message: string
    quantity_shipped: number
    event_name?: string | null
    event_date?: string | null
    fixed_shipping_cost: string
    ebay_item_id: string
    option_set_id?: number | null
    parent_order_product_id?: number | null
    is_bundled_product: boolean
    bin_picking_number: string
    applied_discounts: { id: string, amount: string, code?: string | null, target: string }[]
    product_options: { id: number, option_id: number, order_product_id: number, product_option_id: number, display_name: string, display_value: string, value: string, type: string, name: string, display_style: string, display_name_customer: string, display_name_merchant: string }[]
    external_id?: string | null
    upc: string
    variant_id: number
    name_customer: string
    name_merchant: string 
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Product {
    
}

export interface BillingAddress {
    first_name: string
    last_name: string
    company: string
    street_1: string
    street_2: string
    city: string
    state: string
    zip: number
    country: string
    country_iso2: string
    phone: number
    email: string
    form_fields: FormField[]
}

export interface FormField {
    name: string
    value: string
}

export interface AdditionalResource {
    url: string
    resource: string
}

export interface OrderCountStatus {
    id: number
    name: string
    system_label: string
    custom_label: string
    system_description: string
    count: number
    sort_order: number
}

export interface OrderCount {
    statues: OrderCountStatus[]
    count: number
}

export interface CustomerAddress {
    id: number
    customer_id: number
    first_name: string
    last_name: string
    company?: string
    address1: string
    address2?: string
    city: string
    state_or_province: string
    postal_code: string
    country?: string
    country_code: string
    phone?: string
    address_type?: string
    form_fields: (FormField & { customer_id: number}) []
}

export type QueryMeta = {
    pagination: Pagination
}

export type Pagination = {
    total: number
    count: number
    per_page: number
    current_page: number
    total_pages: number
    links?: {
        previous: string
        current: string
        next: string
    }
}

export type BigCommerceV3Wrapper<T> = {
    data: T[]
    meta: QueryMeta
}