function InputOutputGenerator(domGenerator, normalizer) {
    this.domGenerator = domGenerator;
    this.normalizer = new Normalizer(this);
    this.input = {};
}

InputOutputGenerator.prototype.generateInput = function () {
    this.generateInputGoalFunction();
    this.generateInputRestrictions();
    this.normalize();
    this.resolveBasis();
};

InputOutputGenerator.prototype.normalize = function () {
    this.normalizer.normalize();
};

InputOutputGenerator.prototype.generateInputGoalFunction = function () {
    var goalFunction = {}, currentInput, iterator;
    goalFunction.variables = [];

    for (iterator = 0; currentInput = this.domGenerator.goalFunctionInputs[iterator++];) {
        goalFunction.variables.push(this.domGenerator.configuration.isMin ? +currentInput.value : -currentInput.value);
    }

    goalFunction.freeMember = goalFunction.variables.pop();
    goalFunction.isMinimum = this.domGenerator.configuration.isMin;
    this.input.goalFunction = goalFunction;
};

InputOutputGenerator.prototype.generateInputRestrictions = function () {
    var restrictions = [], varRestrictions = [], restriction, currentInput, currentInputInner,
        iterator, innerIterator, currentVariable;

    for (iterator = 0; currentInput = this.domGenerator.restrictionInputs[iterator++];) {
        restriction = {};
        restriction.variables = [];

        for (innerIterator = 0; currentInputInner = currentInput[innerIterator++];) {
            currentVariable = {};
            currentVariable.value = +currentInputInner.value;
            restriction.variables.push(currentVariable);
        }

        restriction.freeMember = restriction.variables.pop().value;
        restriction.token = this.domGenerator.restrictionInputTokens[iterator - 1].value;

        restrictions.push(restriction);
    }

    for (iterator = 0; currentInput = this.domGenerator.varRestrictionInputTokens[iterator++];) {
        restriction = {};

        restriction.token = currentInput.value;
        varRestrictions.push(restriction);
    }

    this.input.restrictions = restrictions;
    this.input.varRestriction = varRestrictions;
};

InputOutputGenerator.prototype.resolveBasis = function () {
    var currentRestriction, currentVariable,
        amountRestrictions = this.domGenerator.configuration.amountRestrictions,
        restrictions = this.input.restrictions,
        iterator, innerIterator, addIterator, isBasis;

    for (iterator = 0; currentRestriction = restrictions[iterator++];) {
        for (innerIterator = 0; currentVariable = currentRestriction.variables[innerIterator++];) {
            if (currentVariable.value !== 1) {
                currentVariable.isBasis = false;
                continue;
            }

            isBasis = true;
            for (addIterator = 0; addIterator < amountRestrictions; addIterator++) {
                if (restrictions[addIterator].variables[innerIterator - 1].value !== 0 && addIterator !== (iterator - 1)) {
                    isBasis = false;
                    break;
                }
            }

            currentVariable.isBasis = isBasis;
            if (isBasis) {
                currentRestriction.number = innerIterator;
            }
        }
    }
};
