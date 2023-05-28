const showGrid = document.getElementById('grid'),
    showIndex = document.getElementById('index'),
    newGenBtn = document.getElementById('newRandGen'),
    startBtn = document.getElementById('start'),
    stopBtn = document.getElementById('stop'),
    genCounter = document.getElementById('gen-counter'),
    canvas = document.getElementById('canvas'),
    print = canvas.getContext('2d');

let TILES = document.getElementById('tiles').valueAsNumber;
// let SPEED = document.getElementById('speed').valueAsNumber;

let ARRAY = [];

const randomizeArray = () => {
    const res = TILES * TILES
    const arr = Array.from({ length: res }, () => Math.round(Math.random() * 1))

    return arr
}

const printGrid = () => {
    const W = canvas.width - 0.5,
        H = canvas.height - 0.5,
        size = Math.floor(W / TILES);

    print.strokeStyle = '#c0dfe9'
    for (let i = 0.5; i <= W; i += size) {

        print.moveTo(i, 0)
        print.lineTo(i, H)
        // print.stroke()

        print.moveTo(0, i)
        print.lineTo(W, i)
        print.stroke()
    }
}

const neighbours = (i, gen) => {
    let neighbours = 0

    const X = i % TILES,
        Y = Math.floor(i / TILES);

    if (false) { // Highlight cell
        // highlight cell
        print.fillStyle = '#ff450060'
        print.fillRect(X * size, Y * size, size, size)
        // highlight neighbours area
        print.fillStyle = '#ffa60040'
        print.fillRect(X * size - size, Y * size - size, size * 3, size * 3)
    }

    //* TOP 
    if (Y - 1 >= 0) {
        const top = i - TILES
        // middle
        gen[top] && neighbours++
        // left
        if (X > 0) {
            gen[top - 1] && neighbours++
        }
        // right
        if (X < TILES - 1) {
            gen[top + 1] && neighbours++
        }
    }

    //? ROW
    // left
    if (X > 0) {
        gen[i - 1] && neighbours++
    }
    // right
    if (X < TILES - 1) {
        gen[i + 1] && neighbours++
    }

    //: BOTTOM
    if (Y + 1 < TILES - 1) {
        const bot = i + TILES
        // middle
        gen[bot] && neighbours++
        // left
        if (X > 0) {
            gen[bot - 1] && neighbours++
        }
        // right
        if (X < TILES - 1) {
            gen[bot + 1] && neighbours++
        }
    }

    // console.log(`${gen[i] ? 'Vivo' : 'Muerto'}, Vecinos: ${neighbours}`);
    return neighbours
}

const printGeneration = (generation) => {
    print.font = '16px Arial'
    print.textAlign = 'center'
    size = Math.floor(canvas.width / TILES);

    print.clearRect(0, 0, canvas.width, canvas.height)

    generation.forEach((cell, i) => {
        const X = i % TILES,
            Y = Math.floor(i / TILES);

        print.fillStyle = cell ? '#f0f0f0' : '#101010'
        print.fillRect(X * size, Y * size, size, size)

        // print index
        if (showIndex.checked) {
            print.fillStyle = '#555'
            print.fillText(i, X * size + size / 2, Y * size + size / 1.5)
        }
    });
}

let interval = null;

const stop = () => {
    clearInterval(interval)
}

const itsAlive = (firstGen) => {
    let oldGen = firstGen,
        oldGenPop = 0,
        newGen = [],
        gen = 1,
        bigger = {
            population: firstGen.filter(e => e).length,
            gen: 0
        };

    let SPEED = document.getElementById('speed').valueAsNumber;

    interval = setInterval(() => {
        // stats
        let population = 0,
            start = 0;

        // iterar generación
        oldGen.forEach((cell, i, arr) => {
            // start timer
            if (i === 0) start = Date.now()

            // saber canditad de vecinos
            const N = neighbours(i, arr),
                alive = Boolean(cell);

            // aplicar reglas y guardar nuevo estado
            if (alive) {
                if (N < 2) { //! poca población
                    newGen.push(0)
                } else if (N > 1 && N < 4) { //_ estable
                    newGen.push(1)
                    population += 1
                } else if (N > 3) { //! sobrepoblación                
                    newGen.push(0)
                }

            } else if (N === 3) { //* reproducción                
                newGen.push(1)
                population += 1

            } else { // muerta sin cambio
                newGen.push(0)
            }
        });

        if (population > 0) {
            // imprimir nuevo array
            oldGen = [...newGen]
            printGeneration(newGen)
            // reset nuevo array
            newGen = []

            // guardar stats
            if (population >= bigger.population) {
                bigger.population = population
                bigger.gen = gen
            }

            // mostrar info de la generación
            genCounter.innerText = `Generación Nº${gen} (pob.: ${population}) | ${Date.now() - start}ms`

            gen += 1
            oldGenPop = population
            population = 0

        } else {
            printGeneration(oldGen)
            stop()
            genCounter.innerText = `Generación final Nº ${gen - 1}, Población: ${oldGenPop}.
            Mayor población: ${bigger.population} (gen. Nº ${bigger.gen}) | ${Date.now() - start}ms`

            population = 0
        }

    }, SPEED);

}

const newRandom = () => {
    TILES = document.getElementById('tiles').valueAsNumber
    ARRAY = randomizeArray()
    printGeneration(ARRAY)
    showGrid.checked && printGrid()

    // mostrar info de la generación
    genCounter.innerText = `Generación Nº0 (pob.: ${ARRAY.filter(e => e).length})`
}

newRandom()

newGenBtn.addEventListener('mouseup', newRandom)

startBtn.addEventListener('mouseup', () => itsAlive(ARRAY))
stopBtn.addEventListener('mouseup', stop)
