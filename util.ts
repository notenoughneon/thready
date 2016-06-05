import fs = require('fs');
import path = require('path');
import url = require('url');

export function promisify<T>(f: (cb: (err: NodeJS.ErrnoException, res: T) => void) => void): () => Promise<T>;
export function promisify<A,T>(f: (arg: A, cb: (err: NodeJS.ErrnoException, res: T) => void) => void): (arg: A) => Promise<T>;
export function promisify<A,A2,T>(f: (arg: A, arg2: A2, cb: (err: NodeJS.ErrnoException, res: T) => void) => void): (arg: A, arg2: A2) => Promise<T>;
export function promisify<A,A2,A3,T>(f: (arg: A, arg2: A2, arg3: A3, cb: (err: NodeJS.ErrnoException, res: T) => void) => void): (arg: A, arg2: A2, arg3: A3) => Promise<T>;
export function promisify<A,A2,A3,A4,T>(f: (arg: A, arg2: A2, arg3: A3, arg4: A4, cb: (err: NodeJS.ErrnoException, res: T) => void) => void): (arg: A, arg2: A2, arg3: A3, arg4: A4) => Promise<T>;

export function promisify(f) {
    return function() {
        return new Promise((resolve, reject) => {
            var args = Array.prototype.slice.call(arguments);
            args.push((err, result) => err !== null ? reject(err) : resolve(result));
            f.apply(null, args);
        });
    }
}

export function map<T,U>(elts: PromiseLike<PromiseLike<T>[]>, f: (T) => U | PromiseLike<U>): Promise<U[]>;
export function map<T,U>(elts: PromiseLike<T[]>, f: (T) => U | PromiseLike<U>): Promise<U[]>;
export function map<T,U>(elts: PromiseLike<T>[], f: (T) => U | PromiseLike<U>): Promise<U[]>;
export function map<T,U>(elts: T[], f: (T) => U | PromiseLike<U>): Promise<U[]>;
export function map(elts, f) {
    var apply = elts => Promise.all(elts.map(elt => typeof elt.then === 'function' ? elt.then(f) : f(elt)));
    return typeof elts.then === 'function' ? elts.then(apply) : apply(elts);
}

export function _try<T>(f: () => T): Promise<T>;
export function _try<T>(f: (arg: any) => T, arg: any): Promise<T>;
export function _try<T>(f: (arg: any, arg2: any) => T, arg: any, arg2: any): Promise<T>;
export function _try<T>(f: (arg: any, arg2: any, arg3: any) => T, arg: any, arg2: any, arg3: any): Promise<T>;
export function _try<T>(f: (arg: any, arg2: any, arg3: any, arg4: any) => T, arg: any, arg2: any, arg3: any, arg4: any): Promise<T>;
export function _try(f) {
    return new Promise((res, rej) => {
        try {
            var args = Array.prototype.slice.call(arguments);
            args.shift();
            res(f.apply(null, args));
        } catch (err) {
            rej(err);
        }
    });
}

export function flatten<T>(arrarr: T[][]) {
    if (arrarr.length == 0)
        return [];
    return arrarr.reduce(function(a, b) { return a.concat(b); });
}

export function unique<T>(elts: T[]) {
    var tmp: T[] = [];
    var seen: Set<T> = new Set();
    for (let elt of elts) {
        if (!seen.has(elt)) {
            seen.add(elt);
            tmp.push(elt);
        }
    }
    return tmp;
}

export function chunk(size, arr) {
    var chunks = [];
    var b = 0;
    var c = arr.slice(b, b + size);
    while (c.length > 0)
    {
        chunks.push(c);
        b += size;
        c = arr.slice(b, b + size);
    }
    return chunks;
}

export function range(start: number, end: number) {
    return [...function* () {
        var i = start;
        while (i <= end)
            yield i++;
    } ()];
}


export function truncate(s, len) {
    if (s.length > len)
        return s.substr(0, len) + '...';
    return s;
}

export function collapse(s) {
    return s.replace(/\s+/g, ' ');
}

export function formatDate(date) {
    var month = ["Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"];
    var minutes = date.getMinutes();
    return date.getDate() + ' ' +
        month[date.getMonth()] + ' ' +
        date.getFullYear() + ' ' +
        date.getHours() + ':' +
        ((minutes < 10) ? '0' + minutes : minutes);
}
