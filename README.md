# CPSC 310 Automated Testing Service for GitHub
This testing service consumes pull request webhooks for configured repositories on GitHub. Upon receiving a request, the service will clone the repository, run the tests and publish the results as a comment on the pull request.


## Configuring the Webhook
For each repository
1. Go to **Settings**, **Webhooks & services**
2. Click **Add webhook**
3. Configure the webhook:
  1. In the _Payload URL_ field, enter <hostname>/cpsc310/test-service
  2. Click **Disable SSL verification**
  3. Under Which events would you like to trigger this webhook?, select _Let me select individual events._ and choose only _Pull request_.




# Database
## Sturcture
_id: <user_name>_<repo_name>
abbrv_results:[]
last_run: <date>
num_runs: int
results: []


curl -k -X PUT 'https://192.168.0.57/cpsc310/admin/cpsc310/nickbradley_Test' -H 'content-type:application/json' -d '{"last_run":null}'
