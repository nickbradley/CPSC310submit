#!/usr/bin/env bash
# app.sh
# Nick Bradley <nbrad11@cs.ubc.ca>
#
# Description:
# Clones (or pulls) the specified testing suite repository and team repository.
# Runs the testing container with the test repo and student repo mounted.
#
# Parameters:
# $1: The full url (including username and password) to clone the test suite from github
#     https://<username>:<password>@github.com/CS310-2016Fall/cpsc310d1-priv.git
#
# $2: The full url (including username and password) to clone the student repo from github
#     https://<username>:<password>@github.com/CS310-2016Fall/cpsc310project_team1.git
#
# $3: The commit SHA to test
#     Can be of the form 23h34dn or the latest date
#
# Requires:
#   - git
#   - node/npm
###############################################################################

set -o errexit  # exit on command failure
set -o pipefail # exit if any command in pipeline fails
set -o nounset  # exit if undeclared variable is used
# set -o xtrace  # debug


TEST_REPO_URL="${1}"
STUDENT_REPO_URL="${2}"
COMMIT="${3:-}"

TEST_REPO_FULLNAME=${TEST_REPO_URL##*/}
TEST_REPO_NAME=${TEST_REPO_FULLNAME%%.*}



# Clone the team's repo to a temporary folder and checkout a test branch at the
# specified commit SHA

TMP=$(mktemp -d)
STUDENT_REPO=/repos${TMP:4}
echo "Student repo path: ${STUDENT_REPO}"

mkdir -p "${STUDENT_REPO}"
cd "${STUDENT_REPO}"
git clone -c user.email="cpsc310bot@gmail.com" -c user.name="cpsc310bot" "${STUDENT_REPO_URL}" "${STUDENT_REPO}"

# If a commit SHA is specified then checkout a test branch at the commit
if [[ -n "${COMMIT}" ]]
then
  # Assume the third parameter is a date if it doesn't contain a letter
  if [[ ! "${COMMIT}" =~ .*[a-zA-Z].* ]]
  then
    # We assume ${COMMIT} is of the form 2016-09-30 12:00:00:00
    # The line below returns the latest commit SHA before the date
    COMMIT=`git rev-list -n 1 --before="${COMMIT}" master`
  fi
  git checkout -b test_branch "${COMMIT}"
fi

# Remove node_modules and typings dirs if team commited them
rm -rf node_modules || true
rm -rf typings || true



## debug
#git show --oneline
#echo "${COMMIT:0:7}"
#ls -a
##

# Checkout the latest version of the test suite repo
TEST_REPO=/repos/${TEST_REPO_NAME}
echo "Test repo path: ${TEST_REPO}"
(>&2 echo "Test repo")

if [[ -d "${TEST_REPO}" ]]
then
  cd "${TEST_REPO}"
  echo "fetching private test repo"
  (>&2 echo "fetching private test repo")
  git fetch #-c user.email="cpsc310bot@gmail.com" -c user.name="cpsc310bot"
  LOCAL=$(git rev-parse @{0})
  REMOTE=$(git rev-parse @{u})
  if [ ${LOCAL} != ${REMOTE} ]
  then
      echo "Updating test repo"
      (>&2 echo "Updating test repo")
      #git config user.name "cpsc310bot"
      #git config user.email "cpsc310bot@gmail.com"
      #git add .git/config
      #git commit -m "some init msg"

      (>&2 echo "Updating test repo1")
      #git pull #-c user.email="cpsc310bot@gmail.com" -c user.name="cpsc310bot"
      (>&2 echo "Updating test repo2")

      git reset --hard origin/master
      npm run clean
      npm run configure
  #    npm run build
  fi
else
  echo "Cloning test repo"
  (>&2 echo "Cloning test repo")
  git clone -c user.email="cpsc310bot@gmail.com" -c user.name="cpsc310bot" "${TEST_REPO_URL}" "${TEST_REPO}"
  cd "${TEST_REPO}"
  npm run configure
  #npm run build
fi

echo "******** Container output follows **********"
(>&2 echo "******** Container output follows **********")
(>&2 docker run --volume "${TEST_REPO}":/project/deliverable:z \
           --volume "${STUDENT_REPO}":/project/cpsc310project:z \
           --volume "${TEST_REPO}"/node_modules:/project/cpsc310project/node_modules:ro \
           --volume "${TEST_REPO}"/typings:/project/cpsc310project/typings:ro \
           --net=none \
           --attach STDOUT \
           --attach STDERR \
           cpsc310/tester || true)





echo "%@%@COMMIT:${COMMIT:0:7}###"
cat "${STUDENT_REPO}"/mocha_output/mochawesome.json
echo "%@%@"

rm -rf "${STUDENT_REPO}"

exit 0
