function SimplexTable(restrictedEquations, solvedCoord) {
    this.restrictedEquations = restrictedEquations;
    this.solvedCoord = solvedCoord;
    this.marks = [];
    this.maxMark = null;
    this.minRelation = null;
    this.goalFunctionValue = null;
}

SimplexTable.prototype.evaluateMaxMark = function () {
    var currentMark, maxMark, j;

    j = 0;
    maxMark = {number: null, value: -1};

    while (currentMark = this.marks[j++]) {
        if (currentMark.value > maxMark.value && currentMark.value > 0) {
            maxMark = currentMark;
        }
    }

    this.maxMark = maxMark;
};

SimplexTable.prototype.evaluateMinRelation = function () {
    var currentEquation, minRelation, minRelationVal, relationVal, j;

    if (!this.maxMark.number) {
        return;
    }

    j = 0;
    minRelationVal = Number.MAX_SAFE_INTEGER;

    while (currentEquation = this.restrictedEquations[j++]) {
        relationVal = currentEquation.freeMember / currentEquation.variables[this.maxMark.number - 1].coeficientValue;

        if (relationVal > 0 && relationVal < minRelationVal) {
            minRelation = currentEquation;
            minRelationVal = relationVal;
        }
    }

    this.minRelation = minRelation;
};

SimplexTable.prototype.evaluateBasis = function () {
    var i, j, currentEquation, currentVariable, currentMark, basisCol;

    for (i = 0; i < this.restrictedEquations.length; i++) {
        if (i === this.solvedCoord.row - 1) {
            continue;
        }
        currentEquation = this.restrictedEquations[i];

        basisCol = currentEquation.variables[this.solvedCoord.col - 1].coeficientValue;
        for (j = 0; j < currentEquation.variables.length; j++) {
            currentVariable = currentEquation.variables[j];
            currentVariable.coeficientValue +=
                (this.restrictedEquations[this.solvedCoord.row - 1].variables[j].coeficientValue * (-basisCol));

        }

        currentEquation.freeMember +=
            (this.restrictedEquations[this.solvedCoord.row - 1].freeMember * (-basisCol));
    }

    basisCol = this.marks[this.solvedCoord.col - 1].value;
    for (i = 0; i < this.marks.length; i++) {
        currentMark = this.marks[i];

        currentMark.value +=
            (this.restrictedEquations[this.solvedCoord.row - 1].variables[i].coeficientValue * (-basisCol));
    }

    this.goalFunctionValue +=
        (this.restrictedEquations[this.solvedCoord.row - 1].freeMember * (-basisCol));
};

SimplexTable.prototype.isEnd = function () {
    return this.maxMark.value < 0 || !this.minRelation;
};

SimplexTable.prototype.evaluate = function () {
    this.evaluateBasis();
    this.evaluateMaxMark();
    this.evaluateMinRelation();
};