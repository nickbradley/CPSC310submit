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
TMP_DIR=/repos${TMP:4}
STUDENT_REPO=/repos${TMP:4}
mkdir -p "${STUDENT_REPO}"
cd "${STUDENT_REPO}"
git clone "${STUDENT_REPO_URL}" "${STUDENT_REPO}"

# If a commit SHA is specified then checkout a test branch at the commit
if [[ -n "${COMMIT}" ]]
then
  # Assume the third parameter is a date if it doesn't contain a letter
  if [[ ! "${COMMIT}" =~ .*[a-zA-Z].* ]]
  then
    COMMIT=`git rev-list -n 1 --before="${COMMIT}" master`
  fi
  git checkout -b test_branch "${COMMIT}"
fi

# Clone/pull the test suite repo
TEST_REPO=/repos/${TEST_REPO_NAME}

if [[ -d "${TEST_REPO}" ]]
then
  cd "${TEST_REPO}"
  git pull ${TEST_REPO_URL}

  # if not already up-to-date, npm ...

else
  git clone ${TEST_REPO_URL} "${TEST_REPO}"
  # run npm clean...
fi

#ln -s "${TEST_REPO}" "${TMP_DIR}/${TEST_REPO_NAME}"

# Run docker
echo "*** Begin test output ***"

#cd "${STUDENT_REPO}"
#npm run clean
#npm run configure
#npm run build
#cd "${TMP_DIR}/${TEST_REPO_NAME}"
##npm run clean
##npm run configure
##npm run build
#npm run test


docker run -v "${TEST_REPO}":/project/deliverable:z -v "${STUDENT_REPO}":/project/cpsc310project:z --privileged cpsc310/tester || true



#docker run -v "${TEST_REPO}":/project/deliverable:z \
#           #-v "/repos/test":/project/deliverable/mochawesome-reports \
#           -v "${STUDENT_REPO}":/project/cpsc310project:z \
#           #-e MOCHAWESOME_REPORTDIR
#           --privileged cpsc310/tester || true

#echo "Output from docker testing container here."

echo "*** End test output ***"


#rm -rf "${STUDENT_REPO}"

exit 0
