const APP_ID = "app";

function DOMGenerator(configuration) {
    this.configuration = configuration;
    this.goalFunctionInputs = [];
    this.restrictionInputs = [];
    this.restrictionInputTokens = [];
    this.varRestrictionInputTokens = [];
    this.appDiv = document.getElementById(APP_ID);
}

DOMGenerator.prototype.doInputBlock = function (generateInput, run) {
    var inputBlock, goalFunctionLabel, goalFunctionBlock, restrictionsBlock, btn;
    inputBlock = document.createElement('div');
    inputBlock.setAttribute("id", "input-block");

    goalFunctionLabel = document.createElement('h5');
    goalFunctionLabel.innerHTML = "Goal function";

    goalFunctionBlock = document.createElement('div');
    goalFunctionBlock.setAttribute("id", "goal-function");

    this.doGoalFunction(goalFunctionBlock);

    restrictionsBlock = document.createElement('div');
    restrictionsBlock.setAttribute("id", "restrictions");

    this.doRestrictions(restrictionsBlock);

    btn = document.createElement('button');
    btn.setAttribute("id", "solve");
    btn.innerHTML = "Solve";

    btn.addEventListener("click", function () {
        generateInput();
        run();
    });

    inputBlock.appendChild(goalFunctionLabel);
    inputBlock.appendChild(goalFunctionBlock);
    inputBlock.appendChild(restrictionsBlock);
    inputBlock.appendChild(btn);
    this.appDiv.appendChild(inputBlock);
};

DOMGenerator.prototype.doGoalFunction = function (goalFunction) {
    var fxspan, xspan, sub, plusspan,
        goalFunctionInputWrapper, goalFunctionInput,
        freeMemberWrapper, freeMember, iterator = 0, attitudeSpan;

    fxspan = document.createElement('span');
    fxspan.innerHTML = "f(x) = ";
    goalFunction.appendChild(fxspan);


    for (; iterator++ < this.configuration.amountVars;) {
        goalFunctionInputWrapper = document.createElement('span');
        goalFunctionInput = document.createElement('input');
        goalFunctionInput.setAttribute("id", "goal-function-input-" + iterator);
        goalFunctionInput.setAttribute("class", "input-width");
        this.goalFunctionInputs.push(goalFunctionInput);

        xspan = document.createElement('span');
        xspan.innerHTML = "x";

        sub = document.createElement("sub");
        sub.innerHTML = iterator;

        plusspan = document.createElement('span');
        plusspan.innerHTML = " + ";


        goalFunctionInputWrapper.appendChild(goalFunctionInput);
        goalFunctionInputWrapper.appendChild(xspan);
        goalFunctionInputWrapper.appendChild(sub);

        goalFunction.appendChild(goalFunctionInputWrapper);
        goalFunction.appendChild(plusspan);
    }

    freeMemberWrapper = document.createElement('span');

    freeMember = document.createElement('input');
    freeMember.setAttribute("id", "goal-function-freemember");
    freeMember.setAttribute("class", "input-width");
    this.goalFunctionInputs.push(freeMember);

    freeMemberWrapper.appendChild(freeMember);

    attitudeSpan = document.createElement('span');
    attitudeSpan.innerHTML = " -> " + (this.configuration.isMin ? "min" : "max");

    goalFunction.appendChild(freeMemberWrapper);
    goalFunction.appendChild(attitudeSpan);
};

DOMGenerator.prototype.doRestrictions = function (restrictionsBlock) {
    var restrictionsLabel, restrictionBlock, iterator, innerIterator,
        restrictionInputWrapper, restrictionInput, sub, xspan, plusspan,
        equalsspan, restrictionInputPack, select, option;

    restrictionsLabel = document.createElement('h5');
    restrictionsLabel.innerHTML = "Restrictions";
    restrictionsBlock.appendChild(restrictionsLabel);

    for (iterator = 0; iterator++ < this.configuration.amountRestrictions;) {
        restrictionBlock = document.createElement('div');
        restrictionBlock.setAttribute("id", "restriction-" + iterator);

        restrictionInputPack = [];
        for (innerIterator = 0; innerIterator++ < this.configuration.amountVars;) {
            restrictionInputWrapper = document.createElement('span');

            restrictionInput = document.createElement('input');
            restrictionInput.setAttribute("id", "restriction-" + iterator + "-input-" + innerIterator);
            restrictionInput.setAttribute("class", "input-width");
            restrictionInputPack.push(restrictionInput);

            xspan = document.createElement('span');
            xspan.innerHTML = "x";

            sub = document.createElement('sub');
            sub.innerHTML = innerIterator;

            restrictionInputWrapper.appendChild(restrictionInput);
            restrictionInputWrapper.appendChild(xspan);
            restrictionInputWrapper.appendChild(sub);

            restrictionBlock.appendChild(restrictionInputWrapper);

            if (innerIterator < this.configuration.amountVars) {
                plusspan = document.createElement('span');
                plusspan.innerHTML = "+";

                restrictionBlock.appendChild(plusspan);
            }
        }

        equalsspan = document.createElement('span');

        select = document.createElement("select");

        option = document.createElement("option");
        option.setAttribute("value", "equal");
        option.setAttribute("selected", "selected");
        option.innerHTML = "=";
        select.appendChild(option);

        option = document.createElement("option");
        option.setAttribute("value", "less");
        option.innerHTML = "≤";
        select.appendChild(option);

        option = document.createElement("option");
        option.setAttribute("value", "more");
        option.innerHTML = "≥";
        select.appendChild(option);
        this.restrictionInputTokens.push(select);

        equalsspan.appendChild(select);

        restrictionInput = document.createElement('input');
        restrictionInput.setAttribute("id", "restriction-" + iterator + "-freemember");
        restrictionInput.setAttribute("class", "input-width");
        restrictionInputPack.push(restrictionInput);
        this.restrictionInputs.push(restrictionInputPack);

        restrictionBlock.appendChild(equalsspan);
        restrictionBlock.appendChild(restrictionInput);
        restrictionsBlock.appendChild(restrictionBlock);
    }


    iterator = 0;

    restrictionBlock = document.createElement('div');
    restrictionBlock.setAttribute("id", "var-restriction-" + (++iterator));

    for (innerIterator = 0; innerIterator++ < this.configuration.amountVars;) {
        restrictionInputWrapper = document.createElement('span');

        xspan = document.createElement('span');
        xspan.innerHTML = "x";

        sub = document.createElement('sub');
        sub.innerHTML = innerIterator;

        restrictionInputWrapper.appendChild(xspan);
        restrictionInputWrapper.appendChild(sub);

        restrictionBlock.appendChild(restrictionInputWrapper);

        if (innerIterator <= this.configuration.amountVars) {
            equalsspan = document.createElement('span');

            select = document.createElement("select");

            option = document.createElement("option");
            option.setAttribute("value", "more zero");
            option.setAttribute("selected", "selected");
            option.innerHTML = "≥ 0 ";
            select.appendChild(option);

            option = document.createElement("option");
            option.setAttribute("value", "all");
            option.innerHTML = "є R ";
            select.appendChild(option);

            this.varRestrictionInputTokens.push(select);

            equalsspan.appendChild(select);

            restrictionBlock.appendChild(equalsspan);
        }
    }

    restrictionsBlock.appendChild(restrictionBlock);
};

DOMGenerator.prototype.doSimplexTable = function (simplexTable, isFirst) {
    var block, table, th, tr, td, iterator = 0, innerIterator, currentElement;

    block = document.createElement('div');
    block.setAttribute('class', 'margin');

    table = document.createElement('table');
    table.setAttribute('class', 'simplex');

    tr = document.createElement('tr');

    th = document.createElement('th');
    th.innerHTML = "Змінні<br/>Базис";
    tr.appendChild(th);

    while (iterator++ < simplexTable.marks.length) {
        th = document.createElement('th');
        th.innerHTML = "x<sub>" + iterator + "</sub>";
        tr.appendChild(th);
    }

    th = document.createElement('th');
    th.innerHTML = "Вільні члени";
    tr.appendChild(th);

    table.appendChild(tr);

    for (iterator = 0; currentElement = simplexTable.restrictedEquations[iterator++];) {
        tr = document.createElement('tr');

        th = document.createElement('th');
        th.innerHTML = "x<sub>" + currentElement.numberBasis + "<sub>";
        tr.appendChild(th);

        innerIterator = 0;
        while (innerIterator++ < currentElement.variables.length) {
            td = document.createElement('td');

            if (simplexTable.minRelation && simplexTable.maxMark &&
                currentElement.numberBasis === simplexTable.minRelation.numberBasis &&
                innerIterator === simplexTable.maxMark.number) {
                td.setAttribute('class', 'yellow');
            }

            td.innerHTML = Normalizer.prototype.writeToRatio(currentElement.variables[innerIterator - 1].coeficientValue);
            tr.appendChild(td);
        }

        td = document.createElement('td');
        td.innerHTML = Normalizer.prototype.writeToRatio(currentElement.freeMember);
        tr.appendChild(td);

        if (isFirst) {
            td = document.createElement('td');
            td.innerHTML = Normalizer.prototype.writeToRatio(simplexTable.goalFunction.equation.variables[currentElement.numberBasis - 1].coeficientValue);
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }

    tr = document.createElement('tr');
    th = document.createElement('th');
    th.innerHTML = "F";
    tr.appendChild(th);

    iterator = 0;
    while (iterator++ < simplexTable.marks.length) {
        td = document.createElement('td');

        td.innerHTML = Normalizer.prototype.writeToRatio(simplexTable.marks[iterator - 1].value);
        tr.appendChild(td);
    }

    td = document.createElement('td');
    td.innerHTML = Normalizer.prototype.writeToRatio(simplexTable.goalFunctionValue);
    tr.appendChild(td);

    table.appendChild(tr);

    tr = document.createElement('tr');

    td = document.createElement('td');
    td.setAttribute('class', 'stub');
    tr.appendChild(td);

    if (isFirst) {
        iterator = 0;
        while (iterator++ < simplexTable.marks.length) {
            td = document.createElement('td');

            td.innerHTML = Normalizer.prototype.writeToRatio(simplexTable.goalFunction.equation.variables[iterator - 1].coeficientValue);
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }

    block.appendChild(table);
    this.appDiv.appendChild(block);
};

DOMGenerator.prototype.doCoordsAndFuncValue = function (simplexTable, index) {
    var block, coord, coordVal, coordArr = [], funcVal, currentElement, iterator;

    block = document.createElement('div');
    block.setAttribute('class', 'margin');

    coord = document.createElement('span');
    coordVal = "x<sup>" + index + "</sup>(";

    for (iterator = 1; iterator <= simplexTable.marks.length; iterator++) {
        currentElement = simplexTable.restrictedEquations.find(function (e) {
            return e.numberBasis === iterator;
        });

        if (!currentElement) {
            coordArr.push(0);
            continue;
        }

        coordArr.push(Normalizer.prototype.writeToRatio(currentElement.freeMember));
    }

    coordVal += coordArr.join('; ') + ")";
    coord.innerHTML = coordVal;

    funcVal = document.createElement('span');
    debugger;
    funcVal.innerHTML = " F(x<sup>" + index + "</sup>) = " + Normalizer.prototype.writeToRatio(this.configuration.isMin ? simplexTable.goalFunctionValue : -simplexTable.goalFunctionValue);

    block.appendChild(coord);
    block.appendChild(funcVal);
    this.appDiv.appendChild(block);
};

DOMGenerator.prototype.doResultAnswer = function (simplexTables) {
    var block, answer, lastTable;

    lastTable = simplexTables[simplexTables.length - 1];

    block = document.createElement('div');
    block.setAttribute('class', 'margin');
    answer = document.createElement('span');

    if (!lastTable.maxMark.number) {
        answer.innerHTML = "Так як всі оцінки від'ємні, то оптимальним розв'язком є: ";
        answer.setAttribute('class', 'green-answer');
    } else if (!lastTable.minRelation) {
        answer.innerHTML = "Так як серед відношень немає додатніх, то функція цілі на МПР необмежена " + (this.configuration.isMin ? "знизу." : "зверху.");
        answer.setAttribute('class', 'red-answer');
    }

    block.appendChild(answer);
    this.appDiv.appendChild(block);

    if (!lastTable.maxMark.number) {
        this.doCoordsAndFuncValue(lastTable, '*');
    }
};