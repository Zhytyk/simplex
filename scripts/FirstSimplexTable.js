function FirstSimplexTable(restrictedEquations, goalFunction) {
    SimplexTable.call(this, restrictedEquations);
    this.goalFunction = goalFunction;
}

FirstSimplexTable.prototype = Object.create(SimplexTable.prototype);

FirstSimplexTable.prototype.evaluateMarks = function () {
    var currentEquation, j, i, mark;

    for (i = 0; i < this.goalFunction.equation.variables.length; i++) {
        mark = 0;

        for (j = 0; currentEquation = this.restrictedEquations[j++];) {
            mark += (currentEquation.variables[i].coeficientValue * this.goalFunction.equation.variables[currentEquation.numberBasis - 1].coeficientValue);
        }

        mark -= this.goalFunction.equation.variables[i].coeficientValue;

        this.marks.push(new Mark(i + 1, mark));
    }
};

FirstSimplexTable.prototype.evaluateFunctionGoalValue = function () {
    var i, currentElement, value = 0;

    i = 0;
    while (currentElement = this.restrictedEquations[i++]) {
        value += this.goalFunction.equation.variables[currentElement.numberBasis - 1].coeficientValue * currentElement.freeMember;
    }

    this.goalFunctionValue = value;
};

FirstSimplexTable.prototype.evaluate = function () {
    this.evaluateMarks();
    this.evaluateFunctionGoalValue();
    this.evaluateMaxMark();
    this.evaluateMinRelation();
};