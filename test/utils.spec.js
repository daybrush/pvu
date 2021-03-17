const {
    getNextPackageVersion
} = require("../utils");

describe("test utils", () => {
    it("test getNextPackageVersion", () => {


        // patch
        expect(getNextPackageVersion("0.1.0", "0.1.0", "0.1.0-beta.1")).toBe("0.1.1");
        expect(getNextPackageVersion("0.1.0", "0.1.1", "0.1.0-beta.1")).toBe("0.1.1");
        expect(getNextPackageVersion("0.1.0", "0.1.1", "0.1.0")).toBe("0.1.1");
        
        // minor
        expect(getNextPackageVersion("0.1.0", "0.2.0", "0.1.0")).toBe("0.2.0");
        expect(getNextPackageVersion("0.1.0", "0.2.0", "0.1.1")).toBe("0.2.0");
        expect(getNextPackageVersion("0.1.0", "0.2.0", "0.1.1")).toBe("0.2.0");
        expect(getNextPackageVersion("0.1.1-beta.1", "0.2.0", "0.1.1-beta.1")).toBe("0.2.0");
        expect(getNextPackageVersion("0.1.1", "0.2.0", "0.1.1-beta.1")).toBe("0.2.0");

        // major
        expect(getNextPackageVersion("0.1.0", "1.0.0", "0.1.0")).toBe("1.0.0");

        // unit
        expect(getNextPackageVersion("0.1.0-beta.1", "0.1.0", "0.1.0-beta.1")).toBe("0.1.0");
        expect(getNextPackageVersion("0.0.1", "0.1.0-beta.0", "0.0.1")).toBe("0.1.0-beta.0");
        expect(getNextPackageVersion("0.0.0-beta.0", "0.1.0-beta.1", "0.1.0-beta.0")).toBe("0.0.0-beta.1");
        
    })
})