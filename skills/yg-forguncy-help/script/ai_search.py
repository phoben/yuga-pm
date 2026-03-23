import http.client
import json
import argparse
import ssl
from typing import Any, Dict, Optional


HOST = "ai_agent.grapecity.com.cn"
ENDPOINT = "/chat_streaming/"
PRODUCT = "forguncy"
TIMEOUT_SECONDS = 60.0
VERIFY_SSL = False


def build_payload(keyword: str, product: str) -> Dict[str, Any]:
   return {
      "keyword": keyword,
      "messages": [
         {
            "role": "user",
            "content": keyword
         }
      ],
      "product": product
   }


def parse_streaming_text(raw_text: str) -> str:
   parts = []
   for line in raw_text.splitlines():
      line = line.strip()
      if not line or not line.startswith("data:"):
         continue
      data_str = line[len("data:"):].strip()
      if not data_str or data_str == "[DONE]":
         continue
      try:
         obj = json.loads(data_str)
      except Exception:
         continue
      if isinstance(obj, dict) and isinstance(obj.get("text"), str):
         parts.append(obj["text"])
   if parts:
      return "".join(parts)
   return raw_text


def parse_streaming_events(raw_text: str) -> list[Dict[str, Any]]:
   events: list[Dict[str, Any]] = []
   for line in raw_text.splitlines():
      line = line.strip()
      if not line or not line.startswith("data:"):
         continue
      data_str = line[len("data:"):].strip()
      if not data_str or data_str == "[DONE]":
         continue
      try:
         obj = json.loads(data_str)
      except Exception:
         continue
      if isinstance(obj, dict):
         events.append(obj)
   return events


def request_ai_search_raw(
   keyword: str,
) -> str:
   context = ssl.create_default_context() if VERIFY_SSL else ssl._create_unverified_context()
   conn = http.client.HTTPSConnection(HOST, timeout=TIMEOUT_SECONDS, context=context)
   payload = json.dumps(build_payload(keyword=keyword, product=PRODUCT), ensure_ascii=False).encode("utf-8")
   headers = {"Content-Type": "application/json"}

   try:
      conn.request("POST", ENDPOINT, payload, headers)
      res = conn.getresponse()
      data = res.read()
      text = data.decode("utf-8", errors="replace")

      if res.status < 200 or res.status >= 300:
         raise RuntimeError(f"请求失败：HTTP {res.status} {res.reason}，响应：{text}")

      return text
   finally:
      try:
         conn.close()
      except Exception:
         pass


def request_ai_search_text(
   keyword: str,
) -> str:
   raw_text = request_ai_search_raw(keyword=keyword)
   return parse_streaming_text(raw_text)


def request_ai_search_events(
   keyword: str,
) -> list[Dict[str, Any]]:
   raw_text = request_ai_search_raw(keyword=keyword)
   return parse_streaming_events(raw_text)


def main(argv: Optional[list] = None) -> int:
   parser = argparse.ArgumentParser(description="根据关键字调用检索接口并输出合并后的文本结果")
   parser.add_argument("-k", "--keyword", required=True, help="检索关键字")
   args = parser.parse_args(argv)

   print(request_ai_search_text(keyword=args.keyword))
   return 0


if __name__ == "__main__":
   raise SystemExit(main())