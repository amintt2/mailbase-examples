# Python + requests + Mailbase

```sh
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
export MAILBASE_API_KEY=mb_live_...        # email:send scope
python send.py you@example.com
```

[`send.py`](send.py) holds `send_email()`: one `requests.post` with the
`Authorization` and `Idempotency-Key` headers. It exits 0 when every recipient
was accepted, 1 otherwise.
