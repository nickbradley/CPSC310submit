#! /bin/bash

TEST_REPO_URL=$1
STUDENT_REPO_URL=$2

TEST_REPO=/repos/test
STUDENT_REPO=/repos/src



# Clone the testing repository if this is the first run
# otherwise, pull the latest version
#if [[ -d "${TEST_REPO}" ]]
# then cd "${TEST_REPO}" && git pull
#else
  git clone "${TEST_REPO_URL}" "${TEST_REPO}"
#fi

# Clone the students repository
REGEX="https://api.github.com/repos/(.*?)/(.*?)/pulls/([0-9]+)"
if [[ ${STUDENT_REPO_URL} =~ $REGEX ]]
then
  USER_NAME="${BASH_REMATCH[1]}"
  REPO_NAME="${BASH_REMATCH[2]}"
  PULL_REQUEST="${BASH_REMATCH[3]}"
else
  echo "${STUDENT_REPO_URL} is not in the correct input format."
  exit 1
fi
#  git clone https://github.com/nickbradley/Test
#  git fetch origin pull/5/head
#  git checkout -b pullrequest FETCH_HEAD
mkdir -p "${STUDENT_REPO}"
cd "${STUDENT_REPO}"
git clone "https://github.com/${USER_NAME}/${REPO_NAME}" "${STUDENT_REPO}"
git fetch origin pull/${PULL_REQUEST}/head
git checkout -b pullrequest FETCH_HEAD

# Run docker
echo "*** Begin test output ***"
echo docker run -v "${TEST_REPO}":/test -v "${STUDENT_REPO}":/src cpsc310/tester
docker run -v cpsc310-repo-test:/test -v cpsc310-repo-source:/src cpsc310/tester
#docker run -v "${TEST_REPO}":/test -v "${STUDENT_REPO}":/src cpsc310/tester
#docker run -v /var/run/docker.sock:/var/run/docker.sock fedora
#docker run hello-world
echo "*** End test output ***"

#rm -rf "${STUDENT_REPO}"
