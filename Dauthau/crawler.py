import requests
import json
import ssl
import time

# 1. Cấu hình SSL Adapter
class DESAdapter(requests.adapters.HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        context = ssl.create_default_context()
        context.check_hostname = False
        context.verify_mode = ssl.CERT_NONE
        context.set_ciphers('DEFAULT@SECLEVEL=1')
        kwargs['ssl_context'] = context
        return super(DESAdapter, self).init_poolmanager(*args, **kwargs)

def get_khlcnt_name(session, plan_no, headers, search_url):
    """Sử dụng chính API Search để tìm tên của KHLCNT"""
    if not plan_no: return "N/A"
    
    # Payload tìm kiếm chính xác mã KHLCNT
    detail_payload = {
        "pageSize": 1,
        "pageNumber": 0,
        "query": [{
            "index": "es-plan-project-v2",
            "keyWord": plan_no,
            "matchType": "all",
            "matchFields": ["planNo"],
            "filters": []
        }]
    }
    
    try:
        time.sleep(0.5)
        # Lưu ý: Gửi trực tiếp Object {}, không bọc trong mảng [] nếu bị lỗi 400
        res = session.post(search_url, headers=headers, json=detail_payload, timeout=20)
        if res.status_code == 200:
            data = res.json()
            # Xử lý trường hợp trả về list hoặc dict
            content = data[0].get('page', {}).get('content', []) if isinstance(data, list) else data.get('page', {}).get('content', [])
            if content:
                return content[0].get('name') or content[0].get('planName')
        return "N/A"
    except:
        return "Lỗi truy vấn"

# 2. Thiết lập Session
session = requests.Session()
session.mount("https://muasamcong.mpi.gov.vn", DESAdapter())

# URL Search (Bỏ token nếu không cần thiết)
search_url = "https://muasamcong.mpi.gov.vn/o/egp-portal-contractor-selection-v2/services/smart/search"

# Cập nhật COOKIE mới nhất tại đây (BẮT BUỘC)
headers = {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'Origin': 'https://muasamcong.mpi.gov.vn',
    'Referer': 'https://muasamcong.mpi.gov.vn/web/guest/contractor-selection?render=index',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Cookie': 'JSESSIONID=z1UQNcpo1IzNpyvRU-eWIK_KVVGLcDPMeJqOVHrc.dc-app1-03;' 
}

# 3. Payload lấy danh sách TBMT (Đã chuyển về dạng Object {} để tránh lỗi 400)
search_payload = {
    "pageSize": 10,
    "pageNumber": 0,
    "query": [{
        "index": "es-contractor-selection",
        "keyWord": "",
        "matchType": "all-1",
        "matchFields": ["notifyNo", "bidName"],
        "filters": [
            {"fieldName": "type", "searchType": "in", "fieldValues": ["es-notify-contractor"]},
            {"fieldName": "caseKHKQ", "searchType": "not_in", "fieldValues": ["1"]}
        ]
    }]
}

try:
    print("--- Đang kết nối Muasamcong ---")
    # Gửi search_payload (dạng Object)
    response = session.post(search_url, headers=headers, json=search_payload)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        results = response.json()
        # Xác định root data
        data_root = results[0] if isinstance(results, list) else results
        content_list = data_root.get('page', {}).get('content', [])

        print(f"{'Mã TBMT':<15} | {'Mã KHLCNT':<15} | {'Tên KHLCNT'}")
        print("-" * 110)
        
        plan_cache = {}
        for item in content_list:
            tb_no = item.get('notifyNo')
            p_no = item.get('planNo')
            
            if p_no and p_no not in plan_cache:
                plan_cache[p_no] = get_khlcnt_name(session, p_no, headers, search_url)
            
            print(f"{tb_no:<15} | {p_no:<15} | {plan_cache.get(p_no, 'N/A')}")
    else:
        print(f"Lỗi: {response.text}")

except Exception as e:
    print(f"Lỗi hệ thống: {e}")