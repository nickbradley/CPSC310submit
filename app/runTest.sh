#! /bin/bash

TEST_REPO_URL=$1
STUDENT_REPO_URL=$2

# Pares the student repository URL
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

# Clone the student repository into a temp directory
STUDENT_REPO=/repos/src$(mktemp -d)

mkdir -p "${STUDENT_REPO}" && cd "${STUDENT_REPO}" && \
git clone "https://github.com/${USER_NAME}/${REPO_NAME}" "${STUDENT_REPO}" && \
git fetch origin pull/${PULL_REQUEST}/head && \
git checkout -b pullrequest FETCH_HEAD

if [ $? -ne 0 ]
then
  echo "Error getting pull request from GitHub."
  exit 1
fi


# Set the test repository directory based on the pull request
case "${REPO_NAME}" in
"Test") TEST_REPO=/repos/test ;;
esac
#TEST_REPO=/repos/test 
# Clone the test repo if it doesn't already exist
if [[ ! -d "${TEST_REPO}" ]]
then
  git clone "${TEST_REPO_URL}" "${TEST_REPO}"
fi


# Run docker
echo "*** Begin test output ***"

docker run -v "${TEST_REPO}":/test:z -v "${STUDENT_REPO}":/src:z cpsc310/tester

echo "*** End test output ***"


rm -rf "${STUDENT_REPO}" || (echo "error removing" && exit 1);

exit 0
