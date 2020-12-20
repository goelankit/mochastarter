# Mocha starter project

## Overview 
This project provides a sample for setting up your NodeJS & typescript based mocha test project. A setup that would scale well for hundreds of tests, able to run them in parallel, be able to collect telemetry for tests etc.

## How to execute tests
Execute the following npm scripts on the terminal, to get started.

```
npm install
npm run build
npm run test
```

## Key concepts
The following section describes some of the key concepts covered as part of this starter project. 

### Setup root hooks (async)
Root hooks are mocha constructs, that allow for some executing some code before/after each test and suite of tests. These can be used to run some common test code that needs to execute across tests, like initializing the tests, tests telemetry, cleaning up after the tests are done executing. Note- There are some quirks to how the common hooks are executed in parallel vs sequenced mode. Refer to mochaJS documentation for more here https://mochajs.org/#available-root-hooks.

More often than not, you would be doing some heavy work during the test suite init and finalization steps that gets handled by root hooks, and in such cases you want the hooks to be running asynchronously. 

Here's a snapshot of specifying asynchronous root hooks.

```
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
        console.log("Executing afterAll root hook");
    },

    // Executes after all the tests have executed. In parallel mode, this is expected to run after each file.
    async afterAll() {
        console.log("Executing afterAll root hook");
    }
};
```

Put the root hooks in a file, say TestHooks.js. Here's how you would configure root hooks to be loaded for tests execution.

```
mocha --require TestHooks.js
```

Mocha doesn't do a very good job of reporting & handling any errors/exceptions in the hooks. Some reporters might also miss reporting on failures in hooks all together, more so while native support for mocha parallel test runs is still in nascent stages. It is a good idea to do some of the exception handling in the root hooks to handle cases. 

Here's a sample implementation of beforeAll root hook, to handle exceptions being thrown from before hooks in the individual tests.

```
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

```

### Configure tests for parallel execution
Mocha v8.0.0 added native support for running the tests in parallel. Mocha has added 2 new parameters for this purpose. 
*--parallel*  to specify tests to run in parallel mode
*--jobs* to specify the number of tests to run in parallel at a time

Here's the npm script to execute from terminal to execute the tests in parallel.

```
npm run test:parallel
```

### Configure VSCode debug & task configuration for tests execution

You can configure the debug configurations in VS Code, to launch and step through the tests. 

Here's a sample VS Code configuration to execute a given test.

        {
            "type": "node",
            "request": "launch",
            "name": "Execute test",
            "program": "${workspaceFolder}\\node_modules\\mocha\\bin\\_mocha",
            "outFiles": [
                "${workspaceFolder}\\bin\\**\\*.js"
            ],
            "smartStep": true,
            "sourceMaps": true,
            "runtimeArgs": [
                "--preserve-symlinks"
            ],
            "args": [
                "bin\\${relativeFileDirname}\\${fileBasenameNoExtension}.js",
                "--require=TestHooks.js",
            ],
            "env": {
                "JobId": "uniqueJobId"
            }
        }

You an also configure VS Code tasks to execute tests *without debugging*. 

Here's a sample VS Code configuration to execute a given test without debugging.

        {
            "label": "Execute test",
            "type": "shell",
            "command": "npm run test -- bin\\${relativeFileDirname}\\${fileBasenameNoExtension}.js",
            "problemMatcher": [],
        },
