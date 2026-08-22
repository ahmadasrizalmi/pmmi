import re, os
profiles = "/srv/pmmi/hermes-home/.hermes/profiles"
target = os.environ.get("PROFILE", "pmmi-iso-c")
p = f"{profiles}/{target}/config.yaml"
print("exists:", os.path.exists(p))
s = open(p).read()
s = re.sub(r"base_url:.*", "base_url: http://100.127.181.108:20128/v1", s)
open(p, "w").write(s)
print(open(p).read())
