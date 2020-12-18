import { sum } from "../Sum";
var expect = require('chai').expect;
import { TestHelper } from "../TestHelper";

describe("Tests:Sum", function() {
    before(async function () {
        console.log("Setting up for the test...");
        TestHelper.init({ owner: "john@contoso.com" });
    })

    it("Add works fine", function() {
        expect(sum(2, 3)).to.equal(5);
    })

    after(function () {
        console.log("Cleaning up after the test...");
    })
})
