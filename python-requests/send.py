"""Send a transactional email with the Mailbase REST API.

    export MAILBASE_API_KEY=mb_live_...
    python send.py you@example.com
"""
import datetime
import json
import os
import sys

import requests

API_URL = os.environ.get("MAILBASE_API_URL", "https://mailbase.studio")


def send_email(idempotency_key: str, **email) -> dict:
    api_key = os.environ.get("MAILBASE_API_KEY")
    if not api_key:
        raise SystemExit("Set MAILBASE_API_KEY (Settings -> API & webhooks in Mailbase).")

    res = requests.post(
        f"{API_URL}/api/v1/send",
        headers={
            "Authorization": f"Bearer {api_key}",
            # Same key + same body on a retry = recipients already accepted are not mailed again.
            "Idempotency-Key": idempotency_key,
        },
        json=email,
        timeout=30,
    )
    if res.status_code != 202:
        # 400 bad body, 401/403 key, 409 held for review, 422 blocked, 429 quota or rate limit, 503 not set up.
        retry = res.headers.get("Retry-After")
        raise RuntimeError(f"Mailbase answered {res.status_code}: {res.text}" + (f" (retry after {retry}s)" if retry else ""))
    # {"ok": ..., "campaignId": ..., "sent": [...], "failed": [...]}
    return res.json()


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python send.py <recipient@example.com>", file=sys.stderr)
        return 2
    to = sys.argv[1]
    result = send_email(
        idempotency_key=f"hello-{to}-{datetime.date.today().isoformat()}",
        to=to,
        subject="Hello from the Mailbase API",
        html="<p>It works. This email was sent with one <code>requests.post</code> call.</p>",
        text="It works. This email was sent with one requests.post call.",
        transactional=True,
    )
    print(json.dumps(result, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
