import requests
import ssl
from urllib3.poolmanager import PoolManager
from requests.adapters import HTTPAdapter
import urllib3

urllib3.disable_warnings()

# 🔥 Fix SSL
class TLSAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        ctx = ssl.create_default_context()
        ctx.set_ciphers('DEFAULT:@SECLEVEL=1')
        kwargs['ssl_context'] = ctx
        return super().init_poolmanager(*args, **kwargs)

session = requests.Session()
session.mount("https://", TLSAdapter())

url = "https://muasamcong.mpi.gov.vn/o/egp-portal-contractors-approved/services/get-list"

headers = {
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json",
    "origin": "https://muasamcong.mpi.gov.vn",
    "referer": "https://muasamcong.mpi.gov.vn/web/guest/approved-contractors-list",
    "user-agent": "Mozilla/5.0",
    "cookie": "COOKIE_SUPPORT=true; GUEST_LANGUAGE_ID=vi_VN; JSESSIONID=TVq5m-jFNt5Bxk-wSZjnPXr8dKTsfvQS-skMwuBy.dc-app1-03"
}
payload = {
    "pageNumber": 0,
    "pageSize": 10,
    "queryParams": {
        "agencyName": {"in": None},
        "decNo": {"contains": None},
        "effRoleDate": {
            "greaterThanOrEqual": None,
            "lessThanOrEqual": None
        },
        "isForeignInvestor": {"equals": None},
        "officePro": {"contains": None},
        "orgName": {"contains": None},
        "orgNameOrOrgCode": {"contains": ""},
        "roleType": {"in": ["NT", "NTPER"]},
        "taxCode": {"contains": None}
    }
}

res = session.post(url, json=payload, headers=headers)

print("Status:", res.status_code)
print(res.text)