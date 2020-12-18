const { TestHelper } = require("./bin/TestHelper");

exports.mochaHooks = {
    // Executes before every test
    async beforeEach() {
        console.log(`Executing beforeEach root hook for test: ${this.currentTest.fullTitle()}`);
    },

    // Executes after every test
    async afterEach() {
        console.log(`Executed afterEach root hook for test: ${this.currentTest.fullTitle()}`);
    },

    // Executes once before all the tests start executing. In parallel mode, this is expected to run before each file.
    async beforeAll() {
        this._runnable.parent.suites.forEach((suite) => {
            // Set up test as part of beforeAll
            const origTestBeforeHook = suite._beforeAll[0].fn;
            suite._beforeAll[0].fn = async function() {
                // Plug in any common code that needs to execute for each test
                // Run some code before the test's before hook gets a chance to run. Typically some common test setup stuff.
                console.log(`Executing common test setup code`);
                await TestHelper.commonTestSetup(this.currentTest);

                try {
                    console.log(`Executing "before" hook`);
                    const testBeforeHook = origTestBeforeHook.bind(this);
                    await testBeforeHook();
                } catch (error) {
                    console.log(`Exception in "before" hook for test, Message: ${error}`);
                    throw error;
                }
            }

            // Finalize telemetry as part of afterAll
            const origTestAfterHook = suite._afterAll[0].fn;
            suite._afterAll[0].fn = async function() {
                try {
                    console.log(`Executing "after" hook`);
                    const testAfterHook = origTestAfterHook.bind(this);
                    await testAfterHook();
                } catch (error) {
                    console.log(`Exception in "after" hook, Message: ${error}`);
                }

                // Plug in any common code that needs to execute for each test
                // Run some code after the test's after hook gets a chance to run. Typically some common post test cleanup.
                console.log(`Executing common test cleanup code`);
                await TestHelper.commonTestCleanup();
            }
        });
    },

    // Executes after all the tests have executed. In parallel mode, this is expected to run after each file.
    async afterAll() {
        console.log("Executing afterAll root hook");
    }
};