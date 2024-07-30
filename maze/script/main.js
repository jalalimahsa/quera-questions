import { executeSolver, showExecutions } from './execution.js';
import { generateMaze } from './generation.js';
import { Maze } from './maze.js';
import { delay } from './utility.js';


const mazeContainer = document.getElementById('mazeContainer');
const maze = new Maze(mazeContainer, 18, 18);

let executing = false;

async function handleMazeGeneration() {
    if (executing) return;
    mazeContainer.classList.add('generating');

    generateMaze(maze);
    maze.save();

    await delay((maze.height + 1) * 0.025 + 0.2);
    mazeContainer.classList.remove('generating');
}

document.getElementById('generateButton').onclick = () =>
    handleMazeGeneration();

// document.getElementById('solveButton').onclick = async () => {
//     if (executing) return;
//     executing = true;

//     try {
//         maze.hidePath();
//         await delay(0.05);
//         await executeSolver(maze);
//     } finally {
//         executing = false;
//     }
// };

document.getElementById('solveButton').onclick = () => {
    executeSolver(maze);
    executing = false;
};


showExecutions();

if (maze.hasSaved) {
    try {
        maze.load();
    } catch (e) {
        console.error(e);

        maze.initialize();
        generateMaze(maze);
        maze.save();
    }
} else {
    maze.initialize();
    generateMaze(maze);
    maze.save();
}
