---
slug: llm-serving
title: "LLM Serving 관련"
authors: eunsung
tag: ML
toc_min_heading_level: 2
toc_max_heading_level: 3
description: "LLM 서빙에서 신경써야할 요소들은 무엇일까? 부하테스트를 진행하기 앞서 SLO를 정의하고, 부하테스트를 어떤 식으로 구성하는 게 적합할지, 그리고 부하테스트 후에 스케일링을 어떤 식으로 구성할지 고민해본다."
---

참고: [GKE autoscaling with llm inference](https://docs.cloud.google.com/kubernetes-engine/docs/best-practices/machine-learning/inference/autoscaling?hl=ko)

HPA, Keda, Knative 등의 Scaler를 사용해서 스케일링을 할 수 있다.
그렇다면, 언제 어느 시점에 레플리카를 늘려야 적당할까?

백엔드에서 기본 제공하는 metrics들을 활용할 수 있다.



Scaler들의 동작 방식

vllm에서 큐로 받은 후, 배치로 처리함

이 큐로 대기 처리
continuous batching 로직 직접 살펴보자.


prefill에서 프롬프트 넣고(compute-bound; gpu),
decode에서 하나씩 kv cache 메모리에서 읽어오면서 처리(memory-bandwidth bound)


prefill 하나에 gpu가 다 쓰이면 안되니까, 이걸 prefill을 chunked로 나눔.
512토큰 같은 블록으로 쪼개서 
청크 하나 gpu 처리 -> decode -> 청크 하나 gpu 처리 -> decode 이런식으로 반
그렇다면 청크 나누는 기준은? 

kv-cache가 모자라면, 하나 내리는데, recompute 또는 swap(cpu 메모리에)

토큰 1개당 kv 캐시 크기
2 x L x H_kv x D_h x bytes(FP16/BF16=2, FP32=4, INT8=1)
kv 둘다
L: 레이어 수
H_kv: KV 헤드수 (GQA 쓰면 query 훨씬 더 적음)
D_h: head dimension(보통 128)