import { Direction } from './direction.js';
import { Point } from './point.js';
import { delay } from './utility.js';

const wallAttributeName = 'data-wall';
const startPointAttributeName = 'data-start';
const endPointAttributeName = 'data-end';
const validPointAttributeName = 'data-valid';
const invalidPointAttributeName = 'data-invalid';

export class Maze {
    #container;
    #width;
    #height;
    #walls;
    /**
     * @type {Point}
     */
    #startPoint;
    /**
     * @type {Point}
     */
    #endPoint;
    #pathShown = false;

    /**
     * @param {HTMLElement} container
     * @param {number} width
     * @param {number} height
     */
    constructor(container, width, height) {
        this.#container = container;
        this.#width = width;
        this.#height = height;
        this.#walls = new Array(width)
            .fill()
            .map(() => new Array(height).fill().map(() => false));
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }

    get startPoint() {
        return this.#startPoint;
    }

    set startPoint(value) {
        if (this.#startPoint) {
            this.#setCellAttribute(
                this.#startPoint,
                startPointAttributeName,
                false,
            );
        }
        this.#startPoint = value;
        this.hidePath();

        if (value) {
            this.#setCellAttribute(value, startPointAttributeName, true);
            this.setBlocked(value, false);
        }
    }

    get endPoint() {
        return this.#endPoint;
    }

    set endPoint(value) {
        if (this.#endPoint) {
            this.#setCellAttribute(
                this.#endPoint,
                endPointAttributeName,
                false,
            );
        }

        this.#endPoint = value;
        this.hidePath();

        if (value) {
            this.#setCellAttribute(value, endPointAttributeName, true);
            this.setBlocked(value, false);
        }
    }

    /**
     * @param {Point} point
     * @returns {boolean}
     */
    isBlocked(point) {
        if (!point.inBounds(this.#width, this.#height)) return true;

        return this.#walls[point.y][point.x];
    }

    /**
     * @param {Point} point
     * @param {boolean} isBlocked
     */
    setBlocked(point, isBlocked) {
        if (point.equals(this.#startPoint)) return;
        if (point.equals(this.#endPoint)) return;

        this.#walls[point.y][point.x] = isBlocked;

        this.#setCellAttribute(point, wallAttributeName, isBlocked);
        this.hidePath();
    }

    /**
     * @param {Point} point
     */
    toggleBlocked(point) {
        const isBlocked = this.isBlocked(point);
        this.setBlocked(point, !isBlocked);
    }

    initialize() {
        this.#container.innerHTML = '';

        for (let j = 0; j < this.#height; j++) {
            const rowElement = document.createElement('div');

            for (let i = 0; i < this.#width; i++) {
                const cellElement = this.#createCellElement(new Point(i, j));
                cellElement.style.setProperty('--i', i);
                rowElement.appendChild(cellElement);
            }

            rowElement.style.setProperty('--j', j);
            this.#container.appendChild(rowElement);
        }

        this.#container.oncontextmenu = (e) => e.preventDefault();
    }

    #color;

    #createCellElement(point) {
        const cellElement = document.createElement('button');

        /**
         * @param {MouseEvent | TouchEvent} e
         */
        const drawEventHandler = (e) => {
            if (e instanceof TouchEvent || e.buttons === 1) {
                this.setBlocked(point, this.#color);
                this.save();
            }
        };

        cellElement.onmousedown = (e) => {
            this.#color = !this.isBlocked(point);
            drawEventHandler(e);
        };
        cellElement.onmouseenter = drawEventHandler;

        cellElement.ontouchstart = (e) => {
            this.#color = !this.isBlocked(point);
            drawEventHandler(e);
        };
        cellElement.ontouchmove = drawEventHandler;
        cellElement.ontouchend = () => this.setBlocked(point, !this.#color);

        return cellElement;
    }

    /**
     * @param {Point} point
     * @param {string} attrName
     * @param {any} attrValue
     */
    #setCellAttribute(point, attrName, attrValue) {
        const node = this.#container.childNodes[point.y].childNodes[point.x];

        if (attrValue == undefined || attrValue === false) {
            node.removeAttribute(attrName);
            return;
        }

        if (attrValue === true) {
            node.setAttribute(attrName, '');
            return;
        }

        node.setAttribute(attrName, attrValue);
    }

    /**
     * @returns {string}
     */
    export() {
        let str = `${this.width}x${this.height}\n`;

        for (let j = 0; j < this.height; j++) {
            for (let i = 0; i < this.width; i++) {
                const point = new Point(i, j);

                if (this.isBlocked(point)) {
                    str += 'w';
                } else if (this.startPoint.equals(point)) {
                    str += 'o';
                } else if (this.endPoint.equals(point)) {
                    str += 'x';
                } else {
                    str += ' ';
                }
            }
            str += '\n';
        }

        return str;
    }

    /**
     * @param {string} str
     */
    import(str) {
        const [sizeStr, ...rowStrs] = str.split('\n');

        const size = sizeStr.split('x');
        this.#width = parseInt(size[0]);
        this.#height = parseInt(size[1]);

        this.#walls = new Array(this.#width)
            .fill()
            .map(() => new Array(this.#height).fill().map(() => false));

        this.initialize();

        for (let j = 0; j < this.height; j++) {
            const rowStr = rowStrs[j];

            for (let i = 0; i < this.width; i++) {
                const cell = rowStr[i];
                const point = new Point(i, j);

                switch (cell) {
                    case 'w':
                        this.setBlocked(point, true);
                        break;
                    case ' ':
                        this.setBlocked(point, false);
                        break;
                    case 'o':
                        this.startPoint = point;
                        break;
                    case 'x':
                        this.endPoint = point;
                        break;
                }
            }
        }
    }

    save() {
        const str = this.export();
        localStorage.setItem('maze', str);
    }

    load() {
        const str = localStorage.getItem('maze');
        this.import(str);
    }

    get hasSaved() {
        return localStorage.getItem('maze') !== null;
    }

    /**
     * @param {Direction[]} path
     * @returns {Promise<'blocked' | 'endMissed' | 'endPassed' | 'loop' | 'valid'>}
     */
    showPath(path) {
        this.#pathShown = true;

        this.#setCellAttribute(this.startPoint, validPointAttributeName, true);;

        let point = this.startPoint;
        let endReached = false;
        const visited = [];

        for (const dir of path) {
            try {
                point = point.move(dir);
            } catch (e) {
                this.#setCellAttribute(point, invalidPointAttributeName, true);
                throw e;
            }

            if (this.isBlocked(point)) {
                this.#setCellAttribute(point, invalidPointAttributeName, true);
                return 'blocked';
            }

            if (visited.some((v) => point.equals(v))) {
                this.#setCellAttribute(point, invalidPointAttributeName, true);
                return 'loop';
            }

            if (this.endPoint.equals(point)) {
                endReached = true;
            }

            visited.push(point);

            this.#setCellAttribute(point, validPointAttributeName, true);
        }

        if (this.endPoint.equals(point)) {
            return 'valid';
        }

        this.#setCellAttribute(point, validPointAttributeName, false);
        this.#setCellAttribute(point, invalidPointAttributeName, true);

        return endReached ? 'endPassed' : 'endMissed';
    }

    hidePath() {
        if (!this.#pathShown) return;

        for (let j = 0; j < this.height; j++) {
            for (let i = 0; i < this.width; i++) {
                const point = new Point(i, j);
                this.#setCellAttribute(point, validPointAttributeName, false);
                this.#setCellAttribute(point, invalidPointAttributeName, false);
            }
        }

        this.#pathShown = false;
    }
}
