function RestritedVariable(number, coeficientValue, isBasis) {
    Variable.call(this, number, coeficientValue);
    this.isBasis = isBasis || false;
}

RestritedVariable.prototype = Object.create(Variable.prototype);