function RestritedEquation(numberBasis, variables, freeMember) {
    Equation.call(this, variables, freeMember);
    this.numberBasis = numberBasis;
}

RestritedEquation.prototype = Object.create(Equation.prototype);