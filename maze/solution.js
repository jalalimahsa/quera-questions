import { Direction } from './script/direction.js';
import { Maze } from './script/maze.js';
import { Point } from './script/point.js';

/**
 * @param {Maze} maze
 * @returns {Direction[]}
 */
export function solveMaze(maze) {
    const queue = [[maze.startPoint]];
    const visited = new Set([maze.startPoint.x + ',' + maze.startPoint.y]);
    const parentMap = new Map();

    while (queue.length > 0) {
        const path = queue.shift();
        const currentPoint = path[path.length - 1];

        if (currentPoint.equals(maze.endPoint)) {
            return reconstructPath(parentMap, maze.startPoint, maze.endPoint);
        }

        const directions = [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT];

        for (const direction of directions) {
            const nextPoint = currentPoint.move(direction);
            const key = nextPoint.x + ',' + nextPoint.y;

            if (!visited.has(key) && !maze.isBlocked(nextPoint)) {
                visited.add(key);
                queue.push([...path, nextPoint]);
                parentMap.set(key, { point: currentPoint, direction });
            }
        }
    }

    return []; 
}

function reconstructPath(parentMap, start, end) {
    const path = [];
    let current = end;

    while (!current.equals(start)) {
        const key = current.x + ',' + current.y;
        const { point, direction } = parentMap.get(key);
        path.unshift(direction);
        current = point;
    }

    return path;
}