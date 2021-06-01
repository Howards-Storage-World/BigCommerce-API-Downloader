import { promisify } from 'util';
import { Order, OrderCount, Line, Product, CustomerAddress, Pagination, BigCommerceV3Wrapper } from "../lib/big_commerce_types";
import Request from 'request';
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

export async function getCustomerAddresses(page?: number): Promise<BigCommerceV3Wrapper<CustomerAddress>> {
    page = page || 0;
    const response = await request({ ...baseRequestOptions, 'url': baseRequestOptions.url + `/v3/customers/addresses?limit=100&page=${page}`  });
    const addresses: BigCommerceV3Wrapper<CustomerAddress> = JSON.parse(response.body);
    return addresses;
}

export async function getNext<ResponseDataType>(current: Pagination): Promise<ResponseDataType> {
    if (current.links?.next) {
        const response = await request({ ...baseRequestOptions, 'url': current.links.next });
        const data: ResponseDataType = JSON.parse(response.body);
        return data;
    } else {
        return <ResponseDataType> {};
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