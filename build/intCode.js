"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ParameterMode;
(function (ParameterMode) {
    ParameterMode[ParameterMode["PositionMode"] = 0] = "PositionMode";
    ParameterMode[ParameterMode["ImmediateMode"] = 1] = "ImmediateMode";
})(ParameterMode || (ParameterMode = {}));
class IntCodeComputer {
    data;
    cursor;
    currentInput;
    inputs;
    complete = false;
    expectingHalt = false;
    output = 0;
    constructor(input, inputs) {
        this.data = input;
        this.inputs = inputs;
        this.cursor = 0;
        this.currentInput = 0;
    }
    process = () => {
        while (!this.complete) {
            // if (this.cursor > this.data.length) {
            //     this.cursor = this.cursor - this.data.length
            // }
            const controlNumber = this.data[this.cursor];
            const code = this.getOpCode(controlNumber);
            const method = this.getMethod(code);
            const instructions = this.getInstructions(controlNumber);
            const cursorMove = method(instructions);
            this.cursor = this.cursor + cursorMove;
        }
        return this.output;
    };
    getInstructions = (controlNumber) => {
        const controlNumberString = controlNumber.toString();
        const controlParams = controlNumberString.substring(0, controlNumberString.length - 2).split("").reverse().map(x => parseInt(x));
        const instructions = [];
        for (let i = 0; i <= 4; i++) {
            instructions.push({
                value: this.data[this.cursor + i + 1],
                mode: controlParams[i] ? ParameterMode.ImmediateMode : ParameterMode.PositionMode
            });
        }
        return instructions;
    };
    getOpCode = (data) => {
        const stringVal = data.toString();
        const subString = stringVal.substring(stringVal.length - 2);
        return parseInt(subString);
    };
    multiply = (instructions) => {
        this.throwIfExpectingHalt();
        const input1 = this.getValueForInstruction(instructions[0]);
        const input2 = this.getValueForInstruction(instructions[1]);
        const val = input1 * input2;
        this.data[instructions[2].value] = val;
        return 4;
    };
    add = (instructions) => {
        this.throwIfExpectingHalt();
        const input1 = this.getValueForInstruction(instructions[0]);
        const input2 = this.getValueForInstruction(instructions[1]);
        const val = input1 + input2;
        this.data[instructions[2].value] = val;
        return 4;
    };
    finish = () => {
        this.complete = true;
        return 1;
    };
    inputAt = (instructions) => {
        this.throwIfExpectingHalt();
        this.data[instructions[0].value] = this.inputs[this.currentInput];
        this.currentInput++;
        return 2;
    };
    outputAt = (instructions) => {
        this.throwIfExpectingHalt();
        const value = this.getValueForInstruction(instructions[0]);
        this.output = value;
        if (value !== 0) {
            this.expectingHalt = true;
        }
        return 2;
    };
    jumpIfTrue = (instructions) => {
        const value1 = this.getValueForInstruction(instructions[0]);
        if (value1 !== 0) {
            const value2 = this.getValueForInstruction(instructions[1]);
            this.cursor = value2;
            return 0;
        }
        return 3;
    };
    jumpIfFalse = (instructions) => {
        const value1 = this.getValueForInstruction(instructions[0]);
        if (value1 === 0) {
            const value2 = this.getValueForInstruction(instructions[1]);
            this.cursor = value2;
            return 0;
        }
        return 3;
    };
    lessThan = (instructions) => {
        this.throwIfExpectingHalt();
        const input1 = this.getValueForInstruction(instructions[0]);
        const input2 = this.getValueForInstruction(instructions[1]);
        const input3 = this.getValueForInstruction(instructions[2]);
        if (input1 < input2) {
            this.data[instructions[2].value] = 1;
        }
        else {
            this.data[instructions[2].value] = 0;
        }
        return 4;
    };
    equals = (instructions) => {
        this.throwIfExpectingHalt();
        const input1 = this.getValueForInstruction(instructions[0]);
        const input2 = this.getValueForInstruction(instructions[1]);
        const input3 = this.getValueForInstruction(instructions[2]);
        if (input1 === input2) {
            this.data[instructions[2].value] = 1;
        }
        else {
            this.data[instructions[2].value] = 0;
        }
        return 4;
    };
    throwIfExpectingHalt = () => {
        if (this.expectingHalt) {
            throw new Error("Was expecting a halt, but did not");
        }
    };
    getValueForInstruction = (instruction) => {
        return instruction?.mode === ParameterMode.ImmediateMode ? instruction.value : this.data[instruction.value];
    };
    getMethod = (operator) => {
        switch (operator) {
            case 1:
                return this.add;
            case 2:
                return this.multiply;
            case 3:
                return this.inputAt;
            case 4:
                return this.outputAt;
            case 5:
                return this.jumpIfTrue;
            case 6:
                return this.jumpIfFalse;
            case 7:
                return this.lessThan;
            case 8:
                return this.equals;
            case 99:
                return this.finish;
            default:
                throw "Not implemented";
        }
    };
}
exports.default = IntCodeComputer;
