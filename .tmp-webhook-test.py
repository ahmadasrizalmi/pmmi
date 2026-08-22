import base64, hashlib, hmac, json, sys, time, uuid, subprocess

URL = "https://ai.pondokmultimedia.id/v1/integrations/resend/webhook"
SECRET = base64.b64decode("z+EU1pWUX+KxjOUrQQIH38XncgnCYBW0")  # stripped whsec_

def email_id():
    r = subprocess.run(
        ["docker", "exec", "postgres", "psql", "-U", "pmmi", "-d", "pmmi", "-tAc",
         "select provider_message_id from notification_deliveries where channel='EMAIL' and provider_message_id like '%-%-%-%-%' order by created_at desc limit 1"],
        capture_output=True, text=True)
    return r.stdout.strip()

def send(event_type):
    eid = email_id()
    body = json.dumps({"type": event_type, "data": {"email_id": eid, "created_at": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())}})
    sid = str(uuid.uuid4())
    ts = str(int(time.time()))
    sig = base64.b64encode(hmac.new(SECRET, f"{sid}.{ts}.{body}".encode(), hashlib.sha256).digest()).decode()
    import urllib.request
    req = urllib.request.Request(URL, data=body.encode(), method="POST",
        headers={"svix-id": sid, "svix-timestamp": ts, "svix-signature": f"v1,{sig}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            print(f"{event_type}: HTTP {resp.status} {resp.read().decode()}")
    except urllib.error.HTTPError as e:
        print(f"{event_type}: HTTP {e.code} {e.read().decode()}")
    return eid

print("=== test 1: email.delivered ===")
eid1 = send("email.delivered")
print("=== test 2: email.bounced (row should flip FAILED) ===")
send("email.bounced")

import time as t
t.sleep(2)
for eid in (eid1,):
    r = subprocess.run(["docker", "exec", "postgres", "psql", "-U", "pmmi", "-d", "pmmi", "-tAc",
        f"select channel,status,delivered_at is not null from notification_deliveries where provider_message_id='{eid}'"],
        capture_output=True, text=True)
    print(f"row for {eid}: {r.stdout.strip()}")
