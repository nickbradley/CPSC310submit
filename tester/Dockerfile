FROM node:6.3.0
MAINTAINER Nick Bradley <nbrad11@cs.ubc.ca>

CMD { \
  cd /project/cpsc310project && \
  npm run configure && \
  npm run build && \
  cd /project/deliverable && \
  npm run configure && \
  npm run build; \
  #} > /dev/null 2>&1 && \
  } > /dev/null && \
  cd /project/deliverable && \
  npm run test
  #&& \
#  npm run coverage

#CMD \
#  cd /project/cpsc310project && \
#  npm run clean && \
#  npm run configure && \
#  npm run build && \
#  cd /project/deliverable && \
#  npm run clean && \
#  npm run configure && \
#  npm run build && \
#  #npm -g install mocha-spec-json-reporter && \
#  #./node_modules/.bin/mocha -R mocha-spec-json-reporter
#  #npm run "mocha -R mocha-spec-json-reporter"
#  npm run test
#   #&& cat npm-debug.log #&& \
#  #npm run coverage
