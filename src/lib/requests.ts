import { promisify } from 'util';
import { Order, OrderCount, Line, Product, CustomerAddress, Pagination, BigCommerceV3Wrapper, Customer } from "../lib/big_commerce_types";
import Request from 'request';
import LoadingBar from '../loading_bar';
const request = promisify(Request);

const { BC_STORE_HASH, BC_AUTH_TOKEN, BC_AUTH_CLIENT } = process.env;

export const baseRequestOptions: Request.Headers = {
    method: 'GET',
    url: 'https://api.bigcommerce.com/stores/' + BC_STORE_HASH,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': BC_AUTH_TOKEN,
        'X-Auth-Client': BC_AUTH_CLIENT,
    }
};

export async function getOrderCount(): Promise<OrderCount> {
    const counts_resp = await request({ ...baseRequestOptions, 'url': baseRequestOptions.url + "/v2/orders/count"  });
    const counts: OrderCount = JSON.parse(counts_resp.body);
    return counts;
}

export async function getOrders(page?: number): Promise<Order[]> {
    page = page || 0;
    const response = await request({ ...baseRequestOptions, 'url': baseRequestOptions.url + `/v2/orders?limit=100&page=${page}`  });
    const orders: Order[] = JSON.parse(response.body);
    return orders;
}

export async function getLines(orderID?: number): Promise<Line[]> {
    const response = await request({...baseRequestOptions, url: baseRequestOptions.url + `/v2/orders/${orderID}/products`});
    const lines: Line[] = JSON.parse(response.body);
    return lines;
}

export async function getProduct(productID?: number): Promise<Product> {
    const response = await request({...baseRequestOptions, url: baseRequestOptions.url + `/v3/catalog/products/${productID}`});
    const product: Product = JSON.parse(response.body);
    return product;
}

export async function getCustomer(page?: number): Promise<BigCommerceV3Wrapper<Customer>> {
    const response = await request({ ...baseRequestOptions, 'url': baseRequestOptions.url + `/v3/customers?limit=100&page=${page || 0}`  });
    const customers: BigCommerceV3Wrapper<Customer> = JSON.parse(response.body);
    return customers;
}

export async function getCustomerAddresses(page?: number): Promise<BigCommerceV3Wrapper<CustomerAddress>> {
    const response = await request({ ...baseRequestOptions, 'url': baseRequestOptions.url + `/v3/customers/addresses?limit=100&page=${page || 0}`  });
    const addresses: BigCommerceV3Wrapper<CustomerAddress> = JSON.parse(response.body);
    return addresses;
}

export async function getNext<Content>(baseURI: string, meta: Pagination, queryParameters?: string): Promise<BigCommerceV3Wrapper<Content>> {
    if (meta.current_page < meta.total_pages) {
        const response = await request({ ...baseRequestOptions, 'url': baseURI + (meta.current_page + 1) + (queryParameters ? "&" + queryParameters : "") });
        const data: BigCommerceV3Wrapper<Content> = JSON.parse(response.body);
        return data;
    } else {
        return { data: [], meta: { pagination: { ...meta }}};
    }
}

export async function loadTestOrder(orderID?: number): Promise<Request.Response> {
    const reqOptions = {
        'method': 'POST',
        'url': 'https://boomi.hsw.com.au/ws/simple/executeTestOrderCreation',
        'headers': {
            'Content-Type': 'text/plain'
        },
        body: `${orderID}`
    };
    const response = await request(reqOptions);
    return response;
}

class LocalLoadingBar<Content> extends LoadingBar {
    startingPage: number
    constructor(msg: string, page: number) {
        super(msg, 1, { width: 50 });
        this.startingPage = page;
    }
    update(response: BigCommerceV3Wrapper<Content>): void {
        this.total = response.meta.pagination.total_pages - this.startingPage; this.current = response.meta.pagination.current_page - this.startingPage;
    }
}
export async function getAll<Content>(resource: string, { queryParmeters = "", startingPage = 0, showLoadingBar = true, loadingMessage = "Downloading Objects" } = { }): Promise<Content[]> {
    const baseURI = `${baseRequestOptions.url}/v3${resource}?limit=100&page=`;
    const content: Content[] = [];
    const bar: LocalLoadingBar<Content> | undefined = showLoadingBar ? new LocalLoadingBar(loadingMessage, startingPage) : undefined;
    
    bar?.start();
    let response: BigCommerceV3Wrapper<Content> = await getNext(baseURI, { current_page: startingPage, total: Infinity, count: Infinity, per_page: 100, total_pages: Infinity}, queryParmeters);
    bar?.update(response);
    content.push(...response.data);
    
    while (response.meta.pagination.current_page < response.meta.pagination.total_pages) {
        response = await getNext<Content>(baseURI, response.meta.pagination, queryParmeters);
        bar?.update(response);
        content.push(...response.data);
    }
    bar?.stop();
    
    return content;
}

export async function updateCustomers(data: (Partial<Customer> & { id: number })[]): Promise<BigCommerceV3Wrapper<Customer>> {
    const resp = await request({ ...baseRequestOptions, 'url': baseRequestOptions.url + "/v3/customers", method: "PUT", body: JSON.stringify(data)  });
    const customers: BigCommerceV3Wrapper<Customer> = JSON.parse(resp.body);
    return customers;
}

// bar.start();
//             const counts = new Counter<number>();
//             const customer_addresses: CustomerAddress[] = [];
//             let response = <BigCommerceV3Wrapper<CustomerAddress>> <unknown> { meta: { pagination: { current_page: 0 } } };
//             response = await getNextCustomerAddresses(response, counts, customer_addresses, bar);

//             while (response.meta.pagination.current_page != response.meta.pagination.total_pages) {
//                 response = await getNextCustomerAddresses(response, counts, customer_addresses, bar);
//             }
//             bar.stop();
// const getNext = async <>(last_response: BigCommerceV3Wrapper<CustomerAddress>, counter: Counter<number>, results: CustomerAddress[], bar: LoadingBar, ) => {
//     const response = await getCustomerAddresses(last_response.meta.pagination.current_page + 1);

//     bar.total = response.meta.pagination.total_pages;
//     bar.tick();

//     response.data.forEach(address => counter.add(address.customer_id));
//     results.concat(response.data);

//     return response;
// };