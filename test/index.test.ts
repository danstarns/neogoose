/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from "chai";
import { describe } from "mocha";
import { default as API } from "../src";

describe("index", () => {
  it("should export model", () => {
    expect(API.model).to.be.a("function");
  });

  it("should export connect", () => {
    expect(API.connect).to.be.a("function");
  });
});
