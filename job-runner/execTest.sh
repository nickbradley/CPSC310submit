#! /bin/bash

TEST_REPO_URL=$1
STUDENT_REPO_URL=$2

TEST_REPO=/home/root/repos/test
STUDENT_REPO=/home/root/repos$(mktemp -d)


# Clone the testing repository if this is the first run
# otherwise, pull the latest version
if [ -d "${TEST_REPO}" ]
  then cd "${TEST_REPO}" && git pull
else
  git clone "${TEST_REPO_URL}"
fi

# Clone the students repository
mkdir -p "${STUDENT_REPO}" && cd "$_" && git clone ${STUDENT_REPO_URL} "$_"


# Run docker
echo "*** Begin test output ***"

#docker run cpsc310/tester -v "${TEST_REPO}":/test -v "${STUDENT_REPO}":/src
docker run -v /var/run/docker.sock:/var/run/docker.sock fedora

echo "*** End test output ***"

rm -rf "${STUDENT_REPO}"
