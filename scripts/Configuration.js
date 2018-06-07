function Configuration() {
    this.amountVars = +prompt('Яка кількість змінних?');
    this.amountRestrictions = +prompt('Яка кількість обмежень?');
    this.isMin = confirm("Чи мінімізується функція цілі?")
}