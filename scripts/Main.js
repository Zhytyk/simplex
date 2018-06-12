function Main() {
    this.simplexTables = [];
    this.domGenerator = null;
    this.inputOutputGenerator = null;
}

Main.prototype.constructGoalFunction = function () {
    var variables, freeMember, j, goalFunction,
        currentElement, currentVariable;
    variables = [];

    currentElement = this.inputOutputGenerator.input.goalFunction;

    if (!currentElement) {
        return goalFunction;
    }

    for (j = 0; (currentVariable = currentElement.variables[j++]) !== undefined;) {
        variables.push(new Variable(j, currentVariable));
    }

    currentElement.freeMember = currentElement.isMinimum ? currentElement.freeMember : -currentElement.freeMember;

    return goalFunction = new GoalFunction(
        new Equation(variables, currentElement.freeMember),
        currentElement.isMinimum
    );
};

Main.prototype.constructFirstSimplexTable = function (goalFunction) {
    var restrictions, restrictedEquations, variables,
        currentElement, currentVariable, j, k;

    restrictions = this.inputOutputGenerator.input.restrictions;
    restrictedEquations = [];

    if (!restrictions) {
        return;
    }

    for (j = 0; currentElement = restrictions[j++];) {
        variables = [];

        for (k = 0; currentVariable = currentElement.variables[k++];) {
            variables.push(
                new RestritedVariable(k, currentVariable.value, currentVariable.isBasis)
            );
        }

        restrictedEquations.push(
            new RestritedEquation(currentElement.number, variables, currentElement.freeMember)
        );
    }

    return new FirstSimplexTable(restrictedEquations, goalFunction);
};

Main.prototype.constructSimplexTable = function (previousSimplexTable) {
    var newSimplexTable, equations = [], restrictedEquation, variables,
        restrictedVariable, j, k, varIterator, variable, solvedValue, solvedCoord,
        newRestrictedVariable, newRestrictedEquation, newMarks = [];

    for (j = 0; j < previousSimplexTable.restrictedEquations.length; j++) {
        variables = [];
        restrictedEquation = previousSimplexTable.restrictedEquations[j];

        for (k = 0; k < restrictedEquation.variables.length; k++) {
            restrictedVariable = restrictedEquation.variables[k];
            newRestrictedVariable = Object.assign({}, restrictedVariable);
            variables.push(newRestrictedVariable);
        }

        if (restrictedEquation.numberBasis === previousSimplexTable.minRelation.numberBasis) {
            varIterator = 0;
            solvedValue = previousSimplexTable.minRelation
                .variables[previousSimplexTable.maxMark.number - 1].coeficientValue;

            while (variable = variables[varIterator++]) {
                variable.coeficientValue /= solvedValue;
            }

            solvedCoord = new SolvedCoord(previousSimplexTable.maxMark.number, j + 1);

            newRestrictedEquation =
                new RestritedEquation(previousSimplexTable.maxMark.number, variables, restrictedEquation.freeMember / solvedValue);
        } else {
            newRestrictedEquation =
                new RestritedEquation(restrictedEquation.numberBasis, variables, restrictedEquation.freeMember);
        }

        equations.push(newRestrictedEquation);
    }

    for (j = 0; j < previousSimplexTable.marks.length; j++) {
        newMarks.push(Object.assign({}, previousSimplexTable.marks[j]));
    }

    newSimplexTable = new SimplexTable(equations, solvedCoord);
    newSimplexTable.marks = newMarks;
    newSimplexTable.goalFunctionValue = previousSimplexTable.goalFunctionValue;

    return newSimplexTable;
};

Main.prototype.run = function () {
    var goalFunction, currentSimplexTable, first = true, iterator = 0;

    goalFunction = this.constructGoalFunction();

    do {
        currentSimplexTable = first ? this.constructFirstSimplexTable(goalFunction)
            : this.constructSimplexTable(currentSimplexTable);

        first = false;

        currentSimplexTable.evaluate();
        this.simplexTables.push(currentSimplexTable);

    } while (!currentSimplexTable.isEnd());


    this.domGenerator.doSimplexTable(this.simplexTables[0], true);
    this.domGenerator.doCoordsAndFuncValue(this.simplexTables[0], 0);

    while (++iterator < this.simplexTables.length) {
        this.domGenerator.doSimplexTable(this.simplexTables[iterator]);
        this.domGenerator.doCoordsAndFuncValue(this.simplexTables[iterator], iterator);
    }

    this.domGenerator.doResultAnswer(this.simplexTables);

    console.log(this.inputOutputGenerator);
    console.log(this.simplexTables);
};

Main.prototype.generateConfiguration = function () {
    this.domGenerator = new DOMGenerator(new Configuration());
    this.inputOutputGenerator = new InputOutputGenerator(this.domGenerator);
    this.domGenerator.setInputOutputGenerator(this.inputOutputGenerator);

    this.domGenerator.doInputBlock(this.inputOutputGenerator.generateInput.bind(this.inputOutputGenerator), this.run.bind(this));
};