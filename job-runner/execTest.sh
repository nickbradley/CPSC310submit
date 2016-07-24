#! /bin/bash

TEST_REPO_URL=$1
STUDENT_REPO_URL=$2

TEST_REPO=~/repos/test
STUDENT_REPO=~/repos$(mktemp -d)


# Clone the testing repository if this is the first run
# otherwise, pull the latest version
if [ -d "${TEST_REPO}" ]
  then cd "${TEST_REPO}" && git pull
else
  git clone "${TEST_REPO_URL}"
fi

# Clone the students repository
mkdir "${STUDENT_REPO}" && cd "$_" && git clone "$_"


# Run docker
echo "*** Begin test output ***"

docker run cpsc310/tester -v "${TEST_REPO}":/test -v "${STUDENT_REPO}":/src

echo "*** End test output ***"

rm -rf "${STUDENT_REPO}"
