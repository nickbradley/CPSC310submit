#! /bin/bash

TEST_REPO_URL=$1
STUDENT_REPO_URL=$2

TEST_REPO=/home/root/repos/test
STUDENT_REPO=/home/root/repos$(mktemp -d)


# Clone the testing repository if this is the first run
# otherwise, pull the latest version
if [[ -d "${TEST_REPO}" ]]
  then cd "${TEST_REPO}" && git pull
else
  git clone "${TEST_REPO_URL}"
fi

# Clone the students repository
REGEX="https://api.github.com/repos/(.*?)/(.*?)/pulls/([0-9]+)"
REGEX="https://api.github.com/repos/(.*)"
if [[ ${STUDENT_REPO_URL} =~ $REGEX ]]
then
  USER_NAME="${BASH_REMATCH[1]}"
  REPO_NAME="${BASH_REMATCH[2]}"
  PULL_REQUEST="${BASH_REMATCH[3]}"
else
  echo "${STUDENT_REPO_URL} is not in the correct input format."
  #exit 1
fi
#  git clone https://github.com/nickbradley/Test
#  git fetch origin pull/5/head
#  git checkout -b pullrequest FETCH_HEAD
mkdir -p "${STUDENT_REPO}" && cd "$_" \
&& git clone "https://github.com/${USER_NAME}/${REPO_NAME}" "$_" \
&& git fetch origin pull/${PULL_REQUEST}/head \
&& git checkout -b pullrequest FETCH_HEAD

# Run docker
echo "*** Begin test output ***"

#docker run cpsc310/tester -v "${TEST_REPO}":/test -v "${STUDENT_REPO}":/src
#docker run -v /var/run/docker.sock:/var/run/docker.sock fedora
docker run hello-world
echo "*** End test output ***"

rm -rf "${STUDENT_REPO}"
