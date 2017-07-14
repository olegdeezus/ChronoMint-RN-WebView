#!/bin/bash
echo "Fixing third-party libs in react-native"
cd node_modules/react-native
scripts/ios-install-third-party.sh
cd third-party/glog-*/
../../scripts/ios-configure-glog.sh
cd ../../../../