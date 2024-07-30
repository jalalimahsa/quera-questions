import { Direction } from './direction.js';

export class Point {
    /**
     * Creates a point from the provided coordinates
     * @param {number} x The x coordinate
     * @param {number} y The y coordinate
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Returns true if the x and y coordinates are equal, otherwise false
     * @param {Point} other
     * @returns {boolean}
     */
    equals(other) {
        return !!other && this.x === other.x && this.y === other.y;
    }

    get left() {
        return new Point(this.x - 1, this.y);
    }

    get right() {
        return new Point(this.x + 1, this.y);
    }

    get up() {
        return new Point(this.x, this.y - 1);
    }

    get down() {
        return new Point(this.x, this.y + 1);
    }

    /**
     * Get the 4 direct neighbors around this point
     * @returns {Point[]}
     */
    get neighbors() {
        return [this.left, this.up, this.right, this.down];
    }

    /**
     * Get the 4 diagonal neighbors around this point
     * @returns {Point[]}
     */
    get diagonalNeighbors() {
        return [this.left.down, this.left.up, this.right.up, this.right.down];
    }

    /**
     * Get the 8 direct and diagonal neighbors around this point
     * @returns {Point[]}
     */
    get extendedNeighbors() {
        return [...this.neighbors, ...this.diagonalNeighbors];
    }

    /**
     * @param {number} width
     * @param {number} height
     * @returns {boolean}
     */
    inBounds(width, height) {
        return this.x >= 0 && this.x < width && this.y >= 0 && this.y < height;
    }

    /**
     * Returns the neighboring point on the provided direction
     * @param {Direction} direction
     * @returns {Point}
     */
    move(direction) {
        switch (direction) {
            case Direction.UP:
                return this.up;
            case Direction.DOWN:
                return this.down;
            case Direction.LEFT:
                return this.left;
            case Direction.RIGHT:
                return this.right;
        }

        throw new Error(`Invalid direction ${direction}`);
    }
}
