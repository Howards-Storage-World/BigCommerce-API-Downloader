
import chalk, { Chalk } from 'chalk';

const colors = {
  black: '#171717',
  gray: '#757575',
  green: '#00de6d',
  darkGreen: '#007272',
  red: '#cf000b',
  yellow: '#ffdd00',
  white: '#ffffff'
};

export type Theme = {
    asciiCompleted: Chalk
    asciiInProgress: Chalk
    estimate: Chalk
    label: Chalk
    percentage: Chalk;
    progressBackground: Chalk;
    progressForeground: Chalk;
}

const defaultTheme = {
    asciiCompleted: chalk.hex(colors.green),
    asciiInProgress: chalk.hex(colors.yellow),
    estimate: chalk.hex(colors.gray),
    label: chalk,
    percentage: chalk,
    progressBackground: chalk.bgHex(colors.darkGreen).hex(colors.white),
    progressForeground: chalk.bgHex(colors.green).hex(colors.black),
}

export default defaultTheme;
