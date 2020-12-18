const nconf = require("nconf");

export class TestOptions {
    owner = "";
}

export class TestHelper {
    static _instance: TestHelper;
    _jobId: string;
    _owner: string;

    constructor() {
        // Load command line arguments, environment variables and config.json into nconf
        nconf.argv().env();
        this._jobId = nconf.get("JobId");
    }

    // Common setup code that runs before each is executed
    static async commonTestSetup() {
        TestHelper._instance = new TestHelper();
    }

    // Common cleanup code after the test is done executing
    static async commonTestCleanup() {
        // For instance, 
        // Collect test telemetry and upload it to server
    }

    /**
     * Configure test context with the custom options set by test
     * @param options Test options
     */
    static async init(options) {
        TestHelper._instance = new TestHelper();
        TestHelper._instance._owner = options.owner;
    }
}