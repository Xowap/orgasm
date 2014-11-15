/*globals angular*/

(function (ng) {
    'use strict';

    var Munkres,
        hungarian = ng.module('hungarian', []);

    Munkres = function Munkres() {
            // Private vars
        var self = this,

            // Methods
            makePaddingArray,
            padMatrix,
            compute,
            makeMatrix,
            clearCovers,
            findAZero,
            findStarInRow,
            findStarInCol,
            findPrimeInRow,
            findSmallest,
            convertPath,
            erasePrimes,
            step1,
            step2,
            step3,
            step4,
            step5,
            step6;

        // Method bodies
        makePaddingArray = function (length, paddingValue) {
            var output = [], i;

            for (i = 0; i < length; i += 1) {
                output[i] = paddingValue;
            }

            return output;
        };

        padMatrix = function (matrix, padValue) {
            var i,
                row,
                rowLen,
                newRow,
                maxColumns = 0,
                totalRows = matrix.length,
                newMatrix = [];

            if (padValue === undefined) {
                padValue = 0;
            }

            for (i = 0; i < matrix.length; i += 1) {
                maxColumns = Math.max(maxColumns, matrix[i].length);
            }

            totalRows = Math.max(maxColumns, totalRows);

            for (i = 0; i < matrix.length; i += 1) {
                row = matrix[i];
                rowLen = row.length;
                newRow = ng.copy(row);

                if (totalRows > rowLen) {
                    newRow.push.apply(newRow, makePaddingArray(totalRows - rowLen, padValue));
                }

                newMatrix.push(newRow);
            }

            while (newMatrix.length < totalRows) {
                newMatrix.push(makePaddingArray(totalRows, padValue));
            }

            return newMatrix;
        };

        compute = function (costMatrix) {
            var step = 1,
                steps = {
                    1: step1,
                    2: step2,
                    3: step3,
                    4: step4,
                    5: step5,
                    6: step6
                },
                results = [],
                i,
                j;

            self.c = padMatrix(costMatrix);
            self.n = self.c.length;
            self.originalLength = costMatrix.length;
            self.originalWidth = costMatrix[0].length;
            self.rowCovered = makePaddingArray(self.n, false);
            self.colCovered = makePaddingArray(self.n, false);
            self.z0R = 0;
            self.z0C = 0;
            self.path = makeMatrix(self.n * 2, 0);
            self.marked = makeMatrix(self.n, 0);

            while (steps[step] !== undefined) {
                step = steps[step]();
            }

            for (i = 0; i < self.originalLength; i += 1) {
                for (j = 0; j < self.originalWidth; j += 1) {
                    if (self.marked[i][j] === 1) {
                        results.push([i, j]);
                    }
                }
            }

            return results;
        };

        makeMatrix = function (n, val) {
            var matrix = [],
                i;

            for (i = 0; i < n; i += 1) {
                matrix.push(makePaddingArray(n, val));
            }

            return matrix;
        };

        step1 = function () {
            var c = self.c,
                n = self.n,
                i,
                j,
                minval;

            for (i = 0; i < n; i += 1) {
                minval = Math.min.apply(null, c[i]);

                for (j = 0; j < n; j += 1) {
                    self.c[i][j] -= minval;
                }
            }

            return 2;
        };

        step2 = function () {
            var n = self.n,
                i,
                j;

            for (i = 0; i < n; i += 1) {
                for (j = 0; j < n; j += 1) {
                    if (self.c[i][j] === 0
                            && (!self.colCovered[j])
                            && (!self.rowCovered[i])) {
                        self.marked[i][j] = 1;
                        self.colCovered[j] = true;
                        self.rowCovered[i] = true;
                    }
                }
            }

            clearCovers();

            return 3;
        };

        step3 = function () {
            var n = self.n,
                count = 0,
                i,
                j;

            for (i = 0; i < n; i += 1) {
                for (j = 0; j < n; j += 1) {
                    if (self.marked[i][j] === 1) {
                        self.colCovered[j] = true;
                        count += 1;
                    }
                }
            }

            if (count >= n) {
                return 7;
            }

            return 4;
        };

        step4 = function () {
            var step = 0,
                done = false,
                row = -1,
                col = -1,
                starCol = -1,
                buf;

            while (!done) {
                buf = findAZero();
                row = buf[0];
                col = buf[1];

                if (row < 0) {
                    done = true;
                    step = 6;
                } else {
                    self.marked[row][col] = 2;
                    starCol = findStarInRow(row);

                    if (starCol >= 0) {
                        col = starCol;
                        self.rowCovered[row] = true;
                        self.colCovered[col] = false;
                    } else {
                        done = true;
                        self.z0R = row;
                        self.z0C = col;
                        step = 5;
                    }
                }
            }

            return step;
        };

        step5 = function () {
            var count = 0,
                path = self.path,
                done = false,
                row,
                col;

            path[count][0] = self.z0R;
            path[count][1] = self.z0C;

            while (!done) {
                row = findStarInCol(path[count][1]);

                if (row >= 0) {
                    count += 1;
                    path[count][0] = row;
                    path[count][1] = path[count - 1][1];
                } else {
                    done = true;
                }

                if (!done) {
                    col = findPrimeInRow(path[count][0]);
                    count += 1;
                    path[count][0] = path[count - 1][0];
                    path[count][1] = col;
                }
            }

            convertPath(path, count);
            clearCovers();
            erasePrimes();

            return 3;
        };

        step6 = function () {
            var minval = findSmallest(),
                i,
                j;

            for (i = 0; i < self.n; i += 1) {
                for (j = 0; j < self.n; j += 1) {
                    if (self.rowCovered[i]) {
                        self.c[i][j] += minval;
                    }

                    if (!self.colCovered[j]) {
                        self.c[i][j] -= minval;
                    }
                }
            }

            return 4;
        };

        findSmallest = function () {
            var minval = Number.MAX_VALUE,
                i,
                j;

            for (i = 0; i < self.n; i += 1) {
                for (j = 0; j < self.n; j += 1) {
                    if (!self.rowCovered[i] && !self.colCovered[j]) {
                        if (minval > self.c[i][j]) {
                            minval = self.c[i][j];
                        }
                    }
                }
            }

            return minval;
        };

        findAZero = function () {
            var row = -1,
                col = -1,
                i = 0,
                j,
                n = self.n,
                done = false;

            while (!done) {
                j = 0;

                while (true) {
                    if (self.c[i][j] === 0
                            && !self.rowCovered[i]
                            && !self.colCovered[j]) {
                        row = i;
                        col = j;
                        done = true;
                    }

                    j += 1;

                    if (j >= n) {
                        break;
                    }
                }

                i += 1;

                if (i >= n) {
                    done = true;
                }
            }

            return [row, col];
        };

        findStarInRow = function (row) {
            var col = -1,
                j;

            for (j = 0; j < self.n; j += 1) {
                if (self.marked[row][j] === 1) {
                    col = j;
                    break;
                }
            }

            return col;
        };

        findStarInCol = function (col) {
            var row = -1,
                i;

            for (i = 0; i < self.n; i += 1) {
                if (self.marked[i][col] === 1) {
                    row = i;
                    break;
                }
            }

            return row;
        };

        findPrimeInRow = function (row) {
            var col = -1,
                j;

            for (j = 0; j < self.n; j += 1) {
                if (self.marked[row][j] === 2) {
                    col = j;
                    break;
                }
            }

            return col;
        };

        convertPath = function (path, count) {
            var i;

            for (i = 0; i <= count; i += 1) {
                if (self.marked[path[i][0]][path[i][1]] === 1) {
                    self.marked[path[i][0]][path[i][1]] = 0;
                } else {
                    self.marked[path[i][0]][path[i][1]] = 1;
                }
            }
        };

        clearCovers = function () {
            var i;

            for (i = 0; i < self.n; i += 1) {
                self.rowCovered[i] = false;
                self.colCovered[i] = false;
            }
        };

        erasePrimes = function () {
            var i, j;

            for (i = 0; i < self.n; i += 1) {
                for (j = 0; j < self.n; j += 1) {
                    if (self.marked[i][j] === 2) {
                        self.marked[i][j] = 0;
                    }
                }
            }
        };

        // Public vars
        self.c = null;
        self.rowCovered = [];
        self.colCovered = [];
        self.n = 0;
        self.z0R = 0;
        self.z0C = 0;
        self.marked = null;
        self.path = null;

        // Public methods
        self.compute = compute;
    };

    hungarian.factory('munkres', function () {
        return new Munkres();
    });
}(angular));
