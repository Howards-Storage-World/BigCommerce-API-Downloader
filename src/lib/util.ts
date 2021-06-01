

export class Counter<Key> extends Map<Key, number> {
    add(key: Key): void {
        this.set(key, (this.get(key) || 0) + 1);
    }
    subtract(key: Key): void {
        this.set(key, (this.get(key) || 0) - 1);
    }
}

export function sleep(secs: number): Promise<void> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, secs * 1000);
    });
}