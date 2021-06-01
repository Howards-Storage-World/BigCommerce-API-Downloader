

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

// eslint-disable-next-line max-lines-per-function
export function epochTimeToHuman(time: number | string): string {
    const MS_PER_SECOND = 1000;
    const MS_PER_MINUTE = 60 * MS_PER_SECOND;
    const MS_PER_HOUR = 60 * MS_PER_MINUTE;

    let unit;
    if (time < MS_PER_SECOND) {
        time = Math.round(<number> time);
        unit = 'ms';
    } else if (time < MS_PER_MINUTE) {
        time = (<number> time / MS_PER_SECOND).toFixed(1);
        unit = 'secs';
    } else if (time < MS_PER_HOUR) {
        time = (<number> time / MS_PER_MINUTE).toFixed(1);
        unit = 'mins';
    } else {
        time = (<number> time / MS_PER_HOUR).toFixed(1);
        unit = 'hours';
    }

    if (<number> time % 1 === 0) {
        return `${Math.round(<number> time)} ${unit}`;
    }
    return `${time} ${unit}`;
}