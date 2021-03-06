import {expect} from "chai";
import {Node, ConstNode} from "@/lib/compiler/tree";
// eslint-disable-next-line no-unused-vars
import {fnAnd, fnNot, fnOr, fnEq, fnFalse, fnImpl, fnTrue, fnXor, fnStart, fnParens} from "@/lib/compiler/language";

const constNode = new ConstNode("v0");

describe("generator.js", () => {
  it("ConstNode literal", () => {
    expect(constNode.to() === "v0").to.be.true;
  });
  it("ConstNode literal", () => {
    expect(new ConstNode("v").to() === "v").to.be.true;
  });
  it("Invalid ConstNode value", () => {
    function isInvalid() {
      new ConstNode("0");
    }

    expect(isInvalid).to.throw;
  });
  it("Invalid ConstNode value", () => {
    function isInvalid() {
      new ConstNode("0uiohn");
    }

    expect(isInvalid).to.throw;
  });
  it("ConstNode literal to tex", () => {
    expect(constNode.to("tex") === "v_{0}").to.be.true;
  });
  it("ConstNode literal in parens serialize", () => {
    const node = new Node({fw: fnParens, children: [constNode]});
    expect(node.to() === "(v0)").to.be.true;
  });
  it("True serialize", () => {
    const node = new Node({fw: fnTrue});
    expect(node.to() === "true").to.be.true;
  });
  it("false serialize", () => {
    const node = new Node({fw: fnFalse});
    expect(node.to() === "false").to.be.true;
  });

  const and = new Node({fw: fnAnd, children: [new ConstNode("v0"), new ConstNode("v1")]});
  it("eval AND expression (true  AND  true)  => true", () => expect(and.evaluate({v0: true, v1: true})).to.be.true);
  it("eval AND expression (true  AND false) => false", () => expect(and.evaluate({v0: true, v1: false})).to.be.false);
  it("eval AND expression (false AND  true) => false", () => expect(and.evaluate({v0: false, v1: true})).to.be.false);
  it("eval AND expression (false AND false) => false", () => expect(and.evaluate({v0: false, v1: false})).to.be.false);
  it("eval AND expression (true  AND false) => false", () => expect(and.evaluate({v0: true})).to.be.false);
  it("eval AND expression (false AND  true) => false", () => expect(and.evaluate({v1: true})).to.be.false);
  it("eval AND expression (false AND false) => false", () => expect(and.evaluate({})).to.be.false);

  const or = new Node({fw: fnOr, children: [new ConstNode("v0"), new ConstNode("v1")]});
  it("eval OR expression: (true  OR true)  => true", () => expect(or.evaluate({v0: true, v1: true})).to.be.true);
  it("eval OR expression: (true  OR false) => true", () => expect(or.evaluate({v0: true, v1: false})).to.be.true);
  it("eval OR expression: (false OR true)  => true", () => expect(or.evaluate({v0: false, v1: true})).to.be.true);
  it("eval OR expression: (false OR false) => true", () => expect(or.evaluate({v0: false, v1: false})).to.be.false);
  it("eval OR expression: (true  OR false) => true", () => expect(or.evaluate({v0: true})).to.be.true);
  it("eval OR expression: (false OR  true) => true", () => expect(or.evaluate({v1: true})).to.be.true);
  it("eval OR expression: (false OR false) => false", () => expect(or.evaluate({})).to.be.false);

  const impl = new Node({fw: fnImpl, children: [new ConstNode("v0"), new ConstNode("v1")]});
  it("eval IMPLICATION expression: (true  -> true)  => true", () => expect(impl.evaluate({v0: true, v1: true})).to.be.true);
  it("eval IMPLICATION expression: (true  -> false) => false", () => expect(impl.evaluate({v0: true})).to.be.false);
  it("eval IMPLICATION expression: (false -> true)  => true", () => expect(impl.evaluate({v1: true})).to.be.true);
  it("eval IMPLICATION expression: (false -> false) => false", () => expect(impl.evaluate({})).to.be.true);

  it("eval eval NOT expression: !true => false", () => {
    const node = new Node({fw: fnNot, children: [new ConstNode("v0")]});
    expect(node.evaluate({v0: true})).to.be.false;
  });
  it("eval NOT expression: !false => true", () => {
    const node = new Node({fw: fnNot, children: [new ConstNode("v0")]});
    expect(node.evaluate({})).to.be.true;
  });

  const xor = new Node({fw: fnXor, children: [new ConstNode("v0"), new ConstNode("v1")]});
  it("eval XOR expression: (true XOR true) => true", () => expect(xor.evaluate({v0: true, v1: true})).to.be.false);
  it("eval XOR expression: (true XOR false) => false", () => expect(xor.evaluate({v0: true})).to.be.true);
  it("eval XOR expression: (false XOR true) => true", () => expect(xor.evaluate({v1: true})).to.be.true);
  it("eval XOR expression: (false XOR false) => false", () => expect(xor.evaluate({})).to.be.false);

  const eq = new Node({fw: fnEq, children: [new ConstNode("v0"), new ConstNode("v1")]});
  it("eval EQ expression: (true == true) => true", () => expect(eq.evaluate({v0: true, v1: true})).to.be.true);
  it("eval EQ expression: (true == false) => false", () => expect(eq.evaluate({v0: true})).to.be.false);
  it("eval EQ expression: (false == true) => false", () => expect(eq.evaluate({v1: true})).to.be.false);
  it("eval EQ expression: (false == false) => true", () => expect(eq.evaluate({})).to.be.true);

  const and1 = new Node({fw: fnAnd, children: [new ConstNode("v0"), new ConstNode("v1")]});
  const notAnd = new Node({fw: fnNot, children: [and1]});
  it("eval expression: NoT(false AND false) => true", () => expect(notAnd.evaluate({v0: false, v1: false})).to.be.true);
  it("eval expression: NOT(true  AND false) => true", () => expect(notAnd.evaluate({v0: true, v1: false})).to.be.true);
  it("eval expression: NOT(false AND  true) => true", () => expect(notAnd.evaluate({v0: false, v1: true})).to.be.true);
  it("eval expression: NOT(false AND false) => true", () => expect(notAnd.evaluate({v0: false})).to.be.true);
  it("eval expression: NOT(false AND false) => true", () => expect(notAnd.evaluate({v1: false})).to.be.true);
  it("eval expression: NOT(false AND false) => true", () => expect(notAnd.evaluate({})).to.be.true);
  it("eval expression: NOT(true  AND  true) => false", () => expect(notAnd.evaluate({v0: true, v1: true})).to.be.false);

  it("(not (and ...)) ops", () => expect(notAnd.ops()).deep.equal(["not", "and"]));
  it("(and ...) ops", () => expect(or.ops()).deep.equal(["or"]));
  it("(and ...) ops", () => expect(and.ops()).deep.equal(["and"]));
  it("(eq ...) ops", () => expect(eq.ops()).deep.equal(["eq"]));
  it("(xor ...) ops", () => expect(xor.ops()).deep.equal(["xor"]));
  it("(implication ...) ops", () => expect(impl.ops()).deep.equal(["implication"]));
});
