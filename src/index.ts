/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-lines-per-function */
import DotEnv from 'dotenv'; DotEnv.config();
// import ProgressBar from 'progress';
import { performance }  from 'perf_hooks';
import { getAll, getCustomerAddresses, getLines, getOrderCount, getOrders, getProduct, loadTestOrder } from "./lib/requests";
import { Order, Line, Product, CustomerAddress, BigCommerceV3Wrapper } from "./lib/big_commerce_types";
import * as File from "./lib/file";
import { Counter, sleep } from './lib/util';
import LoadingBar from './loading_bar/index';


const orderFilter = (order: Order): boolean => {
    const maxDate = new Date("2020-07-05T13:00:00.000Z");
    const minDate =  new Date("2020-07-01T13:00:00.000Z");
    const orderDate = new Date(order.date_created);
    return (orderDate >= minDate && orderDate < maxDate);
};

async function main() {
    // await downloadOrders();
    // await downloadLines();
    // downloadProducts();
    // await loadOrderIntoUATviaBoomi(); // Total Execution Time 2:43 (163 min) with 1132 request = ~8.6 secs/request
    // await test();
    const addresses = await getAll<CustomerAddress>("/customers/addresses", { startingPage: 3450, loadingMessage: "Downloading Customer Addresses" });
    console.log(addresses.length);
}

// async function test() {
//     try {
//         const bar = new LoadingBar("Doing things", 1000, { size: 100 });
//         await sleep(1);
//         bar.start();

//         for (let i = 0; i < 300; i++) {
//             await sleep(0.1);
//             bar.tick();
//         }

//         bar.stop();

//     } catch (err) {
//         console.error(err);
//     }
// }

const getNextCustomerAddresses = async (last_response: BigCommerceV3Wrapper<CustomerAddress>, counter: Counter<number>, results: CustomerAddress[], bar: LoadingBar, ) => {
    const response = await getCustomerAddresses(last_response.meta.pagination.current_page + 1);

    bar.total = response.meta.pagination.total_pages;
    bar.tick();

    response.data.forEach(address => counter.add(address.customer_id));
    results.concat(response.data);

    return response;
};

function test() {
    return new Promise(async (resolve, reject) => {
        try {
                
            const bar = new LoadingBar('Downloading Customer Addresses', 1, { width: 50 });

            bar.start();
            const counts = new Counter<number>();
            const customer_addresses: CustomerAddress[] = [];
            let response = <BigCommerceV3Wrapper<CustomerAddress>> <unknown> { meta: { pagination: { current_page: 0 } } };
            response = await getNextCustomerAddresses(response, counts, customer_addresses, bar);

            while (response.meta.pagination.current_page != response.meta.pagination.total_pages) {
                response = await getNextCustomerAddresses(response, counts, customer_addresses, bar);
            }
            bar.stop();

            // await File.write<CustomerAddress[]>("customer_addresses.json", customer_addresses, 'json');
            const results = Array.from(counts.entries());
            const summary = results.reduce((counter: Counter<number>, [customer_id, address_count]) => { counter.add(address_count); address_count > 2 ? console.log(`High Address Count - CustomerID =${customer_id} AddressCount=${address_count}`) : null; return counter; }, new Counter<number>());
            console.log(summary);
            await File.write<[number, number][]>("test", results, 'json')
            // const orders: Order[] = await File.read<Order[]>("orders.json");

            
            // const filteredOrders = orders.filter(orderFilter);
            // // const filteredOrderIDs = JSON.parse(orders).filter(orderFilter).map(order => order.id);
            // const filteredOrdersPaymentMethoods = orders.map(order => order.payment_method);
            // // console.log(filteredOrdersPaymentMethoods)
            // const payment_methods_count: Map<string, {payment_method: string, count: number, ratio: number}> = new Map();
            // for (const method of filteredOrdersPaymentMethoods) {
            //     const current = payment_methods_count.get(method);
            //     const next = (current?.count || 0) + 1;
            //     payment_methods_count.set(method, { payment_method: method, count: next, ratio: next / filteredOrdersPaymentMethoods.length * 100 });
            // }
                
            // await File.write("payment_methods.csv", Array.from(payment_methods_count.values()), "csv");

            // console.log(filteredOrders[50].id)
            
            // console.log(filteredOrderIDs.length)
            // await fs.writeFile("filteredOrders.json", JSON.stringify(filteredOrders));
            // await fs.writeFile("filteredOrderIDs.json", JSON.stringify(filteredOrderIDs));
            // const data = JSON.parse(await fs.readFile(path.join(basePath, "order-loads.json")));
            // console.log(data.filter(item => item.statusMessage != "OK").map(item => item.statusCode));
            resolve(undefined);
        } catch (error) {
            reject(error);
        }
    });
}

// function downloadOrders(): Promise<Order[]> {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const counts = await getOrderCount();
//             console.log("Found", counts.count, "orders, attempting to download.");

//             const bar = new ProgressBar('Downloading Orders [:bar] :rate orders/sec :percent :etas', {
//                 complete: '#',
//                 incomplete: ' ',
//                 width: 100,
//                 total: counts.count
//             });

//             // let lastOrders = new Array(100);
//             let orders: Order[] = [];
        
//             while (orders.length < counts.count) {
//                 const new_orders = await getOrders((Math.floor(orders.length / 100) + 1));
//                 orders = [...orders, ...new_orders];
//                 bar.tick(new_orders.length);
//             }
            
//             await File.write("orders", orders, 'json');
//             resolve(orders);
//         } catch (error) {
//             reject(error);
//         }
//     });
// }

// function downloadLines(): Promise<Line[]> {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const orderIDs = (await File.read<Order[]>("orders", 'json')).filter(orderFilter).map(order => order.id);

//             const bar = new ProgressBar('Downloading Lines [:bar] :rate orders/sec :percent :etas', {
//                 complete: '#',
//                 incomplete: ' ',
//                 width: 100,
//                 total: orderIDs.length
//             });

//             let lines: Line[] = [];

//             for (let i = 0; i < orderIDs.length; i++) {
//                 const new_lines = await getLines(orderIDs[i]);
//                 lines = [...lines, ...new_lines];
//                 bar.tick();
//             }

//             await File.write("lines", lines, 'json');
//             resolve(lines);
//         } catch (error) {
//             reject(error);
//         }
//     });
// }

// function downloadProducts(): Promise<Product[]> {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const productIDs = (await File.read<Line[]>("lines", 'json')).map(line => line.product_id);
            
//             const bar = new ProgressBar('Downloading Lines [:bar] :rate orders/sec :percent :etas', {
//                 complete: '#',
//                 incomplete: ' ',
//                 width: 100,
//                 total: productIDs.length
//             });

//             let products: Product[] = [];

//             for (let i = 0; i < productIDs.length; i++) {
//                 const product = await getProduct(productIDs[i])
//                 products = [...products, product];
//                 bar.tick();
//             }

//             await File.write("products", products, 'json');
//             resolve(products);
//         } catch (error) {
//             reject(error);
//         }
//     });
// }

// function loadOrderIntoUATviaBoomi(orders?: Order[]) {
//     return new Promise(async (resolve, reject) => {
//         try {
//             if (!orders) {
//                 orders = await File.read<Order[]>("orders", 'json');
//             }
            
//             const orderIDs = orders.filter(orderFilter).map(order => order.id);
//             const orderCount = 50; // orderIDs.length;
//             const bar = new ProgressBar('Loading Orders into LSC [:bar] :rate orders/sec :percent :etas', {
//                 complete: '#',
//                 incomplete: ' ',
//                 width: 100,
//                 total: orderCount
//             });

//             console.log(orderCount, "order(s) to load.");

//             const responses: { body: string, statusCode: string | number, statusMessage: string, orderID: number }[] = [];
            
//             const start = performance.now();
//             for (let i = 0; i < orderCount; i++) {
//                 try {
//                     const { body, statusCode, statusMessage } = await loadTestOrder(orderIDs[i]);
//                     // console.log(body);
//                     if (body.startsWith('<?xml version="1.0" encoding="UTF-8" standalone="no"?><Soap:Envelope xmlns:Soap="http://schemas.xmlsoap.org/soap/envelope/"><Soap:Header/><Soap:Body><CreateCustomerOrder_Result xmlns="urn:microsoft-dynamics-schemas/codeunit/ClickandCollect"><customerOrderImport><COHeader xmlns="urn:microsoft-dynamics-nav/xmlports/x50011"><DocumentNo/>')) {
//                         responses.push({body, statusCode, statusMessage: "Unknown Error: " + statusMessage, orderID: orderIDs[i]});
//                     } else {
//                         responses.push({body, statusCode, statusMessage, orderID: orderIDs[i]});
//                     }
//                 } catch (error) {
//                     responses.push({body: error, statusCode: 0, statusMessage: "Unknown Error", orderID: orderIDs[i]});
//                     console.error(error);
//                     return;
//                 }
//                 bar.tick();
//             }
//             const end = performance.now();
//             const duration = (end-start) / 1000; // Converted to Seconds
//             console.log(`Loaded ${orderCount} orders in ${duration} seconds (${duration/orderCount}secs/order)`);
            
//             await File.write("order-loads", responses, 'json');
//             resolve(responses);
//         } catch (error) {
//             reject(error);        }
//     });
// }

main();