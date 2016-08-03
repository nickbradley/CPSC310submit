$Url = "https://nicholascbradley.com/cpsc310/test-service"


$Headers = @{
    "content-type"="application/json"
    "User-Agent"="GitHub-Hookshot/5a08997"
    "X-GitHub-Delivery"="76a8c680-5345-11e6-96f9-cb07774aa170"
    "X-GitHub-Event"="pull_request"
}


$Body = @"
{
  "action": "opened",
  "number": 8,
  "pull_request": {
    "url": "https://api.github.com/repos/nickbradley/Test/pulls/8",
    "id": 78872741,
    "html_url": "https://github.com/nickbradley/Test/pull/8",
    "diff_url": "https://github.com/nickbradley/Test/pull/8.diff",
    "patch_url": "https://github.com/nickbradley/Test/pull/8.patch",
    "issue_url": "https://api.github.com/repos/nickbradley/Test/issues/8",
    "number": 8,
    "state": "open",
    "locked": false,
    "title": "Update package.json",
    "user": {
      "login": "nickbradley",
      "id": 2560480,
      "avatar_url": "https://avatars.githubusercontent.com/u/2560480?v=3",
      "gravatar_id": "",
      "url": "https://api.github.com/users/nickbradley",
      "html_url": "https://github.com/nickbradley",
      "followers_url": "https://api.github.com/users/nickbradley/followers",
      "following_url": "https://api.github.com/users/nickbradley/following{/other_user}",
      "gists_url": "https://api.github.com/users/nickbradley/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/nickbradley/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/nickbradley/subscriptions",
      "organizations_url": "https://api.github.com/users/nickbradley/orgs",
      "repos_url": "https://api.github.com/users/nickbradley/repos",
      "events_url": "https://api.github.com/users/nickbradley/events{/privacy}",
      "received_events_url": "https://api.github.com/users/nickbradley/received_events",
      "type": "User",
      "site_admin": false
    },
    "body": "",
    "created_at": "2016-07-26T15:27:29Z",
    "updated_at": "2016-07-26T15:27:29Z",
    "closed_at": null,
    "merged_at": null,
    "merge_commit_sha": null,
    "assignee": null,
    "assignees": [

    ],
    "milestone": null,
    "commits_url": "https://api.github.com/repos/nickbradley/Test/pulls/8/commits",
    "review_comments_url": "https://api.github.com/repos/nickbradley/Test/pulls/8/comments",
    "review_comment_url": "https://api.github.com/repos/nickbradley/Test/pulls/comments{/number}",
    "comments_url": "https://api.github.com/repos/nickbradley/Test/issues/8/comments",
    "statuses_url": "https://api.github.com/repos/nickbradley/Test/statuses/9ea1ffa2fe424e464cc830fe6d6745e93dc117f9",
    "head": {
      "label": "nickbradley:master",
      "ref": "master",
      "sha": "9ea1ffa2fe424e464cc830fe6d6745e93dc117f9",
      "user": {
        "login": "nickbradley",
        "id": 2560480,
        "avatar_url": "https://avatars.githubusercontent.com/u/2560480?v=3",
        "gravatar_id": "",
        "url": "https://api.github.com/users/nickbradley",
        "html_url": "https://github.com/nickbradley",
        "followers_url": "https://api.github.com/users/nickbradley/followers",
        "following_url": "https://api.github.com/users/nickbradley/following{/other_user}",
        "gists_url": "https://api.github.com/users/nickbradley/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/nickbradley/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/nickbradley/subscriptions",
        "organizations_url": "https://api.github.com/users/nickbradley/orgs",
        "repos_url": "https://api.github.com/users/nickbradley/repos",
        "events_url": "https://api.github.com/users/nickbradley/events{/privacy}",
        "received_events_url": "https://api.github.com/users/nickbradley/received_events",
        "type": "User",
        "site_admin": false
      },
      "repo": {
        "id": 60927518,
        "name": "Test",
        "full_name": "nickbradley/Test",
        "owner": {
          "login": "nickbradley",
          "id": 2560480,
          "avatar_url": "https://avatars.githubusercontent.com/u/2560480?v=3",
          "gravatar_id": "",
          "url": "https://api.github.com/users/nickbradley",
          "html_url": "https://github.com/nickbradley",
          "followers_url": "https://api.github.com/users/nickbradley/followers",
          "following_url": "https://api.github.com/users/nickbradley/following{/other_user}",
          "gists_url": "https://api.github.com/users/nickbradley/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/nickbradley/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/nickbradley/subscriptions",
          "organizations_url": "https://api.github.com/users/nickbradley/orgs",
          "repos_url": "https://api.github.com/users/nickbradley/repos",
          "events_url": "https://api.github.com/users/nickbradley/events{/privacy}",
          "received_events_url": "https://api.github.com/users/nickbradley/received_events",
          "type": "User",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/nickbradley/Test",
        "description": "",
        "fork": false,
        "url": "https://api.github.com/repos/nickbradley/Test",
        "forks_url": "https://api.github.com/repos/nickbradley/Test/forks",
        "keys_url": "https://api.github.com/repos/nickbradley/Test/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/nickbradley/Test/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/nickbradley/Test/teams",
        "hooks_url": "https://api.github.com/repos/nickbradley/Test/hooks",
        "issue_events_url": "https://api.github.com/repos/nickbradley/Test/issues/events{/number}",
        "events_url": "https://api.github.com/repos/nickbradley/Test/events",
        "assignees_url": "https://api.github.com/repos/nickbradley/Test/assignees{/user}",
        "branches_url": "https://api.github.com/repos/nickbradley/Test/branches{/branch}",
        "tags_url": "https://api.github.com/repos/nickbradley/Test/tags",
        "blobs_url": "https://api.github.com/repos/nickbradley/Test/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/nickbradley/Test/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/nickbradley/Test/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/nickbradley/Test/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/nickbradley/Test/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/nickbradley/Test/languages",
        "stargazers_url": "https://api.github.com/repos/nickbradley/Test/stargazers",
        "contributors_url": "https://api.github.com/repos/nickbradley/Test/contributors",
        "subscribers_url": "https://api.github.com/repos/nickbradley/Test/subscribers",
        "subscription_url": "https://api.github.com/repos/nickbradley/Test/subscription",
        "commits_url": "https://api.github.com/repos/nickbradley/Test/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/nickbradley/Test/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/nickbradley/Test/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/nickbradley/Test/issues/comments{/number}",
        "contents_url": "https://api.github.com/repos/nickbradley/Test/contents/{+path}",
        "compare_url": "https://api.github.com/repos/nickbradley/Test/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/nickbradley/Test/merges",
        "archive_url": "https://api.github.com/repos/nickbradley/Test/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/nickbradley/Test/downloads",
        "issues_url": "https://api.github.com/repos/nickbradley/Test/issues{/number}",
        "pulls_url": "https://api.github.com/repos/nickbradley/Test/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/nickbradley/Test/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/nickbradley/Test/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/nickbradley/Test/labels{/name}",
        "releases_url": "https://api.github.com/repos/nickbradley/Test/releases{/id}",
        "deployments_url": "https://api.github.com/repos/nickbradley/Test/deployments",
        "created_at": "2016-06-11T20:57:25Z",
        "updated_at": "2016-06-19T20:14:12Z",
        "pushed_at": "2016-07-24T17:21:40Z",
        "git_url": "git://github.com/nickbradley/Test.git",
        "ssh_url": "git@github.com:nickbradley/Test.git",
        "clone_url": "https://github.com/nickbradley/Test.git",
        "svn_url": "https://github.com/nickbradley/Test",
        "homepage": null,
        "size": 20,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "JavaScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "has_pages": false,
        "forks_count": 2,
        "mirror_url": null,
        "open_issues_count": 8,
        "forks": 2,
        "open_issues": 8,
        "watchers": 0,
        "default_branch": "master"
      }
    },
    "base": {
      "label": "nickbradley:new-branch",
      "ref": "new-branch",
      "sha": "ab592d3a6652f708bbba2c9edc408fd5a2bb432c",
      "user": {
        "login": "nickbradley",
        "id": 2560480,
        "avatar_url": "https://avatars.githubusercontent.com/u/2560480?v=3",
        "gravatar_id": "",
        "url": "https://api.github.com/users/nickbradley",
        "html_url": "https://github.com/nickbradley",
        "followers_url": "https://api.github.com/users/nickbradley/followers",
        "following_url": "https://api.github.com/users/nickbradley/following{/other_user}",
        "gists_url": "https://api.github.com/users/nickbradley/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/nickbradley/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/nickbradley/subscriptions",
        "organizations_url": "https://api.github.com/users/nickbradley/orgs",
        "repos_url": "https://api.github.com/users/nickbradley/repos",
        "events_url": "https://api.github.com/users/nickbradley/events{/privacy}",
        "received_events_url": "https://api.github.com/users/nickbradley/received_events",
        "type": "User",
        "site_admin": false
      },
      "repo": {
        "id": 60927518,
        "name": "Test",
        "full_name": "nickbradley/Test",
        "owner": {
          "login": "nickbradley",
          "id": 2560480,
          "avatar_url": "https://avatars.githubusercontent.com/u/2560480?v=3",
          "gravatar_id": "",
          "url": "https://api.github.com/users/nickbradley",
          "html_url": "https://github.com/nickbradley",
          "followers_url": "https://api.github.com/users/nickbradley/followers",
          "following_url": "https://api.github.com/users/nickbradley/following{/other_user}",
          "gists_url": "https://api.github.com/users/nickbradley/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/nickbradley/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/nickbradley/subscriptions",
          "organizations_url": "https://api.github.com/users/nickbradley/orgs",
          "repos_url": "https://api.github.com/users/nickbradley/repos",
          "events_url": "https://api.github.com/users/nickbradley/events{/privacy}",
          "received_events_url": "https://api.github.com/users/nickbradley/received_events",
          "type": "User",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/nickbradley/Test",
        "description": "",
        "fork": false,
        "url": "https://api.github.com/repos/nickbradley/Test",
        "forks_url": "https://api.github.com/repos/nickbradley/Test/forks",
        "keys_url": "https://api.github.com/repos/nickbradley/Test/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/nickbradley/Test/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/nickbradley/Test/teams",
        "hooks_url": "https://api.github.com/repos/nickbradley/Test/hooks",
        "issue_events_url": "https://api.github.com/repos/nickbradley/Test/issues/events{/number}",
        "events_url": "https://api.github.com/repos/nickbradley/Test/events",
        "assignees_url": "https://api.github.com/repos/nickbradley/Test/assignees{/user}",
        "branches_url": "https://api.github.com/repos/nickbradley/Test/branches{/branch}",
        "tags_url": "https://api.github.com/repos/nickbradley/Test/tags",
        "blobs_url": "https://api.github.com/repos/nickbradley/Test/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/nickbradley/Test/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/nickbradley/Test/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/nickbradley/Test/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/nickbradley/Test/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/nickbradley/Test/languages",
        "stargazers_url": "https://api.github.com/repos/nickbradley/Test/stargazers",
        "contributors_url": "https://api.github.com/repos/nickbradley/Test/contributors",
        "subscribers_url": "https://api.github.com/repos/nickbradley/Test/subscribers",
        "subscription_url": "https://api.github.com/repos/nickbradley/Test/subscription",
        "commits_url": "https://api.github.com/repos/nickbradley/Test/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/nickbradley/Test/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/nickbradley/Test/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/nickbradley/Test/issues/comments{/number}",
        "contents_url": "https://api.github.com/repos/nickbradley/Test/contents/{+path}",
        "compare_url": "https://api.github.com/repos/nickbradley/Test/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/nickbradley/Test/merges",
        "archive_url": "https://api.github.com/repos/nickbradley/Test/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/nickbradley/Test/downloads",
        "issues_url": "https://api.github.com/repos/nickbradley/Test/issues{/number}",
        "pulls_url": "https://api.github.com/repos/nickbradley/Test/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/nickbradley/Test/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/nickbradley/Test/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/nickbradley/Test/labels{/name}",
        "releases_url": "https://api.github.com/repos/nickbradley/Test/releases{/id}",
        "deployments_url": "https://api.github.com/repos/nickbradley/Test/deployments",
        "created_at": "2016-06-11T20:57:25Z",
        "updated_at": "2016-06-19T20:14:12Z",
        "pushed_at": "2016-07-24T17:21:40Z",
        "git_url": "git://github.com/nickbradley/Test.git",
        "ssh_url": "git@github.com:nickbradley/Test.git",
        "clone_url": "https://github.com/nickbradley/Test.git",
        "svn_url": "https://github.com/nickbradley/Test",
        "homepage": null,
        "size": 20,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": "JavaScript",
        "has_issues": true,
        "has_downloads": true,
        "has_wiki": true,
        "has_pages": false,
        "forks_count": 2,
        "mirror_url": null,
        "open_issues_count": 8,
        "forks": 2,
        "open_issues": 8,
        "watchers": 0,
        "default_branch": "master"
      }
    },
    "_links": {
      "self": {
        "href": "https://api.github.com/repos/nickbradley/Test/pulls/8"
      },
      "html": {
        "href": "https://github.com/nickbradley/Test/pull/8"
      },
      "issue": {
        "href": "https://api.github.com/repos/nickbradley/Test/issues/8"
      },
      "comments": {
        "href": "https://api.github.com/repos/nickbradley/Test/issues/8/comments"
      },
      "review_comments": {
        "href": "https://api.github.com/repos/nickbradley/Test/pulls/8/comments"
      },
      "review_comment": {
        "href": "https://api.github.com/repos/nickbradley/Test/pulls/comments{/number}"
      },
      "commits": {
        "href": "https://api.github.com/repos/nickbradley/Test/pulls/8/commits"
      },
      "statuses": {
        "href": "https://api.github.com/repos/nickbradley/Test/statuses/9ea1ffa2fe424e464cc830fe6d6745e93dc117f9"
      }
    },
    "merged": false,
    "mergeable": null,
    "mergeable_state": "unknown",
    "merged_by": null,
    "comments": 0,
    "review_comments": 0,
    "commits": 1,
    "additions": 4,
    "deletions": 1,
    "changed_files": 1
  },
  "repository": {
    "id": 60927518,
    "name": "Test",
    "full_name": "nickbradley/Test",
    "owner": {
      "login": "nickbradley",
      "id": 2560480,
      "avatar_url": "https://avatars.githubusercontent.com/u/2560480?v=3",
      "gravatar_id": "",
      "url": "https://api.github.com/users/nickbradley",
      "html_url": "https://github.com/nickbradley",
      "followers_url": "https://api.github.com/users/nickbradley/followers",
      "following_url": "https://api.github.com/users/nickbradley/following{/other_user}",
      "gists_url": "https://api.github.com/users/nickbradley/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/nickbradley/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/nickbradley/subscriptions",
      "organizations_url": "https://api.github.com/users/nickbradley/orgs",
      "repos_url": "https://api.github.com/users/nickbradley/repos",
      "events_url": "https://api.github.com/users/nickbradley/events{/privacy}",
      "received_events_url": "https://api.github.com/users/nickbradley/received_events",
      "type": "User",
      "site_admin": false
    },
    "private": false,
    "html_url": "https://github.com/nickbradley/Test",
    "description": "",
    "fork": false,
    "url": "https://api.github.com/repos/nickbradley/Test",
    "forks_url": "https://api.github.com/repos/nickbradley/Test/forks",
    "keys_url": "https://api.github.com/repos/nickbradley/Test/keys{/key_id}",
    "collaborators_url": "https://api.github.com/repos/nickbradley/Test/collaborators{/collaborator}",
    "teams_url": "https://api.github.com/repos/nickbradley/Test/teams",
    "hooks_url": "https://api.github.com/repos/nickbradley/Test/hooks",
    "issue_events_url": "https://api.github.com/repos/nickbradley/Test/issues/events{/number}",
    "events_url": "https://api.github.com/repos/nickbradley/Test/events",
    "assignees_url": "https://api.github.com/repos/nickbradley/Test/assignees{/user}",
    "branches_url": "https://api.github.com/repos/nickbradley/Test/branches{/branch}",
    "tags_url": "https://api.github.com/repos/nickbradley/Test/tags",
    "blobs_url": "https://api.github.com/repos/nickbradley/Test/git/blobs{/sha}",
    "git_tags_url": "https://api.github.com/repos/nickbradley/Test/git/tags{/sha}",
    "git_refs_url": "https://api.github.com/repos/nickbradley/Test/git/refs{/sha}",
    "trees_url": "https://api.github.com/repos/nickbradley/Test/git/trees{/sha}",
    "statuses_url": "https://api.github.com/repos/nickbradley/Test/statuses/{sha}",
    "languages_url": "https://api.github.com/repos/nickbradley/Test/languages",
    "stargazers_url": "https://api.github.com/repos/nickbradley/Test/stargazers",
    "contributors_url": "https://api.github.com/repos/nickbradley/Test/contributors",
    "subscribers_url": "https://api.github.com/repos/nickbradley/Test/subscribers",
    "subscription_url": "https://api.github.com/repos/nickbradley/Test/subscription",
    "commits_url": "https://api.github.com/repos/nickbradley/Test/commits{/sha}",
    "git_commits_url": "https://api.github.com/repos/nickbradley/Test/git/commits{/sha}",
    "comments_url": "https://api.github.com/repos/nickbradley/Test/comments{/number}",
    "issue_comment_url": "https://api.github.com/repos/nickbradley/Test/issues/comments{/number}",
    "contents_url": "https://api.github.com/repos/nickbradley/Test/contents/{+path}",
    "compare_url": "https://api.github.com/repos/nickbradley/Test/compare/{base}...{head}",
    "merges_url": "https://api.github.com/repos/nickbradley/Test/merges",
    "archive_url": "https://api.github.com/repos/nickbradley/Test/{archive_format}{/ref}",
    "downloads_url": "https://api.github.com/repos/nickbradley/Test/downloads",
    "issues_url": "https://api.github.com/repos/nickbradley/Test/issues{/number}",
    "pulls_url": "https://api.github.com/repos/nickbradley/Test/pulls{/number}",
    "milestones_url": "https://api.github.com/repos/nickbradley/Test/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/nickbradley/Test/notifications{?since,all,participating}",
    "labels_url": "https://api.github.com/repos/nickbradley/Test/labels{/name}",
    "releases_url": "https://api.github.com/repos/nickbradley/Test/releases{/id}",
    "deployments_url": "https://api.github.com/repos/nickbradley/Test/deployments",
    "created_at": "2016-06-11T20:57:25Z",
    "updated_at": "2016-06-19T20:14:12Z",
    "pushed_at": "2016-07-24T17:21:40Z",
    "git_url": "git://github.com/nickbradley/Test.git",
    "ssh_url": "git@github.com:nickbradley/Test.git",
    "clone_url": "https://github.com/nickbradley/Test.git",
    "svn_url": "https://github.com/nickbradley/Test",
    "homepage": null,
    "size": 20,
    "stargazers_count": 0,
    "watchers_count": 0,
    "language": "JavaScript",
    "has_issues": true,
    "has_downloads": true,
    "has_wiki": true,
    "has_pages": false,
    "forks_count": 2,
    "mirror_url": null,
    "open_issues_count": 8,
    "forks": 2,
    "open_issues": 8,
    "watchers": 0,
    "default_branch": "master"
  },
  "sender": {
    "login": "nickbradley",
    "id": 2560480,
    "avatar_url": "https://avatars.githubusercontent.com/u/2560480?v=3",
    "gravatar_id": "",
    "url": "https://api.github.com/users/nickbradley",
    "html_url": "https://github.com/nickbradley",
    "followers_url": "https://api.github.com/users/nickbradley/followers",
    "following_url": "https://api.github.com/users/nickbradley/following{/other_user}",
    "gists_url": "https://api.github.com/users/nickbradley/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/nickbradley/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/nickbradley/subscriptions",
    "organizations_url": "https://api.github.com/users/nickbradley/orgs",
    "repos_url": "https://api.github.com/users/nickbradley/repos",
    "events_url": "https://api.github.com/users/nickbradley/events{/privacy}",
    "received_events_url": "https://api.github.com/users/nickbradley/received_events",
    "type": "User",
    "site_admin": false
  }
}
"@





add-type @"
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    public class TrustAllCertsPolicy : ICertificatePolicy {
        public bool CheckValidationResult(
            ServicePoint srvPoint, X509Certificate certificate,
            WebRequest request, int certificateProblem) {
            return true;
        }
    }
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy
#[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

for ($i=0; $i -lt 15; $i++) {
    Invoke-WebRequest -Uri $Url -Headers $Headers -Method Post -Body $Body
}










