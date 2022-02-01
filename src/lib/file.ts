/* eslint-disable no-async-promise-executor */
import fs from 'fs/promises';
import path from 'path';

import CSVStringify from "csv-stringify";
import CSVParse from "csv-parse";

interface CSVType {
    stringify: (data: CSVStringify.Input, options?: CSVStringify.Options) => Promise<string>
    parse: <Type> (data: string, options?: CSVParse.Options) => Promise<Type>
}

const CSV: CSVType  = {
    stringify: (data, options = { header: true, quoted_string: true }) => { return new Promise((resolve, reject) => { CSVStringify(data, options, (err, data) => { err ? reject(err) : resolve(data) }) }); },
    parse: (data, options = { columns: true}) => { return new Promise((resolve, reject) => { CSVParse(data, options, (err, data) => { err ? reject(err) : resolve(data) }) }); }
};

// const basePath = path.join("data", "early-july-2020");
// const basePath = path.join("data", "late-april-2021");
const basePath = path.join("data", "late-january-2022");

export type FileType = "json" | "csv";

export function read<Type>(filename: string, fileType: FileType): Promise<Type> {
    return new Promise(async (resolve, reject) => {
        try {
            const file_path = path.join(basePath, `${filename}.${fileType}`);
            const file: string = (await fs.readFile(file_path)).toString();
            let data: Type;
            switch (fileType) {
                case "json": data = JSON.parse(file); break;
                case "csv": data = await CSV.parse<Type>(file); break;
                default:
                    throw(new Error(`${fileType} processing is not implemented yet.`));
            }
            resolve(data);
        } catch (err) {
            reject(err);
        }
    });
}

export function write<Type>(filename: string, content: Type, fileType: FileType): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const file_path = path.join(basePath, `${filename}.${fileType}`);
            let data: string;
            switch (fileType) {
                case "json": data = JSON.stringify(content); break;
                case "csv": data = await CSV.stringify(Array.isArray(content) ? content : [content]); break;
                default:
                    throw(new Error(`${fileType} processing is not implemented yet.`));
            }
            const response = await fs.writeFile(file_path, data);
            resolve(response);
        } catch (err) {
            reject(err);
        }
    });
}