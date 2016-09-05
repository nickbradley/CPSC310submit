FROM node:6.3.0
MAINTAINER Nick Bradley <nbrad11@cs.ubc.ca>

#CMD { \
#  cd /project/cpsc310project && \
#  npm run configure && \
#  npm run build && \
#  cd /project/cpsc310d1-priv && \
#  npm run configure && \
#  npm run build; \
#  } > /dev/null 2>&1 && \
#  npm run test && \
#  npm run coverage

CMD \
  cd /project/cpsc310project && \
  npm run configure && \
  npm run build && \
  cd /project/cpsc310d1-priv && \
  npm run configure && \
  npm run build && \
  npm run test && \
  npm run coverage
