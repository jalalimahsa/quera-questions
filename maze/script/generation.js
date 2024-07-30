import { Maze } from './maze.js';
import { Point } from './point.js';

const random = (minimum, maximum) =>
    Math.floor(Math.random() * (maximum - minimum)) + minimum;

const popRandom = (arr) => arr.splice(random(0, arr.length), 1)[0];

const range = (size, startAt = 0) => {
    return [...Array(size).keys()].map((i) => i + startAt);
};

/**
 * Generates a solvable maze
 * @param {Maze} maze
 */
export function generateMaze(maze) {
    maze.startPoint = undefined;
    maze.endPoint = undefined;
    for (let i = 0; i < maze.height; i++) {
        for (let j = 0; j < maze.width; j++) {
            maze.setBlocked(new Point(j, i), true);
        }
    }

    const width = maze.width - 2;
    const height = maze.width - 2;

    const isBlocked = (p) => maze.isBlocked(p.down.right);
    const carve = (p) => maze.setBlocked(p.down.right, false);

    const { startPoint, endPoint } = generateInnerMaze(
        width,
        height,
        isBlocked,
        carve,
    );
    maze.startPoint = startPoint.down.right;
    maze.endPoint = endPoint.down.right;
}

/**
 * Generate a block maze using the Wilson's algorithm
 * @param {number} width
 * @param {number} height
 * @param {(Point) => boolean} isBlocked
 * @param {() => void} carve
 * @returns
 */
function generateInnerMaze(width, height, isBlocked, carve) {
    const inMaze = (point) => !isBlocked(point);
    const inBounds = (p) => p.inBounds(width, height);

    {
        const RandomPointA = new Point(random(0, width), random(0, height));
        const RandomPointB = new Point(random(0, width), random(0, height));
        carve(RandomPointB);

        let path;
        do {
            path = generatePath(inMaze, inBounds, RandomPointA, width * height);
        } while (!path);

        path.forEach((p) => carve(p));
    }

    const gridPoints = range(width).flatMap((x) =>
        range(height).map((y) => new Point(x, y)),
    );

    const availablePoints = [...gridPoints];

    while (availablePoints.length > 0) {
        const randomPoint = popRandom(availablePoints);

        if (!isCarvable(randomPoint, inMaze, inBounds)) {
            continue;
        }

        const path = generatePath(
            inMaze,
            inBounds,
            randomPoint,
            width * height,
        );

        if (!path) continue;

        path.forEach((p) => carve(p));
    }

    let startPoint, endPoint;

    do {
        startPoint = new Point(random(0, width), random(0, height));
    } while (
        !inMaze(startPoint) ||
        startPoint.neighbors.filter((n) => inMaze(n)).length !== 1
    );

    do {
        endPoint = new Point(random(0, width), random(0, height));
    } while (
        !inMaze(endPoint) ||
        endPoint.neighbors.filter((n) => inMaze(n)).length !== 1 ||
        Math.abs(endPoint.x - startPoint.x) +
            Math.abs(endPoint.y - startPoint.y) <
            (width + height) / 2 - 2
    );

    return { startPoint, endPoint };
}

/**
 * @param {(Point) => boolean} inMaze
 * @param {(Point) => boolean} inBounds
 * @param {Point} point
 * @param {Point[]} ends
 * @param {number} limit
 * @returns {Point[] | false}
 */
function generatePath(inMaze, inBounds, point, limit = undefined) {
    const path = [point];

    for (let k = 0; limit === undefined || k < limit; k++) {
        const here = path.at(-1);
        const last = path.at(-2);

        const neighbors = here.neighbors;
        const extendedNeighbors = here.extendedNeighbors;

        // check for solution
        const inMazeNeighbors = neighbors.filter((n) => inMaze(n));
        if (inMazeNeighbors.length > 0) {
            return path;
        }

        // loop erasion
        let eraseLoop = false;
        for (let index = 0; index < path.length - 3; index++) {
            const visited = path[index];
            if (extendedNeighbors.some((n) => visited.equals(n))) {
                path.splice(index + 1);
                eraseLoop = true;
            }
        }
        if (eraseLoop) continue;

        // advance
        const availableNeighbors = neighbors.filter(
            (n) =>
                !n.equals(last) &&
                inBounds(n) &&
                isCarvable(n, inMaze, inBounds),
        );

        if (availableNeighbors.length === 0) {
            return false;
        }

        const nextPoint = popRandom(availableNeighbors);
        path.push(nextPoint);
    }

    return false;
}

/**
 * @param {Point} point
 * @param {(Point) => boolean} inMaze
 * @param {(Point) => boolean | undefined} inPath
 * @param {(Point) => boolean} inBounds
 * @param {Point[]} ends
 * @returns {boolean}
 */
function isCarvable(point, inMaze, inBounds) {
    if (!inBounds(point)) return false;

    if (!canBeAddedToPath(point, inMaze)) return false;

    return true;
}

/**
 * @param {Point} point
 * @param {(Point) => boolean} inPath
 * @returns {boolean}
 */
function canBeAddedToPath(point, inPath) {
    if (inPath(point)) return false;

    if (point.neighbors.filter((n) => inPath(n)).length > 1) {
        return false;
    }

    return point.diagonalNeighbors.every((d) => {
        if (inPath(d)) {
            return point.neighbors.some(
                (n) => inPath(n) && n.neighbors.some((nn) => d.equals(nn)),
            );
        }

        return true;
    });
}
