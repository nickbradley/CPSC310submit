#FROM node:6.3.0
#FROM node:4
FROM node:6
#FROM kenjones/nodejs-mocha
##FROM djudorange/node-gulp-mocha
MAINTAINER Nick Bradley <nbrad11@cs.ubc.ca>

ENV MOCHAWESOME_REPORTDIR=/project/cpsc310project/mocha_output

#CMD { ping 198.162.54.129 -c 2; exit 7; }
CMD { cd /project/cpsc310project && \
      { npm run build || exit 7; } && \
      cd /project/deliverable; } && \
    { npm run build; { npm run testprog || exit 9; }; } 2>&1 && exit 0;
