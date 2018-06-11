function Normalizer(inputOutputGenerator) {
    this.inputOutputGenerator = inputOutputGenerator;
}

Normalizer.prototype.MAX_VAL = MAX_VAL = 100000000;

Normalizer.prototype.normalize = function() {
    this.resolveMinusFreeMembers();
    this.resolveLessEqualToken();
    this.resolveCase();
    this.resolveVars();
};

Normalizer.prototype.resolveMinusFreeMembers = function() {
    var currentEl, currentVar, iterator;

    for (iterator = 0; currentEl = this.inputOutputGenerator.input.restrictions[iterator++];) {
        if (currentEl.freeMember < 0) {
            for (currentVar in currentEl.variables) {
                if (currentEl.variables.hasOwnProperty(currentVar)) {
                    currentEl.variables[currentVar].value =
                        -currentEl.variables[currentVar].value;
                }
            }

            if (currentEl.token === "less") {
                currentEl.token = "more";
            } else if (currentEl.token === "more") {
                currentEl.token = "less";
            }

            currentEl.freeMember = -currentEl.freeMember;
        }
    }
};

Normalizer.prototype.resolveLessEqualToken = function() {
    var currentEl, iterator;

    for (iterator = 0; currentEl = this.inputOutputGenerator.input.restrictions[iterator++];) {
        if (currentEl.token !== "less") {
            continue;
        }

        this.pushBasisVariable(currentEl);
    }
};

Normalizer.prototype.pushBasisVariable = function(currentEl, defaultVal, goalVarValue) {
    var variable, currentElInn, innerIterator;

    variable = { value : defaultVal || 1 };
    currentEl.variables.push(variable);
    currentEl.used = true;

    variable = Object.assign({}, variable);
    variable.value = 0;

    for (innerIterator = 0; currentElInn =
        this.inputOutputGenerator.input.restrictions[innerIterator++];) {
        if (currentElInn.variables.length < currentEl.variables.length) {
            currentElInn.variables.push(Object.assign({}, variable));
        }
    }

    this.inputOutputGenerator.input.goalFunction.variables.push(goalVarValue || 0);
};

Normalizer.prototype.resolveCase = function () {
    var currentEl, iterator, tokens = { more: 0, equal: 0 };

    for (iterator = 0; currentEl = this.inputOutputGenerator.input.restrictions[iterator++];) {
        if (currentEl.token === "more") {
            tokens.more++;
        }

        if (currentEl.token === "equal") {
            tokens.equal++;
        }
    }

    if (tokens.more === 0 && tokens.equal > 0) {
        this.resolveEqualToken();
    }

    if (tokens.more > 0 && tokens.equal === 0) {
        this.resolveMoreEqualToken();
    }

    if (tokens.more > 0 && tokens.equal > 0) {
        this.resolveMoreEqualAndEqualToken();
    }
};

Normalizer.prototype.resolveEqualToken = function () {
    var currentEl, iterator, hasBasis;

    for (iterator = 0; currentEl = this.inputOutputGenerator.input.restrictions[iterator++];) {
        if (currentEl.used || currentEl.token !== "equal") {
            continue;
        }

        hasBasis = this.hasBasis(currentEl, iterator - 1);
        if (hasBasis) {
            currentEl.used = true;
            continue;
        }

        this.pushBasisVariable(currentEl, null, this.MAX_VAL);
        currentEl.used = true;
    }
};

Normalizer.prototype.resolveMoreEqualToken = function() {
    var currentEl, currentElInn, iterator, innerIterator,
        maxEl = { freeMember: -Infinity }, maxIt = -1;

    for (iterator = 0; currentEl = this.inputOutputGenerator.input.restrictions[iterator++];) {
        if (currentEl.used || currentEl.token !== "more") {
            continue;
        }

        currentEl.use = true;
        if (currentEl.freeMember > maxEl.freeMember) {
            maxEl = currentEl;
            maxIt = iterator - 1;
        }

        this.pushBasisVariable(currentEl, -1);
    }

    for (iterator = 0; currentEl = this.inputOutputGenerator.input.restrictions[iterator++];) {
        if (!currentEl.use) {
            continue;
        }

        delete currentEl.use;

        for (innerIterator = 0; currentElInn = currentEl.variables[innerIterator++];) {
            if (maxIt === iterator - 1) {
                continue;
            }

            currentElInn.value = maxEl.variables[innerIterator - 1].value - currentElInn.value;
        }

        if (maxIt !== iterator - 1) {
            currentEl.freeMember = maxEl.freeMember - currentEl.freeMember;
        }
    }

    this.pushBasisVariable(maxEl, 1, this.MAX_VAL);
};

Normalizer.prototype.resolveMoreEqualAndEqualToken = function() {
    var currentEl, currentElemInner, iterator, innerIt, maxEl = { freeMember: -Infinity }, maxIt = -1;

    for (iterator = 0; currentEl = this.inputOutputGenerator.input.restrictions[iterator++];) {
        if (currentEl.freeMember !== 0) {
            break;
        }

        if (iterator === this.inputOutputGenerator.input.restrictions.length) {
            this.resolveEqualToken();
            this.resolveMoreEqualToken();
            return;
        }
    }

    for (iterator = 0; currentEl = this.inputOutputGenerator.input.restrictions[iterator++];) {
        if (currentEl.token !== "equal") {
            continue;
        }

        if (currentEl.freeMember > maxEl.freeMember) {
            maxEl = currentEl;
            maxIt = iterator - 1;
        }
    }

    for (iterator = 0; currentEl = this.inputOutputGenerator.input.restrictions[iterator++];) {
        if (currentEl.token !== "more") {
            continue;
        }

        if (currentEl.freeMember > maxEl.freeMember) {
            while (true) {
                currentEl.freeMember /= 2;

                for (innerIt = 0; currentElemInner = currentEl.variables[innerIt++];) {
                    currentElemInner.value /= 2
                }

                if (currentEl.freeMember <= maxEl.freeMember) {
                    break;
                }
            }
        }
    }

    for (iterator = 0; currentEl = this.inputOutputGenerator.input.restrictions[iterator++];) {
        if (currentEl.used || currentEl.token !== "more") {
            continue;
        }

        currentEl.use = true;

        this.pushBasisVariable(currentEl, -1);
    }

    for (iterator = 0; currentEl = this.inputOutputGenerator.input.restrictions[iterator++];) {
        if (!currentEl.use) {
            continue;
        }

        delete currentEl.use;

        for (innerIt = 0; currentElemInner = currentEl.variables[innerIt++];) {
            if (maxIt === iterator - 1) {
                continue;
            }

            currentElemInner.value = maxEl.variables[innerIt - 1].value - currentElemInner.value;
        }

        if (maxIt !== iterator - 1) {
            currentEl.freeMember = maxEl.freeMember - currentEl.freeMember;
        }
    }

    this.resolveEqualToken();
};

Normalizer.prototype.resolveVars = function() {
    var iterator, innerIterator, currentEl, currentElInn, tmpVal, tmpValM;

    for (iterator = 0; currentEl = this.inputOutputGenerator.input.varRestriction[iterator++];) {
        if (currentEl.token !== 'all') {
            continue;
        }

        for (innerIterator = 0; currentElInn = this.inputOutputGenerator.input.restrictions[innerIterator++];) {
            tmpVal = Object.assign({}, currentElInn.variables[iterator - 1]);
            tmpValM = Object.assign({}, currentElInn.variables[iterator - 1]);
            tmpValM.value = -tmpValM.value;

            currentElInn.variables.splice(iterator - 1, 1, tmpVal, tmpValM);
        }

        tmpVal = this.inputOutputGenerator.input.goalFunction.variables[iterator - 1];
        tmpValM = -tmpVal;

        this.inputOutputGenerator.input.goalFunction.variables.splice(iterator - 1, 1, tmpVal, tmpValM);
    }
};

Normalizer.prototype.hasBasis = function(currentElParam, currentIterator) {
    var currentEl, currentElInn, iterator, innerIterator;

    for (iterator = 0; currentEl = currentElParam.variables[iterator++];) {
        if (currentEl.value !== 1) {
            continue;
        }

        for (innerIterator = 0; currentElInn = this.inputOutputGenerator.input.restrictions[innerIterator++];) {
            if ((innerIterator - 1) === currentIterator) {

            } else if (currentElInn.variables[iterator - 1].value !== 0) {
                break;
            }

            if (innerIterator === this.inputOutputGenerator.input.restrictions.length) {
                return true;
            }
        }
    }

    return false;
};

Normalizer.prototype.writeToRatio = function (value) {
    var roundVal, coef, module, result;

    if (Math.abs(value) > (this.MAX_VAL / 100)) {
        roundVal = Math.round(value / 1000) * 1000;

        coef = (value * 1.0 / this.MAX_VAL);
        module = value - roundVal;

        if (module >= 0) {
            module = '+' + this.getRatio(module);
        } else {
            module = this.getRatio(module);
        }

        result = this.getRatio(coef) + 'M';
        if (module !== 0) {
            result += module;
        }
    } else {
        result = this.getRatio(value);
    }

    return result;
};

Normalizer.prototype.getRatio = function getRatio(value) {
    if (math.isInteger(value)) {
        return value;
    }

    return math.format(math.fraction(value), {fraction: 'fraction'})
};

