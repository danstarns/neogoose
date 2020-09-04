import { expect } from "chai";
import { describe } from "mocha";
import makeAugmentedSchema from "../../src/methods/make-augmented-schema";
import { Runtime } from "../../src/types";

describe("methods/makeAugmentedSchema", () => {
  describe("validation", () => {
    it("should be a function", () => {
      expect(makeAugmentedSchema).to.be.a("function");
    });

    it("should return a function when passed runtime", () => {
      // @ts-ignore
      const runtime: Runtime = {
        connections: [],
        models: [],
      };

      const _makeAugmentedSchema = makeAugmentedSchema(runtime);

      expect(_makeAugmentedSchema).to.be.a("function");
    });
  });
});
