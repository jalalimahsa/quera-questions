import { Direction } from './direction.js';
import { Maze } from './maze.js';
import { solveMaze } from '../solution.js';


const logContainer = document.getElementById('logContainer');

export function showExecutions() {
    const logsStr = localStorage.getItem('logs');

    if (!logsStr) {
        localStorage.setItem('logs', '[]');
        return;
    }

    try {
        const logs = JSON.parse(logsStr);
        for (const log of logs) {
            showLog(log);
        }
    } catch (e) {
        console.error(e);
        localStorage.removeItem('logs');
    }
}

/**
 * @param {Maze} maze
 */
export async function executeSolver(maze) {
    let solution, error;
    try {
        solution = solveMaze(maze);
        ({ error } = await executeSolution(maze, solution));
    } catch (e) {
        console.error(e);
        error = e.stack;
    }

    const log = {
        time: new Date().toLocaleString(),
        solution,
        error,
    };
    addLog(log);
    showLog(log);
}

/**
 * @param {Maze} maze
 * @param {Direction[]} solution
 * @returns {Promise<{error: string}>}
 */
function executeSolution(maze, solution) {
    if (solution == undefined) {
        return {
            error: '',
        };
    }

    if (
        !(solution instanceof Array) ||
        solution.some((d) => d in Object.values(Direction))
    ) {
        return {
            error: 'Return value must be an array of Directions',
        };
    }

    // TODO: Check and show path of solution
    try {
        const result = maze.showPath(solution);

        switch (result) {
            case 'blocked':
                return { error: 'Path is blocked' };
            case 'endMissed':
                return { error: 'Path does not arrive at the end point' };
            case 'endPassed':
                return { error: 'Path does not stop at the end point' };
            case 'loop':
                return { error: 'Path intersects itself' };
        }
    } catch (e) {
        console.error(e);
        return { error: e.stack };
    }

    return {};
}

function addLog(log) {
    const logs = JSON.parse(localStorage.getItem('logs'));
    logs.push(log);

    try {
        localStorage.setItem('logs', JSON.stringify(logs));
    } catch (error) {
        const logs = [log];
        localStorage.setItem('logs', JSON.stringify(logs));
    }
}

function showLog({ time, solution, error }) {
    const solutionString =
        solution instanceof Array
            ? solution.length > 0
                ? solution.join(' ')
                : '<i>Empty</i>'
            : solution;

    const logElement = document.createElement('div');
    logContainer.prepend(logElement);

    logElement.innerHTML = `
    <div class="time">${time}</div>
    <div class="output">Output: <span class="solution">${solutionString}</span></div>
    `;

    if (error != undefined) {
        logElement.innerHTML += `<pre class="error">${error}</pre>`;
    }
}
