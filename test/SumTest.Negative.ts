import { sum } from "../Sum";
import { assert } from "chai";
import { TestHelper } from "../TestHelper";

describe("Tests:Sum", function() {
    before(async function () {
        console.log("Setting up for the test...");
        TestHelper.init({ owner: "john@contoso.com" });
    })

    it("Verify negative scenario", function() {
        assert(sum(2, 3) !== 4, "Verify sum of 2 & 3");
    })

    after(function () {
        console.log("Cleaning up after the test...");
    })
})
