'use strict';

// console.log("Hello world!");

function randomInt(n) {
    return Math.floor(Math.random() * n);
}

class State {
    constructor(n) {
        this.n = n;
        this.buildLattice();
        this.initState();
        this.setPhysicalParameters();
        // this.initHorizontalState();
        this.initContainer();
        // this.container = $("#lattice");

        // this.changedBonds = [];
        // console.log(this.valid());
        this.isValid = this.valid();
        this.FPNum = this.countFP();
        this.repaint();

        // this.flip(0, 0);
        // this.repaint();
        // console.log(this.hDimer);
        // console.log("FP =", this.FPNum);
    }

    setPhysicalParameters(V = "-1", T = "inf") {
        if (T == "inf") {
            this.beta = 0.0; // infinite T
            this.infBeta = false;
        } else {
            let TVal = parseFloat(T);
            if (TVal < 1e-8) {
                this.infBeta = true;
            } else {
                this.infBeta = false;
                this.beta = 1.0 / TVal;
            }
        }
        this.V = parseFloat(V);

        this.showPhysicalParameters();
    }
    getTemperature() {
        if (this.infBeta) {
            return 0.0;
        } else if (this.beta < 1e-8) {
            return "inf";
        } else {
            return 1.0 / this.beta;
        }
    }
    showPhysicalParameters() {
        document.getElementById('V-input').value = this.V;
        document.getElementById('T-input').value = this.getTemperature();
    }

    buildLattice() {
        let n = this.n;
        this.hDimer = new Array(n);
        this.vDimer = new Array(n);
        for (let i = 0; i < n; ++i) {
            this.hDimer[i] = new Array(n).fill(0);
        }
        for (let i = 0; i < n; ++i) {
            this.vDimer[i] = new Array(n).fill(0);
        }
    }

    setToZero() {
        for (let x = 0; x < this.n; ++x) {
            for (let y = 0; y < this.n; ++y) {
                this.vDimer[x][y] = 0;
                this.hDimer[x][y] = 0;
            }
        }
    }

    initState() {
        this.setToZero();
        let n = this.n;
        for (let i = 0; i < n; ++i) {
            if (i % 2 == 0) {
                this.vDimer[i].fill(1);

            }
        }
    }

    initHorizontalState() {
        this.setToZero();
        let n = this.n;
        for (let i = 0; i < n; ++i) {
            for (let j = 0; j < n; ++j) {
                if (j % 2 == 0) {
                    this.hDimer[i][j] = 1;
                }
            }
        }
    }

    appendFlipper(plaq, x, y) {
        let flipperFuncs = () => { this.flip(x, y); this.repaint();};
        let button = document.createElement("button");
        button.classList.add('flip-button');
        button.addEventListener("click", flipperFuncs);
        plaq.appendChild(button);
    }

    appendBonds() {
        let n = this.n;
        this.vBonds = new Array(n);
        for (let i = 0; i < this.n; ++i) {
            this.vBonds[i] = new Array(n + 1);
            for (let j = 0; j <= this.n; ++j) {
                let bond = document.createElement("div");
                bond.style.gridRowStart = `${2 * i + 2}`;
                bond.style.gridColumnStart = `${2 * j + 1}`;
                // console.log(bond);
                bond.classList.add("vertical-bond");
                bond.style.height = `${this.gridS}px`;
                if (this.vDimer[i][j % this.n]) {
                    bond.classList.add("vertical-bond-active");
                }
                this.vBonds[i][j] = bond;
                // vDimers
                this.container.appendChild(bond);
            }
        }
        this.hBonds = new Array(n + 1);
        for (let i = 0; i <= this.n; ++i) {
            this.hBonds[i] = new Array(n);
            for (let j = 0; j < this.n; ++j) {
                let bond = document.createElement("div");
                bond.style.gridRowStart = `${2 * i + 1}`;
                bond.style.gridColumnStart = `${2 * j + 2}`;
                bond.classList.add("horizontal-bond");
                bond.style.width = `${this.gridS}px`;
                if (this.hDimer[i % this.n][j]) {
                    bond.classList.add("horizontal-bond-active");
                }
                this.hBonds[i][j] = bond;
                // vDimers
                this.container.appendChild(bond);
            }
        }
    }

    appendPlaquettes() {
        let n = this.n;
        this.plaquettes = new Array(n);
        for (let i = 0; i < this.n; ++i) {
            this.plaquettes[i] = new Array(n);
            for (let j = 0; j < this.n; ++j) {
                let plaquette = document.createElement("div");
                plaquette.style.gridRowStart = `${2 * i + 2}`;
                plaquette.style.gridColumnStart = `${2 * j + 2}`;
                plaquette.classList.add('plaquette');

                this.container.appendChild(plaquette);
                this.plaquettes[i][j] = plaquette;
                this.appendFlipper(plaquette, i, j);
            }
        }
    }

    initContainer() {
        this.container = document.getElementById("lattice");
        // console.log(this.container);
        this.gridS = 60;
        this.container.style.gridTemplateColumns = `1px repeat(${this.n}, ${this.gridS}px 1px)`
        this.container.style.gridTemplateRows = `1px repeat(${this.n}, ${this.gridS}px 1px)`
        let width = (this.gridS + 1) * this.n + 3;
        let height = (this.gridS + 1) * this.n + 3;
        this.container.style.width = `${width}px`;
        this.container.style.height = `${height}px`;

        this.appendBonds();
        this.appendPlaquettes();
    }
    getBondIdx(direct, x, y) {
        return direct * (this.n * this.n) + this.mod(x) * this.n + this.mod(y);
    }
    repaint() {
        // this.changedBonds = Array.from(new Set(this.changedBonds));
        // console.log(this.changedBonds);
        let n = this.n;
        // let direct, x, y;
        // for (let idx of this.changedBonds) {
        //     direct = Math.round(idx / (n * n));
        //     idx %= (n * n);
        //     x = Math.round(idx / n);
        //     idx %= n;
        //     y = idx;
        for (let direct = 0; direct < 2; ++direct) {
            for (let x = 0; x < n; ++x) {
                for (let y = 0; y < n; ++y) {
                    if (direct == 0) {
                        // vertical
                        if (this.getVDimer(x, y)) {
                            this.vBonds[x][y].classList.add('vertical-bond-active');
                            if (y == 0) {
                                this.vBonds[x][n].classList.add('vertical-bond-active');
                            }
                        } else {
                            this.vBonds[x][y].classList.remove('vertical-bond-active');
                            if (y == 0) {
                                this.vBonds[x][n].classList.remove('vertical-bond-active');
                            }
                        }
                    } else {
                        // horizontal
                        if (this.getHDimer(x, y)) {
                            // console.log("add");
                            this.hBonds[x][y].classList.add('horizontal-bond-active');
                            if (x == 0) {
                                this.hBonds[n][y].classList.add('horizontal-bond-active');
                            }
                        } else {
                            // console.log('remove');
                            this.hBonds[x][y].classList.remove('horizontal-bond-active');
                            if (x == 0) {
                                this.hBonds[n][y].classList.remove('horizontal-bond-active');
                            }
                        }
                    }
                }
            }
        }

        for (let x = 0; x < n; ++x) {
            for (let y = 0; y < n; ++y) {
                if (this.isFlippable(x, y)) {
                    this.plaquettes[x][y].firstChild.style.display = "";
                } else {
                    this.plaquettes[x][y].firstChild.style.display = "none";
                }
            }
        }

        // this.changedBonds = [];
        this.FPNum = this.countFP();
        this.isValid = this.valid();
        let FPElem = document.getElementById("FP-count");
        FPElem.innerHTML = `FP: ${this.FPNum}`;
        let wanringElem = document.getElementById("invalid-warning");
        if (!this.isValid) {
            wanringElem.innerHTML = "Invalid!";
        }

    }

    mod(x) {
        return ((x % this.n) + this.n) % this.n;
    }

    getVDimer(x, y) {
        return this.vDimer[this.mod(x)][this.mod(y)];
    }
    getHDimer(x, y) {
        return this.hDimer[this.mod(x)][this.mod(y)];
    }
    flipVDimer(x, y) {
        // this.changedBonds.push(this.getBondIdx(0, x, y));
        let state = this.vDimer[this.mod(x)][this.mod(y)];
        this.vDimer[this.mod(x)][this.mod(y)] = !state;
    }
    flipHDimer(x, y) {
        // this.changedBonds.push(this.getBondIdx(1, x, y));
        let state = this.hDimer[this.mod(x)][this.mod(y)];
        this.hDimer[this.mod(x)][this.mod(y)] = !state;
    }

    degree(x, y) {
        let res = 0;
        if (this.getVDimer(x, y)) {
            res += 1;
        }
        if (this.getVDimer(x - 1, y)) {
            res += 1;
        }
        if (this.getHDimer(x, y)) {
            res += 1;
        }
        if (this.getHDimer(x, y - 1)) {
            res += 1;
        }
        return res;
    }

    valid() {
        for (let x = 0; x < this.n; ++x) {
            for (let y = 0; y < this.n; ++y) {
                // console.log(this.degree(x, y));
                if (this.degree(x, y) != 1) {
                    return false;
                }
            }
        }
        return true;
    }

    isFlippable(x, y) {
        let topX = x, bottomX = x + 1;
        let topDimer = this.getHDimer(topX, y), bottomDimer = this.getHDimer(bottomX, y);
        if (topDimer && bottomDimer) {
            return true;
        }

        let leftY = y, rightY = y + 1;
        let leftDimer = this.getVDimer(x, leftY), rightDimer = this.getVDimer(x, rightY);
        if (leftDimer && rightDimer) {
            return true;
        }
    }

    countFP() {
        let res = 0;
        for (let x = 0; x < this.n; ++x) {
            for (let y = 0; y < this.n; ++y) {
                if (this.isFlippable(x, y)) {
                    res += 1;
                }
            }
        }
        return res;
    }
    flip(x, y) {
        if (!this.isFlippable(x, y)) {
            return ;
        }
        let topX = x, bottomX = x + 1;
        this.flipHDimer(topX, y); this.flipHDimer(bottomX, y);

        let leftY = y, rightY = y + 1;
        this.flipVDimer(x, leftY); this.flipVDimer(x, rightY);
    }
    clearElements() {
        let n = this.n;
        for (let x = 0; x < n; ++x) {
            for (let y = 0; y < n; ++y) {
                this.plaquettes[x][y].firstChild.remove();
                this.plaquettes[x][y].remove();
            }
        }
        for (let x = 0; x < this.vBonds.length; ++x) {
            for (let y = 0; y < this.vBonds[0].length; ++y) {
                this.vBonds[x][y].remove();
            }
        }
        for (let x = 0; x < this.hBonds.length; ++x) {
            for (let y = 0; y < this.hBonds[0].length; ++y) {
                this.hBonds[x][y].remove();
            }
        }
    }

    pushToQueue(x, y) {
        x = this.mod(x); y = this.mod(y);
        this.queue.push({'x': x, 'y': y});
        this.siteIndexInQueue[x][y] = this.queue.length - 1;
    }

    getNextCoord(x, y, nextDimer) {
        let xx = 0, yy = 0;
        if (nextDimer) {
            if (this.getHDimer(x, y)) {
                xx = x; yy = this.mod(y + 1);
            } else if (this.getHDimer(x, y - 1)) {
                xx = x; yy = this.mod(y - 1);
            } else if (this.getVDimer(x, y)) {
                xx = this.mod(x + 1); yy = y;
            } else if (this.getVDimer(x - 1, y)) {
                xx = this.mod(x - 1); yy = y;
            } else {
                console.log(`Error: site (${x}. ${y}) does not linke to a dimer.`);
            }
        } else {
            let choices = [];
            if (!this.getHDimer(x, y)) {
                choices.push([x, this.mod(y + 1)]);
            } 
            if (!this.getHDimer(x, y - 1)) {
                choices.push([x, this.mod(y - 1)]);
            } 
            if (!this.getVDimer(x, y)) {
                choices.push([this.mod(x + 1), y]);
            } 
            if (!this.getVDimer(x - 1, y)) {
                choices.push([this.mod(x - 1), y]);
            }
            let idx = randomInt(choices.length);
            xx = choices[idx][0]; yy = choices[idx][1];
        }
        return {'x': xx, 'y': yy};
    }

    flipBondBetween(x1, y1, x2, y2) {
        if (x1 == x2) {
            if (this.mod(y1 + 1) == y2) {
                this.flipHDimer(x1, y1);
            } else {
                this.flipHDimer(x1, y2);
            }
        } else if (y1 == y2) {
            if (this.mod(x1 + 1) == x2) {
                this.flipVDimer(x1, y1);
            } else {
                this.flipVDimer(x2, y1);
            }
        } else {
            console.log(`Error in flipBondBetween: (${x1}, ${y1}) and (${x2}, ${y2}) are not neighbors.`);
        }
    }

    loopFlip(startIndex) {
        for (let i = startIndex; i < this.queue.length - 1; ++i) {
            // console.log(this.queue[i], this.queue[i + 1]);
            this.flipBondBetween(this.queue[i]['x'], this.queue[i]['y'], this.queue[i + 1]['x'], this.queue[i + 1]['y']);
        }
        let qn = this.queue.length;
        this.flipBondBetween(this.queue[qn - 1]['x'], this.queue[qn - 1]['y'], this.queue[startIndex]['x'], this.queue[startIndex]['y']);
    }

    decideAccept(oldFP, newFP) {
        if (this.infBeta) {
            // if (V > 0) : reject increase, accept decrease(and no change)
            if (this.V > 0) {
                return (newFP <= oldFP);
            } else {
                return (newFP >= oldFP);
            }
        } else {
            let deltaE = this.V * (newFP - oldFP);
            let poss = Math.exp(-this.beta * deltaE);
            // console.log("poss =", poss);
            // console.log(`oldFP = ${oldFP}, newFP = ${newFP}, deltaE = ${deltaE}`);
            return Math.random() < poss;
        }
    }

    directLoop() {
        // console.log(this);
        if (!this.siteIndexInQueue) {
            this.siteIndexInQueue = Array(this.n);
            for (let i = 0; i < this.n; ++i) {
                this.siteIndexInQueue[i] = Array(this.n);
                for (let j = 0; j < this.n; ++j) {
                    this.siteIndexInQueue[i][j] = -1;
                }
            }
        }
        this.queue = [];
        let oldFP = this.countFP();
        let sx = randomInt(this.n), sy = randomInt(this.n);
        let cx = sx, cy = sy;
        let nextDimer = true;
        do {
            this.pushToQueue(cx, cy);
            let nextCoord = this.getNextCoord(cx, cy, nextDimer);
            cx = nextCoord['x']; cy = nextCoord['y'];
            nextDimer = !nextDimer;
        } while (this.siteIndexInQueue[cx][cy] == -1); 
        // console.log("queue,", this.queue);
        let startIndex = this.siteIndexInQueue[cx][cy];
        this.loopFlip(startIndex);
        let newFP = this.countFP();
        if (!this.decideAccept(oldFP, newFP)) {
            this.loopFlip(startIndex);
        }
        for (let i = 0; i < this.queue.length; ++i) {
            this.siteIndexInQueue[this.queue[i]['x']][this.queue[i]['y']] = -1;
        }
        this.repaint();
    }
}

function initDimerState(n) {
    // a dimer lattice of size 2n
    let state = new State(2 * n);
    // console.log(state.hDimer);
    // console.log(state.vDimer);
    // console.log(state.container);
    return state;
}

let state = initDimerState(4);

function sizeWarning(message) {
    let sizeWarning = document.getElementById("size-warning");
    sizeWarning.innerHTML = message;
}

function resize(n) {
    if (n % 2 != 0) {
        sizeWarning("Error: size must be even!");
    } else {
        sizeWarning("");
        state.clearElements();
        state = new State(n);
    }
}

let resetButton = document.getElementById("reset");
resetButton.addEventListener("click", () => {
    state.initState();
    state.repaint();
});

let resizeButton = document.getElementById("resize");
resizeButton.addEventListener("click", () => {
    let newSize = document.getElementById("size-input").value;
    newSize = parseInt(newSize);
    if (isNaN(newSize)) {
        sizeWarning("Error: input is not an even integer");
        return ;
    }
    if (newSize == state.n) {
        sizeWarning("Warning: size is not changed.");
        // state.initState();
        // state.repaint();
    } else {
        resize(newSize);
    }
});

let directLoopButton = document.getElementById("direct-loop");
directLoopButton.addEventListener("click", () => {
    state.directLoop();
});

let physicalSubmitButton = document.getElementById("physical");
physicalSubmitButton.addEventListener("click", () => {
    let V = document.getElementById("V-input").value;
    let T = document.getElementById("T-input").value;
    state.setPhysicalParameters(V, T);
})

// console.log($("#lattice"));

// plaquettes as elements, dimers as boundary
// under grid or table?
// first consider grid