---
slug: llm-routing
title: "LLM Routing 관련"
authors: eunsung
tag: ML
toc_min_heading_level: 2
toc_max_heading_level: 3
description: "LLM 라우팅에서 신경써야할 요소들은 무엇일까?"
---

- [ ] prefix-cache 블락으로 계산하는 로직. go 코드 더 봐야할듯
- [ ] vllm 리포


LLM 서빙을 담당하고 있다.
Kserve의 LLMIsvc 리소스를 배포하면, InferencePool과 EndPointPicker가 함께 생성되는데 이것들이 LLM 인스턴스들의 라우팅을 담당한다. 여기서 라우팅이라 함은 하나의 LLM모델 인스턴스의 레플리카들에 대한 라우팅이다.
LLM 모델 추론에 대한 라우팅이 기존 부하분산 처리와 다른 점은 연산할 때 부하뿐만 아니라 효율적으로 처리하기 위해서 kv-cache, prefix cache 등 추가적으로 고려해야할 점들이 있다는 점이다. 


`EndpointPicker`, 단어 그대로 추론 엔드포인트를 고르는 이 리소스는 `Filter -> Scorer -> Picker` 방식으로 엔드포인트를 선택한다. `Filter`는 1차적으로 엔드포인트 후보를 선택하는 역할, `Scorer`는 후보군 중 보낼만한 후보 점수를 매기는 역할, 그리고 `Picker`는 최종 엔드포인트 후보를 선택하는 역할이다. 오늘 우리가 자세히 알아볼 부분은 `Scorer`이다. 어떤 Scorer들이 있는지와 어떻게 사용해야 적절하게 LLM 추론 라우팅에 적합할지 알아볼 것이다.

Scorer
먼저 `llm-d`, kserve의 모체가 되는 이 프로젝트에 적혀있는 Scorer들을 전부 알아보자.

#### Scorer 테이블

| Scorer                         | 보는 것                             | 목적                             |
| ------------------------------ | -------------------------------- | ------------------------------ |
| `prefix-cache-scorer`          | 요청 prefix와 endpoint의 cache match | prefix KV-cache 재사용            |
| `kv-cache-utilization-scorer`  | KV cache 사용률                     | KV cache가 덜 차 있는 endpoint 선호   |
| `queue-depth-scorer`           | request queue 길이                 | queue가 짧은 endpoint 선호          |
| `running-requests-size-scorer` | 현재 처리 중인 request 수               | active request가 적은 endpoint 선호 |
| `token-load-scorer`            | 처리 중인 input/output token load    | 실제 token 부하 기준 분산              |
| `latency-scorer`               | 예상 latency와 SLO 간 headroom       | latency/SLO 고려                 |
| `session-affinity-scorer`      | 이전 session의 endpoint             | 같은 session을 기존 endpoint로       |
| `lora-affinity-scorer`         | LoRA adapter 상태                  | adapter가 이미 로드된 endpoint 선호    |
| `no-hit-lru-scorer`            | cache hit가 없는 요청의 endpoint 사용 이력 | cold prefill 부하 분산             |


전부 사용하기보다는 중요한 scorer들 몇 개만 살펴보자. 어떤 식으로 동작하는지만 알고 있다면, 충분히 학습하고 활용할 수 있을 것 같다.
기본 구조는 DataProducer라는 클래스가 라우팅을 위해 필요한 정보들을 수집하는 방식이다.

- prefix-cache-scorer
원리/동작방식
prefix cache는 어떻게 파악하는걸까? 
prefix 계산로직은 Approximate방식과 Precise방식이 있다.
Precise 방식은 블락의 앞 데이터부터 하나라도 틀릴 경우 틀렸다고 체크한다.
Approximate방식은 블락을 기준으로 같은 정도에 따라 점수를 매긴다.


- kv-cache-utilization-scorer
원리/동작방식
해당 파드의 kv-cache가 얼마나 쌓였는지 파악하고, 가장 적게 쌓인 파드에 점수를 높게 준다.
이것도 마찬가지로 DataProducer를 통해 값이 매겨진다. vllm의 kvcacheManager에서 블락 단위로 관리되는 kv-cache가 얼마나 채워져있는지 파악한다.


session-affinity-scorer
원리/동작방식
세션 정보를 식별해 해당 요청을 처리했었던 파드에 점수를 주고, 나머지 파드들은 0으로 처리한다.
이걸 통해 sticky routing이 가능하다.

session id를 식별하는데는 2가지 방법이 있다. 첫번째는 응답하는 추론 파드에서 header로 session_id를 넘겨주는 encoded endpoint 방식과 session id를 미리 엔드포인트와 바인딩해서 처리하는 방법이 있다.

1. encoded endpoint header 방식은 첫번째 요청 응답에 server가 x-session-token을 넘겨주면, client가 이 토큰을 그 다음 요청부터 넘기는 식으로 식별한다.
코드로는

```
class Client:
    ...
    if self.session_token:
        headers["x-session-token"] = self.session_token
    
    response = self.session.post(..., headers=headers)

    new_token = response.headers.get("x-access-token")
    if new_token:
        self.session_token = new_token

```

2. session_id가 들어올 때 EPP에 있는 프로세스 메모리가 binding을 동적으로 기록하고 처리하는 방식이다. 이 binding에는 TTL을 설정해놓고, 일정 시간이 지나면 삭제되도록 할 수 있다.



