# Database Data Model
## AutoTest Request Document
This is the document that will be stored after servicing a user's request. The document
will have the structure:

| Key           | Value Description                                             |
| ------------- | ------------------------------------------------------------- |
| _id           | Auto-generated uid                                            |
| _rev          | Auto-generated document revision number                       |
| requestCommit | Either the commit SHA or a datetime corresponding to the commit to run tests against |
| actualCommit  | The commit SHA that was actually checked-out                  |
| scriptStdout  | The stdout output from the script                             |
| scriptStderr  | The stderr output from the script                             |
| report        | JSON output from test reporter (moachawesome)                 |
| team          | Team's repository name                                        |
| user          | GitHub user id of the team member making the request (could also be an admin user id or CPSC310Bot it doing the real test) |
| timestamp     | Unix Epoch timestamp at date of insertion                     |
| displayText   | The result of testing as displayed to the user on GitHub      |
| conversation  | [Not Implemented] Store the text of the initial request and all subsequent messages that are displayed on GitHub for the request. |
| deliverable   | Which deliverable tests were run                              |
