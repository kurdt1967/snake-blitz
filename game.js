
export function findPathAStar(start, goal, gridSize, snake, obstacles) {
    // array to keep track of grid cells that needs to be evaluated
    const openSet = [];

    // a key value pair to keep track where each grid cells came from
    const cameFrom = new Map();

    // object that stores the cost of the shortest path found so far to grid cells
    const gScore = {};

    // object that stores the estimated total cost of a path through each node, combining the actual cost (gScore) and the heuristic (estimated distance to the goal).
    const fScore = {};

    // create a unique identifier for a grid cell based on its coordinates
    const indexKey = (x, y) => `${x},${y}`;

    // initializing the score
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            // initialize to infinity since the shortest path is unknown at the start
            gScore[indexKey(x, y)] = Infinity;
            fScore[indexKey(x, y)] = Infinity;
        }
    }

    const isWalkable = (x, y) => {
        return (
            // ensures that the path is within bounds
            x >= 0 && y >= 0 &&
            x < gridSize && y < gridSize &&
            // ensures that the path avoids the snake body and obstacles
            !snake.some(segment => segment.x === x && segment.y === y) &&
            !obstacles.some(obstacle => obstacle.x === x && obstacle.y === y)
        );
    };

    // estimates the distance from the current head to the food
    const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    // sets the cost of reaching the start grid cell to 0
    gScore[indexKey(start.x, start.y)] = 0;
    fScore[indexKey(start.x, start.y)] = heuristic(start, goal); // this is all heuristic because no grid cells have been traversed yet

    openSet.push(start);

    // main processing of the A* algorithm
    while (openSet.length > 0) {

        // the openSet is sorted prioritizing the lowest  estimated cost
        openSet.sort((a, b) => fScore[indexKey(a.x, a.y)] - fScore[indexKey(b.x, b.y)]);
        // lowest fscore is removed from the openSet and becomes the node to be processed
        const current = openSet.shift();

        // current node is the goal, then pathfiniding is complete
        if (current.x === goal.x && current.y === goal.y) {
            // reconstruct the path from start to current grid cell by following the cameFrom map
            let path = [];
            let temp = indexKey(current.x, current.y);

            while (cameFrom.has(temp)) {
                const [x, y] = temp.split(',').map(Number);
                path.unshift({ x, y });
                temp = cameFrom.get(temp);
            }
            return path;
        }

        // generate the neighbors of the current grid cell (up, down, left ,right)
        const neighbors = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 }
        ];

        for (const neighbor of neighbors) {
            // skip neighbors that are out of bounds, part of the snake, or blocked by obstacles
            if (!isWalkable(neighbor.x, neighbor.y)) continue;

            // calculates the tentative cost of reaching the neighbor from the start via the current node.
            const tentativeGScore = gScore[indexKey(current.x, current.y)] + 1;

            if (tentativeGScore < gScore[indexKey(neighbor.x, neighbor.y)]) {
                cameFrom.set(indexKey(neighbor.x, neighbor.y), indexKey(current.x, current.y));
                gScore[indexKey(neighbor.x, neighbor.y)] = tentativeGScore;
                fScore[indexKey(neighbor.x, neighbor.y)] = tentativeGScore + heuristic(neighbor, goal);

                if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
                    // add new neighbor to openSet
                    openSet.push(neighbor);
                }
            }
        }
        // if the loop ended, that means openSet is empty and cant find any new path to the goal anymore
    }

    return []; // no path found
}
