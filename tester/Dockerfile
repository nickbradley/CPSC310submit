FROM node:6.3.0
MAINTAINER Nick Bradley <nbrad11@cs.ubc.ca>

ENV MOCHAWESOME_REPORTDIR=/project/cpsc310project/mocha_output


CMD { cd /project/cpsc310project && \
      (npm run build || exit 7) && \
      cd /project/deliverable } && \
    { npm run build; \
      (npm run testprog || exit 9) }
