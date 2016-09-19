<<<<<<< HEAD
FROM node:6.3.0
MAINTAINER Nick Bradley <nbrad11@cs.ubc.ca>

ENV MOCHAWESOME_REPORTDIR=/project/cpsc310project/mocha_output


CMD cd /project/cpsc310project && \
    npm run build && \
    cd /project/deliverable && \
    npm run testprog
=======
FROM node:6.3.0
MAINTAINER Nick Bradley <nbrad11@cs.ubc.ca>

ENV MOCHAWESOME_REPORTDIR=/project/cpsc310project/mocha_output

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
  npm run configure && \
  npm run build && \
  #npm install mochawesome && \
  #npm-do mocha -R mochawesome
  npm run testprog
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





# npm run clean
#
>>>>>>> master
