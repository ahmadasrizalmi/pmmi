#!/bin/bash
sed -i 's|chmod -R 777 "$profile_dir"|chmod -R 777 "$profile_dir" 2>/dev/null \|\| true|' /usr/local/bin/hermes
sed -i 's|chmod -R 777 "$ws"|chmod -R 777 "$ws" 2>/dev/null \|\| true|' /usr/local/bin/hermes
sed -i 's|chmod -R 777 "$profile_dir" "$ws" 2>/dev/null \|\| true|chmod -R 777 "$profile_dir" "$ws" 2>/dev/null \|\| true|' /usr/local/bin/hermes
