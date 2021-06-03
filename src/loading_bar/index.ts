import { dots } from 'cli-spinners';
import LogUpdate from 'log-update';
import { EventEmitter } from 'events';
import { epochTimeToHuman } from './util'
import defaultTheme, { Theme } from './theme';
import logUpdate from 'log-update';

// export default class LoadingBar extends EventEmitter {
export default class LoadingBar {
    // Internal State
    intervalID: number | undefined = undefined;
    frame         = 0;
    isActive      = false;
    clearOnFinish = false;
    
    // User Settings
    theme: Theme = defaultTheme;
    message: string;
    width = 20;

    // Progress Trackers
    current = 0;
    total: number;
    startTime: number | undefined;
    finishTime: number | undefined;

    constructor(message: string, total: number, options?: { width?: number, clearOnFinish?: boolean }) {
        // super();
        this.message = message;
        this.total   = total;

        this.width         = options?.width         || this.width;
        this.clearOnFinish = options?.clearOnFinish || this.clearOnFinish;
        this.render();
    }

    get percentage(): number {
        return this.current / this.total;
    }

    tick(count = 1): void {
        this.current += count;
    }
    
    start(): void {
        if (!this.isActive) {
            this.isActive   = true;
            this.startTime  = Date.now();
            this.intervalID = <number> <unknown> setInterval(this.render.bind(this), dots.interval); // This is a TS hack cause I am both dumb and lazy. For some reason NodeJS.Timeout is not a number in the core TS bindings, but the value is just a number.
        }
    }
    
    stop(): void {
        if (this.isActive) {
            this.isActive   = false;
            this.finishTime = Date.now();
            clearInterval(this.intervalID);
            this.intervalID = undefined;
            this.render();

            this.clearOnFinish ? logUpdate.clear() : logUpdate.done();
        }
    }

    spinner(): string {
        if (!this.isActive && this.startTime) {
            return this.theme.asciiCompleted('✓');
        } else {
            return this.theme.asciiInProgress(dots.frames[this.frame]);
        }
    }

    progressBar(): string {
        const percentage = Math.max(0, Math.min(1, this.percentage));
        
        const template = ` ${Math.round(percentage * 10000) / 100}%`.padEnd(this.width);
        
        let string = '';
        for (let i = 0; i < this.width; i++) {
            const style = (i / this.width <= percentage) ? this.theme.progressForeground : this.theme.progressBackground;
            const char = template.charAt(i);
            string += style(char);
        }
        
        return string;
    }

    timing(): string {
        if (!this.startTime) return '';
        const elapsed = Date.now() - this.startTime;
        if (this.isActive) {
            const rate      = elapsed/ this.current;
            const remaining = this.total - this.current
            const estimate  = rate * remaining;
            return this.theme.estimate(`${epochTimeToHuman(elapsed)} elapsed, ${epochTimeToHuman(estimate)} remaining`)
        } else {
            return this.theme.estimate(`${epochTimeToHuman(<number> this.finishTime - this.startTime)}`)
        }
    }

    render(): void {
        LogUpdate(`${this.spinner()} ${this.message} ${this.progressBar()} ${this.timing()}`);
        if (this.isActive && this.startTime) {
            this.frame = (this.frame + 1) % dots.frames.length;
        }
    }
}